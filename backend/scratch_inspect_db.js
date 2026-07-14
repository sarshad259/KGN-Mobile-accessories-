const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB:', mongoose.connection.name);

    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections in database:');
    for (let col of collections) {
      const count = await mongoose.connection.db.collection(col.name).countDocuments();
      console.log(`- ${col.name}: ${count} documents`);
    }

    // Print users
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log('\nUsers in DB:', JSON.stringify(users.map(u => ({ email: u.email, isAdmin: u.isAdmin, _id: u._id })), null, 2));

    // Print orders count
    const ordersCount = await mongoose.connection.db.collection('orders').countDocuments();
    console.log(`\nOrders count in DB: ${ordersCount}`);

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

run();
