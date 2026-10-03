"""
Hyperlocal Emergency Response Router
------------------------------------
Provides REST API endpoints for:
1. Citizen emergency reporting with GPS
2. Active incident listing & duplicate cluster tracking
3. Ranked nearby responder discovery
4. Dispatch assignment with 3-minute SLA deadline
5. Field responder acknowledgement & lifecycle updates
6. Immutable audit log retrieval & directory management
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

from ..database import get_db
from ..models.emergency_incident import (
    EmergencyIncident,
    EmergencyResponderService,
    IncidentAssignment,
    IncidentAuditEvent,
)
from ..services.emergency_service import (
    create_emergency_incident,
    rank_nearby_responders,
    assign_responder,
    update_incident_status,
    seed_default_responders_if_empty,
)

router = APIRouter(prefix="/api/emergency", tags=["Hyperlocal Emergency Response"])


# ==========================================
# Pydantic Schemas
# ==========================================

class EmergencyReportRequest(BaseModel):
    emergency_type: str = Field(..., description="ROAD_ACCIDENT, MEDICAL, FIRE, HAZMAT, POLICE_SECURITY, OTHER")
    category_label: str = Field(..., description="e.g. Road Traffic Collision with Severe Trauma")
    description: str = Field(..., description="Details of the emergency situation")
    latitude: float = Field(..., description="Latitude coordinate")
    longitude: float = Field(..., description="Longitude coordinate")
    address: str = Field(..., description="Street address or location description")
    landmark: Optional[str] = None
    photo_url: Optional[str] = None
    reporter_name: Optional[str] = "Citizen Reporter"
    reporter_phone: Optional[str] = "Not Provided"


class DispatchAssignmentRequest(BaseModel):
    incident_id: int
    responder_id: int
    dispatcher_notes: Optional[str] = None


class AcknowledgeAssignmentRequest(BaseModel):
    assignment_id: int
    accepted: bool
    rejection_reason: Optional[str] = None


class StatusUpdateRequest(BaseModel):
    incident_id: int
    new_status: str # REPORTED, UNDER_REVIEW, ASSIGNED, EN_ROUTE, ON_SCENE, RESOLVED, CANCELLED
    actor: Optional[str] = "FIELD_RESPONDER"
    notes: Optional[str] = None


# ==========================================
# Endpoints
# ==========================================

@router.post("/report")
def submit_emergency_report(
    payload: EmergencyReportRequest,
    db: Session = Depends(get_db)
):
    """
    Ingests an emergency report from a citizen or sensor, runs AI evidential triage,
    checks for duplicates within a 500m radius, and issues an incident tracking ticket.
    """
    try:
        incident = create_emergency_incident(
            db=db,
            emergency_type=payload.emergency_type,
            category_label=payload.category_label,
            description=payload.description,
            latitude=payload.latitude,
            longitude=payload.longitude,
            address=payload.address,
            landmark=payload.landmark,
            photo_url=payload.photo_url,
            reporter_name=payload.reporter_name,
            reporter_phone=payload.reporter_phone,
        )
        return {
            "success": True,
            "message": "Emergency incident registered successfully",
            "incident": {
                "id": incident.id,
                "incident_number": incident.incident_number,
                "status": incident.status,
                "severity": incident.severity,
                "ai_confidence": incident.ai_confidence,
                "urgency_score": incident.urgency_score,
                "evidence_explanation": incident.evidence_explanation,
                "uncertainty_interval": incident.uncertainty_interval,
                "is_duplicate": incident.duplicate_of_id is not None,
                "duplicate_of_id": incident.duplicate_of_id,
                "created_at": incident.created_at.isoformat() if incident.created_at else None,
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/incidents")
def list_incidents(
    status: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Returns a list of all emergency incidents, including duplicate cluster counts and AI triage data."""
    seed_default_responders_if_empty(db)
    query = db.query(EmergencyIncident).order_by(EmergencyIncident.created_at.desc())
    if status:
        query = query.filter(EmergencyIncident.status == status)
    
    incidents = query.limit(limit).all()
    
    result = []
    for inc in incidents:
        # Get active assignment info if available
        active_assignment = None
        for ass in inc.assignments:
            if ass.status != "REJECTED":
                active_assignment = {
                    "assignment_id": ass.id,
                    "responder_name": ass.responder.name if ass.responder else "Unknown",
                    "responder_code": ass.responder.service_code if ass.responder else "Unknown",
                    "status": ass.status,
                    "acknowledge_deadline": ass.acknowledge_deadline.isoformat() if ass.acknowledge_deadline else None,
                }
                break

        result.append({
            "id": inc.id,
            "incident_number": inc.incident_number,
            "emergency_type": inc.emergency_type,
            "category_label": inc.category_label,
            "description": inc.description,
            "latitude": inc.latitude,
            "longitude": inc.longitude,
            "address": inc.address,
            "landmark": inc.landmark,
            "severity": inc.severity,
            "ai_confidence": inc.ai_confidence,
            "urgency_score": inc.urgency_score,
            "evidence_explanation": inc.evidence_explanation,
            "uncertainty_interval": inc.uncertainty_interval,
            "status": inc.status,
            "supporting_reports_count": inc.supporting_reports_count,
            "is_duplicate_cluster_primary": inc.is_duplicate_cluster_primary,
            "duplicate_of_id": inc.duplicate_of_id,
            "active_assignment": active_assignment,
            "created_at": inc.created_at.isoformat() if inc.created_at else None,
        })
    return {"incidents": result, "total": len(result)}


