import mongoose from 'mongoose';

async function connectDB() {
  if (!process.env.MONGODB_URL) {
    throw new Error('MONGODB_URL is not defined in .env');
  }

  await mongoose.connect(process.env.MONGODB_URL);
  console.log('MongoDB connected');
}

export default connectDB;
