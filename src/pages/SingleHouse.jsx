import { useState, useRef } from 'react'
import { useSchema } from '../config/featureSchema.js'
import { GROUP_ORDER, getFieldMeta } from '../config/fieldMeta.js'
import { validateSingle } from '../lib/validation.js'
import { buildPayload } from '../lib/payload.js'
import { predictSingle, normalizePrediction, ApiError } from '../api/client.js'
import SchemaField from '../components/SchemaField.jsx'
import ErrorBanner from '../components/ErrorBanner.jsx'
import ClassBadge from '../components/ClassBadge.jsx'
import ProbabilityList from '../components/ProbabilityList.jsx'

export default function SingleHouse() {
  const { schema, loading: schemaLoading, error: schemaError, reload: reloadSchema } = useSchema()

  const [formValues, setFormValues] = useState({})
  const [fieldErrors, setFieldErrors] = useState({})
  const [warnings, setWarnings] = useState([])
  const [bannerError, setBannerError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [predictionResult, setPredictionResult] = useState(null)
  const [submittedPrice, setSubmittedPrice] = useState(null)

  const resultHeadingRef = useRef(null)
  const abortControllerRef = useRef(null)

  const handleFieldChange = (name, value) => {
    setFormValues((prev) => ({ ...prev, [name]: value }))
    // Clear field-level error when modified
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
    if (bannerError) {
      setBannerError(null)
    }
  }

  const handleReset = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setFormValues({})
    setFieldErrors({})
    setWarnings([])
    setBannerError(null)
    setPredictionResult(null)
    setSubmittedPrice(null)
    setIsSubmitting(false)

    // Return focus to first field (price)
    const firstField = document.getElementById('field-price')
    if (firstField) {
      firstField.focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!schema) return

    setBannerError(null)

    // 1. Client validation
    const { errors, warnings: newWarnings } = validateSingle(formValues, schema)
    setWarnings(newWarnings)

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setBannerError({
        title: 'Please correct the following errors before submitting',
        fields: errors,
      })
      // Move focus to first invalid field
      const firstInvalidKey = Object.keys(errors)[0]
      const el = document.getElementById(`field-${firstInvalidKey}`)
      if (el) {
        el.focus()
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }

    setFieldErrors({})

    // 2. Build payload
    let payload
    try {
      payload = buildPayload(formValues, schema)
    } catch (err) {
      setBannerError({ title: 'Payload error', message: err.message })
      return
    }

    // 3. Submit request
    setIsSubmitting(true)
    setPredictionResult(null)
    setSubmittedPrice(payload.price)

    try {
      const rawRes = await predictSingle(payload)
      const normalized = normalizePrediction(rawRes, schema.target_labels)
      setPredictionResult(normalized)

      // Move focus to result heading
      setTimeout(() => {
        if (resultHeadingRef.current) {
          resultHeadingRef.current.focus()
        }
      }, 50)
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.kind === 'validation') {
          setBannerError({
            title: 'The server rejected the submitted values',
            message: err.message,
            fields: err.fieldErrors,
            details: err.details,
          })
          if (err.fieldErrors) {
            setFieldErrors(err.fieldErrors)
          }
        } else {
          setBannerError({
            title: 'Classification failed',
            message: err.message,
            details: err.details,
            onAction: () => handleSubmit(e),
            actionLabel: 'Try again',
          })
        }
      } else {
        setBannerError({
          title: 'Classification failed',
          message: err?.message || 'An unexpected error occurred.',
          onAction: () => handleSubmit(e),
          actionLabel: 'Try again',
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (schemaLoading) {
    return (
      <div className="single-house single-house--loading" aria-busy="true">
        <div className="single-house__skeleton-header" />
        <div className="single-house__skeleton-body" />
      </div>
    )
  }

  if (schemaError) {
    return (
      <div className="single-house">
        <ErrorBanner
          title="Feature schema could not be loaded"
          message={schemaError}
          onAction={reloadSchema}
          actionLabel="Retry loading schema"
        />
      </div>
    )
  }

  // Group schema features according to fieldMeta groups
  const groupedFeatures = {}
  GROUP_ORDER.forEach((groupName) => {
    groupedFeatures[groupName] = []
  })

  schema.features.forEach((feature) => {
    const meta = getFieldMeta(feature.name)
    const grp = meta.group || 'Other'
    if (!groupedFeatures[grp]) {
      groupedFeatures[grp] = []
    }
    groupedFeatures[grp].push(feature)
  })

  return (
    <div className="single-house">
      {schema.source === 'mock' && (
        <aside className="pred-mock-notice" role="note">
          <svg className="pred-mock-notice__icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <p className="pred-mock-notice__text">
            <strong>Mock schema active:</strong> derived from the dataset column list. Ranges and options are placeholders to be replaced by M3&apos;s feature_schema.json.
          </p>
        </aside>
      )}

      {bannerError && (
        <ErrorBanner
          title={bannerError.title}
          message={bannerError.message}
          fields={bannerError.fields}
          details={bannerError.details}
          onAction={bannerError.onAction}
          actionLabel={bannerError.actionLabel}
        />
      )}

      {warnings.length > 0 && (
        <div className="pred-warnings-banner" role="region" aria-label="Input notices">
          {warnings.map((w, idx) => (
            <p key={idx} className="pred-warnings-banner__item">
              <span className="pred-warnings-banner__icon" aria-hidden="true">ℹ</span> {w}
            </p>
          ))}
        </div>
      )}

      <div className="single-house__layout">
        {/* Form Column */}
        <div className="single-house__form-col">
          <form onSubmit={handleSubmit} noValidate>
            <fieldset disabled={isSubmitting} className="single-house__fieldset-wrapper">
              {GROUP_ORDER.map((groupName) => {
                const feats = groupedFeatures[groupName]
                if (!feats || feats.length === 0) return null

                return (
                  <fieldset key={groupName} className="pred-fieldset">
                    <legend className="pred-fieldset__legend">{groupName}</legend>
                    <div className="pred-fieldset__grid">
                      {feats.map((feature) => (
                        <SchemaField
                          key={feature.name}
                          feature={feature}
                          value={formValues[feature.name]}
                          onChange={handleFieldChange}
                          error={fieldErrors[feature.name]}
                          disabled={isSubmitting}
                        />
                      ))}
                    </div>
                  </fieldset>
                )
              })}

              <div className="single-house__actions">
                <button
                  type="submit"
                  className="btn btn-primary single-house__submit-btn"
                  disabled={isSubmitting}
                  aria-busy={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="single-house__spinner" aria-hidden="true" />
                      <span>Classifying…</span>
                    </>
                  ) : (
                    'Predict price category'
                  )}
                </button>

                <button
                  type="button"
                  className="btn btn-outline single-house__reset-btn"
                  disabled={isSubmitting}
                  onClick={handleReset}
                >
                  Reset
                </button>
              </div>
            </fieldset>
          </form>
        </div>

        {/* Result Column */}
        <div className="single-house__result-col">
          <section
            className="pred-result-card"
            aria-live="polite"
            aria-atomic="true"
          >
            <div className="pred-result-card__header">
              <span className="pred-result-card__eyebrow">Classification output</span>
              {predictionResult?.mock && (
                <span className="pred-result-card__mock-pill">Mock response, not a model output</span>
              )}
            </div>

            {isSubmitting && (
              <div className="pred-result-card__loading" aria-busy="true">
                <span className="single-house__spinner single-house__spinner--large" aria-hidden="true" />
                <p className="pred-result-card__loading-text">Analyzing comparable houses in King County…</p>
              </div>
            )}

            {!isSubmitting && !predictionResult && (
              <div className="pred-result-card__idle">
                <div className="pred-result-card__idle-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </div>
                <h3 className="pred-result-card__idle-title">Ready for classification</h3>
                <p className="pred-result-card__idle-desc">
                  Fill in the property details including asking price and press <strong>Predict price category</strong>.
                </p>
              </div>
            )}

            {!isSubmitting && predictionResult && (
              <div className="pred-result-card__content">
                <div className="pred-result-card__badge-wrapper">
                  <h3
                    ref={resultHeadingRef}
                    tabIndex={-1}
                    className="pred-result-card__heading"
                  >
                    <ClassBadge
                      id={predictionResult.classId}
                      name={predictionResult.className}
                      size="large"
                      customLabels={schema.target_labels}
                    />
                  </h3>
                </div>

                {submittedPrice !== null && (
                  <div className="pred-result-card__price-echo">
                    <span className="pred-result-card__price-label">Asking price evaluated</span>
                    <strong className="pred-result-card__price-val num">
                      ${Number(submittedPrice).toLocaleString('en-US')} USD
                    </strong>
                  </div>
                )}

                <p className="pred-result-card__explanatory-note">
                  The category reflects whether the asking price is attractive or too expensive relative to comparable houses, as defined by the project target.
                </p>

                <ProbabilityList
                  probabilities={predictionResult.probabilities}
                  mock={predictionResult.mock}
                  customLabels={schema.target_labels}
                />
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
