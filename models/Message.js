/**
 * Modelo de Mensaje para Swaply
 * 
 * Define la estructura de datos para el sistema de mensajería interna,
 * permitiendo la comunicación entre usuarios para coordinar intercambios.
 * 
 * Características principales:
 * - Conversaciones organizadas por publicación
 * - Soporte para diferentes tipos de mensaje
 * - Estados de lectura y entrega
 * - Archivos adjuntos
 * - Mensajes del sistema automáticos
 * 
 * @author Jose Manuel Valencia
 * @version 1.0.0
 */

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  // Conversación a la que pertenece el mensaje
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: [true, 'La conversación es obligatoria']
  },
  
  // Usuario que envía el mensaje
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El remitente es obligatorio']
  },
  
  // Usuario que recibe el mensaje
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El destinatario es obligatorio']
  },
  
  // Tipo de mensaje
  type: {
    type: String,
    enum: {
      values: ['text', 'image', 'file', 'system', 'exchange_proposal', 'exchange_accepted', 'exchange_declined'],
      message: 'Tipo de mensaje no válido'
    },
    default: 'text'
  },
  
  // Contenido del mensaje
  content: {
    text: {
      type: String,
      trim: true,
      maxlength: [1000, 'El mensaje no puede exceder 1000 caracteres']
    },
    
    // Para archivos e imágenes
    attachment: {
      url: String,
      filename: String,
      size: Number,
      mimeType: String
    },
    
    // Para propuestas de intercambio
    exchangeProposal: {
      offeredItems: [{
        publicationId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Publication'
        },
        description: String
      }],
      requestedItems: [{
        publicationId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Publication'
        },
        description: String
      }],
      additionalTerms: String,
      meetingLocation: String,
      proposedDate: Date
    }
  },
  
  // Estado del mensaje
  status: {
    sent: {
      type: Boolean,
      default: true
    },
    delivered: {
      type: Boolean,
      default: false
    },
    read: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date,
      default: null
    }
  },
  
  // Respuesta a otro mensaje (para hilos)
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  
  // Mensaje editado
  edited: {
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: {
      type: Date,
      default: null
    },
    originalContent: String
  },
  
  // Mensaje eliminado
  deleted: {
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: {
      type: Date,
      default: null
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Esquema para Conversación
const conversationSchema = new mongoose.Schema({
  // Publicación relacionada
  publication: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Publication',
    required: [true, 'La publicación es obligatoria']
  },
  
  // Participantes de la conversación
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    lastReadAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Último mensaje
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  
  // Estado de la conversación
  status: {
    type: String,
    enum: {
      values: ['active', 'archived', 'blocked'],
      message: 'Estado de conversación no válido'
    },
    default: 'active'
  },
  
  // Configuraciones
  settings: {
    allowNotifications: {
      type: Boolean,
      default: true
    }
  },
  
  // Estadísticas
  stats: {
    totalMessages: {
      type: Number,
      default: 0
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: new Map()
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para optimizar consultas
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1, recipient: 1 });
messageSchema.index({ 'status.read': 1 });

conversationSchema.index({ publication: 1 });
conversationSchema.index({ 'participants.user': 1 });
conversationSchema.index({ lastMessage: 1 });
conversationSchema.index({ updatedAt: -1 });

// Virtual para verificar si el mensaje está visible
messageSchema.virtual('isVisible').get(function() {
  return !this.deleted.isDeleted;
});

// Virtual para obtener el contenido apropiado según el tipo
messageSchema.virtual('displayContent').get(function() {
  if (this.deleted.isDeleted) {
    return 'Este mensaje ha sido eliminado';
  }
  
  switch (this.type) {
    case 'text':
      return this.content.text;
    case 'image':
      return 'Imagen compartida';
    case 'file':
      return `Archivo: ${this.content.attachment?.filename || 'Archivo compartido'}`;
    case 'system':
      return this.content.text;
    case 'exchange_proposal':
      return 'Propuesta de intercambio';
    case 'exchange_accepted':
      return 'Propuesta de intercambio aceptada';
    case 'exchange_declined':
      return 'Propuesta de intercambio rechazada';
    default:
      return this.content.text || 'Mensaje';
  }
});

// Middleware pre-save para actualizar estadísticas de conversación
messageSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      // Actualizar contador de mensajes en la conversación
      await mongoose.model('Conversation').findByIdAndUpdate(
        this.conversation,
        { 
          $inc: { 'stats.totalMessages': 1 },
          lastMessage: this._id,
          updatedAt: new Date()
        }
      );
      
      // Incrementar contador de mensajes no leídos para el destinatario
      await mongoose.model('Conversation').findByIdAndUpdate(
        this.conversation,
        { 
          $inc: { [`stats.unreadCount.${this.recipient}`]: 1 }
        }
      );
    } catch (error) {
      return next(error);
    }
  }
  
  next();
});

