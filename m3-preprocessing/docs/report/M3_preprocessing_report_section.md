# Prétraitement, baseline et cadre d'évaluation (section du rapport — M3)

## 1. Objectif

Le module M3 prépare les données étiquetées par M2 pour l'apprentissage automatique et fournit à toute l'équipe un cadre commun : séparation train/test reproductible, préprocesseurs adaptés à chaque famille de modèles, baseline Zero-R, fonction d'évaluation unique (`evaluate_model`), outil d'optimisation (`tune_model`) et fichier `feature_schema.json` pour l'application web. Les cinq familles de modèles imposées sont : Zero-R (baseline), K-NN, arbres de décision / Random Forest, Naïve Bayes (GaussianNB et MultinomialNB) et SVM.

## 2. Données d'entrée

Le fichier `house_labeled.csv` (M2) contient 21 428 logements et 16 colonnes : 15 variables d'origine et la cible `price_category` (4 classes). Les vérifications du notebook confirment : aucune valeur manquante, 5 lignes dupliquées (déjà signalées par M2) et aucune colonne auxiliaire dans le fichier. Aucune ligne n'a été supprimée ou modifiée.

`zipcode` est un identifiant géographique et non une quantité : il est lu comme texte (`dtype=str`) puis encodé en one-hot. Le traiter comme un nombre ferait croire au modèle que 98199 est « plus grand » que 98001.

## 3. Variables d'entrée et cible

- **y** : `price_category` (0 : moins cher que la moyenne, 1 : prix raisonnable, 2 : trop cher, 3 : beaucoup trop cher).
- **X** : les 15 variables d'origine, **prix demandé (`price`) inclus** : 14 numériques (`price`, `bedrooms`, `bathrooms`, `sqft_living`, `sqft_lot`, `floors`, `waterfront`, `view`, `condition`, `grade`, `sqft_above`, `sqft_basement`, `yr_built`, `renovated`) et 1 catégorielle (`zipcode`, 70 modalités).
- **Colonnes exclues** : `price_per_sqft`, `size_bucket`, `peer_median`, `peer_level`, `ratio`. Elles ont servi à construire la cible ; les donner au modèle reviendrait à lui fournir la réponse. Une assertion dans `split_xy()` interdit leur présence dans X.

## 4. Séparation train / test

La séparation est faite par `train_test_split(test_size=0.2, stratify=y, random_state=42)` **avant** tout ajustement de transformation, afin qu'aucune statistique du jeu de test (médiane, moyenne, écart-type, modalités) ne passe dans l'entraînement. Le découpage stratifié conserve les proportions de classes (figure `m3_split_distribution.png`) :

| Classe | Global | Train (17 142) | Test (4 286) |
|---|---|---|---|
| 0 — Cheaper than average | 19,02 % | 19,02 % | 19,02 % |
| 1 — Reasonable price | 58,61 % | 58,61 % | 58,61 % |
| 2 — Over priced | 15,99 % | 15,99 % | 15,98 % |
| 3 — Too over priced | 6,38 % | 6,38 % | 6,39 % |

La stratification est importante car la classe 3 est minoritaire : sans elle, le jeu de test pourrait contenir trop peu d'exemples de cette classe pour une évaluation fiable. Les quatre fichiers `X_train.csv`, `X_test.csv`, `y_train.csv` et `y_test.csv` sont sauvegardés (l'index correspond à la ligne de `house_labeled.csv`).

## 5. Prétraitement

Un `ColumnTransformer` unique (`get_preprocessor`) traite séparément les deux types de variables :

- **Numériques** : imputation par la médiane (`SimpleImputer`) puis, selon le modèle, aucune mise à l'échelle, une standardisation Z-score ou une normalisation Min-Max. L'imputation ne modifie rien ici (aucune valeur manquante) mais elle protège le pipeline si l'application web reçoit une valeur absente.
- **Catégorielle (`zipcode`)** : imputation par la valeur la plus fréquente puis `OneHotEncoder(handle_unknown="ignore")`. Un code postal absent de l'entraînement produit un vecteur nul au lieu d'une erreur (testé avec le code 99999). La sortie est dense pour être compatible avec GaussianNB.

Après transformation, chaque logement est décrit par 84 colonnes (14 numériques + 70 colonnes de `zipcode`).

Le choix de la mise à l'échelle dépend de la nature de chaque algorithme :

