import { useState, useEffect } from 'react'
import { getSchema } from '../api/client.js'

export const VALID_TYPES = ['number', 'integer', 'categorical', 'binary']
export const MOCK_EXCLUDED = ['id', 'date']

export const MOCK_SCHEMA = {
  schema_version: 1,
  source: 'mock',
  features: [
    { name: 'price', type: 'number', required: true, min: 0, exclusiveMin: true, unit: 'USD', rangeSource: 'mock' },
    { name: 'bedrooms', type: 'integer', required: true, min: 0, max: null, rangeSource: 'mock' },
    { name: 'bathrooms', type: 'number', required: true, min: 0, step: 'any', rangeSource: 'mock' },
    { name: 'sqft_living', type: 'number', required: true, min: 0, rangeSource: 'mock' },
    { name: 'sqft_lot', type: 'number', required: true, min: 0, rangeSource: 'mock' },
    { name: 'floors', type: 'number', required: true, min: 0, step: 'any', rangeSource: 'mock' },
    { name: 'waterfront', type: 'binary', required: true, rangeSource: 'mock' },
    { name: 'view', type: 'categorical', required: true, values: [0, 1, 2, 3, 4], rangeSource: 'mock' },
    { name: 'condition', type: 'categorical', required: true, values: [1, 2, 3, 4, 5], rangeSource: 'mock' },
    { name: 'grade', type: 'categorical', required: true, values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], rangeSource: 'mock' },
    { name: 'sqft_above', type: 'number', required: true, min: 0, rangeSource: 'mock' },
    { name: 'sqft_basement', type: 'number', required: true, min: 0, rangeSource: 'mock' },
    { name: 'yr_built', type: 'integer', required: true, min: 0, max: null, rangeSource: 'mock' },
    { name: 'yr_renovated', type: 'integer', required: true, min: 0, max: null, rangeSource: 'mock' },
    { name: 'zipcode', type: 'categorical', required: true, values: null, rangeSource: 'mock' },
    { name: 'lat', type: 'number', required: true, rangeSource: 'mock' },
    { name: 'long', type: 'number', required: true, rangeSource: 'mock' },
    { name: 'sqft_living15', type: 'number', required: true, min: 0, rangeSource: 'mock' },
    { name: 'sqft_lot15', type: 'number', required: true, min: 0, rangeSource: 'mock' },
  ],
  target_labels: {
    0: 'Cheaper than average',
    1: 'Reasonable price',
    2: 'Over priced',
    3: 'Too over priced',
  },
}

export function normalizeSchema(raw) {
  if (!raw || typeof raw !== 'object') {
    throw new Error('feature_schema.json: schema root must be an object')
  }

  const rawFeatures = raw.features
  if (!Array.isArray(rawFeatures)) {
    throw new Error('feature_schema.json: "features" must be an array')
  }

  const normalizedFeatures = rawFeatures.map((f, index) => {
    if (!f || typeof f !== 'object') {
      throw new Error(`feature_schema.json: feature #${index + 1} is not an object`)
    }
    const name = f.name?.toString().trim()
    if (!name) {
      throw new Error(`feature_schema.json: feature #${index + 1} has no name`)
    }

    const type = f.type?.toString().trim().toLowerCase()
    if (!VALID_TYPES.includes(type)) {
      throw new Error(`feature_schema.json: feature "${name}" has unknown type "${f.type}"`)
    }

    const required = f.required !== false
    const exclusiveMin = Boolean(f.exclusiveMin || f.exclusive_min)
    const min = f.min !== undefined && f.min !== null ? Number(f.min) : null
    const max = f.max !== undefined && f.max !== null ? Number(f.max) : null
    const step = f.step !== undefined ? f.step : (type === 'integer' ? 1 : 'any')
    const unit = f.unit ? String(f.unit).trim() : null
    const values = Array.isArray(f.values) ? f.values : null
    const rangeSource = f.rangeSource || raw.source || 'schema'

    return {
      name,
      type,
      required,
      min,
      max,
      exclusiveMin,
      step,
      unit,
      values,
      rangeSource,
    }
  })

  const rawLabels = raw.target_labels || raw.classLabels || raw.classes || {}
  const targetLabels = {}
  if (Array.isArray(rawLabels)) {
    rawLabels.forEach((label, idx) => {
      targetLabels[idx] = String(label)
    })
  } else if (typeof rawLabels === 'object' && rawLabels !== null) {
    Object.entries(rawLabels).forEach(([k, v]) => {
      targetLabels[Number(k)] = String(v)
    })
  }

  return {
    schema_version: raw.schema_version || 1,
    source: raw.source || 'schema',
    features: normalizedFeatures,
    target_labels: Object.keys(targetLabels).length > 0 ? targetLabels : MOCK_SCHEMA.target_labels,
    classLabels: Object.keys(targetLabels).length > 0 ? targetLabels : MOCK_SCHEMA.target_labels,
  }
}

export function getFeature(schema, name) {
  if (!schema?.features) return null
  return schema.features.find((f) => f.name === name) || null
}

export function isRequired(feature) {
  return Boolean(feature?.required)
}

let cachedSchemaPromise = null

export async function loadSchema(client) {
  const useMock = typeof import.meta !== 'undefined' && import.meta.env?.VITE_USE_MOCK === 'true'
  if (useMock) {
    return normalizeSchema(MOCK_SCHEMA)
  }

  if (cachedSchemaPromise) {
    return cachedSchemaPromise
  }

  cachedSchemaPromise = (async () => {
    try {
      if (client && typeof client.getSchema === 'function') {
        const raw = await client.getSchema()
        return normalizeSchema(raw)
      }
      const raw = await getSchema()
      return normalizeSchema(raw)
    } catch (err) {
      cachedSchemaPromise = null
      throw err
    }
  })()

  return cachedSchemaPromise
}

export function resetSchemaCache() {
  cachedSchemaPromise = null
}

export function useSchema() {
  const isMock = typeof import.meta !== 'undefined' && import.meta.env?.VITE_USE_MOCK === 'true'
  const [schema, setSchema] = useState(() => (isMock ? normalizeSchema(MOCK_SCHEMA) : null))
  const [loading, setLoading] = useState(() => !isMock)
  const [error, setError] = useState(null)

  const fetchSchema = () => {
    loadSchema()
      .then((s) => {
        setSchema(s)
        setError(null)
      })
      .catch((err) => {
        setError(err?.message || 'Failed to load feature schema')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const reload = () => {
    setLoading(true)
    setError(null)
    fetchSchema()
  }

  useEffect(() => {
    if (!isMock) {
      fetchSchema()
    }
  }, [isMock])

  return {
    schema,
    loading,
    error,
    reload,
  }
}
