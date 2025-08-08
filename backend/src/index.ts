import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { setupRoutes } from './routes';
import { setupWebSocket } from './websocket';
import { initializeUpbitService } from './services/upbitService';
import { initializeAIService } from './services/aiService';
import { initializeCronJobs } from './cron';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "https://crypto-production-60f9.up.railway.app",
    methods: ["GET", "POST"]
  }
});

const PORT = parseInt(process.env.PORT || '6060', 10);

// 미들웨어 설정
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "https://crypto-production-60f9.up.railway.app",
  credentials: true
}));
app.use(compression());
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(rateLimiter);

// 헬스체크
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 루트 경로 테스트
app.get('/', (req, res) => {
  res.json({ 
    message: 'CryptoAI Backend is running!',
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV || 'development'
  });
});

// API 라우트 설정
setupRoutes(app);

// WebSocket 설정
setupWebSocket(io);

// 에러 핸들러
app.use(errorHandler);

// 서버 시작
async function startServer() {
  try {
    // 서비스 초기화
    await initializeUpbitService();
    await initializeAIService();
    
    // 크론잡 설정
    initializeCronJobs();
    
    server.listen(PORT, '0.0.0.0', () => {
      logger.info(`🚀 CryptoAI Backend Server running on 0.0.0.0:${PORT}`);
      logger.info(`📊 API Documentation: http://0.0.0.0:${PORT}/api/docs`);
      logger.info(`🔌 WebSocket: ws://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
  });
});

startServer();
