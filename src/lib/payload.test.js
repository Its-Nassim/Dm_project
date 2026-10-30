import { test, describe } from 'node:test'
import assert from 'node:assert'
import { buildPayload } from './payload.js'

describe('buildPayload', () => {
  const schema = {
    features: [
      { name: 'price', type: 'number' },
      { name: 'bedrooms', type: 'integer' },
      { name: 'bathrooms', type: 'number' },
      { name: 'waterfront', type: 'binary' },
      { name: 'view', type: 'categorical', values: [0, 1, 2, 3, 4] },
    ],
  }

  test('preserves exact schema order and casts values correctly', () => {
    const values = {
      view: '2',
      bathrooms: '2.5',
      waterfront: true,
      price: '450000',
      bedrooms: '3',
      // extra columns that must be excluded:
      id: 123456,
      date: '2014-10-13',
      peer_median: 500,
      ratio: 1.12,
    }

    const payload = buildPayload(values, schema)
    const keys = Object.keys(payload)

    assert.deepStrictEqual(keys, ['price', 'bedrooms', 'bathrooms', 'waterfront', 'view'])
    assert.strictEqual(payload.price, 450000)
    assert.strictEqual(payload.bedrooms, 3)
    assert.strictEqual(payload.bathrooms, 2.5)
    assert.strictEqual(payload.waterfront, 1)
    assert.strictEqual(payload.view, 2)
    assert.strictEqual(payload.id, undefined)
    assert.strictEqual(payload.date, undefined)
    assert.strictEqual(payload.peer_median, undefined)
    assert.strictEqual(payload.ratio, undefined)
  })

  test('handles binary casting from 0, 1, string, boolean', () => {
    assert.strictEqual(buildPayload({ waterfront: false }, schema).waterfront, 0)
    assert.strictEqual(buildPayload({ waterfront: '0' }, schema).waterfront, 0)
    assert.strictEqual(buildPayload({ waterfront: '1' }, schema).waterfront, 1)
    assert.strictEqual(buildPayload({ waterfront: 1 }, schema).waterfront, 1)
    assert.strictEqual(buildPayload({}, schema).waterfront, 0)
  })
})
