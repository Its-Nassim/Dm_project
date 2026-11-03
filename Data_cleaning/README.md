# Data Cleaning Module — House Price Classification

## 1. Overview

This module is responsible for preparing the housing dataset for the House Price Classification project. It covers data exploration, data cleaning, data-quality validation, and preparation of a reliable dataset for subsequent machine-learning tasks.

The goal is to provide the other team members with consistent, validated, and reproducible data for building the house-price classification model.

**Module:** M1 — Data Cleaning  
**Dataset:** House Sales in King County, USA  
**Source:** [Kaggle — House Sales in King County, USA](https://www.kaggle.com/datasets/harlfoxem/housesalesprediction)  
**Original dataset:** 21,613 rows and 21 columns  
**Language:** Python

## 2. Module Structure

```text
Data_cleaning/
├── data/
│   ├── raw/
│   │   └── usa_house_data.csv
│   └── processed/
│       └── house_clean.csv
├── Sample_data/
│        └── sample_houses.csv
├── notebooks/
│   ├── 01_data_exploration.ipynb
│   └── 02_data_cleaning.ipynb
├── src/
│   ├── cleaning.py
│   ├── validation.py
│   └── preprocessing.py
├── reports/
│   ├── cleaning_report.json
│   └── data_quality_report.csv
├── requirements.txt
└── README.md
```

### Directory responsibilities

| Directory or file | Description |
|---|---|
| `data/raw/` | Stores the original dataset. The source file must remain unchanged. |
| `data/processed/` | Stores the cleaned dataset for downstream analysis and modeling. |
| `notebooks/01_data_exploration.ipynb` | Explores the dataset, its distributions, data types, missing values, and potential anomalies. |
| `notebooks/02_data_cleaning.ipynb` | Documents and executes the cleaning workflow. |
| `src/cleaning.py` | Contains reusable functions for cleaning the dataset. |
| `src/validation.py` | Implements data-quality checks and validates the cleaning results. |
| `src/preprocessing.py` | Provides feature-preparation functions for subsequent modeling tasks. |
| `reports/cleaning_report.json` | Records the main cleaning operations and their results. |
| `reports/data_quality_report.csv` | Contains structured data-quality statistics and validation results. |
| `requirements.txt` | Lists the Python dependencies required by this module. |

## 3. Requirements

- Python 3.10 or newer.
- pip.
- Jupyter Notebook or Visual Studio Code with the Python and Jupyter extensions.

### Install dependencies

Open a terminal inside the `Data_cleaning/` directory.

**Windows — PowerShell**

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

If PowerShell blocks virtual-environment activation, you can use the environment's Python executable directly:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

**Linux / macOS**

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
```

## 4. Dataset Preparation Workflow

The data-cleaning process follows these stages:

1. **Data loading:** Load the original CSV file from `data/raw/`.
2. **Data exploration:** Inspect the dataset dimensions, column types, descriptive statistics, missing values, duplicates, and distributions.
3. **Data cleaning:** Apply justified treatments to duplicate records, invalid values, inconsistent data types, and other identified quality issues.
4. **Data validation:** Verify that the cleaned dataset satisfies the defined quality requirements.
5. **Data export:** Save the validated dataset to `data/processed/house_clean.csv`.
6. **Reporting:** Generate reports documenting the cleaning operations and data-quality checks.

The workflow should be reproducible: running it again on the same source dataset with the same configuration should produce consistent results.

## 5. Cleaning Rules and Expected Results

The initial cleaning analysis identified the following operations:

| Issue | Treatment |
|---|---|
| Missing values | Inspect and handle according to the validation results. |
| Data types | Convert `date` to an appropriate date type and preserve `zipcode` as text. |
| Repeated sales records | For repeated `id` values, retain the most recent sale according to the defined cleaning rule. |
| Invalid bedroom or bathroom values | Remove records with zero bedrooms and zero bathrooms, according to the project's cleaning criteria. |
| Implausible bedroom count | Remove the identified record containing 33 bedrooms in a 1,620-square-foot living area. |
| Renovation information | Replace `yr_renovated` with a binary `renovated` indicator. |
| Unnecessary columns | Remove columns excluded by the agreed modeling requirements. |

The initial cleaning notebook reported a reduction from **21,613 rows and 21 columns to 21,428 rows and 15 columns**.

These figures are reference results from the initial workflow. They should be verified against the current implementation and generated output before being treated as final.

Extreme house prices and large properties should not automatically be removed. Outlier treatment must be justified by data-quality evidence and the project's modeling objectives.

## 6. Cleaned Dataset

The cleaned dataset is expected at:

```text
data/processed/house_clean.csv
```

Other team members can load it with pandas:

```python
import pandas as pd

df = pd.read_csv(
    "data/processed/house_clean.csv",
    dtype={"zipcode": str}
)

print(df.shape)
print(df.head())
print(df.dtypes)
```

Preserving `zipcode` as text is important because it represents a geographic identifier rather than a numerical measurement.

The final output should contain the features agreed upon by the team. The original workflow retained these columns:

- `price`
- `bedrooms`
- `bathrooms`
- `sqft_living`
- `sqft_lot`
- `floors`
- `waterfront`
- `view`
- `condition`
- `grade`
- `sqft_above`
- `sqft_basement`
- `yr_built`
- `zipcode`
- `renovated`

Any changes to this schema should be communicated to the team members responsible for feature engineering and model training.

## 7. Data Validation

The validation module should check the following properties before the cleaned dataset is accepted:

- The output file exists and can be loaded.
- The dataset has the expected columns and data types.
- Required fields do not contain unexpected missing values.
- Duplicate records are handled according to the defined rules.
- Numeric features contain valid values according to documented constraints.
- `zipcode` is stored as text.
- The number of rows and columns is consistent with the cleaning report.
- The cleaned dataset is not empty.

Validation results should be recorded in `reports/data_quality_report.csv`, while the cleaning process and its principal outcomes should be summarized in `reports/cleaning_report.json`.

## 8. Reports

### `cleaning_report.json`

This report should document the cleaning process, including:

- Original and final dataset dimensions.
- Cleaning operations applied.
- Number of records removed or modified, where measurable.
- Output dataset path.
- Execution status and relevant configuration.

### `data_quality_report.csv`

This report should provide structured validation results, such as:

- Column names and data types.
- Missing-value counts.
- Duplicate counts.
- Basic numerical statistics.
- Validation rules and their pass/fail status.

The reports must reflect the actual execution results rather than hard-coded assumptions.

## 9. Run the Notebooks

From the `Data_cleaning/` directory, start Jupyter:

```bash
jupyter notebook
```

Open and execute the notebooks in this order:

1. `notebooks/01_data_exploration.ipynb`
2. `notebooks/02_data_cleaning.ipynb`

Use **Kernel → Restart Kernel and Run All Cells** to execute each notebook from beginning to end.

Run the notebooks in the documented order so that the exploration informs the cleaning decisions and the cleaned dataset is generated before downstream use.

## 10. Collaboration and Handover

This module provides the data foundation for the rest of the project.

- **Data cleaning:** Produces the cleaned dataset and documents quality-related decisions.
- **Feature engineering and labeling:** Uses the cleaned dataset to construct the target classes for house-price classification.
- **Model development:** Uses the agreed dataset schema to train and evaluate the classification model.
- **Frontend and API integration:** Consumes model outputs and the input schema agreed upon by the team.

Changes to column names, data types, or the output schema should be communicated before the cleaned dataset is replaced.

## 11. Best Practices

- Never modify the original dataset in `data/raw/`.
- Keep cleaning operations reusable and documented.
- Use relative paths rather than machine-specific absolute paths.
- Validate the dataset before exporting it.
- Keep generated reports consistent with the actual output.
- Avoid fitting imputation, scaling, or other data-dependent transformations on the entire dataset before splitting it into training and test sets.
- Do not commit virtual environments or unnecessary temporary files to Git.

## 12. Module Deliverables

The principal deliverables of M1 are:

1. An exploratory data-analysis notebook.
2. A reproducible data-cleaning notebook.
3. Reusable Python cleaning, validation, and preprocessing modules.
4. A validated cleaned dataset.
5. A cleaning report and a data-quality report.
6. Documentation explaining the workflow and how other team members can use its output.

---

**Module status:** The directory structure defines the intended organization. The module is complete when the notebooks, Python functions, cleaned dataset, and reports have been implemented, executed, and validated.
