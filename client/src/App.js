import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { useDispatch } from 'react-redux';

import { useAuth } from './hooks/useAuth';
import { loadUser, setLoading } from './store/slices/authSlice';
import NotificationProvider from './components/notifications/NotificationProvider';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LoadingSpinner from './components/common/LoadingSpinner';

// Page Components
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';
import Profile from './pages/user/Profile';
import EditProfile from './pages/user/EditProfile';
import Publications from './pages/publications/Publications';
import PublicationDetail from './pages/publications/PublicationDetail';
import CreatePublication from './pages/publications/CreatePublication';
import EditPublication from './pages/publications/EditPublication';
import Messages from './pages/messages/Messages';
import Favorites from './pages/user/Favorites';
import Search from './pages/Search';
import Explore from './pages/Explore';
import UserProfile from './pages/user/UserProfile';
import MyPublications from './pages/user/MyPublications';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Contact from './pages/Contact';
import Unauthorized from './pages/Unauthorized';
import HowItWorks from './pages/HowItWorks';
import NotFound from './pages/NotFound';

// Admin Components
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import PublicationModeration from './pages/admin/PublicationModeration';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return user ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return !user ? children : <Navigate to="/" replace />;
};

// Main App Component
function AppContent() {
  const dispatch = useDispatch();
  const { loading } = useAuth();

  useEffect(() => {
    // Verificar si hay un token y cargar el usuario
    const token = document.cookie.includes('token=');
    if (token) {
      dispatch(loadUser());
    } else {
      // Si no hay token, establecer loading como false
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/publications" element={<Publications />} />
          <Route path="/publications/:id" element={<PublicationDetail />} />
          <Route path="/users/:id" element={<UserProfile />} />
          
          {/* Auth Routes (only for non-authenticated users) */}
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
          <Route path="/forgot-password" element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          } />
          <Route path="/reset-password/:token" element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          } />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          
          {/* Protected Routes */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/profile/edit" element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          } />
          <Route path="/publications/create" element={
            <ProtectedRoute>
              <CreatePublication />
            </ProtectedRoute>
          } />
          <Route path="/publications/:id/edit" element={
            <ProtectedRoute>
              <EditPublication />
            </ProtectedRoute>
          } />
          <Route path="/messages" element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          } />
          <Route path="/favorites" element={
            <ProtectedRoute>
              <Favorites />
            </ProtectedRoute>
          } />
          <Route path="/my-publications" element={
            <ProtectedRoute>
              <MyPublications />
            </ProtectedRoute>
          } />
          
          {/* Static Pages */}
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute>
              <UserManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin/publications" element={
            <ProtectedRoute>
              <PublicationModeration />
            </ProtectedRoute>
          } />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      
      <Footer />
      
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}

// Root App Component with Providers
function App() {
  return (
    <HelmetProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </HelmetProvider>
  );
}

export default App;