import React, { useState, useEffect } from 'react';
import { 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaTimesCircle, 
  FaInfoCircle,
  FaTimes 
} from 'react-icons/fa';

const ToastNotification = ({ 
  type = 'info', 
  title, 
  message, 
  duration = 5000, 
  onClose,
  position = 'top-right',
  showProgress = true 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (duration > 0) {
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev - (100 / (duration / 100));
          return newProgress <= 0 ? 0 : newProgress;
        });
      }, 100);

      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => {
        clearInterval(progressInterval);
        clearTimeout(timer);
      };
    }
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300); // Tiempo para la animación de salida
  };

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: <FaCheckCircle className="h-5 w-5" />,
          bgColor: 'bg-green-500',
          textColor: 'text-white',
          borderColor: 'border-green-600'
        };
      case 'error':
        return {
          icon: <FaTimesCircle className="h-5 w-5" />,
          bgColor: 'bg-red-500',
          textColor: 'text-white',
          borderColor: 'border-red-600'
        };
      case 'warning':
        return {
          icon: <FaExclamationTriangle className="h-5 w-5" />,
          bgColor: 'bg-yellow-500',
          textColor: 'text-white',
          borderColor: 'border-yellow-600'
        };
      case 'info':
      default:
        return {
          icon: <FaInfoCircle className="h-5 w-5" />,
          bgColor: 'bg-blue-500',
          textColor: 'text-white',
          borderColor: 'border-blue-600'
        };
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'top-4 right-4';
    }
  };

  const config = getToastConfig();

  if (!isVisible) return null;

  return (
    <div
      className={`fixed z-50 ${getPositionClasses()} transition-all duration-300 ease-in-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
    >
      <div
        className={`
          ${config.bgColor} ${config.textColor} ${config.borderColor}
          border-l-4 rounded-lg shadow-lg max-w-sm w-full overflow-hidden
        `}
      >
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {config.icon}
            </div>
            <div className="ml-3 flex-1">
              {title && (
                <h4 className="text-sm font-semibold mb-1">{title}</h4>
              )}
              {message && (
                <p className="text-sm opacity-90">{message}</p>
              )}
            </div>
            <div className="ml-4 flex-shrink-0">
              <button
                onClick={handleClose}
                className="inline-flex text-white hover:opacity-75 focus:outline-none"
              >
                <FaTimes className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Barra de progreso */}
        {showProgress && duration > 0 && (
          <div className="h-1 bg-black bg-opacity-20">
            <div
              className="h-full bg-white bg-opacity-30 transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Hook para usar las notificaciones toast
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (toastConfig) => {
    const id = Date.now() + Math.random();
    const toast = { id, ...toastConfig };
    
    setToasts((prevToasts) => [...prevToasts, toast]);

    // Auto-remove después de la duración especificada
    if (toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration || 5000);
    }

    return id;
  };

  const removeToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  const removeAllToasts = () => {
    setToasts([]);
  };

  // Métodos de conveniencia
  const success = (title, message, options = {}) => 
    addToast({ type: 'success', title, message, ...options });

  const error = (title, message, options = {}) => 
    addToast({ type: 'error', title, message, ...options });

  const warning = (title, message, options = {}) => 
    addToast({ type: 'warning', title, message, ...options });

  const info = (title, message, options = {}) => 
    addToast({ type: 'info', title, message, ...options });

  return {
    toasts,
    addToast,
    removeToast,
    removeAllToasts,
    success,
    error,
    warning,
    info
  };
};

// Componente contenedor para renderizar todos los toasts
export const ToastContainer = ({ toasts, removeToast, position = 'top-right' }) => {
  return (
    <>
      {toasts.map((toast) => (
        <ToastNotification
          key={toast.id}
          {...toast}
          position={position}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  );
};

export default ToastNotification;