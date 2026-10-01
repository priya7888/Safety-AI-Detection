import jwt
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.organization import Organization
from ..models.user import User
import json
from typing import List, Optional
from ..schemas.auth import LoginRequest, TokenResponse, UserResponse, CreateUserRequest
from ..dependencies import get_current_user
from ..config import settings

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# Predefined 5 Organizations
PRESET_ORGS = [
    {"id": "id001", "name": "Oil India Limited – Operational Safety Unit"},
    {"id": "id002", "name": "Offshore Rig Operations & Drilling Division"},
    {"id": "id003", "name": "Refinery & Petrochemical Processing Center"},
    {"id": "id004", "name": "Exploration & Production Field Command"},
    {"id": "id005", "name": "Cross-Country Gas Transmission & Integrity"},
]

# Predefined Admin and Normal User accounts
PRESET_USERS = [
    # Administrator accounts (Full privileges, audit, lock, static data reset)
    {"org_id": "id001", "email": "admin1@gmail.com", "pass": "Admin1@123", "officer": "Chief HSE Administrator", "role": "ADMINISTRATOR"},
    {"org_id": "id002", "email": "admin2@gmail.com", "pass": "Admin2@123", "officer": "HSE Lead Officer 02", "role": "ADMINISTRATOR"},
    {"org_id": "id003", "email": "admin3@gmail.com", "pass": "Admin3@123", "officer": "HSE Lead Officer 03", "role": "ADMINISTRATOR"},
    {"org_id": "id004", "email": "admin4@gmail.com", "pass": "Admin4@123", "officer": "HSE Lead Officer 04", "role": "ADMINISTRATOR"},
    {"org_id": "id005", "email": "admin5@gmail.com", "pass": "Admin5@123", "officer": "HSE Lead Officer 05", "role": "ADMINISTRATOR"},

    # Normal User accounts (Field safety operators, incident reporting, view telemetry)
    {"org_id": "id001", "email": "user1@gmail.com", "pass": "User1@123", "officer": "Field Safety Operator", "role": "NORMAL_USER"},
    {"org_id": "id002", "email": "user2@gmail.com", "pass": "User2@123", "officer": "Field Safety Specialist", "role": "NORMAL_USER"},
    {"org_id": "id003", "email": "user3@gmail.com", "pass": "User3@123", "officer": "Plant Safety Technician", "role": "NORMAL_USER"},
    {"org_id": "id004", "email": "user4@gmail.com", "pass": "User4@123", "officer": "Field Inspection Officer", "role": "NORMAL_USER"},
    {"org_id": "id005", "email": "user5@gmail.com", "pass": "User5@123", "officer": "Pipeline Safety Monitor", "role": "NORMAL_USER"},
]

def ensure_initial_seed(db: Session):
    """Ensures authorized organizations, admin accounts, and normal user accounts exist in the DB."""
    for org_info in PRESET_ORGS:
        org = db.query(Organization).filter(Organization.id == org_info["id"]).first()
        if not org:
            org = Organization(id=org_info["id"], name=org_info["name"])
            db.add(org)
            db.commit()
            db.refresh(org)
        elif org.name != org_info["name"]:
            org.name = org_info["name"]
            db.commit()
    
    for u_info in PRESET_USERS:
        user = db.query(User).filter(User.email == u_info["email"]).first()
        if not user:
            user = User(
                organization_id=u_info["org_id"],
                email=u_info["email"],
                password=u_info["pass"],
                full_name=u_info["officer"],
                role=u_info["role"]
            )
            db.add(user)
            db.commit()
        else:
            # Sync default password and role for predefined accounts
            user.password = u_info["pass"]
            user.role = u_info["role"]
            user.full_name = u_info["officer"]
            user.organization_id = u_info["org_id"]
            db.commit()

def calculate_role_info(role: str, email: str, custom_permissions_str: Optional[str] = None):
    is_normal = role in ["NORMAL_USER", "FIELD_OPERATOR", "SAFETY_OFFICER"] or "user" in email.lower()
    is_admin = not is_normal and (
        role in ["ADMINISTRATOR", "CHIEF_HSE_AUDITOR", "ADMIN"] or 
        "admin" in email.lower()
    )
    role_name = "Administrator" if is_admin else ("Normal User" if role == "NORMAL_USER" else role.replace("_", " ").title())
    
    if custom_permissions_str:
        try:
            perms = json.loads(custom_permissions_str)
            if isinstance(perms, list) and len(perms) > 0:
                return is_admin, role_name, perms
        except Exception:
            perms = [p.strip() for p in custom_permissions_str.split(",") if p.strip()]
            if perms:
                return is_admin, role_name, perms

    permissions = (
        ["ALL", "MANAGE_USERS", "SETTINGS", "REPORTS_EDIT", "AUDIT", "VIEW_DASHBOARD", "RESET_DATA", "UPDATE_PRECURSOR_STATUS"]
        if is_admin else
        ["VIEW_DASHBOARD", "SUBMIT_OBSERVATION", "VIEW_REPORTS", "VIEW_SIGNALS"]
    )
    return is_admin, role_name, permissions

