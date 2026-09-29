import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './PredictionForm.css'

/* ── Icons ── */
const IconBed = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9V20M3 14h18M21 9v11"/><rect x="5" y="4" width="14" height="5" rx="1"/>
  </svg>
)

const IconBath = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 6L9 3.5a2.5 2.5 0 0 1 5 0V6"/><path d="M3 14h18v4a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-4z"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)

const IconFloors = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="4"/><rect x="3" y="10" width="18" height="4"/><rect x="3" y="17" width="18" height="4"/>
  </svg>
)

const IconWater = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
  </svg>
)

const IconChevronLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
)

const IconChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
)

const IconGrid = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
)

const IconExpand = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
    <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
  </svg>
)

const IconTarget = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
)

const IconMapPin = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
)

const STEPS = [
  { icon: <IconGrid />,    label: 'BASICS' },
  { icon: <IconExpand />,  label: 'SPECS' },
  { icon: <IconTarget />,  label: 'QUALITY' },
  { icon: <IconMapPin />,  label: 'LOCATION' },
]

const BEDROOM_OPTIONS   = ['1 Bedroom','2 Bedrooms','3 Bedrooms','4 Bedrooms','5 Bedrooms','6+ Bedrooms']
const BATHROOM_OPTIONS  = ['1 Bathroom','1.5 Bathrooms','2 Bathrooms','2.5 Bathrooms','3 Bathrooms','3.5 Bathrooms','4+ Bathrooms']

