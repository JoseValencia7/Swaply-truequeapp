const express = require('express');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const { protect, authorize, checkOwnership } = require('../middleware/auth');
const { catchAsync, sendResponse, sendPaginatedResponse } = require('../middleware/errorHandler');
const AppError = require('../middleware/errorHandler').AppError;

const router = express.Router();

// Configuración de multer para subida de imágenes de perfil
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/profiles/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new AppError('Solo se permiten archivos de imagen', 400), false);
    }
  }
});

// @desc    Obtener perfil del usuario autenticado
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id)
    .select('-password')
    .populate('favoritePublications', 'title images type category location createdAt');

  sendResponse(res, 200, 'Perfil obtenido exitosamente', user);
}));

// @desc    Actualizar perfil del usuario
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', protect, catchAsync(async (req, res) => {
  const allowedFields = [
    'firstName', 'lastName', 'phone', 'bio', 'location',
    'preferences', 'privacySettings', 'notificationSettings'
  ];

  const updateData = {};
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  });

  const user = await User.findByIdAndUpdate(
    req.user.id,
    updateData,
    { new: true, runValidators: true }
  ).select('-password');

  sendResponse(res, 200, 'Perfil actualizado exitosamente', user);
}));

// @desc    Subir foto de perfil
// @route   POST /api/users/profile/photo
// @access  Private
router.post('/profile/photo', protect, upload.single('profilePhoto'), catchAsync(async (req, res) => {
  if (!req.file) {
    return next(new AppError('Por favor selecciona una imagen', 400));
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { profilePhoto: `/uploads/profiles/${req.file.filename}` },
    { new: true }
  ).select('-password');

  sendResponse(res, 200, 'Foto de perfil actualizada exitosamente', {
    profilePhoto: user.profilePhoto
  });
}));

// @desc    Obtener perfil público de usuario
// @route   GET /api/users/:id
// @access  Public
router.get('/:id', catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('firstName lastName profilePhoto bio location reputation.average reputation.count joinDate isVerified')
    .populate({
      path: 'publications',
      match: { status: 'active' },
      select: 'title images type category location createdAt',
      options: { limit: 6, sort: { createdAt: -1 } }
    });

  if (!user) {
    return next(new AppError('Usuario no encontrado', 404));
  }

  sendResponse(res, 200, 'Perfil público obtenido exitosamente', user);
}));

// @desc    Buscar usuarios
// @route   GET /api/users/search
// @access  Public
router.get('/search', catchAsync(async (req, res) => {
  const { q, location, minRating, page = 1, limit = 10 } = req.query;

  const query = { isActive: true };

  if (q) {
    query.$or = [
      { firstName: { $regex: q, $options: 'i' } },
      { lastName: { $regex: q, $options: 'i' } },
      { bio: { $regex: q, $options: 'i' } }
    ];
  }

  if (location) {
    query['location.city'] = { $regex: location, $options: 'i' };
  }

  if (minRating) {
    query['reputation.average'] = { $gte: parseFloat(minRating) };
  }

  const users = await User.find(query)
    .select('firstName lastName profilePhoto bio location reputation.average reputation.count joinDate isVerified')
    .sort({ 'reputation.average': -1, 'reputation.count': -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await User.countDocuments(query);

  sendPaginatedResponse(res, 200, 'Usuarios encontrados', users, {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    pages: Math.ceil(total / limit)
  });
}));

// @desc    Obtener usuarios mejor valorados
// @route   GET /api/users/top-rated
// @access  Public
router.get('/top-rated', catchAsync(async (req, res) => {
  const { limit = 10 } = req.query;

  const users = await User.getTopRated(parseInt(limit));

  sendResponse(res, 200, 'Usuarios mejor valorados obtenidos', users);
}));

// @desc    Seguir/Dejar de seguir usuario
// @route   POST /api/users/:id/follow
// @access  Private
router.post('/:id/follow', protect, catchAsync(async (req, res) => {
  const targetUserId = req.params.id;
  const currentUserId = req.user.id;

  if (targetUserId === currentUserId) {
    return next(new AppError('No puedes seguirte a ti mismo', 400));
  }

  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    return next(new AppError('Usuario no encontrado', 404));
  }

  const currentUser = await User.findById(currentUserId);
  const isFollowing = currentUser.following.includes(targetUserId);

  if (isFollowing) {
    // Dejar de seguir
    currentUser.following.pull(targetUserId);
    targetUser.followers.pull(currentUserId);
    await Promise.all([currentUser.save(), targetUser.save()]);
    
    sendResponse(res, 200, 'Has dejado de seguir al usuario', { following: false });
  } else {
    // Seguir
    currentUser.following.push(targetUserId);
    targetUser.followers.push(currentUserId);
    await Promise.all([currentUser.save(), targetUser.save()]);
    
    sendResponse(res, 200, 'Ahora sigues al usuario', { following: true });
  }
}));

// @desc    Obtener seguidores del usuario
// @route   GET /api/users/:id/followers
// @access  Public
router.get('/:id/followers', catchAsync(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const user = await User.findById(req.params.id)
    .populate({
      path: 'followers',
      select: 'firstName lastName profilePhoto reputation.average isVerified',
      options: {
        limit: limit * 1,
        skip: (page - 1) * limit
      }
    });

  if (!user) {
    return next(new AppError('Usuario no encontrado', 404));
  }

  const total = user.followers.length;

  sendPaginatedResponse(res, 200, 'Seguidores obtenidos', user.followers, {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    pages: Math.ceil(total / limit)
  });
}));

