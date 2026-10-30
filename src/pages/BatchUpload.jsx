import { useState, useRef } from 'react'
import { useSchema } from '../config/featureSchema.js'
import { readCsvMeta, buildTemplate } from '../lib/csv.js'
import { predictBatch, downloadResults, ApiError } from '../api/client.js'
import ErrorBanner from '../components/ErrorBanner.jsx'
import ClassBadge from '../components/ClassBadge.jsx'
import './BatchUpload.css'

const MAX_CSV_MB = typeof import.meta !== 'undefined' && import.meta.env?.VITE_MAX_CSV_MB
  ? Number(import.meta.env.VITE_MAX_CSV_MB)
  : 5

export default function BatchUpload() {
  const { schema } = useSchema()

  const [selectedFile, setSelectedFile] = useState(null)
  const [fileMeta, setFileMeta] = useState(null)
  const [fileError, setFileError] = useState(null)
  const [fileWarning, setFileWarning] = useState(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [batchResponse, setBatchResponse] = useState(null)

  // Pagination & Filtering
  const [pageSize, setPageSize] = useState(25)
  const [currentPage, setCurrentPage] = useState(1)
  const [classFilter, setClassFilter] = useState('all')

  const fileInputRef = useRef(null)

  const validateAndSetFile = async (file) => {
    setUploadError(null)
    setBatchResponse(null)
    setFileWarning(null)
    setFileError(null)
    setCurrentPage(1)

    if (!file) {
      setSelectedFile(null)
      setFileMeta(null)
      return
    }

    // 1. Check extension / type
    const isCsvExt = file.name.toLowerCase().endsWith('.csv')
    if (!isCsvExt) {
      setFileError(`File "${file.name}" is not a CSV. Please select a valid .csv file.`)
      setSelectedFile(null)
      setFileMeta(null)
      return
    }

    // 2. Check file size
    const maxBytes = MAX_CSV_MB * 1024 * 1024
    if (file.size > maxBytes) {
      setFileError(
        `File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the ${MAX_CSV_MB} MB client limit.`
      )
      setSelectedFile(null)
      setFileMeta(null)
      return
    }

    // 3. Inspect headers and row count
    try {
      const text = await file.text()
      const meta = readCsvMeta(text)

      if (meta.errors.length > 0) {
        setFileError(meta.errors.join(' '))
        setSelectedFile(null)
        setFileMeta(null)
        return
      }

      if (meta.rowCount === 0) {
        setFileError('The CSV file contains no data rows.')
        setSelectedFile(null)
        setFileMeta(null)
        return
      }

      // Check required schema features
      if (schema?.features) {
        const requiredNames = schema.features.filter((f) => f.required).map((f) => f.name)
        const missing = requiredNames.filter((name) => !meta.headers.includes(name))
        if (missing.length > 0) {
          setFileError(
            `Missing required dataset columns in CSV header: ${missing.join(', ')}.`
          )
          setSelectedFile(null)
          setFileMeta(null)
          return
        }

        const schemaNames = schema.features.map((f) => f.name)
        const extra = meta.headers.filter((h) => !schemaNames.includes(h))
        if (extra.length > 0) {
          setFileWarning(
            `Note: CSV contains ${extra.length} unrecognized column(s) (${extra.slice(0, 5).join(', ')}${extra.length > 5 ? '...' : ''}) that will be ignored by the model.`
          )
        }
      }

      setSelectedFile(file)
      setFileMeta(meta)
    } catch (err) {
      setFileError(`Failed to parse CSV file: ${err.message}`)
      setSelectedFile(null)
      setFileMeta(null)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    validateAndSetFile(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    validateAndSetFile(file)
  }

  const handleClearFile = () => {
    setSelectedFile(null)
    setFileMeta(null)
    setFileError(null)
    setFileWarning(null)
    setBatchResponse(null)
    setUploadError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDownloadTemplate = () => {
    if (!schema) return
    const csvContent = buildTemplate(schema)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'house_template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleClassify = async () => {
    if (!selectedFile) return
    setIsUploading(true)
    setUploadError(null)
    setBatchResponse(null)

    try {
      const res = await predictBatch(selectedFile)
      setBatchResponse(res)
      setCurrentPage(1)
    } catch (err) {
      if (err instanceof ApiError) {
        setUploadError({
          title: 'Batch classification failed',
          message: err.message,
          details: err.details,
        })
      } else {
        setUploadError({
          title: 'Batch classification failed',
          message: err?.message || 'Failed to process CSV file on the server.',
        })
      }
    } finally {
      setIsUploading(false)
    }
  }

  const handleDownloadResults = async () => {
    if (!batchResponse) return
    await downloadResults(batchResponse, `classification_results_${selectedFile?.name || 'batch'}.csv`)
  }

  // Filter & paginate rows
  const allRows = batchResponse?.rows || []
  const filteredRows = allRows.filter((r) => {
    if (classFilter === 'all') return true
    if (classFilter === 'error') return Boolean(r.error)
    return r.class_id === Number(classFilter)
  })

  const totalPages = Math.ceil(filteredRows.length / pageSize) || 1
  const startIdx = (currentPage - 1) * pageSize
  const pageRows = filteredRows.slice(startIdx, startIdx + pageSize)

  // Compute stats per class
  const classCounts = { 0: 0, 1: 0, 2: 0, 3: 0, error: 0 }
  allRows.forEach((r) => {
    if (r.error) {
      classCounts.error++
    } else if (r.class_id !== undefined && classCounts[r.class_id] !== undefined) {
      classCounts[r.class_id]++
    }
  })

  return (
    <div className="batch-upload">
      {schema?.source === 'mock' && (
        <aside className="pred-mock-notice" role="note">
          <svg className="pred-mock-notice__icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <p className="pred-mock-notice__text">
            <strong>Mock schema active:</strong> CSV columns must match the dataset columns. In mock mode, batch predictions are simulated deterministically.
          </p>
        </aside>
      )}

      {/* Top Banner Errors */}
      {fileError && (
        <ErrorBanner
          title="CSV validation error"
          message={fileError}
        />
      )}

      {uploadError && (
        <ErrorBanner
          title={uploadError.title}
          message={uploadError.message}
          details={uploadError.details}
          onAction={handleClassify}
          actionLabel="Try again"
        />
      )}

      {fileWarning && (
        <div className="pred-warnings-banner" role="region" aria-label="CSV file warning">
          <p className="pred-warnings-banner__item">
            <span className="pred-warnings-banner__icon" aria-hidden="true">ℹ</span> {fileWarning}
          </p>
        </div>
      )}

      {/* Dropzone & File Action Section */}
      <section className="batch-upload__picker-section">
        <div
          className={`batch-dropzone ${isDragOver ? 'is-dragover' : ''} ${selectedFile ? 'has-file' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            id="csv-file-input"
            type="file"
            accept=".csv,text/csv"
            className="batch-dropzone__input"
            onChange={handleFileChange}
            disabled={isUploading}
          />

          {!selectedFile ? (
            <label htmlFor="csv-file-input" className="batch-dropzone__label">
              <div className="batch-dropzone__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <strong className="batch-dropzone__title">Choose a CSV file or drag and drop here</strong>
              <span className="batch-dropzone__sub">
                Supports King County format (.csv) up to {MAX_CSV_MB} MB
              </span>
              <span className="btn btn-outline batch-dropzone__browse-btn">Browse file</span>
            </label>
          ) : (
            <div className="batch-file-chip">
              <div className="batch-file-chip__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="batch-file-chip__meta">
                <strong className="batch-file-chip__name">{selectedFile.name}</strong>
                <span className="batch-file-chip__details">
                  {(selectedFile.size / 1024).toFixed(1)} KB · {fileMeta?.rowCount?.toLocaleString() || 0} data rows detected
                </span>
              </div>
              <button
                type="button"
                className="btn btn-outline batch-file-chip__clear"
                onClick={handleClearFile}
                disabled={isUploading}
                title="Remove selected file"
              >
                Clear file
              </button>
            </div>
          )}
        </div>

        <div className="batch-upload__controls">
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleDownloadTemplate}
            title="Download CSV template containing exact required header names"
          >
            Download CSV template
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleClassify}
            disabled={!selectedFile || isUploading}
            aria-busy={isUploading}
          >
            {isUploading ? (
              <>
                <span className="single-house__spinner" aria-hidden="true" />
                <span>Processing batch…</span>
              </>
            ) : (
              'Classify file'
            )}
          </button>
        </div>
      </section>

      {/* Progress Bar during Batch processing */}
      {isUploading && (
        <div className="batch-progress" role="progressbar" aria-valuetext="Classifying batch rows..." aria-busy="true">
          <div className="batch-progress__bar" />
          <p className="batch-progress__text">Evaluating housing price categories across all rows…</p>
        </div>
      )}

      {/* Batch Results Section */}
      {batchResponse && (
        <section className="batch-results" aria-label="Batch classification results">
          <div className="batch-results__header">
            <div>
              <h3 className="batch-results__title">Batch classification results</h3>
              <p className="batch-results__sub">
                Processed {batchResponse.summary?.rows || allRows.length} rows ({batchResponse.summary?.predicted || (allRows.length - classCounts.error)} classified, {classCounts.error} failed)
              </p>
            </div>

            <div className="batch-results__header-actions">
              {batchResponse.mock && (
                <span className="pred-result-card__mock-pill">Mock response, not a model output</span>
              )}
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleDownloadResults}
              >
                Download results (CSV)
              </button>
            </div>
          </div>

          {/* Class Summary Tiles */}
          <div className="batch-summary-grid">
            <div className="batch-summary-tile">
              <span className="batch-summary-tile__label" style={{ color: 'var(--color-success)' }}>Class 0 · Cheaper</span>
              <strong className="batch-summary-tile__val num">{classCounts[0]}</strong>
            </div>
            <div className="batch-summary-tile">
              <span className="batch-summary-tile__label" style={{ color: 'var(--color-accent)' }}>Class 1 · Reasonable</span>
              <strong className="batch-summary-tile__val num">{classCounts[1]}</strong>
            </div>
            <div className="batch-summary-tile">
              <span className="batch-summary-tile__label" style={{ color: 'var(--color-accent-2)' }}>Class 2 · Over priced</span>
              <strong className="batch-summary-tile__val num">{classCounts[2]}</strong>
            </div>
            <div className="batch-summary-tile">
              <span className="batch-summary-tile__label" style={{ color: 'var(--color-error)' }}>Class 3 · Too over priced</span>
              <strong className="batch-summary-tile__val num">{classCounts[3]}</strong>
            </div>
            {classCounts.error > 0 && (
              <div className="batch-summary-tile batch-summary-tile--error">
                <span className="batch-summary-tile__label">Errors</span>
                <strong className="batch-summary-tile__val num">{classCounts.error}</strong>
              </div>
            )}
          </div>

          {/* Table Filters & Pagination Controls */}
          <div className="batch-table-toolbar">
            <div className="batch-filter">
              <label htmlFor="batch-class-filter" className="batch-filter__label">Filter by class:</label>
              <select
                id="batch-class-filter"
                className="pred-input pred-select batch-filter__select"
                value={classFilter}
                onChange={(e) => {
                  setClassFilter(e.target.value)
                  setCurrentPage(1)
                }}
              >
                <option value="all">All rows ({allRows.length})</option>
                <option value="0">Class 0: Cheaper than average ({classCounts[0]})</option>
                <option value="1">Class 1: Reasonable price ({classCounts[1]})</option>
                <option value="2">Class 2: Over priced ({classCounts[2]})</option>
                <option value="3">Class 3: Too over priced ({classCounts[3]})</option>
                {classCounts.error > 0 && <option value="error">Errors only ({classCounts.error})</option>}
              </select>
            </div>

            <div className="batch-pagination-info">
              <span className="batch-pagination-text">
                Showing {filteredRows.length > 0 ? startIdx + 1 : 0}–{Math.min(startIdx + pageSize, filteredRows.length)} of {filteredRows.length}
              </span>
              <div className="batch-page-size">
                <label htmlFor="batch-page-size-select" className="visually-hidden">Page size</label>
                <select
                  id="batch-page-size-select"
                  className="pred-input pred-select batch-page-size__select"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value))
                    setCurrentPage(1)
                  }}
                >
                  <option value={25}>25 / page</option>
                  <option value={50}>50 / page</option>
                  <option value={100}>100 / page</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div
            className="batch-table-container"
            role="region"
            aria-label="Batch results table"
            tabIndex={0}
          >
            <table className="batch-table">
              <thead>
                <tr>
                  <th scope="col" className="batch-th batch-th--num">#</th>
                  <th scope="col" className="batch-th">Asking price</th>
                  <th scope="col" className="batch-th">Predicted category</th>
                  <th scope="col" className="batch-th">Status</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row, idx) => {
                  const rowNum = row.row || startIdx + idx + 1
                  const isRowError = Boolean(row.error)
                  const priceStr = row.price ? `$${Number(row.price).toLocaleString('en-US')}` : '—'

                  return (
                    <tr key={rowNum} className={isRowError ? 'batch-tr--error' : ''}>
                      <td className="batch-td num batch-td--num">{rowNum}</td>
                      <td className="batch-td num">{priceStr}</td>
                      <td className="batch-td">
                        {!isRowError && row.class_id !== undefined ? (
                          <ClassBadge
                            id={row.class_id}
                            name={row.class_name}
                            size="compact"
                            customLabels={schema?.target_labels}
                          />
                        ) : (
                          <span className="batch-status-error">Error</span>
                        )}
                      </td>
                      <td className="batch-td">
                        {isRowError ? (
                          <span className="batch-td__error-text">
                            <svg className="batch-td__error-icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M8 15A7 7 0 108 1a7 7 0 000 14zm-.75-4.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM8 4a.75.75 0 00-.75.75v4.5a.75.75 0 001.5 0v-4.5A.75.75 0 008 4z" clipRule="evenodd" />
                            </svg>
                            {row.error}
                          </span>
                        ) : (
                          <span className="batch-td__success-text">Classified</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
                {pageRows.length === 0 && (
                  <tr>
                    <td colSpan={4} className="batch-td batch-td--empty">
                      No rows match the selected filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Navigation */}
          {totalPages > 1 && (
            <div className="batch-pagination-nav">
              <button
                type="button"
                className="btn btn-outline"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <span className="batch-pagination-status">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                className="btn btn-outline"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
