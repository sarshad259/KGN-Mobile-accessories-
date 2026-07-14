const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { protect, admin } = require('../middleware/authMiddleware');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// @route   POST /api/users/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/users  (Register)
router.post('/', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, password });
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch {
    res.status(500).json({ message: 'Server Error' });
  }
});



// @route   GET /api/users/profile  (Protected)
router.get('/profile', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.json({ _id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// @route   GET /api/users  (Admin only)
router.get('/', protect, admin, async (req, res) => {
  const users = await User.find({}).select('-password');
  res.json(users);
});

// @route   GET /api/users/wishlist
// @desc    Get user wishlist
// @access  Private
router.get('/wishlist', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    if (user) {
      res.json((user.wishlist || []).filter(item => item != null));
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/users/wishlist
// @desc    Add or remove a product from wishlist
// @access  Private
router.post('/wishlist', protect, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is missing' });
    }

    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: `Invalid Product ID format: ${productId}` });
    }

    const user = await User.findById(req.user._id);

    if (user) {
      const alreadyAdded = user.wishlist.some(id => id && id.toString() === productId.toString());
      
      if (alreadyAdded) {
        // Remove from wishlist atomically
        await User.findByIdAndUpdate(req.user._id, {
          $pull: { wishlist: productId }
        });
      } else {
        // Add to wishlist atomically
        await User.findByIdAndUpdate(req.user._id, {
          $addToSet: { wishlist: productId }
        });
      }
      
      const updatedUser = await User.findById(req.user._id).populate('wishlist');
      res.json((updatedUser.wishlist || []).filter(item => item != null));
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Wishlist POST Error:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
});

module.exports = router;
