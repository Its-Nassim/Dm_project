# Définition de la cible `price_category`

- Jeu de données : 21428 logements.
- Prix comparable : prix au pied carré = `price` / `sqft_living`.
- Groupes de comparaison : `zipcode` x 3 tranches de `sqft_living` (repli sur `zipcode` puis médiane globale si groupe < 30).
- Ratio = prix au pied carré du logement / médiane de son groupe.
- Seuils du ratio : [0.85, 1.15, 1.4]

## Classes
- 0 - Cheaper than average : 4076 logements (19.0 %)
- 1 - Reasonable price : 12559 logements (58.6 %)
- 2 - Over priced : 3426 logements (16.0 %)
- 3 - Too over priced : 1367 logements (6.4 %)

## Justification des seuils
- Bande de plus ou moins 15 % autour de la médiane du groupe = prix raisonnable.
- seuil 0.85 = percentile 19.0, seuil 1.15 = percentile 77.6, seuil 1.4 = percentile 93.6
- Sensibilité (répartition des 4 classes selon d'autres seuils) :
  - [0.85, 1.15, 1.4] : 19.0 % / 58.6 % / 16.0 % / 6.4 %
  - [0.8, 1.2, 1.5] : 12.5 % / 70.6 % / 12.8 % / 4.1 %
  - [0.85, 1.15, 1.3] : 19.0 % / 58.6 % / 12.2 % / 10.2 %
  - [0.9, 1.1, 1.3] : 27.9 % / 42.6 % / 19.4 % / 10.2 %

## Colonnes à exclure des variables d'entrée du modèle
- price_per_sqft, size_bucket, peer_median, peer_level, ratio (voir `target_helpers.csv`)
- `price_category` est la cible (y).

## Chargement : attention à zipcode
`zipcode` est un identifiant, pas un nombre. Charger le fichier avec :
    df = pd.read_csv('house_labeled.csv', dtype={'zipcode': str})
puis l'encoder en one-hot (ne pas le mettre à l'échelle comme une variable numérique).

## Remarque
Le modèle reçoit `price`, `sqft_living` et `zipcode`, qui servent aussi à construire la cible : un score élevé reflète en partie la règle de construction.