import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import Layout from './components/Layout'
import LoadingSpinner from './components/ui/LoadingSpinner'

// Lazy loading for better performance
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Markets = lazy(() => import('./pages/Markets'))
const Predictions = lazy(() => import('./pages/Predictions'))
const TechnicalAnalysis = lazy(() => import('./pages/TechnicalAnalysis'))
const Backtesting = lazy(() => import('./pages/Backtesting'))
const Portfolio = lazy(() => import('./pages/Portfolio'))
const Settings = lazy(() => import('./pages/Settings'))

function App() {
  return (
    <Layout>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/markets" element={<Markets />} />
          <Route path="/predictions" element={<Predictions />} />
          <Route path="/technical" element={<TechnicalAnalysis />} />
          <Route path="/backtesting" element={<Backtesting />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}

export default App
