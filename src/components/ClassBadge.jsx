import { getClassById } from '../config/classes.js'
import './ClassBadge.css'

function ClassIcon({ type }) {
  if (type === 'down') {
    return (
      <svg className="class-badge__icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M8 3v10M4 9l4 4 4-4" />
      </svg>
    )
  }
  if (type === 'equal') {
    return (
      <svg className="class-badge__icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
        <line x1="3" y1="6" x2="13" y2="6" />
        <line x1="3" y1="10" x2="13" y2="10" />
      </svg>
    )
  }
  if (type === 'up') {
    return (
      <svg className="class-badge__icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M8 13V3M4 7l4-4 4 4" />
      </svg>
    )
  }
  if (type === 'double-up') {
    return (
      <svg className="class-badge__icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 8l5-5 5 5" />
        <path d="M3 13l5-5 5 5" />
      </svg>
    )
  }
  return null
}

export default function ClassBadge({
  id,
  name,
  size = 'normal',
  customLabels,
}) {
  const meta = getClassById(id, customLabels)
  const displayName = name || meta.name

  return (
    <span
      className={`class-badge class-badge--${size} class-badge--${meta.id}`}
      style={{
        '--badge-color': `var(${meta.token})`,
      }}
    >
      <span className="class-badge__icon-wrapper" aria-hidden="true">
        <ClassIcon type={meta.icon} />
      </span>
      <span className="class-badge__id">Class {meta.id}</span>
      <span className="class-badge__sep" aria-hidden="true">·</span>
      <span className="class-badge__name">{displayName}</span>
    </span>
  )
}
