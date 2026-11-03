// Pure geometry for the measuring tool. No DOM access: boxes in, numbers out.
// A box is { left, top, right, bottom } in the same coordinate space (viewport px).

const EPS = 0.5
// The reference draws no dimension shorter than 3 px: under that the tag would hide the line.
const MIN_GAP = 3

export function toBox(rect) {
  return {
    left: rect.left,
    top: rect.top,
    right: rect.right,
    bottom: rect.bottom,
    width: rect.right - rect.left,
    height: rect.bottom - rect.top,
  }
}

export function sizeLabel(box) {
  return `${Math.round(box.width)} × ${Math.round(box.height)} px`
}

const overlapX = (a, b) => Math.min(a.right, b.right) - Math.max(a.left, b.left)
const overlapY = (a, b) => Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)

// The nearest other box in one direction: it must lie wholly beyond the target's edge
// and share some of its span on the other axis.
function nearest(target, others, dir) {
  let best = null
  for (const other of others) {
    let gap
    if (dir === 'right') {
      if (other.left < target.right - EPS || overlapY(target, other) <= 0) continue
      gap = other.left - target.right
    } else if (dir === 'left') {
      if (other.right > target.left + EPS || overlapY(target, other) <= 0) continue
      gap = target.left - other.right
    } else if (dir === 'bottom') {
      if (other.top < target.bottom - EPS || overlapX(target, other) <= 0) continue
      gap = other.top - target.bottom
    } else {
      if (other.bottom > target.top + EPS || overlapX(target, other) <= 0) continue
      gap = target.top - other.bottom
    }
    if (!best || gap < best.gap) best = { box: other, gap }
  }
  return best
}

// For each direction: the gap to the nearest neighbour, or, when there is none, the distance to
// the edge of the sheet. `sheet` is { left, top, right, bottom } in the same space as the boxes.
// Gaps under MIN_GAP are dropped. Returns a list of { dir, kind: 'neighbour' | 'edge', gap, box?,
// x1, y1, x2, y2 } where the x/y pairs are the ends of the redline that spans the gap.
export function gapLines(target, others, sheet) {
  const lines = []
  for (const dir of ['top', 'right', 'bottom', 'left']) {
    const hit = nearest(target, others, dir)
    let kind
    let gap
    let box = null
    if (hit) {
      kind = 'neighbour'
      gap = hit.gap
      box = hit.box
    } else {
      kind = 'edge'
      if (dir === 'left') gap = target.left - sheet.left
      else if (dir === 'right') gap = sheet.right - target.right
      else if (dir === 'top') gap = target.top - sheet.top
      else gap = sheet.bottom - target.bottom
    }
    if (gap < MIN_GAP) continue

    const midY = box
      ? (Math.max(target.top, box.top) + Math.min(target.bottom, box.bottom)) / 2
      : (target.top + target.bottom) / 2
    const midX = box
      ? (Math.max(target.left, box.left) + Math.min(target.right, box.right)) / 2
      : (target.left + target.right) / 2

    let line
    if (dir === 'right') line = { x1: target.right, y1: midY, x2: target.right + gap, y2: midY }
    else if (dir === 'left') line = { x1: target.left - gap, y1: midY, x2: target.left, y2: midY }
    else if (dir === 'bottom') line = { x1: midX, y1: target.bottom, x2: midX, y2: target.bottom + gap }
    else line = { x1: midX, y1: target.top - gap, x2: midX, y2: target.top }

    lines.push({ dir, kind, gap: Math.round(gap), box, ...line })
  }
  return lines
}

// The box a letter is measured in: as wide as the letter's own rect, from the ascender down to
// the descender. `baseline` is the y of the baseline in the same space as `rect`; `metrics` is
// { ascender, descender (negative), upem } in font units.
export function glyphBox(rect, baseline, fontSize, metrics) {
  const top = baseline - (metrics.ascender * fontSize) / metrics.upem
  const bottom = baseline - (metrics.descender * fontSize) / metrics.upem
  return toBox({ left: rect.left, right: rect.right, top, bottom })
}

// A width in pixels, read back in font units.
export function glyphUnits(width, fontSize, upem) {
  return Math.round((width / fontSize) * upem)
}

export function idleText(coarse) {
  return coarse ? 'Tap a letter to measure it' : 'Point at a letter to measure it'
}

export function glyphText(char, advance, upem) {
  return `${char}, advance ${advance} of ${upem}`
}

export function blockText(label, box) {
  return `${label}, ${sizeLabel(box)}`
}
