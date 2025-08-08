import { Server } from 'socket.io';
import { logger } from './utils/logger';
import { upbitService } from './services/upbitService';
import { wsRateLimiterMiddleware } from './middleware/rateLimiter';

export const setupWebSocket = (io: Server) => {
  // 연결 관리
  const connectedClients = new Map<string, any>();

  io.on('connection', async (socket) => {
    const clientId = socket.id;
    const clientIp = socket.handshake.address;

    // Rate limiting 체크
    const isAllowed = await wsRateLimiterMiddleware({ ip: clientIp });
    if (!isAllowed) {
      socket.emit('error', { message: 'Rate limit exceeded' });
      socket.disconnect();
      return;
    }

    logger.info(`Client connected: ${clientId} from ${clientIp}`);
    connectedClients.set(clientId, {
      socket,
      subscriptions: new Set(),
      connectedAt: new Date()
    });

    // 클라이언트에게 연결 확인
    socket.emit('connected', {
      clientId,
      timestamp: new Date().toISOString(),
      message: 'Connected to CryptoAI WebSocket'
    });

    // 마켓 데이터 구독
    socket.on('subscribe_market', async (data) => {
      try {
        const { markets, channels = ['ticker'] } = data;

        if (!markets || !Array.isArray(markets)) {
          socket.emit('error', { message: 'Invalid markets parameter' });
          return;
        }

        // 마켓 유효성 검사
        const invalidMarkets = markets.filter(market => !upbitService.isValidMarket(market));
        if (invalidMarkets.length > 0) {
          socket.emit('error', { message: `Invalid markets: ${invalidMarkets.join(', ')}` });
          return;
        }

        // 구독 처리
        const client = connectedClients.get(clientId);
        if (client) {
          markets.forEach(market => {
            client.subscriptions.add(market);
            socket.join(`market_${market}`);
          });
        }

        socket.emit('subscribed', {
          markets,
          channels,
          timestamp: new Date().toISOString()
        });

        logger.info(`Client ${clientId} subscribed to markets: ${markets.join(', ')}`);
      } catch (error) {
        logger.error(`Error in market subscription for ${clientId}:`, error);
        socket.emit('error', { message: 'Failed to subscribe to markets' });
      }
    });

    // 구독 해제
    socket.on('unsubscribe_market', (data) => {
      try {
        const { markets } = data;
        const client = connectedClients.get(clientId);

        if (client && markets) {
          markets.forEach(market => {
            client.subscriptions.delete(market);
            socket.leave(`market_${market}`);
          });
        }

        socket.emit('unsubscribed', {
          markets,
          timestamp: new Date().toISOString()
        });

        logger.info(`Client ${clientId} unsubscribed from markets: ${markets.join(', ')}`);
      } catch (error) {
        logger.error(`Error in market unsubscription for ${clientId}:`, error);
        socket.emit('error', { message: 'Failed to unsubscribe from markets' });
      }
    });

    // 실시간 예측 요청
    socket.on('request_prediction', async (data) => {
      try {
        const { market, hours = 24 } = data;

        if (!market || !upbitService.isValidMarket(market)) {
          socket.emit('error', { message: 'Invalid market parameter' });
          return;
        }

        // AI 예측 실행
        const { aiService } = await import('./services/aiService');
        const prediction = await aiService.ensemblePrediction(market, hours);

        socket.emit('prediction_result', {
          market,
          prediction,
          timestamp: new Date().toISOString()
        });

        logger.info(`Prediction sent to ${clientId} for ${market}`);
      } catch (error) {
        logger.error(`Error in prediction request for ${clientId}:`, error);
        socket.emit('error', { message: 'Failed to generate prediction' });
      }
    });

    // 기술적 지표 요청
    socket.on('request_indicators', async (data) => {
      try {
        const { market } = data;

        if (!market || !upbitService.isValidMarket(market)) {
          socket.emit('error', { message: 'Invalid market parameter' });
          return;
        }

        const candles = await upbitService.getCandles(market, 'minutes', 200);
        const normalizedData = upbitService.normalizeCandleData(candles);
        const { aiService } = await import('./services/aiService');
        const indicators = aiService.calculateTechnicalIndicators(normalizedData);

        socket.emit('indicators_result', {
          market,
          indicators,
          timestamp: new Date().toISOString()
        });

        logger.info(`Technical indicators sent to ${clientId} for ${market}`);
      } catch (error) {
        logger.error(`Error in indicators request for ${clientId}:`, error);
        socket.emit('error', { message: 'Failed to calculate technical indicators' });
      }
    });

    // 핑/퐁
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: new Date().toISOString() });
    });

    // 연결 해제
    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${clientId}`);
      connectedClients.delete(clientId);
    });

    // 에러 처리
    socket.on('error', (error) => {
      logger.error(`Socket error for ${clientId}:`, error);
    });
  });

  // 실시간 데이터 브로드캐스트 (주기적)
  setInterval(async () => {
    try {
      const markets = upbitService.getSupportedMarkets();
      const tickers = await upbitService.getTickers(markets);

      tickers.forEach(ticker => {
        io.to(`market_${ticker.market}`).emit('market_update', {
          market: ticker.market,
          data: {
            price: ticker.trade_price,
            change: ticker.signed_change_rate,
            volume: ticker.acc_trade_volume_24h,
            high: ticker.high_price,
            low: ticker.low_price,
            timestamp: ticker.trade_timestamp
          }
        });
      });
    } catch (error) {
      logger.error('Error broadcasting market updates:', error);
    }
  }, 5000); // 5초마다 업데이트

  // 연결 상태 모니터링
  setInterval(() => {
    const stats = {
      totalConnections: connectedClients.size,
      activeSubscriptions: Array.from(connectedClients.values())
        .reduce((total, client) => total + client.subscriptions.size, 0),
      timestamp: new Date().toISOString()
    };

    io.emit('connection_stats', stats);
    logger.debug('WebSocket stats:', stats);
  }, 30000); // 30초마다 통계 전송

  logger.info('WebSocket server initialized');
};
