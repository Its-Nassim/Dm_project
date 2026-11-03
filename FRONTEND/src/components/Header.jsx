import { NavLink, useLocation } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/model', label: 'Model' },
  { to: '/about', label: 'About' },
]

export default function Header() {
  const isHome = useLocation().pathname === '/'

  return (
    <header className={`site-header proof${isHome ? ' site-header--home' : ''}`}>
      <div className="container site-header__inner">
        <NavLink to="/" className="brand-mark" aria-label="HousePrice AI home">
          HousePrice AI
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
        <NavLink
          to="/prediction"
          className={isHome ? 'secondary-button' : 'primary-button primary-button--small'}
        >
          Predict
        </NavLink>
      </div>
    </header>
  )
}
