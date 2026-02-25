const express = require('express');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, requireRole('admin', 'sales'), async (req, res) => {
  try {
    const { productId, quantitySold } = req.body;
    if (!productId || !quantitySold || quantitySold < 1) {
      return res.status(400).json({ message: 'Valid productId and quantitySold are required' });
    }
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (product.quantity < quantitySold) {
      return res.status(400).json({
        message: `Insufficient stock. Available: ${product.quantity}`,
      });
    }
    const totalAmount = product.price * quantitySold;
    product.quantity -= quantitySold;
    await product.save();
    const sale = await Sale.create({
      productId: product._id,
      quantitySold,
      totalAmount,
      soldBy: req.user._id,
    });
    const populated = await Sale.findById(sale._id)
      .populate('productId', 'productName price')
      .populate('soldBy', 'name email');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const { date, limit = 100 } = req.query;
    const filter = {};
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.createdAt = { $gte: start, $lte: end };
    }
    const sales = await Sale.find(filter)
      .populate('productId', 'productName price')
      .populate('soldBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(Number(limit));
    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
