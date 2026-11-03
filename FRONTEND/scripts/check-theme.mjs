import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'

const SRC = 'src'
const TOKENS = join(SRC, 'styles', 'tokens.css')
const THEME_FILES = new Set([TOKENS])

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    return statSync(p).isDirectory() ? walk(p) : [p]
  })

const files = walk(SRC).filter((f) => ['.css', '.jsx', '.js'].includes(extname(f)))
const problems = []

const tokens = readFileSync(TOKENS, 'utf8')
const defined = new Set([...tokens.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]))

for (const m of tokens.matchAll(/(--[\w-]+)\s*:\s*var\(\s*(--[\w-]+)/g)) {
  if (m[1] === m[2]) problems.push(`${TOKENS}: ${m[1]} references itself`)
}

const colorLiteral = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch)\(/
for (const f of files) {
  if (THEME_FILES.has(f) || f.endsWith('.test.js')) continue
  const text = readFileSync(f, 'utf8')
  text.split('\n').forEach((line, i) => {
    if (colorLiteral.test(line)) problems.push(`${f}:${i + 1}: literal color, use a token`)
    if (f.endsWith('.css') && /font-family\s*:[ \t]*(?!var\()[^\s;}]*/.test(line)) {
      problems.push(`${f}:${i + 1}: hard-coded font-family, use a token`)
    }
  })

  for (const m of text.matchAll(/var\(\s*(--[\w-]+)/g)) {
    if (!defined.has(m[1]) && !m[1].startsWith('--local-')) {
      problems.push(`${f}: ${m[1]} is not defined in tokens.css`)
    }
  }
}

if (problems.length) {
  console.error(problems.join('\n'))
  console.error(`\ncheck:theme FAILED (${problems.length} problem(s))`)
  process.exit(1)
}
console.log('check:theme OK')
