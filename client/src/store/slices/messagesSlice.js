import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import messageService from '../../services/messageService';

// Async thunks
export const fetchConversations = createAsyncThunk(
  'messages/fetchConversations',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await messageService.getConversations(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar conversaciones');
    }
  }
);

export const fetchOrCreateConversation = createAsyncThunk(
  'messages/fetchOrCreateConversation',
  async ({ participantId, publicationId }, { rejectWithValue }) => {
    try {
      const response = await messageService.getOrCreateConversation(participantId, publicationId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al crear conversación');
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'messages/fetchMessages',
  async ({ conversationId, page = 1 }, { rejectWithValue }) => {
    try {
      const response = await messageService.getMessages(conversationId, page);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar mensajes');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async ({ conversationId, messageData }, { rejectWithValue }) => {
    try {
      const response = await messageService.sendMessage(conversationId, messageData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al enviar mensaje');
    }
  }
);

export const editMessage = createAsyncThunk(
  'messages/editMessage',
  async ({ messageId, content }, { rejectWithValue }) => {
    try {
      const response = await messageService.editMessage(messageId, content);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al editar mensaje');
    }
  }
);

export const deleteMessage = createAsyncThunk(
  'messages/deleteMessage',
  async (messageId, { rejectWithValue }) => {
    try {
      await messageService.deleteMessage(messageId);
      return messageId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al eliminar mensaje');
    }
  }
);

export const sendExchangeProposal = createAsyncThunk(
  'messages/sendExchangeProposal',
  async ({ conversationId, proposalData }, { rejectWithValue }) => {
    try {
      const response = await messageService.sendExchangeProposal(conversationId, proposalData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al enviar propuesta');
    }
  }
);

export const respondToProposal = createAsyncThunk(
  'messages/respondToProposal',
  async ({ messageId, response, counterOffer }, { rejectWithValue }) => {
    try {
      const result = await messageService.respondToProposal(messageId, response, counterOffer);
      return result.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al responder propuesta');
    }
  }
);

export const archiveConversation = createAsyncThunk(
  'messages/archiveConversation',
  async (conversationId, { rejectWithValue }) => {
    try {
      const response = await messageService.archiveConversation(conversationId);
      return { conversationId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al archivar conversación');
    }
  }
);

export const unarchiveConversation = createAsyncThunk(
  'messages/unarchiveConversation',
  async (conversationId, { rejectWithValue }) => {
    try {
      const response = await messageService.unarchiveConversation(conversationId);
      return { conversationId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al desarchivar conversación');
    }
  }
);

export const blockConversation = createAsyncThunk(
  'messages/blockConversation',
  async (conversationId, { rejectWithValue }) => {
    try {
      const response = await messageService.blockConversation(conversationId);
      return { conversationId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al bloquear conversación');
    }
  }
);

export const fetchMessageStats = createAsyncThunk(
  'messages/fetchMessageStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await messageService.getMessageStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar estadísticas');
    }
  }
);

// Initial state
const initialState = {
  conversations: [],
  currentConversation: null,
  messages: [],
  stats: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false,
  },
  loading: false,
  messagesLoading: false,
  sendingMessage: false,
  error: null,
  message: null,
  unreadCount: 0,
  typingUsers: [],
  onlineUsers: [],
};

// Messages slice
const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
    setCurrentConversation: (state, action) => {
      state.currentConversation = action.payload;
    },
    clearCurrentConversation: (state) => {
      state.currentConversation = null;
      state.messages = [];
    },
    addMessage: (state, action) => {
      const message = action.payload;
      state.messages.push(message);
      
      // Update conversation's last message
      const conversation = state.conversations.find(conv => conv._id === message.conversation);
      if (conversation) {
        conversation.lastMessage = message;
        conversation.updatedAt = message.createdAt;
        if (message.sender !== state.currentUser?._id) {
          conversation.unreadCount = (conversation.unreadCount || 0) + 1;
        }
      }
    },
    updateMessage: (state, action) => {
      const updatedMessage = action.payload;
      const index = state.messages.findIndex(msg => msg._id === updatedMessage._id);
      if (index !== -1) {
        state.messages[index] = updatedMessage;
      }
    },
    removeMessage: (state, action) => {
      const messageId = action.payload;
      state.messages = state.messages.filter(msg => msg._id !== messageId);
    },
    markMessagesAsRead: (state, action) => {
      const conversationId = action.payload;
      state.messages.forEach(message => {
        if (message.conversation === conversationId && !message.readBy.includes(state.currentUser?._id)) {
          message.readBy.push(state.currentUser?._id);
        }
      });
      
      // Update conversation unread count
      const conversation = state.conversations.find(conv => conv._id === conversationId);
      if (conversation) {
        conversation.unreadCount = 0;
      }
    },
    updateConversation: (state, action) => {
      const updatedConversation = action.payload;
      const index = state.conversations.findIndex(conv => conv._id === updatedConversation._id);
      if (index !== -1) {
        state.conversations[index] = { ...state.conversations[index], ...updatedConversation };
      }
    },
    setTypingUsers: (state, action) => {
      state.typingUsers = action.payload;
    },
    addTypingUser: (state, action) => {
      const userId = action.payload;
      if (!state.typingUsers.includes(userId)) {
        state.typingUsers.push(userId);
      }
    },
    removeTypingUser: (state, action) => {
      const userId = action.payload;
      state.typingUsers = state.typingUsers.filter(id => id !== userId);
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    updateUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },
    incrementUnreadCount: (state) => {
      state.unreadCount += 1;
    },
    decrementUnreadCount: (state, action) => {
      const count = action.payload || 1;
      state.unreadCount = Math.max(0, state.unreadCount - count);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Conversations
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload.conversations;
        state.pagination = action.payload.pagination;
        state.unreadCount = action.payload.unreadCount || 0;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch or Create Conversation
      .addCase(fetchOrCreateConversation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrCreateConversation.fulfilled, (state, action) => {
        state.loading = false;
        state.currentConversation = action.payload.conversation;
        
        // Add to conversations list if not exists
        const exists = state.conversations.find(conv => conv._id === action.payload.conversation._id);
        if (!exists) {
          state.conversations.unshift(action.payload.conversation);
        }
      })
      .addCase(fetchOrCreateConversation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Messages
      .addCase(fetchMessages.pending, (state) => {
        state.messagesLoading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messagesLoading = false;
        if (action.payload.pagination.currentPage === 1) {
          state.messages = action.payload.messages;
        } else {
          // Prepend older messages
          state.messages = [...action.payload.messages, ...state.messages];
        }
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.messagesLoading = false;
        state.error = action.payload;
      })
      
      // Send Message
      .addCase(sendMessage.pending, (state) => {
        state.sendingMessage = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.sendingMessage = false;
        state.messages.push(action.payload.message);
        
        // Update conversation
        const conversation = state.conversations.find(conv => conv._id === action.payload.message.conversation);
        if (conversation) {
          conversation.lastMessage = action.payload.message;
          conversation.updatedAt = action.payload.message.createdAt;
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.sendingMessage = false;
        state.error = action.payload;
      })
      
      // Edit Message
      .addCase(editMessage.fulfilled, (state, action) => {
        const updatedMessage = action.payload.message;
        const index = state.messages.findIndex(msg => msg._id === updatedMessage._id);
        if (index !== -1) {
          state.messages[index] = updatedMessage;
        }
        state.message = action.payload.message;
      })
      .addCase(editMessage.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Delete Message
      .addCase(deleteMessage.fulfilled, (state, action) => {
        const messageId = action.payload;
        state.messages = state.messages.filter(msg => msg._id !== messageId);
        state.message = 'Mensaje eliminado exitosamente';
      })
      .addCase(deleteMessage.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Send Exchange Proposal
      .addCase(sendExchangeProposal.pending, (state) => {
        state.sendingMessage = true;
        state.error = null;
      })
      .addCase(sendExchangeProposal.fulfilled, (state, action) => {
        state.sendingMessage = false;
        state.messages.push(action.payload.message);
        state.message = action.payload.message;
      })
      .addCase(sendExchangeProposal.rejected, (state, action) => {
        state.sendingMessage = false;
        state.error = action.payload;
      })
      
      // Respond to Proposal
      .addCase(respondToProposal.fulfilled, (state, action) => {
        const updatedMessage = action.payload.message;
        const index = state.messages.findIndex(msg => msg._id === updatedMessage._id);
        if (index !== -1) {
          state.messages[index] = updatedMessage;
        }
        state.message = action.payload.message;
      })
      .addCase(respondToProposal.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Archive Conversation
      .addCase(archiveConversation.fulfilled, (state, action) => {
        const { conversationId } = action.payload;
        const conversation = state.conversations.find(conv => conv._id === conversationId);
        if (conversation) {
          conversation.isArchived = true;
        }
        state.message = action.payload.data.message;
      })
      
      // Unarchive Conversation
      .addCase(unarchiveConversation.fulfilled, (state, action) => {
        const { conversationId } = action.payload;
        const conversation = state.conversations.find(conv => conv._id === conversationId);
        if (conversation) {
          conversation.isArchived = false;
        }
        state.message = action.payload.data.message;
      })
      
      // Block Conversation
      .addCase(blockConversation.fulfilled, (state, action) => {
        const { conversationId } = action.payload;
        const conversation = state.conversations.find(conv => conv._id === conversationId);
        if (conversation) {
          conversation.isBlocked = true;
        }
        state.message = action.payload.data.message;
      })
      
      // Fetch Message Stats
      .addCase(fetchMessageStats.fulfilled, (state, action) => {
        state.stats = action.payload.stats;
      });
  },
});

export const {
  clearError,
  clearMessage,
  setCurrentConversation,
  clearCurrentConversation,
  addMessage,
  updateMessage,
  removeMessage,
  markMessagesAsRead,
  updateConversation,
  setTypingUsers,
  addTypingUser,
  removeTypingUser,
  setOnlineUsers,
  updateUnreadCount,
  incrementUnreadCount,
  decrementUnreadCount,
} = messagesSlice.actions;

export default messagesSlice.reducer;