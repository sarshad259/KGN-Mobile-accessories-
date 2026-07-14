const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Get store settings
// @route   GET /api/settings
// @access  Public
router.get('/', async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      // Create default settings if none exist
      settings = await Setting.create({});
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching settings' });
  }
});

// @desc    Update store settings
// @route   PUT /api/settings
// @access  Private/Admin
router.put('/', protect, admin, async (req, res) => {
  try {
    const { storeName, contactEmail, shippingFee, freeShippingThreshold, codEnabled, carouselSlides } = req.body;

    let settings = await Setting.findOne();
    if (!settings) {
      settings = new Setting();
    }

    settings.storeName = storeName !== undefined ? storeName : settings.storeName;
    settings.contactEmail = contactEmail !== undefined ? contactEmail : settings.contactEmail;
    settings.shippingFee = shippingFee !== undefined ? shippingFee : settings.shippingFee;
    settings.freeShippingThreshold = freeShippingThreshold !== undefined ? freeShippingThreshold : settings.freeShippingThreshold;
    settings.codEnabled = codEnabled !== undefined ? codEnabled : settings.codEnabled;
    
    if (carouselSlides !== undefined) {
      settings.carouselSlides = carouselSlides;
    }

    const updatedSettings = await settings.save();
    res.json(updatedSettings);
  } catch (error) {
    res.status(500).json({ message: 'Server Error updating settings' });
  }
});

module.exports = router;
