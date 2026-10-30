import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './Analytics.css'

export default function Analytics() {
  const [figures, setFigures] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    fetch('/eda/manifest.json')
      .then((res) => {
        if (!res.ok) throw new Error('No EDA manifest')
        return res.json()
      })
      .then((data) => {
        if (!isMounted) return
        if (Array.isArray(data)) {
          setFigures(data)
        }
      })
      .catch(() => {
        if (!isMounted) return
        setFigures([])
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="analytics">
      <header className="analytics-hero">
        <div className="container analytics-hero__content">
          <div>
            <h1 className="analytics-hero__title">Dataset analytics</h1>
            <p className="analytics-hero__desc">
              No data is connected to this page yet. Figures from the team&apos;s exploratory analysis can be listed here.
            </p>
          </div>
        </div>
      </header>

      <section className="analytics-body">
        <div className="container">
          {loading ? (
            <div className="analytics-empty-card">
              <p>Checking for exploratory figures in /eda/manifest.json...</p>
            </div>
          ) : figures.length > 0 ? (
            <div className="analytics-gallery-grid">
              {figures.map((fig, idx) => (
                <figure key={idx} className="analytics-figure-card">
                  <img
                    src={`/eda/${fig.file}`}
                    alt={fig.title || 'Exploratory data analysis plot'}
                    className="analytics-figure-img"
                    loading="lazy"
                  />
                  <figcaption className="analytics-figure-caption">
                    <strong className="analytics-figure-title">{fig.title}</strong>
                    {fig.caption && <p className="analytics-figure-desc">{fig.caption}</p>}
                  </figcaption>
                </figure>
              ))}
            </div>
          ) : (
            <div className="analytics-empty-card">
              <div className="analytics-empty-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              </div>
              <h3 className="analytics-empty-title">Exploratory analysis figures pending</h3>
              <p className="analytics-empty-desc">
                When Member 1 (M1) exports the EDA plots (price distributions, correlations, outliers), they will appear in this gallery via <code>public/eda/manifest.json</code>.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="analytics-cta">
        <div className="container">
          <div className="analytics-cta__box">
            <div className="analytics-cta__left">
              <h3 className="analytics-cta__title">Ready to classify a house?</h3>
              <p className="analytics-cta__desc">
                Enter property specifications and asking price to predict its price category.
              </p>
            </div>
            <div className="analytics-cta__right">
              <Link to="/prediction" className="btn-primary">Open the form</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
