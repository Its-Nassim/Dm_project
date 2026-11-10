export const CLASS_NAMES = {
  0: 'Cheaper than average',
  1: 'Reasonable price',
  2: 'Over priced',
  3: 'Too over priced',
}

export const VALID_COLUMNS = [
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
]

export function normalizeRecord(record) {
  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => {
      if (value === '' || value === null || value === undefined) {
        return [key, '']
      }
      return [key, value.trim ? value.trim() : value]
    }),
  )
}
