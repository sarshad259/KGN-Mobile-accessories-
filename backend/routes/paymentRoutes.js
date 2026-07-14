const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// @desc    Create a Stripe Payment Intent
// @route   POST /api/payment/create-intent
// @access  Public
router.post('/create-intent', async (req, res) => {
  const { amount, currency = 'usd' } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Invalid amount' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ message: 'Stripe not configured. Add STRIPE_SECRET_KEY to .env' });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      automatic_payment_methods: { enabled: true },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Stripe error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Place Cash on Delivery order
// @route   POST /api/payment/cod
// @access  Public
router.post('/cod', async (req, res) => {
  const { orderItems, shippingAddress, totalPrice } = req.body;

  if (!orderItems || orderItems.length === 0) {
    return res.status(400).json({ message: 'No order items' });
  }

  // In a real app, you'd save the order to the DB here using the Order model
  // For now, simulate a successful order placement
  const mockOrderId = `KGN-${Date.now()}`;

  res.status(201).json({
    orderId: mockOrderId,
    message: 'Order placed successfully',
    paymentMethod: 'Cash on Delivery',
    totalPrice,
    shippingAddress,
  });
});

module.exports = router;
