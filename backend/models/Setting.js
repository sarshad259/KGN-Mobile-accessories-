const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  storeName: {
    type: String,
    required: true,
    default: 'KGN Mobile Accessories',
  },
  contactEmail: {
    type: String,
    required: true,
    default: 'support@kgn.com',
  },
  shippingFee: {
    type: Number,
    required: true,
    default: 250,
  },
  freeShippingThreshold: {
    type: Number,
    required: true,
    default: 10000,
  },
  codEnabled: {
    type: Boolean,
    required: true,
    default: true,
  },
  carouselSlides: [
    {
      image: { type: String, required: true },
      title: { type: String, required: true },
      subtitle: { type: String, required: true },
      cta: { type: String, required: true },
      href: { type: String, required: true },
    }
  ]
}, {
  timestamps: true,
});

const Setting = mongoose.model('Setting', settingSchema);

module.exports = Setting;
