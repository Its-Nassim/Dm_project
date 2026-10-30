import { Link } from 'react-router-dom'
import { CLASS_NAMES } from '../lib/schema.js'

export default function Home() {
  return (
    <section className="page-section home-screen">
      <div className="container home-grid">
        <div className="home-primary">
          <h1>Review a home’s price classification.</h1>
          <p>
            Enter a listing’s details to receive a class label, with probabilities when the response includes them.
          </p>
          <div className="home-links">
            <Link to="/prediction" className="primary-button">Classify a property</Link>
            <Link to="/model" className="secondary-button">Model details</Link>
          </div>
        </div>

        <section className="class-guide" aria-labelledby="class-guide-title">
          <h2 id="class-guide-title">The four class labels</h2>
          <ul className="class-list">
            {Object.entries(CLASS_NAMES).map(([classId, label]) => (
              <li key={label}>
                <span className="class-id">{classId}</span>
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </section>
  )
}
