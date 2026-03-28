require('dotenv').config();
const connectDB = require('../lib/db');
const mongoose = require('mongoose');
const Expense = require('../models/Expense');

async function run() {
  if (!process.env.MONGO_URI) {
    console.error('Please set MONGO_URI in environment');
    process.exit(1);
  }

  const defaultOwner = process.env.DEFAULT_OWNER_EMAIL;
  if (!defaultOwner) {
    console.error('Please set DEFAULT_OWNER_EMAIL in environment');
    process.exit(1);
  }

  await connectDB();

  try {
    const res = await Expense.updateMany({ $or: [{ owner: { $exists: false } }, { owner: null }, { owner: '' }] }, { $set: { owner: defaultOwner } });
    console.log('Migration complete. Modified count:', res.modifiedCount);
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    mongoose.connection.close();
  }
}

run();
