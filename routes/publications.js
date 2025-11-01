const express = require('express');
const multer = require('multer');
const path = require('path');
const Publication = require('../models/Publication');
const User = require('../models/User');
const { protect, checkOwnership } = require('../middleware/auth');
const { catchAsync, sendResponse, sendPaginatedResponse } = require('../middleware/errorHandler');
const AppError = require('../middleware/errorHandler').AppError;

const router = express.Router();

// Configuración de multer para subida de imágenes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/publications/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'pub-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB por imagen
    files: 5 // Máximo 5 imágenes
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new AppError('Solo se permiten archivos de imagen', 400), false);
    }
  }
});

// @desc    Obtener todas las publicaciones con filtros
// @route   GET /api/publications
// @access  Public
router.get('/', catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    type,
    category,
    condition,
    location,
    search,
    minRating,
    sortBy = 'createdAt',
    order = 'desc'
  } = req.query;

  const query = { status: 'active' };

  // Filtros
  if (type && ['offer', 'request'].includes(type)) {
    query.type = type;
  }

  if (category) {
    query.category = category;
  }

  if (condition && ['new', 'like_new', 'good', 'fair', 'poor'].includes(condition)) {
    query.condition = condition;
  }

  if (location) {
    query.$or = [
      { 'location.city': { $regex: location, $options: 'i' } },
      { 'location.state': { $regex: location, $options: 'i' } }
    ];
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
  }

  // Filtro por reputación del propietario
  let publications;
  if (minRating) {
    publications = await Publication.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'users',
          localField: 'owner',
          foreignField: '_id',
          as: 'ownerData'
        }
      },
      {
        $match: {
          'ownerData.reputation.average': { $gte: parseFloat(minRating) }
        }
      },
      {
        $sort: { [sortBy]: order === 'desc' ? -1 : 1 }
      },
      { $skip: (page - 1) * limit },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'users',
          localField: 'owner',
          foreignField: '_id',
          as: 'owner',
          pipeline: [
            {
              $project: {
                firstName: 1,
                lastName: 1,
                profilePhoto: 1,
                reputation: 1,
                isVerified: 1
              }
            }
          ]
        }
      },
      { $unwind: '$owner' }
    ]);
  } else {
    publications = await Publication.find(query)
      .populate('owner', 'firstName lastName profilePhoto reputation isVerified')
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
  }

  const total = await Publication.countDocuments(query);

  sendPaginatedResponse(res, 200, 'Publicaciones obtenidas exitosamente', publications, {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    pages: Math.ceil(total / limit)
  });
}));

// @desc    Crear nueva publicación
// @route   POST /api/publications
// @access  Private
router.post('/', protect, upload.array('images', 5), catchAsync(async (req, res) => {
  const {
    title,
    description,
    type,
    category,
    condition,
    estimatedValue,
    wantedItems,
    interestedCategories,
    tags,
    allowNegotiation,
    isPrivate,
    expirationDays
  } = req.body;

  // Validaciones básicas
  if (!title || !description || !type || !category) {
    return next(new AppError('Título, descripción, tipo y categoría son requeridos', 400));
  }

  // Procesar imágenes subidas
  const images = req.files ? req.files.map(file => `/uploads/publications/${file.filename}`) : [];

  // Obtener ubicación del usuario
  const user = await User.findById(req.user.id);

  const publicationData = {
    title,
    description,
    type,
    category,
    condition,
    estimatedValue: estimatedValue ? parseFloat(estimatedValue) : undefined,
    images,
    owner: req.user.id,
    location: user.location,
    wantedItems: wantedItems ? wantedItems.split(',').map(item => item.trim()) : [],
    interestedCategories: interestedCategories ? interestedCategories.split(',') : [],
    tags: tags ? tags.split(',').map(tag => tag.trim().toLowerCase()) : [],
    settings: {
      allowNegotiation: allowNegotiation === 'true',
      isPrivate: isPrivate === 'true'
    }
  };

  // Configurar fecha de expiración
  if (expirationDays) {
    const expiration = new Date();
    expiration.setDate(expiration.getDate() + parseInt(expirationDays));
    publicationData.expirationDate = expiration;
  }

  const publication = await Publication.create(publicationData);
  await publication.populate('owner', 'firstName lastName profilePhoto reputation isVerified');

  sendResponse(res, 201, 'Publicación creada exitosamente', publication);
}));

