import { CLASS_NAMES } from '../lib/schema.js'

// The API sends probabilities either as a list in class order, or as an object keyed by class id
// ({ "0": 0.2, "1": 0.5, ... }); normalizePrediction() turns the second form into a list of
// { classId, value }. All three are read here, so a response in any of them shows its bars.
function toRows(probabilities) {
  if (!probabilities) return []
  const entries = Array.isArray(probabilities)
    ? probabilities.map((item, index) =>
        item !== null && typeof item === 'object' ? [item.classId ?? index, item.value] : [index, item],
      )
    : Object.entries(probabilities)

  return entries
    .map(([classId, value]) => ({
      classId: Number.isNaN(Number(classId)) ? classId : Number(classId),
      value: Number(value),
    }))
    .filter((row) => Number.isFinite(row.value))
    .sort((a, b) => (typeof a.classId === 'number' && typeof b.classId === 'number' ? a.classId - b.classId : 0))
}

export default function ProbabilityList({ probabilities = [] }) {
  const rows = toRows(probabilities)

  return (
    <ul className="probability-list">
      {rows.map(({ classId, value }) => (
        <li key={classId}>
          <div className="probability-row">
            <span>{classId} {CLASS_NAMES[classId]}</span>
            <strong>{Math.round(value * 100)}%</strong>
          </div>
          <div
            className="probability-bar-track"
            role="progressbar"
            aria-label={`${CLASS_NAMES[classId]} probability`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(value * 100)}
          >
            <span className="probability-bar" style={{ width: `${Math.round(value * 100)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  )
}
