import { Link, useLocation } from 'react-router-dom'
import './PredictionResult.css'

const Icon = ({ children }) => (
  <svg
    aria-hidden="true"
    focusable="false"
    width="18"
    height="18"
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

const IconArrow = () => <Icon><path d="M19 12H5M12 19l-7-7 7-7" /></Icon>
const IconTrendUp = () => <Icon><path d="m3 17 6-6 4 4 8-8M15 7h6v6" /></Icon>
const IconTrendDown = () => <Icon><path d="m3 7 6 6 4-4 8 8M15 17h6v-6" /></Icon>
const IconChart = () => <Icon><path d="M3 3v18h18M8 15l4-4 4 4 5-7" /></Icon>

const featureData = [
  { label: 'Living area', positive: 0.95, negative: 0 },
  { label: 'Neighborhood', positive: 0.6, negative: 0 },
  { label: 'Condition', positive: 0.25, negative: 0 },
  { label: 'Year built', positive: 0, negative: 0.15 },
  { label: 'Bedrooms', positive: 0.22, negative: 0 },
  { label: 'Bathrooms', positive: 0, negative: 0.1 },
]

const sampleProperty = [
  { label: 'Living area', value: '3,250 sqft', note: 'Spacious interior' },
  { label: 'Bedrooms', value: '4 rooms', note: 'Master ensuite' },
  { label: 'Bathrooms', value: '3.5 baths', note: 'Modern fittings' },
  { label: 'Floors', value: '2 levels', note: 'Open concept' },
  { label: 'Year built', value: '1994', note: 'Renovated 2016' },
  { label: 'Lot size', value: '7,500 sqft', note: 'Landscaped' },
]

const marketExamples = [
  { title: 'Inventory scarcity', desc: 'Low supply in this zip code is inflating prices.', icon: <IconTrendUp /> },
  { title: 'Interest rates', desc: 'Recent rate hikes are softening buyer leverage.', icon: <IconTrendDown /> },
  { title: 'Area growth', desc: 'High-tech employment hub expansion nearby.', icon: <IconChart /> },
]

const FeatureChart = () => (
  <div className="result-chart">
    {featureData.map(feature => (
      <div key={feature.label} className="result-chart__row">
        <span className="result-chart__label">{feature.label}</span>
        <div className="result-chart__track" aria-hidden="true">
          {feature.negative > 0 && <span className="result-chart__bar result-chart__bar--negative" style={{ width: `${feature.negative * 100}%` }} />}
          {feature.positive > 0 && <span className="result-chart__bar result-chart__bar--positive" style={{ width: `${feature.positive * 100}%` }} />}
        </div>
        <span className="result-chart__value">
          {feature.positive > 0 ? `${(feature.positive * 100).toFixed(0)}% positive` : `${(feature.negative * 100).toFixed(0)}% negative`}
        </span>
      </div>
    ))}
    <div className="result-chart__legend">
      <span className="result-chart__legend-positive">Positive example</span>
      <span className="result-chart__legend-negative">Negative example</span>
    </div>
  </div>
)

const PredictionResult = () => {
  const { state } = useLocation()
  const form = state?.form
  const hasSubmittedInputs = form
    && typeof form.bedrooms === 'string'
    && typeof form.bathrooms === 'string'
    && typeof form.floors === 'number'
    && typeof form.waterfront === 'boolean'

  return (
    <div className="pred-result">
      <div className="container pred-result__page">
        <Link to="/prediction" className="pred-result__back">
          <IconArrow /> Adjust selections
        </Link>

        <header className="pred-result__header">
          <div>
            <h1 className="pred-result__title">Demonstration result</h1>
            <p className="pred-result__intro">
              This screen shows fixed sample values from the original interface. They are not calculated from your selections or a live model.
            </p>
          </div>
          <p className="pred-result__disclosure">Static example · not a valuation</p>
        </header>

        <section className="pred-result__hero" aria-labelledby="sample-value-title">
          <div className="pred-result__value">
            <h2 className="pred-result__label" id="sample-value-title">Existing sample figure</h2>
            <p className="pred-result__price">$1,245,000 <span>USD</span></p>
            <p className="pred-result__value-note">The same value appears regardless of form inputs.</p>
            <dl className="pred-result__sample-meta">
              <div>
                <dt>Example change</dt>
                <dd>+12.4% vs neighborhood average</dd>
              </div>
              <div>
                <dt>Original note</dt>
                <dd>Projected growth over 12 months</dd>
              </div>
            </dl>
            <p className="pred-result__fine-print">These figures are preserved from the original demo and have not been independently verified.</p>
          </div>
          <figure className="pred-result__image">
            <img src="/assets/prediction-result-img.png" alt="" />
            <figcaption>
              <strong>Example property image</strong>
              <span>Not associated with submitted details</span>
            </figcaption>
          </figure>
        </section>

        <section className="pred-result__inputs" aria-labelledby="submitted-details-title">
          <div className="pred-result__section-heading">
            <div>
              <h2 id="submitted-details-title">Your form selections</h2>
              <p>These are the only values carried from the form.</p>
            </div>
          </div>
          {hasSubmittedInputs ? (
            <dl className="pred-result__input-list">
              <div><dt>Bedrooms</dt><dd>{form.bedrooms}</dd></div>
              <div><dt>Bathrooms</dt><dd>{form.bathrooms}</dd></div>
              <div><dt>Floors</dt><dd>{form.floors}</dd></div>
              <div><dt>Waterfront</dt><dd>{form.waterfront ? 'Yes' : 'No'}</dd></div>
            </dl>
          ) : (
            <p className="pred-result__no-inputs">
              No form selections were passed to this page. Start at the form to carry selections here; the sample value remains fixed.
            </p>
          )}
        </section>

        <section className="pred-result__analysis" aria-labelledby="analysis-heading">
          <div className="pred-result__insight">
            <div className="pred-result__section-heading">
              <div>
                <h2 id="analysis-heading">Analysis examples</h2>
                <p>Existing interface content; not generated from the form.</p>
              </div>
            </div>
            <dl className="pred-result__confidence">
              <div>
                <dt>Original confidence claim</dt>
                <dd>94%</dd>
              </div>
              <div>
                <dt>Original accuracy label</dt>
                <dd>High accuracy</dd>
              </div>
            </dl>
            <p className="pred-result__fine-print">
              The original page also cites 21,613 historical transactions and 98.4% R² performance. These claims are not verified by a connected model here.
            </p>
            <div className="pred-result__market">
              <h3>Market notes in the original UI</h3>
              {marketExamples.map(item => (
                <div key={item.title} className="pred-result__market-item">
                  <span>{item.icon}</span>
                  <div><h4>{item.title}</h4><p>{item.desc}</p></div>
                </div>
              ))}
              <p className="pred-result__fine-print">These notes are static copy, not current market data.</p>
            </div>
            <Link to="/model" className="pred-result__text-link">Review the model interface</Link>
          </div>

          <div className="pred-result__features">
            <div className="pred-result__section-heading">
              <div>
                <h2>Feature influence examples</h2>
                <p>Illustrative chart values retained from the existing interface.</p>
              </div>
            </div>
            <FeatureChart />
            <div className="pred-result__property">
              <h3>Example property details</h3>
              <p className="pred-result__fine-print">These are fixed example values, not the selections above.</p>
              <dl className="pred-result__property-list">
                {sampleProperty.map(item => (
                  <div key={item.label}>
                    <dt>{item.label}</dt>
                    <dd>{item.value}</dd>
                    <dd className="pred-result__property-note">{item.note}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        <nav className="pred-result__related" aria-label="Related pages">
          <div>
            <h2>Explore the project</h2>
            <p>Open the static market interface or read about the dataset.</p>
          </div>
          <div className="pred-result__related-links">
            <Link to="/analytics" className="btn-outline">Market interface <IconChart /></Link>
            <Link to="/about" className="pred-result__text-link">About the dataset</Link>
          </div>
        </nav>
      </div>
    </div>
  )
}

export default PredictionResult
