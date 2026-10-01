import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from app.ai_services.safety_validity import classify_safety_observation_validity

test_cases = [
    ("At front door it is very slippery", True),
    ("Water is leaking near the electrical panel", True),
    ("Worker was not wearing helmet", True),
    ("Tools were left on the floor", True),
    ("Loose electrical cable near walkway", True),
    ("Emergency exit is blocked", True),
    ("Forklift almost hit a pedestrian", True),
    ("Gas is leaking near compressor", True),
    ("The machine guard is missing", True),
    ("Hello, how are you?", False),
    ("Tell me a joke", False),
    ("It is very slippery", True),
]

print("=" * 70)
print("TESTING 12 MANDATORY USER TEST CASES ON SAFETY VALIDITY LAYER")
print("=" * 70)

all_passed = True
for text, expected_valid in test_cases:
    res = classify_safety_observation_validity(text)
    is_valid = res["is_valid_safety_observation"]
    status_str = "VALID SAFETY OBSERVATION" if is_valid else "UNRELATED INPUT"
    expected_str = "VALID SAFETY OBSERVATION" if expected_valid else "UNRELATED INPUT"
    
    passed = (is_valid == expected_valid)
    if not passed:
        all_passed = False
    
    flag = "[PASS]" if passed else "[FAIL]"
    print(f"{flag} {status_str:<25} (Expected: {expected_str:<25}) | Cat: {str(res['primary_category']):<25} | Text: \"{text}\"")

print("=" * 70)
if all_passed:
    print("ALL 12 TEST CASES PASSED VALIDITY LAYER VERIFICATION!")
else:
    print("SOME TEST CASES FAILED!")
print("=" * 70)