@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    ensure_initial_seed(db)
    
    org_id_clean = payload.org_id.strip().lower()
    email_clean = payload.email.strip().lower()
    
    user = db.query(User).filter(
        User.organization_id == org_id_clean,
        User.email == email_clean
    ).first()

    # Fallback match by email directly if org_id matches user's org or default id001
    if not user:
        candidate = db.query(User).filter(User.email == email_clean).first()
        if candidate and (candidate.organization_id.lower() == org_id_clean or org_id_clean in ["id001", "oil india limited"]):
            user = candidate

    if not user or user.password != payload.password.strip():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Organization ID, Email, or Password."
        )

    is_admin, role_name, permissions = calculate_role_info(user.role, user.email, getattr(user, "permissions", None))

    # Issue JWT token containing verified user ID and organization ID
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token_claims = {
        "sub": str(user.id),
        "org_id": user.organization_id,
        "email": user.email,
        "role": user.role,
        "is_admin": is_admin,
        "exp": expire
    }
    encoded_jwt = jwt.encode(token_claims, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    return TokenResponse(
        access_token=encoded_jwt,
        token_type="bearer",
        user=UserResponse(
            id=user.id,
            organization_id=user.organization_id,
            email=user.email,
            full_name=user.full_name,
            role=user.role,
            is_admin=is_admin,
            role_name=role_name,
            permissions=permissions,
            organization_name=user.organization.name if user.organization else None
        )
    )

@router.get("/me", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    is_admin, role_name, permissions = calculate_role_info(current_user.role, current_user.email, getattr(current_user, "permissions", None))
    return UserResponse(
        id=current_user.id,
        organization_id=current_user.organization_id,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
        is_admin=is_admin,
        role_name=role_name,
        permissions=permissions,
        organization_name=current_user.organization.name if current_user.organization else None
    )

@router.get("/users", response_model=List[UserResponse])
def list_users(db: Session = Depends(get_db)):
    """List all registered users and provisioned logins for the platform."""
    ensure_initial_seed(db)
    users = db.query(User).order_by(User.id.desc()).all()
    results = []
    for u in users:
        is_admin, role_name, permissions = calculate_role_info(u.role, u.email, getattr(u, "permissions", None))
        results.append(UserResponse(
            id=u.id,
            organization_id=u.organization_id,
            email=u.email,
            full_name=u.full_name,
            role=u.role,
            is_admin=is_admin,
            role_name=role_name,
            permissions=permissions,
            organization_name=u.organization.name if u.organization else None
        ))
    return results

@router.post("/users", response_model=UserResponse)
def create_or_update_user(payload: CreateUserRequest, db: Session = Depends(get_db)):
    """Admin manually provisions or updates a user login with credentials, role, and permissions."""
    ensure_initial_seed(db)

    clean_email = payload.email.strip().lower()
    clean_pass = payload.password.strip()
    clean_name = payload.full_name.strip()
    clean_org = (payload.organization_id or "id001").strip().lower()
    clean_role = (payload.role or "NORMAL_USER").strip().upper()

    if not clean_email or not clean_pass or not clean_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Full Name, Email/Login ID, and Password are all required."
        )

    # Ensure organization exists
    org = db.query(Organization).filter(Organization.id == clean_org).first()
    if not org:
        org = Organization(id=clean_org, name="Oil India Limited – Operational Safety Unit")
        db.add(org)
        db.commit()
        db.refresh(org)

    perms_str = json.dumps(payload.permissions) if payload.permissions else None

    # Check if user already exists
    user = db.query(User).filter(User.email == clean_email).first()
    if user:
        user.full_name = clean_name
        user.password = clean_pass
        user.role = clean_role
        user.organization_id = clean_org
        user.permissions = perms_str
        db.commit()
        db.refresh(user)
    else:
        user = User(
            organization_id=clean_org,
            email=clean_email,
            password=clean_pass,
            full_name=clean_name,
            role=clean_role,
            permissions=perms_str
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    is_admin, role_name, permissions = calculate_role_info(user.role, user.email, getattr(user, "permissions", None))

    return UserResponse(
        id=user.id,
        organization_id=user.organization_id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        is_admin=is_admin,
        role_name=role_name,
        permissions=permissions,
        organization_name=user.organization.name if user.organization else None
    )

@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    """Deletes a provisioned user account."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User account not found.")
    
    if user.email in ["admin1@gmail.com", "admin2@gmail.com"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Primary default administrator accounts cannot be deleted."
        )

    email = user.email
    db.delete(user)
    db.commit()
    return {"success": True, "message": f"User account {email} has been deleted successfully."}


