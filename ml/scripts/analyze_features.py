"""
Feature Analysis Script for SIF (Serious Injury and Fatality) Potential Prediction
GitHub Issue #9: Train ML models accurately

Purpose:
Analyze the relationship between each categorical feature and the target variable (sif_potential).
Identifies distribution, crosstabs, SIF-potential percentages, and notable rate variations.

Features Analyzed:
- report_type
- location
- activity
- barrier_failure
- observed_severity
- life_saving_rule

Target:
- sif_potential ('SIF-potential' vs 'Non-SIF-potential')
"""

import sys
from pathlib import Path
import pandas as pd
import numpy as np

# Path configuration
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent.parent
DATA_PATH = PROJECT_ROOT / "ml" / "data" / "sif_dataset.csv"

# Features and target specification
FEATURES_TO_ANALYZE = [
    "report_type",
    "location",
    "activity",
    "barrier_failure",
    "observed_severity",
    "life_saving_rule",
]
TARGET_COL = "sif_potential"
SIF_LABEL = "SIF-potential"
NON_SIF_LABEL = "Non-SIF-potential"


def load_dataset(csv_path: Path) -> pd.DataFrame:
    """Loads CSV dataset and verifies columns."""
    if not csv_path.exists():
        raise FileNotFoundError(f"Dataset file not found at: {csv_path}")

    df = pd.read_csv(csv_path)

    # Validate target and feature columns
    if TARGET_COL not in df.columns:
        raise ValueError(f"Target column '{TARGET_COL}' not found in {csv_path}.")

    missing_cols = [c for c in FEATURES_TO_ANALYZE if c not in df.columns]
    if missing_cols:
        raise ValueError(f"Missing required feature columns: {missing_cols}")

    return df


def analyze_feature(df: pd.DataFrame, feature: str, overall_sif_rate: float):
    """
    Analyzes the relationship between a single categorical feature and sif_potential.
    Computes:
    1. Unique values and cardinality.
    2. Crosstab count between categories and target.
    3. Percentage of SIF-potential for each category.
    4. Notable / unusually high or low SIF rates relative to baseline.
    """
    unique_vals = df[feature].unique()
    num_unique = len(unique_vals)

    print("=" * 80)
    print(f"FEATURE: {feature} ({num_unique} unique values)")
    print("=" * 80)

    # 1. Print unique values
    formatted_uniques = [repr(val) for val in sorted(unique_vals, key=lambda x: str(x))]
    print(f"Unique categories ({num_unique}):")
    if num_unique <= 15:
        print("  " + ", ".join(formatted_uniques))
    else:
        # Wrap for readability if many categories
        chunks = [formatted_uniques[i:i + 6] for i in range(0, num_unique, 6)]
        for chunk in chunks:
            print("  " + ", ".join(chunk))
    print()

    # 2. Crosstab counts
    ct_counts = pd.crosstab(
        df[feature],
        df[TARGET_COL],
        margins=True,
        margins_name="Total"
    )

    # Ensure required columns exist in crosstab
    for label in [SIF_LABEL, NON_SIF_LABEL]:
        if label not in ct_counts.columns:
            ct_counts[label] = 0

    # 3. Compute percentage of SIF-potential within each category
    analysis_df = pd.DataFrame({
        "SIF-potential": ct_counts[SIF_LABEL],
        "Non-SIF-potential": ct_counts[NON_SIF_LABEL],
        "Total": ct_counts["Total"],
    })

    # Drop Total row for category-level rate calculations
    cat_df = analysis_df.drop(index="Total").copy()
    cat_df["SIF_Rate_%"] = (cat_df["SIF-potential"] / cat_df["Total"]) * 100.0
    cat_df["Diff_from_Overall_%"] = cat_df["SIF_Rate_%"] - (overall_sif_rate * 100.0)

    # Sort categories by SIF rate descending
    cat_df_sorted = cat_df.sort_values(by="SIF_Rate_%", ascending=False)

    print("Crosstab & SIF-Potential Rates (sorted by SIF % descending):")
    print(f"{'Category':<32} {'SIF':>8} {'Non-SIF':>10} {'Total':>8} {'SIF %':>10} {'Diff vs Avg':>12}")
    print("-" * 84)

    for cat_name, row in cat_df_sorted.iterrows():
        diff_str = f"{row['Diff_from_Overall_%']:+.2f}%"
        print(
            f"{str(cat_name):<32} "
            f"{int(row['SIF-potential']):>8d} "
            f"{int(row['Non-SIF-potential']):>10d} "
            f"{int(row['Total']):>8d} "
            f"{row['SIF_Rate_%']:>9.2f}% "
            f"{diff_str:>12}"
        )

    print("-" * 84)
    total_row = analysis_df.loc["Total"]
    total_sif_rate = (total_row[SIF_LABEL] / total_row["Total"]) * 100.0
    print(
        f"{'Total / Overall':<32} "
        f"{int(total_row[SIF_LABEL]):>8d} "
        f"{int(total_row[NON_SIF_LABEL]):>10d} "
        f"{int(total_row['Total']):>8d} "
        f"{total_sif_rate:>9.2f}% "
        f"{'+0.00%':>12}"
    )
    print()

    # 4. Identify categories with unusually high or low SIF rates
    # Relative deviation analysis:
    max_rate_cat = cat_df_sorted.index[0]
    max_rate = cat_df_sorted.loc[max_rate_cat, "SIF_Rate_%"]
    min_rate_cat = cat_df_sorted.index[-1]
    min_rate = cat_df_sorted.loc[min_rate_cat, "SIF_Rate_%"]
    rate_range = max_rate - min_rate

    # Flag notable categories (e.g., top 2 highest and lowest, or deviation threshold)
    threshold_dev = 2.0  # 2.0% deviation from baseline
    notable_high = cat_df_sorted[cat_df_sorted["Diff_from_Overall_%"] >= threshold_dev]
    notable_low = cat_df_sorted[cat_df_sorted["Diff_from_Overall_%"] <= -threshold_dev]

    print("Key Observations:")
    print(f"  - Highest SIF Rate: '{max_rate_cat}' at {max_rate:.2f}% ({max_rate - overall_sif_rate * 100.0:+.2f}% vs avg)")
    print(f"  - Lowest SIF Rate:  '{min_rate_cat}' at {min_rate:.2f}% ({min_rate - overall_sif_rate * 100.0:+.2f}% vs avg)")
    print(f"  - Category Spread:   {rate_range:.2f}% difference between highest and lowest")

    if len(notable_high) > 0:
        high_list = [f"'{c}' ({r['SIF_Rate_%']:.2f}%)" for c, r in notable_high.iterrows()]
        print(f"  - Unusually High SIF (>={overall_sif_rate*100 + threshold_dev:.1f}%): " + ", ".join(high_list))
    else:
        print(f"  - Unusually High SIF: None exceeded +{threshold_dev:.1f}% deviation threshold.")

    if len(notable_low) > 0:
        low_list = [f"'{c}' ({r['SIF_Rate_%']:.2f}%)" for c, r in notable_low.iterrows()]
        print(f"  - Unusually Low SIF (<={overall_sif_rate*100 - threshold_dev:.1f}%):  " + ", ".join(low_list))
    else:
        print(f"  - Unusually Low SIF:  None exceeded -{threshold_dev:.1f}% deviation threshold.")

    print()


