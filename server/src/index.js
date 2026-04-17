import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import { errorHandler } from './middleware/errorHandler.js';
import { requireAuth } from './middleware/auth.js';
import { generateAutoNotifications } from './controllers/notificationController.js';

// Route imports
import authRoutes from './routes/auth.js';
import assetRoutes from './routes/assets.js';
import dashboardRoutes from './routes/dashboard.js';
import userRoutes from './routes/users.js';
import notificationRoutes from './routes/notifications.js';
import activityLogRoutes from './routes/activityLogs.js';
import searchRoutes from './routes/search.js';

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

// Health check (public)
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

// Auth routes (login is public, /me is protected inside the route)
app.use('/api/auth', authRoutes);

// Protected API routes — all require authentication
app.use('/api/assets', requireAuth, assetRoutes);
app.use('/api/dashboard', requireAuth, dashboardRoutes);
app.use('/api/users', requireAuth, userRoutes);
app.use('/api/notifications', requireAuth, notificationRoutes);
app.use('/api/activity-logs', requireAuth, activityLogRoutes);
app.use('/api/search', requireAuth, searchRoutes);

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

  // Auto-generate notifications on startup
  generateAutoNotifications().then(() => {
    console.log('🔔 Auto-notifications checked');
  });

  // Check for auto-notifications every hour
  setInterval(() => {
    generateAutoNotifications();
  }, 60 * 60 * 1000);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});
