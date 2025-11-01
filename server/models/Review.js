const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  // Usuario que hace la reseña
  reviewer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'El revisor es requerido']
  },
  
  // Usuario que recibe la reseña
  targetUser: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'El usuario objetivo es requerido']
  },
  
  // Intercambio relacionado (opcional)
  exchange: {
    type: mongoose.Schema.ObjectId,
    ref: 'Exchange'
  },
  
  // Publicación relacionada (opcional)
  publication: {
    type: mongoose.Schema.ObjectId,
    ref: 'Publication'
  },
  
  // Calificación
  rating: {
    type: Number,
    required: [true, 'La calificación es requerida'],
    min: [1, 'La calificación mínima es 1'],
    max: [5, 'La calificación máxima es 5']
  },
  
  // Comentario
  comment: {
    type: String,
    required: [true, 'El comentario es requerido'],
    trim: true,
    maxlength: [1000, 'El comentario no puede tener más de 1000 caracteres'],
    minlength: [10, 'El comentario debe tener al menos 10 caracteres']
  },
  
  // Categorías de evaluación
  categories: {
    communication: {
      type: Number,
      min: 1,
      max: 5
    },
    reliability: {
      type: Number,
      min: 1,
      max: 5
    },
    itemCondition: {
      type: Number,
      min: 1,
      max: 5
    },
    punctuality: {
      type: Number,
      min: 1,
      max: 5
    },
    friendliness: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  
  // Respuesta del usuario evaluado
  response: {
    comment: {
      type: String,
      trim: true,
      maxlength: [500, 'La respuesta no puede tener más de 500 caracteres']
    },
    respondedAt: Date
  },
  
  // Estado de la reseña
  status: {
    type: String,
    enum: ['active', 'hidden', 'reported', 'deleted'],
    default: 'active'
  },
  
  // Información de moderación
  moderation: {
    isReported: {
      type: Boolean,
      default: false
    },
    reportCount: {
      type: Number,
      default: 0
    },
    reportReasons: [{
      reason: {
        type: String,
        enum: [
          'inappropriate_content',
          'spam',
          'fake_review',
          'harassment',
          'offensive_language',
          'irrelevant',
          'other'
        ]
      },
      reportedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      },
      reportedAt: {
        type: Date,
        default: Date.now
      },
      description: String
    }],
    moderationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'under_review'],
      default: 'pending'
    },
    moderationNotes: String,
    moderatedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    moderatedAt: Date
  },
  
  // Utilidad de la reseña (votos de otros usuarios)
  helpfulness: {
    helpful: [{
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      },
      votedAt: {
        type: Date,
        default: Date.now
      }
    }],
    notHelpful: [{
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      },
      votedAt: {
        type: Date,
        default: Date.now
      }
    }],
    helpfulCount: {
      type: Number,
      default: 0
    },
    notHelpfulCount: {
      type: Number,
      default: 0
    }
  },
  
  // Verificación de la reseña
  verification: {
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationMethod: {
      type: String,
      enum: ['exchange_completed', 'manual_verification', 'system_verification']
    },
    verifiedAt: Date
  },
  
  // Metadatos
  metadata: {
    deviceInfo: String,
    ipAddress: String,
    userAgent: String,
    location: {
      country: String,
      city: String
    }
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
ReviewSchema.index({ targetUser: 1, status: 1, createdAt: -1 });
ReviewSchema.index({ reviewer: 1, createdAt: -1 });
ReviewSchema.index({ exchange: 1 });
ReviewSchema.index({ publication: 1 });
ReviewSchema.index({ rating: 1 });
ReviewSchema.index({ 'moderation.moderationStatus': 1 });
ReviewSchema.index({ 'verification.isVerified': 1 });

// Índice compuesto para evitar reseñas duplicadas
ReviewSchema.index({ reviewer: 1, targetUser: 1, exchange: 1 }, { unique: true });

// Virtual para calcular calificación promedio de categorías
ReviewSchema.virtual('averageCategoryRating').get(function() {
  const categories = this.categories;
  const ratings = Object.values(categories).filter(rating => rating > 0);
  
  if (ratings.length === 0) return this.rating;
  
  const sum = ratings.reduce((acc, rating) => acc + rating, 0);
  return Math.round((sum / ratings.length) * 10) / 10;
});

// Virtual para calcular puntuación de utilidad
ReviewSchema.virtual('helpfulnessScore').get(function() {
  const helpful = this.helpfulness.helpfulCount;
  const notHelpful = this.helpfulness.notHelpfulCount;
  const total = helpful + notHelpful;
  
  if (total === 0) return 0;
  return Math.round((helpful / total) * 100);
});

// Virtual para verificar si tiene respuesta
ReviewSchema.virtual('hasResponse').get(function() {
  return !!(this.response && this.response.comment);
});

// Middleware pre-save para validaciones
ReviewSchema.pre('save', function(next) {
  // No permitir que un usuario se reseñe a sí mismo
  if (this.reviewer.toString() === this.targetUser.toString()) {
    return next(new Error('No puedes escribir una reseña sobre ti mismo'));
  }
  
  // Actualizar updatedAt
  this.updatedAt = Date.now();
  
  // Actualizar contadores de utilidad
  this.helpfulness.helpfulCount = this.helpfulness.helpful.length;
  this.helpfulness.notHelpfulCount = this.helpfulness.notHelpful.length;
  
  next();
});

// Middleware post-save para actualizar estadísticas del usuario
ReviewSchema.post('save', async function() {
  try {
    const User = mongoose.model('User');
    
    // Calcular nuevas estadísticas para el usuario objetivo
    const stats = await this.constructor.aggregate([
      {
        $match: {
          targetUser: this.targetUser,
          status: 'active',
          'moderation.moderationStatus': 'approved'
        }
      },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$rating' }
        }
      }
    ]);
    
    if (stats.length > 0) {
      await User.findByIdAndUpdate(this.targetUser, {
        'stats.totalReviews': stats[0].totalReviews,
        'stats.averageRating': Math.round(stats[0].averageRating * 10) / 10
      });
    }
  } catch (error) {
    console.error('Error updating user stats:', error);
  }
});

