const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const path = require('path');

// Load environment variables from .env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Product = require('../models/Product');
const User = require('../models/User');

const sampleProducts = [
  // Electronics (4 products)
  {
    name: 'Wireless Noise-Canceling Headphones',
    description: 'Premium over-ear wireless headphones with active noise cancellation, 40-hour battery life, and crystal-clear acoustic fidelity.',
    price: 99.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    numReviews: 42,
    stock: 25,
  },
  {
    name: 'Smart Fitness Watch Series 5',
    description: 'Track your workouts, heart rate, sleep metrics, and blood oxygen with a vibrant AMOLED always-on touchscreen display.',
    price: 149.50,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    rating: 4.6,
    numReviews: 29,
    stock: 18,
  },
  {
    name: 'Portable Bluetooth Speaker',
    description: 'Rugged, IPX7 waterproof outdoor Bluetooth speaker delivering rich 360-degree sound with deep bass and 15-hour playtime.',
    price: 49.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80',
    rating: 4.5,
    numReviews: 18,
    stock: 30,
  },
  {
    name: 'Ergonomic Wireless Mouse',
    description: 'High-precision wireless optical mouse designed with natural palm ergonomics, silent click switches, and dual Bluetooth/USB dongle connectivity.',
    price: 29.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80',
    rating: 4.4,
    numReviews: 35,
    stock: 40,
  },

  // Clothing (3 products)
  {
    name: 'Classic Organic Cotton Men\'s T-Shirt',
    description: 'Ultra-soft 100% combed organic ring-spun cotton tee with a tailored modern crew neckline and breathable everyday fit.',
    price: 24.99,
    category: 'Clothing',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    numReviews: 54,
    stock: 50,
  },
  {
    name: 'Cozy Fleece Pullover Women\'s Hoodie',
    description: 'Warm, plush fleece hooded sweatshirt with kangaroo pocket, ribbed cuffs, and an effortlessly relaxed silhouette.',
    price: 45.00,
    category: 'Clothing',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    numReviews: 31,
    stock: 22,
  },
  {
    name: 'Vintage Distressed Denim Jacket',
    description: 'Timeless mid-wash denim trucker jacket crafted from durable rigid cotton twill with metal button hardware.',
    price: 79.99,
    category: 'Clothing',
    image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80',
    rating: 4.6,
    numReviews: 20,
    stock: 15,
  },

  // Shoes (3 products)
  {
    name: 'Pro-Glide Performance Running Shoes',
    description: 'Lightweight cushioned athletic running shoes featuring responsive foam midsoles and high-traction rubber outsoles.',
    price: 89.95,
    category: 'Shoes',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    numReviews: 62,
    stock: 20,
  },
  {
    name: 'Urban Minimalist Casual Sneakers',
    description: 'Sleek low-top white leather sneakers with cushioned insoles, perfect for smart casual office and weekend wear.',
    price: 65.00,
    category: 'Shoes',
    image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80',
    rating: 4.5,
    numReviews: 38,
    stock: 28,
  },
  {
    name: 'Cross-Trainer Gym & Sports Shoes',
    description: 'Engineered mesh training shoes with lateral support, shock absorption, and high durability for high-intensity gym workouts.',
    price: 74.99,
    category: 'Shoes',
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
    rating: 4.4,
    numReviews: 19,
    stock: 16,
  },

  // Accessories (3 products)
  {
    name: 'Urban Commuter Waterproof Backpack',
    description: 'Multi-compartment weatherproof laptop backpack with ergonomic padded straps, USB charging pass-through, and luggage strap.',
    price: 59.99,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    numReviews: 44,
    stock: 35,
  },
  {
    name: 'Polarized UV400 Aviator Sunglasses',
    description: 'Classic metal frame sunglasses with anti-glare polarized lenses offering 100% UVA/UVB protection.',
    price: 34.50,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
    rating: 4.6,
    numReviews: 27,
    stock: 45,
  },
  {
    name: 'Genuine Leather RFID-Blocking Bifold Wallet',
    description: 'Slim genuine top-grain leather wallet featuring RFID security shields, quick-access card slots, and embossed finish.',
    price: 27.99,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    numReviews: 50,
    stock: 30,
  },

  // Home & Kitchen (3 products)
  {
    name: 'Handcrafted Ceramic Artisan Coffee Mug',
    description: '14oz stoneware ceramic coffee mug with heat-retaining glaze, smooth rim, and an ergonomic wide comfort handle.',
    price: 18.00,
    category: 'Home & Kitchen',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    numReviews: 48,
    stock: 60,
  },
  {
    name: 'Modern Nordic Minimalist Table Lamp',
    description: 'Warm ambient LED desk lamp with solid wood base, frosted linen shade, and stepless touch-dimmer switch.',
    price: 42.50,
    category: 'Home & Kitchen',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    numReviews: 23,
    stock: 14,
  },
  {
    name: 'Insulated Stainless Steel Water Bottle 32oz',
    description: 'Double-wall vacuum insulated flask that keeps beverages icy cold for 24 hours or steaming hot for 12 hours.',
    price: 22.99,
    category: 'Home & Kitchen',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    numReviews: 76,
    stock: 55,
  },

  // Additional 2 bonus products for even richer variety (Total: 18 products)
  {
    name: 'Wireless Fast Charging Pad (15W)',
    description: 'Ultra-thin Qi-certified induction charging pad with intelligent LED charging indicator and temperature control.',
    price: 21.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1622445262464-84b14e4145e3?auto=format&fit=crop&w=800&q=80',
    rating: 4.5,
    numReviews: 15,
    stock: 35,
  },
  {
    name: 'Stainless Steel Chef Knife 8-Inch',
    description: 'High-carbon Japanese stainless steel kitchen knife with razor-sharp edge retention and pakkawood handle.',
    price: 38.00,
    category: 'Home & Kitchen',
    image: 'https://images.unsplash.com/photo-1593618998160-e34014e67546?auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    numReviews: 33,
    stock: 20,
  },
];

const seedData = async () => {
  try {
    const mongoUri =
      process.env.MONGODB_URI ||
      'mongodb://127.0.0.1:27017/simple_ecommerce_store';

    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('MongoDB connection successful.');

    // Remove existing products
    await Product.deleteMany({});
    console.log('Cleared existing products.');

    // Insert new sample products
    const insertedProducts = await Product.insertMany(sampleProducts);
    console.log(`Successfully seeded ${insertedProducts.length} sample products!`);

    // Seed or update Demo User
    const existingDemo = await User.findOne({ email: 'demo@shopeasy.com' });
    if (!existingDemo) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      await User.create({
        name: 'Demo Shopper',
        email: 'demo@shopeasy.com',
        password: hashedPassword,
      });
      console.log('Seeded demo user: demo@shopeasy.com / password123');
    } else {
      console.log('Demo user already exists: demo@shopeasy.com');
    }

    console.log('Database seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed with error:', error);
    process.exit(1);
  }
};

// If run directly via CLI
if (require.main === module) {
  seedData();
}

module.exports = { sampleProducts, seedData };
