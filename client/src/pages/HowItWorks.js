import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  UserPlusIcon, 
  CameraIcon, 
  ChatBubbleLeftRightIcon, 
  GiftIcon,
  ShieldCheckIcon,
  StarIcon,
  ArrowRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const HowItWorks = () => {
  const steps = [
    {
      id: 1,
      title: "Regístrate",
      description: "Crea tu cuenta gratuita en TruequeApp y completa tu perfil con información básica.",
      icon: UserPlusIcon,
      color: "bg-blue-500"
    },
    {
      id: 2,
      title: "Publica tus productos",
      description: "Sube fotos de los productos que quieres intercambiar y describe su estado y características.",
      icon: CameraIcon,
      color: "bg-green-500"
    },
    {
      id: 3,
      title: "Explora y conecta",
      description: "Busca productos que te interesen y contacta con otros usuarios para proponer intercambios.",
      icon: ChatBubbleLeftRightIcon,
      color: "bg-purple-500"
    },
    {
      id: 4,
      title: "Intercambia",
      description: "Acuerda los detalles del intercambio y realiza el trueque de forma segura.",
      icon: GiftIcon,
      color: "bg-orange-500"
    }
  ];

  const benefits = [
    {
      title: "Económico",
      description: "Intercambia sin gastar dinero y dale una segunda vida a tus productos.",
      icon: CheckCircleIcon
    },
    {
      title: "Sostenible",
      description: "Contribuye al medio ambiente reduciendo el desperdicio y promoviendo la reutilización.",
      icon: CheckCircleIcon
    },
    {
      title: "Seguro",
      description: "Sistema de verificación de usuarios y reputación para intercambios confiables.",
      icon: ShieldCheckIcon
    },
    {
      title: "Comunidad",
      description: "Conecta con personas de tu zona y construye una red de intercambio local.",
      icon: StarIcon
    }
  ];

  const tips = [
    "Toma fotos claras y de buena calidad de tus productos",
    "Describe honestamente el estado y características de tus artículos",
    "Responde rápidamente a los mensajes de otros usuarios",
    "Propón intercambios justos y equitativos",
    "Mantén una comunicación respetuosa y amigable",
    "Verifica la identidad del usuario antes de realizar el intercambio",
    "Realiza los intercambios en lugares públicos y seguros"
  ];

  return (
    <>
      <Helmet>
        <title>Cómo Funciona - TruequeApp</title>
        <meta 
          name="description" 
          content="Aprende cómo funciona TruequeApp, la plataforma de intercambio de productos. Guía paso a paso para realizar trueques seguros y exitosos." 
        />
        <meta name="keywords" content="cómo funciona, trueque, intercambio, guía, tutorial" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              ¿Cómo funciona TruequeApp?
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Descubre lo fácil que es intercambiar productos con otros usuarios de forma segura y sostenible.
              Sigue estos simples pasos para comenzar a hacer trueques hoy mismo.
            </p>
          </div>

          {/* Steps */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              4 Pasos Simples
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <div key={step.id} className="relative">
                  <div className="bg-white rounded-lg shadow-lg p-6 text-center h-full">
                    <div className={`${step.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-2 -left-2 bg-gray-900 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                      {step.id}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-600">
                      {step.description}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                      <ArrowRightIcon className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              ¿Por qué elegir TruequeApp?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="bg-white rounded-lg shadow-lg p-6 text-center">
                  <benefit.icon className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Consejos para Intercambios Exitosos
            </h2>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tips.map((tip, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircleIcon className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Safety Section */}
          <div className="mb-20">
            <div className="bg-blue-50 rounded-lg p-8">
              <div className="text-center mb-8">
                <ShieldCheckIcon className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Tu Seguridad es Nuestra Prioridad
                </h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  En TruequeApp implementamos múltiples medidas de seguridad para garantizar 
                  que tus intercambios sean seguros y confiables.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-blue-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <UserPlusIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Verificación de Usuarios</h3>
                  <p className="text-gray-600 text-sm">
                    Todos los usuarios deben verificar su identidad antes de realizar intercambios.
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-blue-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <StarIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Sistema de Reputación</h3>
                  <p className="text-gray-600 text-sm">
                    Califica y revisa a otros usuarios para construir una comunidad confiable.
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-blue-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ChatBubbleLeftRightIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Comunicación Segura</h3>
                  <p className="text-gray-600 text-sm">
                    Sistema de mensajería interno para mantener tus datos personales protegidos.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ¿Listo para comenzar?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Únete a miles de usuarios que ya están intercambiando productos de forma sostenible.
            </p>
            <div className="space-x-4">
              <Link
                to="/register"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
              >
                Registrarse Gratis
              </Link>
              <Link
                to="/publications"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
              >
                Ver Productos
              </Link>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-12">
            <Link
              to="/"
              className="inline-flex items-center text-blue-600 hover:text-blue-500 transition-colors duration-200"
            >
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default HowItWorks;