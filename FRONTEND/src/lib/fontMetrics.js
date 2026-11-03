import { useEffect, useState } from 'react'

const FAMILY = 'Hedvig Letters Serif'
const SAMPLE = 'HousePrice AIdxp'
const UPEM = 1000

function faceLoaded(family) {
  return Array.from(document.fonts).some(
    (face) => face.family.replace(/["']/g, '') === family && face.status === 'loaded',
  )
}

// Real measurements of the face the browser is drawing, in units of 1000 per em.
// Everything comes from canvas text metrics; if the face did not load, returns null
// and the tool shows nothing rather than a number it cannot stand behind.
export async function loadFontMetrics(family = FAMILY) {
  if (typeof document === 'undefined' || !document.fonts || !document.fonts.load) return null
  try {
    await document.fonts.load(`400 100px "${family}"`, SAMPLE)
    await document.fonts.ready
  } catch {
    return null
  }
  if (!faceLoaded(family)) return null

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null

  // Ink bounds by pixel scan at 1000px, so one pixel is one font unit. measureText's
  // bounding boxes are padded by a few units in Chromium and would draw guides off the glyphs.
  const W = 1000
  const H = 1500
  const BASE = 1050
  const ink = (ch) => {
    canvas.width = W
    canvas.height = H
    ctx.font = `400 ${UPEM}px "${family}"`
    ctx.textBaseline = 'alphabetic'
    ctx.fillStyle = '#000'
    ctx.fillText(ch, 80, BASE)
    const { data } = ctx.getImageData(0, 0, W, H)
    let top = -1
    let bottom = -1
    for (let y = 0; y < H; y += 1) {
      for (let x = 0; x < W; x += 1) {
        if (data[(y * W + x) * 4 + 3] > 127) {
          if (top < 0) top = y
          bottom = y
          break
        }
      }
    }
    if (top < 0) return null
    return { rise: BASE - top, fall: bottom + 1 - BASE }
  }

  const d = ink('d')
  const cap = ink('H')
  const x = ink('x')
  const p = ink('p')
  if (!d || !cap || !x || !p) return null

  canvas.width = 1
  ctx.font = `400 ${UPEM}px "${family}"`

  return {
    family,
    upem: UPEM,
    ascender: d.rise,
    capHeight: cap.rise,
    xHeight: x.rise,
    baseline: 0,
    descender: -p.fall,
    advance: (ch) => Math.round(ctx.measureText(ch).width),
  }
}

export function useFontMetrics(family = FAMILY) {
  const [metrics, setMetrics] = useState(null)
  useEffect(() => {
    let alive = true
    loadFontMetrics(family).then((value) => {
      if (alive) setMetrics(value)
    })
    return () => {
      alive = false
    }
  }, [family])
  return metrics
}
