# HousePrice AI — Housing Price Relevance Classification Platform

**HousePrice AI** is a web application that classifies whether a residential house's asking price in King County, Washington is attractive or too expensive relative to comparable houses.

The supervised classification model (Decision Tree) predicts one of four target classes:
- **Class 0**: Cheaper than average
- **Class 1**: Reasonable price
- **Class 2**: Over priced
- **Class 3**: Too over priced

---

## Features

- **Classification Workbench (`/prediction`)**:
  - **Single house tab**: Schema-driven form with asking price (USD) as a required input feature, number/decimal inputs, categorical selects, binary switches, client validation, and real-time loading/error states. Displays predicted class badge, echoed asking price, and class probabilities when supplied.
  - **Upload CSV tab**: Bulk property classification via drag-and-drop or file browser. Includes client validation of CSV headers against schema features, downloadable template, summary statistics across classes, paginated results table with class badges and row status, and CSV results export.
- **Decision Tree Model Diagnostics (`/model`)**: Displays model specifications, target class definitions, feature importances, and evaluation confusion matrix when connected to the backend API (`/model_info`).
- **Dataset Analytics (`/analytics`)**: Figure gallery connecting to exploratory data analysis (EDA) plots supplied by Member 1 (`public/eda/manifest.json`).
- **Methodology & Documentation (`/about`)**: Dataset column overview, classification framework, and architectural guidelines.
- **Live Backend & Mock Simulation**: Built-in mock layer (`VITE_USE_MOCK=true`) for offline frontend development and integration testing before backend deployment.

---

## Application Routes

| Route | Page | Description |
| :--- | :--- | :--- |
| `/` | **Home** | Overview, target class explanations, framework metrics, and interface tour |
| `/prediction` | **Classification Workbench** | Two tabs: Single house form and Batch CSV upload with results table |
| `/prediction/result` | *Redirect* | Redirects to `/prediction` (results are rendered inline) |
| `/analytics` | **Dataset Analytics** | Exploratory data analysis figure gallery from team notebooks |
| `/model` | **Model Diagnostics** | Decision Tree specifications, class definitions, and metrics |
| `/about` | **About & Dataset** | King County dataset features, schema rules, and methodology |

---

## Architecture & Integration (Assumption A1)

The web frontend is built with React 19 and communicates with a Python Flask backend serving the trained scikit-learn Decision Tree pipeline:

```text
Browser (React Single Page App)
  │
  ├── Single: POST /predict (JSON payload, exact schema feature names)
  │     └── returns: { class_id, class_name, probabilities }
  │
  ├── Batch:  POST /predict_batch (multipart/form-data, file)
  │     └── returns: { summary, rows: [...], download_url }
  │
  └── Status: GET /health, GET /model_info
```

- In development: Vite proxies API paths (`^/predict$`, `^/predict_batch$`, `^/health$`, `^/model_info$`) to `http://127.0.0.1:5000`.
- In production: Flask serves `dist/` with a catch-all route for SPA client-side routing, or the frontend is deployed as a standalone static bundle.

---

## Environment Configuration

Copy `.env.example` to `.env.local` to configure your environment:

```bash
# Set to 'true' to run fully offline with simulated mock responses
VITE_USE_MOCK=true

# API Base URL (empty = same origin or Vite dev proxy)
VITE_API_BASE_URL=

# Vite dev proxy target (points to Flask backend)
VITE_DEV_PROXY_TARGET=http://127.0.0.1:5000

# File size guard for CSV uploads (MB)
VITE_MAX_CSV_MB=5

# Request timeouts (milliseconds)
VITE_REQUEST_TIMEOUT_MS=30000
VITE_BATCH_TIMEOUT_MS=120000
```

---

## Getting Started

### 1. Prerequisites

- **Node.js**: `v20.0.0` or higher (verified on Node `v24`)
- **npm**: `v9.0.0` or higher

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Available NPM Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Vite local development server with proxying |
| `npm test` | Runs unit tests using Node's built-in test runner (`node --test`) |
| `npm run lint` | Runs [Oxlint](https://oxc.rs) to inspect source code |
| `npm run build` | Compiles and bundles production-ready assets into `dist/` |
| `npm run preview` | Previews the production build locally |

---

## Project Structure

```text
house-pred/
├── public/                 # Static assets (images, icons, favicon)
├── src/
│   ├── api/                # API client, error normalization, and mock layer
│   │   ├── client.js       # Fetch wrappers, timeouts, and ApiError normalization
│   │   └── mock.js         # Simulated responses with failure toggles for testing
│   ├── components/         # Reusable UI components
│   │   ├── ApiStatus.jsx   # Live /health indicator in footer
│   │   ├── ClassBadge.jsx  # Multi-color accessible class badge (icon + ID + label)
│   │   ├── ErrorBanner.jsx # Accessible role="alert" error notification
│   │   ├── Footer.jsx      # Application footer
│   │   ├── Header.jsx      # Navigation header
│   │   ├── ProbabilityList.jsx # Bar meter visualization for class probabilities
│   │   ├── SchemaField.jsx # Schema-driven dynamic field renderer
│   │   └── Tabs.jsx        # Keyboard-accessible ARIA tablist
│   ├── config/             # Schema configuration and UI metadata
│   │   ├── classes.js      # Target classification categories and styles
│   │   ├── featureSchema.js # feature_schema.json loader, mock schema, and validator
│   │   └── fieldMeta.js    # Display labels, units, and grouping metadata
│   ├── lib/                # Pure business logic and unit tests
│   │   ├── csv.js          # RFC 4180 CSV parser, header validator, and serializer
│   │   ├── payload.js      # Request payload builder (schema ordering & casting)
│   │   └── validation.js   # Single house validation rules and soft warnings
│   ├── pages/              # Application views
│   │   ├── About.jsx       # System methodology & dataset documentation
│   │   ├── Analytics.jsx   # Figure gallery from exploratory data analysis
│   │   ├── BatchUpload.jsx # CSV drag-and-drop, table, pagination, and export
│   │   ├── Home.jsx        # Executive landing page
│   │   ├── Model.jsx       # Decision Tree specs, class cards, and evaluation
│   │   ├── PredictionForm.jsx # Workbench tabs shell (Single house & CSV upload)
│   │   └── SingleHouse.jsx # Schema-driven single property classification form
│   ├── styles/             # Design tokens, variables, typography, and base CSS
│   ├── App.jsx             # React Router routing configuration
│   └── main.jsx            # React root mount
├── .env.example            # Environment variables template
├── index.html              # HTML entry point with web font imports
├── package.json            # Project dependencies and test/lint scripts
└── vite.config.js          # Vite configuration with regex-anchored dev proxy
```
