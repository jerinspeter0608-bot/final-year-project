const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  supplierName: {
    type: String,
    required: true,
  },
  contactNumber: {
    type: String,
    default: '',
  },
  email: {
    type: String,
    default: '',
  },
  address: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Supplier', supplierSchema);
