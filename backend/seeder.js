const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Product = require('./models/Product');
const User = require('./models/User');
const Admin = require('./models/Admin');

const products = [
  {
    name: "KGN Armor Case - iPhone 15 Pro Max",
    image: "https://images.unsplash.com/photo-1603313011101-320f26a4f6f6?w=600&q=80",
    brand: "KGN Accessories",
    category: "Chargers",
    description: "Engineered with military-grade drop protection, a premium tactile finish, and integrated strong MagSafe compatibility.",
    price: 29.99,
    countInStock: 25,
    rating: 4.8,
    numReviews: 12,
  },
  {
    name: "Ultra-Fast 65W GaN Charger",
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&q=80",
    brand: "KGN Accessories",
    category: "Chargers",
    description: "Pocket-sized 65W charger utilizes gallium nitride (GaN) tech to safely power up three devices concurrently at lightning speeds.",
    price: 39.99,
    countInStock: 40,
    rating: 4.9,
    numReviews: 18,
  },
  {
    name: "SonicBass Wireless Earbuds",
    image: "https://images.unsplash.com/photo-1606220588913-b3aecb4b2c12?w=600&q=80",
    brand: "KGN Accessories",
    category: "Audio",
    description: "Immerse yourself in crystal clear high-fidelity sound, deep resonance, active noise cancellation, and a sleek modern case.",
    price: 89.99,
    countInStock: 15,
    rating: 4.7,
    numReviews: 24,
  },
  {
    name: "MagSafe 10,000mAh Power Bank",
    image: "https://images.unsplash.com/photo-1610945264803-c22b62d2a7b3?w=600&q=80",
    brand: "KGN Accessories",
    category: "Power Banks",
    description: "Powerful magnetic portable charger snaps effortlessly onto your iPhone to deliver reliable fast wireless charging on the go.",
    price: 49.99,
    countInStock: 30,
    rating: 4.6,
    numReviews: 8,
  },
  {
    name: "KGN Crystal Clear S24 Case",
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&q=80",
    brand: "KGN Accessories",
    category: "Chargers",
    description: "Show off your Samsung Galaxy S24 original aesthetics with ultimate anti-yellowing tech and drop-proof bumper corners.",
    price: 19.99,
    countInStock: 50,
    rating: 4.5,
    numReviews: 9,
  },
  {
    name: "120W Super Flash Charge Adapter",
    image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&q=80",
    brand: "KGN Accessories",
    category: "Chargers",
    description: "Experience hyper charging speeds with intelligent power distribution and overheating safeguards for high-draw laptops and smartphones.",
    price: 54.99,
    countInStock: 20,
    rating: 4.8,
    numReviews: 14,
  },
  {
    name: "ANC Pro Noise-Cancelling Headphones",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80",
    brand: "KGN Accessories",
    category: "Audio",
    description: "Studio-quality over-ear headphones with custom acoustic drivers, luxury memory foam cups, and continuous 40-hour playback duration.",
    price: 119.99,
    countInStock: 10,
    rating: 4.9,
    numReviews: 31,
  },
  {
    name: "Slimline 20,000mAh Power Bank",
    image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&q=80",
    brand: "KGN Accessories",
    category: "Power Banks",
    description: "Thinnest high capacity battery cell pack fits easily into any handbag or backpack for multi-day device charges.",
    price: 39.99,
    countInStock: 18,
    rating: 4.4,
    numReviews: 11,
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding...');

    // Get an admin user to associate products with
    const adminUser = await User.findOne({ isAdmin: true });
    if (!adminUser) {
      console.error('No Admin User found in database! Please register an admin user first.');
      process.exit(1);
    }

    // Drop and seed dedicated admins collection
    await Admin.deleteMany({});
    await Admin.create({
      email: adminUser.email,
      name: adminUser.name,
      role: 'Super Admin',
    });
    console.log('Admins collection successfully seeded! 🌱');

    // Delete existing products
    await Product.deleteMany({});
    console.log('Existing products cleared.');

    // Associate admin user with products
    const seedProducts = products.map(product => {
      return { ...product, user: adminUser._id };
    });

    // Insert new products
    await Product.insertMany(seedProducts);
    console.log('Database successfully seeded with KGN Accessories catalog! 🌱');
    process.exit(0);
  } catch (error) {
    console.error(`Error with seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedDB();
