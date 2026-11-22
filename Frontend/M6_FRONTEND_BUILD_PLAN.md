# M6 Frontend: Build Plan from Zero

**Theme:** Hallmark · Studio, applied 100% (section 2)
**Role:** M6 (Frontend)
**Project:** Automatic classification of housing price relevance (one Decision Tree, King County dataset)
**Built from:** `step.txt` + `M6_FRONTEND_CHANGES.md`
**Status:** plan only. Nothing here has been run against the real project. The one script included (`check-theme.mjs`, section 2.4) was tested on small sample trees only.

---

## 0. Read this first

1. **The Hallmark · Studio files were not in the material this plan was built from** (only `step.txt` and the M6 audit). So Phase 0 starts with a theme intake (2.1), and **no component CSS is written until `tokens.css` and `design.md` from Hallmark · Studio are in the repo**. This plan never states a color, font, size or spacing value, so nothing in it can drift from the theme.
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
9. Files copied from Hallmark · Studio are copied byte-for-byte, with their original line endings.

---

## 2. Theme contract: Hallmark · Studio (100%)

### 2.1 Intake (first task of Phase 0)

Bring these into the repo before writing any UI code:

| Item from Hallmark · Studio | Goes to | Rule |
|---|---|---|
| Tokens file (colors, type, spacing, radii, shadows, motion) | `src/styles/tokens.css` | Verbatim. The **only** place values are defined. |
| `design.md` (layout, typography, imagery, accessibility standards) | `docs/design.md` | Verbatim. The reference for every visual decision. |
| Fonts (files or loading snippet exactly as the source does it) | as the source | Same families, weights and loading approach. |
| Base / global CSS and component CSS (buttons, fields, toggles, tabs, cards, header, footer) | `src/styles/` | Verbatim. Reuse the classes instead of rewriting them. |
| Imagery + credits, icon style, logo/wordmark | `public/images/`, `src/components/` | Same treatment and pipeline. Keep any required credit visible while the image is used. |

If only the Hallmark · Studio design-system project is available (not loose files), export or attach its files, or run `/design-login` once in an interactive Claude Code session so the project can be synced.

### 2.2 Hard rules

1. **Values come from tokens only.** No literal color, font family, font size, spacing, radius, shadow or duration outside `tokens.css` (and the copied Hallmark files). Write `var(--token)`.
2. **One tokens file, one definition per token.** Do not create a second variables file. (The earlier project had a self-referencing token that silently broke error colors; the check script catches that.)
3. **Reuse Hallmark component styles** for buttons, fields, toggles, tabs, cards, header and footer. New components are composed from tokens and follow the naming convention in `design.md` (page-prefixed BEM, for example `pred-*`; mirror Hallmark if it differs).
4. **Icons:** inline SVG drawn in Hallmark's icon style (stroke, size, corner treatment from `design.md`). No icon library.
5. **Motion:** Hallmark's durations and easings, and a `prefers-reduced-motion` block.
6. **Accessibility:** `design.md` standards apply unchanged. Where this plan asks for more (text contrast 4.5:1, controls 3:1, tap targets 44 px), the stricter rule wins. If a Hallmark token pair fails, report it to the team; do not edit the token.
7. Dark mode or alternate themes only if Hallmark defines them, and then fully.

### 2.3 Class styling (provisional token mapping)

| id | Name | Token (from the earlier audit) | Icon |
|---|---|---|---|
| 0 | Cheaper than average | `--color-success` | down |
| 1 | Reasonable price | `--color-accent` | equal |
| 2 | Over priced | `--color-accent-2` | up |
| 3 | Too over priced | `--color-error` | double-up |

- Confirm each token exists in Hallmark's `tokens.css`; if not, choose the closest semantic token and record it in the report.
- A class is always shown as **icon + id + name**, never by color alone.
- If a class color fails contrast, mix two Hallmark tokens with `color-mix()`; do not add a new color.

### 2.4 Conformance checks (run before every commit)

**Automated:** `npm run check:theme` fails on literal colors, hard-coded `font-family`, undefined `var(--x)` and self-referencing tokens. `--local-*` is reserved for non-theme values (for example a probability bar width). If Hallmark ships extra base CSS containing literals, add those files to `THEME_FILES`; never loosen the regexes.