| Modèle | Mise à l'échelle | Justification |
|---|---|---|
| Zero-R, Decision Tree, Random Forest | Aucune | Les arbres font des comparaisons par seuil, invariantes à l'échelle |
| GaussianNB | Aucune | Ajuste une loi normale par variable et par classe |
| MultinomialNB | Min-Max [0, 1] | Exige des valeurs positives ou nulles ; lissage de Laplace (`alpha=1`) |
| K-NN, SVM | Z-score | Basés sur des distances : `price` (jusqu'à 7,7 M) écraserait les variables à petite échelle comme `condition` (1 à 5) |

Les valeurs vérifiées dans le notebook : après Z-score les variables numériques ont une moyenne de 0 ; après Min-Max elles sont comprises entre 0 et 1. Le Z-score laisse apparaître des valeurs extrêmes (jusqu'à environ 39 écarts-types, dues aux valeurs aberrantes de `price` et `sqft_lot`) ; la consigne du projet interdit de supprimer des observations sans décision collective documentée, elles sont donc conservées.

## 6. Baseline Zero-R

Zero-R (`DummyClassifier(strategy="most_frequent")`) prédit toujours la classe 1. Résultats sur le jeu de test :

| Métrique | Valeur |
|---|---|
| Exactitude | 0,586 |
| Précision macro | 0,147 |
| Rappel macro | 0,250 |
| **F1 macro** | **0,185** |
| ROC-AUC (un-contre-tous) | 0,500 |
| Validation croisée 5 plis (exactitude) | 0,586 ± 0,000 |

Zero-R ne reconnaît jamais les classes 0, 2 et 3. Son exactitude de 58,6 % correspond exactement à la proportion de la classe majoritaire : c'est le niveau minimal à dépasser. Comme les classes sont déséquilibrées, l'exactitude seule est trompeuse ; **le F1 macro (moyenne des F1 de chaque classe) est la métrique principale** car il donne le même poids à la classe 3 qu'aux autres. Zero-R n'a aucun hyperparamètre et est donc exempté de la recherche d'optimisation.

## 7. Méthodologie d'évaluation

La fonction `evaluate_model()` est identique pour tous les modèles afin que les résultats soient comparables. Elle rapporte :

- **Exactitude, précision, rappel et F1** (moyennes macro) ainsi que le rapport de classification par classe ;
- **Matrice de confusion** avec heatmap, pour voir quelles classes sont confondues (en particulier entre classes voisines) ;
- **Courbes ROC et AUC** en approche un-contre-tous (une courbe par classe, AUC macro). Les scores viennent de `predict_proba` ou, pour le SVM, de `decision_function` ;
- **Validation croisée stratifiée** à 5 plis (`StratifiedKFold`, mélange, `random_state=42`) sur le jeu d'entraînement uniquement : moyenne et écart-type de l'exactitude et du F1 macro. Un écart-type faible indique un modèle stable.

Le jeu de test n'est utilisé qu'une fois par modèle, pour la mesure finale ; les choix d'hyperparamètres se font par validation croisée sur le train.

Pour l'optimisation, `tune_model()` encapsule `GridSearchCV` (ou `RandomizedSearchCV`) avec validation croisée stratifiée à K = 5 au minimum (garanti par une assertion) et le F1 macro comme critère. Des grilles de départ sont fournies pour chaque modèle (`PARAM_GRIDS` : nombre de voisins, métrique et poids pour K-NN ; critère, profondeur et tailles minimales pour l'arbre ; nombre d'arbres pour la forêt ; `alpha` et `var_smoothing` pour Naïve Bayes ; `C`, noyau et `gamma` pour le SVM). Les modèles sont construits dans un `Pipeline` (préprocesseur + estimateur) : le préprocesseur est donc ré-ajusté à l'intérieur de chaque pli, ce qui évite toute fuite pendant la validation croisée. Un test sur K-NN (grille réduite) a confirmé le bon fonctionnement de l'outil.

## 8. Validation du cadre sur les cinq familles de modèles

Chaque famille a été lancée avec ses **paramètres par défaut** (sans optimisation) afin de vérifier que le préprocesseur et `evaluate_model()` fonctionnent pour toutes. Ces valeurs ne constituent pas la comparaison finale : elles seront remplacées par les résultats après optimisation.

| Modèle | Exactitude | F1 macro | ROC-AUC (OvR) | CV exactitude | CV F1 macro |
|---|---|---|---|---|---|
| Zero-R | 0,586 | 0,185 | 0,500 | 0,586 ± 0,000 | 0,185 ± 0,000 |
| K-NN | 0,599 | 0,439 | 0,730 | 0,604 ± 0,005 | 0,440 ± 0,012 |
| Decision Tree | 0,678 | 0,604 | 0,732 | 0,657 ± 0,010 | 0,574 ± 0,006 |
| Random Forest | 0,702 | 0,563 | 0,877 | 0,694 ± 0,007 | 0,550 ± 0,013 |
| GaussianNB | 0,596 | 0,331 | 0,697 | 0,587 ± 0,007 | 0,320 ± 0,009 |
| MultinomialNB | 0,592 | 0,261 | 0,658 | 0,594 ± 0,001 | 0,265 ± 0,010 |
| SVM (RBF) | 0,711 | 0,557 | 0,869 | 0,700 ± 0,006 | 0,536 ± 0,013 |

(figures : `m3_default_models_comparison.png`, `m3_eval_zero_r.png`, `m3_eval_svm_defaut.png`)

Observations à confirmer après optimisation :
- Tous les modèles dépassent Zero-R en F1 macro, mais les deux Naïve Bayes et K-NN dépassent à peine l'exactitude de Zero-R : leurs hypothèses (indépendance des variables, distance en 84 dimensions dont 70 issues de `zipcode`) conviennent mal à cette cible.
- Random Forest et SVM ont la meilleure exactitude et de loin le meilleur ROC-AUC (environ 0,87), mais leur rappel macro (environ 0,51) est plus faible que celui de l'arbre (0,60) : ils prédisent mieux la classe majoritaire et reconnaissent moins bien les classes 2 et 3. L'arbre par défaut obtient le meilleur F1 macro, probablement parce qu'il apprend directement la règle de construction (seuil sur le rapport prix / surface par zone). Un arbre sans limite de profondeur peut aussi surapprendre ; l'optimisation permettra de trancher.
- L'écart entre les scores de validation croisée et de test est faible (au plus 3 points), ce qui indique que la séparation est cohérente.

## 9. Fichier `feature_schema.json`

Ce fichier, généré par `build_feature_schema()`, est le contrat entre le modèle, le serveur (M5) et le formulaire (M6). Il contient : l'ordre exact des 15 colonnes d'entrée, les minima, maxima et médianes des variables numériques (avec l'indication « entier »), les 70 valeurs de `zipcode`, les noms des quatre classes, les unités (prix en USD, surfaces en pieds carrés), la règle « prix obligatoire et strictement positif » et la liste des colonnes interdites. La fonction `prepare_input()` convertit un enregistrement brut (JSON ou CSV) dans ce format (ordre des colonnes, `zipcode` en texte) et signale clairement les colonnes manquantes. Un test de bout en bout (un logement décrit en JSON, passé dans un pipeline entraîné) a été réalisé dans le notebook ; en doublant le prix du même logement, la catégorie prédite passe de « Cheaper than average » à « Too over priced », comme attendu.

## 10. Limites

- **Fuite de la règle de construction** : `price`, `sqft_living` et `zipcode` sont à la fois des variables d'entrée et les ingrédients de la cible. Les scores élevés reflètent donc en partie la règle écrite par M2, pas une compréhension du marché (voir section 7 du rapport M2).
- **Classe 3 minoritaire** (6,4 %, 274 logements dans le test) : les métriques de cette classe ont une variance plus élevée. Les modèles acceptant `class_weight="balanced"` (arbre, forêt, SVM) devraient être testés.
- **`zipcode` en one-hot pour K-NN et SVM** : 70 colonnes binaires pèsent fortement dans les distances ; à commenter lors de l'analyse des résultats.
- **Valeurs aberrantes conservées** (`price`, `sqft_lot`) : elles influencent le Z-score ; un `RobustScaler` pourrait être testé.
- **Doublons et valeurs atypiques** (5 doublons, 6 logements à 0 chambre, 3 à 0 salle de bain) : non traités, conformément à la consigne de ne pas modifier le jeu sans décision collective.
- Les résultats de la section 8 sont ceux de modèles non optimisés.

## 11. Fichiers produits (dossier `m3-preprocessing/`)

- `notebook/m3-preprocessing.ipynb` : code complet avec résultats
- `src/m3_tools.py` : fonctions partagées (`load_labeled`, `split_xy`, `prepare_input`, `get_preprocessor`, `MODEL_ZOO`, `make_model_pipeline`, `evaluate_model`, `results_table`, `PARAM_GRIDS`, `tune_model`, `build_feature_schema`)
- `data/split/` : `X_train.csv`, `X_test.csv`, `y_train.csv`, `y_test.csv`
- `model/feature_schema.json`
- `docs/figures/preprocessing/` : figures de ce rapport
- `docs/m3_default_models_summary.csv` : tableau de la section 8
- `requirements.txt` (scikit-learn 1.9.1) et `README.md`
