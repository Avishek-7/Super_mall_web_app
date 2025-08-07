import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import { IndexPage } from './pages/index';
import { LoginPage } from './pages/login';
import { RegisterPage } from './pages/register';
import { DashboardPage } from './pages/dashboard';
import { ComparePage } from './pages/compare';
import { AdminPage } from './pages/admin';
import { MyShopPage } from './pages/my-shop';
import { AccessDenied } from './components/AccessDenied';

// Business Route Component (for shop management access)
const BusinessRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, userProfile, loading } = useAuth();

  // Show loading while auth is loading OR user exists but profile is not loaded yet
  if (loading || (user && !userProfile)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Allow access to shop management for users who have business information (shop owners)
  // but are not admins (shop owners are regular customers)
  const hasBusiness = userProfile?.businessName && userProfile?.businessType;
  const isNotAdmin = userProfile?.role !== 'admin';
  
  if (!hasBusiness || !isNotAdmin) {
    return <AccessDenied />;
  }

  return <>{children}</>;
};

// Admin Route Component (for dashboard and admin panel access)
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, userProfile, loading } = useAuth();

  // Show loading while auth is loading OR user exists but profile is not loaded yet
  if (loading || (user && !userProfile)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Only allow access to admin features for admin users
  const isAdmin = userProfile?.role === 'admin';
  
  if (!isAdmin) {
    return <AccessDenied />;
  }

  return <>{children}</>;
};

// Public Route Component (redirect to appropriate page if already logged in)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user) {
    // Redirect based on user type:
    // - Admins go to dashboard 
    // - Regular customers (including shop owners) go to home
    const isAdmin = userProfile?.role === 'admin';
    
    if (isAdmin) {
      return <Navigate to="/dashboard" />;
    } else {
      return <Navigate to="/" />;
    }
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<IndexPage />} />
            <Route path="/compare" element={<ComparePage />} />
            
            {/* Auth Routes - redirect if already logged in */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              }
            />

            {/* Protected Routes - require authentication and specific access */}
            <Route
              path="/dashboard"
              element={
                <AdminRoute>
                  <DashboardPage />
                </AdminRoute>
              }
            />
            <Route
              path="/my-shop"
              element={
                <BusinessRoute>
                  <MyShopPage />
                </BusinessRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminPage />
                </AdminRoute>
              }
            />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
