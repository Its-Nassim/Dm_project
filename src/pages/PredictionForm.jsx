import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './PredictionForm.css'

const Icon = ({ children, size = 18 }) => (
  <svg
    aria-hidden="true"
    focusable="false"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
)

const IconBed = () => <Icon><path d="M3 9V20M3 14h18M21 9v11" /><rect x="5" y="4" width="14" height="5" rx="1" /></Icon>
const IconBath = () => <Icon><path d="M9 6V3.5a2.5 2.5 0 0 1 5 0V6M3 14h18v4a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4zM3 10h18" /></Icon>
const IconFloors = () => <Icon><rect x="3" y="3" width="18" height="4" /><rect x="3" y="10" width="18" height="4" /><rect x="3" y="17" width="18" height="4" /></Icon>
const IconWater = () => <Icon><path d="M12 2.7 17.7 8.4a8 8 0 1 1-11.4 0z" /></Icon>

const BEDROOM_OPTIONS = ['1 Bedroom', '2 Bedrooms', '3 Bedrooms', '4 Bedrooms', '5 Bedrooms', '6+ Bedrooms']
const BATHROOM_OPTIONS = ['1 Bathroom', '1.5 Bathrooms', '2 Bathrooms', '2.5 Bathrooms', '3 Bathrooms', '3.5 Bathrooms', '4+ Bathrooms']

const PredictionForm = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    bedrooms: '3 Bedrooms',
    bathrooms: '2.5 Bathrooms',
    floors: 2,
    waterfront: false,
  })

  const handleSubmit = event => {
    event.preventDefault()
    navigate('/prediction/result', { state: { form } })
  }

  return (
    <div className="pred-form">
      <div className="container pred-form__page">
        <header className="pred-form__header">
          <div className="pred-form__heading">
            <h1 className="pred-form__title">Set the property details</h1>
            <p className="pred-form__sub">
              Choose four attributes. Continuing opens a fixed demo result; no valuation is calculated.
            </p>
          </div>
          <p className="pred-form__step">01 <span>/</span> 01</p>
        </header>

        <div className="pred-form__main">
          <form className="pred-form__card" onSubmit={handleSubmit}>
            <div className="pred-form__section-heading">
              <span className="pred-form__section-index">01</span>
              <div>
                <h2 className="pred-form__card-title">Property attributes</h2>
                <p className="pred-form__card-sub">These selections are passed to the result page.</p>
              </div>
            </div>

            <div className="pred-form__fields">
              <div className="pred-form__field">
                <label className="pred-form__label" htmlFor="bedrooms">
                  <IconBed /> Bedrooms
                </label>
                <select
                  id="bedrooms"
                  name="bedrooms"
                  className="pred-form__select"
                  value={form.bedrooms}
                  onChange={event => setForm(current => ({ ...current, bedrooms: event.target.value }))}
                >
                  {BEDROOM_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>

              <div className="pred-form__field">
                <label className="pred-form__label" htmlFor="bathrooms">
                  <IconBath /> Bathrooms
                </label>
                <select
                  id="bathrooms"
                  name="bathrooms"
                  className="pred-form__select"
                  value={form.bathrooms}
                  onChange={event => setForm(current => ({ ...current, bathrooms: event.target.value }))}
                >
                  {BATHROOM_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>
            </div>

            <div className="pred-form__slider-field">
              <div className="pred-form__slider-heading">
                <label className="pred-form__label" htmlFor="floors"><IconFloors /> Floors</label>
                <output className="pred-form__slider-value" htmlFor="floors">{form.floors}</output>
              </div>
              <input
                id="floors"
                name="floors"
                type="range"
                min="1"
                max="5"
                step="0.5"
                value={form.floors}
                aria-valuetext={`${form.floors} ${form.floors === 1 ? 'floor' : 'floors'}`}
                onChange={event => setForm(current => ({ ...current, floors: Number(event.target.value) }))}
                className="pred-form__slider"
              />
              <div className="pred-form__range-labels" aria-hidden="true"><span>1 floor</span><span>5 floors</span></div>
            </div>

            <div className="pred-form__toggle-row">
              <div className="pred-form__toggle-copy">
                <span className="pred-form__toggle-icon"><IconWater /></span>
                <div>
                  <p className="pred-form__toggle-label">Waterfront access</p>
                  <p className="pred-form__toggle-sub">Is the property directly on a shoreline?</p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-label="Waterfront access"
                aria-checked={form.waterfront}
                className={`pred-form__toggle ${form.waterfront ? 'pred-form__toggle--on' : ''}`}
                onClick={() => setForm(current => ({ ...current, waterfront: !current.waterfront }))}
              />
            </div>

            <div className="pred-form__form-footer">
              <Link to="/" className="btn-outline">Home</Link>
              <button type="submit" className="btn-primary">Show demo result</button>
            </div>
          </form>

          <aside className="pred-form__aside" aria-label="Demonstration details">
            <div className="pred-form__image">
              <img src="/assets/prediction-form-img.png" alt="" />
              <div className="pred-form__image-copy">
                <p className="pred-form__image-title">Demonstration only</p>
                <p>This interface does not connect to a valuation service.</p>
              </div>
            </div>

            <section className="pred-form__summary" aria-labelledby="form-summary-title">
              <div className="pred-form__summary-heading">
                <h2 id="form-summary-title">Your selections</h2>
                <span>Updates as you edit</span>
              </div>
              <dl className="pred-form__summary-list">
                <div><dt>Bedrooms</dt><dd>{form.bedrooms}</dd></div>
                <div><dt>Bathrooms</dt><dd>{form.bathrooms}</dd></div>
                <div><dt>Floors</dt><dd>{form.floors}</dd></div>
                <div><dt>Waterfront</dt><dd>{form.waterfront ? 'Yes' : 'No'}</dd></div>
              </dl>
              <p className="pred-form__summary-note">
                The result view contains fixed examples and will not calculate from these selections.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default PredictionForm
