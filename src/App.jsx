import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import PredictionForm from './pages/PredictionForm.jsx'
import PredictionResult from './pages/PredictionResult.jsx'
import Model from './pages/Model.jsx'
import Analytics from './pages/Analytics.jsx'
import About from './pages/About.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <div className="page-shell">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/prediction" element={<PredictionForm />} />
            <Route path="/prediction/result" element={<PredictionResult />} />
            <Route path="/model" element={<Model />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
