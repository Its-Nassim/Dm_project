# Target Creation Module — House Price Classification

**Module:** M2 — Création de la cible `price_category`
**Entrée :** `Data_cleaning/data/processed/house_clean.csv` (module M1)
**Sortie principale :** `data/labeled/house_labeled.csv`

Chaque logement reçoit une classe de prix (0 à 3) en comparant son prix au pied carré à la médiane de logements comparables (même code postal, même tranche de surface). Rapport complet : `docs/report/M2_target_creation_report.pdf`.

## Structure

```text
Target_creation/
├── data/
│   └── labeled/
│       ├── house_labeled.csv                # variables d'origine + price_category
│       ├── target_helpers.csv               # colonnes auxiliaires (ne jamais donner au modèle)
│       ├── target_definition.md             # définition de la cible, seuils, consignes pour M3 et M4
│       ├── feature_options.json             # valeurs et plages pour M3, M5 et M6
│       ├── example_houses.csv               # logements pour la démonstration
│       ├── example_houses_explained.csv     # les mêmes avec leur ratio et leur groupe
│       └── price_dependency_check.csv       # contrôle indicatif de la dépendance au prix
├── notebooks/
│   └── M2_target_creation.ipynb
├── docs/
│   ├── report/
│   │   ├── M2_target_creation_report.pdf
│   │   └── M2_target_creation_report_section.md
│   └── figures/
│       └── target/
│           ├── m2_ratio_distribution.png
│           └── m2_class_distribution.png
├── requirements.txt
└── README.md
```

## Utilisation

1. Installer les dépendances : `pip install -r requirements.txt`
2. Ouvrir `notebooks/M2_target_creation.ipynb` depuis le dépôt, puis *Restart & Run All*.
   Le notebook retrouve tout seul `Data_cleaning/data/processed/house_clean.csv`.

## Attention (M3, M4, M5, M6)

- Lire le fichier avec `pd.read_csv("house_labeled.csv", dtype={"zipcode": str})` : `zipcode` est un identifiant, pas un nombre.
- Ne jamais utiliser `price_per_sqft`, `size_bucket`, `peer_median`, `peer_level` ni `ratio` comme variables d'entrée.
- Répartition des classes : 19,0 % / 58,6 % / 16,0 % / 6,4 % (classe 3 minoritaire : utiliser `stratify=y` et le F1 macro).
