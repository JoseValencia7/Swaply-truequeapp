const express = require('express');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(protect);

router.get('/', (req, res) => {
  res.json({ 
    message: 'Get user notifications', 
    user: req.user.id 
  });
});

router.get('/unread-count', (req, res) => {
  res.json({ 
    message: 'Get unread notifications count', 
    user: req.user.id,
    count: 0 
  });
});

router.put('/:id/read', (req, res) => {
  res.json({ 
    message: 'Mark notification as read', 
    notificationId: req.params.id,
    user: req.user.id 
  });
});

router.put('/mark-all-read', (req, res) => {
  res.json({ 
    message: 'Mark all notifications as read', 
    user: req.user.id 
  });
});

router.delete('/:id', (req, res) => {
  res.json({ 
    message: 'Delete notification', 
    notificationId: req.params.id,
    user: req.user.id 
  });
});

module.exports = router;