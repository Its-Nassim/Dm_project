import { useState } from 'react'
import { Link } from 'react-router-dom'
import { DEFAULT_CLASSES } from '../config/classes.js'
import { useSchema } from '../config/featureSchema.js'
import ClassBadge from '../components/ClassBadge.jsx'
import PropertyImage from '../components/PropertyImage'
import './Home.css'

const tourViews = [
  {
    id: 'single',
    title: 'Single house classification',
    desc: 'Enter property specifications and asking price to classify price fairness.',
    path: '/prediction',
    previewLabel: 'Interactive form',
    previewTitle: 'Single house evaluation',
    previewDetail: 'Configure bedrooms, square footage, condition, grade, and asking price to see the predicted price category and class probabilities.',
    tag: 'Single house',
    image: '/images/properties/prop-single-family.jpg',
  },
  {
    id: 'csv',
    title: 'Batch CSV classification',
    desc: 'Upload a CSV containing multiple properties to classify all asking prices at once.',
    path: '/prediction?mode=csv',
    previewLabel: 'Bulk analysis',
    previewTitle: 'CSV batch processing',
    previewDetail: 'Upload King County property rows, inspect paginated results with class badges, and export the classified results CSV.',
    tag: 'Batch upload',
    image: '/images/properties/prop-condo.jpg',
  },
  {
    id: 'model',
    title: 'Decision Tree details',
    desc: 'Review model architecture, feature importances, and evaluation metrics.',
    path: '/model',
    previewLabel: 'Model diagnostics',
    previewTitle: 'Decision Tree classifier',
    previewDetail: 'Single supervised classification model trained offline to predict price relevance against comparable houses.',
    tag: 'Model details',
    image: '/images/properties/prop-waterfront.jpg',
  },
]

const Home = () => {
  const [activeTourIndex, setActiveTourIndex] = useState(0)
  const { schema } = useSchema()
  const currentTour = tourViews[activeTourIndex]

  const featureCountDisplay = schema?.features
    ? schema.features.length
    : '-'

  return (
    <div className="home">
      {/* Dusk Stage Hero */}
      <section className="hero" aria-label="Overview and property classification">
        <div className="hero__photo-frame" aria-hidden="true">
          <img
            src="/images/hero/hero-dusk-residence.jpg"
            alt=""
            className="hero__photo"
            width="1920"
            height="1080"
            fetchPriority="high"
          />
          <div className="hero__scrim" />
        </div>

        <div className="hero__inner container">
          <div className="hero__lead-col">
            <h1 className="hero__title">Is the asking price fair for comparable houses?</h1>
            <p className="hero__desc">
              Classify a King County house&apos;s asking price as cheaper than average, reasonable, over priced or too over priced.
            </p>
            <div className="hero__actions">
              <Link to="/prediction" className="btn-primary">Classify a house</Link>
              <Link to="/prediction?mode=csv" className="btn-outline">Upload a CSV</Link>
            </div>
          </div>

          <div className="hero__console-col">
            <div className="glass hero__categories-card" aria-label="Target price categories">
              <div className="hero__categories-head">
                <span className="hero__categories-title">Four price categories</span>
                <span className="hero__status-badge">
                  <span className="hero__status-dot" aria-hidden="true" />
                  Target definition
                </span>
              </div>

              <p className="hero__categories-intro">
                The classifier predicts whether an asking price is attractive or expensive relative to comparable houses:
              </p>

              <div className="hero__categories-list">
                {DEFAULT_CLASSES.map((cls) => (
                  <div key={cls.id} className="hero__category-row">
                    <ClassBadge id={cls.id} name={cls.name} />
                  </div>
                ))}
              </div>

              <div className="hero__categories-foot">
                <Link to="/prediction" className="hero__console-link">
                  Open classification form
                  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dataset Reference Well */}
      <section className="section-well" aria-labelledby="dataset-well-title">
        <div className="container">
          <div className="well-frame">
            <div className="well-card">
              <div className="well-card__header">
                <h2 id="dataset-well-title" className="well-card__title">Classification framework</h2>
              </div>

              <div className="well-card__tally">
                <div className="well-card__metric">
                  <span className="well-card__figure num">4</span>
                  <span className="well-card__label">Price categories</span>
                </div>
                <div className="well-card__metric">
                  <span className="well-card__figure num">1</span>
                  <span className="well-card__label">Decision Tree model</span>
                </div>
                <div className="well-card__metric">
                  <span className="well-card__figure num">2</span>
                  <span className="well-card__label">Ways to use (Form or CSV)</span>
                </div>
                <div className="well-card__metric">
                  <span className="well-card__figure num">{featureCountDisplay}</span>
                  <span className="well-card__label">
                    Input features {schema?.source === 'mock' ? '(mock schema active)' : ''}
                  </span>
                </div>
              </div>

              <div className="well-card__foot">
                <Link to="/about" className="well-card__link">
                  Read dataset background and methodology
                  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            <div className="well-caption">
              <p className="well-caption__title">King County housing reference</p>
              <p className="well-caption__desc">
                House sales dataset for King County (Kaggle). The team documents the target definition and thresholds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interface Tour */}
      <section className="section-tour" aria-labelledby="tour-heading">
        <div className="container">
          <div className="section-tour__head">
            <h2 id="tour-heading" className="section-tour__title">Interface tour</h2>
            <p className="section-tour__subtitle">
              Explore three dedicated views calibrated for housing classification.
            </p>
          </div>

          <div className="section-tour__layout">
            <ul className="tour-list" role="tablist" aria-label="Interface views">
              {tourViews.map((job, idx) => {
                const isActive = activeTourIndex === idx
                return (
                  <li key={job.id} className="tour-list__item" role="presentation">
                    <button
                      type="button"
                      role="tab"
                      id={`tab-${job.id}`}
                      aria-selected={isActive}
                      aria-controls={`panel-${job.id}`}
                      className={`tour-list__button ${isActive ? 'is-active' : ''}`}
                      onClick={() => setActiveTourIndex(idx)}
                    >
                      <span className="tour-list__indicator" aria-hidden="true" />
                      <span className="tour-list__text">
                        <span className="tour-list__title">{job.title}</span>
                        {isActive && (
                          <span className="tour-list__desc">{job.desc}</span>
                        )}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>

            <div
              className="glass tour-pane"
              role="tabpanel"
              id={`panel-${currentTour.id}`}
              aria-labelledby={`tab-${currentTour.id}`}
            >
              <div className="tour-pane__header">
                <span className="tour-pane__badge">{currentTour.tag}</span>
                <span className="tour-pane__label">{currentTour.previewLabel}</span>
              </div>
              <div className="tour-pane__media">
                <PropertyImage
                  src={currentTour.image}
                  alt=""
                  aspectRatio="16/9"
                  fallbackLabel="King County Telemetry Preview"
                  loading="lazy"
                  showVignette={true}
                />
              </div>
              <h3 className="tour-pane__heading">{currentTour.previewTitle}</h3>
              <p className="tour-pane__detail">{currentTour.previewDetail}</p>
              <div className="tour-pane__action">
                <Link to={currentTour.path} className="btn-primary">
                  Open {currentTour.title.toLowerCase()}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="section-cta" aria-labelledby="cta-title">
        <div className="container">
          <div className="glass cta-card">
            <div className="cta-card__content">
              <h2 id="cta-title" className="cta-card__title">Ready to classify a house?</h2>
              <p className="cta-card__desc">
                Enter one house or upload a CSV and get its price category.
              </p>
            </div>
            <div className="cta-card__action">
              <Link to="/prediction" className="btn-primary">Open the form</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
