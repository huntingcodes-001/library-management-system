import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LandingPage from './components/LandingPage'
import { Auth } from './components/Auth'
import { StudentDashboard } from './components/student/StudentDashboard'
import { AdminDashboard } from './components/admin/AdminDashboard'

const AppContent: React.FC = () => {
  const [showAuth, setShowAuth] = useState(false)
  const [currentView, setCurrentView] = useState<'home' | 'dashboard'>('home')
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If user is logged in, redirect to appropriate dashboard
  if (user) {
    const handleHomeClick = () => setCurrentView('home')
    const handleDashboardClick = () => setCurrentView('dashboard')

    if (user.role === 'admin') {
      if (currentView === 'home') {
        return (
          <Layout 
            title="Home" 
            showNavigation={true} 
            onHomeClick={handleHomeClick}
            onDashboardClick={handleDashboardClick}
          >
            <LandingPage onLoginClick={() => {}} />
          </Layout>
        )
      }
      return (
        <Layout 
          title="Admin Dashboard" 
          showNavigation={true} 
          onHomeClick={handleHomeClick}
          onDashboardClick={handleDashboardClick}
        >
          <AdminDashboard />
        </Layout>
      )
    } else {
      if (currentView === 'home') {
        return (
          <Layout 
            title="Home" 
            showNavigation={true} 
            onHomeClick={handleHomeClick}
            onDashboardClick={handleDashboardClick}
          >
            <LandingPage onLoginClick={() => {}} />
          </Layout>
        )
      }
      return (
        <Layout 
          title="Student Dashboard" 
          showNavigation={true} 
          onHomeClick={handleHomeClick}
          onDashboardClick={handleDashboardClick}
        >
          <StudentDashboard />
        </Layout>
      )
    }
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