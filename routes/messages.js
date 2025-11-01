const express = require('express');
const multer = require('multer');
const path = require('path');
const { Message, Conversation } = require('../models/Message');
const User = require('../models/User');
const Publication = require('../models/Publication');
const { protect } = require('../middleware/auth');
const { catchAsync, sendResponse, sendPaginatedResponse } = require('../middleware/errorHandler');
const AppError = require('../middleware/errorHandler').AppError;

const router = express.Router();

// Configuración de multer para archivos adjuntos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/messages/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'msg-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new AppError('Tipo de archivo no permitido', 400));
    }
  }
});

// @desc    Obtener todas las conversaciones del usuario
// @route   GET /api/messages/conversations
// @access  Private
router.get('/conversations', protect, catchAsync(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const conversations = await Conversation.find({
    participants: req.user.id,
    status: { $ne: 'deleted' }
  })
  .populate('participants', 'firstName lastName profilePhoto isOnline lastSeen')
  .populate('publication', 'title images type category')
  .populate('lastMessage')
  .sort({ updatedAt: -1 })
  .limit(limit * 1)
  .skip((page - 1) * limit);

  // Marcar mensajes como entregados
  const conversationIds = conversations.map(conv => conv._id);
  await Message.updateMany(
    {
      conversation: { $in: conversationIds },
      sender: { $ne: req.user.id },
      deliveredTo: { $ne: req.user.id }
    },
    {
      $addToSet: { deliveredTo: req.user.id },
      deliveredAt: new Date()
    }
  );

  const total = await Conversation.countDocuments({
    participants: req.user.id,
    status: { $ne: 'deleted' }
  });

  sendPaginatedResponse(res, 200, 'Conversaciones obtenidas', conversations, {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    pages: Math.ceil(total / limit)
  });
}));

// @desc    Obtener o crear conversación
// @route   POST /api/messages/conversations
// @access  Private
router.post('/conversations', protect, catchAsync(async (req, res) => {
  const { participantId, publicationId } = req.body;

  if (!participantId) {
    return next(new AppError('ID del participante es requerido', 400));
  }

  if (participantId === req.user.id) {
    return next(new AppError('No puedes crear una conversación contigo mismo', 400));
  }

  // Verificar que el participante existe
  const participant = await User.findById(participantId);
  if (!participant) {
    return next(new AppError('Usuario no encontrado', 404));
  }

  // Verificar que la publicación existe si se proporciona
  let publication = null;
  if (publicationId) {
    publication = await Publication.findById(publicationId);
    if (!publication) {
      return next(new AppError('Publicación no encontrada', 404));
    }
  }

  // Buscar conversación existente
  let conversation = await Conversation.findOne({
    participants: { $all: [req.user.id, participantId] },
    publication: publicationId || null
  });

  if (!conversation) {
    // Crear nueva conversación
    conversation = await Conversation.create({
      participants: [req.user.id, participantId],
      publication: publicationId || null,
      createdBy: req.user.id
    });
  }

  await conversation.populate('participants', 'firstName lastName profilePhoto isOnline lastSeen');
  if (publicationId) {
    await conversation.populate('publication', 'title images type category');
  }

  sendResponse(res, 201, 'Conversación obtenida/creada', conversation);
}));

// @desc    Obtener mensajes de una conversación
// @route   GET /api/messages/conversations/:id/messages
// @access  Private
router.get('/conversations/:id/messages', protect, catchAsync(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;

  // Verificar que el usuario es participante de la conversación
  const conversation = await Conversation.findOne({
    _id: req.params.id,
    participants: req.user.id
  });

  if (!conversation) {
    return next(new AppError('Conversación no encontrada', 404));
  }

  const messages = await Message.find({ conversation: req.params.id })
    .populate('sender', 'firstName lastName profilePhoto')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  // Marcar mensajes como leídos
  await Message.updateMany(
    {
      conversation: req.params.id,
      sender: { $ne: req.user.id },
      readBy: { $ne: req.user.id }
    },
    {
      $addToSet: { readBy: req.user.id },
      readAt: new Date()
    }
  );

  // Actualizar última vez visto en la conversación
  await Conversation.findByIdAndUpdate(req.params.id, {
    $set: {
      [`lastSeen.${req.user.id}`]: new Date()
    }
  });

  const total = await Message.countDocuments({ conversation: req.params.id });

  sendPaginatedResponse(res, 200, 'Mensajes obtenidos', messages.reverse(), {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    pages: Math.ceil(total / limit)
  });
}));

