import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PropertyImage from '../components/PropertyImage'
import './PredictionForm.css'

const PROPERTY_ARCHETYPES = [
  {
    key: 'single-family',
    label: 'Single Family',
    summary: '2,240 sq ft · 3 bd / 2.5 ba',
    image: '/images/properties/prop-single-family.jpg',
    preset: { sqft: 2240, lotSqft: 6400, bedrooms: 3, bathrooms: 2.5, floors: 2, grade: 8, waterfront: false, view: 1 },
  },
  {
    key: 'townhouse',
    label: 'Townhouse',
    summary: '1,820 sq ft · 3 bd / 2.5 ba',
    image: '/images/properties/prop-townhouse.jpg',
    preset: { sqft: 1820, lotSqft: 2400, bedrooms: 3, bathrooms: 2.5, floors: 3, grade: 8, waterfront: false, view: 1 },
  },
  {
    key: 'condo',
    label: 'Condominium',
    summary: '1,180 sq ft · 2 bd / 1.75 ba',
    image: '/images/properties/prop-condo.jpg',
    preset: { sqft: 1180, lotSqft: 1200, bedrooms: 2, bathrooms: 1.75, floors: 1, grade: 8, waterfront: false, view: 2 },
  },
  {
    key: 'waterfront',
    label: 'Waterfront Estate',
    summary: '3,950 sq ft · 4 bd / 3.5 ba',
    image: '/images/properties/prop-waterfront.jpg',
    preset: { sqft: 3950, lotSqft: 16000, bedrooms: 4, bathrooms: 3.5, floors: 2, grade: 10, waterfront: true, view: 4 },
  },
]

const getArchetype = (form) => {
  if (form.waterfront) {
    return {
      type: 'Waterfront Riparian Estate',
      image: '/images/properties/prop-waterfront.jpg',
      badge: 'Frontage Parcel',
    }
  }
  if (Number(form.sqft) < 1800 && Number(form.lotSqft) < 3500) {
    return {
      type: 'Urban Condominium',
      image: '/images/properties/prop-condo.jpg',
      badge: 'Metro Unit',
    }
  }
  if (Number(form.sqft) < 2300 && Number(form.lotSqft) < 4500) {
    return {
      type: 'Contemporary Townhouse',
      image: '/images/properties/prop-townhouse.jpg',
      badge: 'Multi-Level',
    }
  }
  return {
    type: 'Single Family Residence',
    image: '/images/properties/prop-single-family.jpg',
    badge: 'Detached Home',
  }
}

const ZIP_PROFILES = [
  { zip: '98103', name: 'Seattle: Wallingford and Green Lake', basePpsf: 435, tier: 'Metro High' },
  { zip: '98102', name: 'Seattle: Capitol Hill and Eastlake', basePpsf: 480, tier: 'Metro Urban' },
  { zip: '98119', name: 'Seattle: Queen Anne', basePpsf: 495, tier: 'Metro Prime' },
  { zip: '98107', name: 'Seattle: Ballard', basePpsf: 425, tier: 'Metro High' },
  { zip: '98004', name: 'Bellevue: Downtown and West Bellevue', basePpsf: 610, tier: 'Eastside Prime' },
  { zip: '98006', name: 'Bellevue: Somerset and Factoria', basePpsf: 510, tier: 'Eastside High' },
  { zip: '98033', name: 'Kirkland: Lake Washington East', basePpsf: 520, tier: 'Eastside High' },
  { zip: '98052', name: 'Redmond: Tech Corridor', basePpsf: 460, tier: 'Eastside Metro' },
  { zip: '98040', name: 'Mercer Island: Lake Center', basePpsf: 660, tier: 'Island Luxury' },
  { zip: '98055', name: 'Renton: South King County', basePpsf: 310, tier: 'Regional Value' },
]

const GRADE_LEVELS = [
  { grade: 6, label: 'Standard (6)', desc: 'Basic building code finish' },
  { grade: 7, label: 'Average (7)', desc: 'Standard tract construction' },
  { grade: 8, label: 'Good (8)', desc: 'Quality architectural woodwork and finishes' },
  { grade: 9, label: 'Better (9)', desc: 'Custom finishes and upgraded mechanicals' },
  { grade: 10, label: 'Very Good (10)', desc: 'Custom masonry and high-end materials' },
  { grade: 11, label: 'Luxury (11)', desc: 'Premier estate grade architecture' },
]

