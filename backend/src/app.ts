/// <reference path="./types/express.d.ts" />
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import taskRoutes from './routes/taskRoutes';
import aiRoutes from './routes/aiRoutes';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';
import logger from './utils/logger';
import rateLimit from 'express-rate-limit';
dotenv.config();

const app = express();
app.use(express.json());

// CORS middleware
app.use(cors({
  origin: true,
  credentials: true,
}));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP ' + res.statusCode + ' ' + req.method + ' ' + req.originalUrl, {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      userId: req.user?.userId,
      durationMs: duration
    });
  });
  next();
});

// Swagger/OpenAPI setup
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'SprintSync API',
    version: '1.0.0',
    description: 'API documentation for SprintSync backend',
  },
  servers: [
    { url: process.env.API_BASE_URL || 'http://localhost:3000', description: 'API server' }
  ],
};
const swaggerOptions = {
  swaggerDefinition,
  apis: ['./src/routes/*.ts'], // Scan route files for JSDoc comments
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Mount auth routes
app.use('/api/auth', authRoutes);
// Mount user routes
app.use('/api/users', userRoutes);
// Mount task routes
app.use('/api/tasks', taskRoutes);
// Mount AI routes
app.use('/api/ai', aiRoutes);

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { message: 'Too many requests, please try again later.' },
  handler: (req, res, next, options) => {
    logger.warn('Rate limit exceeded', { ip: req.ip, url: req.originalUrl });
    res.status(options.statusCode).json(options.message);
  }
});
app.use(limiter);

app.get('/', function(req, res) {
  res.send('SprintSync Backend Running');
});

// Error logging middleware (should be after all routes)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.message, {
    method: req.method,
    url: req.originalUrl,
    userId: req.user?.userId,
    error: err.message,
    stack: err.stack
  });
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export { app };
