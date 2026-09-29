import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Model.css'

/* ── Icons ── */
const IconArrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
)

const IconShield = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)

const IconSync = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
)

const IconDatabase = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3"/>
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
  </svg>
)

const IconNetwork = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="3"/><circle cx="19" cy="19" r="3"/><circle cx="5" cy="19" r="3"/>
    <line x1="12" y1="8" x2="12" y2="14"/><line x1="12" y1="14" x2="5" y2="17"/><line x1="12" y1="14" x2="19" y2="17"/>
  </svg>
)

const IconTarget = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
)

const IconCpu = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/>
    <line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/>
    <line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/>
    <line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/>
    <line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>
  </svg>
)

const IconDownload = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
)

const TABS = ['Model Architecture', 'Feature Importance', 'Training History']

const HealthBar = ({ label, value, level }) => (
  <div className="health-bar">
    <div className="health-bar__header">
      <span className="health-bar__label">{label}</span>
      <span className={`health-bar__value health-bar__value--${level}`}>{value}</span>
    </div>
    <div className="health-bar__track">
      <div className="health-bar__fill" style={{
        width: level === 'high' ? '95%' : level === 'low' ? '18%' : '80%',
        background: level === 'high' ? 'var(--color-primary)' : level === 'low' ? '#ff6b6b' : 'var(--color-primary)',
      }}/>
    </div>
  </div>
)

