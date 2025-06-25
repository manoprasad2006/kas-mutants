import React, { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from './LoadingSpinner'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, error } = useAuth()

  useEffect(() => {
    console.log('ProtectedRoute - Loading:', loading, 'User:', user?.email, 'Error:', error)
  }, [loading, user, error])

  if (loading) {
    return <LoadingSpinner message="Checking authentication..." timeout={15000} error={error} />
  }

  if (!user) {
    console.log('ProtectedRoute - No user, redirecting to login')
    return <Navigate to="/" replace />
  }

  console.log('ProtectedRoute - User authenticated, rendering children')
  return <>{children}</>
}

export default ProtectedRoute