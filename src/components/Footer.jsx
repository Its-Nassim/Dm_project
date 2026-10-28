import { Link } from 'react-router-dom'
import './Footer.css'

const Footer = () => (
  <footer className="footer">
    <div className="footer__inner container">
      <div className="footer__statement">
        <p className="footer__brand-name">HousePrice AI</p>
        <p className="footer__brand-desc">
          King County housing dataset reference, presented through a calibrated property valuation demo.
        </p>
      </div>

      <nav className="footer__nav" aria-label="Footer navigation">
        <Link to="/">Home</Link>
        <Link to="/prediction">Predict</Link>
        <Link to="/analytics">Analytics</Link>
        <Link to="/model">Model</Link>
        <Link to="/about">About</Link>
      </nav>

      <div className="footer__bottom">
        <p className="footer__copy">© 2026 HousePrice AI</p>
        <p className="footer__credit">
          Photographs: <a href="https://commons.wikimedia.org/wiki/File:Vallee-brouillard.jpg" target="_blank" rel="noopener noreferrer">Thomas Bresson</a> (CC BY 3.0, Wikimedia Commons)
        </p>
        <p className="footer__note">Static demonstration interface; no live valuation service</p>
      </div>
    </div>
  </footer>
)

export default Footer
