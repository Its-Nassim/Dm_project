export const fieldMeta = {
  price: { label: 'Asking price (USD)', type: 'number', unit: 'USD', group: 'Price', help: 'Listing price in US dollars. Required, greater than 0.' },
  zipcode: { label: 'ZIP code', type: 'number', group: 'Location' },
  lat: { label: 'Latitude', type: 'number', group: 'Location', help: 'decimal degrees' },
  long: { label: 'Longitude', type: 'number', group: 'Location', help: 'decimal degrees' },
  bedrooms: { label: 'Bedrooms', type: 'number', group: 'Size and layout', help: 'fractional values allowed' },
  bathrooms: { label: 'Bathrooms', type: 'number', group: 'Size and layout', help: 'fractional values allowed' },
  floors: { label: 'Floors', type: 'number', group: 'Size and layout', help: 'fractional values allowed' },
  sqft_living: { label: 'Living area', type: 'number', unit: 'sqft', group: 'Size and layout' },
  sqft_lot: { label: 'Lot size', type: 'number', unit: 'sqft', group: 'Size and layout' },
  sqft_above: { label: 'Area above ground', type: 'number', unit: 'sqft', group: 'Size and layout' },
  sqft_basement: { label: 'Basement area', type: 'number', unit: 'sqft', group: 'Size and layout', help: '0 means no basement' },
  sqft_living15: { label: 'Living area (nearby)', type: 'number', unit: 'sqft', group: 'Size and layout', help: 'the brief does not define them' },
  sqft_lot15: { label: 'Lot size (nearby)', type: 'number', unit: 'sqft', group: 'Size and layout', help: 'the brief does not define them' },
  waterfront: { label: 'Waterfront', type: 'binary', group: 'Quality and history' },
  view: { label: 'View rating', type: 'number', group: 'Quality and history', help: 'numeric labels only' },
  condition: { label: 'Condition rating', type: 'number', group: 'Quality and history', help: 'numeric labels only' },
  grade: { label: 'Construction grade', type: 'number', group: 'Quality and history', help: 'numeric labels only' },
  yr_built: { label: 'Year built', type: 'number', group: 'Quality and history', help: 'year' },
  yr_renovated: { label: 'Year renovated', type: 'number', group: 'Quality and history', help: '0 means never renovated' },
}

export const fieldOrder = Object.keys(fieldMeta)
