# M6 Frontend: Complete Change Specification

**Audience:** a coding agent that will modify the React project `house-pred/` (branch `frontend`).
**Owner:** M6 (Frontend) only.
**Inputs reviewed:** `step.txt` (project brief), the whole `house-pred.zip` source (every `.jsx`, the CSS tokens, `design.md`, `README.md`, `vite.config.js`, `index.html`), and the dataset column list supplied by the user.
**Status of this document:** static audit only. Nothing in this document has been executed. `npm run lint`, `npm run build` and every test listed below are still to be run by you (the zip ships `node_modules` with Windows-only binaries, so they could not be run in the audit environment).

---

## 0. Rules for the agent (read first, non-negotiable)

1. Work conservatively: read the file, change the minimum, keep naming and CSS conventions (`pred-*`, `dossier-*`, BEM-style, tokens from `src/styles/tokens.css`).
2. Do not touch Flask, the model, notebooks, data or other members' deliverables. If M6 needs something from them, add it to section 8 (interface requests) instead of working around it.
3. Valid dataset columns, exactly (the only valid field names):
   `id, date, price, bedrooms, bathrooms, sqft_living, sqft_lot, floors, waterfront, view, condition, grade, sqft_above, sqft_basement, yr_built, yr_renovated, zipcode, lat, long, sqft_living15, sqft_lot15`
