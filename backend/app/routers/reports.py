"""
Report-related endpoints:

  POST /api/reports/analyze   - analyze and store a single report
  GET  /api/reports           - list reports (with search/filter/pagination)
  GET  /api/reports/{id}      - full detail for one report
  POST /api/reports/upload    - bulk CSV upload
"""
import io
from typing import Optional, List

import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_

from app.database import get_db
from app.models.safety_report import SafetyReport
from app.schemas.report import ReportCreate, ReportResponse, ReportListItem, UploadSummary
from app.services.report_processing_service import process_and_store_report, get_report_rule_names

router = APIRouter(prefix="/api/reports", tags=["reports"])

REQUIRED_CSV_COLUMNS = {"report_text", "report_type"}
OPTIONAL_CSV_COLUMNS = ["site", "location", "activity"]


def _to_response(report: SafetyReport) -> ReportResponse:
    return ReportResponse(
        id=report.id,
        report_text=report.report_text,
        report_type=report.report_type,
        site=report.site,
        location=report.extracted_location or report.location,
        activity=report.activity,
        barrier_failure=report.barrier_failure,
        sif_potential=report.sif_potential,
        confidence_score=report.confidence_score,
        explanation=report.explanation,
        life_saving_rules=get_report_rule_names(report),
        created_at=report.created_at,
    )


@router.post("/analyze", response_model=ReportResponse)
def analyze_report(payload: ReportCreate, db: Session = Depends(get_db)):
    valid_types = {"Unsafe Act", "Unsafe Condition", "Near Miss"}
    if payload.report_type not in valid_types:
        raise HTTPException(status_code=422, detail=f"report_type must be one of {sorted(valid_types)}")

    report = process_and_store_report(
        db,
        report_text=payload.report_text,
        report_type=payload.report_type,
        site=payload.site,
        location=payload.location,
        activity=payload.activity,
        report_date=payload.report_date,
    )
    db.commit()
    db.refresh(report)
    return _to_response(report)


@router.get("", response_model=List[ReportListItem])
def list_reports(
    db: Session = Depends(get_db),
    search: Optional[str] = Query(None, description="Search within report text"),
    sif_status: Optional[str] = Query(None, description="'yes' or 'no'"),
    report_type: Optional[str] = Query(None),
    site: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
):
    query = db.query(SafetyReport).options(joinedload(SafetyReport.rule_mappings))

    if search:
        like = f"%{search}%"
        query = query.filter(
            or_(SafetyReport.report_text.ilike(like), SafetyReport.activity.ilike(like))
        )
    if sif_status:
        if sif_status.lower() == "yes":
            query = query.filter(SafetyReport.sif_potential.is_(True))
        elif sif_status.lower() == "no":
            query = query.filter(SafetyReport.sif_potential.is_(False))
    if report_type:
        query = query.filter(SafetyReport.report_type == report_type)
    if site:
        query = query.filter(SafetyReport.site == site)

    reports = (
        query.order_by(SafetyReport.created_at.desc()).offset(skip).limit(limit).all()
    )

    return [
        ReportListItem(
            id=r.id,
            report_text=r.report_text,
            report_type=r.report_type,
            site=r.site,
            activity=r.activity,
            sif_potential=r.sif_potential,
            confidence_score=r.confidence_score,
            life_saving_rules=get_report_rule_names(r),
            created_at=r.created_at,
        )
        for r in reports
    ]


@router.get("/{report_id}", response_model=ReportResponse)
def get_report(report_id: int, db: Session = Depends(get_db)):
    report = (
        db.query(SafetyReport)
        .options(joinedload(SafetyReport.rule_mappings))
        .filter(SafetyReport.id == report_id)
        .first()
    )
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return _to_response(report)


@router.post("/upload", response_model=UploadSummary)
async def upload_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=422, detail="Only .csv files are supported")

    raw = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(raw))
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Could not parse CSV: {exc}")

    missing = REQUIRED_CSV_COLUMNS - set(df.columns)
    if missing:
        raise HTTPException(
            status_code=422,
            detail=f"CSV is missing required column(s): {', '.join(sorted(missing))}",
        )

    total_processed = 0
    sif_count = 0
    non_sif_count = 0
    failed_rows = 0
    errors: List[str] = []
    created_reports: List[SafetyReport] = []

    valid_types = {"Unsafe Act", "Unsafe Condition", "Near Miss"}

    for idx, row in df.iterrows():
        try:
            report_text = str(row.get("report_text", "")).strip()
            report_type = str(row.get("report_type", "")).strip()
            if not report_text or report_text.lower() == "nan":
                raise ValueError("report_text is empty")
            if report_type not in valid_types:
                raise ValueError(f"invalid report_type '{report_type}'")

            def _clean(val):
                if pd.isna(val):
                    return None
                val = str(val).strip()
                return val or None

            report = process_and_store_report(
                db,
                report_text=report_text,
                report_type=report_type,
                site=_clean(row.get("site")),
                location=_clean(row.get("location")),
                activity=_clean(row.get("activity")),
            )
            created_reports.append(report)
            total_processed += 1
            if report.sif_potential:
                sif_count += 1
            else:
                non_sif_count += 1
        except Exception as exc:  # keep processing remaining rows
            failed_rows += 1
            errors.append(f"Row {idx + 2}: {exc}")  # +2 accounts for header + 0-index

    db.commit()
    for r in created_reports:
        db.refresh(r)

    return UploadSummary(
        total_processed=total_processed,
        sif_potential_count=sif_count,
        non_sif_count=non_sif_count,
        failed_rows=failed_rows,
        errors=errors[:20],  # cap error list for a clean response
        reports=[_to_response(r) for r in created_reports],
    )