@router.get("/incident/{incident_id}")
def get_incident_details(
    incident_id: int,
    db: Session = Depends(get_db)
):
    """Retrieves full details, assignments, and audit event logs for a specific emergency incident."""
    incident = db.query(EmergencyIncident).filter(EmergencyIncident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    audit_logs = [
        {
            "id": a.id,
            "action": a.action,
            "actor": a.actor,
            "notes": a.notes,
            "created_at": a.created_at.isoformat() if a.created_at else None,
        }
        for a in incident.audit_events
    ]

    assignments = [
        {
            "id": ass.id,
            "responder_id": ass.responder_id,
            "responder_name": ass.responder.name if ass.responder else "Unknown",
            "responder_type": ass.responder.service_type if ass.responder else "Unknown",
            "responder_contact": ass.responder.contact_number if ass.responder else "",
            "status": ass.status,
            "dispatched_at": ass.dispatched_at.isoformat() if ass.dispatched_at else None,
            "acknowledged_at": ass.acknowledged_at.isoformat() if ass.acknowledged_at else None,
            "acknowledge_deadline": ass.acknowledge_deadline.isoformat() if ass.acknowledge_deadline else None,
            "dispatch_notes": ass.dispatch_notes,
        }
        for ass in incident.assignments
    ]

    return {
        "incident": {
            "id": incident.id,
            "incident_number": incident.incident_number,
            "emergency_type": incident.emergency_type,
            "category_label": incident.category_label,
            "description": incident.description,
            "latitude": incident.latitude,
            "longitude": incident.longitude,
            "address": incident.address,
            "landmark": incident.landmark,
            "severity": incident.severity,
            "ai_confidence": incident.ai_confidence,
            "urgency_score": incident.urgency_score,
            "evidence_explanation": incident.evidence_explanation,
            "uncertainty_interval": incident.uncertainty_interval,
            "status": incident.status,
            "supporting_reports_count": incident.supporting_reports_count,
            "reporter_name": incident.reporter_name,
            "reporter_phone": incident.reporter_phone,
            "created_at": incident.created_at.isoformat() if incident.created_at else None,
        },
        "assignments": assignments,
        "audit_logs": audit_logs,
    }


@router.get("/nearby-responders")
def get_nearby_responders(
    incident_id: int,
    db: Session = Depends(get_db)
):
    """
    Ranks all verified emergency responders based on distance, equipment capability match,
    and availability for the given incident.
    """
    ranked = rank_nearby_responders(db, incident_id)
    return {"incident_id": incident_id, "ranked_responders": ranked}


@router.post("/assign")
def dispatch_unit(
    payload: DispatchAssignmentRequest,
    db: Session = Depends(get_db)
):
    """Assigns an emergency unit with a 3-minute acknowledgement deadline."""
    try:
        assignment = assign_responder(
            db=db,
            incident_id=payload.incident_id,
            responder_id=payload.responder_id,
            dispatcher_notes=payload.dispatcher_notes
        )
        return {
            "success": True,
            "message": "Unit dispatched successfully",
            "assignment_id": assignment.id,
            "status": assignment.status,
            "acknowledge_deadline": assignment.acknowledge_deadline.isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/acknowledge")
def acknowledge_assignment(
    payload: AcknowledgeAssignmentRequest,
    db: Session = Depends(get_db)
):
    """Responder accepts or rejects the assignment."""
    assignment = db.query(IncidentAssignment).filter(IncidentAssignment.id == payload.assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    incident = assignment.incident
    responder = assignment.responder

    if payload.accepted:
        assignment.status = "ACKNOWLEDGED"
        assignment.acknowledged_at = datetime.utcnow()
        if incident:
            incident.status = "EN_ROUTE"
        if responder:
            responder.availability_status = "EN_ROUTE"
        
        # Log Audit
        audit = IncidentAuditEvent(
            incident_id=incident.id if incident else None,
            action="ASSIGNMENT_ACKNOWLEDGED",
            actor="FIELD_RESPONDER",
            notes=f"Unit {responder.service_code if responder else 'Unknown'} accepted dispatch. En route."
        )
        db.add(audit)
    else:
        assignment.status = "REJECTED"
        assignment.rejection_reason = payload.rejection_reason or "Unit unavailable or mechanical issue"
        if responder:
            responder.availability_status = "AVAILABLE"
            responder.current_assigned_incident_id = None
        if incident:
            incident.status = "UNDER_REVIEW" # Needs redispatch
        
        audit = IncidentAuditEvent(
            incident_id=incident.id if incident else None,
            action="ASSIGNMENT_REJECTED",
            actor="FIELD_RESPONDER",
            notes=f"Unit rejected dispatch. Reason: {assignment.rejection_reason}. Placed back under review."
        )
        db.add(audit)

    db.commit()
    return {"success": True, "assignment_status": assignment.status}


@router.post("/status")
def update_status(
    payload: StatusUpdateRequest,
    db: Session = Depends(get_db)
):
    """Updates the lifecycle status of an emergency incident (EN_ROUTE -> ON_SCENE -> RESOLVED)."""
    try:
        incident = update_incident_status(
            db=db,
            incident_id=payload.incident_id,
            new_status=payload.new_status,
            actor=payload.actor or "FIELD_RESPONDER",
            notes=payload.notes
        )
        return {
            "success": True,
            "incident_id": incident.id,
            "new_status": incident.status,
            "message": f"Status updated to {incident.status}"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/responders")
def get_all_responders(
    db: Session = Depends(get_db)
):
    """Returns list of all verified responder services in the directory."""
    seed_default_responders_if_empty(db)
    responders = db.query(EmergencyResponderService).all()
    return {
        "responders": [
            {
                "id": r.id,
                "service_code": r.service_code,
                "name": r.name,
                "service_type": r.service_type,
                "capability_level": r.capability_level,
                "capability_description": r.capability_description,
                "latitude": r.latitude,
                "longitude": r.longitude,
                "base_station_name": r.base_station_name,
                "contact_number": r.contact_number,
                "availability_status": r.availability_status,
                "coverage_radius_km": r.coverage_radius_km,
            }
            for r in responders
        ]
    }
