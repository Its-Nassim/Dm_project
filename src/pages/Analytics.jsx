import { Link } from 'react-router-dom'
import './Analytics.css'

/* ── Icons ── */
const IconDownload = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
)

const IconTrend = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
    <polyline points="16 7 22 7 22 13"/>
  </svg>
)

const IconExpand = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
    <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
  </svg>
)

const IconFilter = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
)

const IconInfo = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="16" x2="12" y2="12"/>
    <line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
)

const IconArrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
)

const IconGrid = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
)

/* ── Area Chart (SVG) ── */
const AreaChart = () => {
  const width = 520, height = 200
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const prices = [410,430,440,445,475,510,530,555,570,590,605,620]
  const maxP = 700, minP = 0
  const pts = prices.map((v, i) => {
    const x = (i / (prices.length - 1)) * width
    const y = height - ((v - minP) / (maxP - minP)) * height
    return `${x},${y}`
  })
  const polyline = pts.join(' ')
  const area = `0,${height} ${polyline} ${width},${height}`

  return (
    <svg viewBox={`0 0 ${width} ${height + 30}`} preserveAspectRatio="none" className="area-chart-svg">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00b4ff" stopOpacity="0.35"/>
          <stop offset="100%" stopColor="#00b4ff" stopOpacity="0.02"/>
        </linearGradient>
      </defs>
      {[0,200,400,600,800].map(v => {
        const y = height - ((v - minP) / (maxP - minP)) * height
        return (
          <g key={v}>
            <line x1="0" y1={y} x2={width} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
            <text x="-4" y={y + 4} fontSize="10" fill="rgba(148,163,184,0.7)" textAnchor="end">
              {v === 0 ? '$0k' : `$${v/1000 >= 1 ? v/1000 + '00k' : v+'k'}`}
            </text>
          </g>
        )
      })}
      <polygon points={area} fill="url(#areaGrad)"/>
      <polyline points={polyline} fill="none" stroke="#00b4ff" strokeWidth="2.5"/>
      {months.map((m, i) => {
        const x = (i / (months.length - 1)) * width
        return (
          <text key={m} x={x} y={height + 20} fontSize="10" fill="rgba(148,163,184,0.7)" textAnchor="middle">{m}</text>
        )
      })}
    </svg>
  )
}

