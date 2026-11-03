import assert from 'node:assert/strict'
import test from 'node:test'
import { requestBatchPrediction } from './mock.js'

test('batch predictions include resolved class data for each row', async () => {
  const results = await requestBatchPrediction([
    { id: 'listing-a', price: 500000 },
    { price: 700000 },
  ])

  assert.equal(results.length, 2)
  assert.equal(results[0].id, 'listing-a')
  assert.equal(results[1].id, 2)
  assert.ok(results.every((result) => Number.isInteger(result.class_id)))
  assert.ok(results.every((result) => result.class_name))
  assert.ok(results.every((result) => result.probabilities.length === 4))
})
