import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { config, validateEnvironment } from './config/environment.js';
import { seedDatabase } from './scripts/seed.js';

const startServer = async () => {
  try {
    validateEnvironment();
    console.log('[Server] Connecting to MongoDB...');
    await connectDB();

    // Auto-seed if database is fresh / in-memory
    await seedDatabase(false);

    const app = createApp();
    const server = app.listen(config.port, () => {
      console.log(`====================================================`);
      console.log(`🚗 DriveX API Server Running on port: ${config.port}`);
      console.log(`🌐 Environment: ${config.nodeEnv}`);
      console.log(`📍 Dealership Region: ${config.dealershipCity}, ${config.dealershipState}`);
      console.log(`🔗 Health Check: http://localhost:${config.port}/api/health`);
      console.log(`====================================================`);
    });

    const shutdown = async () => {
      console.log('[Server] Gracefully shutting down...');
      server.close(() => {
        console.log('[Server] HTTP listener closed');
      });
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('[Server] Fatal startup error:', error);
    process.exit(1);
  }
};

startServer();