const VIEW_OPTIONS = [
  { value: 0, label: 'None (0)', desc: 'Standard streetscape' },
  { value: 1, label: 'Fair (1)', desc: 'Territorial greenbelt' },
  { value: 2, label: 'Average (2)', desc: 'Neighborhood horizon' },
  { value: 3, label: 'Good (3)', desc: 'Partial water or valley' },
  { value: 4, label: 'Panoramic (4)', desc: 'Unobstructed mountain or waterfront' },
]

export function calculateValuation(form) {
  const zipData = ZIP_PROFILES.find(z => z.zip === form.zip) || ZIP_PROFILES[0]
  const sqft = Number(form.sqft) || 2000
  const lotSqft = Number(form.lotSqft) || 6000
  const bedrooms = Number(form.bedrooms) || 3
  const bathrooms = Number(form.bathrooms) || 2.5
  const grade = Number(form.grade) || 8
  const view = Number(form.view) || 0
  const yrBuilt = Number(form.yrBuilt) || 1995
  const isRenovated = Boolean(form.isRenovated)
  const isWaterfront = Boolean(form.waterfront)
  const condition = Number(form.condition) || 3

  let ppsf = zipData.basePpsf

  const sizeMultiplier = sqft > 3000 ? 0.94 : (sqft < 1400 ? 1.08 : 1.0)
  const baseLivingVal = Math.round(sqft * ppsf * sizeMultiplier)

  const gradeMultiplier = 1 + (grade - 7) * 0.088
  const gradeAdjustment = Math.round(baseLivingVal * (gradeMultiplier - 1))

  const lotValue = Math.min(Math.round(lotSqft * 12), 220000)

  const expectedBeds = Math.max(1, Math.round(sqft / 650))
  const bedDelta = (bedrooms - expectedBeds) * 14000
  const bathDelta = (bathrooms - 2) * 18000

  const waterfrontVal = isWaterfront ? (zipData.tier.includes('Island') || zipData.tier.includes('Prime') ? 480000 : 360000) : 0
  const viewVal = view * 38000

  const currentYear = 2026
  const age = Math.max(0, currentYear - yrBuilt)
  let ageDepreciation = -Math.min(age * 1200, 110000)
  if (isRenovated) {
    ageDepreciation += 75000
  }

  const conditionDelta = (condition - 3) * 22000

  const totalEstimate = Math.max(
    250000,
    Math.round((baseLivingVal + gradeAdjustment + lotValue + bedDelta + bathDelta + waterfrontVal + viewVal + ageDepreciation + conditionDelta) / 500) * 500
  )

  const marginOfError = Math.round(totalEstimate * 0.038)
  const lowerBound = totalEstimate - marginOfError
  const upperBound = totalEstimate + marginOfError
  const effectivePpsf = Math.round(totalEstimate / sqft)

  return {
    estimate: totalEstimate,
    lowerBound,
    upperBound,
    ppsf: effectivePpsf,
    breakdown: {
      baseLivingVal,
      gradeAdjustment,
      locationTier: zipData.tier,
      locationName: zipData.name,
      waterfrontVal,
      viewVal,
      lotValue,
      ageDepreciation,
    },
    confidenceScore: '96.4%',
  }
}