4. Never invent: attributes, categories, neighborhood or city names, prices, metrics, confidence numbers, ZIP price tables, example "comparable sales".
5. No regression output anywhere: no price estimate, no confidence interval, no "valuation drivers", no comps, no R²/MAE/RMSE.
6. `price` (asking price) is a **required model input**. Peer-group median and ratio are never inputs and never appear in the UI, payloads, tables or copy.
7. Classes (from `step.txt`): `0 Cheaper than average`, `1 Reasonable price`, `2 Over priced`, `3 Too over priced`.
8. Do not claim anything is tested or connected unless you ran it. Report what you could not run.
9. Preserve each file's existing line endings (`Model.jsx` and `design.md` use CRLF; most others use LF).
10. Do not delete routes or assets silently. Every removal is listed in section 6 and must be mentioned in the final report.
11. Do not add dependencies. (Tests use Node's built-in runner, see section 7.)

---

## 1. Assumptions (state them in the final report)

| # | Assumption | Needs confirmation from |
|---|---|---|
| A1 | Keep React. It calls the Flask API (dev: Vite proxy; prod: `dist/` served by Flask, or deployed separately). `step.txt` describes `webapp/templates/index.html` + `static/`, which conflicts with the real project. | M5 |
| A2 | Currency is **USD** (King County dataset). Shown as "Asking price (USD)". | M2 / M3 |
| A3 | Location is `zipcode` (+ `lat`, `long`). `step.txt` says "city/zone", but the dataset has no city column. No city or neighborhood names are shown anywhere. | M2 |
| A4 | The real `model/feature_schema.json` is not available yet. Until it is, a clearly labeled **mock schema derived only from the dataset column list** is used. | M3 |
| A5 | Which columns are real model inputs (e.g. `id`, `date`) is decided by M3's schema. M6 renders only what the schema lists. | M3 |
| A6 | Request/response shapes in section 8 are *proposals*. The adapter (`src/api/client.js`) is the single place to change when M5's real contract arrives. | M5 |
| A7 | Batch download: either the backend returns a CSV/blob or a download URL. Until confirmed, the client builds a CSV from returned rows as a fallback. | M5 |
| A8 | CSV size limit is a UI guard only (default 5 MB, env-configurable). The server limit is authoritative. | M5 |
| A9 | All schema fields are required unless the schema marks `required: false`. `step.txt` says M3 uses imputers, so M5 may accept missing values; the UI defaults to the stricter behavior. | M3 / M5 |

---

## 2. Audit results

### 2.1 Requirement traceability (M6 tasks in `step.txt`)

| # | `step.txt` M6 requirement | Status | Evidence |
|---|---|---|---|
| 1 | Main page | Partial | React Router `src/App.jsx`; no `webapp/templates/index.html` (conflict A1) |
| 2 | style.css / script.js | Partial | React + CSS files per page; acceptable under A1 |
| 3 | Two sections/tabs: Single house + Upload CSV | **Missing** | `/prediction` has only a single-house form; no CSV UI anywhere |
| 4a | Required asking-price field with currency/unit | **Missing** | No `price` input in `PredictionForm.jsx`; price is only *output* (lines 224, 620) |
| 4b | Number inputs for numeric features | Partial | Sliders (`sqft`, `lotSqft`, lines 318-358) and chip buttons; only `yrBuilt` is a number input (line 522) |
| 4c | Dropdowns for categorical features | Partial | `grade`, `view`, `zip` selects exist but with invented option lists (lines 66-94) |
| 4d | Form generated from `feature_schema.json` | **Missing** | Everything hardcoded (lines 6-94, 166-179); no schema loading |
| 4e | min/max where available | Partial | Hardcoded `min`/`max` literals (lines 322-323, 351-352, 526-527) |
| 5 | Predict and Reset buttons | **Non-compliant** | Submit is "Generate appraisal dossier" (line 583); **no Reset button exists** |
| 6 | JSON to `POST /predict` | **Missing** | No `fetch` anywhere in `src/`; valuation is computed locally by `calculateValuation` (lines 96-162) |
| 7 | Loading state | **Missing** | No async code |
| 8 | Show server errors | **Missing** | No error UI; form has `noValidate` and no validation |
| 9 | Predicted category + probabilities | **Non-compliant** | Outputs a regression estimate, interval and drivers (`PredictionResult.jsx`) |
| 10 | CSV upload via FormData to `/predict_batch` | **Missing** | No file input anywhere |
| 11 | Batch results table | **Missing** | Only a fake "comps" table (`PredictionResult.jsx` 403-438) |
| 12 | Download results button | **Missing** | Only "Export dossier" = `window.print()` (line 134) and a disabled "Download whitepaper" (`Model.jsx` 218) |
| 13 | Responsive | Partial | Breakpoints exist (`PredictionForm.css` 884-920, `base.css` 26-31); needs verification at 375px |
| 14 | Test with fake data first, then real API | **Missing** | No mock API layer, no env toggle |
| 15 | Screenshots + report section | Missing | Out of this document; skeleton in section 10 |

### 2.2 Every UI claim vs. dataset / backend source

| Location | UI content | Verdict | Why |
|---|---|---|---|
| `PredictionForm` 66-77 | `ZIP_PROFILES`: 10 ZIPs with neighborhood names, `basePpsf`, tiers ("Metro Prime", "Island Luxury") | **Invalid** | Invented names, price tables and tiers; ZIP list must come from schema |
| `PredictionForm` 79-86 | `GRADE_LEVELS` 6-11 with descriptions ("Quality architectural woodwork…") | **Invalid** | Range is 1-13 per the brief; descriptions are invented |
| `PredictionForm` 88-94 | `VIEW_OPTIONS` labels "Territorial greenbelt", "Partial water or valley"… | **Invalid** | Invented descriptions; only numeric 0-4 is valid |
| `PredictionForm` 445-451 | Condition labels "Adequate", "Mint" | **Invalid** | Invented descriptions; only numeric 1-5 is valid |
| `PredictionForm` 534-549 | `isRenovated` toggle "Full mechanical overhaul post-2015" | **Invalid** | Dataset has `yr_renovated` (year, 0 = never); "post-2015" is invented |
| `PredictionForm` 166-179 | Fields `zip, sqft, lotSqft, yrBuilt, isRenovated` | **Invalid names** | Must be `zipcode, sqft_living, sqft_lot, yr_built, yr_renovated` |
| (missing) | `sqft_above, sqft_basement, lat, long, sqft_living15, sqft_lot15`, asking `price` | **Missing fields** | Present in dataset; inclusion decided by schema |
| `PredictionForm` 6-35, 37-64 | Archetype presets (Single Family / Townhouse / Condo / Waterfront) with fixed values | **Invalid** | Property type is not a dataset column; preset numbers are invented. Demo examples must come from M2 |
| `PredictionForm` 213 | "Calibrated on 21,613 records" | **Unverifiable** | `step.txt` says "+21,000 rows"; exact count belongs to M1/`/model_info` |
| `PredictionForm` 96-162, 224, 599-684 | `calculateValuation`, "Hedonic V3", "Confidence band 96.4%", "Valuation driver attribution" | **Invalid / Non-compliant** | Regression + fabricated numbers |
| `PredictionResult` 51-115, 354-439 | Fake comps (street addresses, "Phinney Ridge", distances, sold days) | **Invalid** | All invented |
| `PredictionResult` 184-185, 208 | "Confidence score", "95% confidence interval", "Appraisal date: October 2026" | **Invalid** | Invented |
| `PredictionResult` 447 | "across all 70 ZIP codes or inspect regression model diagnostics" | **Unverifiable / Non-compliant** | Number unverified; "regression" is wrong |
| `Home` 7-52 | Tour: "18 property parameters", "$640,000 reference value", "Ridge regression weights", "21,613 King County property records" | **Invalid / Non-compliant** | Regression, invented values |
| `Home` 59-72, 105-167 | Console with micro-estimate and "$/sq ft against King County records" | **Non-compliant** | Calls `calculateValuation` (regression) |
| `Home` 124-128 | ZIP options "Seattle: Wallingford", "Kirkland: East Lake"… | **Invalid** | Invented neighborhood names |
| `Home` 198-211 | KPIs "21,613", "70 ZIPs", "18 predictive features", "2014 to 2015" | **Unverifiable / Invalid** | Dataset has 21 columns; feature count must come from schema; dates not provided |
| `Home` 313-334 | "Seattle 98101 to 98199", "Bellevue 98004 to 98008", etc. | **Invalid** | City ↔ ZIP mapping not in dataset (conflict 3) |
| `Home` 172 | `<Link state={{form: …}}>` to `/prediction` | **Bug** | `PredictionForm` never reads `location.state`, so this does nothing |
| `Model` 7-12 | "XGBoost Ensemble", "1.2M Weighted Neurons", "< 45ms latency", "21.6K properties" | **Invalid** | Project model is one Decision Tree |
| `Model` 14-19 | R² 0.941, MAE $9,452, RMSE $12,840, median error 3.2% | **Invalid / Non-compliant** | Regression metrics, unverified |
| `Model` 21-29 | Static feature importances (`sqft_living 0.85`…) | **Invalid** | Static, not from model |
| `Model` 147-149 | "Generalization 99.2%", "Bias score 0.002" | **Invalid** | Invented |
| `Model` 172-204 | Training vs. validation loss over epochs | **Invalid** | Decision Trees have no epochs |
| `Analytics` 40-41, 88-95, 112-116, 152-164 | Monthly price curve, bracket histogram, scatter points, correlation values | **Invalid** | Hand-typed numbers, not from the data |
| `Analytics` 233-238 | KPIs "Median sale price $735,000", "Inventory 2,412 units", "Days on market 18", "AI confidence index 94.2%" | **Invalid** | Not dataset columns; invented |
| `About` 36, 45, 85-97 | "Features stated in project 20", "20% random" validation split, "King County Govt" source | **Unverifiable** | Feature count from schema; split per M3 plan (`test_size=0.2, stratify=y, random_state=42`) |
| `About` 108-112 | "Condition and grade: Property quality", "Year renovated" | **Partial** | Should use real column names |
| `Footer` 106, 123 | "calibrated property valuation demo", "no live valuation service" | **Non-compliant** | Regression wording; status will be dynamic |
| `index.html` 8-9 | Title "Predict the Value of Your Home", description "property valuation demo" | **Non-compliant** | Regression wording |
| `README.md`, `design.md` | "valuation workbench", "confidence dossier", "regression metrics" | **Non-compliant** | Must be rewritten for classification |

### 2.3 Prioritized discrepancy list

- **P0** (project does not meet the brief): no asking-price field; no Reset; no API calls, no loading/error states; no CSV upload / results table / download; the entire valuation output is regression; the form is not schema-driven; field names differ from the dataset.
- **P1** (factually wrong content): all fabricated numbers/names in Home, Model, Analytics, About, Footer, `index.html`; the broken `state` hand-off; the CSS variable cycle (section 4.1, item G1).
- **P2** (quality / accessibility): hidden inputs that labels point at; radiogroups without roving focus; sliders without numeric entry; `noValidate` with no validation; layout fixed to a made-up preset image set; no focus management.
- **P3** (cleanup): dead CSS/assets after removals; README/design.md rewrite; Vite proxy and env documentation.

---

## 3. Target architecture

```
src/
  config/
    featureSchema.js     # loads + normalizes schema; mock schema; exposes helpers
    fieldMeta.js         # UI-only labels/help/grouping keyed by dataset column name (no values)
    classes.js           # class id -> name/token/icon (names default from step.txt, overridden by schema)
  api/
    client.js            # BASE_URL, endpoint paths, fetch wrappers, timeout, error normalization
    mock.js              # fake responses (only used when VITE_USE_MOCK=true)
  lib/
    validation.js        # pure functions: validateSingle(values, schema), softWarnings(values, schema)
    csv.js               # pure functions: parseHeader, countRows, buildTemplate, buildResultsCsv
    payload.js           # pure function: buildPayload(values, schema) (exact names/order, numbers cast)
  components/
    SchemaField.jsx      # one field renderer (number / select / toggle / price)
    ErrorBanner.jsx      # role="alert" error summary, focusable
    ClassBadge.jsx       # class id + name, color + icon + text (not color only)
    ProbabilityList.jsx  # hides itself if no probabilities
    ApiStatus.jsx        # /health indicator (Footer) or "Mock data"
    Tabs.jsx             # accessible tabs (reuse pattern from Model.jsx)
  pages/
    PredictionForm.jsx   # rewritten: two tabs (Single house / Upload CSV)
    SingleHouse.jsx      # form + result panel
    BatchUpload.jsx      # file picker/drag-drop + results table + download
    ...existing pages edited per section 5
.env.example
```

Everything that depends on dataset values (names, ranges, options, class labels) flows from `featureSchema.js`. No other module hardcodes field names.

---
## 4. Global and infrastructure changes

### 4.1 Bugs and global fixes

| ID | File | Change |
|---|---|---|
| G1 | `src/styles/variables.css` lines 20, 22, 23 | `--color-success: var(--color-success)` and `--color-error: var(--color-error)` are **self-referencing** (a CSS custom-property cycle makes them invalid), and `--color-red` inherits the broken value. Result: `input[aria-invalid="true"]` (`global.css` 147) and every future error style would have no color. **Delete these three lines**; `tokens.css` already defines `--color-success` and `--color-error`. Verify in devtools that `getComputedStyle(document.documentElement).getPropertyValue('--color-error')` returns an `oklch(...)` value. |
| G2 | `index.html` | Title -> `HousePrice AI: Is the asking price fair?` ; meta description -> `Classify whether a King County house's asking price is cheaper than average, reasonable, over priced or too over priced relative to comparable houses.` |
| G3 | `src/styles/responsive.css` | Both media queries set the same `padding-inline` as `.container` already does (no-op). Leave as is; do not "fix". Gutters are handled in `base.css` 26-31. |
| G4 | `src/App.jsx` | Keep all routes. `/prediction/result` becomes `<Route path="/prediction/result" element={<Navigate to="/prediction" replace />} />` (decision D-3, section 9). Remove the `PredictionResult` import. |
| G5 | `src/pages/PredictionForm.jsx` | Remove the exported `calculateValuation` (and its imports in `Home.jsx` and `PredictionResult.jsx`). No component may import a price-estimating function. |

### 4.2 Dev proxy, environment and serving

**`vite.config.js`** — add a dev proxy. **Use anchored regex keys.** The client route `/prediction` starts with the API path `/predict`; a plain `'/predict'` key is a prefix match and would send the page route to Flask.

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
        // add the download route here once M5 confirms its path (section 8)
      },
    },
  }
})
```

**`.env.example`** (new; `*.local` is already git-ignored, so developers copy it to `.env.local`):

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

**Production serving (A1):** if Flask serves `dist/`, `BrowserRouter` deep links such as `/prediction` need a Flask catch-all returning `index.html` for non-API paths. This is an interface request to M5 (section 8). If M5 refuses, switch `BrowserRouter` to `HashRouter` in `App.jsx` as a fallback and say so in the report. Do not decide silently.

### 4.3 `src/config/featureSchema.js` (single source of truth)

Responsibilities:
- `loadSchema()`: if `VITE_USE_MOCK === 'true'` return `MOCK_SCHEMA`; otherwise fetch the real schema (path decided by M5, section 8; until then `getSchema()` in `client.js`). Cache the promise; expose loading/error state through a small `useSchema()` hook.
- `normalizeSchema(raw)`: pure function. Validates the proposed shape (section 8.1) and throws a readable error (`"feature_schema.json: feature #3 has no name"`) rather than guessing. This is the only place that knows the schema JSON layout.
- Exposes: `features` (ordered, exact names), `classLabels`, `source` (`'mock'` | `'schema'`), helpers `getFeature(name)`, `isRequired(feature)`.

**Mock schema rules** (derive only from the dataset column list; never present as real):
- Features = the dataset columns except `id` and `date` (assumption A5: M3 decides; a one-line constant `MOCK_EXCLUDED = ['id', 'date']` makes it easy to change). `price` is first and `required`.
- Types: `price` number (`exclusiveMin: 0`, `unit: 'USD'`); `bedrooms`, `floors`... see below; `waterfront` binary; `view` categorical values `0-4`; `condition` `1-5`; `grade` `1-13` (these three ranges are given by the project brief for the dataset); `zipcode` categorical **with `values: null`** (unknown until M3 supplies it); `lat`/`long` number; every other numeric column number with `min: 0` (physical quantities cannot be negative) except `yr_built`/`yr_renovated` which are integers with no max; `bathrooms` and `floors` use `step: 'any'` (fractional values allowed).
- No other min/max, no category lists, no defaults.
- Every mock field carries `rangeSource: 'mock'`. When `source === 'mock'` the form shows a persistent notice: *"Mock schema derived from the dataset column list. Ranges and options are placeholders to be replaced by M3's feature_schema.json."*
- Because the real ZIP list does not exist yet, **in mock mode only** `zipcode` renders as a 5-digit numeric text input (labelled "ZIP code (temporary free input)"); as soon as `values` is a non-empty array it renders as a `<select>`. Do not hardcode ZIP lists.

### 4.4 `src/config/fieldMeta.js` (UI metadata, no dataset values)

Keyed by dataset column name. Only labels, short help, unit text, grouping and display order. Unknown columns fall back to the raw name and an "Other" group.

| Column | Label | Group | Help / unit text |
|---|---|---|---|
| `price` | Asking price (USD) | Price | "Listing price in US dollars. Required, greater than 0." |
| `zipcode` | ZIP code | Location | - |
| `lat`, `long` | Latitude, Longitude | Location | decimal degrees |
| `bedrooms`, `bathrooms`, `floors` | Bedrooms, Bathrooms, Floors | Size and layout | fractional values allowed for bathrooms/floors |
| `sqft_living`, `sqft_lot`, `sqft_above`, `sqft_basement` | Living area, Lot size, Area above ground, Basement area | Size and layout | "sq ft"; `sqft_basement`: 0 means no basement |
| `sqft_living15`, `sqft_lot15` | Living area (nearest 15 homes), Lot size (nearest 15 homes) | Size and layout | **only if the team confirms this meaning**; otherwise show the raw column name. The brief does not define it. |
| `waterfront` | Waterfront | Quality and history | toggle, sends 0/1 |
| `view`, `condition`, `grade` | View rating, Condition rating, Construction grade | Quality and history | **numeric labels only** (e.g. "3"), no descriptions unless the schema provides them |
| `yr_built` | Year built | Quality and history | year |
| `yr_renovated` | Year renovated | Quality and history | "0 means never renovated" |

Always show the dataset column name next to the label in a small `num` code style (`sqft_living`) so the form is traceable to the schema and the report.

### 4.5 `src/config/classes.js`

```js
export const DEFAULT_CLASSES = [
  { id: 0, name: 'Cheaper than average', token: '--color-success',  icon: 'down' },
  { id: 1, name: 'Reasonable price',      token: '--color-accent',   icon: 'equal' },
  { id: 2, name: 'Over priced',           token: '--color-accent-2', icon: 'up' },
  { id: 3, name: 'Too over priced',       token: '--color-error',    icon: 'double-up' },
]
```
Names default from `step.txt`; if the schema provides `target_labels`, those override the names. Each class is always shown as **icon + id + name** (never color alone). Verify each token reaches 4.5:1 contrast for text on `--color-paper-2` and 3:1 for graphical use; adjust with `color-mix` toward `--color-ink` if not. Do **not** display class thresholds (the brief calls them examples to be validated by M2).

### 4.6 `src/api/client.js`

- `const BASE = import.meta.env.VITE_API_BASE_URL ?? ''`; `const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'`.
- `ENDPOINTS = { predict: '/predict', predictBatch: '/predict_batch', health: '/health', modelInfo: '/model_info', schema: <TBD by M5> }` (one object, nothing hardcoded elsewhere).
- Functions: `getSchema()`, `predictSingle(payload)`, `predictBatch(file)`, `downloadResults(response)`, `getHealth()`, `getModelInfo()`. Each delegates to `mock.js` when `USE_MOCK`.
- Single request: `POST` JSON with `Content-Type: application/json`, `AbortController` timeout (`VITE_REQUEST_TIMEOUT_MS`). Batch: `FormData` with the field name agreed with M5 (proposal: `file`); **do not set the `Content-Type` header** (the browser adds the boundary). Batch timeout `VITE_BATCH_TIMEOUT_MS`.
- Error normalization into one `ApiError { kind, status, message, fieldErrors, raw }` where `kind` is `'validation' | 'server' | 'network' | 'timeout' | 'parse' | 'proxy'`:
  - HTTP 400 with JSON: `message` = the server's text **verbatim** (try `error`, then `message`, then `errors`); `fieldErrors` from `fields`/`errors` when it is an object keyed by feature name.
  - HTTP 5xx or non-JSON body: `"The server returned an error (HTTP <status>)."` plus the raw text under a "Details" disclosure.
  - `TypeError` from `fetch`: `"Cannot reach the prediction server. Check that the backend is running."`
  - `AbortError`: `"The request timed out."`
  - A 200 response with `content-type: text/html` on an API path (Vite dev without proxy returns `index.html`): `kind: 'proxy'`, message `"API route is not proxied. Check vite.config.js and VITE_DEV_PROXY_TARGET."`
