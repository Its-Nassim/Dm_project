export default function SchemaField({
  label,
  name,
  value,
  onChange,
  type = 'number',
  unit = '',
  required = false,
  invalid = false,
}) {
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
    </label>
  )
}