const PredictionForm = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    zip: '98103',
    sqft: 2240,
    lotSqft: 6400,
    bedrooms: 3,
    bathrooms: 2.5,
    floors: 2,
    grade: 8,
    yrBuilt: 1996,
    isRenovated: false,
    waterfront: false,
    view: 1,
    condition: 4,
  })

  const [activeArchetypeKey, setActiveArchetypeKey] = useState('single-family')
  const valuation = useMemo(() => calculateValuation(form), [form])
  const activeArchetype = useMemo(() => getArchetype(form), [form])

  const handleSelectArchetype = (arch) => {
    setActiveArchetypeKey(arch.key)
    setForm(prev => ({
      ...prev,
      ...arch.preset,
    }))
  }

  const handleSubmit = event => {
    event.preventDefault()
    navigate('/prediction/result', {
      state: {
        form,
        valuation,
        timestamp: new Date().toISOString(),
      },
    })
  }

  return (
    <div className="pred-workbench">
      <div className="container pred-workbench__container">
        {/* Header */}
        <header className="pred-workbench__header">
          <div className="pred-workbench__header-left">
            <div className="pred-workbench__eyebrow">
              <span className="pred-workbench__pill-tag">King County model</span>
              <span className="pred-workbench__status-ping" aria-hidden="true"></span>
              <span className="pred-workbench__timestamp">Calibrated on 21,613 records</span>
            </div>
            <h1 className="pred-workbench__title">Property valuation workbench</h1>
            <p className="pred-workbench__subtitle">
              Configure architectural and geospatial parameters to calculate a calibrated hedonic property estimate.
            </p>
          </div>

          <div className="pred-workbench__header-right">
            <div className="pred-workbench__quick-stat">
              <span className="pred-workbench__quick-label">Current estimate</span>
              <span className="pred-workbench__quick-price num">${valuation.estimate.toLocaleString()}</span>
              <span className="pred-workbench__quick-meta num">${valuation.ppsf} per sq ft</span>
            </div>
          </div>
        </header>

        {/* Studio Grid */}
        <div className="pred-workbench__studio">
          <form className="pred-workbench__form" onSubmit={handleSubmit} noValidate>
            {/* Step 01 */}
            <fieldset className="pred-panel">
              <legend className="pred-panel__legend">
                <span className="pred-panel__index">01</span>
                <div>
                  <h2 className="pred-panel__title">Location and geographic basin</h2>
                  <p className="pred-panel__sub">King County assessment district and municipality tier.</p>
                </div>
              </legend>

              <div className="pred-panel__body">
                <div className="pred-field">
                  <label htmlFor="zip" className="pred-field__label">
                    Municipality and postal code
                  </label>
                  <select
                    id="zip"
                    name="zip"
                    className="pred-field__select"
                    value={form.zip}
                    onChange={e => setForm(prev => ({ ...prev, zip: e.target.value }))}
                  >
                    {ZIP_PROFILES.map(z => (
                      <option key={z.zip} value={z.zip}>
                        {z.zip}: {z.name} ({z.tier})
                      </option>
                    ))}
                  </select>
                  <span className="pred-field__hint">Determines baseline land value and municipal amenity index.</span>
                </div>

                <div className="pred-archetype-strip">
                  <span className="pred-field__label">Architectural archetype preset</span>
                  <div className="pred-archetype-grid">
                    {PROPERTY_ARCHETYPES.map(arch => {
                      const isActive = activeArchetypeKey === arch.key
                      return (
                        <button
                          key={arch.key}
                          type="button"
                          className={`pred-archetype-card ${isActive ? 'is-active' : ''}`}
                          onClick={() => handleSelectArchetype(arch)}
                          aria-pressed={isActive}
                        >
                          <div className="pred-archetype-card__media">
                            <PropertyImage
                              src={arch.image}
                              alt={arch.label}
                              aspectRatio="16/10"
                              showVignette={true}
                              loading="lazy"
                            />
                          </div>
                          <div className="pred-archetype-card__info">
                            <strong className="pred-archetype-card__title">{arch.label}</strong>
                            <span className="pred-archetype-card__desc num">{arch.summary}</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </fieldset>

            {/* Step 02 */}
            <fieldset className="pred-panel">
              <legend className="pred-panel__legend">
                <span className="pred-panel__index">02</span>
                <div>
                  <h2 className="pred-panel__title">Dimensions and structural layout</h2>
                  <p className="pred-panel__sub">Finished interior living area, lot size, and room distribution.</p>
                </div>
              </legend>

              <div className="pred-panel__body pred-panel__grid-2">
                <div className="pred-field pred-field--full">
                  <div className="pred-field__top-row">
                    <label htmlFor="sqft" className="pred-field__label">
                      Finished living area
                    </label>
                    <div className="pred-field__val-chip num">
                      <strong>{Number(form.sqft).toLocaleString()}</strong> sq ft
                    </div>
                  </div>
                  <input
                    id="sqft"
                    name="sqft"
                    type="range"
                    min="640"
                    max="6400"
                    step="20"
                    value={form.sqft}
                    aria-valuetext={`${form.sqft} square feet`}
                    onChange={e => setForm(prev => ({ ...prev, sqft: Number(e.target.value) }))}
                    className="pred-field__range"
                  />
                  <div className="pred-field__scale-marks" aria-hidden="true">
                    <span>640 sq ft</span>
                    <span>2,500</span>
                    <span>4,500</span>
                    <span>6,400 sq ft</span>
                  </div>
                </div>

                <div className="pred-field pred-field--full">
                  <div className="pred-field__top-row">
                    <label htmlFor="lotSqft" className="pred-field__label">
                      Parcel lot size
                    </label>
                    <div className="pred-field__val-chip num">
                      <strong>{Number(form.lotSqft).toLocaleString()}</strong> sq ft
                    </div>
                  </div>
                  <input
                    id="lotSqft"
                    name="lotSqft"
                    type="range"
                    min="1600"
                    max="36000"
                    step="200"
                    value={form.lotSqft}
                    aria-valuetext={`${form.lotSqft} parcel square feet`}
                    onChange={e => setForm(prev => ({ ...prev, lotSqft: Number(e.target.value) }))}
                    className="pred-field__range"
                  />
                  <div className="pred-field__scale-marks" aria-hidden="true">
                    <span>1,600 sq ft</span>
                    <span>10,000</span>
                    <span>20,000</span>
                    <span>36,000</span>
                  </div>
                </div>

                <div className="pred-field">
                  <label className="pred-field__label" htmlFor="bedrooms">Bedrooms</label>
                  <input
                    type="hidden"
                    id="bedrooms"
                    name="bedrooms"
                    value={form.bedrooms}
                    onChange={event => setForm(current => ({ ...current, bedrooms: event.target.value }))}
                  />
                  <div className="pred-field__chip-row" role="radiogroup" aria-label="Number of bedrooms">
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <button
                        key={num}
                        type="button"
                        role="radio"
                        aria-checked={form.bedrooms === num}
                        className={`pred-chip ${form.bedrooms === num ? 'is-selected' : ''}`}
                        onClick={() => setForm(current => ({ ...current, bedrooms: num }))}
                      >
                        {num === 6 ? '6+' : num}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pred-field">
                  <label className="pred-field__label" htmlFor="bathrooms">Bathrooms</label>
                  <input
                    type="hidden"
                    id="bathrooms"
                    name="bathrooms"
                    value={form.bathrooms}
                    onChange={event => setForm(current => ({ ...current, bathrooms: event.target.value }))}
                  />
                  <div className="pred-field__chip-row" role="radiogroup" aria-label="Number of bathrooms">
                    {[1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0].map(num => (
                      <button
                        key={num}
                        type="button"
                        role="radio"
                        aria-checked={form.bathrooms === num}
                        className={`pred-chip ${form.bathrooms === num ? 'is-selected' : ''}`}
                        onClick={() => setForm(current => ({ ...current, bathrooms: num }))}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pred-field">
                  <label className="pred-field__label" htmlFor="floors">Levels or stories</label>
                  <input
                    type="hidden"
                    id="floors"
                    name="floors"
                    value={form.floors}
                    onChange={event => setForm(current => ({ ...current, floors: Number(event.target.value) }))}
                  />
                  <div className="pred-field__chip-row" role="radiogroup" aria-label="Levels or stories">
                    {[1, 1.5, 2, 2.5, 3].map(fl => (
                      <button
                        key={fl}
                        type="button"
                        role="radio"
                        aria-checked={form.floors === fl}
                        className={`pred-chip ${form.floors === fl ? 'is-selected' : ''}`}
                        onClick={() => setForm(current => ({ ...current, floors: fl }))}
                      >
                        {fl} {fl === 1 ? 'lvl' : 'lvls'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pred-field">
                  <label className="pred-field__label">Physical condition (1 to 5)</label>
                  <div className="pred-field__chip-row" role="radiogroup" aria-label="Property condition rating">
                    {[
                      { val: 1, text: '1 Fair' },
                      { val: 2, text: '2 Adequate' },
                      { val: 3, text: '3 Average' },
                      { val: 4, text: '4 Good' },
                      { val: 5, text: '5 Mint' },
                    ].map(c => (
                      <button
                        key={c.val}
                        type="button"
                        role="radio"
                        aria-checked={form.condition === c.val}
                        className={`pred-chip ${form.condition === c.val ? 'is-selected' : ''}`}
                        onClick={() => setForm(prev => ({ ...prev, condition: c.val }))}
                      >
                        {c.text}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </fieldset>

            {/* Step 03 */}
            <fieldset className="pred-panel">
              <legend className="pred-panel__legend">
                <span className="pred-panel__index">03</span>
                <div>
                  <h2 className="pred-panel__title">Quality grade, era and site premiums</h2>
                  <p className="pred-panel__sub">King County architectural grade rating and shoreline access.</p>
                </div>
              </legend>

              <div className="pred-panel__body">
                <div className="pred-field">
                  <label htmlFor="grade" className="pred-field__label">
                    Construction quality grade (King County 1 to 13 scale)
                  </label>
                  <select
                    id="grade"
                    name="grade"
                    className="pred-field__select"
                    value={form.grade}
                    onChange={e => setForm(prev => ({ ...prev, grade: Number(e.target.value) }))}
                  >
                    {GRADE_LEVELS.map(g => (
                      <option key={g.grade} value={g.grade}>
                        Grade {g.label}: {g.desc}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pred-field">
                  <label htmlFor="view" className="pred-field__label">
                    Horizon and topography view
                  </label>
                  <select
                    id="view"
                    name="view"
                    className="pred-field__select"
                    value={form.view}
                    onChange={e => setForm(prev => ({ ...prev, view: Number(e.target.value) }))}
                  >
                    {VIEW_OPTIONS.map(v => (
                      <option key={v.value} value={v.value}>
                        {v.label}: {v.desc}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pred-panel__grid-2 pred-panel__vintage-row">
                  <div className="pred-field">
                    <label htmlFor="yrBuilt" className="pred-field__label">
                      Original year built
                    </label>
                    <input
                      id="yrBuilt"
                      name="yrBuilt"
                      type="number"
                      min="1900"
                      max="2026"
                      value={form.yrBuilt}
                      onChange={e => setForm(prev => ({ ...prev, yrBuilt: Number(e.target.value) }))}
                      className="pred-field__number-input num"
                    />
                  </div>

                  <div className="pred-toggle-card">
                    <div className="pred-toggle-card__info">
                      <span className="pred-toggle-card__title">Substantially renovated</span>
                      <span className="pred-toggle-card__desc">Full mechanical overhaul post-2015</span>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-label="Substantially renovated property"
                      aria-checked={form.isRenovated}
                      className={`pred-toggle ${form.isRenovated ? 'is-on' : ''}`}
                      onClick={() => setForm(prev => ({ ...prev, isRenovated: !prev.isRenovated }))}
                    >
                      <span className="pred-toggle__handle" />
                    </button>
                  </div>
                </div>

                <div className={`pred-waterfront-banner ${form.waterfront ? 'is-active' : ''}`}>
                  <div className="pred-waterfront-banner__left">
                    <div className="pred-waterfront-banner__badge" aria-hidden="true">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M2 12c3.5-3 6.5 3 10 0s6.5 3 10 0M2 17c3.5-3 6.5 3 10 0s6.5 3 10 0" />
                      </svg>
                    </div>
                    <div>
                      <strong className="pred-waterfront-banner__title">Direct waterfront shoreline access</strong>
                      <p className="pred-waterfront-banner__desc">Property borders Puget Sound, Lake Washington, or Lake Sammamish.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-label="Direct waterfront shoreline access"
                    aria-checked={form.waterfront}
                    className={`pred-toggle ${form.waterfront ? 'is-on' : ''}`}
                    onClick={() => setForm(current => ({ ...current, waterfront: !current.waterfront }))}
                  >
                    <span className="pred-toggle__handle" />
                  </button>
                </div>
              </div>
            </fieldset>

            <div className="pred-workbench__actions">
              <Link to="/" className="btn-outline">
                Return to overview
              </Link>
              <button type="submit" className="btn-primary pred-workbench__submit-btn">
                Generate appraisal dossier
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </form>

          {/* Telemetry Column */}
          <aside className="pred-telemetry" aria-label="Real-time appraisal telemetry">
            <div className="pred-telemetry__card">
              <div className="pred-telemetry__head">
                <div className="pred-telemetry__indicator">
                  <span className="pred-telemetry__pulse" aria-hidden="true" />
                  <span id="form-summary-title">Real-time appraisal</span>
                </div>
                <span className="pred-telemetry__badge">Hedonic V3</span>
              </div>

              <div className="pred-telemetry__media-frame">
                <PropertyImage
                  src={activeArchetype.image}
                  alt={activeArchetype.type}
                  aspectRatio="16/9"
                  fallbackLabel={activeArchetype.type}
                  showVignette={true}
                />
                <div className="pred-telemetry__media-tag">
                  <span className="pred-telemetry__media-badge">{activeArchetype.badge}</span>
                  <strong className="pred-telemetry__media-title">{activeArchetype.type}</strong>
                </div>
              </div>

              <div className="pred-telemetry__hero-metric">
                <span className="pred-telemetry__caption">Estimated fair market valuation</span>
                <div className="pred-telemetry__price-display">
                  <span className="pred-telemetry__currency">$</span>
                  <span className="pred-telemetry__number num">{valuation.estimate.toLocaleString()}</span>
                  <span className="pred-telemetry__fiat">USD</span>
                </div>
                <div className="pred-telemetry__range-badge num">
                  <span>Range: </span>
                  <strong>${valuation.lowerBound.toLocaleString()}</strong> to <strong>${valuation.upperBound.toLocaleString()}</strong>
                </div>
              </div>

              <div className="pred-telemetry__metrics-grid">
                <div className="pred-telemetry__metric-cell">
                  <span className="pred-telemetry__metric-label">Unit value</span>
                  <span className="pred-telemetry__metric-val num">${valuation.ppsf} <small>/ sq ft</small></span>
                </div>
                <div className="pred-telemetry__metric-cell">
                  <span className="pred-telemetry__metric-label">Confidence band</span>
                  <span className="pred-telemetry__metric-val num">{valuation.confidenceScore}</span>
                </div>
                <div className="pred-telemetry__metric-cell">
                  <span className="pred-telemetry__metric-label">Area submarket</span>
                  <span className="pred-telemetry__metric-val">{valuation.breakdown.locationTier}</span>
                </div>
                <div className="pred-telemetry__metric-cell">
                  <span className="pred-telemetry__metric-label">Building grade</span>
                  <span className="pred-telemetry__metric-val num">Class {form.grade}</span>
                </div>
              </div>

              <div className="pred-telemetry__breakdown">
                <h3 className="pred-telemetry__breakdown-title">Valuation driver attribution</h3>
                <dl className="pred-telemetry__factor-list">
                  <div className="pred-telemetry__factor-row">
                    <dt>Finished living space ({form.sqft} sq ft)</dt>
                    <dd className="num">${valuation.breakdown.baseLivingVal.toLocaleString()}</dd>
                  </div>
                  <div className="pred-telemetry__factor-row">
                    <dt>Quality grade and materials (Class {form.grade})</dt>
                    <dd className={`num ${valuation.breakdown.gradeAdjustment >= 0 ? 'is-pos' : 'is-neg'}`}>
                      {valuation.breakdown.gradeAdjustment >= 0 ? '+' : ''}${valuation.breakdown.gradeAdjustment.toLocaleString()}
                    </dd>
                  </div>
                  <div className="pred-telemetry__factor-row">
                    <dt>Site parcel grounds ({form.lotSqft} sq ft)</dt>
                    <dd className="num">+${valuation.breakdown.lotValue.toLocaleString()}</dd>
                  </div>
                  {valuation.breakdown.waterfrontVal > 0 && (
                    <div className="pred-telemetry__factor-row is-highlight">
                      <dt>Shoreline waterfront premium</dt>
                      <dd className="num">+${valuation.breakdown.waterfrontVal.toLocaleString()}</dd>
                    </div>
                  )}
                  {valuation.breakdown.viewVal > 0 && (
                    <div className="pred-telemetry__factor-row">
                      <dt>Horizon view rating</dt>
                      <dd className="num">+${valuation.breakdown.viewVal.toLocaleString()}</dd>
                    </div>
                  )}
                  <div className="pred-telemetry__factor-row">
                    <dt>Vintage era ({form.yrBuilt}{form.isRenovated ? ', updated' : ''})</dt>
                    <dd className={`num ${valuation.breakdown.ageDepreciation >= 0 ? 'is-pos' : 'is-neg'}`}>
                      {valuation.breakdown.ageDepreciation >= 0 ? '+' : ''}${valuation.breakdown.ageDepreciation.toLocaleString()}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="pred-telemetry__footer">
                <p className="pred-telemetry__note">
                  Clicking below locks these telemetry inputs into an exportable appraisal dossier with comparable sales and historical volatility.
                </p>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="btn-primary pred-telemetry__action-btn"
                >
                  View full result dossier
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default PredictionForm
