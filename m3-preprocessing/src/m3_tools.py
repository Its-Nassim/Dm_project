"""
m3_tools.py - Outils partages du module M3 (pretraitement + evaluation).

Utilisation depuis un autre notebook (M4, M5, ...), en supposant que le dossier
m3-preprocessing/src est accessible :

    import sys; sys.path.insert(0, "../m3-preprocessing/src")
    from m3_tools import *
    df = load_labeled("../m3-preprocessing/data/labeled/house_labeled.csv")
    X, y = split_xy(df)
    pipe = make_model_pipeline("KNN")
    res = evaluate_model(pipe, X_train, y_train, X_test, y_test, name="KNN")
"""
import re
from pathlib import Path

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.base import clone
from sklearn.compose import ColumnTransformer
from sklearn.dummy import DummyClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import (accuracy_score, auc, classification_report,
                             confusion_matrix, f1_score, precision_score,
                             recall_score, roc_curve)
from sklearn.model_selection import (GridSearchCV, RandomizedSearchCV,
                                     StratifiedKFold, cross_validate)
from sklearn.naive_bayes import GaussianNB, MultinomialNB
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import (MinMaxScaler, OneHotEncoder, StandardScaler,
                                   label_binarize)
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier

RANDOM_STATE = 42
TARGET = "price_category"
HELPER_COLUMNS = ["price_per_sqft", "size_bucket", "peer_median", "peer_level", "ratio"]
CATEGORICAL = ["zipcode"]
LABELS = {0: "Cheaper than average", 1: "Reasonable price",
          2: "Over priced", 3: "Too over priced"}

# Ordre exact des colonnes d'entree (identique a house_labeled.csv sans la cible)
FEATURE_ORDER = ["price", "bedrooms", "bathrooms", "sqft_living", "sqft_lot", "floors",
                 "waterfront", "view", "condition", "grade", "sqft_above",
                 "sqft_basement", "yr_built", "zipcode", "renovated"]
NUMERICAL = [c for c in FEATURE_ORDER if c not in CATEGORICAL]


# --------------------------------------------------------------------------- #
# Chargement
# --------------------------------------------------------------------------- #
def load_labeled(path):
    """Charge house_labeled.csv (zipcode lu comme texte : c'est un identifiant)."""
    return pd.read_csv(path, dtype={"zipcode": str})


def split_xy(df):
    """Retourne X (variables permises, prix demande inclus) et y (price_category)."""
    leaked = [c for c in HELPER_COLUMNS if c in df.columns]
    X = df.drop(columns=[TARGET] + leaked)[FEATURE_ORDER].copy()
    y = df[TARGET].astype(int).copy()
    assert not set(HELPER_COLUMNS) & set(X.columns), "Colonne auxiliaire dans X !"
    return X, y


def prepare_input(df):
    """Met un DataFrame brut (formulaire / CSV) dans le format attendu :
    colonnes dans le bon ordre, zipcode en texte. Leve une erreur claire sinon."""
    missing = [c for c in FEATURE_ORDER if c not in df.columns]
    if missing:
        raise ValueError(f"Colonnes manquantes : {missing}")
    out = df[FEATURE_ORDER].copy()
    zc = out["zipcode"]
    # astype(str) turns NaN into the text "nan" in pandas 2 but keeps it missing in pandas 3;
    # masking keeps a missing zipcode missing so the pipeline's imputer behaves the same everywhere.
    out["zipcode"] = zc.where(zc.isna(), zc.astype(str).str.strip().str.replace(r"\.0$", "", regex=True))
    return out


# --------------------------------------------------------------------------- #
# Pretraitement
# --------------------------------------------------------------------------- #
def get_preprocessor(scale=None):
    """ColumnTransformer de reference.

    scale : None | "standard" | "minmax"   (applique aux variables numeriques)
      - None       : arbres, random forest, Zero-R, GaussianNB
      - "standard" : KNN, SVM (Z-score)
      - "minmax"   : MultinomialNB (valeurs >= 0 obligatoires)
    Sortie dense (necessaire pour GaussianNB).
    """
    num_steps = [("imputer", SimpleImputer(strategy="median"))]
    if scale == "standard":
        num_steps.append(("scaler", StandardScaler()))
    elif scale == "minmax":
        num_steps.append(("scaler", MinMaxScaler()))
    elif scale is not None:
        raise ValueError("scale doit etre None, 'standard' ou 'minmax'")

    cat_steps = [("imputer", SimpleImputer(strategy="most_frequent")),
                 ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False))]

    return ColumnTransformer([("num", Pipeline(num_steps), NUMERICAL),
                              ("cat", Pipeline(cat_steps), CATEGORICAL)])


