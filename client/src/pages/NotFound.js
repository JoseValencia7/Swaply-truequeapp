import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300">404</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Página no encontrada
          </h2>
          <p className="text-gray-600 mb-8">
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            to="/"
            className="btn-primary inline-block"
          >
            Volver al inicio
          </Link>
          
          <div className="text-sm text-gray-500">
            <Link to="/publications" className="text-blue-600 hover:underline">
              Ver publicaciones
            </Link>
            {' · '}
            <Link to="/contact" className="text-blue-600 hover:underline">
              Contacto
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;