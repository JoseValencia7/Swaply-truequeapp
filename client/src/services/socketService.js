import { io } from 'socket.io-client';
import { store } from '../store/store';
import { 
  addMessage, 
  updateMessage, 
  removeMessage,
  addTypingUser,
  removeTypingUser,
  setOnlineUsers,
  updateConversation,
  markMessagesAsRead,
  incrementUnreadCount
} from '../store/slices/messagesSlice';
import { 
  handleSocketNotification,
  showToast 
} from '../store/slices/notificationsSlice';
import { getAuthToken } from './api';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  // Conectar al servidor Socket.IO
  connect() {
    if (this.socket && this.isConnected) {
      return;
    }

    const token = getAuthToken();
    if (!token) {
      console.warn('No auth token found, cannot connect to socket');
      return;
    }

    const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

    this.socket = io(SOCKET_URL, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
    });

    this.setupEventListeners();
  }

  // Configurar event listeners
  setupEventListeners() {
    if (!this.socket) return;

    // Eventos de conexión
    this.socket.on('connect', () => {
      console.log('Connected to socket server');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      store.dispatch(showToast({
        message: 'Conectado al servidor',
        type: 'success',
        duration: 2000,
      }));
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from socket server:', reason);
      this.isConnected = false;
      
      if (reason === 'io server disconnect') {
        // El servidor desconectó al cliente, reconectar manualmente
        this.reconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.isConnected = false;
      this.handleReconnect();
    });

    // Eventos de autenticación
    this.socket.on('authenticated', (data) => {
      console.log('Socket authenticated:', data);
    });

    this.socket.on('authentication_error', (error) => {
      console.error('Socket authentication error:', error);
      this.disconnect();
    });

    // Eventos de mensajes
    this.socket.on('new_message', (data) => {
      console.log('New message received:', data);
      store.dispatch(addMessage(data.message));
      
      // Incrementar contador de no leídos si no es del usuario actual
      const state = store.getState();
      const currentUser = state.auth.user;
      if (data.message.sender._id !== currentUser?._id) {
        store.dispatch(incrementUnreadCount());
        
        // Mostrar notificación
        store.dispatch(handleSocketNotification({
          type: 'new_message',
          data: {
            sender: data.message.sender,
            message: data.message,
            conversationId: data.message.conversation,
          }
        }));
      }
    });

    this.socket.on('message_updated', (data) => {
      console.log('Message updated:', data);
      store.dispatch(updateMessage(data.message));
    });

    this.socket.on('message_deleted', (data) => {
      console.log('Message deleted:', data);
      store.dispatch(removeMessage(data.messageId));
    });

    this.socket.on('messages_read', (data) => {
      console.log('Messages marked as read:', data);
      store.dispatch(markMessagesAsRead(data.conversationId));
    });

    // Eventos de typing
    this.socket.on('user_typing', (data) => {
      console.log('User typing:', data);
      store.dispatch(addTypingUser(data.userId));
    });

    this.socket.on('user_stopped_typing', (data) => {
      console.log('User stopped typing:', data);
      store.dispatch(removeTypingUser(data.userId));
    });

    // Eventos de presencia
    this.socket.on('user_online', (data) => {
      console.log('User came online:', data);
      const state = store.getState();
      const onlineUsers = [...state.messages.onlineUsers];
      if (!onlineUsers.includes(data.userId)) {
        onlineUsers.push(data.userId);
        store.dispatch(setOnlineUsers(onlineUsers));
      }
    });

    this.socket.on('user_offline', (data) => {
      console.log('User went offline:', data);
      const state = store.getState();
      const onlineUsers = state.messages.onlineUsers.filter(id => id !== data.userId);
      store.dispatch(setOnlineUsers(onlineUsers));
    });

    this.socket.on('online_users', (data) => {
      console.log('Online users list:', data);
      store.dispatch(setOnlineUsers(data.users));
    });

    // Eventos de conversaciones
    this.socket.on('conversation_updated', (data) => {
      console.log('Conversation updated:', data);
      store.dispatch(updateConversation(data.conversation));
    });

    // Eventos de propuestas de intercambio
    this.socket.on('exchange_proposal', (data) => {
      console.log('Exchange proposal received:', data);
      store.dispatch(addMessage(data.message));
      
      store.dispatch(handleSocketNotification({
        type: 'exchange_proposal',
        data: {
          sender: data.sender,
          publication: data.publication,
        }
      }));
    });

    this.socket.on('proposal_response', (data) => {
      console.log('Proposal response received:', data);
      store.dispatch(updateMessage(data.message));
      
      store.dispatch(showToast({
        message: `Tu propuesta fue ${data.response === 'accepted' ? 'aceptada' : 'rechazada'}`,
        type: data.response === 'accepted' ? 'success' : 'info',
      }));
    });

    // Eventos de notificaciones generales
    this.socket.on('notification', (data) => {
      console.log('Notification received:', data);
      store.dispatch(handleSocketNotification(data));
    });

    // Eventos de ratings
    this.socket.on('new_rating', (data) => {
      console.log('New rating received:', data);
      store.dispatch(handleSocketNotification({
        type: 'new_rating',
        data: {
          rater: data.rater,
          rating: data.rating,
          exchange: data.exchange,
        }
      }));
    });

    // Eventos de seguimiento
    this.socket.on('new_follower', (data) => {
      console.log('New follower:', data);
      store.dispatch(handleSocketNotification({
        type: 'new_follower',
        data: {
          follower: data.follower,
        }
      }));
    });

    // Eventos de publicaciones
    this.socket.on('publication_interest', (data) => {
      console.log('Publication interest:', data);
      store.dispatch(handleSocketNotification({
        type: 'publication_interest',
        data: {
          user: data.user,
          publication: data.publication,
        }
      }));
    });

    // Eventos del sistema
    this.socket.on('system_notification', (data) => {
      console.log('System notification:', data);
      store.dispatch(handleSocketNotification({
        type: 'system',
        data: data,
      }));
    });

    // Eventos de error
    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      store.dispatch(showToast({
        message: error.message || 'Error de conexión',
        type: 'error',
      }));
    });
  }

  // Manejar reconexión
  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.reconnect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
      store.dispatch(showToast({
        message: 'No se pudo conectar al servidor. Verifica tu conexión.',
        type: 'error',
      }));
    }
  }

  // Reconectar
  reconnect() {
    if (this.socket) {
      this.socket.connect();
    } else {
      this.connect();
    }
  }

  // Desconectar
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Unirse a una conversación
  joinConversation(conversationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_conversation', { conversationId });
    }
  }

  // Salir de una conversación
  leaveConversation(conversationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_conversation', { conversationId });
    }
  }

  // Enviar indicador de typing
  sendTyping(conversationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing', { conversationId });
    }
  }

  // Detener indicador de typing
  stopTyping(conversationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('stop_typing', { conversationId });
    }
  }

  // Marcar mensajes como leídos
  markAsRead(conversationId, messageIds) {
    if (this.socket && this.isConnected) {
      this.socket.emit('mark_as_read', { conversationId, messageIds });
    }
  }

  // Enviar mensaje en tiempo real
  sendMessage(conversationId, message) {
    if (this.socket && this.isConnected) {
      this.socket.emit('send_message', { conversationId, message });
    }
  }

  // Actualizar estado de presencia
  updatePresence(status = 'online') {
    if (this.socket && this.isConnected) {
      this.socket.emit('update_presence', { status });
    }
  }

  // Obtener estado de conexión
  isSocketConnected() {
    return this.isConnected && this.socket?.connected;
  }

  // Obtener ID del socket
  getSocketId() {
    return this.socket?.id;
  }
}

// Crear instancia singleton
const socketService = new SocketService();

export default socketService;