/**
 * Rutas de Autenticación para Swaply
 * 
 * Maneja todas las operaciones relacionadas con autenticación de usuarios:
 * registro, inicio de sesión, verificación de email, recuperación de contraseña.
 * 
 * Endpoints principales:
 * - POST /register - Registro de nuevos usuarios
 * - POST /login - Inicio de sesión
 * - POST /logout - Cierre de sesión
 * - POST /forgot-password - Solicitar recuperación de contraseña
 * - POST /reset-password - Restablecer contraseña
 * - POST /verify-email - Verificar email
 * - POST /resend-verification - Reenviar email de verificación
 * 
 * @author Jose Manuel Valencia
 * @version 1.0.0
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const { 
  generateToken, 
  authenticateToken,
  verifyToken 
} = require('../middleware/auth');
const { 
  AppError, 
  catchAsync, 
  sendSuccess,
  validateRequiredFields,
  sanitizeInput 
} = require('../middleware/errorHandler');

const router = express.Router();

// Configuración del transportador de email
const createEmailTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

/**
 * @route   POST /api/auth/register
 * @desc    Registrar nuevo usuario
 * @access  Public
 */
router.post('/register', [
  // Validaciones
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras'),
  
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El apellido debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El apellido solo puede contener letras'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Por favor ingresa un email válido'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Las contraseñas no coinciden');
      }
      return true;
    }),
  
  body('location.city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La ciudad no puede exceder 100 caracteres'),
  
  body('location.country')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('El país no puede exceder 100 caracteres')
], 
sanitizeInput,
catchAsync(async (req, res, next) => {
  // Verificar errores de validación
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return next(new AppError(errorMessages.join('. '), 400));
  }
  
  const { firstName, lastName, email, password, location, phone } = req.body;
  
  // Verificar si el usuario ya existe
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('El email ya está registrado', 400));
  }
  
  // Generar token de verificación
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  // Crear nuevo usuario
  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    phone,
    location,
    verificationToken,
    isVerified: false
  });
  
  // Generar JWT
  const token = generateToken({ userId: user._id });
  
  // Enviar email de verificación
  try {
    const transporter = createEmailTransporter();
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
    
    await transporter.sendMail({
      from: `"Swaply" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verifica tu cuenta en Swaply',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">¡Bienvenido a Swaply!</h2>
          <p>Hola ${firstName},</p>
          <p>Gracias por registrarte en Swaply, la plataforma de intercambio comunitario.</p>
          <p>Para completar tu registro, por favor verifica tu email haciendo clic en el siguiente enlace:</p>
          <a href="${verificationUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">
            Verificar Email
          </a>
          <p>Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:</p>
          <p style="word-break: break-all; color: #6b7280;">${verificationUrl}</p>
          <p>Este enlace expirará en 24 horas.</p>
          <p>Si no creaste esta cuenta, puedes ignorar este email.</p>
          <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            Saludos,<br>
            El equipo de Swaply
          </p>
        </div>
      `
    });
  } catch (emailError) {
    console.error('Error enviando email de verificación:', emailError);
    // No fallar el registro si hay error en el email
  }
  
  // Respuesta exitosa (sin incluir la contraseña)
  const userResponse = user.getPublicProfile();
  
  sendSuccess(res, {
    user: userResponse,
    token,
    message: 'Registro exitoso. Por favor verifica tu email.'
  }, 'Usuario registrado exitosamente', 201);
}));

/**
 * @route   POST /api/auth/login
 * @desc    Iniciar sesión
 * @access  Public
 */
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Por favor ingresa un email válido'),
  
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
], 
sanitizeInput,
catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return next(new AppError(errorMessages.join('. '), 400));
  }
  
  const { email, password } = req.body;
  
  // Buscar usuario e incluir contraseña para comparación
  const user = await User.findOne({ email }).select('+password');
  
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Email o contraseña incorrectos', 401));
  }
  
  // Verificar si la cuenta está activa
  if (!user.isActive) {
    return next(new AppError('Cuenta desactivada. Contacta al soporte.', 401));
  }
  
  // Actualizar último acceso
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });
  
  // Generar token
  const token = generateToken({ userId: user._id });
  
  // Respuesta exitosa
  const userResponse = user.getPublicProfile();
  
  sendSuccess(res, {
    user: userResponse,
    token
  }, 'Inicio de sesión exitoso');
}));

/**
 * @route   POST /api/auth/logout
 * @desc    Cerrar sesión (invalidar token del lado del cliente)
 * @access  Private
 */
router.post('/logout', authenticateToken, catchAsync(async (req, res) => {
  // En una implementación más robusta, aquí se podría agregar el token a una blacklist
  sendSuccess(res, null, 'Sesión cerrada exitosamente');
}));

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Solicitar recuperación de contraseña
 * @access  Public
 */
