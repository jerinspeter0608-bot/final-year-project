const express = require('express');
const Product = require('../models/Product');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/low-stock', auth, async (req, res) => {
  try {
    const products = await Product.find({
      $expr: { $lt: ['$quantity', '$minThreshold'] },
    }).sort({ quantity: 1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, requireRole('admin', 'inventory'), async (req, res) => {
  try {
    const { productName, description, category, price, quantity, minThreshold } = req.body;
    if (!productName || price === undefined) {
      return res.status(400).json({ message: 'Product name and price are required' });
    }
    const product = await Product.create({
      productName,
      description: description || '',
      category: category || '',
      price: Number(price),
      quantity: Number(quantity) || 0,
      minThreshold: Number(minThreshold) ?? 0,
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', auth, requireRole('admin', 'inventory'), async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', auth, requireRole('admin', 'inventory'), async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
