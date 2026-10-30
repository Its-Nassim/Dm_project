export const FEATURE_SCHEMA = {
  version: '1.0.0',
  fields: [
    'id',
    'date',
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
    'yr_renovated',
    'zipcode',
    'lat',
    'long',
    'sqft_living15',
    'sqft_lot15',
  ],
}

export const MOCK_SCHEMA = FEATURE_SCHEMA

export function useSchema() {
  return MOCK_SCHEMA
}
