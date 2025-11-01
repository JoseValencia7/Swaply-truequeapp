const express = require('express');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Rutas públicas
router.get('/user/:userId', (req, res) => {
  res.json({ 
    message: 'Get user reviews', 
    userId: req.params.userId 
  });
});

// Rutas protegidas
router.post('/', protect, (req, res) => {
  res.json({ 
    message: 'Create new review', 
    reviewer: req.user.id 
  });
});

router.put('/:id', protect, (req, res) => {
  res.json({ 
    message: 'Update review', 
    reviewId: req.params.id,
    user: req.user.id 
  });
});

router.delete('/:id', protect, (req, res) => {
  res.json({ 
    message: 'Delete review', 
    reviewId: req.params.id,
    user: req.user.id 
  });
});

router.post('/:id/helpful', protect, (req, res) => {
  res.json({ 
    message: 'Vote review as helpful', 
    reviewId: req.params.id,
    user: req.user.id 
  });
});

module.exports = router;