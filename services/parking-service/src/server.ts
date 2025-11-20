import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import connectDB from './config/database';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimit';

dotenv.config();

const app: Application = express();

const rawOrigins = process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:5174';
const allowedOrigins = rawOrigins
  .split(/[,\s]+/)
  .map(o => o.trim())
  .filter(Boolean);

const corsOriginChecker = (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
  // В development режиме разрешаем все localhost запросы
  if (!origin || allowedOrigins.includes(origin) || (origin && origin.startsWith('http://localhost:'))) {
    return callback(null, true);
  }
  return callback(new Error(`Not allowed by CORS: ${origin}`));
};

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Разрешаем все источники для WebSocket
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: true, // Временно разрешаем все origins для development
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter);

// Make io accessible in routes
app.set('io', io);

// Database connection
if (process.env.NODE_ENV !== 'test') { connectDB(); }

// Socket.io connection с обработкой ошибок
io.on('connection', (socket) => {
  console.log('✅ Клиент подключен:', socket.id);

  socket.on('disconnect', () => {
    console.log('❌ Клиент отключен:', socket.id);
  });

  socket.on('joinParking', (parkingId: string) => {
    if (!parkingId) {
      console.error('❌ Ошибка: parkingId не указан');
      return;
    }
    socket.join(`parking-${parkingId}`);
    console.log(`🚗 Socket ${socket.id} присоединился к parking-${parkingId}`);
  });

  socket.on('error', (error) => {
    console.error('❌ Socket ошибка:', error);
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: '🚗 Smart Parking System API',
    version: '1.0.0',
    endpoints: {
      root: '/',
      api: '/api',
      health: '/health',
      docs: '/api/docs'
    },
    allowedOrigins,
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 Handler - должен быть перед errorHandler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Маршрут не найден',
    message: `Маршрут ${req.method} ${req.originalUrl} не существует`,
    availableEndpoints: {
      root: '/',
      api: '/api',
      health: '/health'
    }
  });
});

// Error handling
app.use(errorHandler);

// Обработка необработанных промисов
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Необработанное отклонение промиса:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Необработанное исключение:', error);
  process.exit(1);
});

const PORT = process.env.PORT || 3001;

if (process.env.NODE_ENV !== 'test') {
  httpServer.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`📊 Окружение: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 API: http://localhost:${PORT}/api`);
    console.log(`❤️  Health check: http://localhost:${PORT}/health`);
  });
}

export { app, io };
