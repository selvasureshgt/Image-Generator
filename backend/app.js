import express from 'express';
import morgan from 'morgan';
import corsMiddleware from './src/middleware/cors.js';
import rateLimiter from './src/middleware/rateLimiter.js';
import { errorHandler } from './src/middleware/errorHandler.js';
import imageRoutes from './src/routes/image.routes.js';

const app = express();

app.use(morgan('dev'));
app.use(corsMiddleware);
app.use(express.json({ limit: '10mb' }));

app.use('/api', rateLimiter);

app.use('/api/images', imageRoutes);

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

app.use(errorHandler);

export default app;
