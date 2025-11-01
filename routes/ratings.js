const express = require('express');
const { Rating, Exchange } = require('../models/Rating');
const User = require('../models/User');
const Publication = require('../models/Publication');
const { protect } = require('../middleware/auth');
const { catchAsync, sendResponse, sendPaginatedResponse } = require('../middleware/errorHandler');
const AppError = require('../middleware/errorHandler').AppError;

const router = express.Router();

// @desc    Crear nueva valoración
// @route   POST /api/ratings
// @access  Private
router.post('/', protect, catchAsync(async (req, res) => {
  const { exchangeId, ratedUserId, rating, comment, tags } = req.body;

  // Validaciones básicas
  if (!exchangeId || !ratedUserId || !rating) {
    return next(new AppError('Exchange ID, usuario valorado y puntuación son requeridos', 400));
  }

  if (rating < 1 || rating > 5) {
    return next(new AppError('La puntuación debe estar entre 1 y 5', 400));
  }

  if (ratedUserId === req.user.id) {
    return next(new AppError('No puedes valorarte a ti mismo', 400));
  }

  // Verificar que el intercambio existe y está completado
  const exchange = await Exchange.findById(exchangeId);
  if (!exchange) {
    return next(new AppError('Intercambio no encontrado', 404));
  }

  if (exchange.status !== 'completed') {
    return next(new AppError('Solo se pueden valorar intercambios completados', 400));
  }

  // Verificar que el usuario fue parte del intercambio
  const isParticipant = exchange.participants.some(
    participant => participant.user.toString() === req.user.id
  );

  if (!isParticipant) {
    return next(new AppError('Solo los participantes pueden valorar el intercambio', 403));
  }

  // Verificar que el usuario valorado también fue parte del intercambio
  const isRatedUserParticipant = exchange.participants.some(
    participant => participant.user.toString() === ratedUserId
  );

  if (!isRatedUserParticipant) {
    return next(new AppError('Solo puedes valorar a otros participantes del intercambio', 400));
  }

  // Verificar que no existe una valoración previa
  const existingRating = await Rating.findOne({
    exchange: exchangeId,
    rater: req.user.id,
    ratedUser: ratedUserId
  });

  if (existingRating) {
    return next(new AppError('Ya has valorado a este usuario para este intercambio', 400));
  }

  // Crear la valoración
  const newRating = await Rating.create({
    exchange: exchangeId,
    rater: req.user.id,
    ratedUser: ratedUserId,
    rating,
    comment: comment || '',
    tags: tags || []
  });

  await newRating.populate([
    { path: 'rater', select: 'firstName lastName profilePhoto' },
    { path: 'ratedUser', select: 'firstName lastName profilePhoto' },
    { path: 'exchange', select: 'type status completedAt' }
  ]);

  // Actualizar la reputación del usuario valorado
  const ratedUser = await User.findById(ratedUserId);
  await ratedUser.updateReputation();

  sendResponse(res, 201, 'Valoración creada exitosamente', newRating);
}));

// @desc    Obtener valoraciones de un usuario
// @route   GET /api/ratings/user/:userId
// @access  Public
router.get('/user/:userId', catchAsync(async (req, res) => {
  const { page = 1, limit = 10, rating, sortBy = 'createdAt' } = req.query;

  const query = { ratedUser: req.params.userId };

  if (rating) {
    query.rating = parseInt(rating);
  }

  const ratings = await Rating.find(query)
    .populate('rater', 'firstName lastName profilePhoto reputation isVerified')
    .populate('exchange', 'type status completedAt')
    .sort({ [sortBy]: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Rating.countDocuments(query);

  // Obtener estadísticas de valoraciones
  const stats = await Rating.aggregate([
    { $match: { ratedUser: req.params.userId } },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 }
      }
    }
  ]);

  const ratingStats = {
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0
  };

  stats.forEach(stat => {
    ratingStats[stat._id] = stat.count;
  });

  sendPaginatedResponse(res, 200, 'Valoraciones obtenidas', ratings, {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    pages: Math.ceil(total / limit),
    stats: ratingStats
  });
}));

// @desc    Obtener valoraciones realizadas por un usuario
// @route   GET /api/ratings/by-user/:userId
// @access  Private (solo el propio usuario o admin)
router.get('/by-user/:userId', protect, catchAsync(async (req, res) => {
  // Solo el propio usuario puede ver sus valoraciones realizadas
  if (req.params.userId !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('No autorizado', 403));
  }

  const { page = 1, limit = 10 } = req.query;

  const ratings = await Rating.find({ rater: req.params.userId })
    .populate('ratedUser', 'firstName lastName profilePhoto')
    .populate('exchange', 'type status completedAt')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Rating.countDocuments({ rater: req.params.userId });

  sendPaginatedResponse(res, 200, 'Valoraciones realizadas obtenidas', ratings, {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    pages: Math.ceil(total / limit)
  });
}));

