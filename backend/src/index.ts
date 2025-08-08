import express from 'express';
import cors from 'cors';

const app = express();
const PORT = parseInt(process.env.PORT || '6060', 10);

console.log('🚀 Starting CryptoAI Backend Server...');
console.log(`📋 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔧 Port: ${PORT}`);
console.log(`🌐 Process ID: ${process.pid}`);

// 기본 미들웨어
app.use(cors());
app.use(express.json());

// 테스트 엔드포인트
app.get('/', (req, res) => {
  console.log(`📥 GET / - Request from ${req.ip}`);
  res.json({ 
    message: 'CryptoAI Backend is running!',
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    pid: process.pid
  });
});

app.get('/health', (req, res) => {
  console.log(`📥 GET /health - Request from ${req.ip}`);
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    port: PORT,
    pid: process.pid
  });
});

// 서버 시작
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on 0.0.0.0:${PORT}`);
  console.log(`📊 Health check: http://0.0.0.0:${PORT}/health`);
  console.log(`🌍 Public URL: https://crypto-production-6042.up.railway.app`);
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
