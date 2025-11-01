const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log del error
  console.error('❌ Error:', err);

  // Error de validación de Mongoose
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = {
      statusCode: 400,
      message: 'Errores de validación',
      details: Object.values(err.errors).reduce((acc, curr) => {
        acc[curr.path] = curr.message;
        return acc;
      }, {})
    };
  }

  // Error de duplicado de Mongoose
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    error = {
      statusCode: 409,
      message: `El ${field} '${value}' ya está en uso`,
      field: field
    };
  }

  // Error de ObjectId inválido de Mongoose
  if (err.name === 'CastError') {
    error = {
      statusCode: 400,
      message: 'ID de recurso inválido'
    };
  }

  // Error de JWT
  if (err.name === 'JsonWebTokenError') {
    error = {
      statusCode: 401,
      message: 'Token de acceso inválido'
    };
  }

  // Error de JWT expirado
  if (err.name === 'TokenExpiredError') {
    error = {
      statusCode: 401,
      message: 'Token de acceso expirado'
    };
  }

  // Error de Multer (archivos)
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = {
      statusCode: 413,
      message: 'El archivo es demasiado grande'
    };
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    error = {
      statusCode: 413,
      message: 'Demasiados archivos'
    };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error = {
      statusCode: 400,
      message: 'Campo de archivo inesperado'
    };
  }

  // Error de conexión a la base de datos
  if (err.name === 'MongoNetworkError' || err.name === 'MongoTimeoutError') {
    error = {
      statusCode: 503,
      message: 'Error de conexión a la base de datos'
    };
  }

  // Error de rate limiting
  if (err.statusCode === 429) {
    error = {
      statusCode: 429,
      message: 'Demasiadas solicitudes, intenta de nuevo más tarde'
    };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Error interno del servidor',
    ...(error.details && { error: { details: error.details } }),
    ...(error.field && { error: { field: error.field } }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;