import axios from 'axios';
import Cookies from 'js-cookie';
import { store } from '../store/store';
import { logout } from '../store/slices/authSlice';
import { showToast } from '../store/slices/notificationsSlice';

// Configuración base de la API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para requests - agregar token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para responses - manejar errores globalmente
api.interceptors.response.use(
  (response) => {
    // Mostrar mensaje de éxito si existe
    if (response.data?.message && response.config.method !== 'get') {
      store.dispatch(showToast({
        message: response.data.message,
        type: 'success',
      }));
    }
    return response;
  },
  (error) => {
    const { response, request, message } = error;

    // Error de red o timeout
    if (!response) {
      if (request) {
        store.dispatch(showToast({
          message: 'Error de conexión. Verifica tu conexión a internet.',
          type: 'error',
        }));
      } else {
        store.dispatch(showToast({
          message: 'Error al configurar la solicitud.',
          type: 'error',
        }));
      }
      return Promise.reject(error);
    }

    const { status, data } = response;

    // Manejar diferentes tipos de errores HTTP
    switch (status) {
      case 400:
        // Bad Request - errores de validación
        if (data?.errors && Array.isArray(data.errors)) {
          // Mostrar errores de validación
          data.errors.forEach(err => {
            store.dispatch(showToast({
              message: err.msg || err.message,
              type: 'error',
            }));
          });
        } else {
          store.dispatch(showToast({
            message: data?.message || 'Solicitud inválida',
            type: 'error',
          }));
        }
        break;

      case 401:
        // Unauthorized - token inválido o expirado
        store.dispatch(showToast({
          message: 'Sesión expirada. Por favor, inicia sesión nuevamente.',
          type: 'error',
        }));
        store.dispatch(logout());
        // Redirigir al login
        window.location.href = '/login';
        break;

      case 403:
        // Forbidden - sin permisos
        store.dispatch(showToast({
          message: data?.message || 'No tienes permisos para realizar esta acción',
          type: 'error',
        }));
        break;

      case 404:
        // Not Found
        store.dispatch(showToast({
          message: data?.message || 'Recurso no encontrado',
          type: 'error',
        }));
        break;

      case 409:
        // Conflict - recurso ya existe
        store.dispatch(showToast({
          message: data?.message || 'El recurso ya existe',
          type: 'error',
        }));
        break;

      case 422:
        // Unprocessable Entity - errores de validación
        if (data?.errors && Array.isArray(data.errors)) {
          data.errors.forEach(err => {
            store.dispatch(showToast({
              message: err.msg || err.message,
              type: 'error',
            }));
          });
        } else {
          store.dispatch(showToast({
            message: data?.message || 'Datos inválidos',
            type: 'error',
          }));
        }
        break;

      case 429:
        // Too Many Requests - rate limiting
        store.dispatch(showToast({
          message: 'Demasiadas solicitudes. Intenta nuevamente más tarde.',
          type: 'warning',
        }));
        break;

      case 500:
        // Internal Server Error
        store.dispatch(showToast({
          message: 'Error interno del servidor. Intenta nuevamente más tarde.',
          type: 'error',
        }));
        break;

      case 502:
      case 503:
      case 504:
        // Server errors
        store.dispatch(showToast({
          message: 'Servicio temporalmente no disponible. Intenta nuevamente más tarde.',
          type: 'error',
        }));
        break;

      default:
        // Otros errores
        store.dispatch(showToast({
          message: data?.message || `Error ${status}: ${message}`,
          type: 'error',
        }));
    }

    return Promise.reject(error);
  }
);

// Funciones helper para diferentes tipos de requests
export const apiHelpers = {
  // GET request con parámetros de query
  get: (url, params = {}) => {
    return api.get(url, { params });
  },

  // POST request
  post: (url, data = {}) => {
    return api.post(url, data);
  },

  // PUT request
  put: (url, data = {}) => {
    return api.put(url, data);
  },

  // PATCH request
  patch: (url, data = {}) => {
    return api.patch(url, data);
  },

  // DELETE request
  delete: (url) => {
    return api.delete(url);
  },

  // Upload de archivos
  upload: (url, formData, onUploadProgress = null) => {
    return api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
  },

  // Download de archivos
  download: (url, filename) => {
    return api.get(url, {
      responseType: 'blob',
    }).then(response => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    });
  },
};

// Función para configurar el token manualmente
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    Cookies.set('token', token, { expires: 30 });
  } else {
    delete api.defaults.headers.common['Authorization'];
    Cookies.remove('token');
  }
};

// Función para obtener el token actual
export const getAuthToken = () => {
  return Cookies.get('token');
};

// Función para verificar si el usuario está autenticado
export const isAuthenticated = () => {
  const token = getAuthToken();
  return !!token;
};

export default api;