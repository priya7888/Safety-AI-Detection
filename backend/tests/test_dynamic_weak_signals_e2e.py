import requests
import json
import sys
import io
import sqlite3

# Ensure UTF-8 output for Windows console
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

BASE_URL = "http://localhost:8000"

def clean_database():
    """Resets report and weak signal tables to verify clean-slate progression."""
    conn = sqlite3.connect("safety_intelligence.db")
    cur = conn.cursor()
    cur.execute("DELETE FROM report_weak_signals")
    cur.execute("DELETE FROM weak_signals")
    cur.execute("DELETE FROM ai_analyses")
    cur.execute("DELETE FROM safety_reports")
    conn.commit()
    conn.close()
    print("0. Database cleaned. Initial state: 0 reports, 0 weak signals.")

def run_tests():
    print("==================================================================")
    print("STARTING DYNAMIC SAFETY ANALYSIS + WEAK-SIGNAL DETECTION E2E TESTS")
    print("==================================================================")

    # 0. Clean DB
    clean_database()

    # 1. Login as admin
    login_payload = {
        "org_id": "id001",
        "email": "admin1@gmail.com",
        "password": "Admin1@123"
    }
    login_res = requests.post(f"{BASE_URL}/api/auth/login", json=login_payload)
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    print("1. Authentication Successful. Token acquired.")

    # 2. Test Case 1: First observation - "At front door it is very slippery"
    print("\n--- Test Case 1: First Observation (Isolated Event) ---")
    payload1 = {
        "report_text": "At front door it is very slippery",
        "text": "At front door it is very slippery",
        "description": "At front door it is very slippery",
        "report_type": "UNSAFE_CONDITION",
        "location": "Front Door",
        "facility_unit": "Front Door Operating Area"
    }
    r1 = requests.post(f"{BASE_URL}/api/analysis/analyze", json=payload1, headers=headers)
    assert r1.status_code == 200, f"Analysis 1 failed: {r1.text}"
    d1 = r1.json()
    print(f"Report Reference: {d1.get('report_reference')}")
    print(f"SIF Precursor Assessment: {d1.get('sif_precursor')}")
    print(f"Risk Score: {d1.get('risk_score') or d1.get('sif_potential_score')}")
    print(f"Hazard: {d1.get('hazard')}")
    print(f"Weak Signal Detected: {d1.get('weak_signal_detected')}")
    print(f"Weak Signals: {d1.get('weak_signals')}")

    assert d1.get("sif_precursor") in ["NO", "NON-SIF"], f"Expected Non-SIF for slippery door, got {d1.get('sif_precursor')}"
    # In isolated first report, there should be NO weak signal
    # (since >= 2 records rule requires historical correlation)
    assert d1.get("weak_signal_detected") is False, "First observation should be an isolated event without weak signal"
    assert len(d1.get("weak_signals", [])) == 0, "Expected empty weak_signals list for isolated first event"
    print("[PASS] Test Case 1 PASSED: Valid non-SIF safety observation analyzed with zero weak signals (isolated event).")

    # 3. Test Case 2: Second observation in same unit/hazard -> Pattern Emergence
    print("\n--- Test Case 2: Second Observation (Pattern Emergence) ---")
    payload2 = {
        "report_text": "Floor is slippery because water leaking near front door",
        "text": "Floor is slippery because water leaking near front door",
        "description": "Floor is slippery because water leaking near front door",
        "report_type": "UNSAFE_CONDITION",
        "location": "Front Door",
        "facility_unit": "Front Door Operating Area"
    }
    r2 = requests.post(f"{BASE_URL}/api/analysis/analyze", json=payload2, headers=headers)
    assert r2.status_code == 200, f"Analysis 2 failed: {r2.text}"
    d2 = r2.json()
    print(f"Report Reference: {d2.get('report_reference')}")
    print(f"Weak Signal Detected: {d2.get('weak_signal_detected')}")
    print(f"Weak Signal ID: {d2.get('weak_signal_id')}")
    print(f"Weak Signal Title: {d2.get('weak_signal_title')}")
    print(f"Escalation Path: {d2.get('escalation_path')}")
    print(f"Related Reports Count: {len(d2.get('related_reports', []))}")

    assert d2.get("weak_signal_detected") is True, "Second observation in same area/hazard MUST trigger a weak signal"
    assert d2.get("weak_signal_id") is not None, "Expected weak_signal_id to be populated"
    assert len(d2.get("related_reports", [])) >= 2, f"Expected >= 2 related reports, got {len(d2.get('related_reports', []))}"
    first_signal_id = d2.get("weak_signal_id")
    print(f"[PASS] Test Case 2 PASSED: Weak signal successfully detected ({first_signal_id}) correlating 2 reports.")

    # 4. Test Case 3: Third observation - Deduplication Check
    print("\n--- Test Case 3: Third Observation (Deduplication Check) ---")
    payload3 = {
        "report_text": "Slick surface and water puddle remains at front door",
        "text": "Slick surface and water puddle remains at front door",
        "description": "Slick surface and water puddle remains at front door",
        "report_type": "UNSAFE_CONDITION",
        "location": "Front Door",
        "facility_unit": "Front Door Operating Area"
    }
    r3 = requests.post(f"{BASE_URL}/api/analysis/analyze", json=payload3, headers=headers)
    assert r3.status_code == 200, f"Analysis 3 failed: {r3.text}"
    d3 = r3.json()
    print(f"Weak Signal Detected: {d3.get('weak_signal_detected')}")
    print(f"Weak Signal ID: {d3.get('weak_signal_id')}")
    print(f"Related Reports Count: {len(d3.get('related_reports', []))}")

    assert d3.get("weak_signal_detected") is True
    # Verify deduplication: should update the same weak signal ID rather than creating a duplicate
    assert d3.get("weak_signal_id") == first_signal_id, f"Expected deduplication to signal {first_signal_id}, got {d3.get('weak_signal_id')}"
    assert len(d3.get("related_reports", [])) >= 3, f"Expected >= 3 related reports, got {len(d3.get('related_reports', []))}"
    print(f"[PASS] Test Case 3 PASSED: Deduplication verified. Updated existing weak signal {first_signal_id} with recurrence.")

    # 5. Test Case 4: Bulk Upload Sequential Ingestion
    print("\n--- Test Case 4: Bulk Upload Ingestion (Compressor Skid Delta) ---")
    bulk_payload = [
        {
            "description": "Minor gas weep detected at flange connection on Compressor Skid Delta",
            "report_type": "UNSAFE_CONDITION",
            "location": "Compressor Skid Delta",
            "report_date": "2026-09-08"
        },
        {
            "description": "Audible gas hissing sound heard near Compressor Skid Delta flange",
            "report_type": "NEAR_MISS",
            "location": "Compressor Skid Delta",
            "report_date": "2026-09-08"
        },
        {
            "description": "Gas odor detected again around Compressor Skid Delta manifold piping",
            "report_type": "UNSAFE_CONDITION",
            "location": "Compressor Skid Delta",
            "report_date": "2026-09-09"
        },
        {
            "description": "Overhead high-bay light fixture flickering in walkway",
            "report_type": "UNSAFE_CONDITION",
            "location": "Walkway East",
            "report_date": "2026-09-09"
        }
    ]
    r_bulk = requests.post(f"{BASE_URL}/api/reports/batch", json=bulk_payload, headers=headers)
    assert r_bulk.status_code == 200, f"Bulk upload failed: {r_bulk.text}"
    d_bulk = r_bulk.json()
    print(f"Bulk Upload Result: {json.dumps(d_bulk, indent=2)}")

    assert d_bulk.get("records_received") == 4
    assert d_bulk.get("records_created") == 4
    assert d_bulk.get("records_analyzed") == 4
    assert d_bulk.get("weak_signals_detected") >= 1, f"Expected at least 1 weak signal detected in bulk upload, got {d_bulk.get('weak_signals_detected')}"
    print("[PASS] Test Case 4 PASSED: Bulk upload sequentially ingested and detected weak signals.")

    # 6. Test Case 5: Query Weak Signals for Organization API
    print("\n--- Test Case 5: Query Weak Signals API ---")
    r_ws = requests.get(f"{BASE_URL}/api/weak-signals/", headers=headers)
    assert r_ws.status_code == 200, f"Weak signals query failed: {r_ws.text}"
    d_ws = r_ws.json()
    signals = d_ws.get("weak_signals", [])
    print(f"Total Active Signals in DB: {len(signals)}")
    for s in signals:
        print(f"  - [{s.get('signal_id')}] {s.get('title')} (Risk: {s.get('risk_score')}, Reports: {len(s.get('source_reports', []))})")

    assert len(signals) >= 2, f"Expected at least 2 weak signals (Slip hazard + Gas compressor), got {len(signals)}"
    print("[PASS] Test Case 5 PASSED: Weak signals correctly retrieved from real database records.")

    print("\n==================================================================")
    print("ALL E2E SAFETY ANALYSIS & HISTORICAL WEAK-SIGNAL TESTS PASSED!")
    print("==================================================================")

if __name__ == "__main__":
    try:
        run_tests()
    except Exception as e:
        print(f"\nTEST FAILED WITH ERROR: {e}")
        sys.exit(1)
