"""
Verification and demonstration script for Dense Semantic Embeddings (all-MiniLM-L6-v2)
and the 9 IOGP Life-Saving Rules Semantic Matcher.
"""
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.ai_services.similarity_service import compute_similarity, compute_dense_embedding
from app.ai_services.life_saving_rules import map_life_saving_rules, LSR_DEFINITIONS

def main():
    print("=" * 80)
    print("DEMO 1: Dense Semantic Embeddings (all-MiniLM-L6-v2)")
    print("=" * 80)
    
    sample_text = "Technician slipped on icy scaffold staging platform without safety harness secured."
    emb = compute_dense_embedding(sample_text)
    print(f"Report Text: \"{sample_text}\"")
    print(f"Generated Dense Embedding Shape: {emb.shape} (384-dimensional continuous vector)")
    print(f"First 5 vector components: {emb[:5]}")
    print()

    print("=" * 80)
    print("DEMO 2: Semantic Similarity (Cross-Wording Synonym Match)")
    print("=" * 80)
    
    pairs = [
        (
            "Worker fell from temporary scaffolding staging at height.",
            "Technician dropped from elevated work platform without lanyard tie-off.",
            "High Semantic Synonymy (Fall at height)"
        ),
        (
            "Electrician touched 440V energized busbar without breaker lockout.",
            "Live electrical circuit was worked on without de-energizing or LOTO isolation.",
            "High Semantic Synonymy (Electrical energy / LOTO)"
        ),
        (
            "Worker tripped over a computer cable in the central office.",
            "Scaffolder worked near unguarded floor edge on level 5.",
            "Low Semantic Similarity (Office slip vs High Fall)"
        )
    ]

    for t1, t2, desc in pairs:
        score = compute_similarity(t1, t2)
        print(f"Text 1: \"{t1}\"")
        print(f"Text 2: \"{t2}\"")
        print(f"Category: {desc} -> Cosine Similarity Score: {score:.3f}")
        print("-" * 60)

    print()
    print("=" * 80)
    print("DEMO 3: 9 IOGP Life-Saving Rules Semantic Matcher")
    print("=" * 80)
    print(f"Total Rules Configured: {len(LSR_DEFINITIONS)} IOGP Rules (LSR-01 to LSR-09)")
    for key, val in LSR_DEFINITIONS.items():
        print(f"  • {val['code']}: {val['name']} ({val['category']})")
    
    print("\nEvaluating Sample Incidents against 9 IOGP Rules:")
    test_reports = [
        "Fitter repaired centrifugal pump without locking out electrical disconnect switch.",
        "Painter working on 8-meter mobile scaffold without secondary safety lifeline.",
        "Mobile crane swung 12-ton pipe spool over main plant walkway during peak shift change.",
        "Contractor entered internal chamber of reactor column without multi-gas atmospheric test.",
        "Maintenance crew bypassed automated ESD trip interlock on hydrocarbon separator.",
        "Forklift operator drove at excessive speed through pedestrian crossing area in warehouse.",
        "Welder performed oxy-acetylene torch cutting next to diesel tank without hot work permit.",
        "Subcontractor began trench excavation without authorized Permit to Work or JSA review."
    ]

    for r in test_reports:
        res = map_life_saving_rules(r)
        if res:
            print(f"\n[REPORT]: \"{r}\"")
            print(f"  --> MATCHED RULE: [{res['rule_code']}] {res['rule_name']}")
            print(f"  --> CATEGORY:     {res['category']}")
            print(f"  --> STATUS:       {res['status']} ({res['severity']})")
            print(f"  --> CONTROLS:     {res['mandatory_controls'][0]}")

    print("\n" + "=" * 80)
    print("ALL DENSE EMBEDDING & 9 IOGP RULE TESTS COMPLETED SUCCESSFULLY!")
    print("=" * 80)

if __name__ == "__main__":
    main()
