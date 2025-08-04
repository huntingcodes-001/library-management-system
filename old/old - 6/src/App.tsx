import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { LandingPage } from './components/LandingPage'
import { Auth } from './components/Auth'
import { StudentDashboard } from './components/student/StudentDashboard'
import { AdminDashboard } from './components/admin/AdminDashboard'

const AppContent: React.FC = () => {
  const [showAuth, setShowAuth] = useState(false)
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // If user is logged in, redirect to appropriate dashboard
  if (user) {
    return user.role === 'admin' ? <AdminDashboard /> : <StudentDashboard />
  }

  // If auth modal is shown, show auth component
  if (showAuth) {
    return <Auth onBack={() => setShowAuth(false)} />
  }

  // Otherwise show landing page
  return <LandingPage onLoginClick={() => setShowAuth(true)} />
}

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <AppContent />
      </div>
    </AuthProvider>
  )
}

export default App