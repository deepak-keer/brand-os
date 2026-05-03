import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import useAuthStore from './store/authStore'

import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Calendar from './pages/Calendar'
import Posts from './pages/Posts'
import Ideas from './pages/Ideas'
import Deals from './pages/Deals'
import Analytics from './pages/Analytics'
import Income from './pages/Income'
import AIStudio from './pages/AIStudio'
import Settings from './pages/Settings'
import { Spinner } from './components/ui'

function AuthGate({ children }) {
  const isAuthReady = useAuthStore(s => s.isAuthReady)
  return isAuthReady ? children : (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#070709' }}>
      <Spinner />
    </div>
  )
}

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  const fetchMe = useAuthStore(s => s.fetchMe)
  useEffect(() => { fetchMe() }, [fetchMe])

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{
        style: { background: '#1a1a24', color: '#e8e8f0', border: '1px solid #2a2a35', borderRadius: '12px', fontSize: '13px', fontFamily: 'DM Sans, sans-serif' },
        success: { iconTheme: { primary: '#4ade80', secondary: '#1a1a24' } },
        error: { iconTheme: { primary: '#f87171', secondary: '#1a1a24' } },
      }} />
      <AuthGate>
        <Routes>
          {/* Public only */}
          <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route path="/reset-password/:token" element={<PublicRoute><ResetPassword /></PublicRoute>} />

          {/* Protected app */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/posts" element={<Posts />} />
            <Route path="/ideas" element={<Ideas />} />
            <Route path="/deals" element={<Deals />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/income" element={<Income />} />
            <Route path="/ai" element={<AIStudio />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthGate>
    </BrowserRouter>
  )
}
