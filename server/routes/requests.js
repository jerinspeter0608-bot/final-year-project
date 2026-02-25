const express = require('express');
const Request = require('../models/Request');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');
const Restock = require('../models/Restock');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// List requests: inventory sees own, admin/supplier see all. Optional ?status=pending
router.get('/', auth, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (req.user.role === 'inventory') {
      filter.requestedBy = req.user._id;
    }
    const requests = await Request.find(filter)
      .populate('productId', 'productName quantity')
      .populate('requestedBy', 'name email')
      .populate('fulfilledBy', 'name')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create request (inventory or admin)
router.post('/', auth, requireRole('admin', 'inventory'), async (req, res) => {
  try {
    const { type, productId, quantityRequested, productName, description, category, suggestedPrice, suggestedQuantity, suggestedMinThreshold, note } = req.body;
    if (!type || !['refill', 'new_product'].includes(type)) {
      return res.status(400).json({ message: 'Type must be refill or new_product' });
    }
    const payload = {
      type,
      requestedBy: req.user._id,
      note: note || '',
    };
    if (type === 'refill') {
      if (!productId || !quantityRequested || quantityRequested < 1) {
        return res.status(400).json({ message: 'productId and quantityRequested (min 1) required for refill' });
      }
      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ message: 'Product not found' });
      payload.productId = product._id;
      payload.quantityRequested = Number(quantityRequested);
    } else {
      if (!productName || !productName.trim()) {
        return res.status(400).json({ message: 'productName required for new product request' });
      }
      payload.productName = productName.trim();
      payload.description = description || '';
      payload.category = category || '';
      payload.suggestedPrice = suggestedPrice != null ? Number(suggestedPrice) : undefined;
      payload.suggestedQuantity = suggestedQuantity != null ? Number(suggestedQuantity) : 0;
      payload.suggestedMinThreshold = suggestedMinThreshold != null ? Number(suggestedMinThreshold) : 0;
    }
    const doc = await Request.create(payload);
    const populated = await Request.findById(doc._id)
      .populate('productId', 'productName quantity')
      .populate('requestedBy', 'name email');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Fulfill: admin or supplier. Refill = create restock (body: supplierId, quantityAdded). New product = create product from request data.
router.put('/:id/fulfill', auth, requireRole('admin', 'supplier'), async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request is not pending' });
    }
    if (request.type === 'refill') {
      const { supplierId, quantityAdded } = req.body;
      const qty = quantityAdded != null ? Number(quantityAdded) : request.quantityRequested;
      if (!supplierId || !qty || qty < 1) {
        return res.status(400).json({ message: 'supplierId and quantityAdded (min 1) required' });
      }
      const [product, supplier] = await Promise.all([
        Product.findById(request.productId),
        Supplier.findById(supplierId),
      ]);
      if (!product) return res.status(404).json({ message: 'Product not found' });
      if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
      product.quantity += qty;
      await product.save();
      await Restock.create({
        productId: product._id,
        supplierId: supplier._id,
        quantityAdded: qty,
      });
    } else {
      const product = await Product.create({
        productName: request.productName,
        description: request.description || '',
        category: request.category || '',
        price: request.suggestedPrice ?? 0,
        quantity: request.suggestedQuantity ?? 0,
        minThreshold: request.suggestedMinThreshold ?? 0,
      });
      // optional: link request to created product for reference
    }
    request.status = 'fulfilled';
    request.fulfilledBy = req.user._id;
    request.fulfilledAt = new Date();
    await request.save();
    const populated = await Request.findById(request._id)
      .populate('productId', 'productName quantity')
      .populate('requestedBy', 'name email')
      .populate('fulfilledBy', 'name');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Reject: admin or supplier. Body optional: { reason }
router.put('/:id/reject', auth, requireRole('admin', 'supplier'), async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request is not pending' });
    }
    request.status = 'rejected';
    request.fulfilledBy = req.user._id;
    request.fulfilledAt = new Date();
    request.rejectionReason = req.body.reason || '';
    await request.save();
    const populated = await Request.findById(request._id)
      .populate('productId', 'productName quantity')
      .populate('requestedBy', 'name email')
      .populate('fulfilledBy', 'name');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
