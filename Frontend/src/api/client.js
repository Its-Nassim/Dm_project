import { mockRequestPrediction, mockRequestBatchPrediction, mockGetHealth, mockGetModelInfo } from './mock.js'

const BASE = import.meta.env.VITE_API_BASE_URL ?? ''
const ENDPOINTS = {
  predict: '/predict',
  predictBatch: '/predict_batch',
  health: '/health',
  modelInfo: '/model_info',
  schema: '/schema',
}

export class ApiError extends Error {
  constructor({ kind, status, message, fieldErrors, raw }) {
    super(message)
    this.kind = kind
    this.status = status
    this.message = message
    this.fieldErrors = fieldErrors
    this.raw = raw
  }
}

export function normalizePrediction(raw) {
  if (!raw) return null

  const classId = raw.class_id
  const className = raw.class_name

  let probabilities = null
  if (raw.probabilities) {
    if (Array.isArray(raw.probabilities)) {
      probabilities = raw.probabilities
    } else if (typeof raw.probabilities === 'object') {
      probabilities = Object.entries(raw.probabilities).map(([key, value]) => ({
        classId: isNaN(key) ? key : parseInt(key, 10),
        label: isNaN(key) ? key : key,
        value,
      }))
    }
  }

  return { classId, className, probabilities }
}

export async function getSchema() {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    throw new Error('Schema not available in mock mode')
  }

  const response = await fetch(`${BASE}${ENDPOINTS.schema}`)
  if (!response.ok) {
    throw new ApiError({
      kind: 'server',
      status: response.status,
      message: `Failed to fetch schema (HTTP ${response.status})`,
      raw: await response.text(),
    })
  }
  return response.json()
}

export async function predictSingle(payload) {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    return mockRequestPrediction(payload)
  }

  const controller = new AbortController()
  const timeout = setTimeout(
    () => controller.abort(),
    import.meta.env.VITE_REQUEST_TIMEOUT_MS || 30000,
  )

  try {
    const response = await fetch(`${BASE}${ENDPOINTS.predict}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
    clearTimeout(timeout)

    if (response.status === 400) {
      const text = await response.text()
      try {
        const json = JSON.parse(text)
        throw new ApiError({
          kind: 'validation',
          status: 400,
          message: json.error || json.message || 'Validation error',
          fieldErrors: json.fields || json.errors,
          raw: text,
        })
      } catch {
        throw new ApiError({
          kind: 'validation',
          status: 400,
          message: text,
          raw: text,
        })
      }
    }

    if (!response.ok) {
      throw new ApiError({
        kind: 'server',
        status: response.status,
        message: `The server returned an error (HTTP ${response.status})`,
        raw: await response.text(),
      })
    }

    return response.json()
  } catch (error) {
    clearTimeout(timeout)
    if (error.name === 'AbortError') {
      throw new ApiError({ kind: 'timeout', message: 'The request timed out.' })
    }
    if (error instanceof TypeError) {
      throw new ApiError({ kind: 'network', message: 'Cannot reach the prediction server. Check that the backend is running.' })
    }
    throw error
  }
}

export async function predictBatch(file) {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    return mockRequestBatchPrediction(file)
  }

  const controller = new AbortController()
  const timeout = setTimeout(
    () => controller.abort(),
    import.meta.env.VITE_BATCH_TIMEOUT_MS || 120000,
  )

  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${BASE}${ENDPOINTS.predictBatch}`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    })
    clearTimeout(timeout)

    if (response.status === 400) {
      const text = await response.text()
      try {
        const json = JSON.parse(text)
        throw new ApiError({
          kind: 'validation',
          status: 400,
          message: json.error || json.message || 'Validation error',
          fieldErrors: json.fields || json.errors,
          raw: text,
        })
      } catch {
        throw new ApiError({
          kind: 'validation',
          status: 400,
          message: text,
          raw: text,
        })
      }
    }

    if (!response.ok) {
      throw new ApiError({
        kind: 'server',
        status: response.status,
        message: `The server returned an error (HTTP ${response.status})`,
        raw: await response.text(),
      })
    }

    return response.json()
  } catch (error) {
    clearTimeout(timeout)
    if (error.name === 'AbortError') {
      throw new ApiError({ kind: 'timeout', message: 'The request timed out.' })
    }
    if (error instanceof TypeError) {
      throw new ApiError({ kind: 'network', message: 'Cannot reach the prediction server. Check that the backend is running.' })
    }
    throw error
  }
}

export async function downloadResults(response) {
  if (response.download_url) {
    const a = document.createElement('a')
    a.href = `${BASE}${response.download_url}`
    a.download = 'results.csv'
    a.click()
    return
  }

  throw new Error('Download mechanism not configured')
}

export async function getHealth() {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    return mockGetHealth()
  }

  const response = await fetch(`${BASE}${ENDPOINTS.health}`)
  if (!response.ok) {
    throw new ApiError({
      kind: 'server',
      status: response.status,
      message: `Health check failed (HTTP ${response.status})`,
      raw: await response.text(),
    })
  }
  return response.json()
}

export async function getModelInfo() {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    return mockGetModelInfo()
  }

  const response = await fetch(`${BASE}${ENDPOINTS.modelInfo}`)
  if (response.status === 404) {
    return null
  }
  if (!response.ok) {
    throw new ApiError({
      kind: 'server',
      status: response.status,
      message: `Failed to fetch model info (HTTP ${response.status})`,
      raw: await response.text(),
    })
  }
  return response.json()
}
