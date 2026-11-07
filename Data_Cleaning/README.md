# House Price Data Preparation

## Overview

This project explores and cleans the King County House Sales dataset for use in a downstream house-price classification project. The notebooks preserve the original source data, document the cleaning decisions, and export a cleaned dataset and a small sample dataset.

The cleaning notebook prepares the records and features; it does **not** create price-class labels. The `price` column remains numeric in the exported dataset. Define the class thresholds in the modeling workflow before training a classifier.

**Source dataset:** [House Sales in King County, USA](https://www.kaggle.com/datasets/harlfoxem/housesalesprediction)  
**Raw file:** `data/raw/usa_house_data.csv`  
**Current cleaned output:** `data/processed/house_clean.csv`

## Project Structure

```text
Data_cleaning/
├── data/
│   ├── raw/usa_house_data.csv
│   └── processed/house_clean.csv      # 17-column cleaned dataset
├── notebooks/
│   ├── 01_data_exploration.ipynb
│   └── 02_data_cleaning.ipynb
├── reports/
│   ├── data_cleaning_report.xlsx      # cleaning steps and final summary
│   └── figures/                       # exploration figures
├── sample_data/sample_houses.csv      # 30-row reproducible sample
├── src/
│   ├── cleaning.py
│   ├── preprocessing.py
│   └── validation.py
├── requirements.txt
└── README.md
```

The notebooks use the reusable functions under `src/`. There is currently no Flask application in this workspace; the validation helpers are framework-neutral and can be called from Flask routes or other clients.

| Module | Responsibility |
|---|---|
| `src/cleaning.py` | Normalizes raw fields, removes duplicate and invalid records, creates derived features, and exposes `clean(df)` plus individual steps. |
| `src/validation.py` | Validates cleaned-data schema and values with `validate_cleaned_data(df)`, and validates form-style mappings with `validate_house_input(values, required_fields=...)`. |
| `src/preprocessing.py` | Builds the sklearn preprocessing and estimator pipeline. ZIP codes are treated as categorical values. |

## Requirements and Setup

- Python 3.10 or newer
- Jupyter Notebook, or Visual Studio Code with the Python and Jupyter extensions
- scikit-learn for the model preprocessing pipeline

From the project root, install the dependencies:

```powershell
python -m pip install -r requirements.txt
```

The cleaning notebook uses paths relative to the `notebooks/` directory. Start Jupyter from that directory so the paths resolve correctly:

```powershell
Set-Location notebooks
jupyter notebook
```

Run `01_data_exploration.ipynb` for exploratory analysis, then run all cells in `02_data_cleaning.ipynb` to recreate the cleaned CSV and sample.

## Cleaning Workflow

The cleaning notebook performs these steps:

1. Load the raw CSV and inspect its shape, schema, and missing values.
2. Convert `date` to a datetime type and `zipcode` to a string; check the valid ranges for `waterfront`, `view`, `condition`, and `grade`.
3. Remove exact duplicate rows and retain the most recent sale for each repeated house `id`.
4. Remove records with non-positive price or living area, records with zero bedrooms and bathrooms, and obvious bedroom-count errors.
5. Add `sale_year`, `price_per_sqft`, and `renovated`; remove identifier, date, location, neighboring-house, and original renovation-year columns.
6. Validate the final records and export the cleaned dataset and a reproducible 30-row sample.

On the current source data, the workflow reduces **21,613 rows and 21 columns** to **21,428 rows and 17 columns**. It removes 177 repeated-house records and 8 invalid records. These figures describe the verified current output and may change if the source data or cleaning rules change.

## Outputs

| Artifact | Purpose |
|---|---|
| `data/processed/house_clean.csv` | Current 17-column cleaned dataset written by `02_data_cleaning.ipynb`. |
| `sample_data/sample_houses.csv` | A 30-row sample selected with `RANDOM_STATE = 42`. |
| `reports/data_cleaning_report.xlsx` | Companion report containing a step log and final dataset summary. It has been aligned with the current notebook and verified output. |

The Excel report is maintained as a companion artifact; the notebook does not generate or update it automatically. Refresh the report when the cleaning logic or outputs change.

## Reuse the Python Modules

Import the same cleaning and validation functions used by the notebook:

```python
import pandas as pd

from src.cleaning import clean
from src.validation import validate_cleaned_data

raw = pd.read_csv("data/raw/usa_house_data.csv")
cleaned = clean(raw)
errors = validate_cleaned_data(cleaned)
if errors:
    raise ValueError("Invalid cleaned dataset: " + "; ".join(errors))
```

For a web form, call `validate_house_input(form_values, required_fields=(...))` and return its error list to the client. The caller must specify which fields are required by its form.

## Cleaned Dataset Schema

The current CSV has 17 columns, in this order:

`price`, `bedrooms`, `bathrooms`, `sqft_living`, `sqft_lot`, `floors`, `waterfront`, `view`, `condition`, `grade`, `sqft_above`, `sqft_basement`, `yr_built`, `zipcode`, `sale_year`, `price_per_sqft`, `renovated`.

Load the CSV while preserving ZIP codes as text:

```python
import pandas as pd

df = pd.read_csv(
    "data/processed/house_clean.csv",
    dtype={"zipcode": "string"},
)
print(df.shape)
print(df.dtypes)
```

### Modeling Note

**For M2 and M4:** `price_per_sqft` is calculated from the sale `price`. If the classifier predicts a class derived from sale price, this feature contains target information and must be excluded from decision-tree/model inputs to prevent target leakage. The cleaning notebook exports it for downstream review, but it must not be used as a model feature.

`prepare_features(df)` removes `price` and `price_per_sqft` before model fitting. Pass the resulting features to `build_preprocessor(features)` or `build_pipeline(estimator, features)` from `src/preprocessing.py`.

## Validation and Reporting

The notebook checks that price and living area are positive and that ZIP codes are non-empty. It also reports the valid-range checks for the selected categorical fields. The current source dataset has no missing values and no out-of-range values in those checked fields.

The `reports/data_cleaning_report.xlsx` workbook contains two sheets:

- **Cleaning Steps:** records the operations and row counts used by the current cleaning workflow.
- **Final Summary:** records the source and output dimensions, output paths, added and removed columns, and the classification-label status.

The workbook is a report of the verified workflow, not an automatically generated runtime log. Reconcile it with the notebook after any change to the cleaning logic or source data.

## Reproducibility and Data Handling

- Keep `data/raw/usa_house_data.csv` unchanged.
- The notebook sets `RANDOM_STATE = 42` for the sample export.
- Run the cleaning notebook from the `notebooks/` directory because it uses relative paths.
- Use `data/processed/house_clean.csv` as the single current cleaned output.
- Review the classification feature set separately from data cleaning, especially the target-derived `price_per_sqft` column.
- Avoid fitting imputation, scaling, or other data-dependent transformations on the entire dataset before splitting it into training and test sets.
- Do not commit virtual environments or unnecessary temporary files to Git.
