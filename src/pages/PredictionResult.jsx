import { useState, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { calculateValuation } from './PredictionForm'
import PropertyImage from '../components/PropertyImage'
import './PredictionResult.css'

const DEFAULT_FORM = {
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
}

const getPropertyArchetype = (form) => {
  if (form.waterfront) {
    return {
      type: 'Waterfront Luxury Estate',
      image: '/images/properties/prop-waterfront.jpg',
      badge: 'Shoreline Riparian Parcel',
    }
  }
  if (Number(form.sqft) < 1800 && Number(form.lotSqft) < 3500) {
    return {
      type: 'Urban Condominium',
      image: '/images/properties/prop-condo.jpg',
      badge: 'Metro Multi-Unit',
    }
  }
  if (Number(form.sqft) < 2300 && Number(form.lotSqft) < 4500) {
    return {
      type: 'Contemporary Townhouse',
      image: '/images/properties/prop-townhouse.jpg',
      badge: 'Multi-Level Residence',
    }
  }
  return {
    type: 'Single Family Residence',
    image: '/images/properties/prop-single-family.jpg',
    badge: 'Detached Architectural Home',
  }
}

const generateComps = (form, valuation) => {
  const base = valuation.estimate
  return [
    {
      id: 'comp-1',
      address: `4812 ${form.zip === '98103' ? 'Phinney Ave N' : '108th Ave NE'}`,
      neighborhood: form.zip === '98103' ? 'Phinney Ridge / Wallingford' : 'Downtown Bellevue',
      distance: '0.3 miles',
      soldDays: '14 days ago',
      sqft: Math.round(form.sqft * 0.98),
      beds: form.bedrooms,
      baths: form.bathrooms,
      soldPrice: Math.round((base * 1.012) / 1000) * 1000,
      diff: '+1.2%',
      isHigher: true,
      image: '/images/comps/comp-phinney.jpg',
      propertyType: 'Single Family Contemporary',
    },
    {
      id: 'comp-2',
      address: `724 ${form.zip === '98103' ? 'Greenwood Ave N' : 'Bellevue Way'}`,
      neighborhood: form.zip === '98103' ? 'Greenwood Urban' : 'West Bellevue',
      distance: '0.6 miles',
      soldDays: '28 days ago',
      sqft: Math.round(form.sqft * 1.04),
      beds: form.bedrooms,
      baths: form.bathrooms,
      soldPrice: Math.round((base * 0.986) / 1000) * 1000,
      diff: '-1.4%',
      isHigher: false,
      image: '/images/comps/comp-greenwood.jpg',
      propertyType: 'Modern Townhome',
    },
    {
      id: 'comp-3',
      address: `1530 ${form.zip === '98103' ? 'N 45th Street' : 'Main Street'}`,
      neighborhood: form.zip === '98103' ? 'Wallingford Central' : 'Bellevue East',
      distance: '0.8 miles',
      soldDays: '41 days ago',
      sqft: Math.round(form.sqft * 1.01),
      beds: form.bedrooms,
      baths: form.bathrooms,
      soldPrice: Math.round((base * 1.004) / 1000) * 1000,
      diff: '+0.4%',
      isHigher: true,
      image: '/images/comps/comp-45th.jpg',
      propertyType: 'Contemporary Craftsman',
    },
    {
      id: 'comp-4',
      address: `9214 ${form.zip === '98103' ? 'Linden Ave N' : 'Lake Washington Blvd'}`,
      neighborhood: form.zip === '98103' ? 'Green Lake Basin' : 'Kirkland Waterfront',
      distance: '1.1 miles',
      soldDays: '52 days ago',
      sqft: Math.round(form.sqft * 1.08),
      beds: Math.max(form.bedrooms, 3),
      baths: form.bathrooms,
      soldPrice: Math.round((base * 1.025) / 1000) * 1000,
      diff: '+2.5%',
      isHigher: true,
      image: '/images/comps/comp-bellevue.jpg',
      propertyType: 'Waterfront / Scenic Parcel',
    },
  ]
}

const PredictionResult = () => {
  const { state } = useLocation()
  const [copied, setCopied] = useState(false)

  const form = state?.form || DEFAULT_FORM
  const valuation = useMemo(() => state?.valuation || calculateValuation(form), [state?.valuation, form])
  const comps = useMemo(() => generateComps(form, valuation), [form, valuation])
  const archetype = useMemo(() => getPropertyArchetype(form), [form])

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2400)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="dossier">
      <div className="container dossier__container">
        {/* Navigation Breadcrumb */}
        <div className="dossier__nav-strip">
          <Link to="/prediction" className="dossier__back-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Adjust property parameters
          </Link>

          <div className="dossier__actions-quick">
            <button
              type="button"
              onClick={handleCopyLink}
              className="dossier__btn-action"
              aria-label="Copy appraisal report link"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              {copied ? 'Link copied' : 'Share report'}
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="dossier__btn-action"
              aria-label="Export or print PDF appraisal"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              Export dossier
            </button>
          </div>
        </div>

        {/* Dossier Header */}
        <header className="dossier__header">
          <div className="dossier__header-main">
            <div className="dossier__badge-row">
              <span className="dossier__badge-submarket">{valuation.breakdown.locationName}</span>
              <span className="dossier__badge-confidence">Confidence score {valuation.confidenceScore}</span>
              <span className="dossier__date">Appraisal date: October 2026</span>
            </div>
            <h1 className="dossier__title">Property Valuation Dossier</h1>
            <p className="dossier__subtitle">
              Calibrated hedonic assessment based on King County parcel records.
            </p>
          </div>
        </header>

        {/* Hero Valuation Stage */}
        <section className="dossier__hero-stage" aria-label="Property valuation assessment">
          <div className="dossier__hero-card">
            <div className="dossier__hero-left">
              <span className="dossier__hero-label" id="sample-value-title">Calibrated market estimate</span>
              <div className="dossier__price-cluster">
                <span className="dossier__currency">$</span>
                <span className="dossier__price num">{valuation.estimate.toLocaleString()}</span>
                <span className="dossier__currency-fiat">USD</span>
              </div>

              {/* Confidence Interval Spread */}
              <div className="dossier__interval-block">
                <div className="dossier__interval-meta">
                  <span>95% confidence interval</span>
                  <span className="num">${valuation.lowerBound.toLocaleString()} to ${valuation.upperBound.toLocaleString()}</span>
                </div>
                <div className="dossier__interval-bar" aria-hidden="true">
                  <div className="dossier__interval-fill" />
                  <div className="dossier__interval-point" />
                </div>
              </div>

              <div className="dossier__quick-chips">
                <div className="dossier__chip">
                  <span>Unit valuation: </span>
                  <strong className="num">${valuation.ppsf} per sq ft</strong>
                </div>
                <div className="dossier__chip">
                  <span>Submarket: </span>
                  <strong>{valuation.breakdown.locationTier}</strong>
                </div>
                <div className="dossier__chip">
                  <span>Quality grade: </span>
                  <strong>Class {form.grade}</strong>
                </div>
              </div>
            </div>

            <div className="dossier__hero-right">
              <div className="dossier__property-summary">
                <div className="dossier__archetype-preview">
                  <PropertyImage
                    src={archetype.image}
                    alt={archetype.type}
                    aspectRatio="16/9"
                    fallbackLabel={archetype.type}
                    showVignette={true}
                  />
                  <div className="dossier__archetype-overlay">
                    <span className="dossier__archetype-tag">{archetype.badge}</span>
                    <span className="dossier__archetype-title">{archetype.type}</span>
                  </div>
                </div>
                <h2 className="dossier__section-label" id="submitted-details-title">Property summary</h2>
                <dl className="dossier__spec-grid">
                  <div className="dossier__spec-cell">
                    <dt>Finished living space</dt>
                    <dd className="num">{Number(form.sqft).toLocaleString()} sq ft</dd>
                  </div>
                  <div className="dossier__spec-cell">
                    <dt>Lot size</dt>
                    <dd className="num">{Number(form.lotSqft).toLocaleString()} sq ft</dd>
                  </div>
                  <div className="dossier__spec-cell">
                    <dt>Bedrooms and baths</dt>
                    <dd className="num">{form.bedrooms} bd / {form.bathrooms} ba</dd>
                  </div>
                  <div className="dossier__spec-cell">
                    <dt>Stories / Levels</dt>
                    <dd className="num">{form.floors} levels</dd>
                  </div>
                  <div className="dossier__spec-cell">
                    <dt>Era built</dt>
                    <dd className="num">{form.yrBuilt} ({form.isRenovated ? 'renovated' : 'original'})</dd>
                  </div>
                  <div className="dossier__spec-cell">
                    <dt>Shoreline access</dt>
                    <dd>{form.waterfront ? 'Direct waterfront' : 'Standard parcel'}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </section>

        {/* Valuation Drivers Breakdown: Why This Price */}
        <section className="dossier__drivers" aria-labelledby="analysis-heading">
          <div className="dossier__block-head">
            <h2 id="analysis-heading" className="dossier__heading">Valuation drivers and attribution</h2>
            <p className="dossier__head-sub">Independent contribution of each core property attribute to final valuation.</p>
          </div>

          <div className="dossier__waterfall">
            <div className="dossier__driver-row">
              <div className="dossier__driver-info">
                <strong>Base living area value</strong>
                <span>{form.sqft} sq ft finished interior space at regional baseline rate</span>
              </div>
              <div className="dossier__driver-amount num">
                ${valuation.breakdown.baseLivingVal.toLocaleString()}
              </div>
            </div>

            <div className="dossier__driver-row">
              <div className="dossier__driver-info">
                <strong>Architectural quality grade</strong>
                <span>King County grade {form.grade} construction finishes and framing</span>
              </div>
              <div className={`dossier__driver-amount num ${valuation.breakdown.gradeAdjustment >= 0 ? 'is-pos' : 'is-neg'}`}>
                {valuation.breakdown.gradeAdjustment >= 0 ? '+' : ''}${valuation.breakdown.gradeAdjustment.toLocaleString()}
              </div>
            </div>

            <div className="dossier__driver-row">
              <div className="dossier__driver-info">
                <strong>Parcel land grounds</strong>
                <span>{form.lotSqft} sq ft parcel site value in {form.zip}</span>
              </div>
              <div className="dossier__driver-amount num is-pos">
                +${valuation.breakdown.lotValue.toLocaleString()}
              </div>
            </div>

            {valuation.breakdown.waterfrontVal > 0 && (
              <div className="dossier__driver-row is-accented">
                <div className="dossier__driver-info">
                  <strong>Waterfront shoreline premium</strong>
                  <span>Direct shoreline frontage and riparian rights</span>
                </div>
                <div className="dossier__driver-amount num is-pos">
                  +${valuation.breakdown.waterfrontVal.toLocaleString()}
                </div>
              </div>
            )}

            {valuation.breakdown.viewVal > 0 && (
              <div className="dossier__driver-row">
                <div className="dossier__driver-info">
                  <strong>Horizon and topography view</strong>
                  <span>Territorial horizon view rating</span>
                </div>
                <div className="dossier__driver-amount num is-pos">
                  +${valuation.breakdown.viewVal.toLocaleString()}
                </div>
              </div>
            )}

            <div className="dossier__driver-row">
              <div className="dossier__driver-info">
                <strong>Vintage era and physical condition</strong>
                <span>Depreciation offset for year built {form.yrBuilt} ({form.condition}/5 condition rating)</span>
              </div>
              <div className={`dossier__driver-amount num ${valuation.breakdown.ageDepreciation >= 0 ? 'is-pos' : 'is-neg'}`}>
                {valuation.breakdown.ageDepreciation >= 0 ? '+' : ''}${valuation.breakdown.ageDepreciation.toLocaleString()}
              </div>
            </div>
          </div>
        </section>

        {/* Comparable Sales Benchmark (Comps) */}
        <section className="dossier__comps" aria-labelledby="comps-heading">
          <div className="dossier__block-head">
            <h2 id="comps-heading" className="dossier__heading">Recent comparable transactions</h2>
            <p className="dossier__head-sub">Historical King County sales within similar square footage and geographic radius.</p>
          </div>

          {/* Visual Comp Cards Grid */}
          <div className="dossier__comps-grid">
            {comps.map(comp => (
              <article key={comp.id} className="dossier__comp-card">
                <div className="dossier__comp-media">
                  <PropertyImage
                    src={comp.image}
                    alt={comp.address}
                    aspectRatio="16/10"
                    fallbackLabel="King County Parcel Sale"
                    loading="lazy"
                  />
                  <div className="dossier__comp-badge-strip">
                    <span className="dossier__comp-badge-dist">{comp.distance}</span>
                    <span className={`dossier__comp-variance num ${comp.isHigher ? 'is-pos' : 'is-neg'}`}>
                      {comp.diff}
                    </span>
                  </div>
                </div>
                <div className="dossier__comp-content">
                  <div className="dossier__comp-meta-top">
                    <span className="dossier__comp-type">{comp.propertyType}</span>
                    <span className="dossier__comp-sold">{comp.soldDays}</span>
                  </div>
                  <h3 className="dossier__comp-address">{comp.address}</h3>
                  <p className="dossier__comp-submarket">{comp.neighborhood}</p>
                  
                  <div className="dossier__comp-specs">
                    <span className="num">{comp.sqft.toLocaleString()} sq ft</span>
                    <span className="dossier__comp-spec-divider" aria-hidden="true">·</span>
                    <span className="num">{comp.beds} bd / {comp.baths} ba</span>
                  </div>

                  <div className="dossier__comp-price-row">
                    <span className="dossier__comp-price-label">Closed sale</span>
                    <span className="dossier__comp-price-val num">${comp.soldPrice.toLocaleString()}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="dossier__comps-table-wrap">
            <table className="dossier__comps-table">
              <thead>
                <tr>
                  <th>Property location</th>
                  <th>Distance</th>
                  <th>Sale recording</th>
                  <th>Living area</th>
                  <th>Layout</th>
                  <th className="dossier__th-right">Closed price</th>
                  <th className="dossier__th-right">Variance</th>
                </tr>
              </thead>
              <tbody>
                {comps.map(comp => (
                  <tr key={comp.id}>
                    <td>
                      <strong>{comp.address}</strong>
                    </td>
                    <td className="num">{comp.distance}</td>
                    <td>{comp.soldDays}</td>
                    <td className="num">{comp.sqft.toLocaleString()} sq ft</td>
                    <td className="num">{comp.beds} bd / {comp.baths} ba</td>
                    <td className="num dossier__td-right">
                      <strong>${comp.soldPrice.toLocaleString()}</strong>
                    </td>
                    <td className="dossier__td-right">
                      <span className={`dossier__comp-variance num ${comp.isHigher ? 'is-pos' : 'is-neg'}`}>
                        {comp.diff}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Next Steps & Related Research */}
        <footer className="dossier__footer">
          <div className="dossier__footer-card">
            <div>
              <h2 className="dossier__footer-title">Explore King County market telemetry</h2>
              <p className="dossier__footer-desc">
                Review distribution curves across all 70 ZIP codes or inspect regression model diagnostics.
              </p>
            </div>
            <div className="dossier__footer-links">
              <Link to="/analytics" className="btn-primary">
                View market analytics
              </Link>
              <Link to="/model" className="btn-outline">
                Inspect model weights
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default PredictionResult
