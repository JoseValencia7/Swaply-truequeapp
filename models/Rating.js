/**
 * Modelo de Valoración para Swaply
 * 
 * Define la estructura de datos para el sistema de valoraciones y comentarios
 * entre usuarios después de completar intercambios.
 * 
 * Características principales:
 * - Valoraciones bidireccionales
 * - Sistema de puntuación de 1 a 5 estrellas
 * - Comentarios opcionales
 * - Prevención de valoraciones duplicadas
 * - Cálculo automático de reputación
 * 
 * @author Jose Manuel Valencia
 * @version 1.0.0
 */

const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  // Intercambio relacionado
  exchange: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exchange',
    required: [true, 'El intercambio es obligatorio']
  },
  
  // Usuario que da la valoración
  rater: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El usuario que valora es obligatorio']
  },
  
  // Usuario que recibe la valoración
  rated: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El usuario valorado es obligatorio']
  },
  
  // Puntuación (1-5 estrellas)
  score: {
    type: Number,
    required: [true, 'La puntuación es obligatoria'],
    min: [1, 'La puntuación mínima es 1'],
    max: [5, 'La puntuación máxima es 5'],
    validate: {
      validator: function(value) {
        return Number.isInteger(value);
      },
      message: 'La puntuación debe ser un número entero'
    }
  },
  
  // Comentario opcional
  comment: {
    type: String,
    trim: true,
    maxlength: [500, 'El comentario no puede exceder 500 caracteres']
  },
  
  // Aspectos específicos de la valoración
  aspects: {
    communication: {
      type: Number,
      min: 1,
      max: 5,
      validate: {
        validator: function(value) {
          return value === undefined || Number.isInteger(value);
        },
        message: 'La valoración de comunicación debe ser un número entero'
      }
    },
    punctuality: {
      type: Number,
      min: 1,
      max: 5,
      validate: {
        validator: function(value) {
          return value === undefined || Number.isInteger(value);
        },
        message: 'La valoración de puntualidad debe ser un número entero'
      }
    },
    itemCondition: {
      type: Number,
      min: 1,
      max: 5,
      validate: {
        validator: function(value) {
          return value === undefined || Number.isInteger(value);
        },
        message: 'La valoración de condición del artículo debe ser un número entero'
      }
    },
    overall: {
      type: Number,
      min: 1,
      max: 5,
      validate: {
        validator: function(value) {
          return value === undefined || Number.isInteger(value);
        },
        message: 'La valoración general debe ser un número entero'
      }
    }
  },
  
  // Estado de la valoración
  status: {
    type: String,
    enum: {
      values: ['pending', 'published', 'hidden', 'reported'],
      message: 'Estado de valoración no válido'
    },
    default: 'published'
  },
  
  // Respuesta del usuario valorado
  response: {
    text: {
      type: String,
      trim: true,
      maxlength: [300, 'La respuesta no puede exceder 300 caracteres']
    },
    createdAt: {
      type: Date,
      default: null
    }
  },
  
  // Reportes de la valoración
  reports: [{
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reason: {
      type: String,
      enum: ['inappropriate', 'fake', 'spam', 'offensive', 'other'],
      required: true
    },
    description: {
      type: String,
      maxlength: [200, 'La descripción del reporte no puede exceder 200 caracteres']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Utilidad de la valoración (votos de otros usuarios)
  helpfulness: {
    helpful: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    notHelpful: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Esquema para Intercambio
const exchangeSchema = new mongoose.Schema({
  // Publicación principal del intercambio
  publication: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Publication',
    required: [true, 'La publicación es obligatoria']
  },
  
  // Participantes del intercambio
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    items: [{
      publication: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Publication'
      },
      description: String,
      agreed: {
        type: Boolean,
        default: false
      }
    }],
    agreedToTerms: {
      type: Boolean,
      default: false
    },
    agreedAt: {
      type: Date,
      default: null
    }
  }],
  
  // Estado del intercambio
  status: {
    type: String,
    enum: {
      values: ['proposed', 'negotiating', 'agreed', 'in_progress', 'completed', 'cancelled', 'disputed'],
      message: 'Estado de intercambio no válido'
    },
    default: 'proposed'
  },
  
  // Términos del intercambio
  terms: {
    meetingLocation: {
      address: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    meetingDate: Date,
    additionalTerms: String,
    shippingRequired: {
      type: Boolean,
      default: false
    }
  },
  
  // Fechas importantes
  dates: {
    proposedAt: {
      type: Date,
      default: Date.now
    },
    agreedAt: Date,
    completedAt: Date,
    cancelledAt: Date
  },
  
  // Valoraciones del intercambio
  ratings: {
    participant1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rating',
      default: null
    },
    participant2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rating',
      default: null
    }
  },
  
  // Conversación asociada
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para optimizar consultas
ratingSchema.index({ rater: 1, rated: 1, exchange: 1 }, { unique: true });
ratingSchema.index({ rated: 1, status: 1 });
ratingSchema.index({ score: 1 });
ratingSchema.index({ createdAt: -1 });

exchangeSchema.index({ 'participants.user': 1 });
exchangeSchema.index({ publication: 1 });
exchangeSchema.index({ status: 1 });
exchangeSchema.index({ 'dates.completedAt': -1 });

// Virtual para calcular puntuación de utilidad
ratingSchema.virtual('helpfulnessScore').get(function() {
  const helpful = this.helpfulness.helpful.length;
  const notHelpful = this.helpfulness.notHelpful.length;
  const total = helpful + notHelpful;
  
  if (total === 0) return 0;
  return (helpful / total) * 100;
});

// Virtual para verificar si el intercambio está completo
exchangeSchema.virtual('isCompleted').get(function() {
  return this.status === 'completed';
});

// Virtual para verificar si ambos participantes han valorado
exchangeSchema.virtual('bothRated').get(function() {
  return this.ratings.participant1 && this.ratings.participant2;
});

// Middleware pre-save para validaciones
ratingSchema.pre('save', function(next) {
  // No permitir que un usuario se valore a sí mismo
  if (this.rater.toString() === this.rated.toString()) {
    return next(new Error('Un usuario no puede valorarse a sí mismo'));
  }
  
  // Calcular puntuación general si no está definida
  if (!this.aspects.overall && this.aspects.communication && this.aspects.punctuality && this.aspects.itemCondition) {
    const total = this.aspects.communication + this.aspects.punctuality + this.aspects.itemCondition;
    this.aspects.overall = Math.round(total / 3);
  }
  
  next();
});

// Middleware post-save para actualizar reputación del usuario
ratingSchema.post('save', async function(doc) {
  try {
    const User = mongoose.model('User');
    const user = await User.findById(doc.rated);
    
    if (user) {
      await user.updateReputation(doc.score);
    }
  } catch (error) {
    console.error('Error actualizando reputación:', error);
  }
});

// Método de instancia para agregar respuesta
ratingSchema.methods.addResponse = function(responseText, userId) {
  if (this.rated.toString() !== userId.toString()) {
    throw new Error('Solo el usuario valorado puede responder');
  }
  
  this.response.text = responseText;
  this.response.createdAt = new Date();
  
  return this.save();
};

// Método de instancia para marcar como útil/no útil
ratingSchema.methods.markHelpfulness = function(userId, isHelpful) {
  // Remover de ambas listas primero
  this.helpfulness.helpful = this.helpfulness.helpful.filter(
    id => id.toString() !== userId.toString()
  );
  this.helpfulness.notHelpful = this.helpfulness.notHelpful.filter(
    id => id.toString() !== userId.toString()
  );
  
  // Agregar a la lista correspondiente
  if (isHelpful) {
    this.helpfulness.helpful.push(userId);
  } else {
    this.helpfulness.notHelpful.push(userId);
  }
  
  return this.save();
};

// Método de instancia para reportar valoración
ratingSchema.methods.reportRating = function(reporterId, reason, description) {
  // Verificar que no haya reportado antes
  const existingReport = this.reports.find(
    report => report.reporter.toString() === reporterId.toString()
  );
  
  if (existingReport) {
    throw new Error('Ya has reportado esta valoración');
  }
  
  this.reports.push({
    reporter: reporterId,
    reason,
    description
  });
  
  // Si hay muchos reportes, ocultar automáticamente
  if (this.reports.length >= 3) {
    this.status = 'reported';
  }
  
  return this.save();
};

// Método estático para obtener valoraciones de un usuario
ratingSchema.statics.getUserRatings = function(userId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  return this.find({
    rated: userId,
    status: 'published'
  })
    .populate('rater', 'firstName lastName avatar')
    .populate('exchange', 'publication dates')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Método estático para calcular estadísticas de valoración
ratingSchema.statics.getRatingStats = async function(userId) {
  const stats = await this.aggregate([
    {
      $match: {
        rated: mongoose.Types.ObjectId(userId),
        status: 'published'
      }
    },
    {
      $group: {
        _id: null,
        totalRatings: { $sum: 1 },
        averageScore: { $avg: '$score' },
        scoreDistribution: {
          $push: '$score'
        },
        averageCommunication: { $avg: '$aspects.communication' },
        averagePunctuality: { $avg: '$aspects.punctuality' },
        averageItemCondition: { $avg: '$aspects.itemCondition' }
      }
    }
  ]);
  
  if (stats.length === 0) {
    return {
      totalRatings: 0,
      averageScore: 0,
      scoreDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      aspects: {
        communication: 0,
        punctuality: 0,
        itemCondition: 0
      }
    };
  }
  
  const result = stats[0];
  
  // Calcular distribución de puntuaciones
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  result.scoreDistribution.forEach(score => {
    distribution[score]++;
  });
  
  return {
    totalRatings: result.totalRatings,
    averageScore: Math.round(result.averageScore * 100) / 100,
    scoreDistribution: distribution,
    aspects: {
      communication: Math.round((result.averageCommunication || 0) * 100) / 100,
      punctuality: Math.round((result.averagePunctuality || 0) * 100) / 100,
      itemCondition: Math.round((result.averageItemCondition || 0) * 100) / 100
    }
  };
};

// Métodos para el modelo Exchange
exchangeSchema.methods.markAsCompleted = function() {
  this.status = 'completed';
  this.dates.completedAt = new Date();
  return this.save();
};

exchangeSchema.methods.addRating = function(participantIndex, ratingId) {
  if (participantIndex === 0) {
    this.ratings.participant1 = ratingId;
  } else {
    this.ratings.participant2 = ratingId;
  }
  return this.save();
};

const Rating = mongoose.model('Rating', ratingSchema);
const Exchange = mongoose.model('Exchange', exchangeSchema);

module.exports = { Rating, Exchange };