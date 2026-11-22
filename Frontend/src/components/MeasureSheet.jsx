import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  blockText,
  gapLines,
  glyphBox,
  glyphText,
  glyphUnits,
  idleText,
  toBox,
} from '../lib/measure.js'

const MEASURABLE = '[data-measure]'
const NEIGHBOURS = '[data-measure], [data-neighbour]'

// Same test the reference uses to pick its hint: no hover means a tap, not a point.
function useCoarsePointer() {
  const [coarse, setCoarse] = useState(false)
  useEffect(() => {
    const query = window.matchMedia('(hover: none)')
    const update = () => setCoarse(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  return coarse
}

const isVisible = (el) => el.getClientRects().length > 0

// What a letter measures: its own rect (tracking included), the size it is set at, and that
// width read back in font units.
function readGlyph(el, metrics) {
  const rect = el.getBoundingClientRect()
  const fontSize = parseFloat(getComputedStyle(el).fontSize)
  return { rect, fontSize, units: glyphUnits(rect.width, fontSize, metrics.upem) }
}

// What the tool is pointing at: a letter ({ kind: 'glyph' }) or a block ({ kind: 'block' }).
function describe(sel, metrics) {
  if (!sel || !sel.el.isConnected) return null
  if (sel.kind === 'glyph') {
    if (!metrics) return null
    return glyphText(sel.el.dataset.glyph, readGlyph(sel.el, metrics).units, metrics.upem)
  }
  return blockText(sel.el.dataset.measure, toBox(sel.el.getBoundingClientRect()))
}

// The measuring tool of the Studio theme, for the Home hero.
// Children mark what can be measured: `data-glyph="e"` on a letter, `data-measure="Label"`
// on a block, `data-neighbour="Label"` on a block that only counts as a neighbour.
// Every number comes from getBoundingClientRect at the moment of the pointer event; nothing
// is typed in. Redlines are drawn in viewport space, so they are redrawn on scroll.
export default function MeasureSheet({ metrics, title, className = '', children }) {
  const rootRef = useRef(null)
  const pointerRef = useRef(null)
  const [sel, setSel] = useState(null)
  const [, redraw] = useReducer((n) => n + 1, 0)
  const coarse = useCoarsePointer()

  const clear = useCallback(() => setSel(null), [])

  // A letter is measured while the pointer is on it. Off the letters it falls back to the block
  // underneath (the clear-space box, the headline...), and over nothing measurable it clears.
  const pick = useCallback(
    (target, source) => {
      const root = rootRef.current
      if (!root) return
      if (!(target instanceof Element) || !root.contains(target)) {
        setSel((prev) => (prev && prev.source === 'pointer' ? null : prev))
        return
      }
      const glyph = target.closest('[data-glyph]')
      if (glyph && metrics) {
        setSel((prev) => (prev && prev.el === glyph ? prev : { kind: 'glyph', el: glyph, source }))
        return
      }
      const block = target.closest(MEASURABLE)
      if (block && root.contains(block)) {
        setSel((prev) => (prev && prev.el === block ? prev : { kind: 'block', el: block, source }))
        return
      }
      setSel(null)
    },
    [metrics],
  )

  const onPointerMove = (event) => {
    if (event.pointerType === 'touch') return
    pointerRef.current = { x: event.clientX, y: event.clientY }
    pick(event.target, 'pointer')
  }

  // Touch has no hover: a tap measures, and a tap on nothing clears.
  const onPointerDown = (event) => {
    if (event.pointerType !== 'touch') return
    pick(event.target, 'pointer')
  }

  const onPointerLeave = (event) => {
    if (event.pointerType === 'touch') return
    pointerRef.current = null
    clear()
  }

  // Keyboard: focusing a measurable block draws the same redlines.
  const onFocus = (event) => {
    const el = event.target
    if (!(el instanceof Element) || !el.matches(':focus-visible')) return
    const block = el.closest(MEASURABLE)
    if (block) setSel({ kind: 'block', el: block, source: 'focus' })
  }

  const onBlur = () => setSel((prev) => (prev && prev.source === 'focus' ? null : prev))

  // Scrolling moves everything under a still pointer: re-pick from the last pointer position,
  // then redraw. Resize clears. Leaving the viewport clears.
  useEffect(() => {
    let frame = 0
    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        const point = pointerRef.current
        if (point) pick(document.elementFromPoint(point.x, point.y), 'pointer')
        redraw()
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', clear)

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) clear()
    })
    if (rootRef.current) observer.observe(rootRef.current)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', clear)
      observer.disconnect()
      if (frame) cancelAnimationFrame(frame)
    }
  }, [pick, clear])

  const readout = describe(sel, metrics) || idleText(coarse)

  return (
    <div
      ref={rootRef}
      className={`measure-sheet ${className}`}
      onPointerMove={onPointerMove}
      onPointerDown={onPointerDown}
      onPointerLeave={onPointerLeave}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      <div className="measure-head">
        <span className="measure-head__title" data-measure="Sheet title">
          {title}
        </span>
        <span className="measure-head__note" data-measure={metrics ? 'Type note' : undefined}>
          {metrics ? `${metrics.family}, in units of ${metrics.upem}` : null}
        </span>
        <span className="measure-head__readout">{readout}</span>
      </div>
      {children}
      {sel && sel.el.isConnected
        ? createPortal(<MeasureOverlay sel={sel} metrics={metrics} root={rootRef.current} />, document.body)
        : null}
    </div>
  )
}

