import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import './Model.css'

const TABS = ['Architecture', 'Features', 'History']

const specs = [
  { label: 'Algorithm', value: 'XGBoost Ensemble' },
  { label: 'Parameters', value: '1.2M Weighted Neurons' },
  { label: 'Training set', value: '21.6K properties' },
  { label: 'Inference', value: '< 45ms latency' },
]

const metrics = [
  { label: 'R-squared score', badge: '+0.02 vs V2.0', value: '0.941', unit: 'R²', desc: 'Existing interface value; not verified against a connected model.' },
  { label: 'Mean absolute error', badge: '-12% error rate', value: '$9,452', unit: 'MAE', desc: 'Existing interface value; not verified against a connected model.' },
  { label: 'Root mean squared error', badge: 'Optimal range', value: '$12,840', unit: 'RMSE', desc: 'Existing interface value; not verified against a connected model.' },
  { label: 'Median error', badge: '98th percentile', value: '3.2', unit: '%', desc: 'Existing interface value; not verified against a connected model.' },
]

const features = [
  { label: 'sqft_living', value: 0.85 },
  { label: 'grade', value: 0.72 },
  { label: 'lat (location)', value: 0.65 },
  { label: 'long (location)', value: 0.45 },
  { label: 'waterfront', value: 0.38 },
  { label: 'bathrooms', value: 0.28 },
  { label: 'view', value: 0.22 },
]

const HealthBar = ({ label, value, level }) => (
  <div className="health-bar">
    <div className="health-bar__header">
      <span>{label}</span>
      <span className="health-bar__value">{value}</span>
    </div>
    <div className="health-bar__track" aria-hidden="true">
      <div className={`health-bar__fill health-bar__fill--${level}`} />
    </div>
  </div>
)

