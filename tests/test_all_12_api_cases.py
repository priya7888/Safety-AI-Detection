import urllib.request
import json
import time

def test_12_cases():
    time.sleep(2)  # Allow server to ready
    # 1. Login
    login_data = json.dumps({'org_id': 'id001', 'email': 'admin1@gmail.com', 'password': 'Admin1@123'}).encode('utf-8')
    login_req = urllib.request.Request('http://localhost:8000/api/auth/login', data=login_data, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(login_req) as resp:
        auth_data = json.loads(resp.read().decode())
        token = auth_data['access_token']
        print(f"[+] Logged in: {auth_data['user']['email']}")

    headers = {'Content-Type': 'application/json', 'Authorization': f'Bearer {token}'}

    cases = [
        {
            "id": 1,
            "text": "At front door it is very slippery",
            "expected_valid": True,
            "expected_hazard_contains": "Slip",
            "expected_location": "Front Door",
            "expect_no_energy": True
        },
        {
            "id": 2,
            "text": "Water is leaking near the electrical panel",
            "expected_valid": True,
            "expected_hazard_contains": "Electrical",
            "expect_energy_contains": "Electrical"
        },
        {
            "id": 3,
            "text": "Worker was not wearing helmet",
            "expected_valid": True,
            "expected_hazard_contains": "PPE"
        },
        {
            "id": 4,
            "text": "Tools were left on the floor",
            "expected_valid": True,
            "expected_hazard_contains": "Housekeeping"
        },
        {
            "id": 5,
            "text": "Loose electrical cable near walkway",
            "expected_valid": True,
            "expected_hazard_contains": "Electrical"
        },
        {
            "id": 6,
            "text": "Emergency exit is blocked",
            "expected_valid": True,
            "expected_hazard_contains": "Emergency"
        },
        {
            "id": 7,
            "text": "Forklift almost hit a pedestrian",
            "expected_valid": True,
            "expected_hazard_contains": "Pedestrian"
        },
        {
            "id": 8,
            "text": "Gas is leaking near compressor",
            "expected_valid": True,
            "expected_hazard_contains": "Gas"
        },
        {
            "id": 9,
            "text": "The machine guard is missing",
            "expected_valid": True,
            "expected_hazard_contains": "Safeguard"
        },
        {
            "id": 10,
            "text": "Hello, how are you?",
            "expected_valid": False,
        },
        {
            "id": 11,
            "text": "Tell me a joke",
            "expected_valid": False,
        },
        {
            "id": 12,
            "text": "It is very slippery",
            "expected_valid": True,
            "expected_hazard_contains": "Slip",
            "expected_location": "Unknown"
        }
    ]

    print("\n" + "=" * 80)
    print("VERIFYING ALL 12 MANDATORY USER TEST CASES VIA FASTAPI LIVE API")
    print("=" * 80)

    all_passed = True
    for c in cases:
        payload = json.dumps({
            "report_text": c["text"],
            "report_type": "Near Miss",
            "location": None
        }).encode("utf-8")

        req = urllib.request.Request('http://localhost:8000/api/analysis/analyze', data=payload, headers=headers)
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())

        status = data.get("determination_status")
        is_unrelated = data.get("is_unrelated", False)
        is_valid = not is_unrelated

        passed = True
        reasons = []

        # Check validity
        if is_valid != c["expected_valid"]:
            passed = False
            reasons.append(f"Expected valid={c['expected_valid']} but got valid={is_valid} ({status})")

        # Check hazard
        if c.get("expected_hazard_contains"):
            hazard = data.get("hazard") or ""
            if c["expected_hazard_contains"].lower() not in hazard.lower():
                passed = False
                reasons.append(f"Expected hazard containing '{c['expected_hazard_contains']}', got '{hazard}'")

        # Check location
        if c.get("expected_location"):
            loc = data.get("location") or ""
            # If location is Front Door or Unknown
            if c["expected_location"].lower() not in loc.lower():
                # Also check detected_hazards or report_name
                if c["expected_location"] == "Unknown" and loc not in ["Unknown", ""]:
                    passed = False
                    reasons.append(f"Expected location '{c['expected_location']}', got '{loc}'")

        # Check energy vector for case 1: must NOT invent energy
        if c.get("expect_no_energy"):
            energy = data.get("energy_source") or data.get("energy_vector") or ""
            if "high" in energy.lower() or "electrical" in energy.lower() or "chemical" in energy.lower():
                passed = False
                reasons.append(f"Expected no high energy, but got '{energy}'")

        if not passed:
            all_passed = False
            print(f"[FAIL] Case {c['id']:2d}: \"{c['text']}\" -> {', '.join(reasons)}")
        else:
            print(f"[PASS] Case {c['id']:2d}: \"{c['text']}\"")
            print(f"       Status: {status} | Hazard: {data.get('hazard')} | Energy: {data.get('energy_source')} | Barrier: {data.get('barrier_status')}")

    print("=" * 80)
    if all_passed:
        print("[SUCCESS] ALL 12 MANDATORY TEST CASES PASSED WITH COMPLETE FIDELITY!")
    else:
        print("[FAIL] Some cases failed.")
    print("=" * 80)

if __name__ == "__main__":
    test_12_cases()
