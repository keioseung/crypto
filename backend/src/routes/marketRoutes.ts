import { Router, Request, Response } from 'express';
import { upbitService } from '../services/upbitService';
import { apiRateLimiterMiddleware } from '../middleware/rateLimiter';
import { logger } from '../utils/logger';

const router = Router();

// 모든 지원 마켓 조회
router.get('/supported', apiRateLimiterMiddleware, async (req: Request, res: Response) => {
  try {
    const markets = upbitService.getSupportedMarkets();
    res.json({
      success: true,
      data: {
        markets,
        count: markets.length
      }
    });
  } catch (error) {
    logger.error('Error fetching supported markets:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch supported markets' }
    });
  }
});

// 현재가 조회
router.get('/tickers', apiRateLimiterMiddleware, async (req: Request, res: Response) => {
  try {
    const { markets } = req.query;
    const marketList = markets ? (markets as string).split(',') : undefined;
    
    const tickers = await upbitService.getTickers(marketList || []);
    
    res.json({
      success: true,
      data: {
        tickers,
        count: tickers.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error fetching tickers:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch tickers' }
    });
  }
});

// 캔들 데이터 조회
router.get('/candles/:market', apiRateLimiterMiddleware, async (req: Request, res: Response) => {
  try {
    const { market } = req.params;
    const { unit = 'minutes', count = '200', to } = req.query;

    if (!upbitService.isValidMarket(market)) {
      return res.status(400).json({
        success: false,
        error: { message: `Invalid market: ${market}` }
      });
    }

    const candles = await upbitService.getCandles(
      market,
      unit as 'minutes' | 'days' | 'weeks' | 'months',
      parseInt(count as string),
      to as string | undefined
    );

    const normalizedData = upbitService.normalizeCandleData(candles);

    return res.json({
      success: true,
      data: {
        market,
        candles: normalizedData,
        count: normalizedData.length,
        unit,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error(`Error fetching candles for ${req.params.market}:`, error);
    res.status(500).json({
      success: false,
      error: { message: `Failed to fetch candles for ${req.params.market}` }
    });
  }
});

// 호가 정보 조회
router.get('/orderbook', apiRateLimiterMiddleware, async (req: Request, res: Response) => {
  try {
    const { markets } = req.query;
    
    if (!markets) {
      return res.status(400).json({
        success: false,
        error: { message: 'Markets parameter is required' }
      });
    }

    const marketList = (markets as string).split(',');
    const orderbook = await upbitService.getOrderBook(marketList);

    return res.json({
      success: true,
      data: {
        orderbook,
        count: orderbook.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error fetching orderbook:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch orderbook' }
    });
  }
});

// 24시간 거래량 조회
router.get('/volume/:market', apiRateLimiterMiddleware, async (req: Request, res: Response) => {
  try {
    const { market } = req.params;

    if (!upbitService.isValidMarket(market)) {
      return res.status(400).json({
        success: false,
        error: { message: `Invalid market: ${market}` }
      });
    }

    const volumeData = await upbitService.get24HourVolume(market);

    return res.json({
      success: true,
      data: {
        ...volumeData,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error(`Error fetching volume for ${req.params.market}:`, error);
    res.status(500).json({
      success: false,
      error: { message: `Failed to fetch volume for ${req.params.market}` }
    });
  }
});

// 실시간 데이터 구독 URL 생성
router.post('/websocket-url', apiRateLimiterMiddleware, async (req: Request, res: Response) => {
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

// 마켓 정보 요약
router.get('/summary', apiRateLimiterMiddleware, async (_req: Request, res: Response) => {
  try {
    const markets = upbitService.getSupportedMarkets();
    const tickers = await upbitService.getTickers(markets);

    const summary = tickers.map(ticker => ({
      market: ticker['market'],
      price: ticker.trade_price,
      change_24h: ticker.signed_change_rate,
      volume_24h: ticker.acc_trade_volume_24h,
      high_24h: ticker.high_price,
      low_24h: ticker.low_price,
      timestamp: ticker.trade_timestamp
    }));

    return res.json({
      success: true,
      data: {
        summary,
        count: summary.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error fetching market summary:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch market summary' }
    });
  }
});

export default router;
