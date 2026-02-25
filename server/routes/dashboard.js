const express = require('express');
const Product = require('../models/Product');
const Sale = require('../models/Sale');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', auth, requireRole('admin'), async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const lowStockCount = await Product.countDocuments({
      $expr: { $lt: ['$quantity', '$minThreshold'] },
    });
    const outOfStockCount = await Product.countDocuments({ quantity: 0 });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const todaySales = await Sale.aggregate([
      { $match: { createdAt: { $gte: today, $lt: tomorrow } } },
      { $group: { _id: null, count: { $sum: 1 }, total: { $sum: '$totalAmount' } } },
    ]);
    const totalSalesAmount = await Sale.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    res.json({
      totalProducts,
      lowStockCount,
      outOfStockCount,
      todaySalesCount: todaySales[0]?.count ?? 0,
      todaySalesTotal: todaySales[0]?.total ?? 0,
      totalSalesAmount: totalSalesAmount[0]?.total ?? 0,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
