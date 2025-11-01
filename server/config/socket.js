const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Almacenar usuarios conectados
const connectedUsers = new Map();

const configureSocket = (io) => {
  // Middleware de autenticación para Socket.io
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return next(new Error('Token de autenticación requerido'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('Usuario no encontrado'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Token inválido'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`👤 Usuario conectado: ${socket.user.name} (${socket.userId})`);
    
    // Agregar usuario a la lista de conectados
    connectedUsers.set(socket.userId, {
      socketId: socket.id,
      user: socket.user,
      lastSeen: new Date()
    });

    // Notificar a otros usuarios que este usuario está en línea
    socket.broadcast.emit('user_online', {
      userId: socket.userId,
      user: {
        id: socket.user._id,
        name: socket.user.name,
        avatar: socket.user.avatar
      }
    });

    // Unirse a salas de conversaciones del usuario
    socket.on('join_conversations', async (conversationIds) => {
      try {
        if (Array.isArray(conversationIds)) {
          conversationIds.forEach(conversationId => {
            socket.join(`conversation_${conversationId}`);
          });
          console.log(`📱 Usuario ${socket.user.name} se unió a ${conversationIds.length} conversaciones`);
        }
      } catch (error) {
        console.error('Error al unirse a conversaciones:', error);
      }
    });

    // Unirse a una conversación específica
    socket.on('join_conversation', (conversationId) => {
      socket.join(`conversation_${conversationId}`);
      console.log(`💬 Usuario ${socket.user.name} se unió a conversación ${conversationId}`);
    });

    // Salir de una conversación
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conversation_${conversationId}`);
      console.log(`👋 Usuario ${socket.user.name} salió de conversación ${conversationId}`);
    });

    // Enviar mensaje
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, content, type = 'text' } = data;
        
        // Aquí normalmente guardarías el mensaje en la base de datos
        // const message = await Message.create({ ... });
        
        const messageData = {
          id: Date.now().toString(), // Temporal, usar ID real de la base de datos
          content,
          type,
          sender: {
            id: socket.userId,
            name: socket.user.name,
            avatar: socket.user.avatar
          },
          conversationId,
          createdAt: new Date(),
          isRead: false
        };

        // Enviar mensaje a todos los usuarios en la conversación
        io.to(`conversation_${conversationId}`).emit('new_message', messageData);
        
        console.log(`📨 Mensaje enviado en conversación ${conversationId} por ${socket.user.name}`);
      } catch (error) {
        console.error('Error al enviar mensaje:', error);
        socket.emit('message_error', { error: 'Error al enviar mensaje' });
      }
    });

    // Indicador de escritura
    socket.on('typing_start', (data) => {
      const { conversationId } = data;
      socket.to(`conversation_${conversationId}`).emit('user_typing', {
        userId: socket.userId,
        user: {
          id: socket.user._id,
          name: socket.user.name
        },
        conversationId
      });
    });

    socket.on('typing_stop', (data) => {
      const { conversationId } = data;
      socket.to(`conversation_${conversationId}`).emit('user_stop_typing', {
        userId: socket.userId,
        conversationId
      });
    });

    // Marcar mensajes como leídos
    socket.on('mark_messages_read', async (data) => {
      try {
        const { conversationId, messageIds } = data;
        
        // Aquí actualizarías los mensajes en la base de datos
        // await Message.updateMany({ _id: { $in: messageIds } }, { $addToSet: { readBy: socket.userId } });
        
        socket.to(`conversation_${conversationId}`).emit('messages_read', {
          conversationId,
          messageIds,
          readBy: socket.userId
        });
        
        console.log(`✅ Mensajes marcados como leídos en conversación ${conversationId}`);
      } catch (error) {
        console.error('Error al marcar mensajes como leídos:', error);
      }
    });

    // Notificaciones en tiempo real
    socket.on('subscribe_notifications', () => {
      socket.join(`notifications_${socket.userId}`);
      console.log(`🔔 Usuario ${socket.user.name} suscrito a notificaciones`);
    });

    // Actualización de estado de usuario
    socket.on('update_status', (status) => {
      if (connectedUsers.has(socket.userId)) {
        connectedUsers.get(socket.userId).status = status;
        socket.broadcast.emit('user_status_update', {
          userId: socket.userId,
          status
        });
      }
    });

    // Manejo de desconexión
    socket.on('disconnect', (reason) => {
      console.log(`👋 Usuario desconectado: ${socket.user.name} (${reason})`);
      
      // Remover usuario de la lista de conectados
      connectedUsers.delete(socket.userId);
      
      // Notificar a otros usuarios que este usuario está offline
      socket.broadcast.emit('user_offline', {
        userId: socket.userId,
        lastSeen: new Date()
      });
    });

    // Manejo de errores
    socket.on('error', (error) => {
      console.error(`❌ Error de socket para usuario ${socket.user.name}:`, error);
    });
  });

  // Funciones auxiliares para enviar notificaciones
  io.sendNotificationToUser = (userId, notification) => {
    io.to(`notifications_${userId}`).emit('new_notification', notification);
  };

  io.sendMessageToConversation = (conversationId, message) => {
    io.to(`conversation_${conversationId}`).emit('new_message', message);
  };

  io.getConnectedUsers = () => {
    return Array.from(connectedUsers.values()).map(user => ({
      userId: user.user._id,
      name: user.user.name,
      avatar: user.user.avatar,
      lastSeen: user.lastSeen
    }));
  };

  io.isUserOnline = (userId) => {
    return connectedUsers.has(userId);
  };

  console.log('🔌 Socket.io configurado correctamente');
};

module.exports = configureSocket;