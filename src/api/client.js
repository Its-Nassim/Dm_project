import * as mockApi from './mock.js'
import { MOCK_SCHEMA } from '../config/featureSchema.js'
import { DEFAULT_CLASSES, getClassById } from '../config/classes.js'
import { buildResultsCsv } from '../lib/csv.js'

const BASE = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL 
  ? String(import.meta.env.VITE_API_BASE_URL).replace(/\/+$/, '') 
  : ''

const USE_MOCK = typeof import.meta !== 'undefined' && import.meta.env?.VITE_USE_MOCK === 'true'

const TIMEOUT_SINGLE = typeof import.meta !== 'undefined' && import.meta.env?.VITE_REQUEST_TIMEOUT_MS 
  ? Number(import.meta.env.VITE_REQUEST_TIMEOUT_MS) 
  : 30000

const TIMEOUT_BATCH = typeof import.meta !== 'undefined' && import.meta.env?.VITE_BATCH_TIMEOUT_MS 
  ? Number(import.meta.env.VITE_BATCH_TIMEOUT_MS) 
  : 120000

export const ENDPOINTS = {
  predict: '/predict',
  predictBatch: '/predict_batch',
  health: '/health',
  modelInfo: '/model_info',
  schema: '/model_info/schema',
}

export class ApiError extends Error {
  constructor({ kind, status = null, message, fieldErrors = null, raw = null, details = null }) {
    super(message)
    this.name = 'ApiError'
    this.kind = kind
    this.status = status
    this.fieldErrors = fieldErrors
    this.raw = raw
    this.details = details
  }
}

async function request(url, options = {}, timeoutMs = TIMEOUT_SINGLE) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeoutMs)
  const fullUrl = `${BASE}${url}`

  try {
    const res = await fetch(fullUrl, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(id)

    const contentType = res.headers.get('content-type') || ''

    // Detect Vite returning index.html for unproxied API paths
    if (res.ok && contentType.includes('text/html')) {
      throw new ApiError({
        kind: 'proxy',
        status: res.status,
        message: 'API route is not proxied. Check vite.config.js and VITE_DEV_PROXY_TARGET.',
      })
    }

    if (!res.ok) {
      let data = null
      let rawText = ''
      try {
        if (contentType.includes('application/json')) {
          data = await res.json()
        } else {
          rawText = await res.text()
        }
      } catch {
        // Failed to parse response body
      }

      if (res.status === 400 && data && typeof data === 'object') {
        const errorMsg = data.error || data.message || (typeof data.errors === 'string' ? data.errors : 'Bad request')
        const fieldErrors = (data.fields && typeof data.fields === 'object') 
          ? data.fields 
          : ((data.errors && typeof data.errors === 'object') ? data.errors : null)
        
        throw new ApiError({
          kind: 'validation',
          status: 400,
          message: errorMsg,
          fieldErrors,
          raw: data,
        })
      }

      throw new ApiError({
        kind: 'server',
        status: res.status,
        message: `The server returned an error (HTTP ${res.status}).`,
        details: rawText || (data ? JSON.stringify(data, null, 2) : ''),
        raw: data || rawText,
      })
    }

    if (contentType.includes('application/json')) {
      return await res.json()
    }
    return await res.text()
  } catch (err) {
    clearTimeout(id)

    if (err instanceof ApiError) {
      throw err
    }

    if (err.name === 'AbortError') {
      throw new ApiError({
        kind: 'timeout',
        message: 'The request timed out.',
      })
    }

    if (err instanceof TypeError) {
      throw new ApiError({
        kind: 'network',
        message: 'Cannot reach the prediction server. Check that the backend is running.',
        raw: err,
      })
    }

    throw new ApiError({
      kind: 'server',
      message: err.message || 'An unexpected error occurred.',
      raw: err,
    })
  }
}

export async function getSchema() {
  if (USE_MOCK) {
    return MOCK_SCHEMA
  }
  return await request(ENDPOINTS.schema)
}

export async function predictSingle(payload) {
  if (USE_MOCK) {
    return await mockApi.mockPredictSingle(payload)
  }
  return await request(ENDPOINTS.predict, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }, TIMEOUT_SINGLE)
}

export async function predictBatch(file) {
  if (USE_MOCK) {
    return await mockApi.mockPredictBatch(file)
  }
  const formData = new FormData()
  formData.append('file', file)

  return await request(ENDPOINTS.predictBatch, {
    method: 'POST',
    body: formData,
  }, TIMEOUT_BATCH)
}

export async function getHealth() {
  if (USE_MOCK) {
    return await mockApi.mockHealth()
  }
  return await request(ENDPOINTS.health)
}

export async function getModelInfo() {
  if (USE_MOCK) {
    return await mockApi.mockModelInfo()
  }
  try {
    return await request(ENDPOINTS.modelInfo)
  } catch {
    return null
  }
}

/**
 * Normalizes raw prediction response into standard UI shape:
 * { classId, className, probabilities: [{ classId, label, value }] | null, mock }
 */
export function normalizePrediction(raw, customLabels) {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Prediction response is empty or invalid')
  }

  const rawId = raw.class_id !== undefined ? raw.class_id : (raw.classId !== undefined ? raw.classId : raw.prediction)
  const classId = rawId !== undefined && rawId !== null ? Number(rawId) : 1
  const meta = getClassById(classId, customLabels)
  const className = raw.class_name || raw.className || meta.name

  let probabilities = null
  const rawProbs = raw.probabilities || raw.probs || null

  if (rawProbs) {
    if (Array.isArray(rawProbs)) {
      probabilities = rawProbs.map((p, idx) => {
        const itemClass = getClassById(idx, customLabels)
        return {
          classId: idx,
          label: itemClass.name,
          value: Number(p),
        }
      })
    } else if (typeof rawProbs === 'object') {
      probabilities = Object.entries(rawProbs).map(([k, v]) => {
        const id = isNaN(Number(k)) ? (DEFAULT_CLASSES.find((c) => c.name === k)?.id ?? 0) : Number(k)
        const itemClass = getClassById(id, customLabels)
        return {
          classId: id,
          label: itemClass.name,
          value: Number(v),
        }
      })
      probabilities.sort((a, b) => a.classId - b.classId)
    }
  }

  return {
    classId,
    className,
    probabilities,
    mock: Boolean(raw.mock),
  }
}

/**
 * Downloads batch results as a CSV file.
 * Checks for download_url first; falls back to generating CSV from rows.
 */
export async function downloadResults(batchResponse, filename = 'house_classification_results.csv') {
  if (!batchResponse) return

  if (batchResponse.download_url) {
    const a = document.createElement('a')
    a.href = `${BASE}${batchResponse.download_url}`
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    return
  }

  if (batchResponse.rows && Array.isArray(batchResponse.rows)) {
    const csvContent = buildResultsCsv(batchResponse.rows)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}
