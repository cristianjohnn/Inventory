import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import { errorHandler } from './middleware/errorHandler.js';
import assetRoutes from './routes/assets.js';
import dashboardRoutes from './routes/dashboard.js';

const app = express();
app.set('trust proxy', 1); // Trust first proxy (Nginx)

const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// =============================================
// Middleware Stack
// =============================================

// CORS — whitelist frontend URL
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Request logging
app.use(morgan('dev'));

// Parse JSON bodies
app.use(express.json());

// Rate limiting — 100 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 'RATE_LIMITED', message: 'Too many requests. Try again in a minute.' },
  },
});
app.use('/api/', limiter);

// =============================================
// Routes
// =============================================

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      success: true,
      data: {
        status: 'ok',
        database: 'connected',
        timestamp: new Date().toISOString(),
      },
    });
  } catch {
    res.status(503).json({
      success: true,
      data: {
        status: 'degraded',
        database: 'disconnected',
        timestamp: new Date().toISOString(),
      },
    });
  }
});

// API routes
app.use('/api/assets', assetRoutes);
app.use('/api/dashboard', dashboardRoutes);

// =============================================
// Error Handling
// =============================================

app.use(errorHandler);

// =============================================
// Start Server
// =============================================

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});