/* ── Bar Chart ── */
const BarChart = () => {
  const rows = [
    { label: '200k-400k', value: 0.28 },
    { label: '400k-600k', value: 0.95 },
    { label: '600k-800k', value: 0.65 },
    { label: '800k-1M',   value: 0.45 },
    { label: '1M-1.5M',   value: 0.22 },
    { label: '1.5M+',     value: 0.09 },
  ]
  return (
    <div className="bar-chart">
      {rows.map(r => (
        <div key={r.label} className="bar-chart__row">
          <span className="bar-chart__label">{r.label}</span>
          <div className="bar-chart__track">
            <div className="bar-chart__bar" style={{ width: `${r.value * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Scatter Chart ── */
const ScatterChart = () => {
  const pts = [
    [50,85],[120,95],[160,115],[210,145],[280,180],[330,210],[390,245],
    [450,290],[500,330],[560,380],[620,430],[680,480],[740,530],[800,590],
    [860,640],[920,700],[980,760],[1040,820],[1100,890],[1160,960],
  ]
  const w = 400, h = 180, padL = 60, padB = 30
  const maxX = 6000, maxY = 2200000
  return (
    <svg viewBox={`0 0 ${w + padL + 10} ${h + padB + 10}`} className="scatter-svg">
      {[0,500000,1000000,1500000,2000000].map(v => {
        const y = padB + h - (v / maxY) * h
        const label = v === 0 ? '$0M' : `$${v/1000000}M`
        return (
          <g key={v}>
            <line x1={padL} y1={y} x2={padL + w} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
            <text x={padL - 5} y={y + 4} fontSize="9" fill="rgba(148,163,184,0.7)" textAnchor="end">{label}</text>
          </g>
        )
      })}
      {[0,1500,3000,4500,6000].map(v => {
        const x = padL + (v / maxX) * w
        return (
          <text key={v} x={x} y={h + padB + 8} fontSize="9" fill="rgba(148,163,184,0.7)" textAnchor="middle">{v === 0 ? '0sqft' : `${v}sqft`}</text>
        )
      })}
      {pts.map(([sx, sy], i) => {
        const cx = padL + (sx / 1160) * w
        const cy = padB + h - (sy / 960) * h
        return <circle key={i} cx={cx} cy={cy} r="5" fill="#00b4ff" fillOpacity="0.7"/>
      })}
    </svg>
  )
}

/* ── Correlation Matrix ── */
const corrData = {
  rows: ['Price','Bedrooms','Bathrooms','Sqft Living','Floors','Condition','Grade'],
  cols: ['BED','BATH','AREA','FLOOR','COND','GRADE'],
  values: [
    [0.31, 0.53, 0.70, 0.26, 0.04, 0.67],
    [1.00, 0.52, 0.58, 0.18, 0.03, 0.36],
    [0.52, 1.00, 0.75, 0.50,-0.12, 0.66],
    [0.58, 0.75, 1.00, 0.35,-0.06, 0.76],
    [0.18, 0.50, 0.35, 1.00,-0.26, 0.46],
    [0.03,-0.12,-0.06,-0.26, 1.00,-0.14],
    [0.36, 0.66, 0.76, 0.46,-0.14, 1.00],
  ]
}

const getCorrelColor = v => {
  if (v >= 0.9) return '#0ea5e9'
  if (v >= 0.6) return '#2563eb'
  if (v >= 0.4) return '#1d4ed8'
  if (v >= 0.2) return '#1e3a5f'
  if (v >= 0)   return '#172035'
  if (v >= -0.1) return '#3d1515'
  return '#6b1a1a'
}

const CorrelMatrix = () => (
  <div className="correl-matrix">
    <div className="correl-matrix__header">
      {corrData.cols.map(c => (
        <span key={c} className="correl-matrix__col-label">{c}</span>
      ))}
    </div>
    {corrData.rows.map((row, ri) => (
      <div key={row} className="correl-matrix__row">
        <span className="correl-matrix__row-label">{row}</span>
        {corrData.values[ri].map((v, ci) => (
          <div
            key={ci}
            className="correl-matrix__cell"
            style={{ background: getCorrelColor(v) }}
          >
            <span className={v >= 0.5 ? 'correl-matrix__val correl-matrix__val--light' : 'correl-matrix__val'}>
              {v.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    ))}
    <div className="correl-matrix__legend">
      <span className="correl-matrix__legend-item correl-matrix__legend-neg">● Negative Impact</span>
      <span className="correl-matrix__legend-item correl-matrix__legend-pos">● Positive Impact</span>
      <span className="correl-matrix__legend-date">Data updated as of 21/09/2026</span>
    </div>
  </div>
)

const Analytics = () => (
  <div className="analytics">
    {/* ── Hero ── */}
    <section className="analytics-hero">
      <div className="analytics-hero__bg" />
      <div className="container">
        <div className="analytics-hero__content">
          <div className="analytics-hero__left">
            <span className="badge">Market Intelligence</span>
            <h1 className="analytics-hero__title">
              Property <span className="analytics-hero__accent">Analytics</span>
            </h1>
            <p className="analytics-hero__desc">
              Deep-dive into the King County real estate landscape. Our AI models analyze millions of data points to reveal correlations, trends, and future value trajectories.
            </p>
            <div className="analytics-hero__buttons">
              <button className="btn-primary"><IconDownload /> Generate Report</button>
              <button className="btn-outline"><IconTrend /> Market Trends</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* ── KPI Cards ── */}
    <section className="analytics-kpi">
      <div className="container">
        <div className="analytics-kpi__grid">
          {[
            { label: 'MEDIAN SALE PRICE',   value: '$735,000',   change: '+12.4%', up: true },
            { label: 'INVENTORY GROWTH',    value: '2,412 units', change: '+3.2%', up: true },
            { label: 'AVERAGE DAYS ON MARKET', value: '18 Days',    change: '5.1%',  up: false },
            { label: 'AI CONFIDENCE INDEX', value: '94.2%',       change: '+0.8%', up: true },
          ].map(kpi => (
            <div key={kpi.label} className="kpi-card">
              <div className="kpi-card__top">
                <span className={`kpi-card__change ${kpi.up ? 'kpi-card__change--up' : 'kpi-card__change--down'}`}>
                  {kpi.change}
                </span>
              </div>
              <p className="kpi-card__label">{kpi.label}</p>
              <p className="kpi-card__value">{kpi.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── Charts Row 1 ── */}
    <section className="analytics-charts">
      <div className="container">
        <div className="analytics-charts__row">
          {/* Area Chart */}
          <div className="chart-card chart-card--wide">
            <div className="chart-card__header">
              <div>
                <h3 className="chart-card__title">Market Price Appreciation</h3>
                <p className="chart-card__sub">Year-over-year median house price and sales volume</p>
              </div>
              <div className="chart-card__actions">
                <button className="chart-icon-btn"><IconExpand /></button>
                <button className="chart-icon-btn"><IconExpand /></button>
              </div>
            </div>
            <div className="chart-card__body">
              <AreaChart />
              <div className="chart-card__legend">
                <span className="chart-legend-item chart-legend-item--blue">Median Price</span>
                <span className="chart-legend-item chart-legend-item--dark">Sales Volume</span>
              </div>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="chart-card">
            <div className="chart-card__header">
              <div>
                <h3 className="chart-card__title">Price Distribution</h3>
                <p className="chart-card__sub">Frequency of properties by value bracket</p>
              </div>
            </div>
            <div className="chart-card__body">
              <BarChart />
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="analytics-charts__row" style={{marginTop:'var(--sp-6)'}}>
          {/* Scatter */}
          <div className="chart-card chart-card--wide">
            <div className="chart-card__header">
              <div>
                <h3 className="chart-card__title">Space vs. Valuation <IconInfo /></h3>
                <p className="chart-card__sub">Correlation between living area size and final price by building grade</p>
              </div>
            </div>
            <div className="chart-card__body">
              <ScatterChart />
            </div>
          </div>

          {/* Correlation Matrix */}
          <div className="chart-card">
            <div className="chart-card__header">
              <div>
                <h3 className="chart-card__title">Feature Correlation Matrix</h3>
                <p className="chart-card__sub">Impact of specific attributes on target home value</p>
              </div>
              <a href="#" className="chart-card__link">Detailed Heatmap ↗</a>
            </div>
            <div className="chart-card__body">
              <CorrelMatrix />
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* ── CTA ── */}
    <section className="analytics-cta">
      <div className="container">
        <div className="analytics-cta__box">
          <div className="analytics-cta__left">
            <h3 className="analytics-cta__title">Ready to value your property?</h3>
            <p className="analytics-cta__desc">
              Use our advanced prediction engine to get a high-accuracy estimate based on current market trends and property features.
            </p>
          </div>
          <div className="analytics-cta__right">
            <Link to="/prediction" className="btn-primary">Start Prediction</Link>
            <button className="chart-icon-btn"><IconFilter /></button>
          </div>
        </div>
      </div>
    </section>
  </div>
)

export default Analytics
