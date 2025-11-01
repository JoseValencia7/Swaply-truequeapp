const express = require('express');
const {
  register,
  verifyEmail,
  login,
  getMe,
  logout,
  logoutAll,
  refreshToken,
  forgotPassword,
  resetPassword,
  changePassword,
  resendVerification
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting para rutas sensibles
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos por IP
  message: {
    success: false,
    message: 'Demasiados intentos de autenticación. Intenta de nuevo en 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const passwordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // máximo 3 intentos por IP
  message: {
    success: false,
    message: 'Demasiados intentos de cambio de contraseña. Intenta de nuevo en 1 hora.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rutas públicas
router.post('/register', authLimiter, register);
router.get('/verify-email/:token', verifyEmail);
router.post('/login', authLimiter, login);
router.post('/refresh', refreshToken);
router.post('/forgot-password', passwordLimiter, forgotPassword);
router.put('/reset-password/:resettoken', passwordLimiter, resetPassword);
router.post('/resend-verification', authLimiter, resendVerification);

// Rutas protegidas
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.post('/logout-all', protect, logoutAll);
router.put('/change-password', protect, passwordLimiter, changePassword);

module.exports = router;