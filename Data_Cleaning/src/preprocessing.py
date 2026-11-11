"""Model-side feature preparation for the house price classifier."""

import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler


TARGET_DERIVED_COLUMNS = ('price', 'price_per_sqft')


def prepare_features(
	df: pd.DataFrame,
	*,
	target_column: str | None = None,
) -> pd.DataFrame:
	"""Return model inputs without price or features derived from price."""
	excluded = set(TARGET_DERIVED_COLUMNS)
	if target_column is not None:
		excluded.add(target_column)
	return df.drop(columns=[column for column in excluded if column in df.columns]).copy()


def build_preprocessor(features: pd.DataFrame) -> ColumnTransformer:
	"""Build imputing/scaling and categorical encoding steps from feature dtypes."""
	if features.empty or features.shape[1] == 0:
		raise ValueError('features must contain at least one row and one column.')
	leakage_columns = [
		column for column in TARGET_DERIVED_COLUMNS if column in features.columns
	]
	if leakage_columns:
		raise ValueError(
			'Remove target-derived columns before preprocessing: '
			+ ', '.join(leakage_columns)
		)

	categorical_columns = features.select_dtypes(
		include=['object', 'string', 'category', 'bool']
	).columns.tolist()
	if 'zipcode' in features.columns and 'zipcode' not in categorical_columns:
		categorical_columns.append('zipcode')
	numeric_columns = [
		column
		for column in features.select_dtypes(include='number').columns
		if column not in categorical_columns
	]
	unsupported = [
		column
		for column in features.columns
		if column not in categorical_columns and column not in numeric_columns
	]
	if unsupported:
		raise TypeError(f'Unsupported feature types: {", ".join(unsupported)}')

	transformers = []
	if numeric_columns:
		transformers.append((
			'numeric',
			Pipeline([
				('imputer', SimpleImputer(strategy='median')),
				('scaler', StandardScaler()),
			]),
			numeric_columns,
		))
	if categorical_columns:
		transformers.append((
			'categorical',
			Pipeline([
				('imputer', SimpleImputer(strategy='most_frequent')),
				('encoder', OneHotEncoder(handle_unknown='ignore')),
			]),
			categorical_columns,
		))

	return ColumnTransformer(transformers, remainder='drop')


def build_pipeline(estimator, features: pd.DataFrame) -> Pipeline:
	"""Combine preprocessing with a scikit-learn classifier or estimator."""
	return Pipeline([
		('preprocessor', build_preprocessor(features)),
		('estimator', estimator),
	])
