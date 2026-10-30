import { useState } from 'react'
import { getFieldMeta } from '../config/fieldMeta.js'
import './SchemaField.css'

function formatPriceDisplay(val) {
  if (val !== undefined && val !== null && val !== '') {
    const num = Number(String(val).replace(/,/g, ''))
    if (!isNaN(num)) {
      return num.toLocaleString('en-US')
    }
    return String(val)
  }
  return ''
}

export default function SchemaField({
  feature,
  value,
  onChange,
  error,
  disabled = false,
}) {
  const { name, type, required, min, max, step, values, rangeSource } = feature
  const meta = getFieldMeta(name)
  const label = meta.label || name
  const helpText = meta.help || ''

  const fieldId = `field-${name}`
  const helpId = `desc-${name}`
  const errorId = `err-${name}`

  // For price formatting: store display value locally for commas
  const [priceInput, setPriceInput] = useState(() => (name === 'price' ? formatPriceDisplay(value) : ''))
  const [isPriceFocused, setIsPriceFocused] = useState(false)

  const handlePriceChange = (e) => {
    const raw = e.target.value
    // Allow digits and commas
    const clean = raw.replace(/[^\d]/g, '')
    setPriceInput(raw)
    onChange(name, clean)
  }

  const handlePriceFocus = () => {
    setIsPriceFocused(true)
    if (value !== undefined && value !== null) {
      setPriceInput(String(value).replace(/,/g, ''))
    }
  }

  const handlePriceBlur = () => {
    setIsPriceFocused(false)
    const num = Number(String(priceInput).replace(/,/g, ''))
    if (!isNaN(num) && priceInput.trim() !== '') {
      setPriceInput(num.toLocaleString('en-US'))
      onChange(name, String(num))
    }
  }

  // Described by IDs
  const describedBy = [
    helpText ? helpId : null,
    error ? errorId : null,
  ].filter(Boolean).join(' ') || undefined

  // 1. Price field
  if (name === 'price') {
    const displayVal = isPriceFocused ? priceInput : formatPriceDisplay(value)

    return (
      <div className={`pred-field ${error ? 'pred-field--error' : ''}`}>
        <div className="pred-field__label-row">
          <label htmlFor={fieldId} className="pred-field__label">
            {label}
            {required && <span className="pred-field__required" aria-hidden="true">*</span>}
          </label>
          <code className="pred-field__col-tag num" title="Dataset column name">{name}</code>
        </div>

        <div className="pred-field__price-wrapper">
          <span className="pred-field__currency-symbol" aria-hidden="true">$</span>
          <input
            id={fieldId}
            name={name}
            type="text"
            inputMode="numeric"
            className="pred-input pred-field__price-input"
            value={displayVal}
            onChange={handlePriceChange}
            onFocus={handlePriceFocus}
            onBlur={handlePriceBlur}
            disabled={disabled}
            aria-required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            placeholder="e.g. 450,000"
          />
          <span className="pred-field__currency-tag" aria-hidden="true">USD</span>
        </div>

        {helpText && (
          <p id={helpId} className="pred-field__hint">
            {helpText}
          </p>
        )}

        {error && (
          <p id={errorId} className="pred-field__error-msg" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  }

  // 2. Binary toggle
  if (type === 'binary') {
    const isChecked = value === 1 || value === '1' || value === true

    return (
      <div className={`pred-field pred-field--binary ${error ? 'pred-field--error' : ''}`}>
        <div className="pred-binary-card">
          <div className="pred-binary-card__info">
            <span id={`${fieldId}-label`} className="pred-field__label">
              {label}
              {required && <span className="pred-field__required" aria-hidden="true">*</span>}
            </span>
            <code className="pred-field__col-tag num" title="Dataset column name">{name}</code>
            {helpText && (
              <p id={helpId} className="pred-field__hint pred-binary-card__hint">
                {helpText}
              </p>
            )}
          </div>

          <button
            id={fieldId}
            type="button"
            role="switch"
            aria-checked={isChecked}
            aria-labelledby={`${fieldId}-label`}
            aria-describedby={describedBy}
            className={`pred-toggle ${isChecked ? 'is-on' : ''}`}
            disabled={disabled}
            onClick={() => onChange(name, isChecked ? 0 : 1)}
          >
            <span className="pred-toggle__handle" aria-hidden="true" />
          </button>
        </div>

        {error && (
          <p id={errorId} className="pred-field__error-msg" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  }

  // 3. Categorical (select or mock zipcode text)
  if (type === 'categorical') {
    const hasValues = Array.isArray(values) && values.length > 0

    return (
      <div className={`pred-field ${error ? 'pred-field--error' : ''}`}>
        <div className="pred-field__label-row">
          <label htmlFor={fieldId} className="pred-field__label">
            {label}
            {required && <span className="pred-field__required" aria-hidden="true">*</span>}
          </label>
          <code className="pred-field__col-tag num" title="Dataset column name">{name}</code>
        </div>

        {hasValues ? (
          <select
            id={fieldId}
            name={name}
            className="pred-input pred-select"
            value={value !== undefined && value !== null ? value : ''}
            onChange={(e) => onChange(name, e.target.value)}
            disabled={disabled}
            aria-required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
          >
            <option value="">Select…</option>
            {values.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={fieldId}
            name={name}
            type="text"
            inputMode="numeric"
            maxLength={name === 'zipcode' ? 5 : undefined}
            className="pred-input"
            value={value !== undefined && value !== null ? value : ''}
            onChange={(e) => onChange(name, e.target.value)}
            disabled={disabled}
            aria-required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            placeholder={name === 'zipcode' ? '5-digit ZIP code' : ''}
          />
        )}

        {helpText && (
          <p id={helpId} className="pred-field__hint">
            {helpText}
            {!hasValues && name === 'zipcode' && rangeSource === 'mock' && ' (temporary free input)'}
          </p>
        )}

        {error && (
          <p id={errorId} className="pred-field__error-msg" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  }

  // 4. Number or Integer field
  return (
    <div className={`pred-field ${error ? 'pred-field--error' : ''}`}>
      <div className="pred-field__label-row">
        <label htmlFor={fieldId} className="pred-field__label">
          {label}
          {required && <span className="pred-field__required" aria-hidden="true">*</span>}
        </label>
        <code className="pred-field__col-tag num" title="Dataset column name">{name}</code>
      </div>

      <input
        id={fieldId}
        name={name}
        type="number"
        inputMode="decimal"
        step={step !== undefined ? step : (type === 'integer' ? '1' : 'any')}
        min={min !== null && min !== undefined ? min : undefined}
        max={max !== null && max !== undefined ? max : undefined}
        className="pred-input"
        value={value !== undefined && value !== null ? value : ''}
        onChange={(e) => onChange(name, e.target.value)}
        onWheel={(e) => e.currentTarget.blur()}
        disabled={disabled}
        aria-required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        placeholder={min !== null && max !== null ? `${min} - ${max}` : ''}
      />

      {helpText && (
        <p id={helpId} className="pred-field__hint">
          {helpText}
        </p>
      )}

      {error && (
        <p id={errorId} className="pred-field__error-msg" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
