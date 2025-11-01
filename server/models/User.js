const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true,
    maxlength: [50, 'El nombre no puede tener más de 50 caracteres']
  },
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Por favor ingresa un email válido'
    ]
  },
  password: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    select: false
  },
  avatar: {
    type: String,
    default: 'https://res.cloudinary.com/truequeapp/image/upload/v1/defaults/avatar_default.png'
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Por favor ingresa un número de teléfono válido']
  },
  bio: {
    type: String,
    maxlength: [500, 'La biografía no puede tener más de 500 caracteres']
  },
  location: {
    address: {
      type: String,
      trim: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },
  website: {
    type: String,
    match: [/^https?:\/\/.+/, 'Por favor ingresa una URL válida']
  },
  role: {
    type: String,
    enum: ['user', 'moderator', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  
  // Configuraciones de privacidad
  privacy: {
    showEmail: {
      type: Boolean,
      default: false
    },
    showPhone: {
      type: Boolean,
      default: false
    },
    showLocation: {
      type: Boolean,
      default: true
    },
    allowMessages: {
      type: Boolean,
      default: true
    },
    showOnlineStatus: {
      type: Boolean,
      default: true
    }
  },

  // Configuraciones de notificaciones
  notifications: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    pushNotifications: {
      type: Boolean,
      default: true
    },
    newMessages: {
      type: Boolean,
      default: true
    },
    publicationUpdates: {
      type: Boolean,
      default: true
    },
    exchangeRequests: {
      type: Boolean,
      default: true
    },
    systemUpdates: {
      type: Boolean,
      default: false
    },
    marketingEmails: {
      type: Boolean,
      default: false
    }
  },

  // Estadísticas del usuario
  stats: {
    reputationScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    totalExchanges: {
      type: Number,
      default: 0
    },
    completedExchanges: {
      type: Number,
      default: 0
    },
    totalPublications: {
      type: Number,
      default: 0
    },
    activePublications: {
      type: Number,
      default: 0
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    profileViews: {
      type: Number,
      default: 0
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  },

  // Badges del usuario
  badges: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    icon: String,
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Sesiones activas
  activeSessions: [{
    token: String,
    device: String,
    ip: String,
    userAgent: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    lastActivity: {
      type: Date,
      default: Date.now
    }
  }],

  lastSeen: {
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
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ 'location.coordinates': '2dsphere' });
UserSchema.index({ 'stats.reputationScore': -1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ lastSeen: -1 });

// Virtual para el nivel de reputación
UserSchema.virtual('reputationLevel').get(function() {
  const score = this.stats.reputationScore;
  if (score >= 80) return 'Expert';
  if (score >= 60) return 'Advanced';
  if (score >= 30) return 'Intermediate';
  return 'Beginner';
});

// Virtual para publicaciones del usuario
UserSchema.virtual('publications', {
  ref: 'Publication',
  localField: '_id',
  foreignField: 'user',
  justOne: false
});

// Virtual para reseñas recibidas
UserSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'targetUser',
  justOne: false
});

// Middleware pre-save para hashear contraseña
UserSchema.pre('save', async function(next) {
  // Solo hashear la contraseña si ha sido modificada
  if (!this.isModified('password')) {
    next();
  }

  // Hashear contraseña
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Middleware pre-save para actualizar updatedAt
UserSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Método para verificar contraseña
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Método para generar JWT
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Método para generar refresh token
UserSchema.methods.getRefreshToken = function() {
  return jwt.sign(
    { id: this._id, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE }
  );
};

// Método para generar token de verificación de email
UserSchema.methods.getEmailVerificationToken = function() {
  // Generar token
  const verificationToken = crypto.randomBytes(20).toString('hex');

  // Hashear token y guardarlo en el campo
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  // Establecer expiración (24 horas)
  this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000;

  return verificationToken;
};

// Método para generar token de reset de contraseña
UserSchema.methods.getResetPasswordToken = function() {
  // Generar token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hashear token y guardarlo en el campo
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Establecer expiración (10 minutos)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// Método para actualizar estadísticas
UserSchema.methods.updateStats = async function(updates) {
  Object.keys(updates).forEach(key => {
    if (this.stats[key] !== undefined) {
      this.stats[key] = updates[key];
    }
  });
  
  await this.save();
};

// Método para agregar badge
UserSchema.methods.addBadge = async function(badgeData) {
  // Verificar si ya tiene el badge
  const existingBadge = this.badges.find(badge => badge.name === badgeData.name);
  
  if (!existingBadge) {
    this.badges.push(badgeData);
    await this.save();
  }
};

// Método para actualizar última actividad
UserSchema.methods.updateLastSeen = async function() {
  this.lastSeen = new Date();
  await this.save({ validateBeforeSave: false });
};

// Método estático para buscar usuarios cercanos
UserSchema.statics.findNearby = function(coordinates, maxDistance = 10000) {
  return this.find({
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        $maxDistance: maxDistance
      }
    },
    isActive: true
  });
};

module.exports = mongoose.model('User', UserSchema);