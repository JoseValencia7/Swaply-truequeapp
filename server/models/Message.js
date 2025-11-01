const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.ObjectId,
    ref: 'Conversation',
    required: true
  },
  sender: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Contenido del mensaje
  content: {
    text: {
      type: String,
      trim: true,
      maxlength: [2000, 'El mensaje no puede tener más de 2000 caracteres']
    },
    type: {
      type: String,
      enum: ['text', 'image', 'file', 'location', 'exchange_request', 'system'],
      default: 'text'
    },
    
    // Para mensajes de imagen
    image: {
      url: String,
      publicId: String,
      alt: String,
      width: Number,
      height: Number
    },
    
    // Para archivos
    file: {
      url: String,
      publicId: String,
      name: String,
      size: Number,
      mimeType: String
    },
    
    // Para ubicación
    location: {
      address: String,
      coordinates: [Number], // [longitude, latitude]
      name: String
    },
    
    // Para solicitudes de intercambio
    exchangeRequest: {
      publication: {
        type: mongoose.Schema.ObjectId,
        ref: 'Publication'
      },
      offeredItems: [{
        publication: {
          type: mongoose.Schema.ObjectId,
          ref: 'Publication'
        },
        description: String
      }],
      message: String,
      status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'cancelled'],
        default: 'pending'
      }
    },
    
    // Para mensajes del sistema
    systemMessage: {
      type: {
        type: String,
        enum: [
          'exchange_created',
          'exchange_accepted',
          'exchange_rejected',
          'exchange_completed',
          'exchange_cancelled',
          'user_joined',
          'user_left'
        ]
      },
      data: mongoose.Schema.Types.Mixed
    }
  },
  
  // Estado del mensaje
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'failed'],
    default: 'sent'
  },
  
  // Información de lectura
  readBy: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Información de entrega
  deliveredAt: Date,
  readAt: Date,
  
  // Mensaje de respuesta/reply
  replyTo: {
    type: mongoose.Schema.ObjectId,
    ref: 'Message'
  },
  
  // Reacciones al mensaje
  reactions: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    emoji: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Mensaje editado
  isEdited: {
    type: Boolean,
    default: false
  },
  editHistory: [{
    content: String,
    editedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Mensaje eliminado
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  deletedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  
  // Metadatos
  metadata: {
    deviceInfo: String,
    ipAddress: String,
    userAgent: String
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
MessageSchema.index({ conversation: 1, createdAt: -1 });
MessageSchema.index({ sender: 1, createdAt: -1 });
MessageSchema.index({ recipient: 1, status: 1 });
MessageSchema.index({ 'content.type': 1 });
MessageSchema.index({ status: 1 });
MessageSchema.index({ createdAt: -1 });

// Virtual para verificar si el mensaje fue leído
MessageSchema.virtual('isRead').get(function() {
  return this.status === 'read';
});

// Virtual para obtener el contenido formateado
MessageSchema.virtual('formattedContent').get(function() {
  switch (this.content.type) {
    case 'text':
      return this.content.text;
    case 'image':
      return `[Imagen: ${this.content.image.alt || 'Sin descripción'}]`;
    case 'file':
      return `[Archivo: ${this.content.file.name}]`;
    case 'location':
      return `[Ubicación: ${this.content.location.address}]`;
    case 'exchange_request':
      return `[Solicitud de intercambio]`;
    case 'system':
      return this.getSystemMessageText();
    default:
      return this.content.text || '[Mensaje sin contenido]';
  }
});

// Middleware pre-save para actualizar updatedAt
MessageSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Método para marcar como leído
MessageSchema.methods.markAsRead = async function(userId) {
  if (this.status !== 'read') {
    this.status = 'read';
    this.readAt = new Date();
    
    // Agregar a la lista de lectores si no está
    const alreadyRead = this.readBy.some(reader => 
      reader.user.toString() === userId.toString()
    );
    
    if (!alreadyRead) {
      this.readBy.push({ user: userId });
    }
    
    await this.save({ validateBeforeSave: false });
  }
};

// Método para marcar como entregado
MessageSchema.methods.markAsDelivered = async function() {
  if (this.status === 'sent') {
    this.status = 'delivered';
    this.deliveredAt = new Date();
    await this.save({ validateBeforeSave: false });
  }
};

// Método para agregar reacción
MessageSchema.methods.addReaction = async function(userId, emoji) {
  // Remover reacción existente del usuario
  this.reactions = this.reactions.filter(reaction => 
    reaction.user.toString() !== userId.toString()
  );
  
  // Agregar nueva reacción
  this.reactions.push({ user: userId, emoji });
  await this.save({ validateBeforeSave: false });
};

// Método para remover reacción
MessageSchema.methods.removeReaction = async function(userId) {
  this.reactions = this.reactions.filter(reaction => 
    reaction.user.toString() !== userId.toString()
  );
  await this.save({ validateBeforeSave: false });
};

// Método para editar mensaje
MessageSchema.methods.editMessage = async function(newContent) {
  // Guardar contenido anterior en historial
  this.editHistory.push({
    content: this.content.text,
    editedAt: new Date()
  });
  
  // Actualizar contenido
  this.content.text = newContent;
  this.isEdited = true;
  
  await this.save();
};

// Método para eliminar mensaje
MessageSchema.methods.deleteMessage = async function(userId) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = userId;
  
  await this.save({ validateBeforeSave: false });
};

// Método para obtener texto de mensaje del sistema
MessageSchema.methods.getSystemMessageText = function() {
  if (this.content.type !== 'system') return '';
  
  const { type, data } = this.content.systemMessage;
  
  switch (type) {
    case 'exchange_created':
      return 'Se ha creado una nueva solicitud de intercambio';
    case 'exchange_accepted':
      return 'La solicitud de intercambio ha sido aceptada';
    case 'exchange_rejected':
      return 'La solicitud de intercambio ha sido rechazada';
    case 'exchange_completed':
      return 'El intercambio ha sido completado';
    case 'exchange_cancelled':
      return 'El intercambio ha sido cancelado';
    case 'user_joined':
      return `${data.userName} se ha unido a la conversación`;
    case 'user_left':
      return `${data.userName} ha dejado la conversación`;
    default:
      return 'Mensaje del sistema';
  }
};

// Método estático para obtener mensajes no leídos
MessageSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({
    recipient: userId,
    status: { $in: ['sent', 'delivered'] },
    isDeleted: false
  });
};

// Método estático para marcar múltiples mensajes como leídos
MessageSchema.statics.markMultipleAsRead = async function(messageIds, userId) {
  await this.updateMany(
    {
      _id: { $in: messageIds },
      recipient: userId,
      status: { $in: ['sent', 'delivered'] }
    },
    {
      status: 'read',
      readAt: new Date(),
      $addToSet: { readBy: { user: userId } }
    }
  );
};

// Método estático para obtener mensajes de una conversación
MessageSchema.statics.getConversationMessages = function(conversationId, page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  
  return this.find({
    conversation: conversationId,
    isDeleted: false
  })
  .populate('sender', 'name avatar')
  .populate('recipient', 'name avatar')
  .populate('replyTo', 'content.text sender')
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit);
};

// Método estático para buscar mensajes
MessageSchema.statics.searchMessages = function(conversationId, searchTerm) {
  return this.find({
    conversation: conversationId,
    'content.text': { $regex: searchTerm, $options: 'i' },
    isDeleted: false
  })
  .populate('sender', 'name avatar')
  .sort({ createdAt: -1 });
};

module.exports = mongoose.model('Message', MessageSchema);