import { Link } from 'react-router-dom'
import { CLASS_NAMES } from '../lib/schema.js'
import { useFontMetrics } from '../lib/fontMetrics.js'
import MeasureSheet from '../components/MeasureSheet.jsx'
import Wordmark from '../components/Wordmark.jsx'

export default function Home() {
  const classes = Object.entries(CLASS_NAMES)
  const metrics = useFontMetrics()

  return (
    <>
      <section className="home-hero proof">
        <MeasureSheet className="container home-sheet" title="HousePrice AI · Wordmark" metrics={metrics}>
          <Wordmark text="HousePrice AI" metrics={metrics} />

          <div className="home-grid">
            <div className="home-primary">
              <h1 data-measure="Headline">
                <span>Review a home's </span>
                <span>price classification.</span>
              </h1>
            </div>
            <div className="home-primary__side">
              <p className="lead" data-measure="Line">
                Enter listing details for a class label and any available probabilities.
              </p>
              <div className="home-links">
                <Link to="/prediction" className="primary-button" data-measure="Primary action">
                  Classify a property
                </Link>
                <Link to="/model" className="secondary-button" data-measure="Second action">
                  Model details
                </Link>
              </div>
            </div>
          </div>
        </MeasureSheet>
      </section>

      <section className="home-classes" aria-labelledby="class-guide-title">
        <div className="container">
          <section
            className="proof-sheet crop crop--sheet"
            aria-labelledby="class-guide-title"
          >
            <div className="proof-sheet__head">
              <h2 id="class-guide-title">The four class labels</h2>
              <span className="proof-sheet__readout">{classes.length} classes</span>
            </div>
            <ul className="class-list set">
              {classes.map(([classId, label]) => (
                <li key={label}>
                  <span className="class-id">{classId}</span>
                  <span className="class-name">{label}</span>
                </li>
              ))}
            </ul>
            <div className="proof-sheet__foot">
              <div className="sheet-spec">
                <span className="sheet-label">Class id</span>
                <span>Hedvig Letters Serif 400</span>
              </div>
              <div className="sheet-spec">
                <span className="sheet-label">Label</span>
                <span>Geist 500</span>
              </div>
            </div>
          </section>
        </div>
      </section>
    </>
  )
}
