import { Link } from 'react-router-dom'
import './PredictionResult.css'

/* ── Icons ── */
const IconArrowLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
)

const IconDownload = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
)

const IconShare = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
)

const IconTrendUp = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
    <polyline points="16 7 22 7 22 13"/>
  </svg>
)

const IconTrendDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/>
    <polyline points="16 17 22 17 22 11"/>
  </svg>
)

const IconMapPin = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
)

const IconStar = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)

const IconExpand = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
    <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
  </svg>
)

const IconBed = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9V20M3 14h18M21 9v11"/><rect x="5" y="4" width="14" height="5" rx="1"/>
  </svg>
)

const IconBath = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 6L9 3.5a2.5 2.5 0 0 1 5 0V6"/>
    <path d="M3 14h18v4a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-4z"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)

const IconFloors = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="4"/><rect x="3" y="10" width="18" height="4"/><rect x="3" y="17" width="18" height="4"/>
  </svg>
)

const IconCalendar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)

const IconPackage = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
)

const IconDoc = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.15">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
  </svg>
)

const IconArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
)

const IconChart = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
)

/* ── Feature Bar Chart (horizontal) ── */
const featureData = [
  { label: 'Living\nArea(sqft)', positive: 0.95, negative: 0 },
  { label: 'Neighborhood',       positive: 0.6,  negative: 0 },
  { label: 'Condition',          positive: 0.25, negative: 0 },
  { label: 'Year Built',         positive: 0,    negative: 0.15 },
  { label: 'Bedrooms',           positive: 0.22, negative: 0 },
  { label: 'Bathrooms',          positive: 0,    negative: 0.1 },
]

const FeatureChart = () => (
  <div className="feature-chart">
    {featureData.map(f => (
      <div key={f.label} className="feature-chart__row">
        <span className="feature-chart__label">{f.label.replace('\n', ' ')}</span>
        <div className="feature-chart__bars">
          {f.negative > 0 && (
            <div className="feature-chart__bar feature-chart__bar--neg" style={{width: `${f.negative * 100}%`}} />
          )}
          {f.positive > 0 && (
            <div className="feature-chart__bar feature-chart__bar--pos" style={{width: `${f.positive * 100}%`}} />
          )}
        </div>
      </div>
    ))}
    <div className="feature-chart__legend">
      <span className="feature-chart__legend-item feature-chart__legend--pos">● Positive</span>
      <span className="feature-chart__legend-item feature-chart__legend--neg">● Negative</span>
    </div>
  </div>
)

const propSummary = [
  { icon: <IconExpand />, label: 'LIVING SPACE',  value: '3,250 sqft', sub: 'Spacious Interior' },
  { icon: <IconBed />,    label: 'BEDROOMS',      value: '4 Rooms',    sub: 'Master Ensuite' },
  { icon: <IconBath />,   label: 'BATHROOMS',     value: '3.5 Baths',  sub: 'Modern Fittings' },
  { icon: <IconFloors />, label: 'FLOORS',        value: '2 Levels',   sub: 'Open Concept' },
  { icon: <IconCalendar />,label:'YEAR BUILT',    value: '1994',       sub: 'Renovated 2016' },
  { icon: <IconPackage />,label: 'LOT SIZE',      value: '7,500 sqft', sub: 'Landscaped' },
]

