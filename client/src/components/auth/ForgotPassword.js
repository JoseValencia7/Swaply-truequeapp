import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  EnvelopeIcon, 
  ArrowLeftIcon,
  ExclamationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { forgotPassword, clearError } from '../../store/slices/authSlice';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * Componente para recuperación de contraseña
 * Permite a los usuarios solicitar un enlace de restablecimiento de contraseña
 */
const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { isLoading, error, isAuthenticated } = useSelector(state => state.auth);

  // Redireccionar si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Limpiar errores al desmontar
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Validación del email
  const validateEmail = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'El correo electrónico no es válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en el email
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    
    // Limpiar error cuando el usuario empiece a escribir
    if (errors.email) {
      setErrors({});
    }
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmail()) {
      return;
    }

    try {
      await dispatch(forgotPassword({ email })).unwrap();
      setIsSubmitted(true);
    } catch (error) {
      // El error se maneja en el slice
      console.error('Error al solicitar recuperación:', error);
    }
  };

  // Reenviar email
  const handleResendEmail = async () => {
    try {
      await dispatch(forgotPassword({ email })).unwrap();
    } catch (error) {
      console.error('Error al reenviar email:', error);
    }
  };

  // Si ya se envió el email, mostrar mensaje de confirmación
  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <Link to="/" className="flex items-center justify-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">Swaply</span>
            </Link>
            
            <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="w-8 h-8 text-success-600" />
            </div>
            
            <h2 className="text-3xl font-extrabold text-gray-900">
              Email enviado
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Hemos enviado un enlace de recuperación a tu correo electrónico
            </p>
          </div>

          {/* Contenido */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-center space-y-4">
              <p className="text-gray-700">
                Se ha enviado un enlace de restablecimiento de contraseña a:
              </p>
              <p className="font-medium text-gray-900 bg-gray-50 p-3 rounded-lg">
                {email}
              </p>
              <p className="text-sm text-gray-600">
                Revisa tu bandeja de entrada y sigue las instrucciones del email. 
                Si no lo encuentras, revisa tu carpeta de spam.
              </p>
              
              <div className="pt-4 space-y-3">
                <button
                  onClick={handleResendEmail}
                  disabled={isLoading}
                  className="btn btn-secondary w-full"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <LoadingSpinner size="sm" showText={false} />
                      <span className="ml-2">Reenviando...</span>
                    </div>
                  ) : (
                    'Reenviar email'
                  )}
                </button>
                
                <Link
                  to="/login"
                  className="btn btn-ghost w-full"
                >
                  Volver al inicio de sesión
                </Link>
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="text-center text-xs text-gray-500">
            <p>
              El enlace de recuperación expira en 1 hora por seguridad.
              Si tienes problemas, contacta nuestro soporte.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Formulario principal
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">Swaply</span>
          </Link>
          <h2 className="text-3xl font-extrabold text-gray-900">
            ¿Olvidaste tu contraseña?
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            No te preocupes, te ayudamos a recuperarla
          </p>
        </div>

        {/* Formulario */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Error global */}
          {error && (
            <div className="alert alert-error">
              <div className="flex items-center">
                <ExclamationCircleIcon className="h-5 w-5 mr-2" />
                <span>{error}</span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* Instrucciones */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                Ingresa tu correo electrónico y te enviaremos un enlace para 
                restablecer tu contraseña.
              </p>
            </div>

            {/* Campo de email */}
            <div>
              <label htmlFor="email" className="label label-required">
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={handleEmailChange}
                  className={`input pl-10 ${errors.email ? 'input-error' : ''}`}
                  placeholder="tu@ejemplo.com"
                  autoFocus
                />
              </div>
              {errors.email && (
                <p className="error-message">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Botones */}
          <div className="space-y-3">
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary btn-lg w-full"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="sm" showText={false} />
                  <span className="ml-2">Enviando...</span>
                </div>
              ) : (
                'Enviar enlace de recuperación'
              )}
            </button>

            <Link
              to="/login"
              className="btn btn-ghost w-full flex items-center justify-center"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Volver al inicio de sesión
            </Link>
          </div>
        </form>

        {/* Enlaces adicionales */}
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">
            ¿No tienes una cuenta?{' '}
            <Link
              to="/register"
              className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
            >
              Regístrate aquí
            </Link>
          </p>
          
          <p className="text-xs text-gray-500">
            ¿Problemas para acceder?{' '}
            <Link
              to="/contact"
              className="text-primary-600 hover:text-primary-500"
            >
              Contacta soporte
            </Link>
          </p>
        </div>

        {/* Información de seguridad */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            Información de seguridad
          </h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• El enlace de recuperación expira en 1 hora</li>
            <li>• Solo se puede usar una vez</li>
            <li>• Revisa tu carpeta de spam si no lo recibes</li>
            <li>• Nunca compartimos tu información personal</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;