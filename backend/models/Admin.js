const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, default: 'Super Admin' },
  lastActive: { type: Date, default: Date.now }
}, { timestamps: true });

const Admin = mongoose.model('Admin', adminSchema, 'admins');

module.exports = Admin;
