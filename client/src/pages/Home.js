import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Home = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              Bienvenido a Swaply
            </h1>
            <p className="text-xl mb-8 opacity-90">
              La plataforma de intercambio de productos más fácil y segura. 
              Intercambia lo que no usas por lo que necesitas.
            </p>
            
            {!user ? (
              <div className="space-x-4">
                <Link
                  to="/register"
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Comenzar ahora
                </Link>
                <Link
                  to="/login"
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                >
                  Iniciar sesión
                </Link>
              </div>
            ) : (
              <div className="space-x-4">
                <Link
                  to="/publications"
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Ver publicaciones
                </Link>
                <Link
                  to="/publications/create"
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                >
                  Publicar producto
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              ¿Por qué elegir Swaply?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Ofrecemos una experiencia de intercambio segura, fácil y confiable
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-shield-alt text-blue-600 text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">Seguro</h3>
              <p className="text-gray-600">
                Sistema de verificación de usuarios y valoraciones para garantizar intercambios seguros
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-leaf text-green-600 text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">Sostenible</h3>
              <p className="text-gray-600">
                Contribuye al medio ambiente dando una segunda vida a los productos
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-users text-purple-600 text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">Comunidad</h3>
              <p className="text-gray-600">
                Únete a una comunidad de personas que comparten tus valores
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-100 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            ¿Listo para comenzar?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Únete a miles de usuarios que ya están intercambiando productos de forma segura y sostenible
          </p>
          
          {!user && (
            <Link
              to="/register"
              className="btn-primary"
            >
              Crear cuenta gratis
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;