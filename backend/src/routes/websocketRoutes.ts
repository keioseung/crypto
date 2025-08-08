import { Router, Request, Response } from 'express';
import { upbitService } from '../services/upbitService';
import { apiRateLimiterMiddleware } from '../middleware/rateLimiter';
import { logger } from '../utils/logger';

const router = Router();

// WebSocket 연결 상태 확인
router.get('/status', apiRateLimiterMiddleware, async (_req: Request, res: Response) => {
  try {
    return res.json({
      success: true,
      data: {
        status: 'active',
        connections: 0, // 실제 구현에서는 연결된 클라이언트 수를 추적
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error checking WebSocket status:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to check WebSocket status' }
    });
  }
});

// WebSocket URL 생성
router.post('/url', apiRateLimiterMiddleware, async (req: Request, res: Response) => {
  try {
    const { markets, channels = ['ticker'] } = req.body;

    if (!markets || !Array.isArray(markets)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Markets array is required' }
      });
    }

    // 마켓 유효성 검사
    const invalidMarkets = markets.filter(market => !upbitService.isValidMarket(market));
    if (invalidMarkets.length > 0) {
      return res.status(400).json({
        success: false,
        error: { message: `Invalid markets: ${invalidMarkets.join(', ')}` }
      });
    }

    const wsUrl = upbitService.generateWebSocketUrl(markets, channels);

    return res.json({
      success: true,
      data: {
        websocketUrl: wsUrl,
        markets,
        channels,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error generating WebSocket URL:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to generate WebSocket URL' }
    });
  }
});

// 실시간 데이터 구독 설정
router.post('/subscribe', apiRateLimiterMiddleware, async (req: Request, res: Response) => {
  try {
    const { markets, channels = ['ticker'], interval = 1000 } = req.body;

    if (!markets || !Array.isArray(markets)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Markets array is required' }
      });
    }

    // 구독 설정 저장 (실제 구현에서는 Redis나 DB에 저장)
    const subscription = {
      id: `sub_${Date.now()}`,
      markets,
      channels,
      interval,
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    return res.json({
      success: true,
      data: {
        subscription,
        message: 'Subscription created successfully'
      }
    });
  } catch (error) {
    logger.error('Error creating subscription:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to create subscription' }
    });
  }
});

// 구독 해제
router.post('/unsubscribe', apiRateLimiterMiddleware, async (req: Request, res: Response) => {
  try {
    const { subscriptionId } = req.body;

    if (!subscriptionId) {
      return res.status(400).json({
        success: false,
        error: { message: 'Subscription ID is required' }
      });
    }

    // 구독 해제 처리 (실제 구현에서는 Redis나 DB에서 제거)
    return res.json({
      success: true,
      data: {
        message: 'Subscription unsubscribed successfully',
        subscriptionId
      }
    });
  } catch (error) {
    logger.error('Error unsubscribing:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to unsubscribe' }
    });
  }
});

// 구독 목록 조회
router.get('/subscriptions', apiRateLimiterMiddleware, async (req: Request, res: Response) => {
  try {
    // 실제 구현에서는 DB에서 구독 목록을 가져옴
    const subscriptions = [
      {
        id: 'sub_1',
        markets: ['KRW-BTC', 'KRW-ETH'],
        channels: ['ticker'],
        interval: 1000,
        createdAt: new Date().toISOString(),
        status: 'active'
      }
    ];

    return res.json({
      success: true,
      data: {
        subscriptions,
        count: subscriptions.length
      }
    });
  } catch (error) {
    logger.error('Error fetching subscriptions:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch subscriptions' }
    });
  }
});

export default router;
