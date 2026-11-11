"""Validation helpers for cleaned datasets and individual house inputs."""

import math
from collections.abc import Iterable, Mapping

import pandas as pd


CLEANED_COLUMNS = (
	'price',
	'bedrooms',
	'bathrooms',
	'sqft_living',
	'sqft_lot',
	'floors',
	'waterfront',
	'view',
	'condition',
	'grade',
	'sqft_above',
	'sqft_basement',
	'yr_built',
	'zipcode',
	'sale_year',
	'price_per_sqft',
	'renovated',
)

RANGE_LIMITS = {
	'waterfront': (0, 1),
	'view': (0, 4),
	'condition': (1, 5),
	'grade': (1, 13),
	'renovated': (0, 1),
}

NON_NEGATIVE_FIELDS = (
	'bedrooms',
	'bathrooms',
	'sqft_living',
	'sqft_lot',
	'floors',
	'sqft_above',
	'sqft_basement',
	'yr_built',
	'sale_year',
	'price_per_sqft',
)

INTEGER_FIELDS = (
	'bedrooms',
	'waterfront',
	'view',
	'condition',
	'grade',
	'yr_built',
	'sale_year',
	'renovated',
)


def _is_blank(value: object) -> bool:
	if value is None:
		return True
	if isinstance(value, str):
		return not value.strip()
	return bool(pd.isna(value))


def validate_house_input(
	values: Mapping[str, object],
	*,
	required_fields: Iterable[str] = (),
) -> list[str]:
	"""Return validation errors for form values; callers define required fields."""
	errors = []
	required = set(required_fields)

	for field in required:
		if field not in values or _is_blank(values[field]):
			errors.append(f'{field} is required.')

	parsed = {}
	numeric_fields = set(NON_NEGATIVE_FIELDS) | set(RANGE_LIMITS) | {
		'price', 'price_per_sqft'
	}
	for field in numeric_fields & values.keys():
		value = values[field]
		if _is_blank(value):
			continue
		try:
			number = float(value)
		except (TypeError, ValueError):
			errors.append(f'{field} must be a number.')
			continue
		if not math.isfinite(number):
			errors.append(f'{field} must be a finite number.')
			continue
		parsed[field] = number

	for field, number in parsed.items():
		if field == 'price' and number <= 0:
			errors.append('price must be greater than 0.')
		elif field in NON_NEGATIVE_FIELDS and number < 0:
			errors.append(f'{field} cannot be negative.')
		if field in ('sqft_living', 'price_per_sqft') and number <= 0:
			errors.append(f'{field} must be greater than 0.')
		if field in RANGE_LIMITS:
			low, high = RANGE_LIMITS[field]
			if not low <= number <= high:
				errors.append(f'{field} must be between {low} and {high}.')
		if field in INTEGER_FIELDS and not number.is_integer():
			errors.append(f'{field} must be a whole number.')

	if 'zipcode' in values and not _is_blank(values['zipcode']):
		if not str(values['zipcode']).strip():
			errors.append('zipcode cannot be empty.')

	bedrooms = parsed.get('bedrooms')
	bathrooms = parsed.get('bathrooms')
	if bedrooms == 0 and bathrooms == 0:
		errors.append('bedrooms and bathrooms cannot both be 0.')
	if (
		bedrooms is not None
		and bedrooms >= 10
		and 'sqft_living' in parsed
		and parsed['sqft_living'] < 200 * bedrooms
	):
		errors.append('sqft_living is implausibly small for the bedroom count.')

	return errors


def validate_cleaned_data(df: pd.DataFrame) -> list[str]:
	"""Return schema and value errors for the exported cleaned dataset."""
	errors = []
	missing_columns = [column for column in CLEANED_COLUMNS if column not in df.columns]
	extra_columns = [column for column in df.columns if column not in CLEANED_COLUMNS]
	if missing_columns:
		errors.append(f'Missing expected columns: {", ".join(missing_columns)}.')
	if extra_columns:
		errors.append(f'Unexpected columns: {", ".join(extra_columns)}.')
	if df.empty:
		errors.append('Dataset is empty.')
		return errors

	present_columns = [column for column in CLEANED_COLUMNS if column in df.columns]
	missing_values = [
		column for column in present_columns if df[column].isna().any()
	]
	if missing_values:
		errors.append(f'Missing values found in: {", ".join(missing_values)}.')

	for column in (*NON_NEGATIVE_FIELDS, 'price', 'price_per_sqft', *RANGE_LIMITS):
		if column not in df.columns:
			continue
		numeric = pd.to_numeric(df[column], errors='coerce')
		invalid_numeric = numeric.isna()
		if invalid_numeric.any():
			errors.append(f'{column} contains non-numeric values.')
			continue
		if column == 'price' and numeric.le(0).any():
			errors.append('price must be greater than 0.')
		elif column in NON_NEGATIVE_FIELDS and numeric.lt(0).any():
			errors.append(f'{column} contains negative values.')
		if column in ('sqft_living', 'price_per_sqft') and numeric.le(0).any():
			errors.append(f'{column} must be greater than 0.')
		if column in RANGE_LIMITS:
			low, high = RANGE_LIMITS[column]
			if (~numeric.between(low, high)).any():
				errors.append(f'{column} must be between {low} and {high}.')
		if column in INTEGER_FIELDS and (numeric % 1 != 0).any():
			errors.append(f'{column} must contain whole numbers.')

	if 'zipcode' in df.columns and df['zipcode'].astype('string').str.strip().eq('').any():
		errors.append('zipcode contains empty values.')

	return errors