// @desc    Obtener usuarios seguidos
// @route   GET /api/users/:id/following
// @access  Public
router.get('/:id/following', catchAsync(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const user = await User.findById(req.params.id)
    .populate({
      path: 'following',
      select: 'firstName lastName profilePhoto reputation.average isVerified',
      options: {
        limit: limit * 1,
        skip: (page - 1) * limit
      }
    });

  if (!user) {
    return next(new AppError('Usuario no encontrado', 404));
  }

  const total = user.following.length;

  sendPaginatedResponse(res, 200, 'Usuarios seguidos obtenidos', user.following, {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    pages: Math.ceil(total / limit)
  });
}));

// @desc    Reportar usuario
// @route   POST /api/users/:id/report
// @access  Private
router.post('/:id/report', protect, catchAsync(async (req, res) => {
  const { reason, description } = req.body;

  if (!reason) {
    return next(new AppError('La razón del reporte es requerida', 400));
  }

  const reportedUser = await User.findById(req.params.id);
  if (!reportedUser) {
    return next(new AppError('Usuario no encontrado', 404));
  }

  if (req.params.id === req.user.id) {
    return next(new AppError('No puedes reportarte a ti mismo', 400));
  }

  // Verificar si ya reportó a este usuario
  const existingReport = reportedUser.reports.find(
    report => report.reportedBy.toString() === req.user.id
  );

  if (existingReport) {
    return next(new AppError('Ya has reportado a este usuario', 400));
  }

  reportedUser.reports.push({
    reportedBy: req.user.id,
    reason,
    description,
    date: new Date()
  });

  await reportedUser.save();

  sendResponse(res, 200, 'Usuario reportado exitosamente');
}));

// @desc    Bloquear/Desbloquear usuario
// @route   POST /api/users/:id/block
// @access  Private
router.post('/:id/block', protect, catchAsync(async (req, res) => {
  const targetUserId = req.params.id;
  const currentUserId = req.user.id;

  if (targetUserId === currentUserId) {
    return next(new AppError('No puedes bloquearte a ti mismo', 400));
  }

  const currentUser = await User.findById(currentUserId);
  const isBlocked = currentUser.blockedUsers.includes(targetUserId);

  if (isBlocked) {
    // Desbloquear
    currentUser.blockedUsers.pull(targetUserId);
    await currentUser.save();
    
    sendResponse(res, 200, 'Usuario desbloqueado', { blocked: false });
  } else {
    // Bloquear
    currentUser.blockedUsers.push(targetUserId);
    // También remover de seguidos/seguidores si existe la relación
    currentUser.following.pull(targetUserId);
    
    const targetUser = await User.findById(targetUserId);
    if (targetUser) {
      targetUser.followers.pull(currentUserId);
      targetUser.following.pull(currentUserId);
      await targetUser.save();
    }
    
    await currentUser.save();
    
    sendResponse(res, 200, 'Usuario bloqueado', { blocked: true });
  }
}));

// @desc    Obtener estadísticas del usuario
// @route   GET /api/users/:id/stats
// @access  Public
router.get('/:id/stats', catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('reputation statistics joinDate')
    .populate('publications', 'status type createdAt')
    .populate('exchanges', 'status createdAt');

  if (!user) {
    return next(new AppError('Usuario no encontrado', 404));
  }

  const stats = {
    reputation: user.reputation,
    totalPublications: user.publications.length,
    activePublications: user.publications.filter(pub => pub.status === 'active').length,
    completedExchanges: user.exchanges.filter(ex => ex.status === 'completed').length,
    memberSince: user.joinDate,
    statistics: user.statistics
  };

  sendResponse(res, 200, 'Estadísticas obtenidas', stats);
}));

// @desc    Eliminar cuenta de usuario
// @route   DELETE /api/users/profile
// @access  Private
router.delete('/profile', protect, catchAsync(async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return next(new AppError('La contraseña es requerida para eliminar la cuenta', 400));
  }

  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.matchPassword(password))) {
    return next(new AppError('Contraseña incorrecta', 401));
  }

  // Marcar como inactivo en lugar de eliminar completamente
  user.isActive = false;
  user.email = `deleted_${Date.now()}_${user.email}`;
  await user.save();

  sendResponse(res, 200, 'Cuenta eliminada exitosamente');
}));

module.exports = router;