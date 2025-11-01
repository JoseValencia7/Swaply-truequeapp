/**
 * Modelo de Publicación para Swaply
 * 
 * Define la estructura de datos para las publicaciones de intercambio,
 * incluyendo ofertas y solicitudes de productos o servicios.
 * 
 * Características principales:
 * - Soporte para ofertas y solicitudes
 * - Sistema de categorías
 * - Gestión de imágenes múltiples
 * - Estados de publicación
 * - Búsqueda y filtrado optimizado
 * - Sistema de favoritos
 * 
 * @author Jose Manuel Valencia
 * @version 1.0.0
 */

const mongoose = require('mongoose');

const publicationSchema = new mongoose.Schema({
  // Información básica
  title: {
    type: String,
    required: [true, 'El título es obligatorio'],
    trim: true,
    maxlength: [100, 'El título no puede exceder 100 caracteres'],
    minlength: [5, 'El título debe tener al menos 5 caracteres']
  },
  
  description: {
    type: String,
    required: [true, 'La descripción es obligatoria'],
    trim: true,
    maxlength: [1000, 'La descripción no puede exceder 1000 caracteres'],
    minlength: [10, 'La descripción debe tener al menos 10 caracteres']
  },
  
  // Tipo de publicación
  type: {
    type: String,
    required: [true, 'El tipo de publicación es obligatorio'],
    enum: {
      values: ['offer', 'request'],
      message: 'El tipo debe ser "offer" (oferta) o "request" (solicitud)'
    }
  },
  
  // Categoría del producto/servicio
  category: {
    type: String,
    required: [true, 'La categoría es obligatoria'],
    enum: {
      values: [
        'electronics', 'clothing', 'books', 'home', 'sports',
        'tools', 'vehicles', 'services', 'food', 'art',
        'music', 'games', 'beauty', 'baby', 'pets', 'other'
      ],
      message: 'Categoría no válida'
    }
  },
  
  // Subcategoría (opcional)
  subcategory: {
    type: String,
    trim: true,
    maxlength: [50, 'La subcategoría no puede exceder 50 caracteres']
  },
  
  // Condición del artículo (para ofertas)
  condition: {
    type: String,
    enum: {
      values: ['new', 'like_new', 'good', 'fair', 'poor', 'not_applicable'],
      message: 'Condición no válida'
    },
    required: function() {
      return this.type === 'offer';
    }
  },
  
  // Imágenes
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  
  // Usuario propietario
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El propietario es obligatorio']
  },
  
  // Ubicación
  location: {
    city: {
      type: String,
      required: [true, 'La ciudad es obligatoria'],
      trim: true,
      maxlength: [100, 'La ciudad no puede exceder 100 caracteres']
    },
    state: {
      type: String,
      trim: true,
      maxlength: [100, 'El estado no puede exceder 100 caracteres']
    },
    country: {
      type: String,
      required: [true, 'El país es obligatorio'],
      trim: true,
      maxlength: [100, 'El país no puede exceder 100 caracteres']
    },
    coordinates: {
      latitude: {
        type: Number,
        min: -90,
        max: 90
      },
      longitude: {
        type: Number,
        min: -180,
        max: 180
      }
    }
  },
  
  // Lo que busca a cambio (para ofertas)
  wantedInReturn: {
    type: String,
    trim: true,
    maxlength: [500, 'Lo que busca a cambio no puede exceder 500 caracteres'],
    required: function() {
      return this.type === 'offer';
    }
  },
  
  // Categorías de interés (para solicitudes)
  interestedCategories: [{
    type: String,
    enum: [
      'electronics', 'clothing', 'books', 'home', 'sports',
      'tools', 'vehicles', 'services', 'food', 'art',
      'music', 'games', 'beauty', 'baby', 'pets', 'other'
    ]
  }],
  
  // Estado de la publicación
  status: {
    type: String,
    enum: {
      values: ['active', 'paused', 'completed', 'expired', 'deleted'],
      message: 'Estado no válido'
    },
    default: 'active'
  },
  
  // Configuraciones
  settings: {
    allowMessages: {
      type: Boolean,
      default: true
    },
    autoExpire: {
      type: Boolean,
      default: true
    },
    expirationDays: {
      type: Number,
      default: 30,
      min: 1,
      max: 365
    }
  },
  
  // Estadísticas
  stats: {
    views: {
      type: Number,
      default: 0
    },
    favorites: {
      type: Number,
      default: 0
    },
    messages: {
      type: Number,
      default: 0
    }
  },
  
  // Usuarios que marcaron como favorito
  favoritedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Fecha de expiración
  expiresAt: {
    type: Date,
    default: function() {
      const days = this.settings?.expirationDays || 30;
      return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    }
  },
  
  // Tags para búsqueda
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [30, 'Cada tag no puede exceder 30 caracteres']
  }],
  
  // Intercambio completado
  exchangeCompletedWith: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  exchangeCompletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para optimizar búsquedas