// @desc    Enviar mensaje
// @route   POST /api/messages/conversations/:id/messages
// @access  Private
router.post('/conversations/:id/messages', protect, upload.single('attachment'), catchAsync(async (req, res) => {
  const { content, type = 'text', replyTo } = req.body;

  // Verificar que el usuario es participante de la conversación
  const conversation = await Conversation.findOne({
    _id: req.params.id,
    participants: req.user.id
  });

  if (!conversation) {
    return next(new AppError('Conversación no encontrada', 404));
  }

  // Validar contenido según el tipo
  if (type === 'text' && !content) {
    return next(new AppError('El contenido del mensaje es requerido', 400));
  }

  const messageData = {
    conversation: req.params.id,
    sender: req.user.id,
    type,
    content: content || '',
    replyTo: replyTo || null
  };

  // Manejar archivo adjunto
  if (req.file) {
    messageData.attachments = [{
      filename: req.file.originalname,
      path: `/uploads/messages/${req.file.filename}`,
      size: req.file.size,
      mimetype: req.file.mimetype
    }];
    
    if (type === 'text') {
      messageData.type = req.file.mimetype.startsWith('image/') ? 'image' : 'file';
    }
  }

  const message = await Message.create(messageData);
  await message.populate('sender', 'firstName lastName profilePhoto');

  // Actualizar conversación
  conversation.lastMessage = message._id;
  conversation.updatedAt = new Date();
  await conversation.save();

  // Emitir evento de Socket.IO (se manejará en server.js)
  req.app.get('io').to(`conversation_${req.params.id}`).emit('newMessage', message);

  sendResponse(res, 201, 'Mensaje enviado', message);
}));

// @desc    Editar mensaje
// @route   PUT /api/messages/:id
// @access  Private
router.put('/:id', protect, catchAsync(async (req, res) => {
  const { content } = req.body;

  if (!content) {
    return next(new AppError('El contenido es requerido', 400));
  }

  const message = await Message.findOne({
    _id: req.params.id,
    sender: req.user.id
  });

  if (!message) {
    return next(new AppError('Mensaje no encontrado', 404));
  }

  // Solo permitir editar mensajes de texto recientes (últimos 15 minutos)
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
  if (message.createdAt < fifteenMinutesAgo) {
    return next(new AppError('Solo puedes editar mensajes de los últimos 15 minutos', 400));
  }

  if (message.type !== 'text') {
    return next(new AppError('Solo se pueden editar mensajes de texto', 400));
  }

  message.content = content;
  message.isEdited = true;
  message.editedAt = new Date();
  await message.save();

  await message.populate('sender', 'firstName lastName profilePhoto');

  // Emitir evento de Socket.IO
  req.app.get('io').to(`conversation_${message.conversation}`).emit('messageEdited', message);

  sendResponse(res, 200, 'Mensaje editado', message);
}));

// @desc    Eliminar mensaje
// @route   DELETE /api/messages/:id
// @access  Private
router.delete('/:id', protect, catchAsync(async (req, res) => {
  const message = await Message.findOne({
    _id: req.params.id,
    sender: req.user.id
  });

  if (!message) {
    return next(new AppError('Mensaje no encontrado', 404));
  }

  message.isDeleted = true;
  message.deletedAt = new Date();
  message.content = 'Este mensaje ha sido eliminado';
  await message.save();

  // Emitir evento de Socket.IO
  req.app.get('io').to(`conversation_${message.conversation}`).emit('messageDeleted', {
    messageId: message._id,
    conversationId: message.conversation
  });

  sendResponse(res, 200, 'Mensaje eliminado');
}));

