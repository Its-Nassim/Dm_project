import { Link } from 'react-router-dom'
import './About.css'

const About = () => (
  <div className="about">
    <section className="about-hero">
      <div className="container about-hero__content">
        <div className="about-hero__left">
          <h1 className="about-hero__title">About HousePrice AI</h1>
          <p className="about-hero__desc">
            A short guide to the King County references and local demo behavior.
          </p>
          <div className="about-hero__buttons">
            <Link to="/prediction" className="btn-primary">Try the form</Link>
            <Link to="/analytics" className="btn-outline">View market charts</Link>
          </div>
        </div>
        <p className="about-hero__context">King County, Washington</p>
      </div>
    </section>

    <section className="about-values" aria-labelledby="about-principles-title">
      <div className="container about-values__layout">
        <h2 id="about-principles-title">How to read this demo</h2>
        <div className="about-values__list">
          <article className="about-value-card">
            <h3 className="about-value-card__title">Inputs</h3>
            <p className="about-value-card__desc">
              The form collects bedrooms, bathrooms, floors and waterfront status, then carries them to the result route.
            </p>
          </article>
          <article className="about-value-card">
            <h3 className="about-value-card__title">Results</h3>
            <p className="about-value-card__desc">
              The displayed valuation is fixed sample content. It is not calculated from the submitted values.
            </p>
          </article>
          <article className="about-value-card">
            <h3 className="about-value-card__title">Data</h3>
            <p className="about-value-card__desc">
              The project describes a King County housing dataset; the interface has no connected live data service.
            </p>
          </article>
        </div>
      </div>
    </section>

    <section className="about-dataset" aria-labelledby="dataset-detail-title">
      <div className="container about-dataset__layout">
        <div className="about-dataset__left">
          <h2 id="dataset-detail-title">The King County housing dataset</h2>
          <p className="about-dataset__desc">
            Existing project copy describes residential sales in Seattle and the surrounding metropolitan area between 2014 and 2015.
          </p>
          <dl className="about-dataset__stats">
            <div className="about-dataset__stat">
              <dt className="about-dataset__stat-label">Records stated in the project</dt>
              <dd className="about-dataset__stat-value">21,613</dd>
            </div>
            <div className="about-dataset__stat">
              <dt className="about-dataset__stat-label">Features stated in the project</dt>
              <dd className="about-dataset__stat-value">20</dd>
            </div>
            <div className="about-dataset__stat">
              <dt className="about-dataset__stat-label">Source named in the project</dt>
              <dd className="about-dataset__stat-value">King County Govt</dd>
            </div>
            <div className="about-dataset__stat">
              <dt className="about-dataset__stat-label">Validation split in existing copy</dt>
              <dd className="about-dataset__stat-value">20% random</dd>
            </div>
          </dl>
          <p className="about-dataset__note">
            These values are preserved from the project’s existing copy; the model and its evaluation are not available to verify them here.
          </p>
        </div>

        <div className="about-dataset__right">
          <h3>Dimensions named in the interface</h3>
          <ul className="about-dataset__list">
            <li><span>Living area</span><span>sqft_living</span></li>
            <li><span>Condition and grade</span><span>Property quality</span></li>
            <li><span>Renovation history</span><span>Year renovated</span></li>
            <li><span>Basement area</span><span>sqft_basement</span></li>
            <li><span>Location</span><span>Latitude and longitude</span></li>
          </ul>
        </div>
      </div>
    </section>

    <section className="about-docs" aria-labelledby="about-docs-title">
      <div className="container about-docs__content">
        <div>
          <h2 id="about-docs-title">Project documentation</h2>
          <p className="about-docs__desc">
            The existing Methodology and Data Audit controls do not have destinations in this demo.
          </p>
        </div>
        <p className="about-docs__note">No documentation or audit report is connected here.</p>
      </div>
    </section>
  </div>
)

export default About
