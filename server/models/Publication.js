const mongoose = require('mongoose');

const PublicationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'El título es requerido'],
    trim: true,
    maxlength: [100, 'El título no puede tener más de 100 caracteres']
  },
  description: {
    type: String,
    required: [true, 'La descripción es requerida'],
    trim: true,
    maxlength: [2000, 'La descripción no puede tener más de 2000 caracteres']
  },
  category: {
    type: String,
    required: [true, 'La categoría es requerida'],
    enum: [
      'electronics',
      'clothing',
      'books',
      'sports',
      'home',
      'toys',
      'vehicles',
      'music',
      'art',
      'tools',
      'jewelry',
      'collectibles',
      'other'
    ]
  },
  subcategory: {
    type: String,
    trim: true
  },
  condition: {
    type: String,
    required: [true, 'La condición es requerida'],
    enum: ['new', 'like_new', 'good', 'fair', 'poor']
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: String,
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Información de intercambio
  exchangeType: {
    type: String,
    required: [true, 'El tipo de intercambio es requerido'],
    enum: ['exchange', 'donation', 'loan']
  },
  wantedItems: [{
    category: String,
    description: String,
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium'
    }
  }],
  estimatedValue: {
    min: {
      type: Number,
      min: 0
    },
    max: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  
  // Ubicación
  location: {
    address: {
      type: String,
      required: [true, 'La dirección es requerida'],
      trim: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      index: '2dsphere'
    },
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  
  // Configuraciones de disponibilidad
  availability: {
    isAvailable: {
      type: Boolean,
      default: true
    },
    availableDays: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    availableHours: {
      start: String, // formato HH:MM
      end: String    // formato HH:MM
    },
    meetingPreferences: [{
      type: String,
      enum: ['public_place', 'my_location', 'their_location', 'shipping']
    }]
  },
  
  // Estado de la publicación
  status: {
    type: String,
    enum: ['active', 'paused', 'exchanged', 'expired', 'deleted'],
    default: 'active'
  },
  
  // Configuraciones de privacidad y moderación
  isPublic: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isReported: {
    type: Boolean,
    default: false
  },
  reportCount: {
    type: Number,
    default: 0
  },
  moderationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'under_review'],
    default: 'pending'
  },
  moderationNotes: String,
  
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
    shares: {
      type: Number,
      default: 0
    },
    inquiries: {
      type: Number,
      default: 0
    },
    uniqueViewers: [{
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      },
      viewedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  
  // Tags y palabras clave
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  // Fechas importantes
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 días
    }
  },
  lastBumpedAt: {
    type: Date,
    default: Date.now
  },
  
  // Campos de auditoría
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices
PublicationSchema.index({ 'location.coordinates': '2dsphere' });
PublicationSchema.index({ category: 1, status: 1 });
PublicationSchema.index({ user: 1, status: 1 });
PublicationSchema.index({ status: 1, createdAt: -1 });
PublicationSchema.index({ expiresAt: 1 });
PublicationSchema.index({ isFeatured: -1, createdAt: -1 });
PublicationSchema.index({ tags: 1 });
PublicationSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Virtual para imagen principal
PublicationSchema.virtual('primaryImage').get(function() {
  const primaryImg = this.images.find(img => img.isPrimary);
  return primaryImg || this.images[0];
});

// Virtual para favoritos del usuario
PublicationSchema.virtual('userFavorites', {
  ref: 'User',
  localField: '_id',
  foreignField: 'favorites',
  justOne: false
});

// Virtual para intercambios relacionados
PublicationSchema.virtual('exchanges', {
  ref: 'Exchange',
  localField: '_id',
  foreignField: 'publication',
  justOne: false
});

// Virtual para reportes
PublicationSchema.virtual('reports', {
  ref: 'Report',
  localField: '_id',
  foreignField: 'targetId',
  justOne: false
});

