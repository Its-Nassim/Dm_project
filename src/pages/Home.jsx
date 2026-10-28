import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { calculateValuation } from './PredictionForm'
import PropertyImage from '../components/PropertyImage'
import './Home.css'

const tourJobs = [
  {
    id: 'prediction',
    title: 'Property valuation form',
    desc: 'Configure bedrooms, bathrooms, living area, and waterfront status.',
    path: '/prediction',
    previewLabel: 'Input configuration',
    previewTitle: '18 property parameters',
    previewDetail: 'Select bedroom counts, square footage, zip code, and grade ratings to test valuation inputs.',
    tag: 'Interactive form',
    image: '/images/properties/prop-single-family.jpg',
  },
  {
    id: 'result',
    title: 'Valuation benchmark',
    desc: 'Inspect the demonstration valuation benchmark and property parameter summary.',
    path: '/prediction/result',
    previewLabel: 'Demo calculation',
    previewTitle: '$640,000 reference value',
    previewDetail: 'Fixed demonstration output illustrating predicted valuation based on standard King County criteria.',
    tag: 'Demo result',
    image: '/images/comps/comp-phinney.jpg',
  },
  {
    id: 'analytics',
    title: 'Market distribution charts',
    desc: 'Review historical sales distributions and grade-to-price correlations.',
    path: '/analytics',
    previewLabel: 'Historical analytics',
    previewTitle: 'Price vs square footage',
    previewDetail: 'Scatter and box plot distributions from 21,613 King County property records.',
    tag: 'Market data',
    image: '/images/properties/prop-condo.jpg',
  },
  {
    id: 'model',
    title: 'Model architecture',
    desc: 'Examine Ridge regression coefficients, feature weights, and evaluation metrics.',
    path: '/model',
    previewLabel: 'Model diagnostics',
    previewTitle: 'Ridge regression weights',
    previewDetail: 'Coefficients, cross-validation scoring, and feature attribution across housing attributes.',
    tag: 'Model diagnostics',
    image: '/images/properties/prop-waterfront.jpg',
  },
]

