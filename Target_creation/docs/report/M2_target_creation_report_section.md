# Création de la cible `price_category` (section du rapport — M2)

## 1. Objectif

Le jeu de données (King County, 21 428 logements après nettoyage) contient le prix demandé de chaque logement, mais aucune information indiquant si ce prix est raisonnable. Un classifieur supervisé a besoin d'une réponse connue pour chaque exemple : nous avons donc construit une cible à quatre classes, `price_category`, qui compare le prix d'un logement à celui de logements comparables.

- Classe 0 : moins cher que la moyenne
- Classe 1 : prix raisonnable
- Classe 2 : trop cher
- Classe 3 : beaucoup trop cher

## 2. Méthode

1. Prix comparable : prix au pied carré = `price` / `sqft_living`.
2. Groupes de comparaison (pairs) : même code postal (`zipcode`, 70 zones) et même tranche de surface (3 tranches de même effectif, obtenues avec `pd.qcut`). On obtient 210 groupes, de 3 à 343 logements (médiane : 85).
3. Médiane du prix au pied carré de chaque groupe. Si un groupe compte moins de 30 logements (15 groupes, soit 254 logements, 1,2 %), on utilise la médiane de son code postal. Aucun code postal ne compte moins de 30 logements, donc le repli sur la médiane globale n'a jamais été nécessaire.
4. Ratio = prix au pied carré du logement / médiane de son groupe. Un ratio de 1,00 signifie un prix au niveau de ses semblables.
5. Classes définies par les seuils 0,85 / 1,15 / 1,40 appliqués au ratio.

## 3. Choix des groupes de comparaison

Les groupes ont été choisis à partir de mesures sur les données :
- Le code postal est le facteur principal : à lui seul, il explique environ 61 % de la variance du logarithme du prix au pied carré. Ajouter 3 tranches de surface porte ce chiffre à environ 67 %.
- La taille joue surtout pour les petites maisons : le prix au pied carré médian est de 282 pour les logements de 370 à 1 584 pieds carrés, de 227 pour ceux de 1 590 à 2 310 et de 235 au-delà. Trois tranches suffisent donc.
- 4 tranches porteraient la part de logements dans un groupe de moins de 30 de 1,2 % à 3,7 % pour un gain d'environ 1 point de variance expliquée.
- Le nombre de chambres a été écarté : avec 951 groupes, 25,3 % des logements se retrouveraient dans un groupe de moins de 30, trop petit pour une médiane fiable. Le gain apparent (environ 70 %) est de toute façon mécanique, car la variance expliquée croît avec le nombre de groupes.

## 4. Choix des seuils

- Un prix est jugé raisonnable lorsqu'il s'écarte d'au plus 15 % de la médiane de ses pairs (seuils 0,85 et 1,15). La moitié centrale des ratios se situe entre 0,885 et 1,129 : la bande de plus ou moins 15 % couvre donc un peu plus que le cœur de la distribution.
- Le seuil 1,40 sépare « trop cher » de « beaucoup trop cher » : il correspond au 93,6e percentile du ratio et laisse 1 367 logements à la classe 3, assez pour qu'un modèle puisse l'apprendre.
- Ces seuils sont un choix de conception, pas une vérité mesurée. Une analyse de sensibilité donne, pour la répartition des quatre classes : 12,5 / 70,6 / 12,8 / 4,1 % avec les seuils 0,80 / 1,20 / 1,50 ; 19,0 / 58,6 / 12,2 / 10,2 % avec 0,85 / 1,15 / 1,30 ; 27,9 / 42,6 / 19,4 / 10,2 % avec 0,90 / 1,10 / 1,30.

## 5. Résultat

Répartition obtenue (figure `docs/figures/target/m2_class_distribution.png`, distribution du ratio dans `m2_ratio_distribution.png`) :
- Classe 0 : 4 076 logements (19,0 %)
- Classe 1 : 12 559 logements (58,6 %)
- Classe 2 : 3 426 logements (16,0 %)
- Classe 3 : 1 367 logements (6,4 %)

La classe 3 est minoritaire mais pas rare. Un classifieur qui prédit toujours la classe majoritaire (Zero-R) obtient donc environ 58,6 % d'exactitude : c'est la référence à dépasser. Comme les classes sont déséquilibrées, le F1 macro est plus informatif que l'exactitude seule.

## 6. Vérifications

- Variation du prix seul : pour un même logement, la classe passe de 0 (prix multiplié par 0,6) à 3 (prix multiplié par 1,5) et ne diminue jamais quand le prix augmente.
- Variation de la surface à prix égal : une surface plus petite donne un prix au pied carré plus élevé donc une classe plus chère, et une surface plus grande une classe moins chère ou égale. Ce test garde la médiane du groupe fixe : il vérifie le sens de la règle, pas une prédiction du modèle.
- Aucune colonne auxiliaire (ratio, médiane du groupe, prix au pied carré, tranche de surface) n'est présente dans le fichier étiqueté, ce qu'une assertion du notebook vérifie. Elles sont conservées à part dans `target_helpers.csv`.

## 7. Limites

- Fuite possible de la règle de construction : le modèle reçoit `price`, `sqft_living` et `zipcode`, qui servent aussi à construire la cible. Un score élevé reflète donc en partie la règle que nous avons écrite et non une compréhension du marché. Un contrôle indicatif (notebook, section 9 bis) entraîne un arbre de profondeur 12 sur le découpage 80/20 stratifié du projet : avec `price`, il atteint 66,9 % d'exactitude (F1 macro 0,543) ; sans `price`, 58,8 % (F1 macro 0,398). L'exactitude retombe ainsi au niveau de Zero-R (58,6 %), mais le F1 macro reste supérieur à celui de Zero-R (0,185) : le prix porte l'essentiel du signal, mais pas tout. Ce contrôle code `zipcode` comme un entier ; ses valeurs sont indicatives, pas une borne. Ce n'est pas le modèle final, qui reste le travail de M4.
- La qualité du bien n'entre pas dans les groupes : les logements en bord d'eau (163 logements, 0,76 %) ont un ratio médian de 2,03, ceux avec la meilleure vue de 1,56, et le ratio médian monte aux deux extrémités de la note de construction (1,88 pour le grade 3, 1,28 pour le grade 12). Ces logements sont donc souvent classés « trop chers » même quand leur prix se justifie.
- La médiane d'un groupe inclut le logement évalué lui-même ; l'effet est faible avec des groupes de plusieurs dizaines de logements.
- La classe 3 compte 6,4 % des logements : le choix des seuils influence directement sa taille (voir la sensibilité ci-dessus).

## 8. Données signalées à l'équipe

Aucune ligne n'a été supprimée ni modifiée. Le notebook signale pour M1 et M3 : 5 lignes dupliquées, 6 logements à 0 chambre et 3 à 0 salle de bain.

## 9. Fichiers produits (dossier `Target_creation/`)

- `notebooks/M2_target_creation.ipynb` : le code complet, avec ses résultats
- `data/labeled/house_labeled.csv` : variables d'origine et `price_category`
- `data/labeled/target_helpers.csv` : colonnes auxiliaires, à ne jamais donner au modèle
- `data/labeled/target_definition.md` : documentation de la cible
- `data/labeled/feature_options.json` : valeurs et plages pour le formulaire et le serveur
- `data/labeled/example_houses.csv` et `example_houses_explained.csv` : exemples pour la démonstration
- `data/labeled/price_dependency_check.csv` : contrôle indicatif de la dépendance au prix
- `docs/figures/target/` : `m2_ratio_distribution.png` et `m2_class_distribution.png`
- `docs/report/` : cette section et le rapport PDF