// @desc    Obtener publicación por ID
// @route   GET /api/publications/:id
// @access  Public
router.get('/:id', catchAsync(async (req, res) => {
  const publication = await Publication.findById(req.params.id)
    .populate('owner', 'firstName lastName profilePhoto reputation isVerified joinDate')
    .populate('favoritedBy', 'firstName lastName profilePhoto');

  if (!publication) {
    return next(new AppError('Publicación no encontrada', 404));
  }

  // Incrementar vistas si no es el propietario
  if (!req.user || req.user.id !== publication.owner._id.toString()) {
    await publication.incrementViews();
  }

  sendResponse(res, 200, 'Publicación obtenida exitosamente', publication);
}));

// @desc    Actualizar publicación
// @route   PUT /api/publications/:id
// @access  Private
router.put('/:id', protect, checkOwnership(Publication), upload.array('newImages', 5), catchAsync(async (req, res) => {
  const {
    title,
    description,
    condition,
    estimatedValue,
    wantedItems,
    interestedCategories,
    tags,
    allowNegotiation,
    isPrivate,
    removeImages
  } = req.body;

  const publication = await Publication.findById(req.params.id);

  // Actualizar campos básicos
  if (title) publication.title = title;
  if (description) publication.description = description;
  if (condition) publication.condition = condition;
  if (estimatedValue) publication.estimatedValue = parseFloat(estimatedValue);
  if (wantedItems) publication.wantedItems = wantedItems.split(',').map(item => item.trim());
  if (interestedCategories) publication.interestedCategories = interestedCategories.split(',');
  if (tags) publication.tags = tags.split(',').map(tag => tag.trim().toLowerCase());

  // Actualizar configuraciones
  if (allowNegotiation !== undefined) publication.settings.allowNegotiation = allowNegotiation === 'true';
  if (isPrivate !== undefined) publication.settings.isPrivate = isPrivate === 'true';

  // Manejar imágenes
  if (removeImages) {
    const imagesToRemove = removeImages.split(',');
    publication.images = publication.images.filter(img => !imagesToRemove.includes(img));
  }

  if (req.files && req.files.length > 0) {
    const newImages = req.files.map(file => `/uploads/publications/${file.filename}`);
    publication.images = [...publication.images, ...newImages];
  }

  await publication.save();
  await publication.populate('owner', 'firstName lastName profilePhoto reputation isVerified');

  sendResponse(res, 200, 'Publicación actualizada exitosamente', publication);
}));

// @desc    Eliminar publicación
// @route   DELETE /api/publications/:id
// @access  Private
router.delete('/:id', protect, checkOwnership(Publication), catchAsync(async (req, res) => {
  const publication = await Publication.findById(req.params.id);
  
  publication.status = 'deleted';
  await publication.save();

  sendResponse(res, 200, 'Publicación eliminada exitosamente');
}));

// @desc    Marcar/Desmarcar como favorito
// @route   POST /api/publications/:id/favorite
// @access  Private
router.post('/:id/favorite', protect, catchAsync(async (req, res) => {
  const publication = await Publication.findById(req.params.id);
  
  if (!publication) {
    return next(new AppError('Publicación no encontrada', 404));
  }

  const user = await User.findById(req.user.id);
  const isFavorited = await publication.toggleFavorite(req.user.id);

  if (isFavorited) {
    if (!user.favoritePublications.includes(publication._id)) {
      user.favoritePublications.push(publication._id);
    }
  } else {
    user.favoritePublications.pull(publication._id);
  }

  await user.save();

  sendResponse(res, 200, isFavorited ? 'Agregado a favoritos' : 'Removido de favoritos', {
    favorited: isFavorited,
    favoritesCount: publication.statistics.favorites
  });
}));