const Model = () => {
  const [activeTab, setActiveTab] = useState(0)
  const tabRefs = useRef([])

  const selectTab = index => {
    setActiveTab(index)
    tabRefs.current[index]?.focus()
  }

  const handleTabKeyDown = (event, index) => {
    let nextIndex = index
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % TABS.length
    else if (event.key === 'ArrowLeft') nextIndex = (index + TABS.length - 1) % TABS.length
    else if (event.key === 'Home') nextIndex = 0
    else if (event.key === 'End') nextIndex = TABS.length - 1
    else return
    event.preventDefault()
    selectTab(nextIndex)
  }

  return (
    <div className="model">
      <header className="model-hero">
        <div className="container">
          <div className="model-hero__content">
            <div className="model-hero__intro">
              <h1 className="model-hero__title">Model details</h1>
              <p className="model-hero__desc">
                Static interface examples; no evaluation run is verified from a connected model.
              </p>
            </div>
            <dl className="model-hero__specs">
              {specs.map(spec => (
                <div key={spec.label} className="model-spec">
                  <dt className="model-spec__label">{spec.label}</dt>
                  <dd className="model-spec__value">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </header>

      <section className="model-metrics" aria-labelledby="model-metrics-title">
        <div className="container">
          <div className="model-metrics__header">
            <div>
              <h2 className="model-metrics__title" id="model-metrics-title">Validation examples</h2>
              <p className="model-metrics__sub">
                Preserved values from the original UI. No evaluation run is available here.
              </p>
            </div>
          </div>
          <div className="model-metrics__grid">
            {metrics.map(metric => (
              <article key={metric.label} className="metric-card">
                <h3 className="metric-card__label">{metric.label}</h3>
                <p className="metric-card__value num">
                  {metric.value} <span className="metric-card__unit">{metric.unit}</span>
                </p>
                <p className="metric-card__badge">{metric.badge}</p>
                <p className="metric-card__desc">{metric.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="model-tabs-section" aria-label="Model information">
        <div className="container">
          <div className="model-tabs-bar">
            <div className="model-tabs" role="tablist" aria-label="Model information">
              {TABS.map((tab, index) => (
                <button
                  key={tab}
                  ref={element => { tabRefs.current[index] = element }}
                  id={`model-tab-${index}`}
                  className={`model-tab ${activeTab === index ? 'model-tab--active' : ''}`}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === index}
                  aria-controls={`model-panel-${index}`}
                  tabIndex={activeTab === index ? 0 : -1}
                  onClick={() => setActiveTab(index)}
                  onKeyDown={event => handleTabKeyDown(event, index)}
                >
                  <span className="model-tab__dot" aria-hidden="true"></span>
                  <span>{tab}</span>
                </button>
              ))}
            </div>
            <p className="model-tabs__note">Static interface content</p>
          </div>

          <section id="model-panel-0" className="model-arch" role="tabpanel" aria-labelledby="model-tab-0" tabIndex="0" hidden={activeTab !== 0}>
              <div className="model-arch__layout">
                <div className="model-arch__left">
                  <h3 className="model-arch__title">Architecture notes</h3>
                  <p className="model-arch__sub">
                    The original copy refers to an XGBoost ensemble and weighted neurons. Those descriptions are inconsistent and cannot be verified without the model implementation.
                  </p>
                </div>
                <div className="model-arch__right">
                  <h3 className="model-arch__health-title">Example status values</h3>
                  <HealthBar label="Generalization" value="99.2%" level="high" />
                  <HealthBar label="Bias score" value="Low (0.002)" level="low" />
                  <HealthBar label="Robustness" value="High" level="high" />
                </div>
              </div>
          </section>

          <section id="model-panel-1" className="model-fi" role="tabpanel" aria-labelledby="model-tab-1" tabIndex="0" hidden={activeTab !== 1}>
              <div className="model-panel__header">
                <h3>Feature importance examples</h3>
                <p>Static values retained from the original interface; not computed here.</p>
              </div>
              <div className="model-fi__chart">
                {features.map(feature => (
                  <div key={feature.label} className="model-fi__row">
                    <span className="model-fi__label">{feature.label}</span>
                    <div className="model-fi__track" aria-hidden="true">
                      <div className="model-fi__fill" style={{ width: `${feature.value * 100}%` }} />
                    </div>
                    <span className="model-fi__value">{(feature.value * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
          </section>

          <section id="model-panel-2" className="model-fi" role="tabpanel" aria-labelledby="model-tab-2" tabIndex="0" hidden={activeTab !== 2}>
              <div className="model-panel__header">
                <h3>Training vs. validation loss</h3>
                <p>Illustrative chart from the existing interface; no training history is connected.</p>
              </div>
              <svg
                className="model-history-chart"
                role="img"
                aria-label="Static example chart comparing training and validation loss across six epochs"
                viewBox="0 0 500 240"
              >
                <title>Static example training and validation loss</title>
                {[0, 50, 100, 150, 200].map(y => (
                  <g key={y}>
                    <line x1="40" y1={y + 20} x2="480" y2={y + 20} stroke="var(--color-rule)" strokeWidth="1" />
                    <text x="30" y={y + 24} fontSize="11" fill="var(--color-muted)" textAnchor="end">
                      {((200 - y) / 100).toFixed(1)}
                    </text>
                  </g>
                ))}
                {[0, 100, 200, 300, 400, 500].map((epoch, index) => (
                  <text key={epoch} x={40 + (index * 88)} y="236" fontSize="11" fill="var(--color-muted)" textAnchor="middle">
                    {epoch}
                  </text>
                ))}
                <polyline points="40,40 128,120 216,160 304,180 392,190 480,195" fill="none" stroke="var(--color-ink-2)" strokeWidth="2" />
                <polyline points="40,60 128,130 216,165 304,182 392,188 480,185" fill="none" stroke="var(--color-accent)" strokeWidth="2.5" />
              </svg>
              <div className="model-history-legend">
                <span>Training loss</span>
                <span>Validation loss</span>
              </div>
          </section>
        </div>
      </section>

      <section className="model-cta">
        <div className="container model-cta__inner">
          <div>
            <h2 className="model-cta__title">Continue to the form</h2>
            <p className="model-cta__desc">
              The form carries its selected values to the fixed demonstration result.
            </p>
          </div>
          <div className="model-cta__actions">
            <Link to="/prediction" className="btn-primary">Open the form</Link>
            <button type="button" className="btn-outline" disabled aria-describedby="whitepaper-note">
              Download whitepaper
            </button>
            <p id="whitepaper-note" className="model-cta__note">No whitepaper file is connected.</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Model