```js
// scripts/check-theme.mjs  (run: npm run check:theme)
// Fails when the UI drifts from the Hallmark Studio tokens.
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'

const SRC = 'src'
const TOKENS = join(SRC, 'styles', 'tokens.css')
// Files copied verbatim from Hallmark Studio. Add the others here (base/global CSS).
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

// A token that references itself is invalid in CSS (custom-property cycle).
for (const m of tokens.matchAll(/(--[\w-]+)\s*:\s*var\(\s*(--[\w-]+)/g)) {
  if (m[1] === m[2]) problems.push(`${TOKENS}: ${m[1]} references itself`)
}

const colorLiteral = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch)\(/
for (const f of files) {
  if (THEME_FILES.has(f) || f.endsWith('.test.js')) continue
  const text = readFileSync(f, 'utf8')
  text.split('\n').forEach((line, i) => {
    if (colorLiteral.test(line)) problems.push(`${f}:${i + 1}: literal color, use a token`)
    if (f.endsWith('.css') && /font-family\s*:[ \t]*(?!var\()[^\s;}]/.test(line)) {
      problems.push(`${f}:${i + 1}: hard-coded font-family, use a token`)
    }
  })
  for (const m of text.matchAll(/var\(\s*(--[\w-]+)/g)) {
    // --local-* is reserved for non-theme values (e.g. a bar width percentage)
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
```

**Visual parity (manual, at 375 / 768 / 1280 px), side by side with the Hallmark reference.** Record Pass/Fail plus a screenshot per row in the report; any Fail blocks the phase.

| Check | Compare against |
|---|---|
| Type scale and weights (headings, body, small/code text) | `design.md` typography |
| Spacing rhythm, container width, gutters | `design.md` layout |
| Buttons: default, hover, focus-visible, active, disabled | Hallmark button styles |
| Fields: default, focus, error, disabled; toggle on/off | Hallmark field styles |
| Tabs: selected, focus, keyboard | Hallmark tab pattern |
| Cards/panels: border, radius, shadow | Hallmark panel styles |
| Header, footer, mobile menu | Hallmark shell |
| Imagery treatment and credits | Hallmark imagery pipeline |
| Motion and reduced motion | Hallmark motion tokens |
| Contrast: text 4.5:1, controls 3:1 (including the 4 class colors) | measured in devtools |

---

## 3. Stack, structure, configuration

```
house-pred/
  .env.example
  docs/design.md                   # Hallmark · Studio, verbatim
  scripts/check-theme.mjs
  public/eda/manifest.json         # supplied by M1 (optional)
  src/
    main.jsx  App.jsx              # routes: /  /prediction  /model  /analytics  /about
    styles/
      tokens.css                   # Hallmark · Studio, verbatim, only source of values
      ...                          # other Hallmark CSS, verbatim
    config/
      featureSchema.js             # loadSchema, MOCK_SCHEMA, useSchema()
      fieldMeta.js                 # labels/help/groups keyed by column name (no dataset values)
      classes.js
    api/
      client.js  mock.js
    lib/                           # pure: no React, no import.meta.env, tested with node --test
      schema.js  payload.js  validation.js  csv.js   (+ *.test.js each)
    components/
      Header  Footer  Tabs  SchemaField  ErrorBanner  ClassBadge  ProbabilityList  ApiStatus   (+ CSS)
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
2. Theme intake (2.1), then add `scripts/check-theme.mjs` and the `package.json` scripts. Import `tokens.css` and the Hallmark base CSS in `main.jsx`.
3. Add `vite.config.js`, `.env.example`. Set `index.html` title to `HousePrice AI: Is the asking price fair?` and description to `Classify whether a King County house's asking price is cheaper than average, reasonable, over priced or too over priced relative to comparable houses.`
4. Build `Header` (logo, Home / Analytics / Model / About, **Predict** CTA to `/prediction`, mobile menu that also closes on `Escape`) and `Footer` (5 nav links, `ApiStatus` slot, image credit if a photo is used) from Hallmark's shell pattern.
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

**`config/fieldMeta.js`:** labels, help, grouping and order keyed by column name. Unknown columns fall back to the raw name in an "Other" group. The column name is always shown next to the label in the code style from `design.md`.

| Column | Label | Group | Help |
|---|---|---|---|
| `price` | Asking price (USD) | Price | Listing price in US dollars. Required, greater than 0. |
| `zipcode` | ZIP code | Location | |
| `lat`, `long` | Latitude, Longitude | Location | decimal degrees |
| `bedrooms`, `bathrooms`, `floors` | Bedrooms, Bathrooms, Floors | Size and layout | fractional values allowed for bathrooms and floors |
| `sqft_living`, `sqft_lot`, `sqft_above`, `sqft_basement` | Living area, Lot size, Area above ground, Basement area | Size and layout | sq ft; `sqft_basement` 0 means no basement |
| `sqft_living15`, `sqft_lot15` | raw column name until the team confirms the meaning | Size and layout | the brief does not define them |
| `waterfront` | Waterfront | Quality and history | toggle, sends 0 or 1 |
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

