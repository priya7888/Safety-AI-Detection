"""
Hyperlocal Emergency Response Service
--------------------------------------
Implements:
1. Spatial Geofencing & Haversine Distance
2. Multi-Report Duplicate Detection & Incident Clustering (500m radius)
3. AI-Driven Severity Classification & Capability-Aware Responder Matching
4. SLA Tracking & Immutable Audit Event Logging
5. Directory Seeding for Demonstration (Ambulances, Fire Tenders, Police, Hazmat)
"""

import math
import json
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc

from ..models.emergency_incident import (
    EmergencyIncident,
    EmergencyResponderService,
    IncidentAssignment,
    IncidentAuditEvent,
)
from ..ai_services.sif_ml_inference import predict_sif_potential
from ..ai_services.signal_correlation import detect_latent_weak_signals_in_text
from ..ai_services.sif_assessment import compute_dempster_shafer_fusion


def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates spherical distance between two coordinates in kilometers using Haversine formula."""
    R = 6371.0 # Earth radius in km
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (math.sin(d_lat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(d_lon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)


def seed_default_responders_if_empty(db: Session):
    """Pre-populates verified emergency responders around the pilot area (MRDU Campus / Hyderabad)."""
    count = db.query(EmergencyResponderService).count()
    if count > 0:
        return

    # Pilot Center: Maisammaguda / MRDU Campus (17.5449, 78.4328)
    initial_responders = [
        {
            "service_code": "AMB-ALS-01",
            "name": "Malla Reddy Narayana Multi-Speciality Ambulance (ALS)",
            "service_type": "AMBULANCE",
            "capability_level": "ADVANCED_LIFE_SUPPORT",
            "capability_description": "Equipped with ventilator, defibrillator, trauma resuscitation kit, and paramedic.",
            "latitude": 17.5412,
            "longitude": 78.4350,
            "base_station_name": "Malla Reddy Hospital Emergency Wing, Suraram",
            "contact_number": "+91-98480-11221",
            "availability_status": "AVAILABLE",
            "coverage_radius_km": 15.0,
        },
        {
            "service_code": "AMB-BLS-02",
            "name": "Maisammaguda 108 Rapid Response Ambulance (BLS)",
            "service_type": "AMBULANCE",
            "capability_level": "BASIC_LIFE_SUPPORT",
            "capability_description": "Rapid response basic trauma support, oxygen cylinder, stretcher, first aid triage.",
            "latitude": 17.5470,
            "longitude": 78.4300,
            "base_station_name": "Maisammaguda Junction Stand",
            "contact_number": "+91-98480-11222",
            "availability_status": "AVAILABLE",
            "coverage_radius_km": 10.0,
        },
        {
            "service_code": "FIRE-FOAM-01",
            "name": "Jeedimetla Industrial Area Fire Station Tender 1",
            "service_type": "FIRE_TENDER",
            "capability_level": "HEAVY_FOAM_DELUGE",
            "capability_description": "High-expansion chemical foam deluge, 5000L water tank, hydraulic rescue cutting jaws.",
            "latitude": 17.5180,
            "longitude": 78.4480,
            "base_station_name": "Jeedimetla Fire Station",
            "contact_number": "+91-98480-11223",
            "availability_status": "AVAILABLE",
            "coverage_radius_km": 20.0,
        },
        {
            "service_code": "HAZMAT-SQD-01",
            "name": "Telangana State Disaster Response Force (SDRF Hazmat Team)",
            "service_type": "HAZMAT_SQUAD",
            "capability_level": "HAZMAT_CORROSIVE_CONTAINMENT",
            "capability_description": "Level A encapsulating suits, chemical neutralizers, multi-gas PID detectors, vapor scrubbers.",
            "latitude": 17.5020,
            "longitude": 78.4110,
            "base_station_name": "SDRF Regional Hub, Quthbullapur",
            "contact_number": "+91-98480-11224",
            "availability_status": "AVAILABLE",
            "coverage_radius_km": 30.0,
        },
        {
            "service_code": "POL-PATROL-04",
            "name": "Dundigal Police Station Emergency Patrol Unit 4",
            "service_type": "POLICE_PATROL",
            "capability_level": "TRAFFIC_CORDON_AND_LAW_ENFORCEMENT",
            "capability_description": "Traffic cordon, crowd dispersion, quick perimeter isolation, accident clearance.",
            "latitude": 17.5550,
            "longitude": 78.4200,
            "base_station_name": "Dundigal Police Station",
            "contact_number": "+91-98480-11225",
            "availability_status": "AVAILABLE",
            "coverage_radius_km": 15.0,
        },
    ]

    for resp in initial_responders:
        service_obj = EmergencyResponderService(**resp)
        db.add(service_obj)
    db.commit()


def detect_duplicate_incident(
    db: Session,
    latitude: float,
    longitude: float,
    emergency_type: str,
    max_radius_km: float = 0.5, # 500 meters
    max_lookback_hours: int = 4
) -> Optional[EmergencyIncident]:
    """
    Finds active primary incidents within 500m reported in the last 4 hours
    to prevent duplicate dispatching.
    """
    cutoff = datetime.utcnow() - timedelta(hours=max_lookback_hours)
    
    active_incidents = (
        db.query(EmergencyIncident)
        .filter(
            EmergencyIncident.created_at >= cutoff,
            EmergencyIncident.status.in_(["REPORTED", "UNDER_REVIEW", "ASSIGNED", "EN_ROUTE", "ON_SCENE"]),
            EmergencyIncident.duplicate_of_id.is_(None)
        )
        .all()
    )

    for inc in active_incidents:
        dist = haversine_distance_km(latitude, longitude, inc.latitude, inc.longitude)
        if dist <= max_radius_km:
            return inc

    return None


def create_emergency_incident(
    db: Session,
    emergency_type: str,
    category_label: str,
    description: str,
    latitude: float,
    longitude: float,
    address: str,
    landmark: Optional[str] = None,
    photo_url: Optional[str] = None,
    reporter_name: Optional[str] = None,
    reporter_phone: Optional[str] = None,
) -> EmergencyIncident:
    """Processes, analyzes with AI, dedupes, and records a new emergency report."""
    seed_default_responders_if_empty(db)

    # 1. Generate unique human-readable ticket ID
    seq = (db.query(EmergencyIncident).count() + 1)
    incident_number = f"INC-2026-{seq:03d}"

    # 2. Run AI Severity & Hazard Analysis
    # Multi-pattern hazard extraction
    extracted_hazards_list = detect_latent_weak_signals_in_text(description)
    extracted_hazards = [h.get("category") for h in extracted_hazards_list]

    # ML Inference for classification
    ml_result = predict_sif_potential(description)
    is_sif_ml = ml_result.get("predicted_class") == "SIF-potential"
    ml_prob = ml_result.get("confidence") or 0.80

    # Dempster-Shafer Evidential Triage
    dst_result = compute_dempster_shafer_fusion(
        p_rule=0.85 if len(extracted_hazards) > 0 else 0.40,
        p_ml=ml_prob if is_sif_ml else 0.30,
        p_maut=0.90 if ("trauma" in description.lower() or "explosion" in description.lower() or "fire" in description.lower()) else 0.50
    )
    bel_sif = dst_result.get("belief_sif", 0.82)
    pl_sif = dst_result.get("plausibility_sif", 0.94)
    uncertainty_str = dst_result.get("uncertainty_interval", f"[{bel_sif:.2f}, {pl_sif:.2f}]")

    # Determine Severity
    if is_sif_ml or bel_sif > 0.60 or "trauma" in description.lower() or "explosion" in description.lower() or "critical" in description.lower() or "severe" in description.lower():
        severity = "CRITICAL"
        urgency = 95
        explanation = f"AI classified as CRITICAL (Urgency 95/100). Evidential belief: {bel_sif*100:.1f}%. High risk to human life."
    elif bel_sif > 0.35 or "fire" in description.lower() or "leak" in description.lower():
        severity = "HIGH"
        urgency = 80
        explanation = f"AI classified as HIGH (Urgency 80/100). Plausibility: {pl_sif*100:.1f}%. Rapid containment required."
    else:
        severity = "MODERATE"
        urgency = 60
        explanation = "AI classified as MODERATE. Localized impact with low structural escalation risk."

    # 3. Duplicate Detection
    duplicate_parent = detect_duplicate_incident(db, latitude, longitude, emergency_type)
    duplicate_of_id = None
    if duplicate_parent:
        duplicate_of_id = duplicate_parent.id
        duplicate_parent.supporting_reports_count += 1
        duplicate_parent.is_duplicate_cluster_primary = True
        # Log duplicate merge audit event
        audit_dup = IncidentAuditEvent(
            incident_id=duplicate_parent.id,
            action="DUPLICATE_MERGE",
            actor="AI_DEDUPLICATION_ENGINE",
            notes=f"New report {incident_number} merged into cluster. Total reports: {duplicate_parent.supporting_reports_count}."
        )
        db.add(audit_dup)

    # 4. Create Incident Record
    incident = EmergencyIncident(
        incident_number=incident_number,
        emergency_type=emergency_type,
        category_label=category_label,
        description=description,
        photo_url=photo_url,
        latitude=latitude,
        longitude=longitude,
        address=address,
        landmark=landmark,
        severity=severity,
        ai_confidence=round(ml_prob * 100, 1),
        urgency_score=urgency,
        evidence_explanation=explanation,
        uncertainty_interval=uncertainty_str,
        extracted_hazards=json.dumps(extracted_hazards),
        duplicate_of_id=duplicate_of_id,
        status="REPORTED",
        reporter_name=reporter_name or "Citizen Reporter",
        reporter_phone=reporter_phone or "Not Provided",
        is_simulated=True,
    )
    db.add(incident)
    db.commit()
    db.refresh(incident)

    # 5. Log Initial Audit Event
    audit_init = IncidentAuditEvent(
        incident_id=incident.id,
        action="REPORT_CREATED",
        actor="CITIZEN_SOS_PORTAL",
        notes=f"Incident registered via Hyperlocal GPS ({latitude:.4f}, {longitude:.4f}). Initial AI severity: {severity}."
    )
    db.add(audit_init)
    db.commit()

    return incident


def rank_nearby_responders(
    db: Session,
    incident_id: int
) -> List[Dict[str, Any]]:
    """
    Ranks available emergency responders based on:
    1. Distance (km) from incident coordinates
    2. Capability Match for the incident emergency type
    3. Availability Status
    """
    seed_default_responders_if_empty(db)
    incident = db.query(EmergencyIncident).filter(EmergencyIncident.id == incident_id).first()
    if not incident:
        return []

    responders = db.query(EmergencyResponderService).all()
    ranked_list = []

    type_pref = {
        "ROAD_ACCIDENT": ["ADVANCED_LIFE_SUPPORT", "BASIC_LIFE_SUPPORT", "TRAFFIC_CORDON_AND_LAW_ENFORCEMENT"],
        "MEDICAL": ["ADVANCED_LIFE_SUPPORT", "BASIC_LIFE_SUPPORT"],
        "FIRE": ["HEAVY_FOAM_DELUGE", "HAZMAT_CORROSIVE_CONTAINMENT", "ADVANCED_LIFE_SUPPORT"],
        "HAZMAT": ["HAZMAT_CORROSIVE_CONTAINMENT", "HEAVY_FOAM_DELUGE", "ADVANCED_LIFE_SUPPORT"],
        "POLICE_SECURITY": ["TRAFFIC_CORDON_AND_LAW_ENFORCEMENT"],
    }
    preferred_caps = type_pref.get(incident.emergency_type, [])

    for r in responders:
        dist = haversine_distance_km(incident.latitude, incident.longitude, r.latitude, r.longitude)
        
        # Capability Match Score (0 to 40 pts)
        cap_score = 10
        if r.capability_level in preferred_caps:
            idx = preferred_caps.index(r.capability_level)
            cap_score = 40 - (idx * 10)
        
        # Distance Score (0 to 40 pts, closer is better)
        dist_score = max(0, 40 - (dist * 2.5))
        
        # Availability Score (0 to 20 pts)
        avail_score = 20 if r.availability_status == "AVAILABLE" else (5 if r.availability_status == "EN_ROUTE" else 0)

        total_match_score = round(cap_score + dist_score + avail_score, 1)
        eta_minutes = max(2, int((dist / 40.0) * 60) + 2)

        ranked_list.append({
            "id": r.id,
            "service_code": r.service_code,
            "name": r.name,
            "service_type": r.service_type,
            "capability_level": r.capability_level,
            "capability_description": r.capability_description,
            "distance_km": dist,
            "eta_minutes": eta_minutes,
            "availability_status": r.availability_status,
            "match_score": total_match_score,
            "contact_number": r.contact_number,
            "base_station_name": r.base_station_name,
            "is_recommended": False,
        })

    ranked_list.sort(key=lambda x: x["match_score"], reverse=True)
    if ranked_list:
        ranked_list[0]["is_recommended"] = True

    return ranked_list


def assign_responder(
    db: Session,
    incident_id: int,
    responder_id: int,
    dispatcher_notes: Optional[str] = None
) -> IncidentAssignment:
    """Dispatches a responder to an incident with a 3-minute acknowledgement timer."""
    incident = db.query(EmergencyIncident).filter(EmergencyIncident.id == incident_id).first()
    responder = db.query(EmergencyResponderService).filter(EmergencyResponderService.id == responder_id).first()
    
    if not incident or not responder:
        raise ValueError("Incident or Responder not found")

    incident.status = "ASSIGNED"
    responder.availability_status = "ASSIGNED"
    responder.current_assigned_incident_id = incident.id

    deadline = datetime.utcnow() + timedelta(minutes=3)
    assignment = IncidentAssignment(
        incident_id=incident.id,
        responder_id=responder.id,
        status="PENDING_ACK",
        acknowledge_deadline=deadline,
        dispatch_notes=dispatcher_notes or f"Dispatched unit {responder.service_code} for {incident.category_label}",
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)

    audit = IncidentAuditEvent(
        incident_id=incident.id,
        action="RESPONDER_DISPATCHED",
        actor="CONTROL_ROOM_DISPATCHER",
        notes=f"Assigned unit {responder.name} ({responder.service_code}). SLA Ack Deadline: 3 minutes."
    )
    db.add(audit)
    db.commit()

    return assignment


def update_incident_status(
    db: Session,
    incident_id: int,
    new_status: str,
    actor: str = "FIELD_RESPONDER",
    notes: Optional[str] = None
) -> EmergencyIncident:
    """Updates incident lifecycle state (REPORTED -> ASSIGNED -> EN_ROUTE -> ON_SCENE -> RESOLVED)."""
    incident = db.query(EmergencyIncident).filter(EmergencyIncident.id == incident_id).first()
    if not incident:
        raise ValueError("Incident not found")

    old_status = incident.status
    incident.status = new_status
    
    if new_status in ["RESOLVED", "CANCELLED"]:
        for assignment in incident.assignments:
            assignment.status = "COMPLETED"
            if assignment.responder:
                assignment.responder.availability_status = "AVAILABLE"
                assignment.responder.current_assigned_incident_id = None

    audit = IncidentAuditEvent(
        incident_id=incident.id,
        action=f"STATUS_TRANSITION_{new_status}",
        actor=actor,
        notes=notes or f"Status changed from {old_status} to {new_status}."
    )
    db.add(audit)
    db.commit()
    db.refresh(incident)

    return incident
