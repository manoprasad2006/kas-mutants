import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import DebugInfo from './components/DebugInfo'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import StakingForm from './pages/StakingForm'
import Leaderboard from './pages/Leaderboard'
import Admin from './pages/Admin'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/stake" element={<StakingForm />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
        <DebugInfo />
      </Router>
    </AuthProvider>
  )
}

export default App