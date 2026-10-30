import { useSearchParams } from 'react-router-dom'
import Tabs from '../components/Tabs.jsx'
import SingleHouse from './SingleHouse.jsx'
import BatchUpload from './BatchUpload.jsx'
import './PredictionForm.css'

const WORKBENCH_TABS = [
  { id: 'single', label: 'Single house' },
  { id: 'csv', label: 'Upload CSV' },
]

export default function PredictionForm() {
  const [searchParams, setSearchParams] = useSearchParams()
  const rawMode = searchParams.get('mode')
  const activeMode = rawMode === 'csv' ? 'csv' : 'single'

  const handleModeChange = (newMode) => {
    setSearchParams({ mode: newMode }, { replace: true })
  }

  return (
    <div className="pred-workbench">
      <div className="container pred-workbench__container">
        {/* Header */}
        <header className="pred-workbench__header">
          <div className="pred-workbench__header-left">
            <div className="pred-workbench__eyebrow">
              <span className="pred-workbench__pill-tag">King County · Decision Tree classifier</span>
            </div>
            <h1 className="pred-workbench__title">Classify an asking price</h1>
            <p className="pred-workbench__subtitle">
              Check whether a house&apos;s asking price is attractive or too expensive relative to comparable houses.
            </p>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="pred-workbench__tabs-row">
          <Tabs
            tabs={WORKBENCH_TABS}
            activeId={activeMode}
            onChange={handleModeChange}
            ariaLabel="Classification mode tabs"
          />
        </div>

        {/* Tab Panes */}
        <div className="pred-workbench__content" id={`panel-${activeMode}`} role="tabpanel" aria-labelledby={`tab-${activeMode}`}>
          {activeMode === 'single' ? <SingleHouse /> : <BatchUpload />}
        </div>
      </div>
    </div>
  )
}