- `Tabs`: accessible tablist (arrow keys, Home, End, roving `tabIndex`).
- `SchemaField`: one renderer for number / select / toggle / price (details in Phase 3).
- `ErrorBanner`: `role="alert"`, icon + text, optional list of links to invalid fields, optional "Details" disclosure for raw server text, optional action button; uses the error token.
- `ClassBadge`: icon + `Class <id>` + name; large and compact sizes.
- `ProbabilityList`: one row per class (label, percentage text, `role="meter"` or `<progress>`), sorted by class id, **renders nothing when there are no probabilities**.
- `ApiStatus` (Footer): mock mode shows `Mock data (no backend)`; otherwise calls `getHealth()` once and shows `API connected` / `API unreachable` as icon + text in an `aria-live="polite"` region. Never says "connected" without a successful `/health`.

**Exit:** each component passes its 2.4 parity rows (states, focus, contrast).

### Phase 3: Single house tab

`PredictionForm` is the shell: Hallmark workbench layout, eyebrow `King County · Decision Tree classifier`, title `Classify an asking price`, subtitle `Check whether a house's asking price is attractive or too expensive relative to comparable houses.`, and `Tabs` for **Single house** / **Upload CSV**, mirrored in `?mode=single|csv` (default `single`).

`SingleHouse`:
1. `useSchema()`: while loading show skeleton panels with `aria-busy="true"`. On failure show an `ErrorBanner` ("The form could not be built because feature_schema could not be loaded") with a Retry button. Never fall back to the mock silently.
2. Panels in this order: **Price**, **Location**, **Size and layout**, **Quality and history** (empty groups omitted, "Other" last). Controls via `SchemaField`:
   - `price`: `type="text" inputMode="numeric"`, `$` prefix, thousands separators on blur, digits parsed on submit, sent as a number, visible `*` + `aria-required`.
   - number / integer: `type="number"`, `step` and `min`/`max` from the schema only, wheel changes disabled (`onWheel={e => e.currentTarget.blur()}`).
   - binary: `role="switch"` button using the Hallmark toggle, `aria-labelledby`, sends 0/1, default off.
   - categorical: `<select>` with a first `Select…` option, numeric option labels only.
   - Every control: real `<label htmlFor>`, `name` equal to the column name, help via `aria-describedby`, errors via `aria-describedby` + `aria-invalid="true"`.
3. State holds raw strings (no `Number('')`). No invented defaults: fields start empty, binary off.
4. **Predict** (`type="submit"`, Hallmark primary button): run `validateSingle`. On errors, show the `ErrorBanner` summary with links, mark fields, move focus to the first invalid field; warnings render as non-blocking notes. If valid, `buildPayload` then `predictSingle`. While waiting: `<fieldset disabled>`, Predict shows a spinner and `Predicting…` with `aria-busy="true"`, Reset disabled, result panel shows a skeleton inside an `aria-live="polite"` region, no double submit. Server 400: message verbatim, plus `fieldErrors` on matching fields. Network / timeout / 5xx: normalized message and a **Try again** button that resubmits the same payload.
5. **Reset** (`type="button"`, Hallmark secondary button): clears values, errors, warnings and result; aborts any in-flight request; focus returns to the first field.
6. **Result panel:** idle text `Fill in the form and press Predict.` On success: a heading that receives focus (`tabIndex={-1}`) containing the large `ClassBadge`; the **echoed asking price** formatted `$450,000 USD` from the submitted payload; `ProbabilityList` when probabilities exist; the note `The category compares the asking price with comparable houses, as defined by the project's target.`; and a `Mock response, not a model output` badge when `mock: true`. Reserve min-height so the layout does not shift between states.

**Exit:** the single-house rows of the section 6 matrix pass in mock mode; parity rows pass.

### Phase 4: Upload CSV tab

