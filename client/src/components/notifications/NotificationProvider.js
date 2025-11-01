import React, { createContext, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ToastContainer } from './ToastNotification';
import { selectToastState, hideToast } from '../../store/slices/notificationsSlice';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const dispatch = useDispatch();
  const toastState = useSelector(selectToastState);

  const removeToast = () => {
    dispatch(hideToast());
  };

  return (
    <NotificationContext.Provider value={{}}>
      {children}
      {toastState.show && (
        <ToastContainer 
          toasts={[{
            id: Date.now(),
            message: toastState.message,
            type: toastState.type
          }]} 
          removeToast={removeToast}
          position="top-right"
        />
      )}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;