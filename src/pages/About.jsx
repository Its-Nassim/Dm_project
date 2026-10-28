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
            A guide to King County housing data references and property demo behavior.
          </p>
          <div className="about-hero__buttons">
            <Link to="/prediction" className="btn-primary">Try the form</Link>
            <Link to="/analytics" className="btn-outline">View market charts</Link>
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
            <span className="about-value-card__dot" aria-hidden="true"></span>
            <div className="about-value-card__body">
              <h3 className="about-value-card__title">Inputs</h3>
              <p className="about-value-card__desc">
                The form collects bedrooms, bathrooms, square footage, grade, and waterfront status, carrying them to the result route.
              </p>
            </div>
          </article>
          <article className="about-value-card">
            <span className="about-value-card__dot" aria-hidden="true"></span>
            <div className="about-value-card__body">
              <h3 className="about-value-card__title">Results</h3>
              <p className="about-value-card__desc">
                The displayed valuation is fixed sample content. It illustrates result presentation rather than running live server inference.
              </p>
            </div>
          </article>
          <article className="about-value-card">
            <span className="about-value-card__dot" aria-hidden="true"></span>
            <div className="about-value-card__body">
              <h3 className="about-value-card__title">Data</h3>
              <p className="about-value-card__desc">
                The project references a historical King County housing corpus; the interface has no connected external database.
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
              alt="King County contemporary residential architecture"
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
                  Residential sales in Seattle and surrounding municipalities from May 2014 through May 2015.
                </p>
                <dl className="about-dataset__stats">
                  <div className="about-dataset__stat">
                    <dt className="about-dataset__stat-label">Records stated in project</dt>
                    <dd className="about-dataset__stat-value num">21,613</dd>
                  </div>
                  <div className="about-dataset__stat">
                    <dt className="about-dataset__stat-label">Features stated in project</dt>
                    <dd className="about-dataset__stat-value num">20</dd>
                  </div>
                  <div className="about-dataset__stat">
                    <dt className="about-dataset__stat-label">Source named in project</dt>
                    <dd className="about-dataset__stat-value">King County Govt</dd>
                  </div>
                  <div className="about-dataset__stat">
                    <dt className="about-dataset__stat-label">Validation split in copy</dt>
                    <dd className="about-dataset__stat-value num">20% random</dd>
                  </div>
                </dl>
                <p className="about-dataset__note">
                  Values preserved from existing project copy; model verification runs independently.
                </p>
              </div>

              <div className="about-dataset__right">
                <h3 className="about-dataset__dimensions-title">Dimensions named in interface</h3>
                <ul className="about-dataset__list">
                  <li><span className="dim-label">Living area</span><span className="dim-code num">sqft_living</span></li>
                  <li><span className="dim-label">Condition and grade</span><span className="dim-code">Property quality</span></li>
                  <li><span className="dim-label">Renovation history</span><span className="dim-code num">Year renovated</span></li>
                  <li><span className="dim-label">Basement area</span><span className="dim-code num">sqft_basement</span></li>
                  <li><span className="dim-label">Location</span><span className="dim-code">Latitude and longitude</span></li>
                </ul>
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
              Methodology and Data Audit controls in original templates do not link to separate routes in this demo.
            </p>
          </div>
          <div className="about-docs__note-pill">
            No documentation or audit report is connected here.
          </div>
        </div>
      </div>
    </section>
  </div>
)

export default About
