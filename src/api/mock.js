import { DEFAULT_CLASSES } from '../config/classes.js'
import { parseCsvRows } from '../lib/csv.js'

function getMockQueryFlag() {
  if (typeof window === 'undefined' || !window.location) return null
  const params = new URLSearchParams(window.location.search)
  return params.get('mock')
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function hashString(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export async function mockPredictSingle(payload) {
  const flag = getMockQueryFlag()

  if (flag === 'slow') {
    await delay(3500)
  } else {
    await delay(600 + Math.random() * 300)
  }

  if (flag === 'error400') {
    const error = new Error('Asking price must be greater than 0')
    error.status = 400
    error.fieldErrors = { price: 'Must be greater than 0' }
    throw error
  }

  if (flag === 'error500') {
    const error = new Error('Internal server error during classification')
    error.status = 500
    throw error
  }

  if (flag === 'network') {
    const error = new TypeError('Failed to fetch')
    throw error
  }

  // Deterministic mock class derived from payload
  const seedStr = JSON.stringify(payload || {})
  const hash = hashString(seedStr)
  const classId = hash % 4
  const cls = DEFAULT_CLASSES.find((c) => c.id === classId) || DEFAULT_CLASSES[1]

  // Mock probabilities summing to 1.0
  const baseProb = 0.55
  const probs = { 0: 0.1, 1: 0.1, 2: 0.1, 3: 0.1 }
  probs[classId] = parseFloat((baseProb + (hash % 15) / 100).toFixed(2))
  const remainingKeys = [0, 1, 2, 3].filter((k) => k !== classId)
  const leftover = parseFloat((1 - probs[classId]).toFixed(2))
  probs[remainingKeys[0]] = parseFloat((leftover * 0.5).toFixed(2))
  probs[remainingKeys[1]] = parseFloat((leftover * 0.3).toFixed(2))
  probs[remainingKeys[2]] = parseFloat((1 - (probs[classId] + probs[remainingKeys[0]] + probs[remainingKeys[1]])).toFixed(2))

  return {
    class_id: cls.id,
    class_name: cls.name,
    probabilities: probs,
    mock: true,
  }
}

export async function mockPredictBatch(file) {
  const flag = getMockQueryFlag()

  if (flag === 'batcherror') {
    await delay(800)
    const err = new Error('Missing required columns: price, bedrooms')
    err.status = 400
    throw err
  }

  if (flag === 'slow') {
    await delay(4000)
  } else {
    await delay(1000 + Math.random() * 500)
  }

  const text = await file.text()
  const rows = parseCsvRows(text)

  const classifiedRows = []
  let predicted = 0
  let failed = 0

  rows.forEach((row, idx) => {
    const rowNum = idx + 1
    const price = row.price ? Number(row.price) : null

    if (!price || isNaN(price) || price <= 0) {
      failed++
      classifiedRows.push({
        row: rowNum,
        price: row.price || '',
        error: 'Invalid or missing asking price',
      })
      return
    }

    predicted++
    const hash = hashString(`${rowNum}-${price}`)
    const classId = hash % 4
    const cls = DEFAULT_CLASSES.find((c) => c.id === classId) || DEFAULT_CLASSES[1]

    classifiedRows.push({
      row: rowNum,
      price,
      class_id: cls.id,
      class_name: cls.name,
      top_prob: 0.65 + ((hash % 25) / 100),
      probabilities: {
        0: classId === 0 ? 0.7 : 0.1,
        1: classId === 1 ? 0.7 : 0.1,
        2: classId === 2 ? 0.7 : 0.1,
        3: classId === 3 ? 0.7 : 0.1,
      },
    })
  })

  return {
    summary: {
      rows: rows.length,
      predicted,
      failed,
    },
    rows: classifiedRows,
    mock: true,
  }
}

export async function mockHealth() {
  await delay(100)
  return { status: 'ok', mock: true }
}

export async function mockModelInfo() {
  // Return null / 404 in mock mode so Model and Analytics show the "not connected" state
  await delay(150)
  return null
}
