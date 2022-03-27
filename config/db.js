const mongoose = require('mongoose');
const config = require('config');
const db = process.env.MONGO_URL;

const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
    });

    console.log('MongoDB connected');
  } catch (err) {
    console.error(err.message);
    // Exit process with failure.
    process.exit(1);
  }
};

module.exports = connectDB;
