import { useEffect, useRef, useState } from 'react'

const GUIDES = [
  { key: 'ascender', label: 'Ascender', soft: true },
  { key: 'capHeight', label: 'Cap height', below: true },
  { key: 'xHeight', label: 'x-height', below: true },
  { key: 'baseline', label: 'Baseline' },
  { key: 'descender', label: 'Descender', soft: true },
]

const CORNERS = ['tl', 'tr', 'bl', 'br']

// A font unit, with a true minus sign for the descender.
const units = (value) => (value < 0 ? `\u2212${Math.abs(value)}` : String(value))

// The name set large in the display face, one span per letter so the measuring tool can
// read each glyph, inside its clear-space box (one x-height of room on every side, marked by
// the four x squares). The five metric guides sit at the font's measured heights and the gap
// between words carries its own dimension; every y comes from the real baseline of the
// rendered line, never from a typed offset.
export default function Wordmark({ text = 'HousePrice AI', metrics }) {
  const wrapRef = useRef(null)
  const probeRef = useRef(null)
  const [layout, setLayout] = useState(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const probe = probeRef.current
    if (!wrap || !probe || !metrics) return undefined

    const measure = () => {
      const wrapRect = wrap.getBoundingClientRect()
      const fontSize = parseFloat(getComputedStyle(wrap).fontSize)
      const baseline = probe.getBoundingClientRect().bottom - wrapRect.top

      // Land every rule on a whole device pixel, counted from the top of the page, so a 1px
      // line stays one crisp line at any zoom or pixel ratio.
      const dpr = window.devicePixelRatio || 1
      const pageTop = wrapRect.top + window.scrollY
      const snap = (y) => Math.round((pageTop + y) * dpr) / dpr - pageTop

      const guides = {}
      for (const guide of GUIDES) {
        guides[guide.key] = snap(baseline - (metrics[guide.key] * fontSize) / metrics.upem)
      }

      // The word gap is dimensioned at half the x-height, where the lower-case letters are.
      const gapY = snap(baseline - (metrics.xHeight * fontSize) / (2 * metrics.upem))
      const gaps = Array.from(wrap.querySelectorAll('.wordmark__space')).map((el) => {
        const rect = el.getBoundingClientRect()
        return {
          left: rect.left - wrapRect.left,
          width: rect.width,
          units: Math.round((rect.width / fontSize) * metrics.upem),
        }
      })

      setLayout({ guides, gaps, gapY })
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(wrap)
    return () => observer.disconnect()
  }, [metrics])

  const words = text.split(' ')

  return (
    <div
      className="wordmark"
      ref={wrapRef}
      role="img"
      aria-label={text}
      style={metrics ? { '--x-height': metrics.xHeight / metrics.upem } : undefined}
    >
      <div className="wordmark__box" data-measure="Clear space" aria-hidden="true">
        {CORNERS.map((corner) => (
          <span key={corner} className={`wordmark__unit wordmark__unit--${corner}`}>
            x
          </span>
        ))}
        <span className="wordmark__line">
          {words.map((word, index) => (
            <span key={`${word}-${index}`}>
              {index > 0 ? <span className="wordmark__space">{' '}</span> : null}
              <span className="wordmark__word">
                {Array.from(word).map((char, i) => (
                  <span key={i} className="wordmark__glyph" data-glyph={char}>
                    {char}
                  </span>
                ))}
              </span>
            </span>
          ))}
          <span className="wordmark__probe" ref={probeRef} data-baseline />
        </span>
      </div>

      {metrics && layout ? (
        <div className="wordmark__guides" aria-hidden="true">
          {GUIDES.map((guide, index) => (
            <div
              key={guide.key}
              className={guide.soft ? 'wordmark__guide wordmark__guide--soft' : 'wordmark__guide'}
              style={{ top: `${layout.guides[guide.key]}px`, animationDelay: `${150 + index * 80}ms` }}
            >
              <span className={guide.below ? 'wordmark__guide-label wordmark__guide-label--below' : 'wordmark__guide-label'}>
                {guide.label} {units(metrics[guide.key])}
              </span>
            </div>
          ))}
          {layout.gaps.map((gap, index) => (
            <div
              key={index}
              className="wordmark__gap"
              style={{ left: `${gap.left}px`, width: `${gap.width}px`, top: `${layout.gapY}px` }}
            >
              <span className="wordmark__gap-label">{gap.units}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
