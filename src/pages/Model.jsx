import { CLASS_NAMES } from '../lib/schema.js'

export default function Model() {
  return (
    <section className="page-section">
      <div className="container">
        <header className="screen-intro">
          <h1>What the classifier returns.</h1>
          <p>One class label, with probabilities when the response supplies them.</p>
        </header>
        <div className="info-layout">
          <div className="info-copy">
            <p>
              The project classifies housing records using the defined property fields. Asking price is required
              and is provided in USD.
            </p>
            <ul>
              <li>Class IDs and names follow the project’s four-class schema.</li>
              <li>The interface does not show price estimates or class thresholds.</li>
              <li>Current responses come from a local mock provider.</li>
            </ul>
          </div>
          <ul className="class-reference" aria-label="Available classes">
            {Object.entries(CLASS_NAMES).map(([classId, label]) => (
              <li key={classId}>
                <span className="class-id">{classId}</span>
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
