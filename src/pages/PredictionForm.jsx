import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import ClassBadge from '../components/ClassBadge.jsx'
import ProbabilityList from '../components/ProbabilityList.jsx'
import SchemaField from '../components/SchemaField.jsx'
import { fieldMeta, fieldOrder } from '../config/fieldMeta.js'
import { predictSingle, predictBatch, ApiError } from '../api/client.js'
import { buildPredictionPayload } from '../lib/payload.js'
import { validateCsvRows, validateHousingInput } from '../lib/validation.js'
import { parseCsvText } from '../lib/csv.js'

export default function PredictionForm() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const mode = searchParams.get('mode') || 'single'
  const [input, setInput] = useState({})
  const [result, setResult] = useState(null)
  const [batchRows, setBatchRows] = useState([])
  const [formErrors, setFormErrors] = useState([])
  const [batchErrors, setBatchErrors] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const groupedFields = useMemo(() => {
    const groups = {
      Price: [],
      Location: [],
      'Size and layout': [],
      'Quality and history': [],
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
      const response = await predictSingle(payload)
      setResult(response)
      setFormErrors([])
    } catch (error) {
      if (error instanceof ApiError) {
        setFormErrors([error.message])
      } else {
        setFormErrors([
          error instanceof Error ? error.message : 'Classification could not be completed. Try again.',
        ])
      }
      setResult(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setInput({})
    setResult(null)
    setFormErrors([])
    setBatchRows([])
    setBatchErrors([])
  }

  const handleCsvParse = async (event) => {
    const file = event.target.files[0]
    if (!file) {
      setBatchRows([])
      setBatchErrors([])
      return
    }

    const text = await file.text()
    const rows = parseCsvText(text)
    const validation = validateCsvRows(rows)
    if (!validation.valid) {
      setBatchErrors(validation.errors)
      setBatchRows([])
      return
    }

    try {
      const response = await predictBatch(file)
      setBatchRows(response.rows || [])
      setBatchErrors([])
    } catch (error) {
      if (error instanceof ApiError) {
        setBatchErrors([error.message])
      } else {
        setBatchErrors([
          error instanceof Error ? error.message : 'The pasted rows could not be classified. Check the CSV and try again.',
        ])
      }
      setBatchRows([])
    }
  }

  return (
    <section className="page-section scope-app app-screen">
      <div className="container">
        <header className="screen-intro">
          <p className="eyebrow">King County · Decision Tree classifier</p>
          <h1>Classify an asking price</h1>
          <p className="lead">Check whether a house's asking price is attractive or too expensive relative to comparable houses.</p>
        </header>

        <div className="tabs">
          <button
            className={mode === 'single' ? 'tab-button active' : 'tab-button'}
            onClick={() => setSearchParams({ mode: 'single' })}
          >
            Single house
          </button>
          <button
            className={mode === 'csv' ? 'tab-button active' : 'tab-button'}
            onClick={() => setSearchParams({ mode: 'csv' })}
          >
            Upload CSV
          </button>
        </div>

        {mode === 'single' ? (
          <div className="workspace-grid">
            <section className="form-panel crop crop--sheet" aria-labelledby="property-form-title">
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
                        help={item.help}
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
                    {isSubmitting ? 'Predicting…' : 'Predict'}
                  </button>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={handleReset}
                    disabled={isSubmitting}
                  >
                    Reset
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

            <aside className="result-panel result-sheet" aria-live="polite">
              <h2>Classification result</h2>
              {!result && !isSubmitting && (
                <div className="empty-state">
                  <p>Fill in the form and press Predict.</p>
                </div>
              )}
              {isSubmitting && (
                <div className="empty-state" aria-busy="true">
                  <p>Predicting…</p>
                </div>
              )}
              {result && (
                <div className="result-summary">
                  <h3 tabIndex={-1}>
                    <ClassBadge classId={result.class_id} />
                  </h3>
                  <p className="result-price">
                    Echoed asking price: ${Number(input.price).toLocaleString()} USD
                  </p>
                  <p>The category compares the asking price with comparable houses, as defined by the project's target.</p>
                  {result.mock && (
                    <span className="mock-badge">Mock response, not a model output</span>
                  )}
                  <ProbabilityList probabilities={result.probabilities} />
                </div>
              )}
            </aside>
          </div>
        ) : (
          <div className="csv-panel">
            <h2>Upload CSV</h2>
            <section className="batch-panel" aria-labelledby="batch-title">
              <h3 id="batch-title">Classify several listings</h3>
              <p>Upload a CSV file with a header row. Include a price column in USD.</p>
              <label className="dropzone">
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleCsvParse}
                  aria-invalid={batchErrors.length > 0 || undefined}
                  aria-describedby={batchErrors.length ? 'batch-errors' : undefined}
                />
                <span>Choose a CSV file or drag and drop</span>
              </label>
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
                    <div key={`${row.row}-${index}`} className="batch-row">
                      <span>#{row.row}</span>
                      {row.price && <span>${Number(row.price).toLocaleString()}</span>}
                      {row.error ? (
                        <span className="error-text">{row.error}</span>
                      ) : (
                        <ClassBadge classId={row.class_id} />
                      )}
                      {row.mock && <span className="mock-badge">Mock</span>}
                    </div>
                  ))}
                </div>
              ) : null}
              <p className="batch-note">Batch responses also use the local mock provider.</p>
            </section>
          </div>
        )}
      </div>
    </section>
  )
}