# Un modele = (type de mise a l'echelle, fabrique de l'estimateur)
MODEL_ZOO = {
    "Zero-R":        (None,       lambda: DummyClassifier(strategy="most_frequent")),
    "KNN":           ("standard", lambda: KNeighborsClassifier()),
    "Decision Tree": (None,       lambda: DecisionTreeClassifier(random_state=RANDOM_STATE)),
    "Random Forest": (None,       lambda: RandomForestClassifier(random_state=RANDOM_STATE, n_jobs=-1)),
    "GaussianNB":    (None,       lambda: GaussianNB()),
    "MultinomialNB": ("minmax",   lambda: MultinomialNB(alpha=1.0)),   # lissage de Laplace
    "SVM":           ("standard", lambda: SVC(random_state=RANDOM_STATE)),
}


def make_model_pipeline(name):
    """Pipeline complet (pretraitement adapte + modele) pour un nom de MODEL_ZOO."""
    scale, factory = MODEL_ZOO[name]
    return Pipeline([("prep", get_preprocessor(scale)), ("clf", factory())])


# --------------------------------------------------------------------------- #
# Evaluation
# --------------------------------------------------------------------------- #
def _scores(model, X):
    if hasattr(model, "predict_proba"):
        return model.predict_proba(X)
    if hasattr(model, "decision_function"):
        return model.decision_function(X)
    return None


def evaluate_model(model, X_train, y_train, X_test, y_test, name="model", cv=5,
                   plot=True, save_dir=None, verbose=True):
    """Entraine `model` sur le train, l'evalue sur le test et en validation croisee.

    Rapporte : accuracy, precision/recall/F1 macro, F1 pondere, ROC-AUC (one-vs-rest,
    macro), rapport de classification, matrice de confusion (+ heatmap), courbes ROC
    et moyenne +- ecart-type de la validation croisee stratifiee (cv >= 5).
    Retourne un dictionnaire de resultats (le modele ajuste est dans res["model"]).
    """
    classes = sorted(y_train.unique())
    skf = StratifiedKFold(n_splits=cv, shuffle=True, random_state=RANDOM_STATE)
    cvres = cross_validate(clone(model), X_train, y_train, cv=skf, n_jobs=-1,
                           scoring={"acc": "accuracy", "f1": "f1_macro"})

    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    cm = confusion_matrix(y_test, y_pred, labels=classes)

    # ROC-AUC un-contre-tous, calcule a partir des scores (probas ou decision_function)
    scores = _scores(model, X_test)
    roc_auc, fpr, tpr = {}, {}, {}
    if scores is not None:
        y_bin = label_binarize(y_test, classes=classes)
        for i, c in enumerate(classes):
            fpr[c], tpr[c], _ = roc_curve(y_bin[:, i], scores[:, i])
            roc_auc[c] = auc(fpr[c], tpr[c])

    res = {
        "model_name": name,
        "accuracy": accuracy_score(y_test, y_pred),
        "precision_macro": precision_score(y_test, y_pred, average="macro", zero_division=0),
        "recall_macro": recall_score(y_test, y_pred, average="macro", zero_division=0),
        "f1_macro": f1_score(y_test, y_pred, average="macro", zero_division=0),
        "f1_weighted": f1_score(y_test, y_pred, average="weighted", zero_division=0),
        "roc_auc_macro_ovr": float(np.mean(list(roc_auc.values()))) if roc_auc else np.nan,
        "roc_auc_per_class": roc_auc,
        "cv_accuracy_mean": cvres["test_acc"].mean(), "cv_accuracy_std": cvres["test_acc"].std(),
        "cv_f1_macro_mean": cvres["test_f1"].mean(), "cv_f1_macro_std": cvres["test_f1"].std(),
        "confusion_matrix": cm,
        "report": classification_report(
            y_test, y_pred, labels=classes, zero_division=0,
            target_names=[LABELS[c] for c in classes]),
        "model": model,
    }

    if verbose:
        print(f"===== {name} =====")
        print(f"Accuracy          : {res['accuracy']:.4f}")
        print(f"Precision (macro) : {res['precision_macro']:.4f}")
        print(f"Recall (macro)    : {res['recall_macro']:.4f}")
        print(f"F1 macro          : {res['f1_macro']:.4f}")
        print(f"ROC-AUC (OvR)     : {res['roc_auc_macro_ovr']:.4f}")
        print(f"CV ({cv}-fold) acc  : {res['cv_accuracy_mean']:.4f} +- {res['cv_accuracy_std']:.4f}")
        print(f"CV ({cv}-fold) F1M  : {res['cv_f1_macro_mean']:.4f} +- {res['cv_f1_macro_std']:.4f}")
        print(res["report"])

    if plot:
        fig, axes = plt.subplots(1, 2, figsize=(13, 5))
        names = [LABELS[c] for c in classes]
        sns.heatmap(cm, annot=True, fmt="d", cmap="Blues", cbar=False, ax=axes[0],
                    xticklabels=names, yticklabels=names)
        axes[0].set_title(f"Matrice de confusion - {name}")
        axes[0].set_xlabel("Predit"); axes[0].set_ylabel("Reel")
        axes[0].tick_params(axis="x", rotation=30)
        for c in classes:
            if c in fpr:
                axes[1].plot(fpr[c], tpr[c], label=f"{LABELS[c]} (AUC={roc_auc[c]:.2f})")
        axes[1].plot([0, 1], [0, 1], "k--", lw=1)
        axes[1].set_title(f"Courbes ROC (un-contre-tous) - {name}")
        axes[1].set_xlabel("Taux de faux positifs"); axes[1].set_ylabel("Taux de vrais positifs")
        axes[1].legend(loc="lower right", fontsize=8)
        plt.tight_layout()
        if save_dir:
            Path(save_dir).mkdir(parents=True, exist_ok=True)
            safe = re.sub(r"[^a-z0-9]+", "_", name.lower()).strip("_")
            fig.savefig(Path(save_dir) / f"m3_eval_{safe}.png", dpi=130, bbox_inches="tight")
        plt.show()
    return res


