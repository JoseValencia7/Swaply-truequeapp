const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
  participants: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    leftAt: Date,
    isActive: {
      type: Boolean,
      default: true
    },
    role: {
      type: String,
      enum: ['participant', 'admin'],
      default: 'participant'
    },
    // Configuraciones específicas del participante
    settings: {
      notifications: {
        type: Boolean,
        default: true
      },
      soundEnabled: {
        type: Boolean,
        default: true
      },
      nickname: String
    }
  }],
  
  // Tipo de conversación
  type: {
    type: String,
    enum: ['direct', 'group', 'exchange'],
    default: 'direct'
  },
  
  // Información de la conversación
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'El título no puede tener más de 100 caracteres']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'La descripción no puede tener más de 500 caracteres']
  },
  avatar: {
    url: String,
    publicId: String
  },
  
  // Publicación relacionada (para conversaciones de intercambio)
  relatedPublication: {
    type: mongoose.Schema.ObjectId,
    ref: 'Publication'
  },
  
  // Intercambio relacionado
  relatedExchange: {
    type: mongoose.Schema.ObjectId,
    ref: 'Exchange'
  },
  
  // Último mensaje
  lastMessage: {
    type: mongoose.Schema.ObjectId,
    ref: 'Message'
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  
  // Estado de la conversación
  status: {
    type: String,
    enum: ['active', 'archived', 'blocked', 'deleted'],
    default: 'active'
  },
  
  // Configuraciones de la conversación
  settings: {
    isPublic: {
      type: Boolean,
      default: false
    },
    allowNewMembers: {
      type: Boolean,
      default: false
    },
    autoDeleteMessages: {
      enabled: {
        type: Boolean,
        default: false
      },
      duration: {
        type: Number, // en días
        default: 30
      }
    },
    messageApproval: {
      type: Boolean,
      default: false
    }
  },
  
  // Estadísticas
  stats: {
    totalMessages: {
      type: Number,
      default: 0
    },
    totalParticipants: {
      type: Number,
      default: 0
    },
    activeParticipants: {
      type: Number,
      default: 0
    }
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
    isMuted: {
      type: Boolean,
      default: false
    },
    mutedUntil: Date,
    moderationNotes: String
  },
  
  // Metadatos
  metadata: {
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    tags: [String],
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal'
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
ConversationSchema.index({ 'participants.user': 1, status: 1 });
ConversationSchema.index({ lastMessageAt: -1 });
ConversationSchema.index({ type: 1, status: 1 });
ConversationSchema.index({ relatedPublication: 1 });
ConversationSchema.index({ relatedExchange: 1 });
ConversationSchema.index({ createdAt: -1 });

// Virtual para participantes activos
ConversationSchema.virtual('activeParticipants').get(function() {
  return this.participants.filter(p => p.isActive);
});

// Virtual para mensajes de la conversación
ConversationSchema.virtual('messages', {
  ref: 'Message',
  localField: '_id',
  foreignField: 'conversation',
  justOne: false
});

// Virtual para verificar si es conversación directa
ConversationSchema.virtual('isDirect').get(function() {
  return this.type === 'direct';
});

// Virtual para verificar si es conversación grupal
ConversationSchema.virtual('isGroup').get(function() {
  return this.type === 'group';
});

// Middleware pre-save para actualizar estadísticas
ConversationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  this.stats.totalParticipants = this.participants.length;
  this.stats.activeParticipants = this.participants.filter(p => p.isActive).length;
  next();
});

// Método para agregar participante
ConversationSchema.methods.addParticipant = async function(userId, role = 'participant') {
  // Verificar si ya es participante
  const existingParticipant = this.participants.find(p => 
    p.user.toString() === userId.toString()
  );
  
  if (existingParticipant) {
    // Si estaba inactivo, reactivarlo
    if (!existingParticipant.isActive) {
      existingParticipant.isActive = true;
      existingParticipant.joinedAt = new Date();
      existingParticipant.leftAt = undefined;
    }
  } else {
    // Agregar nuevo participante
    this.participants.push({
      user: userId,
      role: role
    });
  }
  
  await this.save();
};

// Método para remover participante
ConversationSchema.methods.removeParticipant = async function(userId) {
  const participant = this.participants.find(p => 
    p.user.toString() === userId.toString()
  );
  
  if (participant) {
    participant.isActive = false;
    participant.leftAt = new Date();
    await this.save();
  }
};

// Método para verificar si un usuario es participante
ConversationSchema.methods.isParticipant = function(userId) {
  return this.participants.some(p => 
    p.user.toString() === userId.toString() && p.isActive
  );
};

