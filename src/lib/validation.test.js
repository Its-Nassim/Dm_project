import { test, describe } from 'node:test'
import assert from 'node:assert'
import { validateSingle } from './validation.js'
import { normalizeSchema, MOCK_SCHEMA } from '../config/featureSchema.js'

describe('validateSingle', () => {
  const schema = normalizeSchema(MOCK_SCHEMA)

  test('detects missing, zero, and negative asking price', () => {
    // Missing price
    const res1 = validateSingle({ price: '' }, schema)
    assert.ok(res1.errors.price)
    assert.match(res1.errors.price, /required/i)

    // Zero price
    const res2 = validateSingle({ price: '0' }, schema)
    assert.ok(res2.errors.price)
    assert.match(res2.errors.price, /greater than 0/i)

    // Negative price
    const res3 = validateSingle({ price: '-500' }, schema)
    assert.ok(res3.errors.price)
    assert.match(res3.errors.price, /greater than 0/i)
  })

  test('detects out-of-range categorical fields', () => {
    // grade 14 (allowed 1-13)
    const resGrade = validateSingle({ price: '300000', grade: '14' }, schema)
    assert.ok(resGrade.errors.grade)

    // view 5 (allowed 0-4)
    const resView = validateSingle({ price: '300000', view: '5' }, schema)
    assert.ok(resView.errors.view)

    // condition 0 (allowed 1-5)
    const resCond = validateSingle({ price: '300000', condition: '0' }, schema)
    assert.ok(resCond.errors.condition)
  })

  test('detects non-integer values for integer fields like bedrooms', () => {
    const res = validateSingle({ price: '300000', bedrooms: '3.5' }, schema)
    assert.ok(res.errors.bedrooms)
    assert.match(res.errors.bedrooms, /whole number/i)
  })

  test('generates soft warning only when all three sqft fields exist and mismatch', () => {
    const valuesMismatch = {
      price: '500000',
      sqft_living: '2500',
      sqft_above: '1800',
      sqft_basement: '500', // 1800 + 500 = 2300 != 2500
    }
    const resMismatch = validateSingle(valuesMismatch, schema)
    assert.strictEqual(resMismatch.warnings.length, 1)
    assert.match(resMismatch.warnings[0], /differs from the sum/i)

    const valuesMatch = {
      price: '500000',
      sqft_living: '2500',
      sqft_above: '2000',
      sqft_basement: '500', // 2000 + 500 = 2500
    }
    const resMatch = validateSingle(valuesMatch, schema)
    assert.strictEqual(resMatch.warnings.length, 0)
  })
})
