/**
 * Modelo de Usuario para Swaply
 * 
 * Define la estructura de datos para los usuarios de la plataforma,
 * incluyendo información personal, autenticación, reputación y configuraciones.
 * 
 * Características principales:
 * - Autenticación segura con bcrypt
 * - Sistema de reputación basado en intercambios
 * - Validaciones de datos
 * - Timestamps automáticos
 * - Métodos de instancia para operaciones comunes
 * 
 * @author Jose Manuel Valencia
 * @version 1.0.0
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Información básica del usuario
  firstName: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true,
    maxlength: [50, 'El nombre no puede exceder 50 caracteres']
  },
  
  lastName: {
    type: String,
    required: [true, 'El apellido es obligatorio'],
    trim: true,
    maxlength: [50, 'El apellido no puede exceder 50 caracteres']
  },
  
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Por favor ingresa un email válido'
    ]
  },
  
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    select: false // No incluir en consultas por defecto
  },
  
  // Información del perfil
  avatar: {
    type: String,
    default: null
  },
  
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s-()]+$/, 'Por favor ingresa un número de teléfono válido']
  },
  
  bio: {
    type: String,
    maxlength: [500, 'La biografía no puede exceder 500 caracteres'],
    trim: true
  },
  
  // Ubicación
  location: {
    city: {
      type: String,
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
      trim: true,
      maxlength: [100, 'El país no puede exceder 100 caracteres']
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // Sistema de reputación
  reputation: {
    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalRatings: {
      type: Number,
      default: 0
    },
    completedExchanges: {
      type: Number,
      default: 0
    }
  },
  
  // Configuraciones del usuario
  preferences: {
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      newMessages: {
        type: Boolean,
        default: true
      },
      exchangeUpdates: {
        type: Boolean,
        default: true
      }
    },
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
      }
    }
  },
  
  // Estado de la cuenta
  isActive: {
    type: Boolean,
    default: true
  },
  
  isVerified: {
    type: Boolean,
    default: false
  },
  
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  
  // Tokens para verificación y recuperación
  verificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  // Fecha de último acceso
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true, // Agrega createdAt y updatedAt automáticamente
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para optimizar consultas
userSchema.index({ email: 1 });
userSchema.index({ 'location.city': 1 });
userSchema.index({ 'reputation.score': -1 });
userSchema.index({ createdAt: -1 });

// Virtual para nombre completo
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual para calcular la antigüedad del usuario
userSchema.virtual('memberSince').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffTime = Math.abs(now - created);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 30) {
    return `${diffDays} días`;
  } else if (diffDays < 365) {
    return `${Math.floor(diffDays / 30)} meses`;
  } else {
    return `${Math.floor(diffDays / 365)} años`;
  }
});

// Middleware pre-save para hashear la contraseña
userSchema.pre('save', async function(next) {
  // Solo hashear la contraseña si ha sido modificada
  if (!this.isModified('password')) return next();
  
  try {
    // Hashear la contraseña con bcrypt
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Método de instancia para comparar contraseñas
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Error al comparar contraseñas');
  }
};

// Método para actualizar la reputación
userSchema.methods.updateReputation = function(newRating) {
  const currentTotal = this.reputation.score * this.reputation.totalRatings;
  this.reputation.totalRatings += 1;
  this.reputation.score = (currentTotal + newRating) / this.reputation.totalRatings;
  
  // Redondear a 2 decimales
  this.reputation.score = Math.round(this.reputation.score * 100) / 100;
  
  return this.save();
};

// Método para obtener información pública del usuario
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  
  // Remover información sensible
  delete userObject.password;
  delete userObject.verificationToken;
  delete userObject.passwordResetToken;
  delete userObject.passwordResetExpires;
  
  // Aplicar configuraciones de privacidad
  if (!this.preferences.privacy.showEmail) {
    delete userObject.email;
  }
  
  if (!this.preferences.privacy.showPhone) {
    delete userObject.phone;
  }
  
  if (!this.preferences.privacy.showLocation) {
    delete userObject.location;
  }
  
  return userObject;
};

// Método estático para buscar usuarios por ubicación
userSchema.statics.findByLocation = function(city, state, country) {
  const query = {};
  
  if (city) query['location.city'] = new RegExp(city, 'i');
  if (state) query['location.state'] = new RegExp(state, 'i');
  if (country) query['location.country'] = new RegExp(country, 'i');
  
  return this.find(query).select('-password');
};

// Método estático para obtener usuarios con mejor reputación
userSchema.statics.getTopRatedUsers = function(limit = 10) {
  return this.find({ 'reputation.totalRatings': { $gte: 1 } })
    .sort({ 'reputation.score': -1, 'reputation.totalRatings': -1 })
    .limit(limit)
    .select('-password');
};

module.exports = mongoose.model('User', userSchema);