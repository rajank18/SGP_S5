import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'

// expected localStorage keys:
// - prograde_token: JWT
// - prograde_role: 'admin' | 'faculty' | 'student'

const ProtectedRoute = ({ allowRoles = [] }) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('prograde_token') : null
  const role = typeof window !== 'undefined' ? localStorage.getItem('prograde_role') : null

  const isAuthenticated = Boolean(token)
  const isAllowed = allowRoles.length === 0 || (role && allowRoles.includes(role))

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />
  }
  if (!isAllowed) {
    // redirect to login or a not-authorized page; using login for now
    return <Navigate to="/auth/login" replace />
  }
  return <Outlet />
}

export default ProtectedRoute



