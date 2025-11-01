const express = require('express');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Rutas públicas
router.get('/', (req, res) => {
  res.json({ message: 'Get all publications', data: [] });
});

router.get('/:id', (req, res) => {
  res.json({ message: 'Get publication by ID', publicationId: req.params.id });
});

// Rutas protegidas
router.post('/', protect, (req, res) => {
  res.json({ message: 'Create new publication', user: req.user.id });
});

router.put('/:id', protect, (req, res) => {
  res.json({ message: 'Update publication', publicationId: req.params.id });
});

router.delete('/:id', protect, (req, res) => {
  res.json({ message: 'Delete publication', publicationId: req.params.id });
});

module.exports = router;