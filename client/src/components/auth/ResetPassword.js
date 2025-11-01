import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  LockClosedIcon,
  EyeIcon, 
  EyeSlashIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { resetPassword, clearError } from '../../store/slices/authSlice';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * Componente para restablecer contraseña
 * Permite a los usuarios crear una nueva contraseña usando un token de recuperación
 */
const ResetPassword = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const { isLoading, error, isAuthenticated } = useSelector(state => state.auth);

  // Obtener token de la URL
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  // Redireccionar si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Verificar que existe el token
  useEffect(() => {
    if (!token) {
      setTokenValid(false);
    }
  }, [token]);

  // Limpiar errores al desmontar
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Validación del formulario
  const validateForm = () => {
    const newErrors = {};

    // Validar contraseña
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'La contraseña debe contener al menos una mayúscula, una minúscula y un número';
    }

    // Validar confirmación de contraseña
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await dispatch(resetPassword({
        token,
        password: formData.password
      })).unwrap();
      
      setIsSuccess(true);
    } catch (error) {
      // El error se maneja en el slice
      if (error.includes('token') || error.includes('expirado')) {
        setTokenValid(false);
      }
      console.error('Error al restablecer contraseña:', error);
    }
  };

  // Verificar fortaleza de contraseña
  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthLabels = ['Muy débil', 'Débil', 'Regular', 'Fuerte', 'Muy fuerte'];
  const strengthColors = ['bg-error-500', 'bg-warning-500', 'bg-yellow-500', 'bg-success-500', 'bg-success-600'];

  // Si el token no es válido
  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Link to="/" className="flex items-center justify-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">Swaply</span>
            </Link>
            
            <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ExclamationCircleIcon className="w-8 h-8 text-error-600" />
            </div>
            
            <h2 className="text-3xl font-extrabold text-gray-900">
              Enlace inválido
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              El enlace de recuperación no es válido o ha expirado
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-center space-y-4">
              <p className="text-gray-700">
                Este enlace de recuperación puede haber expirado o ya haber sido utilizado.
              </p>
              
              <div className="pt-4 space-y-3">
                <Link
                  to="/forgot-password"
                  className="btn btn-primary w-full"
                >
                  Solicitar nuevo enlace
                </Link>
                
                <Link
                  to="/login"
                  className="btn btn-ghost w-full flex items-center justify-center"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Volver al inicio de sesión
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si la contraseña se restableció exitosamente
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
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
              ¡Contraseña restablecida!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Tu contraseña ha sido actualizada exitosamente
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-center space-y-4">
              <p className="text-gray-700">
                Ya puedes iniciar sesión con tu nueva contraseña.
              </p>
              
              <div className="pt-4">
                <Link
                  to="/login"
                  className="btn btn-primary w-full"
                >
                  Iniciar sesión
                </Link>
              </div>
            </div>
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
            Restablecer contraseña
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Crea una nueva contraseña segura
          </p>
          {email && (
            <p className="mt-1 text-xs text-gray-500">
              Para: {email}
            </p>
          )}
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
                Tu nueva contraseña debe tener al menos 8 caracteres e incluir 
                mayúsculas, minúsculas y números.
              </p>
            </div>

            {/* Campo de nueva contraseña */}
            <div>
              <label htmlFor="password" className="label label-required">
                Nueva contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`input pl-10 pr-10 ${errors.password ? 'input-error' : ''}`}
                  placeholder="Mínimo 8 caracteres"
                  autoFocus
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              
              {/* Indicador de fortaleza de contraseña */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          strengthColors[passwordStrength - 1] || 'bg-gray-200'
                        }`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600">
                      {strengthLabels[passwordStrength - 1] || ''}
                    </span>
                  </div>
                </div>
              )}
              
              {errors.password && (
                <p className="error-message">{errors.password}</p>
              )}
            </div>

            {/* Campo de confirmación de contraseña */}
            <div>
              <label htmlFor="confirmPassword" className="label label-required">
                Confirmar nueva contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`input pl-10 pr-10 ${errors.confirmPassword ? 'input-error' : ''}`}
                  placeholder="Confirma tu nueva contraseña"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              
              {/* Indicador de coincidencia */}
              {formData.confirmPassword && (
                <div className="mt-1 flex items-center">
                  {formData.password === formData.confirmPassword ? (
                    <div className="flex items-center text-success-600">
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      <span className="text-xs">Las contraseñas coinciden</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-error-600">
                      <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                      <span className="text-xs">Las contraseñas no coinciden</span>
                    </div>
                  )}
                </div>
              )}
              
              {errors.confirmPassword && (
                <p className="error-message">{errors.confirmPassword}</p>
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
                  <span className="ml-2">Restableciendo...</span>
                </div>
              ) : (
                'Restablecer contraseña'
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

        {/* Información de seguridad */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            Consejos de seguridad
          </h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Usa una contraseña única que no hayas usado antes</li>
            <li>• Combina letras, números y símbolos</li>
            <li>• Evita información personal como nombres o fechas</li>
            <li>• Considera usar un gestor de contraseñas</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;