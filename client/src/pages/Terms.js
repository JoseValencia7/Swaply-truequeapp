import React from 'react';
import { Link } from 'react-router-dom';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Términos y Condiciones
          </h1>
          
          <div className="prose max-w-none">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              1. Aceptación de los Términos
            </h2>
            <p className="text-gray-600 mb-6">
              Al acceder y utilizar Swaply, usted acepta estar sujeto a estos términos y condiciones de uso.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              2. Descripción del Servicio
            </h2>
            <p className="text-gray-600 mb-6">
              Swaply es una plataforma de intercambio de productos que permite a los usuarios publicar, buscar e intercambiar artículos.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              3. Responsabilidades del Usuario
            </h2>
            <ul className="list-disc list-inside text-gray-600 mb-6">
              <li>Proporcionar información veraz y actualizada</li>
              <li>Mantener la confidencialidad de su cuenta</li>
              <li>No publicar contenido ofensivo o ilegal</li>
              <li>Respetar los derechos de otros usuarios</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              4. Política de Intercambios
            </h2>
            <p className="text-gray-600 mb-6">
              Los intercambios se realizan directamente entre usuarios. Swaply no se hace responsable por la calidad o condición de los productos intercambiados.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              5. Limitación de Responsabilidad
            </h2>
            <p className="text-gray-600 mb-6">
              Swaply no será responsable por daños directos, indirectos, incidentales o consecuentes que resulten del uso de la plataforma.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              6. Modificaciones
            </h2>
            <p className="text-gray-600 mb-6">
              Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios serán efectivos inmediatamente después de su publicación.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              7. Contacto
            </h2>
            <p className="text-gray-600 mb-6">
              Si tiene preguntas sobre estos términos, puede contactarnos a través de nuestra página de contacto.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <Link 
              to="/" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Volver al Inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;