/**
 * Servidor principal de Swaply - Plataforma de Intercambio Comunitario
 * 
 * Este archivo configura y ejecuta el servidor Express con todas las
 * funcionalidades necesarias para la plataforma de intercambio.
 * 
 * Funcionalidades principales:
 * - Configuración de middleware de seguridad
 * - Conexión a base de datos MongoDB
 * - Configuración de rutas API
 * - Manejo de archivos estáticos
 * - Configuración de Socket.IO para chat en tiempo real
 * 
 * @author Jose Manuel Valencia
 * @version 1.0.0
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

// Importar rutas
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const publicationRoutes = require('./routes/publications');
const messageRoutes = require('./routes/messages');
const ratingRoutes = require('./routes/ratings');
const adminRoutes = require('./routes/admin');

// Importar middleware personalizado
const errorHandler = require('./middleware/errorHandler');
const { authenticateToken } = require('./middleware/auth');

// Crear aplicación Express
const app = express();
const server = http.createServer(app);

// Configurar Socket.IO para mensajería en tiempo real
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Configuración de seguridad
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Configuración de CORS
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));

// Configuración de rate limiting
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000, // 15 minutos por defecto
  max: process.env.RATE_LIMIT_MAX || 100, // límite de 100 requests por ventana
  message: {
    error: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.'
  }
});
app.use('/api/', limiter);

// Middleware para compresión
app.use(compression());

// Middleware para parsing de JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos (imágenes subidas)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/swaply_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Conectado exitosamente a MongoDB');
})
.catch((error) => {
  console.error('❌ Error conectando a MongoDB:', error.message);
  process.exit(1);
});

// Configuración de rutas API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/publications', publicationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/admin', adminRoutes);

// Ruta de salud del servidor
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Servidor Swaply funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Configuración de Socket.IO para chat en tiempo real
io.on('connection', (socket) => {
  console.log('👤 Usuario conectado:', socket.id);

  // Unirse a una sala de chat específica
  socket.on('join_chat', (chatId) => {
    socket.join(chatId);
    console.log(`👥 Usuario ${socket.id} se unió al chat ${chatId}`);
  });

  // Enviar mensaje
  socket.on('send_message', (data) => {
    socket.to(data.chatId).emit('receive_message', data);
  });

  // Notificación de escritura
  socket.on('typing', (data) => {
    socket.to(data.chatId).emit('user_typing', data);
  });

  // Desconexión
  socket.on('disconnect', () => {
    console.log('👋 Usuario desconectado:', socket.id);
  });
});

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Configuración del puerto
const PORT = process.env.PORT || 5000;

// Iniciar servidor
server.listen(PORT, () => {
  console.log(`🚀 Servidor Swaply ejecutándose en puerto ${PORT}`);
  console.log(`🌐 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📱 Cliente URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
});

// Manejo de errores no capturados
process.on('unhandledRejection', (err) => {
  console.error('❌ Error no manejado:', err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err) => {
  console.error('❌ Excepción no capturada:', err.message);
  process.exit(1);
});

module.exports = { app, server, io };