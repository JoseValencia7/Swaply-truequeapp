const express = require('express');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Todas las rutas de mensajes requieren autenticación
router.use(protect);

router.get('/conversations', (req, res) => {
  res.json({ message: 'Get user conversations', user: req.user.id });
});

router.get('/conversations/:id', (req, res) => {
  res.json({ 
    message: 'Get conversation messages', 
    conversationId: req.params.id,
    user: req.user.id 
  });
});

router.post('/conversations/:id/messages', (req, res) => {
  res.json({ 
    message: 'Send message to conversation', 
    conversationId: req.params.id,
    user: req.user.id 
  });
});

router.put('/messages/:id/read', (req, res) => {
  res.json({ 
    message: 'Mark message as read', 
    messageId: req.params.id,
    user: req.user.id 
  });
});

module.exports = router;