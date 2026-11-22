export function parseCsvText(csvText) {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (!lines.length) return []

  const headers = lines[0].split(',').map((value) => value.trim())
  const rows = lines.slice(1).map((line) => {
    const values = line.split(',').map((value) => value.trim())
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']))
  })

  return rows
}
