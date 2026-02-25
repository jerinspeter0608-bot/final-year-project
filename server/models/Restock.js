const mongoose = require('mongoose');

const restockSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true,
  },
  quantityAdded: {
    type: Number,
    required: true,
    min: 1,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Restock', restockSchema);
