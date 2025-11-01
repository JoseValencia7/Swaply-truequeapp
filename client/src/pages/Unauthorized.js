import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ExclamationTriangleIcon,
  HomeIcon,
  ArrowLeftIcon 
} from '@heroicons/react/24/outline';

const Unauthorized = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <ExclamationTriangleIcon className="mx-auto h-16 w-16 text-red-500 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Acceso Denegado
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              No tienes permisos para acceder a esta página.
            </p>
            <p className="text-sm text-gray-500 mb-8">
              Si crees que esto es un error, por favor contacta al administrador del sistema.
            </p>
          </div>

          <div className="space-y-4">
            <Link
              to="/"
              className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <HomeIcon className="h-5 w-5 mr-2" />
              Ir al Inicio
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Volver Atrás
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                ¿Necesitas ayuda?
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Si continúas teniendo problemas de acceso, puedes:
              </p>
              <div className="space-y-2">
                <Link
                  to="/contact"
                  className="block text-sm text-blue-600 hover:text-blue-500"
                >
                  Contactar Soporte
                </Link>
                <Link
                  to="/login"
                  className="block text-sm text-blue-600 hover:text-blue-500"
                >
                  Iniciar Sesión
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;