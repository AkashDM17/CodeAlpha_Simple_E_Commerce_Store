const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const Product = require('./models/Product');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const { sampleProducts } = require('./seed/products');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb://127.0.0.1:27017/simple_ecommerce_store';

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'ShopEasy API is running smoothly',
    timestamp: new Date().toISOString(),
  });
});

// Auto-seed function if DB is empty
const autoSeedIfEmpty = async () => {
  try {
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('Database has 0 products. Auto-seeding initial products...');
      await Product.insertMany(sampleProducts);
      console.log(`Auto-seeded ${sampleProducts.length} initial products!`);
    }

    // Seed demo user if missing
    const demoUser = await User.findOne({ email: 'demo@shopeasy.com' });
    if (!demoUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      await User.create({
        name: 'Demo Shopper',
        email: 'demo@shopeasy.com',
        password: hashedPassword,
      });
      console.log('Auto-seeded demo user: demo@shopeasy.com / password123');
    }
  } catch (err) {
    console.error('Auto-seed check notice:', err.message);
  }
};

// 404 for unmatched API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route ${req.originalUrl} not found`,
  });
});

// Fallback to index.html for root path or SPA navigation if needed
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Connect to MongoDB and start server
mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log('====================================');
    console.log('MongoDB Connected Successfully!');
    console.log(`Database URI: ${MONGODB_URI}`);
    console.log('====================================');

    await autoSeedIfEmpty();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`ShopEasy E-Commerce Store is ready for use.`);
    });
  })
  .catch((err) => {
    console.error('MongoDB Connection Error:', err.message);
    console.error(
      'Ensure MongoDB is running locally on port 27017 or update MONGODB_URI in .env'
    );
    process.exit(1);
  });
