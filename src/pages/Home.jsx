import { lazy, Suspense, useState } from 'react'
import { Link } from 'react-router-dom'
import { CLASS_NAMES } from '../lib/schema.js'
import { useFontMetrics } from '../lib/fontMetrics.js'
import MeasureSheet from '../components/MeasureSheet.jsx'
import Wordmark from '../components/Wordmark.jsx'

const House3D = lazy(() => import('../components/House3D.jsx'))

export default function Home() {
  const classes = Object.entries(CLASS_NAMES)
  const metrics = useFontMetrics()
  const [active, setActive] = useState(1)

  return (
    <>
      <section className="home-hero proof">
        <div className="container home-stage">
          {/* The sheet is the crop-marked page: its edges are the content edges, the registration
              targets sit in the gutters at the middle of its sides. */}
          <MeasureSheet className="home-sheet crop crop--sheet" title="HousePrice AI · Wordmark" metrics={metrics}>
            <span className="reg reg--left" aria-hidden="true" />
            <span className="reg reg--right" aria-hidden="true" />

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
        </div>
      </section>

      <section className="home-classes" aria-labelledby="class-guide-title">
        <div className="container home-classes__inner">
          <div className="proof-sheet crop crop--sheet home-classes__card">
            <div className="proof-sheet__head">
              <h2 id="class-guide-title">The four class labels</h2>
              <span className="proof-sheet__readout" aria-live="polite">
                Class {active}: {CLASS_NAMES[active]}
              </span>
            </div>
            <div className="home-model__stage">
              <Suspense fallback={null}>
                <House3D classIndex={active} label={`Price class ${active}: ${CLASS_NAMES[active]}.`} />
              </Suspense>
            </div>
            <div className="home-model__picks" role="group" aria-label="Price class">
              {classes.map(([classId, label]) => {
                const id = Number(classId)
                return (
                  <button
                    key={label}
                    type="button"
                    className={id === active ? 'primary-button' : 'secondary-button'}
                    aria-pressed={id === active}
                    onClick={() => setActive(id)}
                  >
                    {classId} · {label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
