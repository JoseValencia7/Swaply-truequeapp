import { createSlice } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  notifications: [],
  unreadCount: 0,
  showToast: false,
  toastMessage: '',
  toastType: 'info', // 'success', 'error', 'warning', 'info'
  toasts: [], // Array para múltiples toasts
};

// Notifications slice
const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      const notification = {
        id: Date.now() + Math.random(),
        timestamp: new Date().toISOString(),
        read: false,
        ...action.payload,
      };
      state.notifications.unshift(notification);
      state.unreadCount += 1;
    },
    
    removeNotification: (state, action) => {
      const id = action.payload;
      const notification = state.notifications.find(notif => notif.id === id);
      if (notification && !notification.read) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      state.notifications = state.notifications.filter(notif => notif.id !== id);
    },
    
    markAsRead: (state, action) => {
      const id = action.payload;
      const notification = state.notifications.find(notif => notif.id === id);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    
    markAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true;
      });
      state.unreadCount = 0;
    },
    
    clearAllNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
    
    clearReadNotifications: (state) => {
      state.notifications = state.notifications.filter(notif => !notif.read);
    },
    
    showToast: (state, action) => {
      const { message, type = 'info' } = action.payload;
      state.showToast = true;
      state.toastMessage = message;
      state.toastType = type;
    },
    
    hideToast: (state) => {
      state.showToast = false;
      state.toastMessage = '';
    },
    
    // Funciones para múltiples toasts
    addToast: (state, action) => {
      const toast = {
        id: Date.now() + Math.random(),
        type: action.payload.type || 'info',
        message: action.payload.message,
        duration: action.payload.duration || 5000,
        autoRemove: action.payload.autoRemove !== false,
        ...action.payload
      };
      state.toasts.push(toast);
    },
    
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
    },
    
    clearAllToasts: (state) => {
      state.toasts = [];
    },
    
    // Specific notification types
    addMessageNotification: (state, action) => {
      const { sender, message, conversationId } = action.payload;
      const notification = {
        id: Date.now() + Math.random(),
        type: 'message',
        title: 'Nuevo mensaje',
        message: `${sender.name}: ${message.content}`,
        data: {
          senderId: sender._id,
          conversationId,
          messageId: message._id,
        },
        timestamp: new Date().toISOString(),
        read: false,
      };
      state.notifications.unshift(notification);
      state.unreadCount += 1;
    },
    
    addExchangeProposalNotification: (state, action) => {
      const { sender, publication } = action.payload;
      const notification = {
        id: Date.now() + Math.random(),
        type: 'exchange_proposal',
        title: 'Nueva propuesta de intercambio',
        message: `${sender.name} te ha enviado una propuesta para "${publication.title}"`,
        data: {
          senderId: sender._id,
          publicationId: publication._id,
        },
        timestamp: new Date().toISOString(),
        read: false,
      };
      state.notifications.unshift(notification);
      state.unreadCount += 1;
    },
    
    addRatingNotification: (state, action) => {
      const { rater, rating, exchange } = action.payload;
      const notification = {
        id: Date.now() + Math.random(),
        type: 'rating',
        title: 'Nueva valoración',
        message: `${rater.name} te ha valorado con ${rating.score} estrellas`,
        data: {
          raterId: rater._id,
          ratingId: rating._id,
          exchangeId: exchange._id,
        },
        timestamp: new Date().toISOString(),
        read: false,
      };
      state.notifications.unshift(notification);
      state.unreadCount += 1;
    },
    
    addFollowNotification: (state, action) => {
      const { follower } = action.payload;
      const notification = {
        id: Date.now() + Math.random(),
        type: 'follow',
        title: 'Nuevo seguidor',
        message: `${follower.name} ha comenzado a seguirte`,
        data: {
          followerId: follower._id,
        },
        timestamp: new Date().toISOString(),
        read: false,
      };
      state.notifications.unshift(notification);
      state.unreadCount += 1;
    },
    
    addPublicationInterestNotification: (state, action) => {
      const { user, publication } = action.payload;
      const notification = {
        id: Date.now() + Math.random(),
        type: 'publication_interest',
        title: 'Interés en tu publicación',
        message: `${user.name} está interesado en "${publication.title}"`,
        data: {
          userId: user._id,
          publicationId: publication._id,
        },
        timestamp: new Date().toISOString(),
        read: false,
      };
      state.notifications.unshift(notification);
      state.unreadCount += 1;
    },
    
    addSystemNotification: (state, action) => {
      const { title, message, type = 'system' } = action.payload;
      const notification = {
        id: Date.now() + Math.random(),
        type,
        title,
        message,
        timestamp: new Date().toISOString(),
        read: false,
      };
      state.notifications.unshift(notification);
      state.unreadCount += 1;
    },
    
    // Socket.IO real-time notifications
    handleSocketNotification: (state, action) => {
      const { type, data } = action.payload;
      
      switch (type) {
        case 'new_message':
          notificationsSlice.caseReducers.addMessageNotification(state, { payload: data });
          break;
        case 'exchange_proposal':
          notificationsSlice.caseReducers.addExchangeProposalNotification(state, { payload: data });
          break;
        case 'new_rating':
          notificationsSlice.caseReducers.addRatingNotification(state, { payload: data });
          break;
        case 'new_follower':
          notificationsSlice.caseReducers.addFollowNotification(state, { payload: data });
          break;
        case 'publication_interest':
          notificationsSlice.caseReducers.addPublicationInterestNotification(state, { payload: data });
          break;
        case 'system':
          notificationsSlice.caseReducers.addSystemNotification(state, { payload: data });
          break;
        default:
          notificationsSlice.caseReducers.addNotification(state, { payload: data });
      }
    },
    
    // Bulk operations
    setNotifications: (state, action) => {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter(notif => !notif.read).length;
    },
    
    updateUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },
    
    // Notification preferences
    updateNotificationSettings: (state, action) => {
      state.settings = { ...state.settings, ...action.payload };
    },
  },
});

export const {
  addNotification,
  removeNotification,
  markAsRead,
  markAllAsRead,
  clearAllNotifications,
  clearReadNotifications,
  showToast,
  hideToast,
  addToast,
  removeToast,
  clearAllToasts,
  addMessageNotification,
  addExchangeProposalNotification,
  addRatingNotification,
  addFollowNotification,
  addPublicationInterestNotification,
  addSystemNotification,
  handleSocketNotification,
  setNotifications,
  updateUnreadCount,
  updateNotificationSettings,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;

// Selectors
export const selectNotifications = (state) => state.notifications.notifications;
export const selectUnreadCount = (state) => state.notifications.unreadCount;
export const selectUnreadNotifications = (state) => 
  state.notifications.notifications.filter(notif => !notif.read);
export const selectNotificationsByType = (type) => (state) =>
  state.notifications.notifications.filter(notif => notif.type === type);
export const selectToastState = (state) => ({
  show: state.notifications.showToast,
  message: state.notifications.toastMessage,
  type: state.notifications.toastType,
});