// @desc    Obtener valoración específica
// @route   GET /api/ratings/:id
// @access  Public
router.get('/:id', catchAsync(async (req, res) => {
  const rating = await Rating.findById(req.params.id)
    .populate('rater', 'firstName lastName profilePhoto reputation isVerified')
    .populate('ratedUser', 'firstName lastName profilePhoto reputation isVerified')
    .populate('exchange', 'type status completedAt participants');

  if (!rating) {
    return next(new AppError('Valoración no encontrada', 404));
  }

  sendResponse(res, 200, 'Valoración obtenida', rating);
}));

// @desc    Actualizar valoración
// @route   PUT /api/ratings/:id
// @access  Private
router.put('/:id', protect, catchAsync(async (req, res) => {
  const { rating, comment, tags } = req.body;

  const existingRating = await Rating.findById(req.params.id);

  if (!existingRating) {
    return next(new AppError('Valoración no encontrada', 404));
  }

  // Solo el autor puede editar su valoración
  if (existingRating.rater.toString() !== req.user.id) {
    return next(new AppError('Solo puedes editar tus propias valoraciones', 403));
  }

  // Solo permitir edición dentro de las primeras 24 horas
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  if (existingRating.createdAt < twentyFourHoursAgo) {
    return next(new AppError('Solo puedes editar valoraciones dentro de las primeras 24 horas', 400));
  }

  // Actualizar campos
  if (rating !== undefined) {
    if (rating < 1 || rating > 5) {
      return next(new AppError('La puntuación debe estar entre 1 y 5', 400));
    }
    existingRating.rating = rating;
  }

  if (comment !== undefined) {
    existingRating.comment = comment;
  }

  if (tags !== undefined) {
    existingRating.tags = tags;
  }

  existingRating.isEdited = true;
  existingRating.editedAt = new Date();

  await existingRating.save();

  // Recalcular reputación del usuario valorado
  const ratedUser = await User.findById(existingRating.ratedUser);
  await ratedUser.updateReputation();

  await existingRating.populate([
    { path: 'rater', select: 'firstName lastName profilePhoto' },
    { path: 'ratedUser', select: 'firstName lastName profilePhoto' },
    { path: 'exchange', select: 'type status completedAt' }
  ]);

  sendResponse(res, 200, 'Valoración actualizada', existingRating);
}));

// @desc    Eliminar valoración
// @route   DELETE /api/ratings/:id
// @access  Private
router.delete('/:id', protect, catchAsync(async (req, res) => {
  const rating = await Rating.findById(req.params.id);

  if (!rating) {
    return next(new AppError('Valoración no encontrada', 404));
  }

  // Solo el autor o admin pueden eliminar
  if (rating.rater.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('No autorizado para eliminar esta valoración', 403));
  }

  await rating.deleteOne();

  // Recalcular reputación del usuario valorado
  const ratedUser = await User.findById(rating.ratedUser);
  await ratedUser.updateReputation();

  sendResponse(res, 200, 'Valoración eliminada');
}));

// @desc    Marcar valoración como útil
// @route   POST /api/ratings/:id/helpful
// @access  Private
router.post('/:id/helpful', protect, catchAsync(async (req, res) => {
  const rating = await Rating.findById(req.params.id);

  if (!rating) {
    return next(new AppError('Valoración no encontrada', 404));
  }

  if (rating.rater.toString() === req.user.id) {
    return next(new AppError('No puedes marcar tu propia valoración como útil', 400));
  }

  const isHelpful = await rating.toggleHelpful(req.user.id);

  sendResponse(res, 200, isHelpful ? 'Marcado como útil' : 'Desmarcado como útil', {
    helpful: isHelpful,
    helpfulCount: rating.helpfulCount
  });
}));

// @desc    Reportar valoración
// @route   POST /api/ratings/:id/report
// @access  Private
router.post('/:id/report', protect, catchAsync(async (req, res) => {
  const { reason, description } = req.body;

  if (!reason) {
    return next(new AppError('La razón del reporte es requerida', 400));
  }

  const rating = await Rating.findById(req.params.id);

  if (!rating) {
    return next(new AppError('Valoración no encontrada', 404));
  }

  if (rating.rater.toString() === req.user.id) {
    return next(new AppError('No puedes reportar tu propia valoración', 400));
  }

  // Verificar si ya reportó esta valoración
  const existingReport = rating.reports.find(
    report => report.reportedBy.toString() === req.user.id
  );

  if (existingReport) {
    return next(new AppError('Ya has reportado esta valoración', 400));
  }

  await rating.reportRating(req.user.id, reason, description);

  sendResponse(res, 200, 'Valoración reportada exitosamente');
}));

