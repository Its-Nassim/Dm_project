import { Link } from 'react-router-dom'
import ApiStatus from './ApiStatus.jsx'
import './Footer.css'

const Footer = () => (
  <footer className="footer">
    <div className="footer__inner container">
      <div className="footer__statement">
        <p className="footer__brand-name">HousePrice AI</p>
        <p className="footer__brand-desc">
          Classifies whether a King County house&apos;s asking price is attractive or too expensive relative to comparable houses.
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
        <div className="footer__note">
          <ApiStatus />
        </div>
      </div>
    </div>
  </footer>
)

export default Footer