// Whole pixels, so a 1px rule stays one crisp line.
const place = (box) => ({
  left: Math.round(box.left),
  top: Math.round(box.top),
  width: Math.round(box.width),
  height: Math.round(box.height),
})

// One dimension: a rule with a tick at each end and its number in a tag on the middle.
function Redline({ line }) {
  const horizontal = line.dir === 'left' || line.dir === 'right'
  const x1 = Math.round(line.x1)
  const y1 = Math.round(line.y1)
  const x2 = Math.round(line.x2)
  const y2 = Math.round(line.y2)
  const style = horizontal ? { left: x1, top: y1, width: x2 - x1 } : { left: x1, top: y1, height: y2 - y1 }
  const tag = horizontal
    ? { left: Math.round((x1 + x2) / 2), top: y1 }
    : { left: x1, top: Math.round((y1 + y2) / 2) }
  return (
    <>
      <div className={`measure-line measure-line--${horizontal ? 'h' : 'v'}`} style={style} />
      <div className="measure-pill" style={tag}>
        {line.gap}
      </div>
    </>
  )
}

function MeasureOverlay({ sel, metrics, root }) {
  const rect = sel.el.getBoundingClientRect()

  // A letter: boxed from the ascender to the descender, its width dimensioned underneath.
  // The baseline is read from the zero-height probe the Wordmark sets on the real baseline.
  if (sel.kind === 'glyph') {
    const probe = sel.el.closest('.wordmark')?.querySelector('[data-baseline]')
    if (!probe) return null
    const { fontSize, units } = readGlyph(sel.el, metrics)
    const glyph = glyphBox(rect, probe.getBoundingClientRect().bottom, fontSize, metrics)
    const y = glyph.bottom + 18
    return (
      <div className="measure-layer" aria-hidden="true">
        <div className="measure-box measure-box--glyph" style={place(glyph)} />
        <Redline line={{ dir: 'right', gap: units, x1: glyph.left, x2: glyph.right, y1: y, y2: y }} />
      </div>
    )
  }

  // A block: boxed, its nearest neighbours dashed, and the gap to each one (or to the edge of
  // the sheet when nothing is in the way) dimensioned.
  const target = toBox(rect)
  const sheet = toBox(root.getBoundingClientRect())
  const others = Array.from(root.querySelectorAll(NEIGHBOURS))
    .filter((el) => el !== sel.el && !el.contains(sel.el) && !sel.el.contains(el) && isVisible(el))
    .map((el) => ({ el, box: toBox(el.getBoundingClientRect()) }))
  const lines = gapLines(
    target,
    others.map((item) => item.box),
    sheet,
  )
  const outlined = new Set(lines.filter((line) => line.box).map((line) => line.box))

  return (
    <div className="measure-layer" aria-hidden="true">
      {others
        .filter((item) => outlined.has(item.box))
        .map((item, index) => (
          <div key={index} className="measure-box measure-box--neighbour" style={place(item.box)} />
        ))}
      <div className="measure-box" style={place(target)} />
      {lines.map((line) => (
        <Redline key={line.dir} line={line} />
      ))}
    </div>
  )
}