const PredictionResult = () => (
  <div className="pred-result">
    <div className="pred-result__page">
      {/* ── Top Section ── */}
      <div className="pred-result__top">
        {/* Left ── */}
        <div className="pred-result__left">
          <Link to="/prediction" className="pred-result__back">
            <IconArrowLeft /> Adjust Parameters
          </Link>

          <h1 className="pred-result__title">Property Valuation Result</h1>
          <p className="pred-result__sub">
            Our advanced machine learning model has analyzed your inputs against regional market trends to provide this estimate.
          </p>

          <div className="pred-result__price-card">
            <div className="pred-result__price-header">
              <span className="pred-result__price-label">ESTIMATED MARKET VALUE</span>
              <span className="pred-result__live-badge">LIVE PROJECTION</span>
            </div>
            <div className="pred-result__price">
              $1,245,000 <span className="pred-result__currency">USD</span>
            </div>
            <div className="pred-result__growth">
              <IconTrendUp />
              <span className="pred-result__growth-text">+12.4% vs Neighborhood Avg</span>
            </div>
            <p className="pred-result__growth-note">Projected growth over next 12 months</p>
          </div>

          <div className="pred-result__actions">
            <button className="btn-primary"><IconDownload /> Export Report</button>
            <button className="btn-outline"><IconShare /> Share Result</button>
          </div>
        </div>

        {/* Right ── */}
        <div className="pred-result__right">
          <div className="pred-result__house-img">
            <img src="/assets/luxury-house.jpg" alt="Luxury Home" className="img-placeholder" style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}} />
            <div className="pred-result__house-info">
              <div className="pred-result__house-tag">
                <IconMapPin /> LOCATION
                <strong>Mercer Island, WA</strong>
              </div>
              <div className="pred-result__house-tag">
                <IconStar /> GRADE
                <strong>Premium Plus (11/13)</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Analysis Section ── */}
      <div className="pred-result__analysis">
        {/* Model Insight ── */}
        <div className="pred-result__insight">
          <h3 className="pred-result__section-title">
            <span className="pred-result__icon-cyan">🔷</span> Model Insight
          </h3>
          <p className="pred-result__section-sub">How the AI views this valuation</p>

          <div className="pred-result__confidence-label">AI CONFIDENCE SCORE</div>
          <div className="pred-result__confidence-row">
            <span className="pred-result__confidence-val">94%</span>
            <span className="pred-result__confidence-badge">High Accuracy</span>
          </div>
          <div className="pred-result__conf-track">
            <div className="pred-result__conf-fill" style={{width:'94%'}} />
          </div>
          <p className="pred-result__conf-note">
            Based on 21,613 historical transactions in King County with 98.4% R² model performance.
          </p>

          <div className="pred-result__trends">
            <p className="pred-result__trends-label">KEY MARKET TRENDS</p>
            {[
              { icon: <IconTrendUp />,   title: 'Inventory Scarcity',  desc: 'Low supply in this zip code is inflating prices.' },
              { icon: <IconTrendDown />, title: 'Interest Rates',       desc: 'Recent rate hikes are softening buyer leverage.' },
              { icon: <IconChart />,     title: 'Area Growth',          desc: 'High-tech employment hub expansion nearby.' },
            ].map(t => (
              <div key={t.title} className="pred-result__trend-item">
                <span className="pred-result__trend-icon">{t.icon}</span>
                <div>
                  <p className="pred-result__trend-title">{t.title}</p>
                  <p className="pred-result__trend-desc">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pred-result__deep-dive">
            <div className="pred-result__deep-icon"><IconDoc /></div>
            <div>
              <h4 className="pred-result__deep-title">Want a deep dive?</h4>
              <p className="pred-result__deep-desc">
                Explore the underlying machine learning architecture and training datasets used for this prediction.
              </p>
              <Link to="/model" className="pred-result__deep-link">
                Review Model Transparency <IconArrowRight />
              </Link>
            </div>
          </div>
        </div>

        {/* Feature Analysis ── */}
        <div className="pred-result__features">
          <div className="pred-result__feat-header">
            <h3 className="pred-result__section-title">Feature Influence Analysis</h3>
            <div className="pred-result__feat-legend">
              <span className="pred-result__feat-legend-item pred-result__feat-legend--pos">● Positive</span>
              <span className="pred-result__feat-legend-item pred-result__feat-legend--neg">● Negative</span>
            </div>
          </div>
          <p className="pred-result__section-sub">Impact of individual characteristics on the final estimate</p>
          <FeatureChart />

          {/* Property Summary ── */}
          <div className="pred-result__prop-summary">
            <p className="pred-result__prop-summary-label">VERIFIED PROPERTY SUMMARY</p>
            <div className="pred-result__prop-grid">
              {propSummary.map(p => (
                <div key={p.label} className="pred-result__prop-item">
                  <span className="pred-result__prop-icon">{p.icon}</span>
                  <div>
                    <p className="pred-result__prop-label">{p.label}</p>
                    <p className="pred-result__prop-value">{p.value}</p>
                    <p className="pred-result__prop-sub">{p.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Compare CTA ── */}
      <div className="pred-result__compare">
        <div className="pred-result__compare-left">
          <h3 className="pred-result__compare-title">Compare with market analytics?</h3>
          <p className="pred-result__compare-desc">
            See how your property stacks up against regional distributions, area averages, and correlation matrices in our live analytics dashboard.
          </p>
        </div>
        <Link to="/analytics" className="btn-outline" style={{whiteSpace:'nowrap', flexShrink:0}}>
          View Market Analytics <IconChart />
        </Link>
      </div>
    </div>
  </div>
)

export default PredictionResult
