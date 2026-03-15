import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { startKeepAliveCron } from './lib/cron';
import { initializeGenerationJobs } from './lib/generation-jobs';

// Start database keepalive cron job (runs every N minutes from KEEPALIVE_INTERVAL_MINUTES)
// This keeps both Neon DB and Render backend active
startKeepAliveCron();

// Create Express app
const app = express();

// Get port from environment
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// CORS configuration
const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, ''); // Remove trailing slash
app.use(
  cors({
    origin: frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging in development
if (process.env.NODE_ENV === 'development') {
  app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// API routes
app.use('/api', routes);

// Root route
app.get('/', (_req, res) => {
  res.json({
    success: true,
    data: {
      name: 'Savra AI Backend API',
      version: '1.0.0',
      docs: '/api/health',
    },
  });
});

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

async function startServer() {
  await initializeGenerationJobs();

  app.listen(PORT, () => {
    console.log(`
========================================
  Savra AI Backend Server
========================================
  Environment: ${process.env.NODE_ENV || 'development'}
  Port: ${PORT}
  URL: http://localhost:${PORT}
  API: http://localhost:${PORT}/api
  Health: http://localhost:${PORT}/api/health
========================================
  `);
  });
}

void startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

export default app;
