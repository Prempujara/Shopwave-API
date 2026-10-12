import mongoose from 'mongoose';
import { config } from './env';

export const connectDB = async (): Promise<void> => {
  try {
    if (config.MONGO_URI && config.MONGO_URI.trim() !== '') {
      await mongoose.connect(config.MONGO_URI);
      console.log(`[Database] Connected successfully to MongoDB at: ${config.MONGO_URI.replace(/:\/\/.*@/, '://***:***@')}`);
    } else {
      console.log('[Database] No MONGO_URI provided in .env. Initializing in-memory MongoDB instance for seamless local testing...');
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memoryUri = mongod.getUri();
      await mongoose.connect(memoryUri);
      console.log(`[Database] In-memory MongoDB connected successfully at ${memoryUri}`);
    }
  } catch (error) {
    console.error('[Database] MongoDB connection error:', error);
    process.exit(1);
  }
};
