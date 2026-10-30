import { useMemo, useState } from 'react'
import ClassBadge from '../components/ClassBadge.jsx'
import ProbabilityList from '../components/ProbabilityList.jsx'
import SchemaField from '../components/SchemaField.jsx'
import { fieldMeta, fieldOrder } from '../config/fieldMeta.js'
import { requestPrediction, requestBatchPrediction } from '../api/mock.js'
import { buildPredictionPayload } from '../lib/payload.js'
import { validateCsvRows, validateHousingInput } from '../lib/validation.js'
import { parseCsvText } from '../lib/csv.js'

export default function PredictionForm() {
  const [input, setInput] = useState({})
  const [result, setResult] = useState(null)
  const [batchRows, setBatchRows] = useState([])
  const [formErrors, setFormErrors] = useState([])
  const [batchErrors, setBatchErrors] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const groupedFields = useMemo(() => {
    const groups = {
      Pricing: [],
      Property: [],
      History: [],
      Location: [],
      Identifiers: [],
    }

    fieldOrder.forEach((key) => {
      const meta = fieldMeta[key]
      groups[meta.group] ||= []
      groups[meta.group].push({ key, ...meta })
    })

    return groups
  }, [])
  const priceInvalid = formErrors.some((message) => message.toLowerCase().includes('price'))

  const handleChange = (event) => {
    const { name, value } = event.target
    setInput((previous) => ({ ...previous, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validation = validateHousingInput(input)
    if (!validation.valid) {
      setFormErrors(validation.errors)
      setResult(null)
      return
    }

    const payload = buildPredictionPayload(input)
    setIsSubmitting(true)
    try {
      const response = await requestPrediction(payload)
      setResult(response)
      setFormErrors([])
    } catch (error) {
      setFormErrors([
        error instanceof Error ? error.message : 'Classification could not be completed. Try again.',
      ])
      setResult(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCsvParse = async (event) => {
    const csvText = event.target.value
    if (!csvText) {
      setBatchRows([])
      setBatchErrors([])
      return
    }

    const rows = parseCsvText(csvText)
    const validation = validateCsvRows(rows)
    if (!validation.valid) {
      setBatchErrors(validation.errors)
      setBatchRows([])
      return
    }

    try {
      const response = await requestBatchPrediction(rows)
      setBatchRows(response)
      setBatchErrors([])
    } catch (error) {
      setBatchErrors([
        error instanceof Error ? error.message : 'The pasted rows could not be classified. Check the CSV and try again.',
      ])
      setBatchRows([])
    }
  }

  return (
    <section className="page-section">
      <div className="container">
        <header className="screen-intro">
          <h1>Classify a listing.</h1>
          <p>Enter the property details. Asking price is required and must be in USD.</p>
        </header>
        <div className="workspace-grid">
          <section className="form-panel" aria-labelledby="property-form-title">
            <div className="panel-heading">
              <h2 id="property-form-title">Property details</h2>
              <p>Local mock response</p>
            </div>
            <form id="property-inputs" onSubmit={handleSubmit} className="property-form">
            {Object.entries(groupedFields).map(([group, items]) => (
              <fieldset key={group} className="field-group">
                <legend>{group}</legend>
                <div className="field-grid">
                  {items.map((item) => (
                    <SchemaField
                      key={item.key}
                      label={item.label}
                      name={item.key}
                      value={input[item.key] ?? ''}
                      onChange={handleChange}
                      type={item.type}
                      unit={item.unit}
                      required={item.key === 'price'}
                      invalid={item.key === 'price' && priceInvalid}
                    />
                  ))}
                </div>
              </fieldset>
            ))}

              <div className="form-actions">
                <button
                  type="submit"
                  className="primary-button"
                  disabled={isSubmitting}
                  aria-busy={isSubmitting}
                >
                  {isSubmitting ? 'Classifying…' : 'Classify property'}
                </button>
              </div>
            </form>

            {formErrors.length ? (
              <div
                id={priceInvalid ? 'price-error' : undefined}
                className="error-box"
                role="alert"
              >
                {formErrors.map((message) => (
                  <p key={message}>{message}</p>
                ))}
              </div>
            ) : null}
          </section>

          <aside className="result-panel" aria-live="polite">
            <h2>Classification result</h2>
            {result ? (
              <div className="result-summary">
                <ClassBadge classId={result.class_id} />
                <p>Generated by the local mock provider, not a connected trained model.</p>
                <ProbabilityList probabilities={result.probabilities} />
              </div>
            ) : (
              <div className="empty-state">
                <h3>No classification yet</h3>
                <p>Submit property details to see the class label here.</p>
              </div>
            )}

            <section className="batch-panel" aria-labelledby="batch-title">
              <h3 id="batch-title">Classify several listings</h3>
              <p>Paste a CSV with a header row. Include a price column in USD.</p>
              <label className="visually-hidden" htmlFor="batch-csv">CSV rows</label>
              <textarea
                id="batch-csv"
                name="batchCsv"
                rows="6"
                placeholder="id,price,bedrooms,bathrooms,sqft_living"
                onChange={handleCsvParse}
                aria-invalid={batchErrors.length > 0 || undefined}
                aria-describedby={batchErrors.length ? 'batch-errors' : undefined}
              />
              {batchErrors.length ? (
                <div id="batch-errors" className="error-box" role="alert">
                  {batchErrors.map((message) => (
                    <p key={message}>{message}</p>
                  ))}
                </div>
              ) : null}
              {batchRows.length ? (
                <div className="batch-results" aria-label="Batch classifications">
                  {batchRows.map((row, index) => (
                    <div key={`${row.id}-${index}`} className="batch-row">
                      <span>#{row.id}</span>
                      <ClassBadge classId={row.class_id} />
                    </div>
                  ))}
                </div>
              ) : null}
              <p className="batch-note">Batch responses also use the local mock provider.</p>
            </section>
          </aside>
        </div>
      </div>
    </section>
  )
}
