const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  // Usuario que recibe la notificación
  recipient: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'El destinatario es requerido']
  },
  
  // Usuario que genera la notificación (opcional)
  sender: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  
  // Tipo de notificación
  type: {
    type: String,
    required: [true, 'El tipo de notificación es requerido'],
    enum: [
      // Mensajes
      'new_message',
      'message_read',
      
      // Publicaciones
      'publication_liked',
      'publication_commented',
      'publication_shared',
      'publication_expired',
      'publication_featured',
      
      // Intercambios
      'exchange_request',
      'exchange_accepted',
      'exchange_rejected',
      'exchange_completed',
      'exchange_cancelled',
      'exchange_reminder',
      
      // Reseñas
      'new_review',
      'review_response',
      
      // Seguimiento
      'new_follower',
      'follower_activity',
      
      // Sistema
      'system_update',
      'maintenance',
      'security_alert',
      'account_verified',
      'password_changed',
      'login_alert',
      
      // Promociones
      'promotion',
      'newsletter',
      'feature_announcement',
      
      // Moderación
      'content_approved',
      'content_rejected',
      'account_warning',
      'account_suspended',
      
      // Otros
      'birthday',
      'anniversary',
      'achievement',
      'reminder'
    ]
  },
  
  // Título de la notificación
  title: {
    type: String,
    required: [true, 'El título es requerido'],
    trim: true,
    maxlength: [100, 'El título no puede tener más de 100 caracteres']
  },
  
  // Mensaje de la notificación
  message: {
    type: String,
    required: [true, 'El mensaje es requerido'],
    trim: true,
    maxlength: [500, 'El mensaje no puede tener más de 500 caracteres']
  },
  
  // Datos adicionales específicos del tipo
  data: {
    // Para publicaciones
    publication: {
      type: mongoose.Schema.ObjectId,
      ref: 'Publication'
    },
    
    // Para intercambios
    exchange: {
      type: mongoose.Schema.ObjectId,
      ref: 'Exchange'
    },
    
    // Para mensajes
    message: {
      type: mongoose.Schema.ObjectId,
      ref: 'Message'
    },
    conversation: {
      type: mongoose.Schema.ObjectId,
      ref: 'Conversation'
    },
    
    // Para reseñas
    review: {
      type: mongoose.Schema.ObjectId,
      ref: 'Review'
    },
    
    // Datos adicionales flexibles
    metadata: mongoose.Schema.Types.Mixed
  },
  
  // Estado de la notificación
  status: {
    type: String,
    enum: ['unread', 'read', 'archived', 'deleted'],
    default: 'unread'
  },
  
  // Prioridad
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  
  // Categoría para agrupación
  category: {
    type: String,
    enum: [
      'messages',
      'publications',
      'exchanges',
      'reviews',
      'social',
      'system',
      'security',
      'promotions',
      'moderation'
    ],
    required: true
  },
  
  // Configuración de entrega
  delivery: {
    // Canales de entrega
    channels: [{
      type: {
        type: String,
        enum: ['in_app', 'email', 'push', 'sms'],
        required: true
      },
      status: {
        type: String,
        enum: ['pending', 'sent', 'delivered', 'failed', 'bounced'],
        default: 'pending'
      },
      sentAt: Date,
      deliveredAt: Date,
      failureReason: String,
      attempts: {
        type: Number,
        default: 0
      }
    }],
    
    // Programación
    scheduledFor: Date,
    expiresAt: Date,
    
    // Configuraciones especiales
    requiresAction: {
      type: Boolean,
      default: false
    },
    actionUrl: String,
    actionText: String
  },
  
  // Información de lectura
  readAt: Date,
  
  // Agrupación de notificaciones similares
  grouping: {
    groupKey: String, // Clave para agrupar notificaciones similares
    isGrouped: {
      type: Boolean,
      default: false
    },
    groupCount: {
      type: Number,
      default: 1
    },
    lastGroupedAt: Date
  },
  
  // Configuraciones de visualización
  display: {
    icon: String,
    image: String,
    color: String,
    sound: String,
    badge: String
  },
  
  // Información de seguimiento
  tracking: {
    clicked: {
      type: Boolean,
      default: false
    },
    clickedAt: Date,
    dismissed: {
      type: Boolean,
      default: false
    },
    dismissedAt: Date,
    actionTaken: {
      type: Boolean,
      default: false
    },
    actionTakenAt: Date
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
NotificationSchema.index({ recipient: 1, status: 1, createdAt: -1 });
NotificationSchema.index({ recipient: 1, category: 1, status: 1 });
NotificationSchema.index({ type: 1, createdAt: -1 });
NotificationSchema.index({ 'delivery.scheduledFor': 1 });
NotificationSchema.index({ 'delivery.expiresAt': 1 });
NotificationSchema.index({ 'grouping.groupKey': 1 });
NotificationSchema.index({ priority: 1, status: 1 });

// Virtual para verificar si está leída
NotificationSchema.virtual('isRead').get(function() {
  return this.status === 'read';
});

// Virtual para verificar si está expirada
NotificationSchema.virtual('isExpired').get(function() {
  return this.delivery.expiresAt && this.delivery.expiresAt < new Date();
});

// Virtual para verificar si está programada
NotificationSchema.virtual('isScheduled').get(function() {
  return this.delivery.scheduledFor && this.delivery.scheduledFor > new Date();
});

// Middleware pre-save para actualizar updatedAt
NotificationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Método para marcar como leída
NotificationSchema.methods.markAsRead = async function() {
  if (this.status === 'unread') {
    this.status = 'read';
    this.readAt = new Date();
    await this.save({ validateBeforeSave: false });
  }
};

// Método para marcar como archivada
NotificationSchema.methods.archive = async function() {
  this.status = 'archived';
  await this.save({ validateBeforeSave: false });
};

// Método para marcar como eliminada
NotificationSchema.methods.delete = async function() {
  this.status = 'deleted';
  await this.save({ validateBeforeSave: false });
};

// Método para marcar como clickeada
NotificationSchema.methods.markAsClicked = async function() {
  this.tracking.clicked = true;
  this.tracking.clickedAt = new Date();
  await this.save({ validateBeforeSave: false });
};

// Método para marcar como descartada
NotificationSchema.methods.markAsDismissed = async function() {
  this.tracking.dismissed = true;
  this.tracking.dismissedAt = new Date();
  await this.save({ validateBeforeSave: false });
};

// Método para marcar acción tomada
NotificationSchema.methods.markActionTaken = async function() {
  this.tracking.actionTaken = true;
  this.tracking.actionTakenAt = new Date();
  await this.save({ validateBeforeSave: false });
};

// Método para actualizar estado de entrega
NotificationSchema.methods.updateDeliveryStatus = async function(channel, status, details = {}) {
  const deliveryChannel = this.delivery.channels.find(ch => ch.type === channel);
  
  if (deliveryChannel) {
    deliveryChannel.status = status;
    
    if (status === 'sent') {
      deliveryChannel.sentAt = new Date();
    } else if (status === 'delivered') {
      deliveryChannel.deliveredAt = new Date();
    } else if (status === 'failed') {
      deliveryChannel.failureReason = details.reason;
      deliveryChannel.attempts += 1;
    }
    
    await this.save({ validateBeforeSave: false });
  }
};

// Método estático para crear notificación
NotificationSchema.statics.createNotification = async function(notificationData) {
  // Verificar si se debe agrupar con notificaciones existentes
  if (notificationData.grouping && notificationData.grouping.groupKey) {
    const existingNotification = await this.findOne({
      recipient: notificationData.recipient,
      'grouping.groupKey': notificationData.grouping.groupKey,
      status: 'unread',
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Últimas 24 horas
    });
    
    if (existingNotification) {
      // Actualizar notificación existente
      existingNotification.grouping.groupCount += 1;
      existingNotification.grouping.lastGroupedAt = new Date();
      existingNotification.message = notificationData.message;
      existingNotification.updatedAt = new Date();
      
      await existingNotification.save();
      return existingNotification;
    }
  }
  
  // Crear nueva notificación
  const notification = new this(notificationData);
  await notification.save();
  
  return notification;
};

// Método estático para obtener notificaciones de un usuario
NotificationSchema.statics.getUserNotifications = function(userId, filters = {}, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  
  const query = {
    recipient: userId,
    status: { $ne: 'deleted' },
    ...filters
  };
  
  return this.find(query)
    .populate('sender', 'name avatar')
    .populate('data.publication', 'title images')
    .populate('data.exchange', 'status')
    .populate('data.review', 'rating comment')
    .sort({ priority: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Método estático para contar notificaciones no leídas
NotificationSchema.statics.getUnreadCount = function(userId, category = null) {
  const query = {
    recipient: userId,
    status: 'unread'
  };
  
  if (category) {
    query.category = category;
  }
  
  return this.countDocuments(query);
};

// Método estático para marcar múltiples como leídas
NotificationSchema.statics.markMultipleAsRead = async function(userId, notificationIds = null) {
  const query = {
    recipient: userId,
    status: 'unread'
  };
  
  if (notificationIds) {
    query._id = { $in: notificationIds };
  }
  
  await this.updateMany(query, {
    status: 'read',
    readAt: new Date()
  });
};

// Método estático para limpiar notificaciones antiguas
NotificationSchema.statics.cleanOldNotifications = async function(daysOld = 90) {
  const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
  
  await this.deleteMany({
    createdAt: { $lt: cutoffDate },
    status: { $in: ['read', 'archived'] }
  });
};

// Método estático para obtener notificaciones programadas
NotificationSchema.statics.getScheduledNotifications = function() {
  return this.find({
    'delivery.scheduledFor': { $lte: new Date() },
    status: 'unread',
    'delivery.channels.status': 'pending'
  });
};

// Método estático para obtener estadísticas de notificaciones
NotificationSchema.statics.getNotificationStats = async function(userId, period = 30) {
  const startDate = new Date(Date.now() - period * 24 * 60 * 60 * 1000);
  
  const stats = await this.aggregate([
    {
      $match: {
        recipient: mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          category: '$category',
          status: '$status'
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.category',
        statuses: {
          $push: {
            status: '$_id.status',
            count: '$count'
          }
        },
        total: { $sum: '$count' }
      }
    }
  ]);
  
  return stats;
};

module.exports = mongoose.model('Notification', NotificationSchema);