// @desc    Buscar publicaciones avanzada
// @route   POST /api/publications/search
// @access  Public
router.post('/search', catchAsync(async (req, res) => {
  const {
    query,
    filters,
    location,
    radius,
    page = 1,
    limit = 12,
    sortBy = 'relevance'
  } = req.body;

  const searchResults = await Publication.advancedSearch({
    query,
    filters,
    location,
    radius,
    page: parseInt(page),
    limit: parseInt(limit),
    sortBy
  });

  sendPaginatedResponse(res, 200, 'Búsqueda completada', searchResults.publications, {
    page: parseInt(page),
    limit: parseInt(limit),
    total: searchResults.total,
    pages: Math.ceil(searchResults.total / limit)
  });
}));

// @desc    Obtener publicaciones populares
// @route   GET /api/publications/popular
// @access  Public
router.get('/popular', catchAsync(async (req, res) => {
  const { limit = 10, timeframe = 'week' } = req.query;

  const publications = await Publication.getPopular(parseInt(limit), timeframe);

  sendResponse(res, 200, 'Publicaciones populares obtenidas', publications);
}));

// @desc    Obtener publicaciones recientes
// @route   GET /api/publications/recent
// @access  Public
router.get('/recent', catchAsync(async (req, res) => {
  const { limit = 10, category } = req.query;

  const publications = await Publication.getRecent(parseInt(limit), category);

  sendResponse(res, 200, 'Publicaciones recientes obtenidas', publications);
}));

// @desc    Obtener publicaciones del usuario
// @route   GET /api/publications/user/:userId
// @access  Public
router.get('/user/:userId', catchAsync(async (req, res) => {
  const { page = 1, limit = 12, status = 'active' } = req.query;

  const query = { owner: req.params.userId };
  
  if (status !== 'all') {
    query.status = status;
  }

  const publications = await Publication.find(query)
    .populate('owner', 'firstName lastName profilePhoto reputation isVerified')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Publication.countDocuments(query);

  sendPaginatedResponse(res, 200, 'Publicaciones del usuario obtenidas', publications, {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    pages: Math.ceil(total / limit)
  });
}));

// @desc    Reportar publicación
// @route   POST /api/publications/:id/report
// @access  Private
router.post('/:id/report', protect, catchAsync(async (req, res) => {
  const { reason, description } = req.body;

  if (!reason) {
    return next(new AppError('La razón del reporte es requerida', 400));
  }

  const publication = await Publication.findById(req.params.id);
  
  if (!publication) {
    return next(new AppError('Publicación no encontrada', 404));
  }

  if (publication.owner.toString() === req.user.id) {
    return next(new AppError('No puedes reportar tu propia publicación', 400));
  }

  // Verificar si ya reportó esta publicación
  const existingReport = publication.reports.find(
    report => report.reportedBy.toString() === req.user.id
  );

  if (existingReport) {
    return next(new AppError('Ya has reportado esta publicación', 400));
  }

  publication.reports.push({
    reportedBy: req.user.id,
    reason,
    description,
    date: new Date()
  });

  await publication.save();

  sendResponse(res, 200, 'Publicación reportada exitosamente');
}));

// @desc    Marcar publicación como completada
// @route   POST /api/publications/:id/complete
// @access  Private
router.post('/:id/complete', protect, checkOwnership(Publication), catchAsync(async (req, res) => {
  const { exchangedWith, exchangeDetails } = req.body;

  const publication = await Publication.findById(req.params.id);

  if (publication.status !== 'active') {
    return next(new AppError('Solo se pueden completar publicaciones activas', 400));
  }

  await publication.markAsCompleted(exchangedWith, exchangeDetails);

  sendResponse(res, 200, 'Publicación marcada como completada', publication);
}));

// @desc    Obtener estadísticas de publicaciones
// @route   GET /api/publications/stats/overview
// @access  Public
router.get('/stats/overview', catchAsync(async (req, res) => {
  const stats = await Publication.aggregate([
    {
      $group: {
        _id: null,
        totalPublications: { $sum: 1 },
        activePublications: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        completedPublications: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        totalViews: { $sum: '$statistics.views' },
        totalFavorites: { $sum: '$statistics.favorites' }
      }
    }
  ]);

  const categoryStats = await Publication.aggregate([
    { $match: { status: 'active' } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);

  sendResponse(res, 200, 'Estadísticas obtenidas', {
    overview: stats[0] || {},
    byCategory: categoryStats
  });
}));

module.exports = router;