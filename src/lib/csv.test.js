import { test, describe } from 'node:test'
import assert from 'node:assert'
import { readCsvMeta, buildTemplate, buildResultsCsv } from './csv.js'

describe('csv utilities', () => {
  test('readCsvMeta handles BOM, quoted commas, embedded newlines, and trailing blank lines', () => {
    const raw = '\uFEFF"price",bedrooms,"sqft_living","notes"\n' +
      '450000,3,1800,"Great, view"\n' +
      '550000,4,2400,"Multi-line\r\ncomment"\n' +
      '\n' +
      '   \n'

    const meta = readCsvMeta(raw)
    assert.deepStrictEqual(meta.headers, ['price', 'bedrooms', 'sqft_living', 'notes'])
    assert.strictEqual(meta.rowCount, 2)
    assert.strictEqual(meta.errors.length, 0)
  })

  test('readCsvMeta flags empty file', () => {
    const meta = readCsvMeta('')
    assert.strictEqual(meta.rowCount, 0)
    assert.ok(meta.errors.length > 0)
    assert.match(meta.errors[0], /empty/i)
  })

  test('readCsvMeta flags header-only file as 0 data rows', () => {
    const meta = readCsvMeta('price,bedrooms,bathrooms\n')
    assert.deepStrictEqual(meta.headers, ['price', 'bedrooms', 'bathrooms'])
    assert.strictEqual(meta.rowCount, 0)
    assert.strictEqual(meta.errors.length, 0)
  })

  test('readCsvMeta detects duplicate headers', () => {
    const meta = readCsvMeta('price,bedrooms,price\n450000,3,450000\n')
    assert.ok(meta.errors.some((e) => e.includes('Duplicate header')))
  })

  test('buildTemplate creates header-only CSV in schema order', () => {
    const schema = {
      features: [
        { name: 'price' },
        { name: 'bedrooms' },
        { name: 'bathrooms' },
      ],
    }
    const template = buildTemplate(schema)
    assert.strictEqual(template, 'price,bedrooms,bathrooms\n')
  })

  test('buildResultsCsv quotes fields containing commas, quotes, and newlines', () => {
    const rows = [
      { row: 1, price: 450000, class_id: 1, class_name: 'Reasonable price', note: 'Standard' },
      { row: 2, price: 850000, class_id: 3, class_name: 'Too over priced', note: 'Special, "luxury" quote\nnew line' },
    ]

    const csv = buildResultsCsv(rows)
    assert.ok(csv.startsWith('row,price,class_id,class_name,note\n'))
    assert.ok(csv.includes('"Special, ""luxury"" quote\nnew line"'))
  })
})
