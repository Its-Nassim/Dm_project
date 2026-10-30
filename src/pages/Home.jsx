import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CLASS_NAMES } from '../lib/schema.js'

export default function Home() {
  const classes = Object.entries(CLASS_NAMES)
  const heroRef = useRef(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [sheetTransform, setSheetTransform] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (event) => {
      if (!heroRef.current) return

      const rect = heroRef.current.getBoundingClientRect()
      const x = (event.clientX - rect.left) / rect.width
      const y = (event.clientY - rect.top) / rect.height

      setMousePosition({ x, y })

      // Subtle parallax on the proof sheet
      const sheetX = (x - 0.5) * 12
      const sheetY = (y - 0.5) * 8
      setSheetTransform({ x: sheetX, y: sheetY })
    }

    const hero = heroRef.current
    if (hero) {
      hero.addEventListener('mousemove', handleMouseMove)
    }

    return () => {
      if (hero) {
        hero.removeEventListener('mousemove', handleMouseMove)
      }
    }
  }, [])

  return (
    <section className="home-hero proof" ref={heroRef}>
      <div className="container home-grid">
        <div className="home-primary">
          <h1>Review a home's price classification.</h1>
          <p className="lead">
            Enter a listing's details to receive a class label, with probabilities when the response includes them.
          </p>
          <div className="home-links">
            <Link to="/prediction" className="primary-button">Classify a property</Link>
            <Link to="/model" className="secondary-button">Model details</Link>
          </div>
        </div>

        <section
          className="proof-sheet crop crop--sheet"
          aria-labelledby="class-guide-title"
          style={{
            transform: `translate(${sheetTransform.x}px, ${sheetTransform.y}px)`,
          }}
        >
          <div className="proof-sheet__head">
            <h2 id="class-guide-title">The four class labels</h2>
            <span className="proof-sheet__readout">{classes.length} classes</span>
          </div>
          <ul className="class-list set">
            {classes.map(([classId, label]) => (
              <li key={label}>
                <span className="class-id">{classId}</span>
                <span className="class-name">{label}</span>
              </li>
            ))}
          </ul>
          <div className="proof-sheet__foot">
            <div className="sheet-spec">
              <span className="sheet-label">Class id</span>
              <span>Hedvig Letters Serif 400</span>
            </div>
            <div className="sheet-spec">
              <span className="sheet-label">Label</span>
              <span>Geist 500</span>
            </div>
          </div>
        </section>
      </div>
    </section>
  )
}