// @desc    Enviar propuesta de intercambio
// @route   POST /api/messages/conversations/:id/exchange-proposal
// @access  Private
router.post('/conversations/:id/exchange-proposal', protect, catchAsync(async (req, res) => {
  const { offeredItems, requestedItems, terms, expirationHours = 48 } = req.body;

  if (!offeredItems || !requestedItems) {
    return next(new AppError('Items ofrecidos y solicitados son requeridos', 400));
  }

  // Verificar que el usuario es participante de la conversación
  const conversation = await Conversation.findOne({
    _id: req.params.id,
    participants: req.user.id
  });

  if (!conversation) {
    return next(new AppError('Conversación no encontrada', 404));
  }

  const expirationDate = new Date();
  expirationDate.setHours(expirationDate.getHours() + parseInt(expirationHours));

  const proposalData = {
    offeredItems: Array.isArray(offeredItems) ? offeredItems : [offeredItems],
    requestedItems: Array.isArray(requestedItems) ? requestedItems : [requestedItems],
    terms: terms || '',
    proposedBy: req.user.id,
    expirationDate,
    status: 'pending'
  };

  const message = await Message.create({
    conversation: req.params.id,
    sender: req.user.id,
    type: 'exchange_proposal',
    content: 'Propuesta de intercambio enviada',
    exchangeProposal: proposalData
  });

  await message.populate('sender', 'firstName lastName profilePhoto');

  // Actualizar conversación
  conversation.lastMessage = message._id;
  conversation.updatedAt = new Date();
  await conversation.save();

  // Emitir evento de Socket.IO
  req.app.get('io').to(`conversation_${req.params.id}`).emit('exchangeProposal', message);

  sendResponse(res, 201, 'Propuesta de intercambio enviada', message);
}));

// @desc    Responder a propuesta de intercambio
// @route   POST /api/messages/:id/exchange-response
// @access  Private
router.post('/:id/exchange-response', protect, catchAsync(async (req, res) => {
  const { action, counterOffer } = req.body; // action: 'accept', 'reject', 'counter'

  if (!['accept', 'reject', 'counter'].includes(action)) {
    return next(new AppError('Acción inválida', 400));
  }

  const message = await Message.findById(req.params.id)
    .populate('conversation');

  if (!message || message.type !== 'exchange_proposal') {
    return next(new AppError('Propuesta no encontrada', 404));
  }

  // Verificar que el usuario es participante y no el que hizo la propuesta
  if (!message.conversation.participants.includes(req.user.id)) {
    return next(new AppError('No autorizado', 403));
  }

  if (message.sender.toString() === req.user.id) {
    return next(new AppError('No puedes responder a tu propia propuesta', 400));
  }

  if (message.exchangeProposal.status !== 'pending') {
    return next(new AppError('Esta propuesta ya ha sido respondida', 400));
  }

  // Verificar expiración
  if (new Date() > message.exchangeProposal.expirationDate) {
    message.exchangeProposal.status = 'expired';
    await message.save();
    return next(new AppError('Esta propuesta ha expirado', 400));
  }

  let responseMessage;

  if (action === 'accept') {
    message.exchangeProposal.status = 'accepted';
    message.exchangeProposal.respondedBy = req.user.id;
    message.exchangeProposal.respondedAt = new Date();
    
    responseMessage = 'Propuesta de intercambio aceptada';
  } else if (action === 'reject') {
    message.exchangeProposal.status = 'rejected';
    message.exchangeProposal.respondedBy = req.user.id;
    message.exchangeProposal.respondedAt = new Date();
    
    responseMessage = 'Propuesta de intercambio rechazada';
  } else if (action === 'counter') {
    if (!counterOffer) {
      return next(new AppError('Contraoferta es requerida', 400));
    }
    
    message.exchangeProposal.status = 'countered';
    message.exchangeProposal.counterOffer = counterOffer;
    message.exchangeProposal.respondedBy = req.user.id;
    message.exchangeProposal.respondedAt = new Date();
    
    responseMessage = 'Contraoferta enviada';
  }

  await message.save();

  // Crear mensaje de respuesta
  const responseMsg = await Message.create({
    conversation: message.conversation._id,
    sender: req.user.id,
    type: 'system',
    content: responseMessage,
    replyTo: message._id
  });

  await responseMsg.populate('sender', 'firstName lastName profilePhoto');

  // Emitir eventos de Socket.IO
  req.app.get('io').to(`conversation_${message.conversation._id}`).emit('exchangeResponse', {
    originalMessage: message,
    response: responseMsg,
    action
  });

  sendResponse(res, 200, responseMessage, {
    originalMessage: message,
    response: responseMsg
  });
}));

