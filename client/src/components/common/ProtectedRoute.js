import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoadingSpinner from './LoadingSpinner';

/**
 * Componente ProtectedRoute para proteger rutas que requieren autenticación
 * Redirige a login si el usuario no está autenticado
 */
const ProtectedRoute = ({ 
  children, 
  requireAuth = true, 
  requireAdmin = false, 
  requireModerator = false,
  redirectTo = '/login' 
}) => {
  const location = useLocation();
  const { user, isAuthenticated, isLoading } = useSelector(state => state.auth);

  // Mostrar spinner mientras se verifica la autenticación
  if (isLoading) {
    return <LoadingSpinner overlay text="Verificando autenticación..." />;
  }

  // Si requiere autenticación y no está autenticado
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Si no requiere autenticación pero está autenticado (ej: páginas de login/register)
  if (!requireAuth && isAuthenticated) {
    const from = location.state?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  // Verificar roles específicos
  if (isAuthenticated && user) {
    // Verificar si requiere admin
    if (requireAdmin && user.role !== 'admin') {
      return <Navigate to="/unauthorized" replace />;
    }

    // Verificar si requiere moderador o admin
    if (requireModerator && !['admin', 'moderator'].includes(user.role)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

/**
 * Componente para rutas que requieren rol de administrador
 */
export const AdminRoute = ({ children }) => {
  return (
    <ProtectedRoute requireAuth={true} requireAdmin={true}>
      {children}
    </ProtectedRoute>
  );
};

/**
 * Componente para rutas que requieren rol de moderador o admin
 */
export const ModeratorRoute = ({ children }) => {
  return (
    <ProtectedRoute requireAuth={true} requireModerator={true}>
      {children}
    </ProtectedRoute>
  );
};

/**
 * Componente para rutas públicas (solo para usuarios no autenticados)
 * Útil para páginas de login/register
 */
export const PublicRoute = ({ children }) => {
  return (
    <ProtectedRoute requireAuth={false}>
      {children}
    </ProtectedRoute>
  );
};

/**
 * Componente para rutas que requieren verificación de email
 */
export const VerifiedRoute = ({ children }) => {
  const { user, isAuthenticated } = useSelector(state => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && !user.isEmailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return children;
};

export default ProtectedRoute;