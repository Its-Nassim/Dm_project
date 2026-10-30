import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/prediction', label: 'Prediction' },
  { to: '/model', label: 'Model' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/about', label: 'About' },
]

export default function Header() {
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <NavLink to="/" className="brand-mark" aria-label="House Price Relevance home">
          House Price Relevance
        </NavLink>
        <nav className="primary-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
