import { Link } from 'react-router-dom'

export default function Analytics() {
  return (
    <section className="page-section">
      <div className="container">
        <header className="screen-intro">
          <h1>Class distribution.</h1>
          <p>View class totals when a model summary is available.</p>
        </header>
        <div className="empty-panel">
          <h2>No class totals available.</h2>
          <p>This screen has no connected distribution data, so it shows no percentages.</p>
          <Link to="/prediction" className="secondary-button">Classify a property</Link>
        </div>
      </div>
    </section>
  )
}
