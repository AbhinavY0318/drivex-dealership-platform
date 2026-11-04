import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { config } from './environment.js';

let mongodInstance: MongoMemoryServer | null = null;

export const connectDB = async (): Promise<string> => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection.host;
  }

  let uri = config.mongodbUri;

  if (!uri) {
    console.log('[Database] No MONGODB_URI provided. Starting in-memory MongoMemoryServer...');
    mongodInstance = await MongoMemoryServer.create();
    uri = mongodInstance.getUri();
  }

  try {
    const conn = await mongoose.connect(uri, {
      autoIndex: true,
      dbName: 'drivex',
    });
    console.log(`[Database] MongoDB connected successfully to '${conn.connection.name}': ${conn.connection.host}`);
    return conn.connection.host;
  } catch (error) {
    console.error('[Database] Connection failed:', error);
    throw error;
  }
};

export const disconnectDB = async (): Promise<void> => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongodInstance) {
    await mongodInstance.stop();
    mongodInstance = null;
  }
  console.log('[Database] Disconnected from MongoDB');
};

export const clearDB = async (): Promise<void> => {
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  }
};
