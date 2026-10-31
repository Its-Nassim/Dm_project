import assert from 'node:assert/strict'
import test from 'node:test'
import { blockText, gapLines, glyphBox, glyphText, glyphUnits, idleText, toBox } from './measure.js'

const box = (left, top, right, bottom) => toBox({ left, top, right, bottom })
const sheet = { left: 0, top: 0, right: 1440, bottom: 900 }

test('gaps are the real distances to the nearest neighbour in each direction', () => {
  const paragraph = box(200, 100, 640, 164)
  const buttons = box(200, 188, 360, 236) // 24 below the paragraph
  const lines = gapLines(buttons, [paragraph], sheet)
  const top = lines.find((line) => line.dir === 'top')
  assert.equal(top.kind, 'neighbour')
  assert.equal(top.gap, 24)
  assert.equal(top.box, paragraph)
})

test('between two buttons the gap is the horizontal distance', () => {
  const first = box(200, 188, 360, 236)
  const second = box(376, 188, 534, 236)
  const lines = gapLines(first, [second], sheet)
  assert.equal(lines.find((line) => line.dir === 'right').gap, 16)
})

test('with no neighbour, all four sides measure to the edge of the sheet', () => {
  const only = box(196, 300, 400, 348)
  const lines = gapLines(only, [], sheet)
  assert.deepEqual(lines.map((line) => line.dir).sort(), ['bottom', 'left', 'right', 'top'])
  assert.ok(lines.every((line) => line.kind === 'edge'))
  assert.equal(lines.find((line) => line.dir === 'left').gap, 196)
  assert.equal(lines.find((line) => line.dir === 'right').gap, 1040)
  assert.equal(lines.find((line) => line.dir === 'top').gap, 300)
  assert.equal(lines.find((line) => line.dir === 'bottom').gap, 552)
})

test('boxes that share no span on the other axis are not neighbours', () => {
  const target = box(100, 100, 200, 150)
  const diagonal = box(260, 400, 320, 450)
  const lines = gapLines(target, [diagonal], sheet)
  assert.ok(lines.every((line) => line.kind === 'edge'))
})

test('the nearest of several neighbours wins, and touching boxes give no gap', () => {
  const target = box(100, 100, 200, 150)
  const near = box(230, 110, 300, 140)
  const far = box(500, 100, 600, 150)
  const touching = box(100, 150, 200, 190)
  const lines = gapLines(target, [far, near, touching], sheet)
  assert.equal(lines.find((line) => line.dir === 'right').gap, 30)
  assert.equal(lines.find((line) => line.dir === 'bottom'), undefined)
})

test('a gap under 3 px is not drawn, 3 px is', () => {
  const target = box(100, 100, 200, 150)
  const close = box(202, 100, 260, 150) // 2 px to the right
  const fair = box(100, 153, 200, 190) // 3 px below
  const lines = gapLines(target, [close, fair], sheet)
  assert.equal(lines.find((line) => line.dir === 'right'), undefined)
  assert.equal(lines.find((line) => line.dir === 'bottom').gap, 3)
})

test('a block flush with the sheet edge draws nothing on that side', () => {
  const flush = box(0, 40, 300, 90)
  const lines = gapLines(flush, [], sheet)
  assert.equal(lines.find((line) => line.dir === 'left'), undefined)
  assert.equal(lines.find((line) => line.dir === 'right').gap, 1140)
})

test('redline ends run from the target edge to the neighbour edge', () => {
  const target = box(100, 100, 200, 150)
  const right = box(230, 90, 300, 170)
  const line = gapLines(target, [right], sheet).find((item) => item.dir === 'right')
  assert.equal(line.x1, 200)
  assert.equal(line.x2, 230)
  assert.equal(line.y1, 125)
  assert.equal(line.y2, 125)
})

test('a letter box runs from the ascender to the descender, as wide as the letter', () => {
  const metrics = { ascender: 800, descender: -247, upem: 1000 }
  const rect = { left: 100, right: 162.7, top: 400, bottom: 540 }
  const glyph = glyphBox(rect, 500, 100, metrics)
  assert.equal(glyph.left, 100)
  assert.equal(glyph.right, 162.7)
  assert.equal(glyph.top, 420) // 500 - 0.8 * 100
  assert.equal(glyph.bottom, 524.7) // 500 + 0.247 * 100
  assert.equal(glyphUnits(glyph.width, 100, 1000), 627)
})

test('readout strings', () => {
  assert.equal(glyphText('e', 502, 1000), 'e, advance 502 of 1000')
  assert.equal(blockText('Headline', box(0, 0, 612.4, 121.6)), 'Headline, 612 × 122 px')
  assert.equal(idleText(false), 'Point at a letter to measure it')
  assert.equal(idleText(true), 'Tap a letter to measure it')
})
