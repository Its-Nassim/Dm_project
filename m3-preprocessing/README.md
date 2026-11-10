# M3 — Prétraitement, baseline Zero-R et cadre d'évaluation

**Entrée :** `data/labeled/house_labeled.csv` (module M2)
**Sorties :** `data/split/`, `model/feature_schema.json`, `src/m3_tools.py`

## Structure
```text
m3-preprocessing/
├── notebook/m3-preprocessing.ipynb     # tout le travail de M3 (Restart & Run All)
├── src/m3_tools.py                     # fonctions partagées (import par M4/M5/M6...)
├── data/
│   ├── labeled/                        # house_labeled.csv + feature_options.json (copie M2)
│   └── split/                          # X_train / X_test / y_train / y_test (stratifié, rs=42)
├── model/feature_schema.json           # à copier dans model/ à la racine du dépôt
├── docs/
│   ├── figures/preprocessing/          # figures du rapport
│   ├── m3_default_models_summary.csv   # résultats des 5 familles, paramètres par défaut
│   └── report/M3_preprocessing_report_section.md
├── requirements.txt
└── README.md
```

## Utilisation rapide
```python
import sys; sys.path.insert(0, "../m3-preprocessing/src")
from m3_tools import *

df = load_labeled("../m3-preprocessing/data/labeled/house_labeled.csv")   # zipcode en texte
X, y = split_xy(df)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)

pipe = make_model_pipeline("SVM")        # KNN, Decision Tree, Random Forest, GaussianNB, MultinomialNB, SVM, Zero-R
res  = evaluate_model(pipe, X_train, y_train, X_test, y_test, name="SVM")
best = tune_model("SVM", X_train, y_train, search="grid", cv=5)   # GridSearchCV, K>=5, F1 macro
```

## Règles
- Ne jamais mettre `price_per_sqft`, `size_bucket`, `peer_median`, `peer_level`, `ratio` dans X.
- Le prix demandé (`price`) reste une variable d'entrée.
- Toujours `random_state=42` ; même version de scikit-learn pour tous (voir `requirements.txt`).
