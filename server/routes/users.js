const express = require('express');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Rutas básicas de usuarios
router.get('/profile/:id', (req, res) => {
  res.json({ message: 'Get user profile', userId: req.params.id });
});

router.get('/', protect, authorize('admin'), (req, res) => {
  res.json({ message: 'Get all users - Admin only' });
});

module.exports = router;