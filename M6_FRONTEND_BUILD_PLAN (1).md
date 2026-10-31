# M6 Frontend: Build Plan from Zero

**Theme:** Hallmark · Studio, applied 100% (section 2)
**Role:** M6 (Frontend)
**Project:** Automatic classification of housing price relevance (one Decision Tree, King County dataset)
**Built from:** `step.txt` + `M6_FRONTEND_CHANGES.md`
**Status:** plan only. Nothing here has been run against the real project. The one script included (`check-theme.mjs`, section 2.4) was tested on sample trees and on the real Studio theme files; nothing else was run.

---

## 0. Read this first

1. **The theme source is verified and official.** Hallmark is an MIT-licensed open-source design skill; its Studio theme was read from the repo (section 2). Phase 0 brings the theme files in, and **no component CSS is written until `tokens.css`, `base.css` and `studio.css` are in the repo**. Theme values quoted in this plan (sizes, hues, widths) exist only to make the parity checks concrete; if they ever differ from `tokens.css` or `docs/studio.md`, the files win.
2. **Stack:** React + Vite calling the Flask API (same default as the audit, decision D-1). `step.txt` mentions `webapp/templates/index.html` + `static/`; if M5 requires plain HTML/JS, sections 4 to 6 (contracts, behavior, tests) still apply and only the rendering layer changes.
3. **Contracts are proposals** until M3 (`feature_schema.json`) and M5 (API) confirm them. Both sit behind two adapters (`lib/schema.js`, `api/client.js`), so a change touches one file.

---

## 1. Rules (non-negotiable)

1. Valid dataset columns, the only valid field names:
   `id, date, price, bedrooms, bathrooms, sqft_living, sqft_lot, floors, waterfront, view, condition, grade, sqft_above, sqft_basement, yr_built, yr_renovated, zipcode, lat, long, sqft_living15, sqft_lot15`
2. Never invent attributes, categories, city or neighborhood names, prices, metrics, confidence numbers, ZIP tables or example "comparable sales". No text descriptions for `view`, `condition`, `grade` unless the schema supplies them.
3. Classification output only: class id + name, plus probabilities when the server sends them. Never show a price estimate, interval, drivers, comps, R², MAE, RMSE, peer median, ratio or confidence score.
4. `price` (asking price, USD) is a **required input**, always shown with its unit. Peer median and ratio are never inputs and never appear in the UI, payloads or copy.
5. Classes: `0 Cheaper than average`, `1 Reasonable price`, `2 Over priced`, `3 Too over priced`. Do not display thresholds (M2 still validates them).
6. Do not claim anything is tested or connected unless you ran it. Report what you could not run.
7. Dependencies: `react`, `react-dom`, `react-router-dom`, plus Vite and ESLint tooling. **No UI kit, CSS framework, icon pack or chart library** (they would break theme fidelity). Tests use Node's built-in runner.
8. Do not touch Flask, the model, notebooks, data or other members' deliverables. Needs go to section 7.
9. Files copied from Hallmark · Studio keep their original line endings and are changed only as listed in 2.1. The MIT notice stays in the repo.

---

## 2. Theme contract: Hallmark · Studio (100%)