// Middleware pre-save para actualizar updatedAt
PublicationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Middleware para establecer imagen principal si no existe
PublicationSchema.pre('save', function(next) {
  if (this.images.length > 0 && !this.images.some(img => img.isPrimary)) {
    this.images[0].isPrimary = true;
  }
  next();
});

// Método para incrementar vistas
PublicationSchema.methods.incrementViews = async function(userId = null) {
  this.stats.views += 1;
  
  // Si hay un usuario, agregarlo a viewers únicos
  if (userId && !this.stats.uniqueViewers.some(viewer => viewer.user.toString() === userId.toString())) {
    this.stats.uniqueViewers.push({ user: userId });
  }
  
  await this.save({ validateBeforeSave: false });
};

// Método para incrementar favoritos
PublicationSchema.methods.incrementFavorites = async function() {
  this.stats.favorites += 1;
  await this.save({ validateBeforeSave: false });
};

// Método para decrementar favoritos
PublicationSchema.methods.decrementFavorites = async function() {
  this.stats.favorites = Math.max(0, this.stats.favorites - 1);
  await this.save({ validateBeforeSave: false });
};

// Método para incrementar shares
PublicationSchema.methods.incrementShares = async function() {
  this.stats.shares += 1;
  await this.save({ validateBeforeSave: false });
};

// Método para incrementar consultas
PublicationSchema.methods.incrementInquiries = async function() {
  this.stats.inquiries += 1;
  await this.save({ validateBeforeSave: false });
};

// Método para hacer bump de la publicación
PublicationSchema.methods.bump = async function() {
  this.lastBumpedAt = new Date();
  await this.save({ validateBeforeSave: false });
};

// Método para reportar publicación
PublicationSchema.methods.report = async function() {
  this.reportCount += 1;
  this.isReported = true;
  
  // Si tiene muchos reportes, cambiar estado a revisión
  if (this.reportCount >= 5) {
    this.moderationStatus = 'under_review';
  }
  
  await this.save({ validateBeforeSave: false });
};

// Método para verificar si está expirada
PublicationSchema.methods.isExpired = function() {
  return this.expiresAt < new Date();
};

// Método para extender expiración
PublicationSchema.methods.extendExpiration = async function(days = 30) {
  this.expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  await this.save({ validateBeforeSave: false });
};

// Método estático para buscar publicaciones cercanas
PublicationSchema.statics.findNearby = function(coordinates, maxDistance = 10000, filters = {}) {
  const query = {
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        $maxDistance: maxDistance
      }
    },
    status: 'active',
    isPublic: true,
    moderationStatus: 'approved',
    expiresAt: { $gt: new Date() },
    ...filters
  };
  
  return this.find(query);
};

// Método estático para buscar por texto
PublicationSchema.statics.searchByText = function(searchTerm, filters = {}) {
  const query = {
    $text: { $search: searchTerm },
    status: 'active',
    isPublic: true,
    moderationStatus: 'approved',
    expiresAt: { $gt: new Date() },
    ...filters
  };
  
  return this.find(query, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } });
};

// Método estático para obtener publicaciones populares
PublicationSchema.statics.getPopular = function(limit = 10) {
  return this.find({
    status: 'active',
    isPublic: true,
    moderationStatus: 'approved',
    expiresAt: { $gt: new Date() }
  })
  .sort({ 'stats.views': -1, 'stats.favorites': -1 })
  .limit(limit);
};

// Método estático para obtener publicaciones destacadas
PublicationSchema.statics.getFeatured = function(limit = 5) {
  return this.find({
    status: 'active',
    isPublic: true,
    isFeatured: true,
    moderationStatus: 'approved',
    expiresAt: { $gt: new Date() }
  })
  .sort({ createdAt: -1 })
  .limit(limit);
};

// Middleware para limpiar publicaciones expiradas
PublicationSchema.statics.cleanExpired = async function() {
  await this.updateMany(
    { 
      expiresAt: { $lt: new Date() },
      status: 'active'
    },
    { 
      status: 'expired' 
    }
  );
};

module.exports = mongoose.model('Publication', PublicationSchema);