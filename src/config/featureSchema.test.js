import { test, describe } from 'node:test'
import assert from 'node:assert'
import { normalizeSchema, MOCK_SCHEMA, getFeature, isRequired } from './featureSchema.js'

describe('featureSchema', () => {
  test('normalizeSchema successfully normalizes valid schema', () => {
    const raw = {
      schema_version: 1,
      features: [
        { name: 'price', type: 'number', required: true, min: 0, exclusiveMin: true },
        { name: 'bedrooms', type: 'integer', required: true, min: 0 },
        { name: 'waterfront', type: 'binary', required: false },
        { name: 'view', type: 'categorical', values: [0, 1, 2, 3, 4] },
      ],
      target_labels: { 0: 'Cheaper', 1: 'Reasonable', 2: 'Over priced', 3: 'Too over priced' },
    }

    const normalized = normalizeSchema(raw)
    assert.strictEqual(normalized.schema_version, 1)
    assert.strictEqual(normalized.features.length, 4)
    assert.strictEqual(normalized.features[0].name, 'price')
    assert.strictEqual(normalized.features[0].exclusiveMin, true)
    assert.strictEqual(normalized.features[2].required, false)
    assert.strictEqual(normalized.target_labels[0], 'Cheaper')
  })

  test('normalizeSchema throws readable error when feature has no name', () => {
    const raw = {
      features: [
        { name: 'price', type: 'number' },
        { type: 'integer' }, // missing name at index 1 -> #2
      ],
    }

    assert.throws(
      () => normalizeSchema(raw),
      /feature_schema\.json: feature #2 has no name/
    )
  })

  test('normalizeSchema throws readable error on unknown feature type', () => {
    const raw = {
      features: [
        { name: 'custom_col', type: 'matrix' },
      ],
    }

    assert.throws(
      () => normalizeSchema(raw),
      /feature_schema\.json: feature "custom_col" has unknown type "matrix"/
    )
  })

  test('getFeature and isRequired helper functions work properly', () => {
    const schema = normalizeSchema(MOCK_SCHEMA)
    const priceFeature = getFeature(schema, 'price')
    assert.ok(priceFeature)
    assert.strictEqual(priceFeature.name, 'price')
    assert.strictEqual(isRequired(priceFeature), true)

    const nonExistent = getFeature(schema, 'non_existent_column')
    assert.strictEqual(nonExistent, null)
  })
})
