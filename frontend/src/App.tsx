import { Routes, Route, Outlet } from 'react-router-dom'
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
const Research = lazy(() => import('./pages/Research'))

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={
          <Suspense fallback={<LoadingSpinner />}>
            <Dashboard />
          </Suspense>
        } />
        <Route path="markets" element={
          <Suspense fallback={<LoadingSpinner />}>
            <Markets />
          </Suspense>
        } />
        <Route path="predictions" element={
          <Suspense fallback={<LoadingSpinner />}>
            <Predictions />
          </Suspense>
        } />
        <Route path="technical" element={
          <Suspense fallback={<LoadingSpinner />}>
            <TechnicalAnalysis />
          </Suspense>
        } />
        <Route path="backtesting" element={
          <Suspense fallback={<LoadingSpinner />}>
            <Backtesting />
          </Suspense>
        } />
        <Route path="portfolio" element={
          <Suspense fallback={<LoadingSpinner />}>
            <Portfolio />
          </Suspense>
        } />
        <Route path="settings" element={
          <Suspense fallback={<LoadingSpinner />}>
            <Settings />
          </Suspense>
        } />
        <Route path="research" element={
          <Suspense fallback={<LoadingSpinner />}>
            <Research />
          </Suspense>
        } />
      </Route>
    </Routes>
  )
}

export default App
