import './styles/global.css'
import './styles/responsive.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import About from './pages/About'
import Analytics from './pages/Analytics'
import Model from './pages/Model'
import PredictionForm from './pages/PredictionForm'
import PredictionResult from './pages/PredictionResult'

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <main className="main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/model" element={<Model />} />
            <Route path="/prediction" element={<PredictionForm />} />
            <Route path="/prediction/result" element={<PredictionResult />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