// @desc    Crear intercambio
// @route   POST /api/ratings/exchanges
// @access  Private
router.post('/exchanges', protect, catchAsync(async (req, res) => {
  const { 
    type, 
    participants, 
    publications, 
    terms, 
    proposedDate, 
    location 
  } = req.body;

  if (!type || !participants || participants.length < 2) {
    return next(new AppError('Tipo e participantes (mínimo 2) son requeridos', 400));
  }

  // Verificar que el usuario es uno de los participantes
  const userParticipant = participants.find(p => p.user === req.user.id);
  if (!userParticipant) {
    return next(new AppError('Debes ser uno de los participantes', 400));
  }

  // Verificar que todos los usuarios existen
  const userIds = participants.map(p => p.user);
  const users = await User.find({ _id: { $in: userIds } });
  if (users.length !== userIds.length) {
    return next(new AppError('Uno o más usuarios no existen', 400));
  }

  // Verificar que todas las publicaciones existen y pertenecen a los participantes
  if (publications && publications.length > 0) {
    const pubs = await Publication.find({ _id: { $in: publications } });
    if (pubs.length !== publications.length) {
      return next(new AppError('Una o más publicaciones no existen', 400));
    }

    // Verificar propiedad
    for (const pub of pubs) {
      if (!userIds.includes(pub.owner.toString())) {
        return next(new AppError('Las publicaciones deben pertenecer a los participantes', 400));
      }
    }
  }

  const exchange = await Exchange.create({
    type,
    participants,
    publications: publications || [],
    terms: terms || '',
    proposedDate: proposedDate ? new Date(proposedDate) : undefined,
    location: location || {},
    createdBy: req.user.id
  });

  await exchange.populate([
    { path: 'participants.user', select: 'firstName lastName profilePhoto reputation' },
    { path: 'publications', select: 'title images type category' },
    { path: 'createdBy', select: 'firstName lastName profilePhoto' }
  ]);

  sendResponse(res, 201, 'Intercambio creado exitosamente', exchange);
}));

// @desc    Obtener intercambios del usuario
// @route   GET /api/ratings/exchanges
// @access  Private
router.get('/exchanges', protect, catchAsync(async (req, res) => {
  const { page = 1, limit = 10, status, type } = req.query;

  const query = {
    'participants.user': req.user.id
  };

  if (status) {
    query.status = status;
  }

  if (type) {
    query.type = type;
  }

  const exchanges = await Exchange.find(query)
    .populate('participants.user', 'firstName lastName profilePhoto reputation')
    .populate('publications', 'title images type category')
    .populate('createdBy', 'firstName lastName profilePhoto')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Exchange.countDocuments(query);

  sendPaginatedResponse(res, 200, 'Intercambios obtenidos', exchanges, {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    pages: Math.ceil(total / limit)
  });
}));

// @desc    Actualizar estado del intercambio
// @route   PUT /api/ratings/exchanges/:id/status
// @access  Private
router.put('/exchanges/:id/status', protect, catchAsync(async (req, res) => {
  const { status, response } = req.body;

  if (!['accepted', 'rejected', 'completed', 'cancelled'].includes(status)) {
    return next(new AppError('Estado inválido', 400));
  }

  const exchange = await Exchange.findById(req.params.id);

  if (!exchange) {
    return next(new AppError('Intercambio no encontrado', 404));
  }

  // Verificar que el usuario es participante
  const isParticipant = exchange.participants.some(
    p => p.user.toString() === req.user.id
  );

  if (!isParticipant) {
    return next(new AppError('Solo los participantes pueden actualizar el estado', 403));
  }

  await exchange.respondToExchange(req.user.id, status, response);

  await exchange.populate([
    { path: 'participants.user', select: 'firstName lastName profilePhoto reputation' },
    { path: 'publications', select: 'title images type category' }
  ]);

  sendResponse(res, 200, 'Estado del intercambio actualizado', exchange);
}));

// @desc    Obtener estadísticas de valoraciones
// @route   GET /api/ratings/stats
// @access  Public
router.get('/stats/overview', catchAsync(async (req, res) => {
  const ratingStats = await Rating.aggregate([
    {
      $group: {
        _id: null,
        totalRatings: { $sum: 1 },
        averageRating: { $avg: '$rating' },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ]);

  const exchangeStats = await Exchange.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const topRatedUsers = await Rating.getUserStats(5);

  sendResponse(res, 200, 'Estadísticas obtenidas', {
    ratings: ratingStats[0] || {},
    exchanges: exchangeStats,
    topUsers: topRatedUsers
  });
}));

module.exports = router;