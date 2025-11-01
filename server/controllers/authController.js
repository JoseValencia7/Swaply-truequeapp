const crypto = require('crypto');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const sendEmail = require('../utils/sendEmail');
const generateToken = require('../utils/generateToken');

// @desc    Registrar usuario
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Verificar si el usuario ya existe
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('El usuario ya existe');
  }

  // Crear usuario
  const user = await User.create({
    name,
    email,
    password
  });

  if (user) {
    // Generar token de verificación de email
    const verificationToken = user.getEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // URL de verificación
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

    // Mensaje de email
    const message = `
      <h1>Bienvenido a TruequeApp</h1>
      <p>Hola ${user.name},</p>
      <p>Gracias por registrarte en TruequeApp. Para completar tu registro, por favor verifica tu email haciendo clic en el siguiente enlace:</p>
      <a href="${verificationUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Verificar Email</a>
      <p>Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:</p>
      <p>${verificationUrl}</p>
      <p>Este enlace expirará en 24 horas.</p>
      <p>Si no creaste esta cuenta, puedes ignorar este email.</p>
      <br>
      <p>Saludos,<br>El equipo de TruequeApp</p>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Verificación de Email - TruequeApp',
        message
      });

      res.status(201).json({
        success: true,
        message: 'Usuario registrado. Por favor verifica tu email.',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            isVerified: user.isVerified
          }
        }
      });
    } catch (error) {
      console.error('Error sending verification email:', error);
      
      // Si falla el envío del email, eliminar el usuario
      await User.findByIdAndDelete(user._id);
      
      res.status(500);
      throw new Error('Error enviando email de verificación');
    }
  } else {
    res.status(400);
    throw new Error('Datos de usuario inválidos');
  }
});

// @desc    Verificar email
// @route   GET /api/auth/verify-email/:token
// @access  Public
const verifyEmail = asyncHandler(async (req, res) => {
  // Obtener token hasheado
  const emailVerificationToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    emailVerificationToken,
    emailVerificationExpire: { $gt: Date.now() }
  });

  if (!user) {
    res.status(400);
    throw new Error('Token de verificación inválido o expirado');
  }

  // Verificar usuario
  user.isVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Email verificado exitosamente'
  });
});

// @desc    Autenticar usuario & obtener token
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Verificar email y password
  if (!email || !password) {
    res.status(400);
    throw new Error('Por favor proporciona email y contraseña');
  }

  // Buscar usuario
  const user = await User.findOne({ email }).select('+password');

  if (user && (await user.matchPassword(password))) {
    // Verificar si el usuario está activo
    if (!user.isActive) {
      res.status(401);
      throw new Error('Cuenta desactivada. Contacta al soporte.');
    }

    // Generar tokens
    const accessToken = user.getSignedJwtToken();
    const refreshToken = user.getRefreshToken();

    // Guardar información de sesión
    const sessionInfo = {
      token: refreshToken,
      device: req.headers['user-agent'] || 'Unknown',
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      createdAt: new Date(),
      lastActivity: new Date()
    };

    user.activeSessions.push(sessionInfo);
    user.lastSeen = new Date();
    await user.save({ validateBeforeSave: false });

    // Configurar cookie del refresh token
    const cookieOptions = {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    };

    res.cookie('refreshToken', refreshToken, cookieOptions);

    res.status(200).json({
      success: true,
      message: 'Login exitoso',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          isVerified: user.isVerified,
          role: user.role,
          stats: user.stats,
          privacy: user.privacy,
          notifications: user.notifications
        },
        accessToken,
        expiresIn: process.env.JWT_EXPIRE
      }
    });
  } else {
    res.status(401);
    throw new Error('Credenciales inválidas');
  }
});

// @desc    Obtener usuario actual
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
    .populate('badges')
    .select('-activeSessions');

  res.status(200).json({
    success: true,
    data: {
      user
    }
  });
});

// @desc    Logout usuario
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    // Remover sesión activa
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { activeSessions: { token: refreshToken } }
    });
  }

  // Limpiar cookie
  res.cookie('refreshToken', '', {
    expires: new Date(0),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'Logout exitoso'
  });
});

// @desc    Logout de todos los dispositivos
// @route   POST /api/auth/logout-all
// @access  Private
const logoutAll = asyncHandler(async (req, res) => {
  // Limpiar todas las sesiones activas
  await User.findByIdAndUpdate(req.user.id, {
    activeSessions: []
  });

  // Limpiar cookie
  res.cookie('refreshToken', '', {
    expires: new Date(0),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'Logout de todos los dispositivos exitoso'
  });
});

// @desc    Refrescar token de acceso
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    res.status(401);
    throw new Error('No hay refresh token');
  }

  try {
    // Verificar refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Buscar usuario y verificar sesión activa
    const user = await User.findById(decoded.id);
    
    if (!user) {
      res.status(401);
      throw new Error('Usuario no encontrado');
    }

    const activeSession = user.activeSessions.find(session => 
      session.token === refreshToken
    );

    if (!activeSession) {
      res.status(401);
      throw new Error('Sesión inválida');
    }

    // Actualizar última actividad
    activeSession.lastActivity = new Date();
    await user.save({ validateBeforeSave: false });

    // Generar nuevo access token
    const newAccessToken = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
        expiresIn: process.env.JWT_EXPIRE
      }
    });
  } catch (error) {
    res.status(401);
    throw new Error('Token inválido');
  }
});

// @desc    Olvidé contraseña
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    res.status(404);
    throw new Error('No hay usuario con ese email');
  }

  // Generar token de reset
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // URL de reset
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  // Mensaje de email
  const message = `
    <h1>Recuperación de Contraseña</h1>
    <p>Hola ${user.name},</p>
    <p>Recibimos una solicitud para restablecer tu contraseña. Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
    <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Restablecer Contraseña</a>
    <p>Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:</p>
    <p>${resetUrl}</p>
    <p>Este enlace expirará en 10 minutos.</p>
    <p>Si no solicitaste este cambio, puedes ignorar este email.</p>
    <br>
    <p>Saludos,<br>El equipo de TruequeApp</p>
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Recuperación de Contraseña - TruequeApp',
      message
    });

    res.status(200).json({
      success: true,
      message: 'Email de recuperación enviado'
    });
  } catch (error) {
    console.error('Error sending reset email:', error);
    
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(500);
    throw new Error('Error enviando email');
  }
});

