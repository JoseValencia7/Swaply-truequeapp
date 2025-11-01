import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { verifyEmail } from '../../store/slices/authSlice';

const VerifyEmail = () => {
  const { token } = useParams();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  
  const [verificationStatus, setVerificationStatus] = useState('verifying'); // verifying, success, error

  useEffect(() => {
    const verify = async () => {
      if (token) {
        try {
          await dispatch(verifyEmail({ token })).unwrap();
          setVerificationStatus('success');
        } catch (error) {
          setVerificationStatus('error');
        }
      } else {
        setVerificationStatus('error');
      }
    };

    verify();
  }, [dispatch, token]);

  if (verificationStatus === 'verifying' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Verificando correo electrónico
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Por favor espera mientras verificamos tu correo electrónico...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100">
              <i className="fas fa-check text-green-600 text-xl"></i>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              ¡Correo verificado!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Tu correo electrónico ha sido verificado exitosamente.
              Ya puedes iniciar sesión en tu cuenta.
            </p>
            <div className="mt-6 space-y-3">
              <Link
                to="/login"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Iniciar sesión
              </Link>
              <Link
                to="/"
                className="text-blue-600 hover:text-blue-500 text-sm font-medium"
              >
                Ir al inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100">
            <i className="fas fa-times text-red-600 text-xl"></i>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Error de verificación
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {error || 'No se pudo verificar tu correo electrónico. El enlace puede haber expirado o ser inválido.'}
          </p>
          <div className="mt-6 space-y-3">
            <Link
              to="/register"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Registrarse nuevamente
            </Link>
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-500 text-sm font-medium"
            >
              ¿Ya tienes cuenta? Iniciar sesión
            </Link>
            <Link
              to="/"
              className="block text-gray-600 hover:text-gray-500 text-sm"
            >
              Ir al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;