// @desc    Marcar conversación como archivada
// @route   PUT /api/messages/conversations/:id/archive
// @access  Private
router.put('/conversations/:id/archive', protect, catchAsync(async (req, res) => {
  const conversation = await Conversation.findOne({
    _id: req.params.id,
    participants: req.user.id
  });

  if (!conversation) {
    return next(new AppError('Conversación no encontrada', 404));
  }

  if (!conversation.archivedBy.includes(req.user.id)) {
    conversation.archivedBy.push(req.user.id);
    await conversation.save();
  }

  sendResponse(res, 200, 'Conversación archivada');
}));

// @desc    Desarchivar conversación
// @route   PUT /api/messages/conversations/:id/unarchive
// @access  Private
router.put('/conversations/:id/unarchive', protect, catchAsync(async (req, res) => {
  const conversation = await Conversation.findOne({
    _id: req.params.id,
    participants: req.user.id
  });

  if (!conversation) {
    return next(new AppError('Conversación no encontrada', 404));
  }

  conversation.archivedBy.pull(req.user.id);
  await conversation.save();

  sendResponse(res, 200, 'Conversación desarchivada');
}));

// @desc    Bloquear conversación
// @route   PUT /api/messages/conversations/:id/block
// @access  Private
router.put('/conversations/:id/block', protect, catchAsync(async (req, res) => {
  const conversation = await Conversation.findOne({
    _id: req.params.id,
    participants: req.user.id
  });

  if (!conversation) {
    return next(new AppError('Conversación no encontrada', 404));
  }

  if (!conversation.blockedBy.includes(req.user.id)) {
    conversation.blockedBy.push(req.user.id);
    await conversation.save();
  }

  sendResponse(res, 200, 'Conversación bloqueada');
}));

// @desc    Obtener estadísticas de mensajes
// @route   GET /api/messages/stats
// @access  Private
router.get('/stats', protect, catchAsync(async (req, res) => {
  const stats = await Message.aggregate([
    {
      $match: {
        $or: [
          { sender: req.user.id },
          { conversation: { $in: await Conversation.find({ participants: req.user.id }).distinct('_id') } }
        ]
      }
    },
    {
      $group: {
        _id: null,
        totalMessages: { $sum: 1 },
        sentMessages: {
          $sum: { $cond: [{ $eq: ['$sender', req.user.id] }, 1, 0] }
        },
        receivedMessages: {
          $sum: { $cond: [{ $ne: ['$sender', req.user.id] }, 1, 0] }
        }
      }
    }
  ]);

  const conversationCount = await Conversation.countDocuments({
    participants: req.user.id,
    status: { $ne: 'deleted' }
  });

  const unreadCount = await Message.countDocuments({
    conversation: { $in: await Conversation.find({ participants: req.user.id }).distinct('_id') },
    sender: { $ne: req.user.id },
    readBy: { $ne: req.user.id }
  });

  sendResponse(res, 200, 'Estadísticas obtenidas', {
    ...stats[0],
    totalConversations: conversationCount,
    unreadMessages: unreadCount
  });
}));

module.exports = router;