// @desc    Restablecer contraseña
// @route   PUT /api/auth/reset-password/:resettoken
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  // Obtener token hasheado
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    res.status(400);
    throw new Error('Token inválido o expirado');
  }

  // Establecer nueva contraseña
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  // Limpiar todas las sesiones activas por seguridad
  user.activeSessions = [];

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Contraseña restablecida exitosamente'
  });
});

// @desc    Cambiar contraseña
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Obtener usuario con contraseña
  const user = await User.findById(req.user.id).select('+password');

  // Verificar contraseña actual
  if (!(await user.matchPassword(currentPassword))) {
    res.status(400);
    throw new Error('Contraseña actual incorrecta');
  }

  // Establecer nueva contraseña
  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Contraseña cambiada exitosamente'
  });
});

// @desc    Reenviar email de verificación
// @route   POST /api/auth/resend-verification
// @access  Public
const resendVerification = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    res.status(404);
    throw new Error('Usuario no encontrado');
  }

  if (user.isVerified) {
    res.status(400);
    throw new Error('El usuario ya está verificado');
  }

  // Generar nuevo token de verificación
  const verificationToken = user.getEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  // URL de verificación
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

  // Mensaje de email
  const message = `
    <h1>Verificación de Email</h1>
    <p>Hola ${user.name},</p>
    <p>Aquí está tu nuevo enlace de verificación de email:</p>
    <a href="${verificationUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Verificar Email</a>
    <p>Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:</p>
    <p>${verificationUrl}</p>
    <p>Este enlace expirará en 24 horas.</p>
    <br>
    <p>Saludos,<br>El equipo de TruequeApp</p>
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Verificación de Email - TruequeApp',
      message
    });

    res.status(200).json({
      success: true,
      message: 'Email de verificación reenviado'
    });
  } catch (error) {
    console.error('Error sending verification email:', error);
    
    res.status(500);
    throw new Error('Error enviando email de verificación');
  }
});

module.exports = {
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
};