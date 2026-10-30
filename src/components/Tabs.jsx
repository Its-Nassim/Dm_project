import { useRef } from 'react'
import './Tabs.css'

export default function Tabs({ tabs, activeId, onChange, ariaLabel = 'Navigation tabs' }) {
  const tabRefs = useRef([])

  const handleKeyDown = (event, index) => {
    let nextIndex = index
    if (event.key === 'ArrowRight') {
      nextIndex = (index + 1) % tabs.length
    } else if (event.key === 'ArrowLeft') {
      nextIndex = (index + tabs.length - 1) % tabs.length
    } else if (event.key === 'Home') {
      nextIndex = 0
    } else if (event.key === 'End') {
      nextIndex = tabs.length - 1
    } else {
      return
    }
    event.preventDefault()
    onChange(tabs[nextIndex].id)
    tabRefs.current[nextIndex]?.focus()
  }

  return (
    <div className="tab-list" role="tablist" aria-label={ariaLabel}>
      {tabs.map((tab, index) => {
        const isActive = tab.id === activeId
        return (
          <button
            key={tab.id}
            ref={(el) => {
              tabRefs.current[index] = el
            }}
            id={`tab-${tab.id}`}
            className={`tab-btn ${isActive ? 'tab-btn--active' : ''}`}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${tab.id}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          >
            <span className="tab-btn__indicator" aria-hidden="true" />
            <span className="tab-btn__label">{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}