def results_table(results):
    """Tableau comparatif multicritere a partir d'une liste de resultats evaluate_model."""
    cols = ["model_name", "accuracy", "precision_macro", "recall_macro", "f1_macro",
            "roc_auc_macro_ovr", "cv_accuracy_mean", "cv_accuracy_std",
            "cv_f1_macro_mean", "cv_f1_macro_std"]
    return pd.DataFrame([{k: r[k] for k in cols} for r in results]).set_index("model_name").round(4)


# --------------------------------------------------------------------------- #
# Optimisation (rubrique 1.4 : GridSearchCV / RandomizedSearchCV, K-Fold K >= 5)
# --------------------------------------------------------------------------- #
# Grilles de depart (prefixe "clf__" car le modele est dans un Pipeline). A ajuster
# par la personne qui regle chaque modele.
PARAM_GRIDS = {
    "KNN": {"clf__n_neighbors": [3, 5, 7, 11, 15, 21],
            "clf__weights": ["uniform", "distance"],
            "clf__metric": ["euclidean", "manhattan"]},
    "Decision Tree": {"clf__criterion": ["gini", "entropy"],
                      "clf__max_depth": [3, 5, 8, 12, 16, None],
                      "clf__min_samples_split": [2, 10, 30],
                      "clf__min_samples_leaf": [1, 5, 15]},
    "Random Forest": {"clf__n_estimators": [100, 200, 400],
                      "clf__max_depth": [8, 12, 16, None],
                      "clf__min_samples_leaf": [1, 3, 5],
                      "clf__max_features": ["sqrt", "log2"]},
    "GaussianNB": {"clf__var_smoothing": np.logspace(-11, -5, 7)},
    "MultinomialNB": {"clf__alpha": [0.01, 0.1, 0.5, 1.0, 2.0, 5.0]},
    # List of grids: gamma is meaningless for the linear kernel, and linear/poly with C=100
    # take several minutes per fit on 17k rows (rbf takes ~15 s whatever C).
    "SVM": [{"clf__kernel": ["rbf"], "clf__C": [0.1, 1, 10, 100], "clf__gamma": ["scale", 0.01, 0.1]},
            {"clf__kernel": ["linear"], "clf__C": [0.1, 1, 10]},
            {"clf__kernel": ["poly"], "clf__C": [0.1, 1, 10], "clf__gamma": ["scale", 0.1]}],
}


def tune_model(name, X_train, y_train, search="grid", cv=5, scoring="f1_macro",
               n_iter=20, n_jobs=-1, param_grid=None):
    """GridSearchCV (ou RandomizedSearchCV) stratifie, K >= 5, score par defaut = F1 macro."""
    assert cv >= 5, "Le bareme exige K >= 5"
    pipe = make_model_pipeline(name)
    grid = param_grid or PARAM_GRIDS[name]
    skf = StratifiedKFold(n_splits=cv, shuffle=True, random_state=RANDOM_STATE)
    if search == "grid":
        s = GridSearchCV(pipe, grid, cv=skf, scoring=scoring, n_jobs=n_jobs)
    else:
        s = RandomizedSearchCV(pipe, grid, n_iter=n_iter, cv=skf, scoring=scoring,
                               n_jobs=n_jobs, random_state=RANDOM_STATE)
    return s.fit(X_train, y_train)


# --------------------------------------------------------------------------- #
# Schema pour le backend / frontend
# --------------------------------------------------------------------------- #
def build_feature_schema(X):
    """Construit le dictionnaire de feature_schema.json (colonnes, plages, categories, labels)."""
    return {
        "target": TARGET,
        "feature_order": list(X.columns),
        "numerical": {c: {"min": float(X[c].min()), "max": float(X[c].max()),
                          "median": float(X[c].median()),
                          "integer": bool(np.allclose(X[c], X[c].round()))}
                      for c in NUMERICAL},
        "categorical": {"zipcode": sorted(X["zipcode"].astype(str).unique().tolist())},
        "dtypes": {"zipcode": "str"},
        "required": list(FEATURE_ORDER),
        "rules": {"price": "obligatoire et > 0"},
        "units": {"price": "USD", "sqft_living": "square feet", "sqft_lot": "square feet",
                  "sqft_above": "square feet", "sqft_basement": "square feet"},
        "labels": {str(k): v for k, v in LABELS.items()},
        "excluded_helper_columns": HELPER_COLUMNS,
    }
