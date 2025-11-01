import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon, 
  XCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { removeToast } from '../../store/slices/notificationsSlice';

/**
 * Componente Toast para mostrar notificaciones temporales
 * Soporta diferentes tipos: success, error, warning, info
 */
const Toast = () => {
  const dispatch = useDispatch();
  const { toasts } = useSelector(state => state.notifications);

  // Auto-remover toasts después de un tiempo
  useEffect(() => {
    toasts.forEach(toast => {
      if (toast.autoRemove !== false) {
        const timer = setTimeout(() => {
          dispatch(removeToast(toast.id));
        }, toast.duration || 5000);

        return () => clearTimeout(timer);
      }
    });
  }, [toasts, dispatch]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={() => dispatch(removeToast(toast.id))}
        />
      ))}
    </div>
  );
};

/**
 * Componente individual de toast
 */
const ToastItem = ({ toast, onRemove }) => {
  const getToastStyles = (type) => {
    switch (type) {
      case 'success':
        return {
          container: 'bg-success-50 border-success-200 text-success-800',
          icon: <CheckCircleIcon className="h-5 w-5 text-success-400" />,
          button: 'text-success-500 hover:text-success-600'
        };
      case 'error':
        return {
          container: 'bg-error-50 border-error-200 text-error-800',
          icon: <XCircleIcon className="h-5 w-5 text-error-400" />,
          button: 'text-error-500 hover:text-error-600'
        };
      case 'warning':
        return {
          container: 'bg-warning-50 border-warning-200 text-warning-800',
          icon: <ExclamationTriangleIcon className="h-5 w-5 text-warning-400" />,
          button: 'text-warning-500 hover:text-warning-600'
        };
      case 'info':
      default:
        return {
          container: 'bg-primary-50 border-primary-200 text-primary-800',
          icon: <InformationCircleIcon className="h-5 w-5 text-primary-400" />,
          button: 'text-primary-500 hover:text-primary-600'
        };
    }
  };

  const styles = getToastStyles(toast.type);

  return (
    <div className={`
      max-w-sm w-full shadow-lg rounded-lg pointer-events-auto border
      ${styles.container}
      animate-slide-down
    `}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {styles.icon}
          </div>
          <div className="ml-3 w-0 flex-1">
            {toast.title && (
              <p className="text-sm font-medium">
                {toast.title}
              </p>
            )}
            <p className={`text-sm ${toast.title ? 'mt-1' : ''}`}>
              {toast.message}
            </p>
            {toast.action && (
              <div className="mt-3">
                <button
                  onClick={toast.action.onClick}
                  className={`text-sm font-medium underline ${styles.button}`}
                >
                  {toast.action.label}
                </button>
              </div>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={onRemove}
              className={`rounded-md inline-flex ${styles.button} focus:outline-none focus:ring-2 focus:ring-offset-2`}
            >
              <span className="sr-only">Cerrar</span>
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Barra de progreso para auto-remove */}
      {toast.autoRemove !== false && (
        <div className="h-1 bg-black bg-opacity-10">
          <div 
            className="h-full bg-current opacity-50 animate-progress"
            style={{
              animationDuration: `${toast.duration || 5000}ms`
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Toast;