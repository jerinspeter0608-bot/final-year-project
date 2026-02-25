const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['refill', 'new_product'],
    required: true,
  },
  // For refill
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  quantityRequested: {
    type: Number,
    min: 1,
  },
  // For new_product (suggested details)
  productName: { type: String },
  description: { type: String },
  category: { type: String },
  suggestedPrice: { type: Number },
  suggestedQuantity: { type: Number },
  suggestedMinThreshold: { type: Number },
  note: { type: String },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'fulfilled', 'rejected'],
    default: 'pending',
  },
  fulfilledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fulfilledAt: { type: Date },
  rejectionReason: { type: String },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Request', requestSchema);