// Método de instancia para marcar como leído
messageSchema.methods.markAsRead = async function(userId) {
  if (this.recipient.toString() === userId.toString() && !this.status.read) {
    this.status.read = true;
    this.status.readAt = new Date();
    
    // Decrementar contador de no leídos en la conversación
    await mongoose.model('Conversation').findByIdAndUpdate(
      this.conversation,
      { 
        $inc: { [`stats.unreadCount.${userId}`]: -1 },
        $set: { [`participants.$.lastReadAt`]: new Date() }
      },
      { 
        arrayFilters: [{ 'participants.user': userId }]
      }
    );
    
    return this.save();
  }
  
  return this;
};

// Método de instancia para editar mensaje
messageSchema.methods.editMessage = function(newContent, userId) {
  if (this.sender.toString() !== userId.toString()) {
    throw new Error('Solo el autor puede editar el mensaje');
  }
  
  if (this.type !== 'text') {
    throw new Error('Solo se pueden editar mensajes de texto');
  }
  
  this.edited.originalContent = this.content.text;
  this.content.text = newContent;
  this.edited.isEdited = true;
  this.edited.editedAt = new Date();
  
  return this.save();
};

// Método de instancia para eliminar mensaje
messageSchema.methods.deleteMessage = function(userId) {
  if (this.sender.toString() !== userId.toString()) {
    throw new Error('Solo el autor puede eliminar el mensaje');
  }
  
  this.deleted.isDeleted = true;
  this.deleted.deletedAt = new Date();
  this.deleted.deletedBy = userId;
  
  return this.save();
};

// Método estático para crear mensaje del sistema
messageSchema.statics.createSystemMessage = function(conversationId, content, participants) {
  return this.create({
    conversation: conversationId,
    sender: participants[0], // Usuario del sistema
    recipient: participants[1],
    type: 'system',
    content: { text: content },
    status: {
      sent: true,
      delivered: true,
      read: false
    }
  });
};

// Métodos de instancia para conversación
conversationSchema.methods.addParticipant = function(userId) {
  const exists = this.participants.some(p => p.user.toString() === userId.toString());
  
  if (!exists) {
    this.participants.push({
      user: userId,
      joinedAt: new Date(),
      lastReadAt: new Date()
    });
    
    // Inicializar contador de no leídos
    this.stats.unreadCount.set(userId.toString(), 0);
  }
  
  return this.save();
};

conversationSchema.methods.getUnreadCount = function(userId) {
  return this.stats.unreadCount.get(userId.toString()) || 0;
};

conversationSchema.methods.markAllAsRead = async function(userId) {
  // Marcar todos los mensajes como leídos
  await mongoose.model('Message').updateMany(
    {
      conversation: this._id,
      recipient: userId,
      'status.read': false
    },
    {
      'status.read': true,
      'status.readAt': new Date()
    }
  );
  
  // Resetear contador de no leídos
  this.stats.unreadCount.set(userId.toString(), 0);
  
  // Actualizar última lectura del participante
  const participant = this.participants.find(p => p.user.toString() === userId.toString());
  if (participant) {
    participant.lastReadAt = new Date();
  }
  
  return this.save();
};

// Método estático para obtener conversaciones de un usuario
conversationSchema.statics.getUserConversations = function(userId, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  
  return this.find({
    'participants.user': userId,
    status: 'active'
  })
    .populate('publication', 'title images type')
    .populate('participants.user', 'firstName lastName avatar')
    .populate('lastMessage')
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit);
};

const Message = mongoose.model('Message', messageSchema);
const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = { Message, Conversation };