const Home = () => {
  const [activeTourIndex, setActiveTourIndex] = useState(0)
  const [heroSqft, setHeroSqft] = useState(2180)
  const [heroZip, setHeroZip] = useState('98103')

  const heroValuation = useMemo(() => calculateValuation({
    zip: heroZip,
    sqft: heroSqft,
    lotSqft: 6400,
    bedrooms: 3,
    bathrooms: 2.25,
    floors: 2,
    grade: 8,
    yrBuilt: 1996,
    isRenovated: false,
    waterfront: false,
    view: 1,
    condition: 4,
  }), [heroZip, heroSqft])

  const currentTour = tourJobs[activeTourIndex]

  return (
    <div className="home">
      {/* Dusk Stage Hero */}
      <section className="hero" aria-label="Overview and property valuation">
        <div className="hero__photo-frame" aria-hidden="true">
          <img
            src="/images/hero/hero-dusk-residence.jpg"
            alt="Contemporary Pacific Northwest residential home at dusk"
            className="hero__photo"
            width="1920"
            height="1080"
            fetchPriority="high"
          />
          <div className="hero__scrim"></div>
          <span className="visually-hidden">HousePrice AI architectural dusk residence valuation stage</span>
        </div>

        <div className="hero__inner container">
          <div className="hero__lead-col">
            <h1 className="hero__title">Predict the Value of Your Home</h1>
            <p className="hero__desc">
              Explore property valuations calibrated against 21,613 King County housing records.
            </p>
            <div className="hero__actions">
              <Link to="/prediction" className="btn-primary">Start a valuation</Link>
              <Link to="/analytics" className="btn-outline">Explore market charts</Link>
            </div>
          </div>

          <div className="hero__console-col">
            <div className="glass hero__console" aria-label="Calibrated valuation preview">
              <div className="hero__console-head">
                <span className="hero__console-title">Valuation console</span>
                <span className="hero__status-badge">
                  <span className="hero__status-dot" aria-hidden="true"></span>
                  Model active
                </span>
              </div>

              <div className="hero__param-list">
                <div className="hero__param-row">
                  <label htmlFor="hero-zip" className="hero__param-name">Location</label>
                  <select
                    id="hero-zip"
                    value={heroZip}
                    onChange={e => setHeroZip(e.target.value)}
                    className="hero__quick-select"
                  >
                    <option value="98103">Seattle: Wallingford</option>
                    <option value="98004">Bellevue: Downtown</option>
                    <option value="98033">Kirkland: East Lake</option>
                    <option value="98052">Redmond: Tech Basin</option>
                    <option value="98040">Mercer Island</option>
                  </select>
                </div>

                <div className="hero__param-row hero__param-row--slider">
                  <div className="hero__slider-meta">
                    <span className="hero__param-name">Living area</span>
                    <span className="hero__param-val num">{heroSqft.toLocaleString()} sq ft</span>
                  </div>
                  <input
                    type="range"
                    min="1200"
                    max="4800"
                    step="50"
                    value={heroSqft}
                    aria-label="Living area in square feet"
                    onChange={e => setHeroSqft(Number(e.target.value))}
                    className="hero__quick-range"
                  />
                </div>

                <div className="hero__param-row">
                  <span className="hero__param-name">Bedrooms and baths</span>
                  <span className="hero__param-val num">3 bd / 2.25 ba</span>
                </div>
                <div className="hero__param-row">
                  <span className="hero__param-name">Construction grade</span>
                  <span className="hero__param-val num">8 Good finishes</span>
                </div>
              </div>

              <div className="hero__apricot-strip">
                <div className="hero__apricot-meta">
                  <span className="hero__apricot-label">Micro-estimate preview</span>
                  <span className="hero__apricot-price num">${heroValuation.estimate.toLocaleString()}</span>
                </div>
                <p className="hero__apricot-note">
                  Calculated at ${heroValuation.ppsf} per sq ft against King County records.
                </p>
              </div>

              <div className="hero__console-foot">
                <Link
                  to="/prediction"
                  state={{ form: { zip: heroZip, sqft: heroSqft, lotSqft: 6400, bedrooms: 3, bathrooms: 2.25, floors: 2, grade: 8, yrBuilt: 1996, isRenovated: false, waterfront: false, view: 1, condition: 4 } }}
                  className="hero__console-link"
                >
                  Configure full appraisal dossier
                  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dusk Bone Well: Dataset Reference */}
      <section className="section-well" aria-labelledby="dataset-well-title">
        <div className="container">
          <div className="well-frame">
            <div className="well-card">
              <div className="well-card__header">
                <h2 id="dataset-well-title" className="well-card__title">King County housing data</h2>
              </div>

              <div className="well-card__tally">
                <div className="well-card__metric">
                  <span className="well-card__figure num">21,613</span>
                  <span className="well-card__label">Historical home sales</span>
                </div>
                <div className="well-card__metric">
                  <span className="well-card__figure num">70</span>
                  <span className="well-card__label">King County ZIP codes</span>
                </div>
                <div className="well-card__metric">
                  <span className="well-card__figure num">18</span>
                  <span className="well-card__label">Predictive features</span>
                </div>
                <div className="well-card__metric">
                  <span className="well-card__figure num">2014 to 2015</span>
                  <span className="well-card__label">Sales recording period</span>
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
                Historical property transactions from May 2014 through May 2015 utilized to calibrate valuation metrics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dusk Ruled List beside One Glass Pane: Interface Tour */}
      <section className="section-tour" aria-labelledby="tour-heading">
        <div className="container">
          <div className="section-tour__head">
            <h2 id="tour-heading" className="section-tour__title">Interface tour</h2>
            <p className="section-tour__subtitle">
              Explore four dedicated views calibrated for property research.
            </p>
          </div>

          <div className="section-tour__layout">
            <ul className="tour-list" role="tablist" aria-label="Interface views">
              {tourJobs.map((job, idx) => {
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
                      <span className="tour-list__indicator" aria-hidden="true"></span>
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
                  alt={currentTour.previewTitle}
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

      {/* Dusk Geographic Tally */}
      <section className="section-geo" aria-labelledby="geo-title">
        <div className="container">
          <div className="geo-header">
            <h2 id="geo-title" className="geo-title">King County coverage</h2>
            <p className="geo-desc">Municipalities represented in the dataset and demo valuation models.</p>
          </div>

          <div className="geo-tally">
            <div className="geo-row">
              <span className="geo-city">Seattle</span>
              <span className="geo-note">Core urban neighborhoods and historic residential tracts</span>
              <span className="geo-code num">98101 to 98199</span>
            </div>
            <div className="geo-row">
              <span className="geo-city">Bellevue</span>
              <span className="geo-note">Eastside commercial center and lakefront residential communities</span>
              <span className="geo-code num">98004 to 98008</span>
            </div>
            <div className="geo-row">
              <span className="geo-city">Redmond</span>
              <span className="geo-note">Lake Sammamish north and technology corridor housing</span>
              <span className="geo-code num">98052 to 98053</span>
            </div>
            <div className="geo-row">
              <span className="geo-city">Kirkland</span>
              <span className="geo-note">Lake Washington waterfront and downtown residences</span>
              <span className="geo-code num">98033 to 98034</span>
            </div>
          </div>
        </div>
      </section>

      {/* Dusk Closing CTA */}
      <section className="section-cta" aria-labelledby="cta-title">
        <div className="container">
          <div className="glass cta-card">
            <div className="cta-card__content">
              <h2 id="cta-title" className="cta-card__title">Ready to test a valuation?</h2>
              <p className="cta-card__desc">
                Select custom housing specifications in our interactive form to review calibrated property results.
              </p>
            </div>
            <div className="cta-card__action">
              <Link to="/prediction" className="btn-primary">Open valuation form</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
