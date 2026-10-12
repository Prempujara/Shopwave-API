import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import path from 'path';

import { config } from './config/env';
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import cartRoutes from './routes/cart.routes';
import orderRoutes from './routes/order.routes';
import { errorHandler } from './middleware/error.middleware';
import { NotFoundError } from './utils/AppError';
import { swaggerDocument } from './docs/swagger';

export const createApp = (): Application => {
  const app: Application = express();

  // Core Middlewares
  app.use(cors({ origin: config.CORS_ORIGIN, credentials: true }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request Logging
  if (config.NODE_ENV !== 'test') {
    app.use(morgan(config.NODE_ENV === 'development' ? 'dev' : 'combined'));
  }

  // Swagger API Docs
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  // Health check endpoint
  app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      service: 'Shopwave Backend API',
      version: '1.0.0'
    });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/cart', cartRoutes);
  app.use('/api/orders', orderRoutes);

  // Serve static UI client if built
  const clientDist = path.resolve(process.cwd(), 'client', 'dist');
  app.use(express.static(clientDist));

  // Fallback for API routes
  app.use('/api', (req: Request, res: Response, next) => {
    next(new NotFoundError(`Cannot find endpoint ${req.originalUrl} on this server`));
  });

  // Serve client index.html for all non-api frontend routes
  app.use((req: Request, res: Response, next) => {
    if (req.method !== 'GET' || req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/api-docs')) {
      return next();
    }
    const indexPath = path.join(clientDist, 'index.html');
    res.sendFile(indexPath, (err) => {
      if (err) {
        next();
      }
    });
  });

  // Central Error Handler
  app.use(errorHandler);

  return app;
};
