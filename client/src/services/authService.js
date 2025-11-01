import api from './api';

const authService = {
  // Registro de usuario
  register: async (userData) => {
    return await api.post('/auth/register', userData);
  },

  // Inicio de sesión
  login: async (email, password) => {
    return await api.post('/auth/login', { email, password });
  },

  // Cerrar sesión
  logout: async () => {
    return await api.post('/auth/logout');
  },

  // Obtener información del usuario autenticado
  getMe: async () => {
    return await api.get('/auth/me');
  },

  // Actualizar perfil
  updateProfile: async (userData) => {
    return await api.put('/users/profile', userData);
  },

  // Subir foto de perfil
  uploadProfilePhoto: async (formData) => {
    return await api.post('/users/profile/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Olvidé mi contraseña
  forgotPassword: async (email) => {
    return await api.post('/auth/forgot-password', { email });
  },

  // Restablecer contraseña
  resetPassword: async (token, password) => {
    return await api.post(`/auth/reset-password/${token}`, { password });
  },

  // Verificar email
  verifyEmail: async (token) => {
    return await api.get(`/auth/verify-email/${token}`);
  },

  // Reenviar verificación de email
  resendVerification: async () => {
    return await api.post('/auth/resend-verification');
  },

  // Cambiar contraseña
  changePassword: async (currentPassword, newPassword) => {
    return await api.put('/users/change-password', {
      currentPassword,
      newPassword,
    });
  },

  // Eliminar cuenta
  deleteAccount: async () => {
    return await api.delete('/users/profile');
  },

  // Obtener estadísticas del usuario
  getUserStats: async () => {
    return await api.get('/users/stats');
  },

  // Verificar disponibilidad de username
  checkUsernameAvailability: async (username) => {
    return await api.get(`/users/check-username/${username}`);
  },

  // Verificar disponibilidad de email
  checkEmailAvailability: async (email) => {
    return await api.get(`/users/check-email/${email}`);
  },
};

export default authService;