import { Link } from 'react-router-dom'
import './Footer.css'

const Footer = () => (
  <footer className="footer">
    <div className="footer__inner container">
      <div className="footer__statement">
        <p className="footer__brand-name">HousePrice AI</p>
        <p className="footer__brand-desc">
          King County housing data, presented through a property valuation demo.
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
        <p className="footer__note">Static interface demo · no live valuation service</p>
      </div>
    </div>
  </footer>
)

export default Footer
