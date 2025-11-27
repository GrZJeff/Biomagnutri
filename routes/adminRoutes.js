const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/users', protect, adminOnly, async (req, res) => {
  const users = await User.find().select('name email role');
  res.json(users);
});

router.get('/products', protect, adminOnly, async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

router.post('/products', protect, adminOnly, async (req, res) => {
  const { name, description, price } = req.body;
  const product = await Product.create({ name, description, price });
  res.status(201).json({ message: 'Producto agregado', product });
});

router.delete('/products/:id', protect, adminOnly, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: 'Producto eliminado' });
});

module.exports = router;