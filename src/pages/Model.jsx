import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getModelInfo } from '../api/client.js'
import { useSchema } from '../config/featureSchema.js'
import { DEFAULT_CLASSES } from '../config/classes.js'
import ClassBadge from '../components/ClassBadge.jsx'
import './Model.css'

const TABS = ['Classes', 'Features', 'Evaluation']

const Model = () => {
  const [activeTab, setActiveTab] = useState(0)
  const [modelInfo, setModelInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const tabRefs = useRef([])
  const { schema } = useSchema()

  useEffect(() => {
    let isMounted = true
    getModelInfo()
      .then((data) => {
        if (!isMounted) return
        setModelInfo(data)
      })
      .catch(() => {
        if (!isMounted) return
        setModelInfo(null)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const selectTab = (index) => {
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

  const featureCount = schema?.features?.length || '-'

  const specs = [
    { label: 'Algorithm', value: 'Decision Tree classifier (single model)' },
    { label: 'Task', value: 'Supervised classification, 4 classes' },
    { label: 'Input features', value: String(featureCount) },
  ]

  if (modelInfo?.sklearn_version) {
    specs.push({ label: 'scikit-learn version', value: modelInfo.sklearn_version })
  }
  if (modelInfo?.training_rows) {
    specs.push({ label: 'Training rows', value: Number(modelInfo.training_rows).toLocaleString() })
  }

  const rawMetrics = modelInfo?.metrics || null
  const metricList = rawMetrics
    ? Object.entries(rawMetrics).map(([k, v]) => ({
        label: k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        value: typeof v === 'number' ? (v < 1 ? (v * 100).toFixed(1) + '%' : v.toLocaleString()) : String(v),
      }))
    : []

  const featureImportances = modelInfo?.feature_importances || null
  const confusionMatrix = modelInfo?.confusion_matrix || null

  return (
    <div className="model">
      <header className="model-hero">
        <div className="container">
          <div className="model-hero__content">
            <div className="model-hero__intro">
              <h1 className="model-hero__title">Model details</h1>
              <p className="model-hero__desc">
                Values on this page come from the backend&apos;s /model_info when it is connected.
              </p>
            </div>
            <dl className="model-hero__specs">
              {specs.map((spec) => (
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
              <h2 className="model-metrics__title" id="model-metrics-title">Performance metrics</h2>
              <p className="model-metrics__sub">
                Evaluated on held-out test data (stratified split, random_state=42).
              </p>
            </div>
          </div>

          {loading ? (
            <div className="model-not-connected-card">
              <p>Checking for model diagnostics from /model_info...</p>
            </div>
          ) : metricList.length > 0 ? (
            <div className="model-metrics__grid">
              {metricList.map((metric) => (
                <article key={metric.label} className="metric-card">
                  <h3 className="metric-card__label">{metric.label}</h3>
                  <p className="metric-card__value num">{metric.value}</p>
                </article>
              ))}
            </div>
          ) : (
            <div className="model-not-connected-card">
              <h3 className="model-not-connected-card__title">Model metrics are not connected yet.</h3>
              <p className="model-not-connected-card__desc">
                Metrics will appear here automatically when M4 exports the trained pipeline and M5 serves the /model_info endpoint.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="model-tabs-section" aria-label="Model information tabs">
        <div className="container">
          <div className="model-tabs-bar">
            <div className="model-tabs" role="tablist" aria-label="Model information">
              {TABS.map((tab, index) => (
                <button
                  key={tab}
                  ref={(element) => {
                    tabRefs.current[index] = element
                  }}
                  id={`model-tab-${index}`}
                  className={`model-tab ${activeTab === index ? 'model-tab--active' : ''}`}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === index}
                  aria-controls={`model-panel-${index}`}
                  tabIndex={activeTab === index ? 0 : -1}
                  onClick={() => selectTab(index)}
                  onKeyDown={(event) => handleTabKeyDown(event, index)}
                >
                  <span className="model-tab__dot" aria-hidden="true" />
                  <span>{tab}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Panel 0: Classes */}
          <section
            id="model-panel-0"
            className="model-tab-panel"
            role="tabpanel"
            aria-labelledby="model-tab-0"
            tabIndex={0}
            hidden={activeTab !== 0}
          >
            <div className="model-classes-panel">
              <div className="model-panel__header">
                <h3>Target price categories</h3>
                <p>
                  The model classifies whether an asking price is attractive or expensive relative to comparable houses:
                </p>
              </div>
              <div className="model-classes-grid">
                {DEFAULT_CLASSES.map((cls) => (
                  <div key={cls.id} className="model-class-card">
                    <ClassBadge id={cls.id} name={cls.name} />
                    <p className="model-class-card__desc">
                      {cls.id === 0 && 'Asking price is below the average of comparable houses.'}
                      {cls.id === 1 && 'Asking price matches comparable benchmark houses.'}
                      {cls.id === 2 && 'Asking price is moderately higher than comparable houses.'}
                      {cls.id === 3 && 'Asking price is substantially higher than comparable houses.'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Panel 1: Features */}
          <section
            id="model-panel-1"
            className="model-tab-panel"
            role="tabpanel"
            aria-labelledby="model-tab-1"
            tabIndex={0}
            hidden={activeTab !== 1}
          >
            <div className="model-panel__header">
              <h3>Feature importances</h3>
              <p>Importance values reported by the fitted Decision Tree model.</p>
            </div>
            {featureImportances && Array.isArray(featureImportances) && featureImportances.length > 0 ? (
              <div className="model-fi__chart">
                {featureImportances.map((f) => (
                  <div key={f.name || f.label} className="model-fi__row">
                    <span className="model-fi__label">{f.name || f.label}</span>
                    <div className="model-fi__track" aria-hidden="true">
                      <div className="model-fi__fill" style={{ width: `${(f.importance || f.value || 0) * 100}%` }} />
                    </div>
                    <span className="model-fi__value num">{((f.importance || f.value || 0) * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="model-not-connected-card">
                <p>Feature importances will be displayed once supplied by the /model_info endpoint.</p>
              </div>
            )}
          </section>

          {/* Panel 2: Evaluation */}
          <section
            id="model-panel-2"
            className="model-tab-panel"
            role="tabpanel"
            aria-labelledby="model-tab-2"
            tabIndex={0}
            hidden={activeTab !== 2}
          >
            <div className="model-panel__header">
              <h3>Confusion matrix & evaluation breakdown</h3>
              <p>Classification performance across the four target categories.</p>
            </div>
            {confusionMatrix && Array.isArray(confusionMatrix) ? (
              <div className="model-cm-table-container">
                <table className="model-cm-table">
                  <thead>
                    <tr>
                      <th scope="col">Actual \ Predicted</th>
                      {DEFAULT_CLASSES.map((c) => (
                        <th key={c.id} scope="col">Class {c.id}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {confusionMatrix.map((row, rowIdx) => (
                      <tr key={rowIdx}>
                        <th scope="row">Class {rowIdx}</th>
                        {row.map((val, colIdx) => (
                          <td key={colIdx} className="num">{val}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="model-not-connected-card">
                <p>Confusion matrix will be displayed once supplied by the /model_info endpoint.</p>
              </div>
            )}
          </section>
        </div>
      </section>

      <section className="model-cta">
        <div className="container model-cta__inner">
          <div>
            <h2 className="model-cta__title">Ready to test the classifier?</h2>
            <p className="model-cta__desc">
              Test asking prices using the single-house form or upload a batch CSV.
            </p>
          </div>
          <div className="model-cta__actions">
            <Link to="/prediction" className="btn-primary">Open the form</Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Model
