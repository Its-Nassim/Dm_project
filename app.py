"""
app.py – Flask backend for the FDD house-price classification app.

Endpoints
---------
GET  /health          → {"status": "ok", "model_loaded": bool}
GET  /schema          → feature_schema.json contents
GET  /model_info      → model metadata, or 404 when no model is loaded
POST /predict         → single-house prediction (JSON body)
POST /predict_batch   → CSV file upload, returns {summary, rows, download_url}
GET  /download/<name> → download a previously generated result CSV

Model
-----
On startup the app tries to load  model/model.pkl  (a joblib-serialised
sklearn Pipeline trained by the M4 notebook).  If the file is absent the
app still starts and returns a 503 on prediction routes with a clear error.

Usage
-----
  cd my_backend
  venv\\Scripts\\activate
  python app.py          # dev server on http://127.0.0.1:5000
"""

import io
import json
import uuid
from pathlib import Path

import pandas as pd
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

try:
    import joblib
    _joblib_available = True
except ImportError:
    _joblib_available = False

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
BASE_DIR   = Path(__file__).parent
MODEL_PATH = BASE_DIR / "model" / "model.pkl"
META_PATH  = BASE_DIR / "model" / "model_meta.json"
SCHEMA_PATH = (
    BASE_DIR.parent
    / "my-frontend"
    / "m3-preprocessing"
    / "model"
    / "feature_schema.json"
)
DOWNLOAD_DIR = BASE_DIR / "tmp_results"
DOWNLOAD_DIR.mkdir(exist_ok=True)

# ---------------------------------------------------------------------------
# Lightweight backend helpers (FEATURE_ORDER, LABELS, prepare_input)
# Uses backend_tools.py instead of m3_tools.py to avoid pulling in
# matplotlib / seaborn / sklearn at startup before a model is loaded.
# ---------------------------------------------------------------------------
from backend_tools import FEATURE_ORDER, LABELS, prepare_input  # noqa: E402

# ---------------------------------------------------------------------------
# App & CORS
# ---------------------------------------------------------------------------
app = Flask(__name__, static_folder=str(BASE_DIR.parent / "my-frontend" / "Frontend" / "dist"), static_url_path="")

# Allow the Vite dev server (port 5173) and same-origin requests
CORS(app, resources={r"/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5000"]}})

# ---------------------------------------------------------------------------
# Model loading
# ---------------------------------------------------------------------------
_model      = None
_model_meta = {}

def _load_model():
    """Load the sklearn pipeline from disk.  Called once at startup."""
    global _model, _model_meta
    if MODEL_PATH.exists():
        try:
            if not _joblib_available:
                raise ImportError("joblib is not installed. Run: pip install joblib scikit-learn")
            _model = joblib.load(MODEL_PATH)
            if META_PATH.exists():
                with META_PATH.open() as f:
                    _model_meta = json.load(f)
            print(f"[app] Model loaded from {MODEL_PATH}")
        except Exception as exc:
            print(f"[app] WARNING – could not load model: {exc}")
            _model = None
    else:
        print(f"[app] No model found at {MODEL_PATH}. "
              "Train and export a model first (see M4 notebook).")

_load_model()

# ---------------------------------------------------------------------------
# Helper: build a prediction dict from the fitted pipeline
# ---------------------------------------------------------------------------
def _predict_one(row_df):
    """Run the pipeline on a single-row DataFrame.

    Returns a dict with class_id, class_name, and probabilities.
    Raises RuntimeError when the model is not loaded.
    Raises ValueError when the input is invalid (propagated from prepare_input).
    """
    if _model is None:
        raise RuntimeError("No model is loaded. Train and export a model first (see M4 notebook).")

    prepared = prepare_input(row_df)   # validates + reorders columns
    class_id = int(_model.predict(prepared)[0])
    class_name = LABELS.get(class_id, str(class_id))

    probabilities = {}
    if hasattr(_model, "predict_proba"):
        proba = _model.predict_proba(prepared)[0]
        probabilities = {int(cls): round(float(p), 4) for cls, p in zip(_model.classes_, proba)}

    return {
        "class_id":    class_id,
        "class_name":  class_name,
        "probabilities": probabilities,
    }

# ---------------------------------------------------------------------------
# Helper: map frontend payload → DataFrame the pipeline expects
# ---------------------------------------------------------------------------
# The frontend sends 21 raw fields (id, date, lat, long, …).
# prepare_input only wants the 15 FEATURE_ORDER columns, so we keep only those.
def _payload_to_df(data: dict) -> pd.DataFrame:
    """Convert a JSON dict (or list of dicts) to a DataFrame with FEATURE_ORDER columns."""
    if isinstance(data, dict):
        data = [data]
    df = pd.DataFrame(data)

    # Rename: the frontend sends `long`; the schema uses `long` too – nothing to rename.
    # Drop columns that are not in FEATURE_ORDER (id, date, lat, long, sqft_living15, sqft_lot15).
    extra = [c for c in df.columns if c not in FEATURE_ORDER]
    if extra:
        df = df.drop(columns=extra)

    # Ensure all required columns are present (missing ones are added as NaN so
    # prepare_input can raise a clear error rather than a KeyError here).
    for col in FEATURE_ORDER:
        if col not in df.columns:
            df[col] = None

    return df

# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.route("/health")
def health():
    """Health-check endpoint."""
    return jsonify({"status": "ok", "model_loaded": _model is not None})


@app.route("/schema")
def schema():
    """Return the feature schema JSON used by the frontend form."""
    if not SCHEMA_PATH.exists():
        return jsonify({"error": "Schema file not found."}), 404
    with SCHEMA_PATH.open(encoding="utf-8") as f:
        return jsonify(json.load(f))


@app.route("/model_info")
def model_info():
    """Return model metadata, or 404 if no model is loaded."""
    if _model is None:
        return jsonify({"error": "No model loaded."}), 404

    info = {
        "model_loaded": True,
        "model_path":   str(MODEL_PATH),
        "classes":      {str(k): v for k, v in LABELS.items()},
        "feature_order": FEATURE_ORDER,
    }
    info.update(_model_meta)   # merge training date, name, scores etc. if present
    return jsonify(info)


@app.route("/predict", methods=["POST"])
def predict():
    """Single-house prediction.

    Expects a JSON body matching the frontend payload (all 21 raw fields).
    Returns:
        200 {"class_id": int, "class_name": str, "probabilities": {int: float}}
        400 {"error": str}   – validation error
        503 {"error": str}   – no model loaded
    """
    if not request.is_json:
        return jsonify({"error": "Request must be JSON (Content-Type: application/json)."}), 400

    data = request.get_json(force=True)

    try:
        df  = _payload_to_df(data)
        result = _predict_one(df)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except RuntimeError as exc:
        return jsonify({"error": str(exc)}), 503

    return jsonify(result)


@app.route("/predict_batch", methods=["POST"])
def predict_batch():
    """Batch prediction from a CSV file upload.

    Form field:  file  (multipart/form-data, .csv)
    Returns:
        200 {
              "summary": {"rows": int, "predicted": int, "failed": int},
              "rows":    [ {row, class_id, class_name, probabilities} | {row, error} ],
              "download_url": "/download/<filename>.csv"
            }
        400 {"error": str}
        503 {"error": str}
    """
    if _model is None:
        return jsonify({"error": "No model loaded. Train and export a model first (see M4 notebook)."}), 503

    if "file" not in request.files:
        return jsonify({"error": "No file part in the request. Send a CSV under the 'file' field."}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected."}), 400

    # --- Read the CSV ---
    try:
        content = file.read().decode("utf-8-sig")   # strip BOM if present
        df_all  = pd.read_csv(io.StringIO(content), dtype={"zipcode": str})
    except Exception as exc:
        return jsonify({"error": f"Could not parse CSV: {exc}"}), 400

    rows_out = []
    for idx, row in df_all.iterrows():
        row_num = idx + 1
        try:
            row_df = _payload_to_df(row.to_dict())
            pred   = _predict_one(row_df)
            rows_out.append({"row": row_num, **pred})
        except (ValueError, RuntimeError) as exc:
            rows_out.append({"row": row_num, "error": str(exc)})

    # --- Build result CSV and save for download ---
    result_df = pd.DataFrame(rows_out)
    fname     = f"results_{uuid.uuid4().hex[:8]}.csv"
    result_df.to_csv(DOWNLOAD_DIR / fname, index=False)

    summary = {
        "rows":      len(rows_out),
        "predicted": sum(1 for r in rows_out if "error" not in r),
        "failed":    sum(1 for r in rows_out if "error" in r),
    }

    return jsonify({
        "summary":      summary,
        "rows":         rows_out,
        "download_url": f"/download/{fname}",
    })


@app.route("/download/<path:filename>")
def download(filename):
    """Serve a previously generated result CSV."""
    return send_from_directory(DOWNLOAD_DIR, filename, as_attachment=True)


# ---------------------------------------------------------------------------
# Serve the React build (production mode)
# ---------------------------------------------------------------------------
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    dist = Path(app.static_folder)
    target = dist / path
    if path and target.exists():
        return send_from_directory(str(dist), path)
    # SPA fallback: always return index.html for unknown routes
    index = dist / "index.html"
    if index.exists():
        return send_from_directory(str(dist), "index.html")
    return jsonify({"error": "Frontend not built. Run `npm run build` in the Frontend folder."}), 404


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
