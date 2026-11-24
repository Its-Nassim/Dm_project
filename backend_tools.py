"""
backend_tools.py – Lightweight copy of the constants and input-validation logic
from m3-preprocessing/src/m3_tools.py.

Why this exists:
    m3_tools.py imports matplotlib, seaborn, sklearn, numpy etc. for notebook use.
    The Flask backend only needs FEATURE_ORDER, LABELS, and prepare_input().
    Importing the full m3_tools at server startup would require every ML library
    to be installed in the backend venv, even before a model exists.
    This file contains only the three things the backend actually uses,
    with no heavy dependencies (only pandas and re from the stdlib).

Keep in sync with m3_tools.py if FEATURE_ORDER, LABELS, or prepare_input() change.
"""

import re

import pandas as pd

# ---------------------------------------------------------------------------
# Constants (must match m3_tools.py exactly)
# ---------------------------------------------------------------------------
TARGET = "price_category"

FEATURE_ORDER = [
    "price", "bedrooms", "bathrooms", "sqft_living", "sqft_lot", "floors",
    "waterfront", "view", "condition", "grade", "sqft_above",
    "sqft_basement", "yr_built", "zipcode", "renovated",
]

CATEGORICAL = ["zipcode"]
NUMERICAL   = [c for c in FEATURE_ORDER if c not in CATEGORICAL]

LABELS = {
    0: "Cheaper than average",
    1: "Reasonable price",
    2: "Over priced",
    3: "Too over priced",
}

# ---------------------------------------------------------------------------
# Input validation (copied verbatim from m3_tools.prepare_input)
# ---------------------------------------------------------------------------
def prepare_input(df: pd.DataFrame) -> pd.DataFrame:
    """Put a raw DataFrame (from the form / CSV) into the format the pipeline expects.

    - Keeps only the 15 FEATURE_ORDER columns in the correct order.
    - Converts numeric columns to numbers (NaN stays NaN; the pipeline imputes it).
    - Raises ValueError for:
        * missing columns
        * non-numeric values in numeric fields
        * price missing or <= 0
        * zipcode missing or empty
    """
    missing = [c for c in FEATURE_ORDER if c not in df.columns]
    if missing:
        raise ValueError(f"Missing columns: {missing}")

    raw = df[FEATURE_ORDER].copy()
    out = raw.copy()

    # Numeric conversion — "abc" becomes NaN, then detected below
    for c in NUMERICAL:
        out[c] = pd.to_numeric(raw[c], errors="coerce")
        bad = out[c].isna() & raw[c].notna() & (raw[c].astype(str).str.strip() != "")
        if bad.any():
            raise ValueError(f"{c}: non-numeric value ({raw.loc[bad, c].iloc[0]!r})")

    # price: required and strictly positive
    if out["price"].isna().any() or (out["price"] <= 0).any():
        raise ValueError("price: required and must be > 0")

    # zipcode: required (no sensible fallback for a geographic identifier)
    zc = raw["zipcode"]
    if zc.isna().any() or (zc.astype(str).str.strip() == "").any():
        raise ValueError("zipcode: required")

    out["zipcode"] = zc.astype(str).str.strip().str.replace(r"\.0$", "", regex=True)
    return out
