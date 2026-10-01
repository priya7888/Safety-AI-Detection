import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app.database import SessionLocal, Base, engine
from backend.app.seed_data import seed_sample_data
from backend.app.routers.auth import login, LoginRequest
from backend.app.routers.weak_signals import (
    list_weak_signals,
    get_weak_signal_details,
    review_weak_signal,
    correlate_arbitrary_reports,
    WeakSignalReviewRequest,
    CorrelateReportsRequest
)
from backend.app.routers.sif_precursors import list_sif_precursors
from backend.app.routers.sif_intelligence import get_sif_intelligence
from backend.app.models.user import User

def test_api():
    print("=== TESTING FASTAPI ROUTER LOGIC & AUTH CONTEXT ===")
    Base.metadata.create_all(bind=engine)
    seed_sample_data()
    db = SessionLocal()

    try:
        # 1. Auth Login Route
        print("1. Testing Auth Login Route...")
        login_req = LoginRequest(
            org_id="id001",
            email="admin1@gmail.com",
            password="Admin1@123"
        )
        login_res = login(login_req, db)
        assert hasattr(login_res, "access_token") or "access_token" in login_res
        print(">>> Auth Login Passed: Token generated successfully.")

        # Simulate authenticated user context
        user = db.query(User).filter(User.email == "admin1@gmail.com").first()
        assert user is not None
        print(f">>> User Context Verified: {user.email} (Org: {user.organization_id}, Role: {user.role})")

        # 2. GET /api/weak-signals
        print("\n2. Testing GET /api/weak-signals Route...")
        ws_res = list_weak_signals(current_user=user, db=db)
        assert "summary" in ws_res
        assert "weak_signals" in ws_res
        assert len(ws_res["weak_signals"]) >= 2
        print(f">>> Weak Signals List Passed: {len(ws_res['weak_signals'])} signals returned.")

        # 3. GET /api/weak-signals/{id}
        print("\n3. Testing GET /api/weak-signals/{id} Route...")
        sig_id = ws_res["weak_signals"][0]["signal_id"]
        ws_detail = get_weak_signal_details(signal_id=sig_id, current_user=user, db=db)
        assert ws_detail["signal_id"] == sig_id
        assert "progression_steps" in ws_detail
        print(f">>> Weak Signal Detail Passed: Successfully retrieved {sig_id}.")

        # 4. POST /api/weak-signals/correlate-reports (Gas Leak + Ignition Source)
        print("\n4. Testing POST /api/weak-signals/correlate-reports (Gas Leak + Ignition Source)...")
        corr_req = CorrelateReportsRequest(
            reports=[
                {
                    "report_id": "R1",
                    "description": "Gas is leaking from a pipeline with loud hissing sound.",
                    "location": "Unit 1",
                    "report_type": "Near Miss"
                },
                {
                    "report_id": "R2",
                    "description": "Fire and ignition source detected near the pipeline.",
                    "location": "Unit 1",
                    "report_type": "Unsafe Condition"
                }
            ]
        )
        corr_res = correlate_arbitrary_reports(corr_req, current_user=user)
        assert corr_res["cluster_detected"] is True
        assert corr_res["relationship"] == "Gas Leak + Ignition Source"
        assert corr_res["potential_consequence"] == "Fire/Explosion"
        assert corr_res["combined_risk"] in ["HIGH", "CRITICAL"]
        print(f">>> Correlation Passed: {corr_res['relationship']} -> {corr_res['potential_consequence']} (Risk: {corr_res['combined_risk']})")

        # 5. POST /api/weak-signals/correlate-reports (Unrelated)
        print("\n5. Testing POST /api/weak-signals/correlate-reports (Unrelated Signals)...")
        unrel_req = CorrelateReportsRequest(
            reports=[
                {
                    "report_id": "R3",
                    "description": "Loose floor tile in executive office canteen walkway.",
                    "location": "Administration Building Canteen",
                    "report_type": "Unsafe Condition"
                },
                {
                    "report_id": "R4",
                    "description": "Routine cooling water valve inspection completed.",
                    "location": "Cooling Tower Area 5",
                    "report_type": "Routine"
                }
            ]
        )
        unrel_res = correlate_arbitrary_reports(unrel_req, current_user=user)
        assert unrel_res["cluster_detected"] is False
        print(f">>> Unrelated Signals Passed: cluster_detected={unrel_res['cluster_detected']}")

        # 6. SIF Precursors Route
        print("\n6. Testing SIF Precursors Route...")
        precursors = list_sif_precursors(current_user=user, db=db)
        assert len(precursors) >= 1
        print(f">>> SIF Precursors Route Passed: {len(precursors)} precursors.")

        # 7. SIF Intelligence Route
        print("\n7. Testing SIF Intelligence Route...")
        intel = get_sif_intelligence(current_user=user, db=db)
        assert hasattr(intel, "status_message") or "status_message" in intel
        print(">>> SIF Intelligence Route Passed: OK")

        print("\n================================================================")
        print("      ALL API & AUTH CHECKS PASSED! ZERO ERRORS ENCOUNTERED     ")
        print("================================================================")

    finally:
        db.close()

if __name__ == "__main__":
    test_api()
