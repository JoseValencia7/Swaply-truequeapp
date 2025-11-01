import React from 'react';
import { Link } from 'react-router-dom';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Política de Privacidad
          </h1>
          
          <div className="prose max-w-none">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              1. Información que Recopilamos
            </h2>
            <p className="text-gray-600 mb-6">
              Recopilamos información que usted nos proporciona directamente, como cuando crea una cuenta, publica un producto o se comunica con otros usuarios.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              2. Cómo Utilizamos su Información
            </h2>
            <ul className="list-disc list-inside text-gray-600 mb-6">
              <li>Proporcionar y mantener nuestros servicios</li>
              <li>Procesar transacciones e intercambios</li>
              <li>Comunicarnos con usted sobre su cuenta</li>
              <li>Mejorar nuestros servicios</li>
              <li>Cumplir con obligaciones legales</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              3. Compartir Información
            </h2>
            <p className="text-gray-600 mb-6">
              No vendemos, intercambiamos ni transferimos su información personal a terceros sin su consentimiento, excepto en los casos descritos en esta política.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              4. Seguridad de los Datos
            </h2>
            <p className="text-gray-600 mb-6">
              Implementamos medidas de seguridad apropiadas para proteger su información personal contra acceso no autorizado, alteración, divulgación o destrucción.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              5. Cookies y Tecnologías Similares
            </h2>
            <p className="text-gray-600 mb-6">
              Utilizamos cookies y tecnologías similares para mejorar su experiencia en nuestra plataforma y analizar el uso del sitio.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              6. Sus Derechos
            </h2>
            <ul className="list-disc list-inside text-gray-600 mb-6">
              <li>Acceder a su información personal</li>
              <li>Corregir información inexacta</li>
              <li>Solicitar la eliminación de su información</li>
              <li>Oponerse al procesamiento de su información</li>
              <li>Portabilidad de datos</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              7. Retención de Datos
            </h2>
            <p className="text-gray-600 mb-6">
              Conservamos su información personal durante el tiempo necesario para cumplir con los propósitos descritos en esta política.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              8. Cambios a esta Política
            </h2>
            <p className="text-gray-600 mb-6">
              Podemos actualizar esta política de privacidad ocasionalmente. Le notificaremos sobre cambios significativos.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              9. Contacto
            </h2>
            <p className="text-gray-600 mb-6">
              Si tiene preguntas sobre esta política de privacidad, puede contactarnos a través de nuestra página de contacto.
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

export default Privacy;