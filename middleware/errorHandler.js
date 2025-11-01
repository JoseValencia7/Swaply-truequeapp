/**
 * Middleware de Manejo de Errores para Swaply
 * 
 * Proporciona un manejo centralizado de errores para toda la aplicación,
 * incluyendo errores de validación, base de datos y errores personalizados.
 * 
 * Funcionalidades principales:
 * - Manejo de errores de MongoDB/Mongoose
 * - Errores de validación
 * - Errores de autenticación
 * - Logging de errores
 * - Respuestas consistentes
 * 
 * @author Jose Manuel Valencia
 * @version 1.0.0
 */

/**
 * Clase personalizada para errores de la aplicación
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Manejo de errores de validación de Mongoose
 */
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map(val => val.message);
  const message = `Datos inválidos: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

/**
 * Manejo de errores de duplicado de MongoDB
 */
const handleDuplicateFieldsError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `${field} '${value}' ya existe. Por favor usa otro valor.`;
  return new AppError(message, 400);
};

/**
 * Manejo de errores de cast de MongoDB
 */
const handleCastError = (err) => {
  const message = `Recurso no encontrado. ID inválido: ${err.value}`;
  return new AppError(message, 400);
};

/**
 * Manejo de errores de JWT
 */
const handleJWTError = () => {
  return new AppError('Token inválido. Por favor inicia sesión de nuevo.', 401);
};

/**
 * Manejo de errores de JWT expirado
 */
const handleJWTExpiredError = () => {
  return new AppError('Token expirado. Por favor inicia sesión de nuevo.', 401);
};

/**
 * Envío de errores en desarrollo
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

/**
 * Envío de errores en producción
 */
const sendErrorProd = (err, res) => {
  // Errores operacionales: enviar mensaje al cliente
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  } 
  // Errores de programación: no filtrar detalles al cliente
  else {
    // Log del error
    console.error('ERROR 💥:', err);
    
    // Enviar mensaje genérico
    res.status(500).json({
      success: false,
      message: 'Algo salió mal. Por favor intenta de nuevo más tarde.'
    });
  }
};

/**
 * Middleware principal de manejo de errores
 */
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  
  // Log del error para debugging
  console.error('Error capturado:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;
    
    // Manejo específico de errores de MongoDB/Mongoose
    if (error.name === 'CastError') {
      error = handleCastError(error);
    }
    
    if (error.code === 11000) {
      error = handleDuplicateFieldsError(error);
    }
    
    if (error.name === 'ValidationError') {
      error = handleValidationError(error);
    }
    
    if (error.name === 'JsonWebTokenError') {
      error = handleJWTError();
    }
    
    if (error.name === 'TokenExpiredError') {
      error = handleJWTExpiredError();
    }
    
    sendErrorProd(error, res);
  }
};

/**
 * Middleware para capturar errores asíncronos
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

/**
 * Middleware para rutas no encontradas
 */
const notFound = (req, res, next) => {
  const message = `Ruta ${req.originalUrl} no encontrada`;
  next(new AppError(message, 404));
};

/**
 * Validador de parámetros de ID
 */
const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const mongoose = require('mongoose');
    const id = req.params[paramName];
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError(`ID inválido: ${id}`, 400));
    }
    
    next();
  };
};

/**
 * Middleware para validar paginación
 */
const validatePagination = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  
  if (page < 1) {
    return next(new AppError('El número de página debe ser mayor a 0', 400));
  }
  
  if (limit < 1 || limit > 100) {
    return next(new AppError('El límite debe estar entre 1 y 100', 400));
  }
  
  req.pagination = {
    page,
    limit,
    skip: (page - 1) * limit
  };
  
  next();
};

/**
 * Middleware para validar campos requeridos
 */
const validateRequiredFields = (fields) => {
  return (req, res, next) => {
    const missingFields = [];
    
    fields.forEach(field => {
      if (!req.body[field]) {
        missingFields.push(field);
      }
    });
    
    if (missingFields.length > 0) {
      const message = `Campos requeridos faltantes: ${missingFields.join(', ')}`;
      return next(new AppError(message, 400));
    }
    
    next();
  };
};

/**
 * Middleware para sanitizar entrada de datos
 */
const sanitizeInput = (req, res, next) => {
  // Remover campos que no deberían ser modificados por el usuario
  const restrictedFields = ['_id', '__v', 'createdAt', 'updatedAt'];
  
  restrictedFields.forEach(field => {
    delete req.body[field];
  });
  
  // Limpiar strings
  Object.keys(req.body).forEach(key => {
    if (typeof req.body[key] === 'string') {
      req.body[key] = req.body[key].trim();
    }
  });
  
  next();
};

/**
 * Middleware para logging de requests
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    };
    
    if (req.user) {
      logData.userId = req.user._id;
    }
    
    console.log('Request:', JSON.stringify(logData));
  });
  
  next();
};

/**
 * Función para crear respuestas exitosas consistentes
 */
const sendSuccess = (res, data, message = 'Operación exitosa', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Función para crear respuestas paginadas
 */
const sendPaginatedResponse = (res, data, pagination, total, message = 'Datos obtenidos exitosamente') => {
  const totalPages = Math.ceil(total / pagination.limit);
  
  res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      currentPage: pagination.page,
      totalPages,
      totalItems: total,
      itemsPerPage: pagination.limit,
      hasNextPage: pagination.page < totalPages,
      hasPrevPage: pagination.page > 1
    }
  });
};

module.exports = {
  AppError,
  errorHandler,
  catchAsync,
  notFound,
  validateObjectId,
  validatePagination,
  validateRequiredFields,
  sanitizeInput,
  requestLogger,
  sendSuccess,
  sendPaginatedResponse
};