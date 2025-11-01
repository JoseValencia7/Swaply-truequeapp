/**
 * Middleware de Autenticación para Swaply
 * 
 * Proporciona funciones de middleware para verificar tokens JWT,
 * autorizar roles de usuario y proteger rutas.
 * 
 * Funcionalidades principales:
 * - Verificación de tokens JWT
 * - Autorización basada en roles
 * - Protección de rutas
 * - Manejo de errores de autenticación
 * 
 * @author Jose Manuel Valencia
 * @version 1.0.0
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware para verificar token JWT
 * Extrae el token del header Authorization y verifica su validez
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Obtener token del header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido'
      });
    }
    
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar usuario en la base de datos
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Verificar si la cuenta está activa
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Cuenta desactivada'
      });
    }
    
    // Agregar usuario a la request
    req.user = user;
    next();
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }
    
    console.error('Error en autenticación:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Middleware para verificar roles específicos
 * @param {...string} roles - Roles permitidos
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Acceso no autorizado'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para realizar esta acción'
      });
    }
    
    next();
  };
};

/**
 * Middleware para verificar si el usuario es administrador
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Acceso restringido a administradores'
    });
  }
  
  next();
};

/**
 * Middleware para verificar si el usuario es moderador o administrador
 */
const requireModerator = (req, res, next) => {
  if (!req.user || !['admin', 'moderator'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Acceso restringido a moderadores y administradores'
    });
  }
  
  next();
};

/**
 * Middleware para verificar si el usuario es propietario del recurso
 * @param {string} resourceField - Campo que contiene el ID del propietario
 */
const requireOwnership = (resourceField = 'owner') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id;
      
      if (!resourceId) {
        return res.status(400).json({
          success: false,
          message: 'ID de recurso requerido'
        });
      }
      
      // Determinar el modelo basado en la ruta
      let Model;
      const path = req.route.path;
      
      if (path.includes('/publications')) {
        Model = require('../models/Publication');
      } else if (path.includes('/messages')) {
        const { Message } = require('../models/Message');
        Model = Message;
      } else if (path.includes('/ratings')) {
        const { Rating } = require('../models/Rating');
        Model = Rating;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Tipo de recurso no válido'
        });
      }
      
      const resource = await Model.findById(resourceId);
      
      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Recurso no encontrado'
        });
      }
      
      // Verificar propiedad
      const ownerId = resource[resourceField];
      if (!ownerId || ownerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a este recurso'
        });
      }
      
      // Agregar recurso a la request para evitar otra consulta
      req.resource = resource;
      next();
      
    } catch (error) {
      console.error('Error verificando propiedad:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };
};

/**
 * Middleware opcional de autenticación
 * Permite acceso tanto a usuarios autenticados como no autenticados
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        
        if (user && user.isActive) {
          req.user = user;
        }
      } catch (error) {
        // Token inválido o expirado, continuar sin usuario
        console.log('Token opcional inválido:', error.message);
      }
    }
    
    next();
  } catch (error) {
    console.error('Error en autenticación opcional:', error);
    next();
  }
};

/**
 * Middleware para verificar si el usuario está verificado
 */
const requireVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Acceso no autorizado'
    });
  }
  
  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Cuenta no verificada. Por favor verifica tu email.'
    });
  }
  
  next();
};

/**
 * Middleware para rate limiting por usuario
 * @param {number} maxRequests - Máximo número de requests
 * @param {number} windowMs - Ventana de tiempo en milisegundos
 */
const userRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();
  
  return (req, res, next) => {
    if (!req.user) {
      return next();
    }
    
    const userId = req.user._id.toString();
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Limpiar requests antiguos
    if (requests.has(userId)) {
      const userRequests = requests.get(userId);
      const validRequests = userRequests.filter(time => time > windowStart);
      requests.set(userId, validRequests);
    } else {
      requests.set(userId, []);
    }
    
    const userRequests = requests.get(userId);
    
    if (userRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Demasiadas solicitudes. Intenta de nuevo más tarde.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
    
    userRequests.push(now);
    next();
  };
};

/**
 * Función para generar token JWT
 * @param {Object} payload - Datos a incluir en el token
 * @param {string} expiresIn - Tiempo de expiración
 */
const generateToken = (payload, expiresIn = process.env.JWT_EXPIRE || '7d') => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

/**
 * Función para verificar token sin middleware
 * @param {string} token - Token a verificar
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  requireAdmin,
  requireModerator,
  requireOwnership,
  optionalAuth,
  requireVerification,
  userRateLimit,
  generateToken,
  verifyToken
};