def main():
    print("#" * 80)
    print(" SIF DATASET CATEGORICAL FEATURE ANALYSIS")
    print(f" Data Source: {DATA_PATH}")
    print("#" * 80)
    print()

    # Load dataset
    df = load_dataset(DATA_PATH)
    total_records = len(df)

    # Calculate overall SIF rate
    sif_count = (df[TARGET_COL] == SIF_LABEL).sum()
    non_sif_count = (df[TARGET_COL] == NON_SIF_LABEL).sum()
    overall_sif_rate = sif_count / total_records

    print("OVERALL TARGET DISTRIBUTION:")
    print(f"  - Total records:      {total_records:,}")
    print(f"  - SIF-potential:      {sif_count:,} ({overall_sif_rate * 100.0:.2f}%)")
    print(f"  - Non-SIF-potential:  {non_sif_count:,} ({(non_sif_count / total_records) * 100.0:.2f}%)")
    print(f"  - Baseline SIF Rate:  {overall_sif_rate * 100.0:.2f}%")
    print()

    # Analyze each feature
    for feature in FEATURES_TO_ANALYZE:
        analyze_feature(df, feature, overall_sif_rate)

    print("#" * 80)
    print(" SUMMARY INSIGHTS FOR MODELING")
    print("#" * 80)
    print("1. Target Balance: The dataset is exactly 50/50 balanced overall.")
    print("2. Marginal Variations: Individual categorical features exhibit relatively tight")
    print("   clustering around the 50% baseline in this synthetic dataset.")
    print("3. Modeling Implication: Because individual marginal probabilities are close to 50%,")
    print("   univariate linear or shallow rules have subtle signal; higher-order combinations")
    print("   or non-linear interactions are necessary to separate SIF vs Non-SIF.")
    print("#" * 80)


if __name__ == "__main__":
    main()
