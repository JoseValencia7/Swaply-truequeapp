import api from './api';

const messageService = {
  // Obtener todas las conversaciones del usuario
  getConversations: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const query = queryParams.toString();
    const url = query ? `/messages/conversations?${query}` : '/messages/conversations';
    
    return await api.get(url);
  },

  // Obtener o crear conversación
  getOrCreateConversation: async (participantId, publicationId = null) => {
    const data = { participantId };
    if (publicationId) {
      data.publicationId = publicationId;
    }
    
    return await api.post('/messages/conversations', data);
  },

  // Obtener mensajes de una conversación
  getMessages: async (conversationId, page = 1, limit = 50) => {
    return await api.get(`/messages/conversations/${conversationId}/messages?page=${page}&limit=${limit}`);
  },

  // Enviar mensaje
  sendMessage: async (conversationId, messageData) => {
    const formData = new FormData();
    
    // Agregar contenido del mensaje
    if (messageData.content) {
      formData.append('content', messageData.content);
    }

    // Agregar tipo de mensaje
    if (messageData.type) {
      formData.append('type', messageData.type);
    }

    // Agregar archivos adjuntos
    if (messageData.attachments && messageData.attachments.length > 0) {
      messageData.attachments.forEach((file) => {
        formData.append('attachments', file);
      });
    }

    // Agregar metadatos adicionales
    if (messageData.metadata) {
      formData.append('metadata', JSON.stringify(messageData.metadata));
    }

    return await api.post(`/messages/conversations/${conversationId}/messages`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Editar mensaje
  editMessage: async (messageId, content) => {
    return await api.put(`/messages/${messageId}`, { content });
  },

  // Eliminar mensaje
  deleteMessage: async (messageId) => {
    return await api.delete(`/messages/${messageId}`);
  },

  // Enviar propuesta de intercambio
  sendExchangeProposal: async (conversationId, proposalData) => {
    return await api.post(`/messages/conversations/${conversationId}/proposal`, proposalData);
  },

  // Responder a propuesta de intercambio
  respondToProposal: async (messageId, response, counterOffer = null) => {
    const data = { response };
    if (counterOffer) {
      data.counterOffer = counterOffer;
    }
    
    return await api.post(`/messages/${messageId}/respond`, data);
  },

  // Marcar mensajes como leídos
  markAsRead: async (conversationId) => {
    return await api.post(`/messages/conversations/${conversationId}/read`);
  },

  // Marcar mensajes como entregados
  markAsDelivered: async (conversationId) => {
    return await api.post(`/messages/conversations/${conversationId}/delivered`);
  },

  // Archivar conversación
  archiveConversation: async (conversationId) => {
    return await api.post(`/messages/conversations/${conversationId}/archive`);
  },

  // Desarchivar conversación
  unarchiveConversation: async (conversationId) => {
    return await api.post(`/messages/conversations/${conversationId}/unarchive`);
  },

  // Bloquear conversación
  blockConversation: async (conversationId) => {
    return await api.post(`/messages/conversations/${conversationId}/block`);
  },

  // Desbloquear conversación
  unblockConversation: async (conversationId) => {
    return await api.post(`/messages/conversations/${conversationId}/unblock`);
  },

  // Eliminar conversación
  deleteConversation: async (conversationId) => {
    return await api.delete(`/messages/conversations/${conversationId}`);
  },

  // Obtener estadísticas de mensajes
  getMessageStats: async () => {
    return await api.get('/messages/stats');
  },

  // Buscar mensajes
  searchMessages: async (query, conversationId = null) => {
    const params = new URLSearchParams({ query });
    if (conversationId) {
      params.append('conversationId', conversationId);
    }
    
    return await api.get(`/messages/search?${params.toString()}`);
  },

  // Obtener archivos compartidos en una conversación
  getSharedFiles: async (conversationId, type = null) => {
    const params = new URLSearchParams();
    if (type) {
      params.append('type', type);
    }
    
    const query = params.toString();
    const url = query 
      ? `/messages/conversations/${conversationId}/files?${query}`
      : `/messages/conversations/${conversationId}/files`;
    
    return await api.get(url);
  },

  // Obtener imágenes compartidas en una conversación
  getSharedImages: async (conversationId) => {
    return await api.get(`/messages/conversations/${conversationId}/images`);
  },

  // Exportar conversación
  exportConversation: async (conversationId, format = 'json') => {
    return await api.get(`/messages/conversations/${conversationId}/export?format=${format}`, {
      responseType: 'blob',
    });
  },

  // Reportar mensaje
  reportMessage: async (messageId, reason) => {
    return await api.post(`/messages/${messageId}/report`, { reason });
  },

  // Obtener conversaciones archivadas
  getArchivedConversations: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const query = queryParams.toString();
    const url = query ? `/messages/conversations/archived?${query}` : '/messages/conversations/archived';
    
    return await api.get(url);
  },

  // Obtener conversaciones bloqueadas
  getBlockedConversations: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const query = queryParams.toString();
    const url = query ? `/messages/conversations/blocked?${query}` : '/messages/conversations/blocked';
    
    return await api.get(url);
  },

  // Configurar notificaciones de conversación
  setConversationNotifications: async (conversationId, enabled) => {
    return await api.put(`/messages/conversations/${conversationId}/notifications`, { enabled });
  },

  // Obtener configuración de notificaciones
  getNotificationSettings: async () => {
    return await api.get('/messages/notification-settings');
  },

  // Actualizar configuración de notificaciones
  updateNotificationSettings: async (settings) => {
    return await api.put('/messages/notification-settings', settings);
  },

  // Obtener información de typing (escribiendo)
  sendTypingIndicator: async (conversationId) => {
    return await api.post(`/messages/conversations/${conversationId}/typing`);
  },

  // Detener indicador de typing
  stopTypingIndicator: async (conversationId) => {
    return await api.delete(`/messages/conversations/${conversationId}/typing`);
  },

  // Obtener usuarios en línea en una conversación
  getOnlineUsers: async (conversationId) => {
    return await api.get(`/messages/conversations/${conversationId}/online`);
  },

  // Obtener historial de propuestas de intercambio
  getExchangeProposals: async (conversationId) => {
    return await api.get(`/messages/conversations/${conversationId}/proposals`);
  },

  // Obtener detalles de una propuesta específica
  getProposalDetails: async (messageId) => {
    return await api.get(`/messages/${messageId}/proposal`);
  },
};

export default messageService;