publicationSchema.index({ title: 'text', description: 'text', tags: 'text' });
publicationSchema.index({ category: 1, type: 1 });
publicationSchema.index({ 'location.city': 1, 'location.country': 1 });
publicationSchema.index({ owner: 1 });
publicationSchema.index({ status: 1 });
publicationSchema.index({ createdAt: -1 });
publicationSchema.index({ expiresAt: 1 });
publicationSchema.index({ 'stats.views': -1 });

// Virtual para obtener la imagen principal
publicationSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary || this.images[0] || null;
});

// Virtual para verificar si está expirada
publicationSchema.virtual('isExpired').get(function() {
  return this.expiresAt && new Date() > this.expiresAt;
});

// Virtual para calcular días restantes
publicationSchema.virtual('daysRemaining').get(function() {
  if (!this.expiresAt) return null;
  
  const now = new Date();
  const expiration = new Date(this.expiresAt);
  const diffTime = expiration - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > 0 ? diffDays : 0;
});

// Middleware pre-save para manejar expiración automática
publicationSchema.pre('save', function(next) {
  // Actualizar fecha de expiración si cambió la configuración
  if (this.isModified('settings.expirationDays') && this.settings.autoExpire) {
    const days = this.settings.expirationDays;
    this.expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }
  
  // Asegurar que solo una imagen sea primaria
  if (this.images && this.images.length > 0) {
    let hasPrimary = false;
    this.images.forEach((img, index) => {
      if (img.isPrimary && !hasPrimary) {
        hasPrimary = true;
      } else if (img.isPrimary && hasPrimary) {
        img.isPrimary = false;
      }
    });
    
    // Si no hay imagen primaria, hacer la primera como primaria
    if (!hasPrimary && this.images.length > 0) {
      this.images[0].isPrimary = true;
    }
  }
  
  next();
});

// Método de instancia para incrementar vistas
publicationSchema.methods.incrementViews = function() {
  this.stats.views += 1;
  return this.save();
};

// Método de instancia para agregar/quitar favorito
publicationSchema.methods.toggleFavorite = function(userId) {
  const index = this.favoritedBy.indexOf(userId);
  
  if (index === -1) {
    // Agregar a favoritos
    this.favoritedBy.push(userId);
    this.stats.favorites += 1;
  } else {
    // Quitar de favoritos
    this.favoritedBy.splice(index, 1);
    this.stats.favorites -= 1;
  }
  
  return this.save();
};

// Método de instancia para marcar como completado
publicationSchema.methods.markAsCompleted = function(exchangePartnerId) {
  this.status = 'completed';
  this.exchangeCompletedWith = exchangePartnerId;
  this.exchangeCompletedAt = new Date();
  return this.save();
};

// Método estático para búsqueda avanzada
publicationSchema.statics.searchPublications = function(filters = {}) {
  const query = { status: 'active' };
  
  // Filtro por texto
  if (filters.search) {
    query.$text = { $search: filters.search };
  }
  
  // Filtro por tipo
  if (filters.type) {
    query.type = filters.type;
  }
  
  // Filtro por categoría
  if (filters.category) {
    query.category = filters.category;
  }
  
  // Filtro por ubicación
  if (filters.city) {
    query['location.city'] = new RegExp(filters.city, 'i');
  }
  
  if (filters.country) {
    query['location.country'] = new RegExp(filters.country, 'i');
  }
  
  // Filtro por condición
  if (filters.condition) {
    query.condition = filters.condition;
  }
  
  // Excluir publicaciones expiradas
  query.expiresAt = { $gt: new Date() };
  
  return this.find(query)
    .populate('owner', 'firstName lastName avatar reputation location')
    .sort(filters.sort || { createdAt: -1 });
};

// Método estático para obtener publicaciones populares
publicationSchema.statics.getPopularPublications = function(limit = 10) {
  return this.find({ 
    status: 'active',
    expiresAt: { $gt: new Date() }
  })
    .populate('owner', 'firstName lastName avatar reputation')
    .sort({ 'stats.views': -1, 'stats.favorites': -1 })
    .limit(limit);
};

// Método estático para obtener publicaciones recientes
publicationSchema.statics.getRecentPublications = function(limit = 10) {
  return this.find({ 
    status: 'active',
    expiresAt: { $gt: new Date() }
  })
    .populate('owner', 'firstName lastName avatar reputation')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Método estático para limpiar publicaciones expiradas
publicationSchema.statics.cleanExpiredPublications = function() {
  return this.updateMany(
    { 
      expiresAt: { $lt: new Date() },
      status: 'active'
    },
    { status: 'expired' }
  );
};

module.exports = mongoose.model('Publication', publicationSchema);