// Método para agregar respuesta
ReviewSchema.methods.addResponse = async function(responseText) {
  this.response = {
    comment: responseText,
    respondedAt: new Date()
  };
  
  await this.save();
};

// Método para reportar reseña
ReviewSchema.methods.report = async function(userId, reason, description = '') {
  // Verificar si ya fue reportada por este usuario
  const existingReport = this.moderation.reportReasons.find(report => 
    report.reportedBy.toString() === userId.toString()
  );
  
  if (existingReport) {
    throw new Error('Ya has reportado esta reseña');
  }
  
  // Agregar reporte
  this.moderation.reportReasons.push({
    reason,
    reportedBy: userId,
    description
  });
  
  this.moderation.reportCount += 1;
  this.moderation.isReported = true;
  
  // Si tiene muchos reportes, cambiar estado
  if (this.moderation.reportCount >= 3) {
    this.moderation.moderationStatus = 'under_review';
  }
  
  await this.save();
};

// Método para votar utilidad
ReviewSchema.methods.voteHelpfulness = async function(userId, isHelpful) {
  // Remover votos anteriores del usuario
  this.helpfulness.helpful = this.helpfulness.helpful.filter(vote => 
    vote.user.toString() !== userId.toString()
  );
  this.helpfulness.notHelpful = this.helpfulness.notHelpful.filter(vote => 
    vote.user.toString() !== userId.toString()
  );
  
  // Agregar nuevo voto
  if (isHelpful) {
    this.helpfulness.helpful.push({ user: userId });
  } else {
    this.helpfulness.notHelpful.push({ user: userId });
  }
  
  await this.save();
};

// Método para verificar reseña
ReviewSchema.methods.verify = async function(method = 'manual_verification') {
  this.verification.isVerified = true;
  this.verification.verificationMethod = method;
  this.verification.verifiedAt = new Date();
  
  await this.save();
};

// Método para moderar reseña
ReviewSchema.methods.moderate = async function(status, notes = '', moderatorId) {
  this.moderation.moderationStatus = status;
  this.moderation.moderationNotes = notes;
  this.moderation.moderatedBy = moderatorId;
  this.moderation.moderatedAt = new Date();
  
  // Si es rechazada, ocultarla
  if (status === 'rejected') {
    this.status = 'hidden';
  }
  
  await this.save();
};

// Método estático para obtener estadísticas de un usuario
ReviewSchema.statics.getUserStats = async function(userId) {
  const stats = await this.aggregate([
    {
      $match: {
        targetUser: mongoose.Types.ObjectId(userId),
        status: 'active',
        'moderation.moderationStatus': 'approved'
      }
    },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageRating: { $avg: '$rating' },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ]);
  
  if (stats.length === 0) {
    return {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }
  
  const result = stats[0];
  
  // Calcular distribución de calificaciones
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  result.ratingDistribution.forEach(rating => {
    distribution[rating] = (distribution[rating] || 0) + 1;
  });
  
  return {
    totalReviews: result.totalReviews,
    averageRating: Math.round(result.averageRating * 10) / 10,
    ratingDistribution: distribution
  };
};

// Método estático para obtener reseñas de un usuario
ReviewSchema.statics.getUserReviews = function(userId, page = 1, limit = 10, filters = {}) {
  const skip = (page - 1) * limit;
  
  const query = {
    targetUser: userId,
    status: 'active',
    'moderation.moderationStatus': 'approved',
    ...filters
  };
  
  return this.find(query)
    .populate('reviewer', 'name avatar stats.reputationScore')
    .populate('exchange', 'status completedAt')
    .populate('publication', 'title images')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Método estático para obtener reseñas pendientes de moderación
ReviewSchema.statics.getPendingModeration = function(page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  
  return this.find({
    'moderation.moderationStatus': { $in: ['pending', 'under_review'] }
  })
  .populate('reviewer', 'name avatar')
  .populate('targetUser', 'name avatar')
  .sort({ 'moderation.reportCount': -1, createdAt: -1 })
  .skip(skip)
  .limit(limit);
};

module.exports = mongoose.model('Review', ReviewSchema);