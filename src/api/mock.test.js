import assert from 'node:assert/strict'
import test from 'node:test'
import { mockRequestBatchPrediction } from './mock.js'

test('batch predictions include class data and summary for each row', async () => {
  globalThis.window = { location: { search: '' } }
  const file = {
    text: async () => 'price,bedrooms,sqft_living\n500000,3,2000\n700000,4,3000',
  }
  const result = await mockRequestBatchPrediction(file)

  assert.deepEqual(result.summary, { rows: 2, predicted: 2, failed: 0 })
  assert.equal(result.rows.length, 2)
  assert.ok(result.rows.every((row) => Number.isInteger(row.class_id)))
  assert.ok(result.rows.every((row) => row.class_name))
  assert.ok(result.rows.every((row) => Object.keys(row.probabilities).length === 4))
})
