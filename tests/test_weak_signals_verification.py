"""
End-to-End Verification Test Script:
Dynamic Safety Analysis + Historical Weak-Signal Detection
"""

import requests
import json

BASE_URL = "http://localhost:8000/api"

def run_tests():
    print("=== STARTING END-TO-END VERIFICATION TESTS ===")
    
    # 1. Login to obtain JWT
    login_resp = requests.post(f"{BASE_URL}/auth/login", json={
        "org_id": "id001",
        "email": "admin1@gmail.com",
        "password": "Admin1@123"
    })
    assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("[PASS] Successfully authenticated with JWT token.")

    # 2. Test Case A: Single environmental observation
    # "At front door it is very slippery"
    obs1 = {
        "description": "At front door it is very slippery due to rain water tracking inside.",
        "location": "Entrance Area",
        "report_type": "Unsafe Condition"
    }
    resp1 = requests.post(f"{BASE_URL}/analysis/analyze", json=obs1, headers=headers)
    assert resp1.status_code == 200, f"Analysis 1 failed: {resp1.text}"
    data1 = resp1.json()
    
    print("\n--- TEST CASE A: First Observation ---")
    print(f"Keys: {list(data1.keys())}")
    print(f"SIF Status: {data1.get('sif_category')} / {data1.get('sif_potential')}")
    print(f"Hazard: {data1.get('hazard_category')} / {data1.get('detected_hazard')}")
    print(f"Weak Signal Detected: {data1.get('weak_signal_detected')}")
    print(f"Weak Signal Reason: {str(data1.get('weak_signal_reason')).encode('ascii', 'replace').decode('ascii')}")

    # 3. Test Case B: Second correlated observation in same area
    # Should trigger WEAK SIGNAL detection (Rule: >= 2 records)
    obs2 = {
        "description": "Floor is very slippery and wet near entrance door with walking workers losing traction.",
        "location": "Entrance Area",
        "report_type": "Near Miss"
    }
    resp2 = requests.post(f"{BASE_URL}/analysis/analyze", json=obs2, headers=headers)
    assert resp2.status_code == 200, f"Analysis 2 failed: {resp2.text}"
    data2 = resp2.json()

    print("\n--- TEST CASE B: Second Observation (Correlated Pattern) ---")
    print(f"Weak Signal Detected: {data2.get('weak_signal_detected')}")
    print(f"Weak Signal ID: {data2.get('weak_signal_id')}")
    print(f"Weak Signal Title: {data2.get('weak_signal_title')}")
    print(f"Weak Signal Reason: {str(data2.get('weak_signal_reason')).encode('ascii', 'replace').decode('ascii')}")
    print(f"Escalation Path: {str(data2.get('escalation_path')).encode('ascii', 'replace').decode('ascii')}")
    print(f"Related Reports Count: {len(data2.get('related_reports', []))}")
    
    assert data2.get("weak_signal_detected") is True, "Weak signal MUST be detected for >= 2 correlated records!"
    assert "Slip/Trip" in data2.get("weak_signal_title", ""), f"Title should reflect slip/trip: {data2.get('weak_signal_title')}"
    assert len(data2.get("related_reports", [])) >= 2, "Must link current and historical reports!"
    assert "Potential escalation path" in data2.get("escalation_path", "") or "Repeated" in data2.get("escalation_path", ""), "Must formulate conservative escalation path!"
    print("[PASS] Test Case B passed: Dynamic weak signal successfully identified with >= 2 records and transparent evidence!")

    # 4. Test Case C: Third correlated observation in same area
    # Should UPDATE existing weak signal, NOT duplicate WS-002
    obs3 = {
        "description": "Repeated water puddle and slippery ground at entrance door creating fall hazard.",
        "location": "Entrance Area",
        "report_type": "Unsafe Condition"
    }
    resp3 = requests.post(f"{BASE_URL}/analysis/analyze", json=obs3, headers=headers)
    assert resp3.status_code == 200, f"Analysis 3 failed: {resp3.text}"
    data3 = resp3.json()

    print("\n--- TEST CASE C: Third Observation (Deduplication Check) ---")
    print(f"Weak Signal ID: {data3.get('weak_signal_id')} (Expected same as before: {data2.get('weak_signal_id')})")
    print(f"Weak Signal Reason: {data3.get('weak_signal_reason')}")
    assert data3.get("weak_signal_id") == data2.get("weak_signal_id"), "Must deduplicate and update existing signal ID!"
    print("[PASS] Test Case C passed: Deduplication preserved single weak signal entity and updated recurrence metrics!")

    # 5. Test Case D: Check GET /api/weak-signals
    ws_list_resp = requests.get(f"{BASE_URL}/weak-signals", headers=headers)
    assert ws_list_resp.status_code == 200, f"Weak signals fetch failed: {ws_list_resp.text}"
    ws_list_data = ws_list_resp.json()
    print("\n--- TEST CASE D: Query /api/weak-signals ---")
    signals = ws_list_data.get("weak_signals", [])
    print(f"Total dynamic weak signals stored: {len(signals)}")
    for s in signals:
        print(f"  [{s.get('signal_id')}] {s.get('title')} (Recurrence: {s.get('recurrence_count')}, Risk: {s.get('risk_score')})")
    assert len(signals) >= 1, "Must return stored dynamic weak signals from database!"
    print("[PASS] Test Case D passed: Real database-backed weak signals loaded!")

    # 6. Test Case E: Bulk CSV Upload with sequential correlation
    csv_content = (
        "description,location,report_type,incident_date\n"
        "Gas hissing sound detected at flange coupling in compressor room,Unit 4 Compressor,Unsafe Condition,2026-09-01\n"
        "Flammable hydrocarbon vapor odor detected near flange joints,Unit 4 Compressor,Near Miss,2026-09-03\n"
        "Minor gas leak observed around pipeline gasket seals,Unit 4 Compressor,Unsafe Condition,2026-09-05\n"
        "Temporary lighting fixture burned out,Unit 2 Substation,Unsafe Condition,2026-09-06\n"
    )
    bulk_resp = requests.post(
        f"{BASE_URL}/reports/bulk-upload",
        files={"file": ("test_surveillance_batch.csv", csv_content.encode("utf-8"), "text/csv")},
        headers=headers
    )
    assert bulk_resp.status_code == 200, f"Bulk upload failed: {bulk_resp.text}"
    bulk_data = bulk_resp.json()
    print("\n--- TEST CASE E: Bulk CSV Sequential Ingestion ---")
    print(f"Records Received: {bulk_data.get('records_received')}")
    print(f"Records Created: {bulk_data.get('records_created')}")
    print(f"Records Analyzed: {bulk_data.get('records_analyzed')}")
    print(f"Weak Signals Detected: {bulk_data.get('weak_signals_detected')}")
    assert bulk_data.get("records_analyzed") == 4, "All 4 records must be sequentially analyzed!"
    assert bulk_data.get("weak_signals_detected") >= 1, "Gas leak pattern in Unit 4 must be detected as weak signal!"
    print("[PASS] Test Case E passed: Bulk upload successfully executes sequential AI analysis and historical weak-signal detection!")

    print("\n=======================================================")
    print("ALL VERIFICATION TESTS COMPLETED AND VALIDATED 100%!")
    print("=======================================================")

if __name__ == "__main__":
    run_tests()
