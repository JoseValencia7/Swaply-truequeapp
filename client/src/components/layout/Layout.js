import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import Toast from '../common/Toast';
import LoadingSpinner from '../common/LoadingSpinner';
import { useSelector } from 'react-redux';

/**
 * Componente de layout principal de la aplicación
 * Proporciona la estructura base con navegación, contenido y pie de página
 */
const Layout = () => {
  const { isLoading } = useSelector(state => state.auth);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navegación principal */}
      <Navbar />
      
      {/* Contenido principal */}
      <main className="flex-1">
        <Outlet />
      </main>
      
      {/* Pie de página */}
      <Footer />
      
      {/* Componentes globales */}
      <Toast />
      
      {/* Loading spinner global */}
      {isLoading && <LoadingSpinner overlay />}
    </div>
  );
};

export default Layout;