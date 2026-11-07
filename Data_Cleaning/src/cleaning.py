"""Reusable transformations matching notebooks/02_data_cleaning.ipynb."""

import pandas as pd


RAW_REQUIRED_COLUMNS = (
	'id',
	'date',
	'price',
	'bedrooms',
	'bathrooms',
	'sqft_living',
	'yr_renovated',
	'zipcode',
)

METADATA_COLUMNS = (
	'id',
	'date',
	'lat',
	'long',
	'sqft_living15',
	'sqft_lot15',
	'yr_renovated',
)


def _require_columns(df: pd.DataFrame, columns: tuple[str, ...]) -> None:
	missing = [column for column in columns if column not in df.columns]
	if missing:
		raise ValueError(f'Missing required columns: {", ".join(missing)}')


def fix_types(df: pd.DataFrame) -> pd.DataFrame:
	"""Parse sale dates and normalize ZIP codes, returning a copy."""
	_require_columns(df, ('date', 'zipcode'))
	result = df.copy()
	result['date'] = pd.to_datetime(
		result['date'], format='%Y%m%dT%H%M%S', errors='coerce'
	)
	result['zipcode'] = result['zipcode'].astype(str).str.strip()
	return result


def drop_duplicates(df: pd.DataFrame) -> pd.DataFrame:
	"""Drop exact duplicates and keep the latest sale for each house id."""
	_require_columns(df, ('id', 'date'))
	result = df.drop_duplicates().copy()
	return (
		result.sort_values('date', ascending=False)
		.drop_duplicates(subset='id', keep='first')
		.reset_index(drop=True)
	)


def remove_impossible_rows(df: pd.DataFrame) -> pd.DataFrame:
	"""Remove invalid prices/areas and the notebook's invalid home records."""
	required = ('price', 'sqft_living', 'bedrooms', 'bathrooms')
	_require_columns(df, required)
	invalid_sale = (df['price'] <= 0) | (df['sqft_living'] <= 0)
	uninhabitable = (df['bedrooms'] == 0) & (df['bathrooms'] == 0)
	suspicious_bedroom_count = (df['bedrooms'] >= 10) & (
		df['sqft_living'] < 200 * df['bedrooms']
	)
	return df.loc[~(invalid_sale | uninhabitable | suspicious_bedroom_count)].reset_index(drop=True)


def add_model_features(df: pd.DataFrame) -> pd.DataFrame:
	"""Add sale year and price-per-square-foot features."""
	_require_columns(df, ('date', 'price', 'sqft_living'))
	result = df.copy()
	result['sale_year'] = result['date'].dt.year
	result['price_per_sqft'] = result['price'] / result['sqft_living']
	return result


def add_renovated_flag(df: pd.DataFrame) -> pd.DataFrame:
	"""Add a binary flag indicating whether a house was renovated."""
	_require_columns(df, ('yr_renovated',))
	result = df.copy()
	result['renovated'] = (result['yr_renovated'] != 0).astype(int)
	return result


def drop_metadata_columns(df: pd.DataFrame) -> pd.DataFrame:
	"""Remove identifiers and fields excluded by the cleaning notebook."""
	return df.drop(
		columns=[column for column in METADATA_COLUMNS if column in df.columns]
	).copy()


def clean(df: pd.DataFrame) -> pd.DataFrame:
	"""Apply the notebook's cleaning steps and return its 17-column output."""
	_require_columns(df, RAW_REQUIRED_COLUMNS)
	result = fix_types(df)
	result = drop_duplicates(result)
	result = remove_impossible_rows(result)
	result = add_model_features(result)
	result = add_renovated_flag(result)
	result = drop_metadata_columns(result)
	result['zipcode'] = result['zipcode'].astype('string')
	return result
