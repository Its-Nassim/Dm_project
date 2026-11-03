export async function mockRequestPrediction(payload) {
  const params = new URLSearchParams(window.location.search)
  const mockError = params.get('mock')

  if (mockError === 'error400') {
    throw new Error('Validation error: Asking price must be greater than 0')
  }
  if (mockError === 'error500') {
    throw new Error('Internal server error')
  }
  if (mockError === 'network') {
    throw new TypeError('Network error')
  }
  if (mockError === 'slow') {
    await new Promise((resolve) => setTimeout(resolve, 5000))
  }

  const delay = 600 + Math.random() * 300
  await new Promise((resolve) => setTimeout(resolve, delay))

  const price = Number(payload.price || 0)
  const score = Math.min(
    1,
    Math.max(
      0,
      (price - 350000) / 800000 +
        (Number(payload.sqft_living || 0) / 8000) * 0.2 +
        (Number(payload.bedrooms || 0) / 6) * 0.2,
    ),
  )

  const raw = [
    Math.max(0.05, 0.55 - score * 0.42),
    Math.max(0.1, 0.7 - score * 0.25),
    Math.max(0.12, 0.3 + score * 0.6),
    Math.max(0.06, 0.22 + score * 0.55),
  ]

  const total = raw.reduce((sum, value) => sum + value, 0)
  const probabilities = raw.map((value) => Number((value / total).toFixed(3)))
  const classId = probabilities.indexOf(Math.max(...probabilities))

  const classNames = {
    0: 'Cheaper than average',
    1: 'Reasonable price',
    2: 'Over priced',
    3: 'Too over priced',
  }

  return {
    class_id: classId,
    class_name: classNames[classId],
    probabilities: {
      0: probabilities[0],
      1: probabilities[1],
      2: probabilities[2],
      3: probabilities[3],
    },
    mock: true,
  }
}

export async function mockRequestBatchPrediction(file) {
  const params = new URLSearchParams(window.location.search)
  if (params.get('mock') === 'batcherror') {
    throw new Error('Batch validation error')
  }

  const delay = 600 + Math.random() * 300
  await new Promise((resolve) => setTimeout(resolve, delay))

  const text = await file.text()
  const lines = text.split('\n').filter((line) => line.trim())
  const header = lines[0].split(',')
  const dataLines = lines.slice(1)

  const results = await Promise.all(
    dataLines.map(async (line, index) => {
      const values = line.split(',')
      const record = {}
      header.forEach((key, i) => {
        record[key.trim()] = values[i]?.trim()
      })

      try {
        const prediction = await mockRequestPrediction(record)
        return {
          row: index + 1,
          price: record.price,
          class_id: prediction.class_id,
          class_name: prediction.class_name,
          probabilities: prediction.probabilities,
          mock: true,
        }
      } catch (error) {
        return {
          row: index + 1,
          error: error.message,
        }
      }
    }),
  )

  return {
    summary: {
      rows: dataLines.length,
      predicted: results.filter((r) => !r.error).length,
      failed: results.filter((r) => r.error).length,
    },
    rows: results,
  }
}

export async function mockGetHealth() {
  return { status: 'ok' }
}

export async function mockGetModelInfo() {
  return null
}

