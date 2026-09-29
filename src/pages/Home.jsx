import { Link } from 'react-router-dom'
import './Home.css'

const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
)

const IconDatabase = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
  </svg>
)

const IconCpu = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
    <rect x="9" y="9" width="6" height="6"></rect>
    <line x1="9" y1="1" x2="9" y2="4"></line>
    <line x1="15" y1="1" x2="15" y2="4"></line>
    <line x1="9" y1="20" x2="9" y2="23"></line>
    <line x1="15" y1="20" x2="15" y2="23"></line>
    <line x1="20" y1="9" x2="23" y2="9"></line>
    <line x1="20" y1="14" x2="23" y2="14"></line>
    <line x1="1" y1="9" x2="4" y2="9"></line>
    <line x1="1" y1="14" x2="4" y2="14"></line>
  </svg>
)

const IconShield = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  </svg>
)

const Home = () => {
  return (
    <div className="home">
      {/* ── Hero Section ── */}
      <section className="hero">
        <div className="hero__content">
          <div className="hero__badge">Next-Gen Real Estate Intelligence</div>
          <h1 className="hero__title">
            Predict the <em>Value</em><br />of Your Home
          </h1>
          <p className="hero__desc">
            AI-powered real-estate valuation using high-performance machine learning models trained on 20,000+ real-world properties.
          </p>
          
          <div className="hero__actions">
            <Link to="/prediction" className="btn-primary">
              Start Prediction →
            </Link>
            <Link to="/analytics" className="btn-outline">
              View Market Data <span className="icon-search">🔍</span>
            </Link>
          </div>

          <div className="hero__tags">
            <span className="hero__tag"><IconDatabase /> KING COUNTY DATA</span>
            <span className="hero__tag"><IconCpu /> ML POWERED</span>
            <span className="hero__tag"><IconShield /> VERIFIED MODELS</span>
          </div>
        </div>

        <div className="hero__visual">
          <div className="hero__img-container">
            {/* Real placeholder for the architecture wireframe */}
            <img src="/assets/hero-wireframe.png" alt="Hero Architecture" className="img-placeholder" />
          </div>
        </div>
      </section>

      {/* ── Stats Section ── */}
      <section className="stats">
        <div className="stats__header">
          <span className="stats__overline">TRANSPARENCY AT SCALE</span>
          <h2 className="stats__title">Engineered for Precision</h2>
          <p className="stats__desc">
            Our models are built on transparency, using thousands of verified transactions to provide the most accurate estimations in the market.
          </p>
        </div>
        
        <div className="stats__grid">
          {[
            { value: '21,613', label: 'VAST DATASET', desc: 'Validated property records from the extensive King County housing dataset used for training.' },
            { value: '20+', label: 'ML FEATURES', desc: 'Critical property variables analyzed, from square footage to neighborhood quality scores.' },
            { value: '92%', label: 'REAL-WORLD ACCURACY', desc: 'High confidence interval based on R-squared regression metrics and rigorous cross-validation.' },
            { value: '15ms', label: 'AI PREDICTIONS', desc: 'Blazing fast inference time for real-time valuations using optimized neural network weights.' }
          ].map(stat => (
            <div key={stat.label} className="stats__card">
              <div className="stats__card-top">
                <span className="stats__icon"><IconDatabase /></span>
                <span className="stats__value">{stat.value}</span>
              </div>
              <h3 className="stats__label">{stat.label}</h3>
              <p className="stats__card-desc">{stat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features Split Section ── */}
      <section className="features-split">
        <div className="features-split__left">
          <h2 className="features-split__title">Advanced Property Analysis Made Simple</h2>
          <p className="features-split__desc">
            We've simplified complex architectural and economical data points into an intuitive platform. Whether you're an investor looking for market gaps or a homeowner curious about equity, we have the tools you need.
          </p>

          <div className="features-split__list">
            <div className="features-split__item">
              <IconShield />
              <div>
                <h4>Data-Driven Transparency</h4>
                <p>We don't just give you a number. We explain the 'why' behind every valuation using feature impact analysis.</p>
              </div>
            </div>
            <div className="features-split__item">
              <IconCpu />
              <div>
                <h4>Instant Processing</h4>
                <p>Our machine learning pipeline processes your property specs against thousands of market comps in milliseconds.</p>
              </div>
            </div>
            <div className="features-split__item">
              <IconDatabase />
              <div>
                <h4>Market Analytics</h4>
                <p>Access deep-dive charts showing price distributions and regional trends across the Pacific Northwest.</p>
              </div>
            </div>
          </div>
          
          <Link to="/model" className="features-split__link">
            Learn more about our model <span className="arrow">›</span>
          </Link>
        </div>

        <div className="features-split__right">
          <div className="features-split__card">
            {/* Real placeholder for the neural network visualization */}
            <img src="/assets/neural-network.png" alt="Neural Engine Active" className="img-placeholder" />
            <div className="features-split__card-overlay">
              <div className="pill-status">
                <IconCpu />
                <div>
                  <span className="pill-status__label">COMPUTING CORE</span>
                  <span className="pill-status__title">Neural Engine Active</span>
                </div>
                <span className="pill-status__badge">Stable</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="cta">
        <div className="cta__bg">
          <img src="/assets/cta-bg.png" alt="Market Growth Background" className="img-placeholder" />
        </div>
        <div className="cta__content">
          <h2 className="cta__title">Ready to discover your home's potential?</h2>
          <p className="cta__desc">Get an instant, data-backed valuation in under 2 minutes. Our platform is free to use for individual homeowners.</p>
          <div className="cta__actions">
            <button className="btn-primary">Calculate My Value Now</button>
            <button className="btn-outline">How It Works</button>
          </div>
          <p className="cta__note">NO CREDIT CARD REQUIRED • SECURE DATA PROCESSING • INSTANT RESULTS</p>
        </div>
      </section>

      {/* ── Locations Footer Banner ── */}
      <section className="locations">
        <div className="locations__card">
          <div className="locations__left">
            <div className="locations__icon">
              <IconDatabase />
            </div>
            <div>
              <h4>Localized Intelligence</h4>
              <p>Deeply specialized in the King County real estate market ecosystem.</p>
            </div>
          </div>
          <div className="locations__right">
            <span>SEATTLE</span>
            <span>BELLEVUE</span>
            <span>REDMOND</span>
            <span>KIRKLAND</span>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
