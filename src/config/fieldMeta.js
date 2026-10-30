export const FIELD_META = {
  price: {
    label: 'Asking price (USD)',
    group: 'Price',
    help: 'Listing price in US dollars. Required, greater than 0.',
  },
  zipcode: {
    label: 'ZIP code',
    group: 'Location',
    help: 'King County 5-digit ZIP code',
  },
  lat: {
    label: 'Latitude',
    group: 'Location',
    help: 'Decimal degrees',
  },
  long: {
    label: 'Longitude',
    group: 'Location',
    help: 'Decimal degrees',
  },
  bedrooms: {
    label: 'Bedrooms',
    group: 'Size and layout',
    help: 'Number of bedrooms',
  },
  bathrooms: {
    label: 'Bathrooms',
    group: 'Size and layout',
    help: 'Fractional values allowed (e.g. 2.5)',
  },
  floors: {
    label: 'Floors',
    group: 'Size and layout',
    help: 'Fractional values allowed (e.g. 1.5)',
  },
  sqft_living: {
    label: 'Living area',
    group: 'Size and layout',
    help: 'Square feet of interior living space',
  },
  sqft_lot: {
    label: 'Lot size',
    group: 'Size and layout',
    help: 'Square feet of land parcel',
  },
  sqft_above: {
    label: 'Area above ground',
    group: 'Size and layout',
    help: 'Square feet above ground level',
  },
  sqft_basement: {
    label: 'Basement area',
    group: 'Size and layout',
    help: 'Square feet of basement (0 means no basement)',
  },
  sqft_living15: {
    label: 'Living area (nearest 15 homes)',
    group: 'Size and layout',
    help: 'Square feet of interior living space for 15 nearest neighbors',
  },
  sqft_lot15: {
    label: 'Lot size (nearest 15 homes)',
    group: 'Size and layout',
    help: 'Square feet of land parcel for 15 nearest neighbors',
  },
  waterfront: {
    label: 'Waterfront',
    group: 'Quality and history',
    help: 'Direct shoreline or water frontage access',
  },
  view: {
    label: 'View rating',
    group: 'Quality and history',
    help: 'Numeric rating (0-4)',
  },
  condition: {
    label: 'Condition rating',
    group: 'Quality and history',
    help: 'Numeric rating (1-5)',
  },
  grade: {
    label: 'Construction grade',
    group: 'Quality and history',
    help: 'Numeric rating (1-13)',
  },
  yr_built: {
    label: 'Year built',
    group: 'Quality and history',
    help: 'Year of initial construction',
  },
  yr_renovated: {
    label: 'Year renovated',
    group: 'Quality and history',
    help: '0 means never renovated',
  },
}

export const GROUP_ORDER = [
  'Price',
  'Location',
  'Size and layout',
  'Quality and history',
  'Other',
]

export function getFieldMeta(name) {
  return (
    FIELD_META[name] || {
      label: name,
      group: 'Other',
      help: '',
    }
  )
}