router.post('/forgot-password', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Por favor ingresa un email válido')
], 
sanitizeInput,
catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Por favor ingresa un email válido', 400));
  }
  
  const { email } = req.body;
  
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError('No existe una cuenta con ese email', 404));
  }
  
  // Generar token de recuperación
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = resetToken;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutos
  
  await user.save({ validateBeforeSave: false });
  
  // Enviar email de recuperación
  try {
    const transporter = createEmailTransporter();
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    
    await transporter.sendMail({
      from: `"Swaply" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Recuperación de contraseña - Swaply',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Recuperación de contraseña</h2>
          <p>Hola ${user.firstName},</p>
          <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en Swaply.</p>
          <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
          <a href="${resetUrl}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">
            Restablecer Contraseña
          </a>
          <p>Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:</p>
          <p style="word-break: break-all; color: #6b7280;">${resetUrl}</p>
          <p><strong>Este enlace expirará en 10 minutos.</strong></p>
          <p>Si no solicitaste este cambio, puedes ignorar este email y tu contraseña permanecerá sin cambios.</p>
          <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            Saludos,<br>
            El equipo de Swaply
          </p>
        </div>
      `
    });
    
    sendSuccess(res, null, 'Email de recuperación enviado exitosamente');
    
  } catch (emailError) {
    console.error('Error enviando email de recuperación:', emailError);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    
    return next(new AppError('Error enviando email. Intenta de nuevo más tarde.', 500));
  }
}));

/**
 * @route   POST /api/auth/reset-password
 * @desc    Restablecer contraseña
 * @access  Public
 */
router.post('/reset-password', [
  body('token')
    .notEmpty()
    .withMessage('Token de recuperación requerido'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Las contraseñas no coinciden');
      }
      return true;
    })
], 
sanitizeInput,
catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return next(new AppError(errorMessages.join('. '), 400));
  }
  
  const { token, password } = req.body;
  
  // Buscar usuario con token válido y no expirado
  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() }
  });
  
  if (!user) {
    return next(new AppError('Token inválido o expirado', 400));
  }
  
  // Actualizar contraseña
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  
  await user.save();
  
  // Generar nuevo token de sesión
  const authToken = generateToken({ userId: user._id });
  
  sendSuccess(res, {
    token: authToken
  }, 'Contraseña restablecida exitosamente');
}));

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verificar email del usuario
 * @access  Public
 */
router.post('/verify-email', [
  body('token')
    .notEmpty()
    .withMessage('Token de verificación requerido')
], 
sanitizeInput,
catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Token de verificación requerido', 400));
  }
  
  const { token } = req.body;
  
  const user = await User.findOne({ verificationToken: token });
  
  if (!user) {
    return next(new AppError('Token de verificación inválido', 400));
  }
  
  if (user.isVerified) {
    return next(new AppError('Email ya verificado', 400));
  }
  
  // Verificar email
  user.isVerified = true;
  user.verificationToken = undefined;
  
  await user.save({ validateBeforeSave: false });
  
  sendSuccess(res, null, 'Email verificado exitosamente');
}));

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Reenviar email de verificación
 * @access  Private
 */
router.post('/resend-verification', authenticateToken, catchAsync(async (req, res, next) => {
  const user = req.user;
  
  if (user.isVerified) {
    return next(new AppError('Email ya verificado', 400));
  }
  
  // Generar nuevo token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  user.verificationToken = verificationToken;
  
  await user.save({ validateBeforeSave: false });
  
  // Enviar email
  try {
    const transporter = createEmailTransporter();
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
    
    await transporter.sendMail({
      from: `"Swaply" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Verifica tu cuenta en Swaply',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Verificación de email</h2>
          <p>Hola ${user.firstName},</p>
          <p>Por favor verifica tu email haciendo clic en el siguiente enlace:</p>
          <a href="${verificationUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">
            Verificar Email
          </a>
          <p>Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:</p>
          <p style="word-break: break-all; color: #6b7280;">${verificationUrl}</p>
        </div>
      `
    });
    
    sendSuccess(res, null, 'Email de verificación reenviado exitosamente');
    
  } catch (emailError) {
    console.error('Error reenviando email de verificación:', emailError);
    return next(new AppError('Error enviando email. Intenta de nuevo más tarde.', 500));
  }
}));

/**
 * @route   GET /api/auth/me
 * @desc    Obtener información del usuario autenticado
 * @access  Private
 */
router.get('/me', authenticateToken, catchAsync(async (req, res) => {
  const userResponse = req.user.getPublicProfile();
  sendSuccess(res, { user: userResponse }, 'Información del usuario obtenida exitosamente');
}));

module.exports = router;