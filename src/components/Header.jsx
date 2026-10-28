import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Header.css'

const IconBuilding = () => (
  <svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
    <path d="M9 22v-4h6v4"></path>
    <path d="M8 6h.01"></path>
    <path d="M16 6h.01"></path>
    <path d="M12 6h.01"></path>
    <path d="M12 10h.01"></path>
    <path d="M12 14h.01"></path>
    <path d="M16 10h.01"></path>
    <path d="M16 14h.01"></path>
    <path d="M8 10h.01"></path>
    <path d="M8 14h.01"></path>
  </svg>
)

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Analytics', path: '/analytics' },
  { name: 'Model', path: '/model' },
  { name: 'About', path: '/about' },
]

const Header = () => {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
      <div className="header__inner">
        <Link to="/" className="header__logo" aria-label="HousePrice AI home">
          <IconBuilding />
          <span>HousePrice AI</span>
        </Link>

        <nav
          className={`header__nav ${menuOpen ? 'header__nav--open' : ''}`}
          id="primary-navigation"
          aria-label="Primary navigation"
        >
          {navLinks.map((link) => {
            const active = location.pathname === link.path
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`header__nav-link ${active ? 'active' : ''}`}
                aria-current={active ? 'page' : undefined}
                onClick={() => setMenuOpen(false)}
              >
                {link.name}
              </Link>
            )
          })}
        </nav>

        <div className="header__actions">
          <Link
            to="/prediction"
            className="header__cta"
            aria-current={location.pathname.startsWith('/prediction') ? 'page' : undefined}
            onClick={() => setMenuOpen(false)}
          >
            Predict
          </Link>
        </div>

        <button
          className="header__mobile-toggle"
          type="button"
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>
    </header>
  )
}

export default Header
