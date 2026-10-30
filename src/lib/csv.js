/**
 * Robust CSV utilities (RFC 4180 compliant)
 * Handles quoted fields, embedded commas, embedded newlines, BOM, duplicate/empty headers.
 */

export function stripBom(text) {
  if (text && text.charCodeAt(0) === 0xfeff) {
    return text.slice(1)
  }
  return text
}

/**
 * Low-level RFC 4180 tokenizer.
 * Yields arrays of string cells per line.
 */
export function parseCsvGrid(text) {
  const clean = stripBom(text || '')
  if (!clean.trim()) return []

  const rows = []
  let currentRow = []
  let currentCell = ''
  let inQuotes = false
  let i = 0
  const len = clean.length

  while (i < len) {
    const char = clean[i]

    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < len && clean[i + 1] === '"') {
          // Escaped quote
          currentCell += '"'
          i += 2
          continue
        } else {
          // End of quote
          inQuotes = false
          i++
          continue
        }
      } else {
        currentCell += char
        i++
        continue
      }
    } else {
      if (char === '"') {
        inQuotes = true
        i++
        continue
      } else if (char === ',') {
        currentRow.push(currentCell)
        currentCell = ''
        i++
        continue
      } else if (char === '\r') {
        if (i + 1 < len && clean[i + 1] === '\n') {
          i++
        }
        currentRow.push(currentCell)
        currentCell = ''
        rows.push(currentRow)
        currentRow = []
        i++
        continue
      } else if (char === '\n') {
        currentRow.push(currentCell)
        currentCell = ''
        rows.push(currentRow)
        currentRow = []
        i++
        continue
      } else {
        currentCell += char
        i++
        continue
      }
    }
  }

  // Push remainder
  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell)
    rows.push(currentRow)
  }

  // Filter out completely empty trailing rows
  while (rows.length > 0) {
    const last = rows[rows.length - 1]
    const allBlank = last.every((c) => c.trim() === '')
    if (allBlank) {
      rows.pop()
    } else {
      break
    }
  }

  return rows
}

/**
 * readCsvMeta(text) -> { headers, rowCount, errors }
 */
export function readCsvMeta(text) {
  const errors = []
  const grid = parseCsvGrid(text)

  if (grid.length === 0) {
    return {
      headers: [],
      rowCount: 0,
      errors: ['The CSV file is empty.'],
    }
  }

  const rawHeaderRow = grid[0]
  const headers = rawHeaderRow.map((h) => h.trim())

  // Check empty headers
  const emptyIndices = []
  headers.forEach((h, idx) => {
    if (!h) emptyIndices.push(idx + 1)
  })
  if (emptyIndices.length > 0) {
    errors.push(`Header row contains empty column name at position ${emptyIndices.join(', ')}.`)
  }

  // Check duplicate headers
  const seen = new Set()
  const duplicates = new Set()
  headers.forEach((h) => {
    if (h) {
      if (seen.has(h)) duplicates.add(h)
      else seen.add(h)
    }
  })
  if (duplicates.size > 0) {
    errors.push(`Duplicate header detected: ${Array.from(duplicates).join(', ')}.`)
  }

  // Count non-empty data rows
  const dataRows = grid.slice(1)
  let rowCount = 0
  for (const row of dataRows) {
    const hasData = row.some((c) => c.trim() !== '')
    if (hasData) rowCount++
  }

  return {
    headers,
    rowCount,
    errors,
  }
}

/**
 * Parse CSV text into array of row objects
 */
export function parseCsvRows(text, maxRows = Infinity) {
  const grid = parseCsvGrid(text)
  if (grid.length < 2) return []

  const headers = grid[0].map((h) => h.trim())
  const rows = []
  const dataGrid = grid.slice(1, maxRows + 1)

  for (let r = 0; r < dataGrid.length; r++) {
    const line = dataGrid[r]
    if (line.every((c) => c.trim() === '')) continue

    const rowObj = { _rowNum: r + 1 }
    headers.forEach((h, idx) => {
      if (h) {
        rowObj[h] = line[idx] !== undefined ? line[idx].trim() : ''
      }
    })
    rows.push(rowObj)
  }

  return rows
}

/**
 * buildTemplate(schema) -> header-only CSV string
 */
export function buildTemplate(schema) {
  if (!schema?.features || !Array.isArray(schema.features)) {
    return ''
  }
  const headers = schema.features.map((f) => f.name)
  return headers.join(',') + '\n'
}

/**
 * Quote CSV cell if it contains commas, double quotes or newlines
 */
export function quoteCsvCell(value) {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/**
 * buildResultsCsv(rows) -> CSV string
 */
export function buildResultsCsv(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return ''

  // Collect all unique keys from rows, putting row/id/price/class_id/class_name first
  const priority = ['row', 'price', 'class_id', 'class_name', 'error']
  const keySet = new Set(priority)
  rows.forEach((r) => {
    Object.keys(r).forEach((k) => {
      if (k !== 'probabilities' && !k.startsWith('_')) {
        keySet.add(k)
      }
    })
  })

  // Filter keys present in at least one row
  const headers = Array.from(keySet).filter((k) => rows.some((r) => r[k] !== undefined))

  const lines = [headers.map(quoteCsvCell).join(',')]

  for (const row of rows) {
    const line = headers.map((h) => quoteCsvCell(row[h]))
    lines.push(line.join(','))
  }

  return lines.join('\n') + '\n'
}