- Response normalizers (single point of change if M5's shape differs): `normalizePrediction(raw)` -> `{ classId, className, probabilities: [{classId, label, value}] | null }`; accepts probabilities as an object keyed by class id, an object keyed by name, or an array index-aligned to class ids. Never compute or invent probabilities.

### 4.7 `src/api/mock.js`

- Used only when `VITE_USE_MOCK=true`. Returns `MOCK_SCHEMA`, a fake `/predict` response after a 600-900 ms delay, a fake batch response, fake `/health`, and **no** `/model_info` metrics (so Model/Analytics show their "not connected" state).
- The mock class must be clearly arbitrary (e.g. derived from a hash of the payload) and every mock result carries `mock: true`. The UI then shows a visible **"Mock response, not a model output"** badge on the result panel and batch table. Mock probabilities, if produced, must sum to 1 and are shown with the same badge.
- Include failure toggles for manual testing via query string: `?mock=error400`, `?mock=error500`, `?mock=network`, `?mock=slow`, `?mock=batcherror` (read in `mock.js` only).

### 4.8 `src/lib/*` (pure functions, unit-tested, see section 7)

- `payload.js`: `buildPayload(values, schema)` returns a plain object with keys **in schema order**, exact schema names, numbers cast with `Number()`, `binary` -> `0/1`, categorical numeric values cast to numbers when the schema's `values` are numbers. Never include `id`, `date` or helper columns unless the schema lists them.
- `validation.js`: `validateSingle(values, schema)` -> `{ errors: {name: msg}, warnings: [msg] }`. Rules: required fields non-empty; numeric parse; `price > 0`; `min`/`max` (inclusive unless `exclusiveMin`); integers must be integers; categorical value in `values` when provided. Soft warning (never blocks): `sqft_living` differs from `sqft_above + sqft_basement`, **only when all three are schema features**. Error messages name the field label and the allowed range.
- `csv.js`: `readCsvMeta(text)` -> `{ headers, rowCount, errors }` (strip BOM, handle quoted fields and embedded newlines, trim header names, detect duplicate headers, ignore trailing blank lines); `buildTemplate(schema)` -> header-only CSV string from schema names/order; `buildResultsCsv(rows)` -> CSV with proper quoting.

---

## 5. Page-by-page changes

### 5.0 Button and control inventory (every interactive element)

| Where | Control | Current behavior | Required change |
|---|---|---|---|
| Header | Logo link, Home/Analytics/Model/About links | Navigate | Keep. |
| Header | "Predict" CTA | -> `/prediction` | Keep label and route. |
| Header | Mobile menu toggle | Toggles nav | Keep. Optional P3: close on `Escape`. |
| Footer | 5 nav links; Wikimedia credit link | Navigate / external | Keep (credit stays while the photo is used). |
| Footer | Note "Static demonstration interface…" | Text | Replace with `<ApiStatus />` (section 5.2). |
| Home hero | "Start a valuation" | -> `/prediction` | Rename "Classify a house". |
| Home hero | "Explore market charts" | -> `/analytics` | Replace with "Upload a CSV" -> `/prediction?mode=csv`. |
| Home console | ZIP `<select>` (invented names), sqft slider | Drives fake estimate | **Remove** with the console (section 5.3). |
| Home console | "Configure full appraisal dossier" | Link with `state.form` that `PredictionForm` never reads | **Remove.** |
| Home tour | 4 tab buttons + "Open …" link | Tabs | Keep the tabs pattern; reduce to 3 real views (5.3). |
| Home | "Read dataset background and methodology", "Open valuation form" | Links | Keep targets; rename second to "Open the form". |
| Prediction form | 4 archetype preset buttons | Fill fake presets | **Remove.** (Optional later: "Load example" fed by M2's example houses.) |
| Prediction form | Chip radios: bedrooms (1-6), bathrooms, floors, condition | Hardcoded options; `<label for>` points at hidden inputs | **Replace** by schema-driven fields (number input / select). |
| Prediction form | Range sliders `sqft`, `lotSqft` | Hardcoded min/max | **Remove.** Use number inputs. |
| Prediction form | Toggle "Substantially renovated" | Boolean `isRenovated` | **Remove.** Replace with `yr_renovated` number input (0 = never). |
| Prediction form | Toggle "Direct waterfront shoreline access" | Boolean | Keep as the `waterfront` binary toggle (0/1), neutral copy. |
| Prediction form | "Return to overview" link | -> `/` | Replace with **Reset** button. |
| Prediction form | "Generate appraisal dossier" submit | Navigates to fake result | Rename **Predict**; calls `/predict`. |
| Prediction form | "View full result dossier" (aside) | Second submit path | **Remove.** |
| Result page | "Adjust property parameters" | -> `/prediction` | Gone with the page (route redirects). |
| Result page | "Share report" | Copies a URL that carries no state | **Remove.** |
| Result page | "Export dossier" | `window.print()` | **Remove.** |
| Result page | "View market analytics", "Inspect model weights" | Links | Move into the result footer only if still useful; rename "Inspect model weights" -> "Model details". |
| Model | 3 tabs | Static panels | Keep the keyboard-accessible tab code; change tabs (5.4). |
| Model | "Open the form"; disabled "Download whitepaper" | Link; dead button | Keep link; **remove** the dead button and its note. |
| Analytics | Disabled "Generate report"; "Market trends" anchor; disabled expand icon; "Detailed heatmap unavailable" | Dead controls | **Remove** all four (5.5). Keep "Open the form". |
| About | "Try the form", "View market charts" | Links | Rename first "Classify a house"; second -> "Dataset analytics". |
| **New** | Tabs "Single house" / "Upload CSV" | - | Section 5.1. |
| **New** | **Predict**, **Reset** | - | Section 5.1. |
| **New** | File picker + drag-drop, **Download CSV template**, **Classify file**, **Clear file**, **Download results**, page-size select, Previous/Next | - | Section 5.1. |

### 5.1 `/prediction` — rewrite `PredictionForm.jsx` (core of M6)

**Structure.** Keep the `pred-workbench` shell, header, fieldset panels and `.pred-field*`, `.pred-toggle`, `.btn-primary`, `.btn-outline` styles. Add the `Tabs` component (accessible tablist; reuse the keyboard handling in `Model.jsx` 47-61: arrow keys, Home, End, roving `tabIndex`). Active tab is mirrored in `?mode=single|csv` via `useSearchParams` (default `single`).

**Header copy.** Eyebrow pill: `King County · Decision Tree classifier`. Remove "Calibrated on 21,613 records" and the live "Current estimate" quick-stat. Title: `Classify an asking price`. Subtitle: `Check whether a house's asking price is attractive or too expensive relative to comparable houses.`

**Single house tab (`SingleHouse.jsx`).**
1. Load schema with `useSchema()`. While loading: skeleton panels with `aria-busy="true"`. On schema failure: `ErrorBanner` ("The form could not be built because feature_schema could not be loaded") plus a Retry button; do not fall back to the mock silently.
2. Render fieldset panels from `fieldMeta` groups in this order: **Price**, **Location**, **Size and layout**, **Quality and history** (omit empty groups; "Other" last). Each field via `SchemaField`:
   - `price`: `type="text" inputMode="numeric"`, `$` prefix, thousands separators applied on blur, digits parsed on submit, sent as a number; `aria-describedby` hint "Listing price in US dollars"; marked required (visible `*` plus `aria-required`).
   - `integer` / `number`: `type="number"`, `inputMode="decimal"`, `step` from schema (`"any"` when fractional), `min`/`max` from schema only. Disable mouse-wheel changes (`onWheel={e => e.currentTarget.blur()}`).
   - `binary`: `role="switch"` button (existing `.pred-toggle`), label tied with `aria-labelledby`, sends 0/1, default off.
   - `categorical`: `<select>` with a first `Select…` option; numeric option labels only.
   - Every control has a real `<label htmlFor>`, `name` equal to the dataset column name, help text via `aria-describedby`, error text via `aria-describedby` + `aria-invalid="true"`.
3. State holds raw strings (no `Number('')` coercion). No default values are invented; fields start empty (`binary` off).
4. **Predict** (`type="submit"`, `.btn-primary`):
   - Run `validateSingle`. If errors: render an `ErrorBanner` summary (`role="alert"`, list of links to invalid fields), mark fields, **move focus to the first invalid field** (or the summary). Warnings render as non-blocking notes.
   - If valid: `buildPayload` -> `predictSingle`. During the request: `<fieldset disabled>` around the form, Predict shows a spinner and `Predicting…` with `aria-busy="true"`, Reset disabled, result panel shows a skeleton inside an `aria-live="polite"` region. Prevent double submit.
   - On server 400: show the message **verbatim** in the banner; if `fieldErrors` exist, also attach them to the matching fields.
   - On network/timeout/5xx: banner with the normalized message and a "Try again" button that resubmits the same payload.
5. **Reset** (`type="button"`, `.btn-outline`): clears all values, errors, warnings and the result; aborts any in-flight request; returns focus to the first field.
6. **Result panel** (reuses the `pred-telemetry` card position/styles, renamed `pred-result*`):
   - Idle: "Fill in the form and press Predict."
   - Success: `ClassBadge` large (icon + `Class <id>` + name) in a heading that receives focus (`tabIndex={-1}`); the **echoed asking price** formatted `$450,000 USD` (from the submitted payload); `ProbabilityList` (one row per class: label, percentage text, bar with `role="meter"` or `<progress>`; sorted by class id; **hidden entirely when the response has no probabilities**); neutral note "The category compares the asking price with comparable houses, as defined by the project's target." Show the "Mock response" badge when `mock: true`.
   - **Never render**: price estimate, interval, drivers, comps, peer median, ratio, confidence score.
7. Remove: `calculateValuation`, `ZIP_PROFILES`, `GRADE_LEVELS`, `VIEW_OPTIONS`, `PROPERTY_ARCHETYPES`, `getArchetype`, `PropertyImage` usage in this page, the telemetry breakdown, and the dead `<input type="hidden">` + `onChange` pattern.

**Upload CSV tab (`BatchUpload.jsx`).**
1. Dropzone: a `<label>` styled as a button wrapping a visually-hidden (not `display:none`) `<input type="file" accept=".csv,text/csv">`; also supports drag-and-drop with a visible drag-over state and instructions text; keyboard operable.
2. On file selection run client checks via `lib/csv.js`; show each failure as a specific message in an `ErrorBanner` and keep **Classify file** disabled:
   - not a `.csv`; empty file (0 bytes or no data rows); larger than `VITE_MAX_CSV_MB`; duplicate/blank header names; **required columns missing** (list them by name, compared with `schema.features`); unknown extra columns -> non-blocking warning listing them (server decides, A6).
3. Show a file chip: name, size, detected rows, columns matched `x/y`, and a **Clear file** button.
4. **Download CSV template**: header-only CSV from `buildTemplate(schema)`, file name `house_template.csv`. (No example row: values would be invented.)
5. **Classify file** (`.btn-primary`): `predictBatch(file)`; same loading pattern as single (disabled controls, `aria-busy`, indeterminate progress bar, `aria-live`). File-level errors from the server render in the banner verbatim.
6. **Results**: summary tiles (rows submitted, classified, failed, and a count per class **computed from returned rows**); table in a scroll region (`role="region"`, `aria-label="Batch results"`, `tabIndex=0`, `overflow:auto`, sticky `<thead>`), columns `#`, asking price (when the response echoes it), predicted category (`ClassBadge` compact), top probability (only when supplied), status/error text. Row-level errors show icon + text (not color only). Client-side pagination 25/50/100 with Previous/Next and "Showing a-b of n". Optional P3: filter by class.
7. **Download results**: uses the backend mechanism (A7). If the response has `download_url`, trigger it (anchor with `download`, or fetch -> blob -> object URL, revoking the URL afterwards). If M5 returns a CSV blob directly, save that. Only if neither exists, fall back to `buildResultsCsv(rows)` and label this in the report. The button is disabled with a visible reason until results exist.
8. Large CSV: only `file.text()` + a single pass for header/row count; never build objects for all rows; the table renders at most one page of DOM rows.

**CSS.** New styles go in `PredictionForm.css` (extend) or a new `BatchUpload.css` following `pred-*` naming and existing tokens only. Delete the CSS blocks for removed markup (archetype, telemetry breakdown, range slider, chip row if unused) in the same change. Required: 375 px layout has no horizontal page scroll (tables scroll inside their container), tap targets >= 44 px, `prefers-reduced-motion` respected (keep the existing block at the end of `PredictionForm.css`), no layout shift when the result panel changes state (reserve min-height).

### 5.2 Shared components and Footer

- `ErrorBanner`: `role="alert"`, icon + text, optional list of field links, optional "Details" disclosure for raw server text, optional action button. Uses `--color-error` (valid after G1).
- `ApiStatus` (Footer, replaces the "Static demonstration interface…" note): in mock mode text `Mock data (no backend)`; otherwise call `getHealth()` once on mount and show `API connected` / `API unreachable` as text with an icon, `aria-live="polite"`. Never claim "connected" without a successful `/health` response.
- Footer description: `Classifies whether a King County house's asking price is attractive or too expensive relative to comparable houses.`

### 5.3 `Home.jsx` (and `Home.css`)

- Remove: import of `calculateValuation`, states `heroZip/heroSqft`, the whole valuation console (lines 105-183), the "Configure full appraisal dossier" link, and the "King County coverage" section (lines 305-336, invalid city<->ZIP map; conflict 3). Delete the matching CSS blocks.
- Hero: h1 `Is the asking price fair for comparable houses?`; description `Classify a King County house's asking price as cheaper than average, reasonable, over priced or too over priced.`; buttons `Classify a house` (-> `/prediction`) and `Upload a CSV` (-> `/prediction?mode=csv`).
- Replace the console column with a static **"Four categories"** card listing `DEFAULT_CLASSES` (icon + id + name), no numbers, no thresholds.
- Dataset well: metrics become `4` price categories, `1` Decision Tree model, `2` ways to use it (single house or CSV), and `<schema feature count>` input features (shown as `-` with the label "from feature_schema.json (mock schema active)" when `source === 'mock'`). Remove "21,613", "70", "18", "2014 to 2015" and the May 2014 caption; caption -> `House sales dataset for King County (Kaggle). The team documents the target definition and thresholds.`
- Tour: 3 items: **Single house** (-> `/prediction`), **Upload CSV** (-> `/prediction?mode=csv`), **Model details** (-> `/model`). Remove "Valuation benchmark" (`$640,000`) and "Ridge regression weights". Tour images are decorative: use `alt=""` and do not describe a property type.
- CTA: title `Ready to classify a house?`, button `Open the form`, text `Enter one house or upload a CSV and get its price category.`

### 5.4 `Model.jsx` (CRLF file; keep CRLF)

- Delete: `specs` XGBoost/neurons/latency values, `metrics` array (R², MAE, RMSE, median error), `features` array, the three `HealthBar`s and their component, the History tab with the epoch/loss SVG, and the disabled "Download whitepaper" + note.
- New data source: `getModelInfo()`. State: `loading | notConnected | ready`. If `/model_info` is absent, 404 or mock: show a single empty-state card `Model metrics are not connected yet.`
- Hero specs (only what is true or supplied): `Algorithm: Decision Tree classifier (single model)`, `Task: supervised classification, 4 classes`, `Input features: <schema count>`; add `scikit-learn version` / `training rows` **only if** `/model_info` supplies them.
- Metrics grid: render only the metrics present in `/model_info` (for example accuracy, macro F1, precision, recall) with their exact keys; no badges, no deltas. No R²/MAE/RMSE.
- Tabs (keep the existing accessible tab code): `Classes` (legend from `classes.js`), `Features` (importances **only** from `/model_info.feature_importances`, otherwise empty state), `Evaluation` (confusion matrix table if `/model_info.confusion_matrix` exists, otherwise empty state). Replaces `Architecture / Features / History`.
- Hero description: `Values on this page come from the backend's /model_info when it is connected.`

### 5.5 `Analytics.jsx` (decision D-5, default option A)

- Remove all hand-typed content: `AreaChart`, `BarChart`, `ScatterChart`, `CorrelMatrix` + `corrData`, KPI grid (`Median sale price`, `Inventory`, `Days on market`, `AI confidence index`), disabled `Generate report`, disabled expand button, "Detailed heatmap unavailable", the `Market trends` anchor, and the now unused icons.
- Page becomes `Dataset analytics`: description `No data is connected to this page yet. Figures from the team's exploratory analysis can be listed here.`
- Render a figure gallery from `public/eda/manifest.json` (`[{ "file": "...", "title": "...", "caption": "..." }]`) **if present**; otherwise the empty state. M1 provides the files (section 8.4). No number is typed by hand.
- Keep `Open the form` CTA. Do not delete the route or the nav link without flagging it (option B in section 9 is to hide the link).

### 5.6 `About.jsx`

- Inputs card: `The form is generated from feature_schema.json. The asking price is a required input.`
- Results card: `The page shows the predicted price category and, when the server supplies them, class probabilities. Predictions come from a trained Decision Tree served by the Flask API. In mock mode the responses are fake and labeled as such.`
- Data card: `House sales dataset for King County (Kaggle). The interface is not connected to an external database.`
- Dataset stats: `Columns in dataset: 21` (the user-supplied column list), `Rows: 21,000+ (project brief)`, `Source: Kaggle`, `Train/test split: 80/20, stratified, random_state=42 (project plan; confirm with M3)`. Remove "King County Govt", "Features stated in project 20".
- "Dimensions" list: use real column names (`price`, `sqft_living`, `sqft_above`, `sqft_basement`, `yr_built`, `yr_renovated`, `zipcode`, `lat`, `long`, `grade`, `condition`, `view`, `waterfront`) with the note `Which columns are model inputs is defined by feature_schema.json.`
- Docs card: reword to `Methodology documents are part of the team report and are not linked from this interface.`
- Buttons: `Classify a house` (-> `/prediction`), `Dataset analytics` (-> `/analytics`).

### 5.7 `PredictionResult.jsx` / `PredictionResult.css`

Delete both files (result now lives inline in the Single house tab and the batch table) and keep `/prediction/result` as a redirect (G4). Everything in them is regression (estimate, interval, drivers, fake comps). Remove imports of `PropertyImage` comps images from this page; the four `public/images/comps/*.jpg` become unused (flag in the report; do not delete without confirmation).

### 5.8 `README.md` and `design.md`

- README: rewrite Features/Routes/Structure for classification, document `.env.example`, mock mode, dev proxy, the API endpoints used, how to run `npm run lint`, `npm run build`, `npm test`, and the serving assumption A1. Remove "18 property parameters", "confidence interval", "regression metrics ($R^2$, MAE, RMSE)".
- design.md: update the "Core Interaction Loop" and macrostructure sections for classification (Single house / Upload CSV, class badge, probabilities, batch table). Keep tokens, typography, imagery pipeline and accessibility standards unchanged. Preserve CRLF.

---

## 6. File manifest

**Add:** `.env.example`; `src/config/featureSchema.js`, `fieldMeta.js`, `classes.js`; `src/api/client.js`, `mock.js`; `src/lib/payload.js`, `validation.js`, `csv.js` (+ `*.test.js` each); `src/components/SchemaField.jsx`, `ErrorBanner.jsx`, `ClassBadge.jsx`, `ProbabilityList.jsx`, `ApiStatus.jsx`, `Tabs.jsx` (+ CSS); `src/pages/SingleHouse.jsx`, `BatchUpload.jsx`, `BatchUpload.css`.

**Modify:** `vite.config.js` (proxy); `index.html` (copy); `src/App.jsx` (route redirect); `src/styles/variables.css` (G1); `src/pages/PredictionForm.jsx` + `.css` (shell + tabs); `src/pages/Home.jsx` + `.css`; `src/pages/Model.jsx` + `.css`; `src/pages/Analytics.jsx` + `.css`; `src/pages/About.jsx` (+ CSS only for removed elements); `src/components/Footer.jsx`; `package.json` (add `"test": "node --test"` only); `README.md`; `design.md`.

**Remove:** `src/pages/PredictionResult.jsx`, `PredictionResult.css`; exports/constants listed in 5.1 item 7; CSS blocks for removed markup. **Flag, do not delete without confirmation:** `public/images/comps/*.jpg`, `public/images/properties/*.jpg` if unused after the rewrite, unreferenced `public/assets/*.png` (no reference found in `src/`), `visily-multiscreens/`.

---

## 7. Verification

Run and report real outputs (do not claim what you did not run):

1. `npm install`, `npm run lint`, `npm run build` — must pass with no new warnings.
2. `npm test` (Node's built-in runner, no new dependency) covering the pure modules: `normalizeSchema` (valid, missing name, unknown type), `buildPayload` (order, number casting, binary 0/1, no `id`/`date`, no helper columns), `validateSingle` (missing/zero/negative price, out-of-range `grade 14`, `view 5`, `condition 0`, non-integer bedrooms, soft warning only when all three sqft fields exist), `readCsvMeta` (BOM, quoted commas, embedded newline, duplicate header, empty file, header-only file, trailing blank lines), `buildTemplate`, `buildResultsCsv` quoting.
3. Manual or scripted UI tests in mock mode, then against the real API once M5 is ready:

| Case | Expected |
|---|---|
| Valid single prediction | Loading state, then class id + name, echoed price, probabilities when present; focus on result heading |
| Asking price empty / `0` / negative | Blocking field error, focus on the field, no request sent |
| Out-of-range value (`grade 14`, `view 5`) | Field error naming the allowed range |
| Server 400 (`?mock=error400`) | Message shown verbatim, field-level where `fields` given |
| Network failure / timeout / 500 | Specific message, "Try again" works, controls re-enabled |
| Reset during and after a request | State cleared, in-flight request aborted, focus on first field |
| CSV: empty file, non-CSV, too large | Specific blocking message |
| CSV: wrong/missing columns | Missing column names listed, Classify disabled |
| CSV: valid | Results table + summary; pagination works |
| CSV: large (e.g. 20k+ rows) | No freeze; only one page of rows in DOM |
| Download results | File saved via the agreed mechanism; fallback labeled if used |
| Mock mode | "Mock response" badge visible on result and table |
| Viewports 375 / 768 / 1280 / 1920 px | No horizontal page scroll, tables scroll inside container, no layout shift |
| Keyboard only | All controls reachable, visible focus, tabs arrow-key navigable, dropzone operable |
| Screen reader smoke test | Labels announced, errors announced via `role="alert"`, loading announced via live region |
| Contrast | Text >= 4.5:1, controls >= 3:1 incl. the four class colors |
| Content audit | `grep -ri "estimate\|valuation\|regression\|confidence\|XGBoost\|Ridge\|R²\|MAE\|RMSE\|comps\|dossier\|appraisal\|peer\|ratio" src/` returns nothing user-visible (allowed only in code comments about what was removed) |

4. Network check in devtools: the payload sent to `/predict` contains exactly the schema's feature names, numbers as numbers, and nothing else.

---

## 8. Interface requests (to be sent to the owners)

### 8.1 To M3: `model/feature_schema.json` shape and usage

Please confirm or adjust this proposed shape (the adapter `normalizeSchema` will follow whatever is agreed):

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
(Illustrative only: values come from M3.) Questions: exact feature list and order; are `id` and `date` inputs; types of `zipcode` (string or number) and `view/condition/grade`; real min/max per numeric field; which fields may be missing (imputers exist); how to serve the file to the browser (M5 below); optional human descriptions for `view`, `condition`, `grade` if the team wants them shown.

### 8.2 To M5: API contract

- `GET /health` -> `{ "status": "ok" }`.
- `GET <schema path>` -> `feature_schema.json` (or confirm it is copied into the frontend build).
- `POST /predict`, body = flat JSON, keys in schema order, e.g. `{ "price": 450000, "bedrooms": 3, ... }`. Proposed 200 response:
  ```json
  { "class_id": 2, "class_name": "Over priced",
    "probabilities": { "0": 0.05, "1": 0.20, "2": 0.60, "3": 0.15 } }
  ```
  (`probabilities` optional.) Proposed 400 response: `{ "error": "Asking price must be greater than 0", "fields": { "price": "must be > 0" } }` (`fields` optional).
- `POST /predict_batch`, `multipart/form-data`, field name `file`. Proposed 200 response:
  ```json
  { "summary": { "rows": 120, "predicted": 118, "failed": 2 },
    "rows": [ { "row": 1, "price": 450000, "class_id": 1, "class_name": "Reasonable price", "probabilities": { "0": 0.1, "1": 0.7, "2": 0.15, "3": 0.05 } },
              { "row": 2, "error": "bedrooms must be a number" } ],
    "download_url": "/download/<results file>" }
  ```
  File-level 400: `{ "error": "Missing required columns: price, grade" }`.
- Please confirm: batch response format (JSON rows + URL, or CSV blob); the download route path; whether unknown extra CSV columns are rejected or ignored; maximum file size and row count; CORS (not needed if same origin or Vite proxy); `GET /model_info` shape (`metrics`, `feature_importances: [{name, importance}]`, `confusion_matrix`, `classes`, scikit-learn version, training rows), all optional; Flask catch-all returning `index.html` for non-API paths if `dist/` is served by Flask (otherwise the frontend switches to `HashRouter`); a fake-model backend early so M6 can integrate before M4 finishes.

### 8.3 To M2: representative examples

`sample_data/sample_houses.csv` and a short list of demonstration houses (with the expected class for the demo). If delivered as JSON `[{ "label": "...", "values": { ...schema fields... } }]`, M6 can add an optional **Load example** button. Until then no example data is hardcoded.

### 8.4 To M1: analytics assets

Static figures (PNG or SVG) with titles and captions, plus `manifest.json` as described in 5.5, placed in `public/eda/`. Also the class distribution if it should be shown.

---

## 9. Decisions to confirm (defaults chosen so work is not blocked)

| ID | Decision | Default applied | Alternative |
|---|---|---|---|
| D-1 | Keep React instead of `webapp/templates` | Keep React (A1) | Rebuild as Jinja + vanilla JS (not recommended) |
| D-2 | Mock schema until real `feature_schema.json` exists | Mock, clearly labeled | Wait for M3 |
| D-3 | `/prediction/result` route | Redirect to `/prediction` (result is inline) | Keep a separate result page fed by router state |
| D-4 | Model page tabs | `Classes / Features / Evaluation` (History removed: no epochs in a Decision Tree) | Keep three tabs with different names |
| D-5 | Analytics page | Option A: honest empty state + M1 figure gallery | Option B: hide the nav link and route |
| D-6 | Production routing | `BrowserRouter` + Flask catch-all | `HashRouter` |
| D-7 | Batch download | Backend mechanism; client CSV only as labeled fallback | Always client-side |
| D-8 | Fields default blank | Blank (no invented defaults), `waterfront` off | M2 provides defaults |

---

## 10. Report section skeleton (what to write after implementation)

1. What was built: two tabs, schema-driven form, Predict/Reset, loading/error handling, result with class + probabilities, CSV upload, results table, download, mock layer, dev proxy.
2. Mapping table: schema feature -> form control -> payload key -> CSV column.
3. API mapping: endpoints used, request/response examples actually exercised.
4. Assumptions A1-A9 and decisions D-1 to D-8 with their final outcome.
5. Test results (section 7) including what could not be run.
6. Screenshots to capture: single form empty; form with validation errors; loading state; result with probabilities; result without probabilities; server 400 error; CSV tab empty; CSV wrong-columns error; CSV results table (desktop and 375 px); download; Model page "not connected" and connected; mock badge.

---

## 11. Suggested execution order and definition of done

**Order (one commit per step):**
1. G1 CSS variable fix, `.env.example`, Vite proxy, `index.html` copy.
2. `config/*`, `api/*`, `lib/*` + unit tests (no UI yet).
3. Shared components (`SchemaField`, `ErrorBanner`, `ClassBadge`, `ProbabilityList`, `Tabs`, `ApiStatus`).
4. Single house tab (form, Predict, Reset, result panel).
5. CSV tab (validation, template, upload, table, download).
6. Remove regression code: `calculateValuation`, `PredictionResult`, route redirect.
7. Home, Footer, Model, Analytics, About copy and structure changes.
8. README, design.md, final grep audit, lint, build, tests, screenshots.

**Done when:** every row of section 2.1 is Met; no invalid item of section 2.2 remains; `npm run lint`, `npm run build` and `npm test` pass; the grep audit in section 7 is clean; the UI works end to end in mock mode; the real-API run is either done and reported or explicitly listed as pending M5/M4; section 8 requests are sent; the final report lists every removal and every assumption.
