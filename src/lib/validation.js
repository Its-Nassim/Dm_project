import { VALID_COLUMNS } from './schema.js'

export function validateHousingInput(input) {
  const errors = []

  for (const key of VALID_COLUMNS) {
    if (key === 'price') continue
    if (input[key] === undefined || input[key] === '') {
      continue
    }
  }

  if (!input.price || Number(input.price) <= 0) {
    errors.push('Price is required and must be greater than zero.')
  }

  return { valid: errors.length === 0, errors }
}

export function validateCsvRows(rows) {
  const errors = []

  rows.forEach((row, index) => {
    if (!row.price || Number(row.price) <= 0) {
      errors.push(`Row ${index + 1}: missing or invalid price.`)
    }
  })

  return { valid: errors.length === 0, errors }
}
