export async function requestPrediction(payload) {
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
    probabilities,
    status: 'mock',
  }
}

export async function requestBatchPrediction(rows) {
  return Promise.all(
    rows.map(async (record, index) => ({
      id: record.id || index + 1,
      ...(await requestPrediction(record)),
    })),
  )
}
