const express = require('express');
const Restock = require('../models/Restock');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, requireRole('admin', 'supplier'), async (req, res) => {
  try {
    const { productId, supplierId, quantityAdded } = req.body;
    if (!productId || !supplierId || !quantityAdded || quantityAdded < 1) {
      return res.status(400).json({
        message: 'Valid productId, supplierId and quantityAdded are required',
      });
    }
    const [product, supplier] = await Promise.all([
      Product.findById(productId),
      Supplier.findById(supplierId),
    ]);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    product.quantity += Number(quantityAdded);
    await product.save();
    const restock = await Restock.create({
      productId: product._id,
      supplierId: supplier._id,
      quantityAdded: Number(quantityAdded),
    });
    const populated = await Restock.findById(restock._id)
      .populate('productId', 'productName quantity')
      .populate('supplierId', 'supplierName');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const restocks = await Restock.find()
      .populate('productId', 'productName')
      .populate('supplierId', 'supplierName')
      .sort({ createdAt: -1 });
    res.json(restocks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
