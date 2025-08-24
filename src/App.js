import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import TwoFactorAuth from './components/TwoFactorAuth';
import ResetPassword from './components/ResetPassword';
import PresidentPage from './components/PresidentPage';
import SecretaryPage from './components/SecretaryPage';
import TreasurerPage from './components/TreasurerPage';
import MemberPage from './components/MemberPage';
import { AuthProvider, useAuth } from './context/AuthContext';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;
  }
  
  return user ? children : <Navigate to="/login" />;
}

// Role-based Protected Route Component
function RoleProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
}

// Public Route Component
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;
  }
  
  return user ? <Navigate to="/dashboard" /> : children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />
            <Route path="/verify-2fa" element={<TwoFactorAuth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            

            
            {/* Role-based Protected Routes */}
            <Route path="/president" element={
              <RoleProtectedRoute allowedRoles={['president']}>
                <PresidentPage />
              </RoleProtectedRoute>
            } />
            
            <Route path="/secretary" element={
              <RoleProtectedRoute allowedRoles={['secretary', 'president']}>
                <SecretaryPage />
              </RoleProtectedRoute>
            } />
            
            <Route path="/treasurer" element={
              <RoleProtectedRoute allowedRoles={['treasurer', 'secretary', 'president']}>
                <TreasurerPage />
              </RoleProtectedRoute>
            } />
            
            <Route path="/member" element={
              <RoleProtectedRoute allowedRoles={['member', 'treasurer', 'secretary', 'president']}>
                <MemberPage />
              </RoleProtectedRoute>
            } />
            
            {/* Default Route */}
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;