import { Express } from 'express';
import marketRoutes from './marketRoutes';
import predictionRoutes from './predictionRoutes';
import technicalRoutes from './technicalRoutes';
import backtestRoutes from './backtestRoutes';
import websocketRoutes from './websocketRoutes';

export const setupRoutes = (app: Express) => {
  // API 버전 관리
  const API_VERSION = '/api/v1';

  // 마켓 데이터 라우트
  app.use(`${API_VERSION}/markets`, marketRoutes);
  
  // 예측 관련 라우트
  app.use(`${API_VERSION}/predictions`, predictionRoutes);
  
  // 기술적 분석 라우트
  app.use(`${API_VERSION}/technical`, technicalRoutes);
  
  // 백테스팅 라우트
  app.use(`${API_VERSION}/backtest`, backtestRoutes);
  
  // WebSocket 관련 라우트
  app.use(`${API_VERSION}/websocket`, websocketRoutes);

  // API 문서
  app.get(`${API_VERSION}/docs`, (req, res) => {
    res.json({
      message: 'CryptoAI API Documentation',
      version: '1.0.0',
      endpoints: {
        markets: `${API_VERSION}/markets`,
        predictions: `${API_VERSION}/predictions`,
        technical: `${API_VERSION}/technical`,
        backtest: `${API_VERSION}/backtest`,
        websocket: `${API_VERSION}/websocket`
      },
      documentation: 'https://github.com/cryptoai/docs'
    });
  });

  // 404 핸들러
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      error: {
        message: `Route ${req.originalUrl} not found`,
        availableRoutes: [
          `${API_VERSION}/markets`,
          `${API_VERSION}/predictions`,
          `${API_VERSION}/technical`,
          `${API_VERSION}/backtest`,
          `${API_VERSION}/websocket`
        ]
      }
    });
  });
};
