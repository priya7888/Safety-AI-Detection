"""
Hyperlocal Emergency Response Platform — Database Models
---------------------------------------------------------
Stores Emergency Incidents, Verified Responders, Assignments, and Immutable Audit Events.
"""

from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base


class EmergencyIncident(Base):
    """Stores incoming emergency reports submitted by citizens, workers, or sensors."""
    __tablename__ = "emergency_incidents"

    id = Column(Integer, primary_key=True, index=True)
    incident_number = Column(String(50), unique=True, index=True, nullable=False) # e.g. INC-2026-104
    
    # Emergency Details
    emergency_type = Column(String(50), index=True, nullable=False) # ROAD_ACCIDENT, MEDICAL, FIRE, HAZMAT, POLICE_SECURITY, OTHER
    category_label = Column(String(100), nullable=False) # e.g. "Road Traffic Collision with Trauma"
    description = Column(Text, nullable=False)
    photo_url = Column(String(500), nullable=True)
    
    # Hyperlocal Geolocation
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    address = Column(String(255), nullable=False)
    landmark = Column(String(255), nullable=True)
    location_precision = Column(String(50), default="GPS_HIGH_ACCURACY") # GPS_HIGH_ACCURACY, MANUAL_PIN_ADJUSTED, LANDMARK_APPROX
    
    # AI Diagnostics & Triage
    severity = Column(String(20), default="MODERATE") # CRITICAL, HIGH, MODERATE, LOW
    ai_confidence = Column(Float, default=85.0)
    urgency_score = Column(Integer, default=70) # 0 to 100
    evidence_explanation = Column(Text, nullable=True)
    uncertainty_interval = Column(String(50), default="[0.82, 0.88]") # Dempster-Shafer Bel/Pl
    extracted_hazards = Column(Text, nullable=True) # JSON list of extracted hazard roles
    
    # Duplicate & Correlation Tracking
    duplicate_of_id = Column(Integer, ForeignKey("emergency_incidents.id"), nullable=True)
    is_duplicate_cluster_primary = Column(Boolean, default=False)
    supporting_reports_count = Column(Integer, default=1)
    
    # Lifecycle Status
    status = Column(String(50), default="REPORTED", index=True) 
    # REPORTED -> UNDER_REVIEW -> ASSIGNED -> EN_ROUTE -> ON_SCENE -> RESOLVED -> CANCELLED
    
    # Reporter Contact (Masked for privacy)
    reporter_name = Column(String(100), nullable=True)
    reporter_phone = Column(String(50), nullable=True)
    is_simulated = Column(Boolean, default=True) # Clearly marks prototype simulation data
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    assignments = relationship("IncidentAssignment", back_populates="incident", cascade="all, delete-orphan")
    audit_events = relationship("IncidentAuditEvent", back_populates="incident", cascade="all, delete-orphan")


class EmergencyResponderService(Base):
    """Verified emergency response services directory (Ambulances, Fire Stations, Police, Hazmat)."""
    __tablename__ = "emergency_responder_services"

    id = Column(Integer, primary_key=True, index=True)
    service_code = Column(String(50), unique=True, index=True) # e.g. AMB-ALS-01, FIRE-STN-4
    name = Column(String(150), nullable=False) # e.g. "Apollo Emergency Ambulance (Advanced Life Support)"
    service_type = Column(String(50), index=True, nullable=False) # AMBULANCE, FIRE_TENDER, POLICE_PATROL, HAZMAT_SQUAD
    
    # Capability & Equipment Level
    capability_level = Column(String(100), nullable=False) # ADVANCED_LIFE_SUPPORT, BASIC_LIFE_SUPPORT, HEAVY_FOAM_DELUGE, HAZMAT_CORROSIVE_CONTAINMENT, TRAUMA_CARE
    capability_description = Column(Text, nullable=True)
    
    # Base Geolocation
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    base_station_name = Column(String(150), nullable=False)
    contact_number = Column(String(50), nullable=False)
    
    # Operational Status
    availability_status = Column(String(50), default="AVAILABLE") # AVAILABLE, EN_ROUTE, ON_SCENE, OFFLINE
    coverage_radius_km = Column(Float, default=15.0)
    current_assigned_incident_id = Column(Integer, nullable=True)
    last_verified_at = Column(DateTime, default=datetime.utcnow)
    
    assignments = relationship("IncidentAssignment", back_populates="responder")


class IncidentAssignment(Base):
    """Tracks dispatch assignment, responder acknowledgement, and escalation status."""
    __tablename__ = "incident_assignments"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("emergency_incidents.id"), nullable=False)
    responder_id = Column(Integer, ForeignKey("emergency_responder_services.id"), nullable=False)
    
    # Acknowledgement Lifecycle
    status = Column(String(50), default="PENDING_ACK") # PENDING_ACK, ACKNOWLEDGED, REJECTED, EN_ROUTE, ON_SCENE, COMPLETED, ESCALATED_TIMEOUT
    assigned_at = Column(DateTime, default=datetime.utcnow)
    acknowledged_at = Column(DateTime, nullable=True)
    rejected_at = Column(DateTime, nullable=True)
    rejection_reason = Column(String(255), nullable=True)
    
    # Timings & SLA
    ack_deadline_seconds = Column(Integer, default=180) # 3 minutes SLA
    estimated_arrival_mins = Column(Integer, default=8)
    is_escalated = Column(Boolean, default=False)
    escalation_reason = Column(String(255), nullable=True)

    incident = relationship("EmergencyIncident", back_populates="assignments")
    responder = relationship("EmergencyResponderService", back_populates="assignments")


class IncidentAuditEvent(Base):
    """Immutable chronological audit trail of all emergency actions and status transitions."""
    __tablename__ = "incident_audit_events"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("emergency_incidents.id"), nullable=False)
    actor_role = Column(String(50), nullable=False) # CITIZEN, DISPATCHER, RESPONDER, SYSTEM_AI, ADMIN
    actor_name = Column(String(100), default="System")
    action_type = Column(String(100), nullable=False) # REPORT_CREATED, AI_TRIAGED, RESPONDER_ASSIGNED, RESPONDER_ACKNOWLEDGED, STATUS_UPDATED, ESCALATED, RESOLVED
    
    previous_status = Column(String(50), nullable=True)
    new_status = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    incident = relationship("EmergencyIncident", back_populates="audit_events")
