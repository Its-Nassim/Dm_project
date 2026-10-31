export default function SchemaField({
  label,
  name,
  value,
  onChange,
  type = 'number',
  unit = '',
  required = false,
  invalid = false,
  help = '',
}) {
  if (type === 'binary') {
    return (
      <label className="schema-field">
        <span className="schema-field__label">
          <span>{label}</span>
          {required ? <span className="schema-field__required">Required</span> : null}
        </span>
        <div className="schema-field__control schema-field__control--binary" role="radiogroup" aria-labelledby={name}>
          <input
            id={`${name}-no`}
            name={name}
            type="radio"
            value="0"
            checked={value === '0' || value === 0}
            onChange={onChange}
            aria-required={required || undefined}
          />
          <label htmlFor={`${name}-no` className="binary-option">No</label>
          <input
            id={`${name}-yes`}
            name={name}
            type="radio"
            value="1"
            checked={value === '1' || value === 1}
            onChange={onChange}
            aria-required={required || undefined}
          />
          <label htmlFor={`${name}-yes`} className="binary-option">Yes</label>
        </div>
        {help && <p className="field-help">{help}</p>}
      </label>
    )
  }

  return (
    <label className="schema-field">
      <span className="schema-field__label">
        <span>{label}</span>
        {required ? <span className="schema-field__required">Required</span> : null}
      </span>
      <div className="schema-field__control">
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          aria-required={required || undefined}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? `${name}-error` : undefined}
        />
        {unit ? <span className="schema-field__unit">{unit}</span> : null}
      </div>
      {help && <p className="field-help">{help}</p>}
    </label>
  )
}
