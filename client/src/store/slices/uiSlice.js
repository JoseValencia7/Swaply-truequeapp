import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  toasts: [],
  isLoading: false,
  sidebarOpen: false,
  theme: 'light'
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
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
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    }
  }
});

export const {
  addToast,
  removeToast,
  clearAllToasts,
  setLoading,
  toggleSidebar,
  setSidebarOpen,
  setTheme
} = uiSlice.actions;

export default uiSlice.reducer;