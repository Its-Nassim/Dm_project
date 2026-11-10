import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="site-footer proof">
      <div className="container site-footer__inner">
        <div>
          <div className="brand-mark brand-mark--small">House Price Relevance</div>
          <p>Classification-only output built for transparent property review.</p>
        </div>
        <nav className="footer-links" aria-label="Footer navigation">
          <Link to="/prediction">Prediction</Link>
          <Link to="/model">Model</Link>
          <Link to="/analytics">Analytics</Link>
          <Link to="/about">About</Link>
        </nav>
      </div>
    </footer>
  )
}
