import { createApp } from './app';
import { connectDB } from './config/db';
import { config } from './config/env';
import { seedDatabase } from './utils/seeder';

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Seed mock data if database is fresh
    await seedDatabase();

    const app = createApp();

    app.listen(config.PORT, () => {
      console.log(`=================================================`);
      console.log(`🚀 Shopwave E-Commerce API running in ${config.NODE_ENV} mode`);
      console.log(`📡 URL: http://localhost:${config.PORT}`);
      console.log(`📑 Swagger Documentation: http://localhost:${config.PORT}/api-docs`);
      console.log(`🩺 Health check: http://localhost:${config.PORT}/api/health`);
      console.log(`=================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