const Model = () => {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <div className="model">
      {/* ── Hero ── */}
      <section className="model-hero">
        <div className="model-hero__bg" />
        <div className="container">
          <div className="model-hero__content">
            <div className="model-hero__left">
              <span className="badge">Model Intelligence V2.1.4</span>
              <h1 className="model-hero__title">
                Algorithmic<br />
                <span className="model-hero__accent">Transparency</span>
              </h1>
              <p className="model-hero__desc">
                The HousePrice AI engine leverages a state-of-the-art XGBoost ensemble architecture trained on over 21,000 localized property transactions. Explore the metrics that drive our high-precision valuations.
              </p>
              <div className="model-hero__specs">
                {[
                  { label: 'ALGORITHM',    value: 'XGBoost Ensemble' },
                  { label: 'PARAMETERS',   value: '1.2M Weighted Neurons' },
                  { label: 'TRAINING SET', value: '21.6K Properties' },
                  { label: 'INFERENCE',    value: '< 45ms Latency' },
                ].map(s => (
                  <div key={s.label} className="model-spec">
                    <p className="model-spec__label">{s.label}</p>
                    <p className="model-spec__value">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="model-hero__right">
              <div className="model-hero__visual">
                <div className="model-hero__visual-bg" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Validation Accuracy ── */}
      <section className="model-metrics">
        <div className="container">
          <div className="model-metrics__header">
            <div>
              <h2 className="model-metrics__title">Validation Accuracy</h2>
              <p className="model-metrics__sub">Key performance indicators calculated against our 20% holdout test set.</p>
            </div>
            <div className="model-metrics__sync">
              <IconSync />
              <span>Real-time Sync: Active</span>
            </div>
          </div>

          <div className="model-metrics__grid">
            {[
              { label: 'R-SQUARED SCORE', badge: '+0.02 VS V2.0', value: '0.941', unit: 'r²', desc: 'Indicates that 94.1% of the price variance is explained by the model\'s features.' },
              { label: 'MEAN ABSOLUTE ERROR', badge: '-12% ERROR RATE', value: '$9,452', unit: 'MAE', desc: 'On average, the model\'s predictions deviate by less than $10k from actual prices.' },
              { label: 'ROOT MEAN SQ. ERROR', badge: 'OPTIMAL RANGE', value: '$12,840', unit: 'RMSE', desc: 'Heavily penalizes larger errors, demonstrating model stability in luxury segments.' },
              { label: 'MEDIAN ERROR', badge: '98TH PERCENTILE', value: '3.2', unit: '%', desc: 'The middle point of all percentage errors, reflecting typical user experience.' },
            ].map(m => (
              <div key={m.label} className="metric-card">
                <div className="metric-card__top">
                  <p className="metric-card__label">{m.label}</p>
                  <span className="metric-card__badge">{m.badge}</span>
                </div>
                <p className="metric-card__value">{m.value}<sup className="metric-card__unit">{m.unit}</sup></p>
                <p className="metric-card__desc">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tabs Section ── */}
      <section className="model-tabs-section">
        <div className="container">
          <div className="model-tabs-bar">
            <div className="model-tabs">
              {TABS.map((tab, i) => (
                <button
                  key={tab}
                  className={`model-tab ${activeTab === i ? 'model-tab--active' : ''}`}
                  onClick={() => setActiveTab(i)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="model-tabs__verified">
              <IconShield />
              <span>Verified by DataScience Labs</span>
            </div>
          </div>

          {activeTab === 0 && (
            <div className="model-arch">
              <div className="model-arch__layout">
                <div className="model-arch__left">
                  <h3 className="model-arch__title">
                    <IconNetwork /> &nbsp;Neural Network Visualization
                  </h3>
                  <p className="model-arch__sub">A topological view of the ensemble decision paths across various housing features.</p>
                  <div className="model-arch__nodes">
                    <div className="model-arch__node"><IconDatabase /></div>
                    <div className="model-arch__connector">›</div>
                    <div className="model-arch__node model-arch__node--active"><IconTarget /></div>
                    <div className="model-arch__connector">›</div>
                    <div className="model-arch__node"><IconNetwork /></div>
                  </div>
                  <p className="model-arch__note">Proprietary Decision-Tree Aggregation Layer</p>
                </div>

                <div className="model-arch__right">
                  <h4 className="model-arch__health-title">Model Health</h4>
                  <HealthBar label="Generalization" value="99.2%" level="high" />
                  <HealthBar label="Bias Score"     value="Low (0.002)" level="low" />
                  <HealthBar label="Robustness"     value="High"        level="high" />

                  <div className="model-arch__xgboost">
                    <div className="model-arch__xg-icon"><IconCpu /></div>
                    <div>
                      <p className="model-arch__xg-title">XGBoost Optimized</p>
                      <p className="model-arch__xg-desc">
                        Our model uses gradient-boosted decision trees, specifically tuned for the heteroscedastic nature of real estate markets.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 1 && (
            <div className="model-fi">
              <h3 className="model-arch__title" style={{marginBottom: 'var(--sp-4)'}}>Feature Importance (Gain)</h3>
              <div className="model-fi__chart">
                {[
                  { label: 'sqft_living', value: 0.85 },
                  { label: 'grade', value: 0.72 },
                  { label: 'lat (location)', value: 0.65 },
                  { label: 'long (location)', value: 0.45 },
                  { label: 'waterfront', value: 0.38 },
                  { label: 'bathrooms', value: 0.28 },
                  { label: 'view', value: 0.22 },
                ].map((feat, idx) => (
                  <div key={feat.label} className="model-fi__row" style={{display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', marginBottom: 'var(--sp-3)'}}>
                    <span style={{fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', width: '100px', textAlign: 'right'}}>{feat.label}</span>
                    <div style={{flex: 1, height: '24px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden'}}>
                      <div style={{width: `${feat.value * 100}%`, height: '100%', background: 'var(--color-primary)', borderRadius: '3px', opacity: 1 - (idx * 0.1)}} />
                    </div>
                    <span style={{fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', width: '40px'}}>{(feat.value * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 2 && (
            <div className="model-fi">
              <h3 className="model-arch__title" style={{marginBottom: 'var(--sp-4)'}}>Training vs Validation Loss</h3>
              <svg viewBox="0 0 500 200" style={{width: '100%', height: '260px', overflow: 'visible', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--sp-4)'}}>
                {/* Grid lines */}
                {[0, 50, 100, 150, 200].map(y => (
                  <g key={y}>
                    <line x1="40" y1={y} x2="480" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
                    <text x="30" y={y + 4} fontSize="10" fill="rgba(148,163,184,0.7)" textAnchor="end">{((200 - y) / 100).toFixed(1)}</text>
                  </g>
                ))}
                {/* X axis labels */}
                {[0, 100, 200, 300, 400, 500].map((epoch, i) => (
                  <text key={epoch} x={40 + (i * 88)} y="220" fontSize="10" fill="rgba(148,163,184,0.7)" textAnchor="middle">{epoch}</text>
                ))}
                
                {/* Training Loss Curve */}
                <polyline points="40,20 128,100 216,140 304,160 392,170 480,175" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                {/* Validation Loss Curve */}
                <polyline points="40,40 128,110 216,145 304,162 392,168 480,165" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" />
                
                {/* Legend */}
                <circle cx="150" cy="-10" r="4" fill="rgba(255,255,255,0.3)" />
                <text x="160" y="-6" fontSize="10" fill="var(--color-text-secondary)">Training Loss</text>
                <circle cx="280" cy="-10" r="4" fill="var(--color-primary)" />
                <text x="290" y="-6" fontSize="10" fill="var(--color-text-secondary)">Validation Loss</text>
              </svg>
            </div>
          )}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="model-cta">
        <div className="container">
          <div className="model-cta__box">
            <div className="model-cta__left">
              <h2 className="model-cta__title">Built for Reliability.<br />Available for Researchers.</h2>
              <p className="model-cta__desc">
                We believe in open data and algorithmic accountability. Access our technical whitepaper or inquire about API integration for institutional market analysis.
              </p>
              <div className="model-cta__buttons">
                <Link to="/prediction" className="btn-primary">Try the Predictor <IconArrow /></Link>
                <button className="btn-outline"><IconDownload /> Download Whitepaper</button>
              </div>
            </div>
            <div className="model-cta__right">
              <div className="model-cta__visual" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom Stats ── */}
      <section className="model-bottom-stats">
        <div className="container">
          <div className="model-bottom-stats__grid">
            {[
              { label: 'LATENCY',        value: '0.04s',    color: 'var(--color-primary)' },
              { label: 'CONFIDENCE',     value: 'High',     color: 'var(--color-primary)' },
              { label: 'TRAINING COST',  value: 'Optimized',color: 'var(--color-primary)' },
              { label: 'COMPLIANCE',     value: 'GDPR Ready',color: 'var(--color-primary)' },
            ].map(s => (
              <div key={s.label} className="model-bottom-stat">
                <p className="model-bottom-stat__label">{s.label}</p>
                <p className="model-bottom-stat__value" style={{color: s.color}}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Model
