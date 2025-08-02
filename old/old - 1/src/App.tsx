import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import { Navigation } from './components/Navigation';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { BooksPage } from './pages/student/BooksPage';
import { ReviewsPage } from './pages/student/ReviewsPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { RequestsPage } from './pages/admin/RequestsPage';
import { InventoryPage } from './pages/admin/InventoryPage';
import { ReviewsManagementPage } from './pages/admin/ReviewsManagementPage';
import { HistoryPage } from './pages/admin/HistoryPage';

function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: 'admin' | 'student' }) {
  const { state } = useAppContext();
  
  if (!state.currentUser) {
    return <Navigate to="/login" />;
  }
  
  if (role && state.currentUser.role !== role) {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
}

function AppContent() {
  const { state } = useAppContext();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        {/* Student Routes */}
        <Route path="/student" element={
          <ProtectedRoute role="student">
            <StudentDashboard />
          </ProtectedRoute>
        } />
        <Route path="/student/books" element={
          <ProtectedRoute role="student">
            <BooksPage />
          </ProtectedRoute>
        } />
        <Route path="/student/reviews" element={
          <ProtectedRoute role="student">
            <ReviewsPage />
          </ProtectedRoute>
        } />
        
        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/requests" element={
          <ProtectedRoute role="admin">
            <RequestsPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/inventory" element={
          <ProtectedRoute role="admin">
            <InventoryPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/reviews" element={
          <ProtectedRoute role="admin">
            <ReviewsManagementPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/history" element={
          <ProtectedRoute role="admin">
            <HistoryPage />
          </ProtectedRoute>
        } />
        
        {/* Redirect based on user role */}
        {state.currentUser && (
          <Route path="*" element={
            <Navigate to={state.currentUser.role === 'admin' ? '/admin' : '/student'} />
          } />
        )}
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
}

export default App;