1. Dropzone: a `<label>` styled as a button wrapping a visually hidden (not `display:none`) `<input type="file" accept=".csv,text/csv">`; drag and drop with a visible drag-over state and instructions; keyboard operable.
2. On selection, run client checks via `lib/csv.js` and show each failure as a specific `ErrorBanner` message while **Classify file** stays disabled: not a `.csv`; empty file (0 bytes or no data rows); larger than `VITE_MAX_CSV_MB`; duplicate or blank headers; **required columns missing** (listed by name, compared with `schema.features`). Unknown extra columns are a non-blocking warning (the server decides).
3. File chip: name, size, detected rows, columns matched `x/y`, **Clear file** button.
4. **Download CSV template:** header-only CSV from `buildTemplate(schema)`, named `house_template.csv`. No example row (values would be invented).
5. **Classify file:** `predictBatch(file)` with the same loading pattern as single (disabled controls, `aria-busy`, indeterminate progress bar, `aria-live`). File-level server errors render verbatim.
6. **Results:** summary tiles (rows submitted, classified, failed, and a count per class **computed from the returned rows**); table in a scroll region (`role="region"`, `aria-label="Batch results"`, `tabIndex=0`, sticky header) with columns `#`, asking price (when echoed), predicted category (compact `ClassBadge`), top probability (only when supplied), status/error text. Row errors show icon + text. Client pagination 25/50/100 with Previous/Next and "Showing a-b of n". Mock badge when `mock: true`.
7. **Download results:** use the backend mechanism. If the response has `download_url`, trigger it (anchor with `download`, or fetch to blob to object URL, revoked afterwards). If M5 returns a CSV blob, save that. Only if neither exists, fall back to `buildResultsCsv(rows)` and label this in the report. The button is disabled, with a visible reason, until results exist.
8. Large files: one `file.text()` pass for header and row count only; never build objects for all rows; render at most one page of rows.

**Exit:** the CSV rows of the section 6 matrix pass in mock mode (including a 20k+ row file without freezing).

### Phase 5: static pages (real content only)

| Page | Content |
|---|---|
| **Home** | h1 `Is the asking price fair for comparable houses?`; description `Classify a King County house's asking price as cheaper than average, reasonable, over priced or too over priced.`; buttons `Classify a house` (to `/prediction`) and `Upload a CSV` (to `/prediction?mode=csv`). A static "Four categories" card listing `DEFAULT_CLASSES` (icon + id + name, no numbers, no thresholds). Metrics: `4` price categories, `1` Decision Tree model, `2` ways to use it, and `<schema feature count>` input features (show `-` with "from feature_schema.json (mock schema active)" while mock). Caption: `House sales dataset for King County (Kaggle). The team documents the target definition and thresholds.` Tour with 3 items: Single house, Upload CSV, Model details (decorative images use `alt=""`). CTA: `Ready to classify a house?` / `Enter one house or upload a CSV and get its price category.` / button `Open the form`. |
| **Model** | State `loading \| notConnected \| ready` from `getModelInfo()`. Not connected (absent, 404 or mock): one card `Model metrics are not connected yet.` Hero specs only what is true or supplied: `Algorithm: Decision Tree classifier (single model)`, `Task: supervised classification, 4 classes`, `Input features: <schema count>`; add scikit-learn version / training rows only if `/model_info` supplies them. Metrics grid shows only metrics present in `/model_info` with their exact keys. Tabs: `Classes` (legend from `classes.js`), `Features` (importances only from `/model_info.feature_importances`), `Evaluation` (confusion matrix only if supplied); empty states otherwise. Hero description: `Values on this page come from the backend's /model_info when it is connected.` |
| **Analytics** | Title `Dataset analytics`. Description `No data is connected to this page yet. Figures from the team's exploratory analysis can be listed here.` Figure gallery rendered from `public/eda/manifest.json` (`[{ "file", "title", "caption" }]`) if present, otherwise the empty state. No number is typed by hand. Keep the `Open the form` CTA. |
| **About** | Inputs: `The form is generated from feature_schema.json. The asking price is a required input.` Results: `The page shows the predicted price category and, when the server supplies them, class probabilities. Predictions come from a trained Decision Tree served by the Flask API. In mock mode the responses are fake and labeled as such.` Data: `House sales dataset for King County (Kaggle). The interface is not connected to an external database.` Stats: `Columns in dataset: 21`, `Rows: 21,000+ (project brief)`, `Source: Kaggle`, `Train/test split: 80/20, stratified, random_state=42 (project plan; confirm with M3)`. Column list with real names and the note `Which columns are model inputs is defined by feature_schema.json.` Docs: `Methodology documents are part of the team report and are not linked from this interface.` Buttons: `Classify a house`, `Dataset analytics`. |
| **Footer** | `Classifies whether a King County house's asking price is attractive or too expensive relative to comparable houses.` + `ApiStatus`. |

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