**Source (verified).** Hallmark is an open-source design skill under the MIT license ([github.com/Nutlope/hallmark](https://github.com/Nutlope/hallmark)). Studio is its theme "Field Office, an identity studio" (preview: usehallmark.com/themes/studio/). Field Office is a sample client: its name, copy, photographs and the `--s1-*` / `--s2-*` / `--s3-*` sample colors are demo content and are **not** reused. The wordmark of this app is `HousePrice AI`.

### 2.1 Intake (first task of Phase 0)

**Route A, the skill** (so the coding agent builds to the written spec):

```
npx skills add nutlope/hallmark -g                       # all projects, needs Node 18+; drop -g for this project only
npx skills add nutlope/hallmark -g --agent claude-code   # one harness only
# or inside Claude Code:  /plugin marketplace add nutlope/hallmark   then   /plugin install hallmark@hallmark
```

**Route B, the files** (clone the repo into a temp folder outside the project; do not run anything from inside it):

| From the repo | To | Rule |
|---|---|---|
| `site/themes/studio/tokens.css` | `src/styles/tokens.css` | Verbatim, except delete the three sample-client color blocks (`--s1-*`, `--s2-*`, `--s3-*`). The only place values are defined. |
| `site/themes/studio/base.css` | `src/styles/base.css` | Verbatim (reset, body, headings, `:focus-visible`, `.container`, `.num`, `.visually-hidden`, gutters, reduced motion). |
| Theme blocks of `site/themes/studio/style.css` | `src/styles/studio.css` | Verbatim blocks only: crop marks (`.crop*`), registration marks (`.reg*`), dimension lines (`.dim*`), links, nav, controls (`.btn*`), fields (`.field`, `.ctl`, `.help`), `.set`, `.sheet-head` + `.readout`, `.photo` + `.cap`, footer (`.foot*`), `.skip`, `.redlines*`, and the reduced-motion block. Leave out the Field Office page sections (`.board*`, `.spec*` cards, `.room*`, `.specimen*`, `.studio*`, `.figures`, `.bcard*`, hero copy). |
| `site/themes/studio/spec.js` (measuring tool part) | `src/components/MeasureSheet.jsx` | Same behavior ported to React (optional, Phase 5). |
| `skills/hallmark/references/themes/studio.md` | `docs/studio.md` | Verbatim. The written spec every visual decision is checked against. |
| `LICENSE` | `THIRD_PARTY_NOTICES.md` | Keep the MIT text and the copyright line. |

**Fonts:** the `<link>` in `index.html` follows the theme's build hint, without the specimen face (the app has no specimens): Hedvig Letters Serif (`opsz@12..24`) and Geist (`wght@400;500`) from Google Fonts, `display=swap`.

### 2.2 Rules (from `docs/studio.md`; where this plan asks for more, the stricter rule wins)

1. **Tokens only.** Colors, fonts, text sizes, radius, shadow, spacing scale, durations and easing come from `tokens.css`. No literal values in app CSS.
2. **Type.** Hedvig Letters Serif 400 (its only weight) for heads, figures and the wordmark; never running text, labels or buttons. Geist 400/500 for everything else, line-height 1.55, running text in `--color-ink-2`. Labels, captions and readouts: Geist 500 a step smaller, sentence case, `--color-muted`, tabular figures (`.num`). **No monospace**: show column names (`sqft_living`) in this label voice.
3. **Orange** (`--color-accent`) fills only the one primary action of a view (Predict, Classify file) and draws thin lines (guides, dimensions, hover underline). Never orange type, an orange field or a second warm color. Reset, Clear file and Download are outlined `.btn`.
4. **Ground.** Cool paper (`--color-paper`, hue 215). Bands are `--color-paper-2`, or one ink band with paper type. Never warm paper.
5. **Dot grid and grain** belong to the nav, the Home hero and the footer, faded out before the next section. Never behind forms, results, tables or running text.
6. **Crop marks on every printed piece:** buttons always, fields on focus, the result sheet, figure plates.
7. **Rules and radius.** 1px `--color-rule` between rows, 1px `--color-ink` opening a set. Controls 2px, cards `--radius-card` (3px). Nothing rounder.
8. **Shadow.** Only `--shadow-sheet`, only on paper objects (the result sheet). Everything else is flat.
9. **Controls.** 48px high (44px for `.btn--small`), second rule inset 2px, crop marks that open slightly on hover, focus ring `--color-focus` (2px, 4px offset on buttons). Disabled: `--color-paper-3` and `cursor: not-allowed`. Busy: `cursor: progress`.
10. **Motion.** State changes at `--dur-short` on `--ease-out`; guides draw once along their length; under `prefers-reduced-motion` the full construction shows, still. No spinner, no shimmer.
11. **Imagery: none.** Studio allows only the work's own photographs (true color, crop-marked, never mockups). The app has no real house photos, so no images and no placeholders.
12. **Guides and dimensions are measured, never typed.** A guide must be true to the font's metrics and a dimension must be the real one.
13. **Voice.** Spare and exact; name the thing and its measurement. No marketing filler.
14. **Layout.** `.container` (max `--container`, gutter 64px, 24px under 60rem, 16px under 40rem) on a 12-column grid with `--gap-columns`.

### 2.3 Class styling (replaces any earlier mapping)

Studio has two status hues, `--color-success` and `--color-error`, plus the ink neutrals. Orange is reserved (rule 3) and there is no `--color-accent-2`. Proposal (decision D-9): outlined chips, class 3 filled. A class is always shown as **icon + id + name**, never by color alone.

| id | Name | Style | Icon | Text contrast (computed) |
|---|---|---|---|---|
| 0 | Cheaper than average | `--color-success` text, 1px `--color-success` border | down | 5.24:1 on paper, 4.77:1 on paper-2 |
| 1 | Reasonable price | `--color-ink-2` text, 1px `--color-ink-2` border | equal | 10.83:1 on paper |
| 2 | Over priced | `--color-error` text, 1px `--color-error` border | up | 5.61:1 on paper |
| 3 | Too over priced | `--color-error` fill, `--color-paper` text | double-up | 5.61:1 |

- Contrast is computed from the `oklch` values in `tokens.css` and is approximate; re-measure in devtools.
- Orange guide lines on paper reach only 2.82:1, below the 3:1 needed for meaningful graphics. They stay decorative: any value they draw is also printed as text. **Probability bars use an ink fill** (`--color-ink`) on a 1px `--color-rule` track, with the percentage as text.
- The primary button is ink text on orange (6.35:1) inside a 1px ink border.
- Do not display class thresholds (M2 still validates them).

### 2.4 Conformance checks (run before every commit)

**Automated:** `npm run check:theme` fails on: literal colors; hard-coded `font-family` or literal `font-size`; any `box-shadow` or `drop-shadow` other than `--shadow-sheet`; a radius other than 2px, `--radius-card` or 50%; any `var(--x)` not defined in `tokens.css` (this catches invented tokens such as `--color-accent-2`); self-referencing tokens. The verbatim theme files are skipped; `--local-*` and properties declared in the same file are allowed. Not checked: spacing values, and camelCase styles in JSX other than colors. It was tested on sample trees and on the real Studio files.

```js
// scripts/check-theme.mjs  (run: npm run check:theme)
// Fails when app code drifts from the Hallmark Studio theme.
// Not checked: spacing values, and camelCase styles in JSX other than colors.
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'

const SRC = 'src'
const TOKENS = join(SRC, 'styles', 'tokens.css')
// Copied from Hallmark Studio and never edited, so never linted.
const VERBATIM = new Set([TOKENS, join(SRC, 'styles', 'base.css'), join(SRC, 'styles', 'studio.css')])

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    return statSync(p).isDirectory() ? walk(p) : [p]
  })

const problems = []
const tokens = readFileSync(TOKENS, 'utf8')
const declaredIn = (text) => new Set([...text.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]))
const themeTokens = declaredIn(tokens)

// A token that references itself is invalid in CSS (custom-property cycle).
for (const m of tokens.matchAll(/(--[\w-]+)\s*:\s*var\(\s*(--[\w-]+)/g)) {
  if (m[1] === m[2]) problems.push(`${TOKENS}: ${m[1]} references itself`)
}

const colorLiteral = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch)\(/
const okRadius = /^(0|1px|2px|50%|inherit|var\(--radius-(card|pill)\))$/
const files = walk(SRC).filter((f) => ['.css', '.jsx', '.js'].includes(extname(f)))

for (const f of files) {
  if (VERBATIM.has(f) || f.endsWith('.test.js')) continue
  const text = readFileSync(f, 'utf8')
  const isCss = f.endsWith('.css')
  text.split('\n').forEach((line, i) => {
    const at = `${f}:${i + 1}`
    if (colorLiteral.test(line)) problems.push(`${at}: literal color, use a token`)
    if (!isCss) return
    if (/font-family\s*:[ \t]*(?!var\()[^\s;}]/.test(line)) problems.push(`${at}: hard-coded font-family, use --font-display or --font-body`)
    if (/font-size\s*:\s*[\d.]+(px|rem|em)\b/.test(line)) problems.push(`${at}: literal font-size, use a --text-* token`)
    if (/(box-shadow|drop-shadow)/.test(line) && !/var\(--shadow-sheet\)|none/.test(line)) problems.push(`${at}: only --shadow-sheet is allowed, and only on paper objects`)
    const r = line.match(/border-radius\s*:\s*([^;}]+)/)
    if (r && !okRadius.test(r[1].trim())) problems.push(`${at}: radius "${r[1].trim()}" (allowed: 2px controls, var(--radius-card))`)
  })
  // var(--x) must exist in tokens.css, be declared in the same file, or be --local-*
  const own = declaredIn(text)
  for (const m of text.matchAll(/var\(\s*(--[\w-]+)/g)) {
    if (!themeTokens.has(m[1]) && !own.has(m[1]) && !m[1].startsWith('--local-')) {
      problems.push(`${f}: ${m[1]} is not defined in tokens.css`)
    }
  }
}

if (problems.length) {
  console.error([...new Set(problems)].join('\n'))
  console.error(`\ncheck:theme FAILED (${new Set(problems).size} problem(s))`)
  process.exit(1)
}
console.log('check:theme OK')
```

**Visual parity (manual, at 375 / 768 / 1280 px), side by side with usehallmark.com/themes/studio and `docs/studio.md`.** Record Pass/Fail plus a screenshot per row in the report; any Fail blocks the phase.

| Check | Compare against |
|---|---|
| Type: Hedvig 400 heads at `--tracking-display`, line-height at most 1.05; Geist body 1.55; labels Geist 500, muted, tabular | `docs/studio.md` Type |
| Layout: container, gutters 64 / 24 / 16, 12 columns | `base.css`, `docs/studio.md` |
| Nav: 72px, grain + dots, Hedvig wordmark, orange underline on link hover, small stamped action | theme nav |
| Buttons: default, hover (paper-2, marks open), active (1px down), focus (4px offset), disabled, busy | `.btn` in the theme |
| Fields: 48px, 1px `--color-muted` border, 2px radius, crop marks on focus, invalid border `--color-error` | `.field`, `.ctl` |
| Tabs, No / Yes control, select (2.5) | selected-state vocabulary |
| Result sheet: crop-marked, radius 3px, `--shadow-sheet`, no other shadow anywhere | `docs/studio.md` Surfaces |
| Tables and groups: ink rule opens, `--color-rule` rows, tabular figures | `.set` |
| Dot grid only on nav, hero, footer | `docs/studio.md` Surfaces |
| Footer: mast on the dot grid, guides, registration marks | theme footer |
| Motion and reduced motion | `docs/studio.md` Motion |
| Contrast: text 4.5:1, controls 3:1 (2.3) | measured in devtools |

### 2.5 Where Studio has no component (compose from its tokens, flag in the parity review)

| Need | Studio provides | Build as (proposal) |
|---|---|---|
| Tabs (Single house / Upload CSV, Model page) | only the `.spec[aria-selected]` selected state | `role="tab"` buttons: unselected 1px `--color-rule` border; selected 1px `--color-ink` border + `--color-paper-hi` + crop marks visible; hover `--color-paper-2`. Keyboard like the theme's own tabs: arrows, Home, End, roving `tabindex`. |
| `waterfront` | nothing | Two-segment `role="radiogroup"` (`No` / `Yes`) in the same selected-state style; default `No`; sends 0 or 1. |
| `<select>` | `.field input` only | The same declarations as `.field input`, applied to `select` in app CSS (never by editing `studio.css`). |
| Results table | `.set` + `.num` | `.set` rows: ink rule on top, `--color-rule` between rows, tabular numbers. |
| Loading | `.btn[aria-busy]`, the `draw` keyframes | `Predicting…` label plus a 1px `--color-accent` guide that draws along its length and repeats; static under reduced motion. Skeletons are static `--color-paper-2` blocks. |
| Icons | nothing | Inline SVG, 1px stroke in `currentColor` (the theme draws everything as 1px lines); no icon library. |

### 2.6 Signature elements and where they go

- **Crop marks:** buttons, focused fields, the result sheet, figure plates (rule 6).
- **Construction hero (Home only):** `HousePrice AI` set large in Hedvig on the dot grid, with the five metric guides (ascender 800, cap height 700, x-height 520, baseline 0, descender −247, labelled as the theme labels them), the clear-space `x` boxes, registration marks (`.reg`, hidden under 60rem) and the sheet head with its readout. Guides draw once on load.
- **Measuring tool (optional, Home hero only).** Behavior read from `spec.js`:
  - the readout slot (top right of the sheet head) says `Point at a letter to measure it`, or `Tap a letter to measure it` on touch devices;
  - over a letter it shows the glyph advance in font units (`e, advance 502 of 1000`) with a bracket and a number pill under the letter;
  - over a block it shows the block size in px (`Headline, 612 × 122 px`) and the distance to the nearest neighbor in each direction, neighbors outlined dashed;
  - `cursor: crosshair` on the wordmark words only (buttons use `pointer`, disabled `not-allowed`, busy `progress`);
  - keyboard: focusing a measurable block draws the same redlines; it clears on pointer leave, blur and resize.
  Port the logic as is. Every number comes from a real measurement (rule 12), and the page must read whole without it.

---

## 3. Stack, structure, configuration

```
house-pred/
  .env.example
  docs/studio.md                   # Studio spec, verbatim
  THIRD_PARTY_NOTICES.md           # Hallmark MIT notice
  scripts/check-theme.mjs
  public/eda/manifest.json         # supplied by M1 (optional)
  src/
    main.jsx  App.jsx              # routes: /  /prediction  /model  /analytics  /about
    styles/
      tokens.css                   # Hallmark · Studio, verbatim, only source of values
      base.css                     # Hallmark · Studio, verbatim
      studio.css                   # Studio component blocks, verbatim (2.1)
    config/
      featureSchema.js             # loadSchema, MOCK_SCHEMA, useSchema()
      fieldMeta.js                 # labels/help/groups keyed by column name (no dataset values)
      classes.js
    api/
      client.js  mock.js
    lib/                           # pure: no React, no import.meta.env, tested with node --test
      schema.js  payload.js  validation.js  csv.js   (+ *.test.js each)
    components/
      Header  Footer  Tabs  SchemaField  ErrorBanner  ClassBadge  ProbabilityList  ApiStatus  MeasureSheet (optional)   (+ CSS)
    pages/
      Home  PredictionForm (tab shell)  SingleHouse  BatchUpload  Model  Analytics  About   (+ CSS)
```

There is no separate result page: the result lives inline in the Single house tab and in the batch table.

**`vite.config.js`** (anchored regex keys: the page route `/prediction` starts with the API path `/predict`, so a plain `'/predict'` key would proxy the page to Flask):

```js
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = env.VITE_DEV_PROXY_TARGET || 'http://127.0.0.1:5000'
  const api = { target, changeOrigin: true }
  return {
    plugins: [react()],
    server: {
      proxy: {
        '^/predict$': api,
        '^/predict_batch$': api,
        '^/health$': api,
        '^/model_info$': api,
        // add the schema and download routes once M5 confirms their paths (section 7)
      },
    },
  }
})
```

**`.env.example`** (developers copy it to `.env.local`):

```
# true = use src/api/mock.js, no backend needed
VITE_USE_MOCK=true
# empty = same origin (dev proxy, or Flask serving dist/)
VITE_API_BASE_URL=
VITE_DEV_PROXY_TARGET=http://127.0.0.1:5000
VITE_MAX_CSV_MB=5
VITE_REQUEST_TIMEOUT_MS=30000
VITE_BATCH_TIMEOUT_MS=120000
```

**`package.json` scripts:** `dev`, `build`, `lint`, `test` = `node --test`, `check:theme` = `node scripts/check-theme.mjs`.

**Production serving:** if Flask serves `dist/`, `BrowserRouter` deep links need a Flask catch-all returning `index.html` for non-API paths (request to M5). If M5 refuses, switch to `HashRouter` and say so in the report. Do not decide silently.

---

## 4. Build phases

| Phase | What | `step.txt` window |
|---|---|---|
| 0 | Scaffold, theme intake, app shell | Day 1 |
| 1 | Data layer on fake data | Days 1 to 3 |
| 2 | Shared components | Days 2 to 4 |
| 3 | Single house tab | Days 3 to 5 |
| 4 | Upload CSV tab | Days 4 to 6 |
| 5 | Home, Model, Analytics, About | Days 5 to 7 |
| 6 | Real schema, then real API | Days 6 to 8 (schema), 9 to 10 (API) |
| 7 | Testing, screenshots, report, slides | Days 11 to 14 |

One commit per numbered step. Run `npm run check:theme`, `npm run lint` and `npm test` before each commit.

### Phase 0: scaffold, theme, shell

1. `npm create vite@latest house-pred -- --template react`, then `npm i react-router-dom`. Work on branch `frontend`.
2. Theme intake (2.1), then add `scripts/check-theme.mjs` and the `package.json` scripts. Import `tokens.css`, `base.css` and `studio.css` in `main.jsx`, in that order, and load the fonts per 2.1.
3. Add `vite.config.js`, `.env.example`. Set `index.html` title to `HousePrice AI: Is the asking price fair?` and description to `Classify whether a King County house's asking price is cheaper than average, reasonable, over priced or too over priced relative to comparable houses.`
4. Build `Header` (72px nav on the grain + dot ground, Hedvig wordmark `HousePrice AI`, Home / Analytics / Model / About, a small stamped **Predict** action to `/prediction`, mobile menu that also closes on `Escape`) and `Footer` (the mast on the dot grid, 5 nav links, `ApiStatus` slot) from the theme's nav and footer blocks.
5. `App.jsx` routes with placeholder pages.

**Exit:** dev server shows the shell in the Hallmark theme; the 2.4 parity rows for header/footer pass; `check:theme`, `lint`, `build` pass.

### Phase 1: data layer (fake data first)

**`lib/schema.js`** (pure): `normalizeSchema(raw)` validates the shape in 5.1 and throws readable errors (`"feature_schema.json: feature #3 has no name"`). It is the only place that knows the JSON layout.

**`config/featureSchema.js`:** `loadSchema()` returns `MOCK_SCHEMA` when `VITE_USE_MOCK === 'true'`, otherwise calls `getSchema()`; caches the promise. `useSchema()` returns `{ status, schema, error, retry }`. Exposes `features` (ordered, exact names), `classLabels`, `source` (`'mock' | 'schema'`), `getFeature(name)`.

**Mock schema rules** (derived only from the dataset column list, never presented as real):
- Features = all columns except `id` and `date` (`MOCK_EXCLUDED = ['id', 'date']`; M3 decides). `price` first and required.
- `price`: number, greater than 0, unit USD. `waterfront`: binary. `view`: categorical 0 to 4. `condition`: 1 to 5. `grade`: 1 to 13 (these three ranges come from the project brief). `zipcode`: categorical with `values: null`. `lat`, `long`: number. `bathrooms`, `floors`: step `any`. `yr_built`, `yr_renovated`: integers, no max. Every other numeric column: min 0.
- No other min/max, no category lists, no defaults. Every mock field carries `rangeSource: 'mock'`.
- While `source === 'mock'`, the form shows a persistent notice: *"Mock schema derived from the dataset column list. Ranges and options are placeholders to be replaced by M3's feature_schema.json."* In mock mode only, `zipcode` is a 5-digit text input labelled "ZIP code (temporary free input)"; with a non-empty `values` array it becomes a `<select>`. Never hardcode a ZIP list.

**`config/fieldMeta.js`:** labels, help, grouping and order keyed by column name. Unknown columns fall back to the raw name in an "Other" group. The column name is always shown next to the label in the label voice with tabular figures (`.num`); Studio has no monospace.

| Column | Label | Group | Help |
|---|---|---|---|
| `price` | Asking price (USD) | Price | Listing price in US dollars. Required, greater than 0. |
| `zipcode` | ZIP code | Location | |
| `lat`, `long` | Latitude, Longitude | Location | decimal degrees |
| `bedrooms`, `bathrooms`, `floors` | Bedrooms, Bathrooms, Floors | Size and layout | fractional values allowed for bathrooms and floors |
| `sqft_living`, `sqft_lot`, `sqft_above`, `sqft_basement` | Living area, Lot size, Area above ground, Basement area | Size and layout | sq ft; `sqft_basement` 0 means no basement |
| `sqft_living15`, `sqft_lot15` | raw column name until the team confirms the meaning | Size and layout | the brief does not define them |
| `waterfront` | Waterfront | Quality and history | No / Yes segmented control (2.5), sends 0 or 1 |
| `view`, `condition`, `grade` | View rating, Condition rating, Construction grade | Quality and history | numeric labels only |
| `yr_built` | Year built | Quality and history | year |
| `yr_renovated` | Year renovated | Quality and history | 0 means never renovated |

**`config/classes.js`:** `DEFAULT_CLASSES` = the four classes of 2.3 (id, name, token, icon). If the schema provides `target_labels`, those override the names.

**`api/client.js`:**
- `BASE = import.meta.env.VITE_API_BASE_URL ?? ''`; one `ENDPOINTS` object (`predict`, `predictBatch`, `health`, `modelInfo`, `schema` = TBD by M5), nothing hardcoded elsewhere.
- Functions: `getSchema()`, `predictSingle(payload)`, `predictBatch(file)`, `downloadResults(response)`, `getHealth()`, `getModelInfo()`; each delegates to `mock.js` when `VITE_USE_MOCK === 'true'`.
- Single request: JSON `POST` with an `AbortController` timeout. Batch: `FormData` (field name `file`, to confirm with M5); **do not set `Content-Type`** (the browser adds the boundary).
- One `ApiError { kind, status, message, fieldErrors, raw }`:

| Situation | `kind` | Message |
|---|---|---|
| HTTP 400 with JSON | `validation` | the server's text **verbatim** (`error`, else `message`, else `errors`); `fieldErrors` from `fields`/`errors` when keyed by feature name |
| HTTP 5xx or non-JSON body | `server` | `The server returned an error (HTTP <status>).` + raw text in a "Details" disclosure |
| `fetch` throws `TypeError` | `network` | `Cannot reach the prediction server. Check that the backend is running.` |
| `AbortError` | `timeout` | `The request timed out.` |
| 200 with `text/html` on an API path | `proxy` | `API route is not proxied. Check vite.config.js and VITE_DEV_PROXY_TARGET.` |

- `normalizePrediction(raw)` returns `{ classId, className, probabilities: [{classId, label, value}] | null }`; it accepts probabilities as an object keyed by class id, an object keyed by name, or an array aligned to class ids. It never computes or invents probabilities.

**`api/mock.js`:** active only when `VITE_USE_MOCK=true`. Returns `MOCK_SCHEMA`, a fake `/predict` result after 600 to 900 ms, a fake batch response, a fake `/health`, and **no** `/model_info` (so Model shows its "not connected" state). The mock class is clearly arbitrary (a hash of the payload), every mock result carries `mock: true`, and mock probabilities sum to 1. Failure toggles read only here: `?mock=error400`, `?mock=error500`, `?mock=network`, `?mock=slow`, `?mock=batcherror`.

**`lib/*` (pure, unit-tested):**
- `payload.js`: `buildPayload(values, schema)` returns keys in schema order with exact names; numbers cast with `Number()`; binary to 0/1; categorical numeric values cast to numbers when the schema's `values` are numbers. Never includes `id`, `date` or helper columns unless the schema lists them.
- `validation.js`: `validateSingle(values, schema)` returns `{ errors, warnings }`. Rules: required non-empty; numeric parse; `price > 0`; `min`/`max` (inclusive unless exclusive); integers are integers; categorical value is in `values` when provided. Messages name the field label and the allowed range. Soft warning (never blocks) if `sqft_living` differs from `sqft_above + sqft_basement`, only when all three are schema features.
- `csv.js`: `readCsvMeta(text)` returns `{ headers, rowCount, errors }` (strip BOM, quoted fields and embedded newlines, trim headers, detect duplicate headers, ignore trailing blank lines); `buildTemplate(schema)` returns a header-only CSV in schema order; `buildResultsCsv(rows)` returns CSV with proper quoting.

**Exit:** `npm test` covers `normalizeSchema` (valid, missing name, unknown type), `buildPayload`, `validateSingle` (missing/zero/negative price, `grade 14`, `view 5`, `condition 0`, non-integer bedrooms, the soft warning), `readCsvMeta` (BOM, quoted commas, embedded newline, duplicate header, empty file, header-only file, trailing blank lines), `buildTemplate`, `buildResultsCsv` quoting.

### Phase 2: shared components (Hallmark classes first, tokens second)

- `Tabs`: accessible tablist (arrow keys, Home, End, roving `tabIndex`), styled per 2.5.
- `SchemaField`: one renderer for number / select / toggle / price (details in Phase 3).
- `ErrorBanner`: `role="alert"`, icon + text, optional list of links to invalid fields, optional "Details" disclosure for raw server text, optional action button; uses the error token.
- `ClassBadge`: icon + `Class <id>` + name; large and compact sizes; styles per 2.3.
- `ProbabilityList`: one row per class (label, percentage text in the label voice, and an ink bar on a 1px `--color-rule` track as `role="meter"` or `<progress>`; never orange, see 2.3), sorted by class id, **renders nothing when there are no probabilities**.
- `ApiStatus` (Footer): mock mode shows `Mock data (no backend)`; otherwise calls `getHealth()` once and shows `API connected` / `API unreachable` as icon + text in an `aria-live="polite"` region. Never says "connected" without a successful `/health`.

**Exit:** each component passes its 2.4 parity rows (states, focus, contrast).

### Phase 3: Single house tab

`PredictionForm` is the shell: Studio layout (12-column grid, each field group a set opened by a 1px ink rule, not a card), eyebrow `King County · Decision Tree classifier`, title `Classify an asking price`, subtitle `Check whether a house's asking price is attractive or too expensive relative to comparable houses.`, and `Tabs` for **Single house** / **Upload CSV**, mirrored in `?mode=single|csv` (default `single`).

`SingleHouse`:
1. `useSchema()`: while loading show skeleton panels with `aria-busy="true"`. On failure show an `ErrorBanner` ("The form could not be built because feature_schema could not be loaded") with a Retry button. Never fall back to the mock silently.
2. Panels in this order: **Price**, **Location**, **Size and layout**, **Quality and history** (empty groups omitted, "Other" last). Controls via `SchemaField`:
   - `price`: `type="text" inputMode="numeric"`, `$` prefix, thousands separators on blur, digits parsed on submit, sent as a number, visible `*` + `aria-required`.
   - number / integer: `type="number"`, `step` and `min`/`max` from the schema only, wheel changes disabled (`onWheel={e => e.currentTarget.blur()}`).
   - binary: the No / Yes segmented control (2.5) as a `role="radiogroup"` labelled with `aria-labelledby`, sends 0/1, default `No`.
   - categorical: `<select>` with a first `Select…` option, numeric option labels only.
   - Every control: real `<label htmlFor>`, `name` equal to the column name, help via `aria-describedby`, errors via `aria-describedby` + `aria-invalid="true"`.
3. State holds raw strings (no `Number('')`). No invented defaults: fields start empty, binary off.
4. **Predict** (`type="submit"`, `.btn--primary`, the view's one orange action): run `validateSingle`. On errors, show the `ErrorBanner` summary with links, mark fields, move focus to the first invalid field; warnings render as non-blocking notes. If valid, `buildPayload` then `predictSingle`. While waiting: `<fieldset disabled>`, Predict shows `Predicting…` with `aria-busy="true"` and the drawing guide (2.5), Reset disabled, result panel shows a skeleton inside an `aria-live="polite"` region, no double submit. Server 400: message verbatim, plus `fieldErrors` on matching fields. Network / timeout / 5xx: normalized message and a **Try again** button that resubmits the same payload.
5. **Reset** (`type="button"`, `.btn`): clears values, errors, warnings and result; aborts any in-flight request; focus returns to the first field.
6. **Result panel** (the page's one paper object: `.crop--sheet` with `--shadow-sheet`): idle text `Fill in the form and press Predict.` On success: a heading that receives focus (`tabIndex={-1}`) containing the large `ClassBadge`; the **echoed asking price** formatted `$450,000 USD` from the submitted payload; `ProbabilityList` when probabilities exist; the note `The category compares the asking price with comparable houses, as defined by the project's target.`; and a `Mock response, not a model output` badge when `mock: true`. Reserve min-height so the layout does not shift between states.

**Exit:** the single-house rows of the section 6 matrix pass in mock mode; parity rows pass.

### Phase 4: Upload CSV tab

1. Dropzone: a `<label>` styled as a button wrapping a visually hidden (not `display:none`) `<input type="file" accept=".csv,text/csv">`; drag and drop with a visible drag-over state and instructions; keyboard operable.
2. On selection, run client checks via `lib/csv.js` and show each failure as a specific `ErrorBanner` message while **Classify file** stays disabled: not a `.csv`; empty file (0 bytes or no data rows); larger than `VITE_MAX_CSV_MB`; duplicate or blank headers; **required columns missing** (listed by name, compared with `schema.features`). Unknown extra columns are a non-blocking warning (the server decides).
3. File chip: name, size, detected rows, columns matched `x/y`, **Clear file** button.
4. **Download CSV template:** header-only CSV from `buildTemplate(schema)`, named `house_template.csv`. No example row (values would be invented).
5. **Classify file:** `predictBatch(file)` with the same loading pattern as single (disabled controls, `aria-busy`, the drawing guide of 2.5, `aria-live`). File-level server errors render verbatim.
6. **Results:** summary figures (Hedvig numerals with label-voice captions: rows submitted, classified, failed, and a count per class **computed from the returned rows**); a `.set` table (2.5) in a scroll region (`role="region"`, `aria-label="Batch results"`, `tabIndex=0`, sticky header) with columns `#`, asking price (when echoed), predicted category (compact `ClassBadge`), top probability (only when supplied), status/error text. Row errors show icon + text. Client pagination 25/50/100 with Previous/Next and "Showing a-b of n". Mock badge when `mock: true`.
7. **Download results:** use the backend mechanism. If the response has `download_url`, trigger it (anchor with `download`, or fetch to blob to object URL, revoked afterwards). If M5 returns a CSV blob, save that. Only if neither exists, fall back to `buildResultsCsv(rows)` and label this in the report. The button is disabled, with a visible reason, until results exist.
8. Large files: one `file.text()` pass for header and row count only; never build objects for all rows; render at most one page of rows.

**Exit:** the CSV rows of the section 6 matrix pass in mock mode (including a 20k+ row file without freezing).

### Phase 5: static pages (real content only)

| Page | Content |
|---|---|
| **Home** | Hero: the construction sheet of 2.6, then h1 `Is the asking price fair for comparable houses?`; description `Classify a King County house's asking price as cheaper than average, reasonable, over priced or too over priced.`; buttons `Classify a house` (to `/prediction`) and `Upload a CSV` (to `/prediction?mode=csv`). A static "Four categories" `.set` list of `DEFAULT_CLASSES` (icon + id + name, no numbers, no thresholds). Metrics, as one ink band with Hedvig figures: `4` price categories, `1` Decision Tree model, `2` ways to use it, and `<schema feature count>` input features (show `-` with "from feature_schema.json (mock schema active)" while mock). Caption: `House sales dataset for King County (Kaggle). The team documents the target definition and thresholds.` Tour as an index of 3 `.set` rows with Hedvig item titles (hover shifts the title and turns the toggle orange): Single house, Upload CSV, Model details. No images. CTA: `Ready to classify a house?` / `Enter one house or upload a CSV and get its price category.` / button `Open the form`. |
| **Model** | State `loading \| notConnected \| ready` from `getModelInfo()`. Not connected (absent, 404 or mock): one line of text `Model metrics are not connected yet.` Hero specs only what is true or supplied: `Algorithm: Decision Tree classifier (single model)`, `Task: supervised classification, 4 classes`, `Input features: <schema count>`; add scikit-learn version / training rows only if `/model_info` supplies them. Metrics grid shows only metrics present in `/model_info` with their exact keys. Tabs: `Classes` (legend from `classes.js`), `Features` (importances only from `/model_info.feature_importances`), `Evaluation` (confusion matrix only if supplied); empty states otherwise. Hero description: `Values on this page come from the backend's /model_info when it is connected.` |
| **Analytics** | Title `Dataset analytics`. Description `No data is connected to this page yet. Figures from the team's exploratory analysis can be listed here.` Figure gallery of crop-marked plates with `.cap` captions, rendered from `public/eda/manifest.json` (`[{ "file", "title", "caption" }]`) if present, otherwise the empty state. No number is typed by hand. Keep the `Open the form` CTA. |
| **About** | Inputs: `The form is generated from feature_schema.json. The asking price is a required input.` Results: `The page shows the predicted price category and, when the server supplies them, class probabilities. Predictions come from a trained Decision Tree served by the Flask API. In mock mode the responses are fake and labeled as such.` Data: `House sales dataset for King County (Kaggle). The interface is not connected to an external database.` Stats: `Columns in dataset: 21`, `Rows: 21,000+ (project brief)`, `Source: Kaggle`, `Train/test split: 80/20, stratified, random_state=42 (project plan; confirm with M3)`. Column list with real names and the note `Which columns are model inputs is defined by feature_schema.json.` Docs: `Methodology documents are part of the team report and are not linked from this interface.` Buttons: `Classify a house`, `Dataset analytics`. |
| **Footer** | `Classifies whether a King County house's asking price is attractive or too expensive relative to comparable houses.` + `ApiStatus`. |

**Phase 5b (optional): measuring tool.** Port the tool of 2.6 into `MeasureSheet.jsx` on the Home hero only; the hero must read whole without it, and under `prefers-reduced-motion` it shows the full construction, still.

**Exit:** the content audit grep (section 6) is clean; parity rows pass for every page.

### Phase 6: real schema, then real API

1. When M3 delivers `feature_schema.json`: adapt `normalizeSchema` to the agreed shape, turn `source` to `'schema'`, remove the mock notice path. Confirm the `zipcode` list renders as a `<select>`.
2. When M5's backend is up: set `VITE_USE_MOCK=false`, point the proxy at it, confirm schema path, response shapes, batch format, download route, extra-column behavior, size limits. Change only `client.js` normalizers if shapes differ.
3. Decide production routing with M5 (catch-all or `HashRouter`).
4. Re-run the whole section 6 matrix against the real API.

**Exit:** end-to-end single and CSV predictions work with the real model, or the remaining gap is listed as pending M4/M5.

### Phase 7: testing, screenshots, report, slides (section 9)

---

## 5. Contracts (proposals)

### 5.1 `model/feature_schema.json` (M3)

```json
{
  "schema_version": 1,
  "features": [
    { "name": "price",      "type": "number",      "required": true,  "min": 0, "exclusive_min": true, "unit": "USD" },
    { "name": "bedrooms",   "type": "integer",     "required": true,  "min": 0, "max": null },
    { "name": "waterfront", "type": "binary",      "required": true },
    { "name": "view",       "type": "categorical", "required": true,  "values": [0, 1, 2, 3, 4] },
    { "name": "zipcode",    "type": "categorical", "required": true,  "values": ["<every valid ZIP>"] }
  ],
  "target_labels": { "0": "Cheaper than average", "1": "Reasonable price", "2": "Over priced", "3": "Too over priced" }
}
```

Illustrative only; the values come from M3.

### 5.2 API (M5)

- `GET /health` returns `{ "status": "ok" }`.
- `POST /predict`, flat JSON in schema order. 200: `{ "class_id": 2, "class_name": "Over priced", "probabilities": { "0": 0.05, "1": 0.20, "2": 0.60, "3": 0.15 } }` (`probabilities` optional). 400: `{ "error": "Asking price must be greater than 0", "fields": { "price": "must be > 0" } }` (`fields` optional).
- `POST /predict_batch`, `multipart/form-data`, field `file`. 200:
  ```json
  { "summary": { "rows": 120, "predicted": 118, "failed": 2 },
    "rows": [ { "row": 1, "price": 450000, "class_id": 1, "class_name": "Reasonable price", "probabilities": { "0": 0.1, "1": 0.7, "2": 0.15, "3": 0.05 } },
              { "row": 2, "error": "bedrooms must be a number" } ],
    "download_url": "/download/<results file>" }
  ```
  File-level 400: `{ "error": "Missing required columns: price, grade" }`.
- `GET /model_info` (all parts optional): `metrics`, `feature_importances: [{name, importance}]`, `confusion_matrix`, `classes`, scikit-learn version, training rows.

---

## 6. Verification

Run and report real outputs; list what you could not run.

1. `npm install`, `npm run lint`, `npm run build`, `npm test`, `npm run check:theme`: all pass, no new warnings.
2. UI matrix, first in mock mode, then against the real API:

| Case | Expected |
|---|---|
| Valid single prediction | Loading state, then class id + name, echoed price, probabilities when present; focus on result heading |
| Asking price empty / `0` / negative | Blocking field error, focus on the field, no request sent |
| Out-of-range value (`grade 14`, `view 5`) | Field error naming the allowed range |
| Server 400 (`?mock=error400`) | Message verbatim, field-level where `fields` given |
| Network failure / timeout / 500 | Specific message, **Try again** works, controls re-enabled |
| Reset during and after a request | State cleared, request aborted, focus on first field |
| CSV: empty file, non-CSV, too large | Specific blocking message |
| CSV: missing columns | Missing names listed, Classify disabled |
| CSV: valid | Results table + summary; pagination works |
| CSV: 20k+ rows | No freeze; one page of rows in the DOM |
| Download results | File saved via the agreed mechanism; fallback labeled if used |
| Mock mode | "Mock response" badge on result and table |
| 375 / 768 / 1280 / 1920 px | No horizontal page scroll, tables scroll inside their container, no layout shift, tap targets at least 44 px |
| Keyboard only | Everything reachable, visible focus, tabs arrow-key navigable, dropzone operable |
| Screen reader smoke test | Labels announced, errors via `role="alert"`, loading via live region |
| Theme parity + contrast | Every row of 2.4 passes |

3. Network check in devtools: the `/predict` payload has exactly the schema's feature names, numbers as numbers, nothing else.
4. Content audit, must return nothing user-visible (code comments excepted):
   `grep -rniE "estimate|valuation|regression|confidence|XGBoost|Ridge|R²|MAE|RMSE|comps|dossier|appraisal|peer|ratio" src/`

---

## 7. Requests to other members (send in Phase 0)

- **M3:** exact feature list and order; are `id` and `date` inputs; type of `zipcode` (string or number) and of `view`/`condition`/`grade`; real min/max per numeric field; which fields may be missing (imputers exist); optional human descriptions for `view`, `condition`, `grade`; confirm the 5.1 shape; how the file reaches the browser.
- **M5:** confirm 5.2; schema route; batch format (JSON rows + URL or CSV blob) and download route; whether unknown CSV columns are rejected or ignored; max file size and row count; Flask catch-all for `index.html` or accept `HashRouter`; `/model_info` shape; **an early fake-model backend** so integration can start before M4 finishes.
- **M2:** `sample_data/sample_houses.csv` and demo houses with the expected class (JSON `[{ "label", "values" }]` enables an optional **Load example** button; nothing is hardcoded until then); confirm `sqft_living15` / `sqft_lot15` meaning.
- **M1:** EDA figures (PNG or SVG) with titles and captions plus `manifest.json` in `public/eda/`; class distribution if it should be shown.

---

## 8. Assumptions and decisions (state the outcome in the report)

| # | Default applied | Confirm with |
|---|---|---|
| A1 / D-1 | React + Vite calling Flask (dev proxy; prod `dist/` served by Flask) | M5 |
| A2 | Currency is USD, shown as "Asking price (USD)" | M2 / M3 |
| A3 | Location is `zipcode` (+ `lat`, `long`); no city or neighborhood names anywhere (the dataset has no city column) | M2 |
| A4 / D-2 | Labeled mock schema until the real `feature_schema.json` exists | M3 |
| A5 | Which columns are inputs (for example `id`, `date`) is decided by M3's schema; the UI renders only what it lists | M3 |
| A6 | Section 5 shapes are proposals; adapters are the only place to change | M5 |
| A7 / D-7 | Batch download uses the backend mechanism; client-built CSV only as a labeled fallback | M5 |
| A8 | 5 MB CSV limit is a UI guard; the server limit is authoritative | M5 |
| A9 / D-8 | All schema fields required unless the schema says otherwise; fields start blank, `waterfront` off | M3 / M5 |
| D-3 | Result is inline; no separate result route | team |
| D-4 | Model tabs: `Classes / Features / Evaluation` (a Decision Tree has no epochs) | team |
| D-5 | Analytics: honest empty state + M1 figure gallery (alternative: hide the nav link and route) | M1 |
| D-6 | `BrowserRouter` + Flask catch-all (alternative: `HashRouter`) | M5 |
| D-9 | Class styling per 2.3: outlined chips, class 3 filled, no orange | team |
| D-10 | Measuring tool (2.6) on the Home hero only (alternative: static construction only) | team |

---

## 9. Report section and slides (M6 deliverables)

**Report skeleton:**
1. What was built: two tabs, schema-driven form, Predict/Reset, loading and error handling, class + probabilities result, CSV upload, results table, download, mock layer, dev proxy, Hallmark · Studio theme with its conformance results.
2. Mapping table: schema feature, form control, payload key, CSV column.
3. API mapping: endpoints used, request/response examples actually exercised.
4. Assumptions and decisions (section 8) with final outcomes.
5. Test results (section 6), including what could not be run.
6. Screenshots (also for the slides): empty single form; validation errors; loading state; result with probabilities; result without probabilities; server 400 error; CSV tab empty; CSV missing-columns error; CSV results table at desktop and 375 px; download; Model page not connected and connected; mock badge.

**Frontend slides:** interface overview; single-house flow; CSV flow; loading and error states; responsive views; how the UI talks to the API (schema, `/predict`, `/predict_batch`).

---

## 10. Done when

- `step.txt` M6 tasks 1 to 15 are all met (two tabs, schema-driven form with required asking price, Predict and Reset, JSON to `/predict`, loading state, server errors, category + probabilities, CSV upload to `/predict_batch`, results table, Download results, responsive, fake data then real API, screenshots and report section).
- `check:theme`, `lint`, `build`, `test` pass, and every row of the 2.4 parity table passes against Hallmark · Studio.
- The content audit grep is clean.
- The UI works end to end in mock mode; the real-API run is either done and reported or listed as pending M4/M5.
- The section 7 requests were sent.
