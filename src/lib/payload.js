/**
 * Build payload for /predict request.
 * Ensures:
 * - Keys in exact schema order
 * - Exact schema names
 * - Numbers cast with Number()
 * - Binary cast to 0 or 1
 * - Excludes any helper columns (ratio, median, etc.) or id/date unless explicitly in schema
 */
export function buildPayload(values, schema) {
  if (!schema?.features || !Array.isArray(schema.features)) {
    throw new Error('Valid schema with features array is required')
  }

  const payload = {}
  const sourceValues = values || {}

  for (const feature of schema.features) {
    const { name, type, values: allowedValues } = feature
    const rawVal = sourceValues[name]

    if (type === 'binary') {
      payload[name] = (rawVal === 1 || rawVal === '1' || rawVal === true) ? 1 : 0
      continue
    }

    if (rawVal === undefined || rawVal === null || rawVal === '') {
      payload[name] = null
      continue
    }

    if (type === 'number' || type === 'integer') {
      const num = Number(rawVal)
      payload[name] = isNaN(num) ? null : num
      continue
    }

    if (type === 'categorical') {
      // If allowedValues is array of numbers, cast to number if valid
      if (Array.isArray(allowedValues) && allowedValues.length > 0 && typeof allowedValues[0] === 'number') {
        const num = Number(rawVal)
        payload[name] = isNaN(num) ? rawVal : num
      } else {
        payload[name] = typeof rawVal === 'string' ? rawVal.trim() : rawVal
      }
      continue
    }

    payload[name] = rawVal
  }

  return payload
}
