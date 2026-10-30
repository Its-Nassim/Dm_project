import { CLASS_NAMES } from '../lib/schema.js'

export default function ProbabilityList({ probabilities = [] }) {
  return (
    <ul className="probability-list">
      {probabilities.map((value, index) => (
        <li key={index}>
          <div className="probability-row">
            <span>{index} {CLASS_NAMES[index]}</span>
            <strong>{Math.round(value * 100)}%</strong>
          </div>
          <div
            className="probability-bar-track"
            role="progressbar"
            aria-label={`${CLASS_NAMES[index]} probability`}
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
