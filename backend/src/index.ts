import express from 'express';
import cors from 'cors';

const app = express();
const PORT = parseInt(process.env.PORT || '6060', 10);

console.log('🚀 Starting CryptoAI Backend Server...');
console.log(`📋 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔧 Port: ${PORT}`);
console.log(`🌐 Process ID: ${process.pid}`);

// CORS 설정
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

// 기본 미들웨어
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 테스트 엔드포인트
app.get('/', (req, res) => {
  console.log(`📥 GET / - Request from ${req.ip}`);
  res.json({ 
    message: 'CryptoAI Backend is running!',
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    pid: process.pid,
    version: '1.0.0'
  });
});

app.get('/health', (req, res) => {
  console.log(`📥 GET /health - Request from ${req.ip}`);
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    port: PORT,
    pid: process.pid,
    memory: process.memoryUsage()
  });
});

// API v1 라우트
app.get('/api/v1/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'CryptoAI Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// 404 핸들러
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// 서버 시작
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on 0.0.0.0:${PORT}`);
  console.log(`📊 Health check: http://0.0.0.0:${PORT}/health`);
  console.log(`🔗 API endpoint: http://0.0.0.0:${PORT}/api/v1`);
});

// 서버 에러 핸들링
server.on('error', (error) => {
  console.error('❌ Server error:', error);
  process.exit(1);
});

// 에러 핸들링
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Process terminated');
    process.exit(0);
  });
});
