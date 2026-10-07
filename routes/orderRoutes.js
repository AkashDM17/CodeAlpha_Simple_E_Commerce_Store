const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect } = require('../middleware/authMiddleware');

// Helper to generate readable unique order ID
const generateOrderId = () => {
  const timestamp = Date.now().toString().slice(-6);
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${timestamp}-${randomSuffix}`;
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your order cart is empty. Please add items before checking out.',
      });
    }

    // Validate shipping address
    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.address ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.pinCode ||
      !shippingAddress.phone
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please complete all shipping address fields.',
      });
    }

    // Verify stock and compute verified total server-side
    let verifiedTotal = 0;
    const verifiedOrderItems = [];
    const productsToUpdate = [];

    for (const item of items) {
      const productId = item.product || item._id;
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({
          success: false,
          message: `Invalid product ID in order items: ${productId}`,
        });
      }

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product "${item.name || productId}" was not found.`,
        });
      }

      const quantity = parseInt(item.quantity) || 1;
      if (quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for product "${product.name}".`,
        });
      }

      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Only ${product.stock} units available.`,
        });
      }

      verifiedTotal += product.price * quantity;
      verifiedOrderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        image: product.image,
      });

      productsToUpdate.push({
        product,
        newStock: product.stock - quantity,
      });
    }

    // Deduct stock for all products
    for (const update of productsToUpdate) {
      update.product.stock = update.newStock;
      await update.product.save();
    }

    // Create the order
    const order = await Order.create({
      orderId: generateOrderId(),
      user: req.user._id,
      items: verifiedOrderItems,
      shippingAddress: {
        fullName: shippingAddress.fullName.trim(),
        address: shippingAddress.address.trim(),
        city: shippingAddress.city.trim(),
        state: shippingAddress.state.trim(),
        pinCode: shippingAddress.pinCode.trim(),
        phone: shippingAddress.phone.trim(),
      },
      paymentMethod: paymentMethod || 'Cash on Delivery (Simulated)',
      paymentStatus: 'Completed (Simulated)',
      totalAmount: verifiedTotal,
      status: 'Processing',
    });

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order,
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process order. Please try again.',
    });
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve order history.',
    });
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    let order;
    if (mongoose.Types.ObjectId.isValid(id)) {
      order = await Order.findById(id);
    } else {
      order = await Order.findOne({ orderId: id });
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    // Authorize: user can only view their own orders
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this order.',
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve order details.',
    });
  }
});

module.exports = router;