// Método para verificar si un usuario es admin
ConversationSchema.methods.isAdmin = function(userId) {
  const participant = this.participants.find(p => 
    p.user.toString() === userId.toString() && p.isActive
  );
  return participant && participant.role === 'admin';
};

// Método para actualizar último mensaje
ConversationSchema.methods.updateLastMessage = async function(messageId) {
  this.lastMessage = messageId;
  this.lastMessageAt = new Date();
  this.stats.totalMessages += 1;
  await this.save({ validateBeforeSave: false });
};

// Método para archivar conversación
ConversationSchema.methods.archive = async function() {
  this.status = 'archived';
  await this.save({ validateBeforeSave: false });
};

// Método para desarchivar conversación
ConversationSchema.methods.unarchive = async function() {
  this.status = 'active';
  await this.save({ validateBeforeSave: false });
};

// Método para bloquear conversación
ConversationSchema.methods.block = async function() {
  this.status = 'blocked';
  await this.save({ validateBeforeSave: false });
};

// Método para desbloquear conversación
ConversationSchema.methods.unblock = async function() {
  this.status = 'active';
  await this.save({ validateBeforeSave: false });
};

// Método para silenciar conversación
ConversationSchema.methods.mute = async function(duration = null) {
  this.moderation.isMuted = true;
  if (duration) {
    this.moderation.mutedUntil = new Date(Date.now() + duration);
  }
  await this.save({ validateBeforeSave: false });
};

// Método para quitar silencio
ConversationSchema.methods.unmute = async function() {
  this.moderation.isMuted = false;
  this.moderation.mutedUntil = undefined;
  await this.save({ validateBeforeSave: false });
};

// Método para reportar conversación
ConversationSchema.methods.report = async function() {
  this.moderation.reportCount += 1;
  this.moderation.isReported = true;
  await this.save({ validateBeforeSave: false });
};

// Método para obtener participantes con información de usuario
ConversationSchema.methods.getParticipantsWithUserInfo = async function() {
  await this.populate('participants.user', 'name avatar email lastSeen');
  return this.participants.filter(p => p.isActive);
};

// Método estático para encontrar conversación entre usuarios
ConversationSchema.statics.findBetweenUsers = function(userId1, userId2) {
  return this.findOne({
    type: 'direct',
    'participants.user': { $all: [userId1, userId2] },
    'participants.isActive': true,
    status: { $ne: 'deleted' }
  });
};

// Método estático para obtener conversaciones de un usuario
ConversationSchema.statics.getUserConversations = function(userId, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  
  return this.find({
    'participants.user': userId,
    'participants.isActive': true,
    status: { $ne: 'deleted' }
  })
  .populate('participants.user', 'name avatar lastSeen')
  .populate('lastMessage', 'content createdAt sender')
  .populate('relatedPublication', 'title images')
  .sort({ lastMessageAt: -1 })
  .skip(skip)
  .limit(limit);
};

// Método estático para buscar conversaciones
ConversationSchema.statics.searchConversations = function(userId, searchTerm) {
  return this.find({
    'participants.user': userId,
    'participants.isActive': true,
    status: { $ne: 'deleted' },
    $or: [
      { title: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } }
    ]
  })
  .populate('participants.user', 'name avatar')
  .populate('lastMessage', 'content createdAt')
  .sort({ lastMessageAt: -1 });
};

// Método estático para crear conversación directa
ConversationSchema.statics.createDirectConversation = async function(userId1, userId2, relatedPublication = null) {
  // Verificar si ya existe una conversación entre estos usuarios
  const existingConversation = await this.findBetweenUsers(userId1, userId2);
  
  if (existingConversation) {
    return existingConversation;
  }
  
  // Crear nueva conversación
  const conversation = new this({
    type: 'direct',
    participants: [
      { user: userId1 },
      { user: userId2 }
    ],
    relatedPublication: relatedPublication,
    metadata: {
      createdBy: userId1
    }
  });
  
  await conversation.save();
  return conversation;
};

// Método estático para limpiar conversaciones inactivas
ConversationSchema.statics.cleanInactive = async function(daysInactive = 90) {
  const cutoffDate = new Date(Date.now() - daysInactive * 24 * 60 * 60 * 1000);
  
  await this.updateMany(
    {
      lastMessageAt: { $lt: cutoffDate },
      status: 'active'
    },
    {
      status: 'archived'
    }
  );
};

module.exports = mongoose.model('Conversation', ConversationSchema);