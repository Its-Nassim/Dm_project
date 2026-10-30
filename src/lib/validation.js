import { getFieldMeta } from '../config/fieldMeta.js'

/**
 * Pure validation for single house form values against schema.
 * Returns { errors: { [name]: message }, warnings: string[] }
 */
export function validateSingle(values, schema) {
  const errors = {}
  const warnings = []

  if (!schema?.features || !Array.isArray(schema.features)) {
    return { errors: { _schema: 'Invalid schema' }, warnings: [] }
  }

  const sourceValues = values || {}

  for (const feature of schema.features) {
    const { name, type, required, min, max, exclusiveMin, values: allowedValues } = feature
    const meta = getFieldMeta(name)
    const label = meta.label || name
    const rawVal = sourceValues[name]

    // Binary check
    if (type === 'binary') {
      // 0, 1, false, true are all valid
      continue
    }

    const isEmpty = rawVal === undefined || rawVal === null || String(rawVal).trim() === ''

    if (isEmpty) {
      if (required) {
        errors[name] = `${label} is required`
      }
      continue
    }

    const trimmed = String(rawVal).trim()

    // Numbers & Integers
    if (type === 'number' || type === 'integer') {
      const num = Number(trimmed)
      if (isNaN(num)) {
        errors[name] = `${label} must be a valid number`
        continue
      }

      if (type === 'integer' && !Number.isInteger(num)) {
        errors[name] = `${label} must be a whole number`
        continue
      }

      if (name === 'price' && num <= 0) {
        errors[name] = 'Asking price must be greater than 0'
        continue
      }

      if (min !== null && min !== undefined) {
        if (exclusiveMin) {
          if (num <= min) {
            errors[name] = `${label} must be greater than ${min}`
            continue
          }
        } else {
          if (num < min) {
            errors[name] = `${label} must be at least ${min}`
            continue
          }
        }
      }

      if (max !== null && max !== undefined) {
        if (num > max) {
          errors[name] = `${label} must be at most ${max}`
          continue
        }
      }

      continue
    }

    // Categorical
    if (type === 'categorical') {
      if (Array.isArray(allowedValues) && allowedValues.length > 0) {
        const matches = allowedValues.some((v) => String(v) === trimmed)
        if (!matches) {
          const rangeStr = allowedValues.length <= 10 
            ? allowedValues.join(', ') 
            : `${allowedValues[0]} to ${allowedValues[allowedValues.length - 1]}`
          errors[name] = `${label} must be one of: ${rangeStr}`
          continue
        }
      }
      continue
    }
  }

  // Soft warning: sqft_living differs from sqft_above + sqft_basement
  // only when all three are schema features and all three are supplied
  const hasLiving = schema.features.some((f) => f.name === 'sqft_living')
  const hasAbove = schema.features.some((f) => f.name === 'sqft_above')
  const hasBasement = schema.features.some((f) => f.name === 'sqft_basement')

  if (hasLiving && hasAbove && hasBasement) {
    const livingVal = sourceValues.sqft_living
    const aboveVal = sourceValues.sqft_above
    const basementVal = sourceValues.sqft_basement

    if (
      livingVal !== undefined && livingVal !== null && String(livingVal).trim() !== '' &&
      aboveVal !== undefined && aboveVal !== null && String(aboveVal).trim() !== '' &&
      basementVal !== undefined && basementVal !== null && String(basementVal).trim() !== ''
    ) {
      const living = Number(livingVal)
      const above = Number(aboveVal)
      const basement = Number(basementVal)

      if (!isNaN(living) && !isNaN(above) && !isNaN(basement) && living !== above + basement) {
        warnings.push(
          `Living area (${living.toLocaleString()} sq ft) differs from the sum of area above ground (${above.toLocaleString()}) and basement area (${basement.toLocaleString()}).`
        )
      }
    }
  }

  return { errors, warnings }
}
