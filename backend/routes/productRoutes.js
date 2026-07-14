const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const keyword = req.query.keyword
      ? {
          name: {
            $regex: req.query.keyword,
            $options: 'i',
          },
        }
      : {};

    const category = req.query.category ? { category: req.query.category } : {};

    // Ignore dummy product IDs if needed, but for now just query normally
    const products = await Product.find({ ...keyword, ...category });
    res.json(products);
  } catch (error) {
    res.json([]);
  }
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      // Mock success for dummy products so that delete works instantly
      return res.json({ message: 'Dummy product removed successfully' });
    }
    const product = await Product.findById(req.params.id);
    if (product) {
      await product.deleteOne();
      res.json({ message: 'Product removed successfully' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const { name, price, discountPrice, description, image, images, video, colors, category, rating, countInStock } = req.body;
    
    const finalColors = Array.isArray(colors) 
      ? colors 
      : (typeof colors === 'string' ? colors.split(',').map(c => c.trim()).filter(Boolean) : []);

    const product = new Product({
      user: req.user._id,
      name: name || 'Sample Product',
      price: price || 0,
      discountPrice: discountPrice !== undefined ? discountPrice : undefined,
      description: description || 'Sample Description',
      image: image || (images && images[0]) || 'https://images.unsplash.com/photo-1603313011101-320f26a4f6f6?w=400&q=75',
      images: images || [],
      video: video || '',
      colors: finalColors,
      category: category || 'Chargers',
      brand: 'KGN Accessories',
      rating: rating || 5,
      numReviews: 0,
      countInStock: countInStock !== undefined ? countInStock : 10,
    });
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { name, price, discountPrice, description, image, images, video, colors, category, countInStock } = req.body;

    const finalColors = colors !== undefined
      ? (Array.isArray(colors) ? colors : (typeof colors === 'string' ? colors.split(',').map(c => c.trim()).filter(Boolean) : []))
      : undefined;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      const product = new Product({
        user: req.user._id,
        name: name || 'Sample Product',
        price: price || 0,
        discountPrice: discountPrice !== undefined ? discountPrice : undefined,
        description: description || 'Sample Description',
        image: image || (images && images[0]) || 'https://images.unsplash.com/photo-1603313011101-320f26a4f6f6?w=400&q=75',
        images: images || [],
        video: video || '',
        colors: finalColors || [],
        category: category || 'Chargers',
        brand: 'KGN Accessories',
        rating: 5,
        numReviews: 0,
        countInStock: countInStock !== undefined ? countInStock : 10,
      });
      const createdProduct = await product.save();
      return res.json(createdProduct);
    }

    const product = await Product.findById(req.params.id);
    if (product) {
      product.name = name || product.name;
      product.price = price !== undefined ? price : product.price;
      if (discountPrice !== undefined) product.discountPrice = discountPrice;
      product.description = description || product.description;
      product.image = image || (images && images[0]) || product.image;
      if (images !== undefined) product.images = images;
      if (video !== undefined) product.video = video;
      if (finalColors !== undefined) product.colors = finalColors;
      product.category = category || product.category;
      product.countInStock = countInStock !== undefined ? countInStock : product.countInStock;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
router.post('/:id/reviews', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReviewed) return res.status(400).json({ message: 'You already reviewed this product' });
    
    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };
    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;
    await product.save();
    res.status(201).json({ message: 'Review added' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
});

module.exports = router;