const PredictionForm = () => {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    bedrooms:   '3 Bedrooms',
    bathrooms:  '2.5 Bathrooms',
    floors:     2,
    waterfront: false,
  })

  const handleSubmit = () => {
    navigate('/prediction/result', { state: { form } })
  }

  return (
    <div className="pred-form">
      <div className="pred-form__page">
        {/* ── Header ── */}
        <div className="pred-form__header">
          <h1 className="pred-form__title">Precision Property Valuation</h1>
          <p className="pred-form__sub">
            Configure your property attributes below. Our AI model analyzes over 20 feature vectors from the King County dataset to provide a high-fidelity market estimation.
          </p>
        </div>

        {/* ── Stepper ── */}
        <div className="pred-form__stepper">
          {STEPS.map((step, i) => (
            <div key={step.label} className="stepper-step">
              <div className={`stepper-step__circle ${i === 0 ? 'stepper-step__circle--active' : ''}`}>
                {step.icon}
              </div>
              <span className={`stepper-step__label ${i === 0 ? 'stepper-step__label--active' : ''}`}>
                {step.label}
              </span>
              {i < STEPS.length - 1 && <div className="stepper-step__line" />}
            </div>
          ))}
        </div>

        {/* ── Progress Tab Bar ── */}
        <div className="pred-form__tab-bar" />

        {/* ── Main Grid ── */}
        <div className="pred-form__main">
          {/* Left: Form ── */}
          <div className="pred-form__left">
            <div className="pred-form__card">
              <div className="pred-form__card-title-bar" />
              <h2 className="pred-form__card-title">Core Dimensions</h2>
              <p className="pred-form__card-sub">Define the fundamental structural characteristics of the property.</p>

              {/* Bedrooms + Bathrooms */}
              <div className="pred-form__row">
                <div className="pred-form__field">
                  <label className="pred-form__label"><IconBed /> BEDROOMS</label>
                  <select
                    className="pred-form__select"
                    value={form.bedrooms}
                    onChange={e => setForm({...form, bedrooms: e.target.value})}
                  >
                    {BEDROOM_OPTIONS.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div className="pred-form__field">
                  <label className="pred-form__label"><IconBath /> BATHROOMS</label>
                  <select
                    className="pred-form__select"
                    value={form.bathrooms}
                    onChange={e => setForm({...form, bathrooms: e.target.value})}
                  >
                    {BATHROOM_OPTIONS.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>

              {/* Floors Slider */}
              <div className="pred-form__slider-row">
                <label className="pred-form__label"><IconFloors /> FLOORS</label>
                <span className="pred-form__slider-val">{form.floors}</span>
              </div>
              <input
                type="range"
                min="1" max="5" step="0.5"
                value={form.floors}
                onChange={e => setForm({...form, floors: parseFloat(e.target.value)})}
                className="pred-form__slider"
              />

              {/* Waterfront Toggle */}
              <div className="pred-form__toggle-row">
                <div className="pred-form__toggle-left">
                  <IconWater />
                  <div>
                    <p className="pred-form__toggle-label">Waterfront Access</p>
                    <p className="pred-form__toggle-sub">Is the property located directly on a shoreline?</p>
                  </div>
                </div>
                <button
                  role="switch"
                  aria-checked={form.waterfront}
                  className={`pred-form__toggle ${form.waterfront ? 'pred-form__toggle--on' : ''}`}
                  onClick={() => setForm({...form, waterfront: !form.waterfront})}
                />
              </div>

              {/* Navigation Buttons */}
              <div className="pred-form__nav">
                <button className="btn-outline"><IconChevronLeft /> Back</button>
                <button className="btn-primary" onClick={handleSubmit}>
                  Continue <IconChevronRight />
                </button>
              </div>
            </div>

            {/* Info cards */}
            <div className="pred-form__info-row">
              <div className="pred-form__info-card">
                <IconGrid />
                <div>
                  <p className="pred-form__info-title">Multi-Factor Engine</p>
                  <p className="pred-form__info-sub">Evaluating 20+ features simultaneously.</p>
                </div>
              </div>
              <div className="pred-form__info-card">
                <IconTarget />
                <div>
                  <p className="pred-form__info-title">Verified Data</p>
                  <p className="pred-form__info-sub">Sourced from official King County records.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Summary ── */}
          <div className="pred-form__right">
            <div className="pred-form__summary-visual" style={{position: 'relative'}}>
              <img src="/assets/skyscraper-blueprint.png" alt="Skyscraper Blueprint" className="img-placeholder" style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0}} />
              <div className="pred-form__summary-pill">
                <span className="glow-dot" />
                <span className="pred-form__summary-pill-text">LIVE PREDICTION PIPELINE</span>
                <span className="pred-form__summary-pill-title">Architectural Blueprint Analysis</span>
              </div>
              <p className="pred-form__summary-pill-desc">
                Our model interprets structural parameters into market value markers, ensuring every square foot is accurately accounted for.
              </p>
            </div>

            <div className="pred-form__summary-card">
              <h3 className="pred-form__summary-title">Configuration Summary</h3>
              <div className="pred-form__summary-rows">
                {[
                  { label: 'Layout',  value: `3 BD / 2.5 BA`, icon: <IconGrid /> },
                  { label: 'Space',   value: '2 200 sqft',    icon: <IconExpand /> },
                  { label: 'Grade',   value: 'Tier 7',        icon: <IconTarget /> },
                  { label: 'Region',  value: 'ZIP 98001',     icon: <IconMapPin /> },
                ].map(r => (
                  <div key={r.label} className="pred-form__summary-row">
                    <span className="pred-form__summary-row-icon">{r.icon}</span>
                    <span className="pred-form__summary-row-label">{r.label}</span>
                    <span className="pred-form__summary-row-value">{r.value}</span>
                  </div>
                ))}
              </div>
              <div className="pred-form__completion">
                <div className="pred-form__completion-header">
                  <span className="pred-form__completion-label">DATA COMPLETION</span>
                  <span className="pred-form__completion-pct">25%</span>
                </div>
                <div className="pred-form__completion-track">
                  <div className="pred-form__completion-fill" style={{width: '25%'}} />
                </div>
              </div>
              <a href="#" className="pred-form__how-link">How we calculate these values →</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PredictionForm
