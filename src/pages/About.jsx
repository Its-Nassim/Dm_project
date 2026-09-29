import { Link } from 'react-router-dom'
import './About.css'

const IconArrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
)

const IconSearch = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)

const IconClock = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
)

const IconTarget = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
)

const IconCpu = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/>
    <line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/>
    <line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/>
    <line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/>
    <line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>
  </svg>
)

const IconMapPin = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
)

const IconDatabase = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3"/>
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
  </svg>
)

const IconDoc = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
)

const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const About = () => (
  <div className="about">
    {/* ── Hero ── */}
    <section className="about-hero">
      <div className="about-hero__bg" />
      <div className="container">
        <div className="about-hero__content">
          <div className="about-hero__left">
            <span className="badge">Our Mission</span>
            <h1 className="about-hero__title">
              Democratizing<br />Real Estate<br />Intelligence.
            </h1>
            <p className="about-hero__desc">
              HousePrice AI was founded to bridge the gap between complex market data and actionable residential insights. We empower investors and homeowners with institutional-grade predictive analytics through a minimalist, high-fidelity interface.
            </p>
            <div className="about-hero__buttons">
              <Link to="/prediction" className="btn-primary">Try Prediction <IconArrow /></Link>
              <Link to="/analytics"  className="btn-outline">View Analytics</Link>
            </div>
          </div>
          <div className="about-hero__right">
            <div className="about-hero__visual">
              <div className="about-hero__visual-bg" />
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* ── Values ── */}
    <section className="about-values">
      <div className="container">
        <div className="about-values__grid">
          <div className="about-value-card">
            <div className="about-value-card__icon"><IconClock /></div>
            <h3 className="about-value-card__title">Transparency</h3>
            <p className="about-value-card__desc">
              We believe in "Explainable AI." Our models don't just give you a number; they show you the impact of every feature—from square footage to neighborhood school rankings.
            </p>
          </div>
          <div className="about-value-card">
            <div className="about-value-card__icon"><IconTarget /></div>
            <h3 className="about-value-card__title">Precision</h3>
            <p className="about-value-card__desc">
              Utilizing state-of-the-art regression algorithms trained on verified regional data to minimize variance and maximize confidence in every valuation.
            </p>
          </div>
          <div className="about-value-card">
            <div className="about-value-card__icon"><IconCpu /></div>
            <h3 className="about-value-card__title">Innovation</h3>
            <p className="about-value-card__desc">
              Continuous model retraining ensures that seasonal market shifts and economic trends are reflected in our predictions in near-real-time.
            </p>
          </div>
        </div>
      </div>
    </section>

    {/* ── Dataset Section ── */}
    <section className="about-dataset">
      <div className="container">
        <div className="about-dataset__layout">
          <div className="about-dataset__left">
            <div className="about-dataset__label-row">
              <IconDatabase />
              <span className="section-label" style={{margin:0}}>HousePrice AI Architecture</span>
            </div>
            <h2 className="about-dataset__title">The King County Housing Dataset</h2>
            <p className="about-dataset__desc">
              Our platform is built upon the foundational King County residential dataset, covering property sales in Seattle and the surrounding metropolitan area between 2014 and 2015.
            </p>

            <div className="about-dataset__stats">
              <div className="about-dataset__stat">
                <p className="about-dataset__stat-label">TOTAL RECORDS</p>
                <p className="about-dataset__stat-value">21,613</p>
              </div>
              <div className="about-dataset__stat">
                <p className="about-dataset__stat-label">UNIQUE FEATURES</p>
                <p className="about-dataset__stat-value">20</p>
              </div>
              <div className="about-dataset__stat">
                <p className="about-dataset__stat-label">DATA SOURCE</p>
                <p className="about-dataset__stat-value about-dataset__stat-mono">King County Govt</p>
              </div>
              <div className="about-dataset__stat">
                <p className="about-dataset__stat-label">VALIDATION SPLIT</p>
                <p className="about-dataset__stat-value about-dataset__stat-mono">20% Random</p>
              </div>
            </div>

            <ul className="about-dataset__list">
              <li>
                <span className="about-dataset__bullet" />
                <div>
                  <strong>Temporal Context:</strong> The dataset provides a critical historical baseline, capturing one of the most dynamic growth periods in Pacific Northwest history.
                </div>
              </li>
              <li>
                <span className="about-dataset__bullet" />
                <div>
                  <strong>Granular Features:</strong> Inputs include latitudinal/longitudinal coordinates, waterfront proximity, grade ratings, and construction quality metrics.
                </div>
              </li>
              <li>
                <span className="about-dataset__bullet" />
                <div>
                  <strong>Integrity:</strong> Rigorous cleaning protocols were applied to handle missing values and outliers in high-value luxury segments.
                </div>
              </li>
            </ul>
          </div>

          <div className="about-dataset__right">
            <div className="about-dataset__map-card">
              <div className="about-dataset__map-header">
                <span className="about-dataset__map-label"><IconMapPin /> SPATIAL DISTRIBUTION MAP</span>
                <span className="about-dataset__map-badge">VERIFIED DATA</span>
              </div>
              <div className="about-dataset__map-visual">
                <div className="about-dataset__map-bg" />
                <div className="about-dataset__map-overlay">
                  <div className="about-dataset__map-dot" style={{top:'35%',left:'42%'}} />
                  <div className="about-dataset__map-dot" style={{top:'28%',left:'58%'}} />
                  <div className="about-dataset__map-dot" style={{top:'52%',left:'36%'}} />
                  <div className="about-dataset__map-dot about-dataset__map-dot--large" style={{top:'45%',left:'50%'}} />
                  <div className="about-dataset__map-label-city" style={{top:'30%',left:'38%'}}>Seattle</div>
                  <div className="about-dataset__map-label-city" style={{top:'25%',left:'62%'}}>Bellevue</div>
                  <div className="about-dataset__map-label-city" style={{top:'50%',left:'30%'}}>Renton</div>
                </div>
              </div>
              <div className="about-dataset__dims">
                <p className="about-dataset__dims-label">KEY DIMENSIONALITIES</p>
                {[
                  {name:'Living Area (sqft_living)', desc:'Primary predictor of price'},
                  {name:'Condition/Grade', desc:'1-11 scale architectural rating'},
                  {name:'Renovation History', desc:'Captures value-add timelines'},
                  {name:'Basement Square Footage', desc:'Secondary utility indicator'},
                ].map(d => (
                  <div key={d.name} className="about-dataset__dim-row">
                    <span className="about-dataset__dim-dot" />
                    <span className="about-dataset__dim-name">{d.name}</span>
                    <span className="about-dataset__dim-desc">{d.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* ── Project Documentation ── */}
    <section className="about-docs">
      <div className="container">
        <div className="about-docs__card">
          <div className="about-docs__left">
            <h3 className="about-docs__title">Project Documentation</h3>
            <p className="about-docs__desc">
              Our comprehensive whitepaper details the feature engineering pipeline, hyperparameter tuning for our XGBoost models, and residual analysis reports.
            </p>
          </div>
          <div className="about-docs__buttons">
            <button className="btn-outline"><IconCheck /> Methodology</button>
            <button className="about-docs__data-btn"><IconSearch /> Data Audit</button>
          </div>
        </div>
      </div>
    </section>
  </div>
)

export default About
