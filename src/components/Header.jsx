import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Header.css'

const IconBuilding = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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

const IconMoon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
)

const IconGithub = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="18" r="3"></circle>
    <circle cx="6" cy="6" r="3"></circle>
    <circle cx="18" cy="6" r="3"></circle>
    <path d="M18 9v2c0 .6-.4 1-1 1H7c-.6 0-1 .4-1 1v2"></path>
  </svg>
)

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Predict', path: '/prediction' },
  { name: 'Analytics', path: '/analytics' },
  { name: 'Model', path: '/model' },
  { name: 'About', path: '/about' },
]

const Header = () => {
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
      <Link to="/" className="header__logo">
        <IconBuilding />
        HousePrice AI
      </Link>
      
      <nav className="header__nav">
        {navLinks.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            className={`header__nav-link ${location.pathname === link.path ? 'active' : ''}`}
          >
            {link.name}
          </Link>
        ))}
      </nav>
      
      <div className="header__actions">
        <button className="header__icon-btn" aria-label="Toggle theme">
          <IconMoon />
        </button>
        <button className="header__icon-btn" aria-label="GitHub">
          <IconGithub />
        </button>
      </div>

      <button className="header__mobile-toggle">
        ☰
      </button>
    </header>
  )
}

export default Header
