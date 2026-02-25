require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');
const Sale = require('../models/Sale');
const Restock = require('../models/Restock');

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('MONGO_URI is not set in .env');
  process.exit(1);
}

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  await User.deleteMany({});
  await Product.deleteMany({});
  await Supplier.deleteMany({});
  await Sale.deleteMany({});
  await Restock.deleteMany({});

  const hashedAdmin = await bcrypt.hash('admin123', 10);
  const hashedPass = await bcrypt.hash('demo123', 10);

  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@test.com',
    password: hashedAdmin,
    role: 'admin',
  });

  const inventoryUser = await User.create({
    name: 'Inventory Controller',
    email: 'inventory@test.com',
    password: hashedPass,
    role: 'inventory',
  });

  const salesUser = await User.create({
    name: 'Sales Staff',
    email: 'sales@test.com',
    password: hashedPass,
    role: 'sales',
  });

  const supplierUser = await User.create({
    name: 'Supplier Manager',
    email: 'supplier@test.com',
    password: hashedPass,
    role: 'supplier',
  });

  const products = await Product.insertMany([
    { productName: 'Rice (1kg)', description: 'Basmati rice', category: 'Groceries', price: 80, quantity: 50, minThreshold: 10 },
    { productName: 'Oil (1L)', description: 'Cooking oil', category: 'Groceries', price: 180, quantity: 30, minThreshold: 5 },
    { productName: 'Soap', description: 'Hand soap', category: 'Personal Care', price: 45, quantity: 3, minThreshold: 10 },
    { productName: 'Notebook', description: 'A4 ruled', category: 'Stationery', price: 60, quantity: 25, minThreshold: 15 },
    { productName: 'Pen Pack', description: 'Pack of 5 pens', category: 'Stationery', price: 50, quantity: 40, minThreshold: 10 },
  ]);

  const suppliers = await Supplier.insertMany([
    { supplierName: 'ABC Wholesale', contactNumber: '9876543210', email: 'abc@wholesale.com', address: '123 Trade St' },
    { supplierName: 'XYZ Supplies', contactNumber: '9123456789', email: 'xyz@supplies.com', address: '456 Market Rd' },
  ]);

  await Sale.insertMany([
    { productId: products[0]._id, quantitySold: 2, totalAmount: 160, soldBy: salesUser._id },
    { productId: products[1]._id, quantitySold: 1, totalAmount: 180, soldBy: salesUser._id },
    { productId: products[3]._id, quantitySold: 3, totalAmount: 180, soldBy: admin._id },
  ]);

  await Restock.insertMany([
    { productId: products[0]._id, supplierId: suppliers[0]._id, quantityAdded: 20 },
    { productId: products[2]._id, supplierId: suppliers[1]._id, quantityAdded: 15 },
  ]);

  console.log('Seed completed successfully.');
  console.log('\nDemo login credentials:');
  console.log('  Admin:     admin@test.com / admin123');
  console.log('  Inventory: inventory@test.com / demo123');
  console.log('  Sales:     sales@test.com / demo123');
  console.log('  Supplier:  supplier@test.com / demo123');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
