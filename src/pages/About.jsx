import { Link } from 'react-router-dom'
import PropertyImage from '../components/PropertyImage'
import './About.css'

const About = () => (
  <div className="about">
    <section className="about-hero">
      <div className="container about-hero__content">
        <div className="about-hero__left">
          <h1 className="about-hero__title">About HousePrice AI</h1>
          <p className="about-hero__desc">
            A guide to King County housing classification methodology and system behavior.
          </p>
          <div className="about-hero__buttons">
            <Link to="/prediction" className="btn-primary">Classify a house</Link>
            <Link to="/analytics" className="btn-outline">Dataset analytics</Link>
          </div>
        </div>
        <p className="about-hero__context">King County, Washington</p>
      </div>
    </section>

    {/* How to read this demo: Ruled list */}
    <section className="about-values" aria-labelledby="about-principles-title">
      <div className="container about-values__layout">
        <div className="about-values__header">
          <h2 id="about-principles-title" className="about-section-title">How to read this demo</h2>
          <p className="about-values__sub">Essential parameters and boundaries for the interface.</p>
        </div>
        <div className="about-values__list">
          <article className="about-value-card">
            <span className="about-value-card__dot" aria-hidden="true" />
            <div className="about-value-card__body">
              <h3 className="about-value-card__title">Inputs</h3>
              <p className="about-value-card__desc">
                The form is generated from feature_schema.json. The asking price is a required input.
              </p>
            </div>
          </article>
          <article className="about-value-card">
            <span className="about-value-card__dot" aria-hidden="true" />
            <div className="about-value-card__body">
              <h3 className="about-value-card__title">Results</h3>
              <p className="about-value-card__desc">
                The page shows the predicted price category and, when the server supplies them, class probabilities. Predictions come from a trained Decision Tree served by the Flask API. In mock mode the responses are fake and labeled as such.
              </p>
            </div>
          </article>
          <article className="about-value-card">
            <span className="about-value-card__dot" aria-hidden="true" />
            <div className="about-value-card__body">
              <h3 className="about-value-card__title">Data</h3>
              <p className="about-value-card__desc">
                House sales dataset for King County (Kaggle). The interface is not connected to an external database.
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>

    {/* King County Dataset: Bone Well */}
    <section className="about-dataset-section" aria-labelledby="dataset-detail-title">
      <div className="container">
        <div className="about-well-frame">
          <div className="about-dataset__plate">
            <PropertyImage
              src="/images/hero/hero-dusk-residence.jpg"
              alt=""
              aspectRatio="21/9"
              fallbackLabel="King County Contemporary Architecture"
              showVignette={true}
            />
          </div>
          <div className="about-well-card">
            <div className="about-dataset__layout">
              <div className="about-dataset__left">
                <h2 id="dataset-detail-title" className="about-dataset__title">The King County housing dataset</h2>
                <p className="about-dataset__desc">
                  Residential sales in King County, Washington utilized for housing price classification.
                </p>
                <dl className="about-dataset__stats">
                  <div className="about-dataset__stat">
                    <dt className="about-dataset__stat-label">Columns in dataset</dt>
                    <dd className="about-dataset__stat-value num">21</dd>
                  </div>
                  <div className="about-dataset__stat">
                    <dt className="about-dataset__stat-label">Rows</dt>
                    <dd className="about-dataset__stat-value num">21,000+ (project brief)</dd>
                  </div>
                  <div className="about-dataset__stat">
                    <dt className="about-dataset__stat-label">Source</dt>
                    <dd className="about-dataset__stat-value">Kaggle</dd>
                  </div>
                  <div className="about-dataset__stat">
                    <dt className="about-dataset__stat-label">Train/test split</dt>
                    <dd className="about-dataset__stat-value num">80/20, stratified, random_state=42 (project plan; confirm with M3)</dd>
                  </div>
                </dl>
              </div>

              <div className="about-dataset__right">
                <h3 className="about-dataset__dimensions-title">Dataset features</h3>
                <ul className="about-dataset__list">
                  <li><span className="dim-label">Asking price</span><span className="dim-code num">price</span></li>
                  <li><span className="dim-label">Living area</span><span className="dim-code num">sqft_living</span></li>
                  <li><span className="dim-label">Area above ground</span><span className="dim-code num">sqft_above</span></li>
                  <li><span className="dim-label">Basement area</span><span className="dim-code num">sqft_basement</span></li>
                  <li><span className="dim-label">Year built</span><span className="dim-code num">yr_built</span></li>
                  <li><span className="dim-label">Year renovated</span><span className="dim-code num">yr_renovated</span></li>
                  <li><span className="dim-label">Location</span><span className="dim-code num">zipcode, lat, long</span></li>
                  <li><span className="dim-label">Quality & condition</span><span className="dim-code num">grade, condition, view, waterfront</span></li>
                </ul>
                <p className="about-dataset__note">
                  Which columns are model inputs is defined by feature_schema.json.
                </p>
              </div>
            </div>
          </div>

          <div className="about-well-caption">
            <p className="about-well-caption__title">King County reference corpus</p>
            <p className="about-well-caption__desc">
              Historical open data recorded across King County residential parcels.
            </p>
          </div>
        </div>
      </div>
    </section>

    {/* Project Documentation in Smoked Glass */}
    <section className="about-docs" aria-labelledby="about-docs-title">
      <div className="container">
        <div className="glass about-docs__card">
          <div className="about-docs__text">
            <h2 id="about-docs-title" className="about-docs__title">Project documentation</h2>
            <p className="about-docs__desc">
              Methodology documents are part of the team report and are not linked from this interface.
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
)

export default About
