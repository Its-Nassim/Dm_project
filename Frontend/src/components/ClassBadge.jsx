import { CLASS_NAMES } from '../lib/schema.js'

export default function ClassBadge({ classId }) {
  const name = CLASS_NAMES[classId] || 'Reasonable price'
  const tone = [
    'tone-lower',
    'tone-mid',
    'tone-upper',
    'tone-high',
  ][classId] || 'tone-mid'

  return <span className={`class-badge ${tone}`}>#{classId} {name}</span>
}
