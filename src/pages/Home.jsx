import { Link } from 'react-router-dom'
import './Home.css'

const Home = () => (
  <div className="home">
    <section className="hero">
      <div className="hero__inner container">
        <div className="hero__content">
          <h1 className="hero__title">Predict the Value of Your Home</h1>
          <p className="hero__desc">
            Explore a property valuation demo built around King County housing data.
          </p>
          <div className="hero__actions">
            <Link to="/prediction" className="btn-primary">Start a valuation</Link>
            <Link to="/analytics" className="btn-outline">Explore market charts</Link>
          </div>
        </div>
        <figure className="hero__visual">
          <img
            src="/assets/valuation-form-preview-desktop.png"
            alt="HousePrice AI property form showing bedroom, bathroom, floor, and waterfront inputs"
            width="1440"
            height="900"
            fetchPriority="high"
          />
          <figcaption className="hero__caption">
            Captured from the local demo. The result screen shows fixed example values.
          </figcaption>
        </figure>
      </div>
    </section>

    <section className="stats" aria-labelledby="home-views-title">
      <div className="container">
        <div className="stats__header">
          <h2 className="stats__title" id="home-views-title">Explore the interface</h2>
          <p className="stats__desc">
            Open the working form, then browse the static market and model views.
          </p>
        </div>
        <nav className="stats__grid" aria-label="HousePrice AI sections">
          <Link className="stats__card" to="/prediction">
            <span className="stats__label">Property details</span>
            <span className="stats__card-desc">Choose the inputs carried to the result screen.</span>
          </Link>
          <Link className="stats__card" to="/analytics">
            <span className="stats__label">Market charts</span>
            <span className="stats__card-desc">Review illustrative charts from the existing interface.</span>
          </Link>
          <Link className="stats__card" to="/model">
            <span className="stats__label">Model details</span>
            <span className="stats__card-desc">Switch between the existing model information panels.</span>
          </Link>
        </nav>
      </div>
    </section>

    <section className="features-split" aria-labelledby="dataset-title">
      <div className="container features-split__inner">
        <div className="features-split__left">
          <h2 className="features-split__title" id="dataset-title">A King County reference</h2>
          <p className="features-split__desc">
            The project references the King County housing dataset: 21,613 historical property records from 2014–2015.
          </p>
          <Link to="/about" className="features-split__link">Read about the dataset</Link>
        </div>
        <div className="features-split__right">
          <p className="features-split__figure">21,613</p>
          <p className="features-split__figure-note">records named in the project’s dataset description</p>
        </div>
      </div>
    </section>

    <section className="locations" aria-labelledby="locations-title">
      <div className="container locations__inner">
        <div className="locations__heading">
          <h2 id="locations-title">Places in the current copy</h2>
          <p>These city names appear in the existing HousePrice AI interface.</p>
        </div>
        <ul className="locations__list">
          <li>Seattle</li>
          <li>Bellevue</li>
          <li>Redmond</li>
          <li>Kirkland</li>
        </ul>
      </div>
    </section>

    <section className="cta" aria-labelledby="home-cta-title">
      <div className="container cta__inner">
        <div className="cta__content">
          <h2 className="cta__title" id="home-cta-title">Try the property form</h2>
          <p className="cta__desc">
            The form carries your selected details to a fixed demonstration result; no live valuation runs.
          </p>
        </div>
        <Link to="/prediction" className="btn-primary">Open the form</Link>
      </div>
    </section>
  </div>
)

export default Home
