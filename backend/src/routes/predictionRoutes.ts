import { Router, Request, Response } from 'express';
import { aiService } from '../services/aiService';
import { apiRateLimiterMiddleware } from '../middleware/rateLimiter';
import { logger } from '../utils/logger';

const router = Router();

// 앙상블 예측
router.post('/ensemble', apiRateLimiterMiddleware, async (req: Request, res: Response) => {
  try {
    const { market, hours = 24 } = req.body;

    if (!market) {
      return res.status(400).json({
        success: false,
        error: { message: 'Market parameter is required' }
      });
    }

    const prediction = await aiService.ensemblePrediction(market, hours);

    res.json({
      success: true,
      data: {
        prediction,
        market,
        hours,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error in ensemble prediction:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to generate ensemble prediction' }
    });
  }
});

// 단일 모델 예측
router.post('/single-model', apiRateLimiterMiddleware, async (req: Request, res: Response) => {
  try {
    const { market, modelName } = req.body;

    if (!market || !modelName) {
      return res.status(400).json({
        success: false,
        error: { message: 'Market and modelName parameters are required' }
      });
    }

    const prediction = await aiService.singleModelPrediction(market, modelName);

    res.json({
      success: true,
      data: {
        prediction,
        market,
        modelName,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error in single model prediction:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to generate single model prediction' }
    });
  }
});

// 모델 성능 조회
router.get('/performance', apiRateLimiterMiddleware, async (req: Request, res: Response) => {
  try {
    const performance = aiService.getModelPerformance();

    res.json({
      success: true,
      data: {
        performance,
        count: performance.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error fetching model performance:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch model performance' }
    });
  }
});

// 기술적 지표 계산
router.post('/technical-indicators', apiRateLimiterMiddleware, async (req: Request, res: Response) => {
  try {
    const { market } = req.body;

    if (!market) {
      return res.status(400).json({
        success: false,
        error: { message: 'Market parameter is required' }
      });
    }

    // 캔들 데이터 가져오기
    const { upbitService } = await import('../services/upbitService');
    const candles = await upbitService.getCandles(market, 'minutes', 200);
    const normalizedData = upbitService.normalizeCandleData(candles);

    const indicators = aiService.calculateTechnicalIndicators(normalizedData);

    res.json({
      success: true,
      data: {
        indicators,
        market,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error calculating technical indicators:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to calculate technical indicators' }
    });
  }
});

// 다중 마켓 예측
router.post('/multi-market', apiRateLimiterMiddleware, async (req: Request, res: Response) => {
  try {
    const { markets, hours = 24 } = req.body;

    if (!markets || !Array.isArray(markets)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Markets array is required' }
      });
    }

    const predictions = [];

    for (const market of markets) {
      try {
        const prediction = await aiService.ensemblePrediction(market, hours);
        predictions.push({ market, prediction });
      } catch (error) {
        logger.error(`Error predicting for ${market}:`, error);
        predictions.push({ market, error: 'Failed to predict' });
      }
    }

    res.json({
      success: true,
      data: {
        predictions,
        count: predictions.length,
        hours,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error in multi-market prediction:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to generate multi-market predictions' }
    });
  }
});

// 예측 히스토리 (시뮬레이션)
router.get('/history/:market', apiRateLimiterMiddleware, async (req: Request, res: Response) => {
  try {
    const { market } = req.params;
    const { limit = '10' } = req.query;

    // 실제 구현에서는 DB에서 히스토리를 가져옴
    const history = Array.from({ length: parseInt(limit as string) }, (_, i) => ({
      id: `pred_${Date.now()}_${i}`,
      market: market as string,
      predictedPrice: Math.random() * 100000 + 10000,
      actualPrice: Math.random() * 100000 + 10000,
      confidence: Math.random() * 30 + 70,
      trend: ['bull', 'bear', 'neutral'][Math.floor(Math.random() * 3)],
      timestamp: new Date(Date.now() - i * 3600000).toISOString()
    }));

    res.json({
      success: true,
      data: {
        history,
        market,
        count: history.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error(`Error fetching prediction history for ${req.params.market}:`, error);
    res.status(500).json({
      success: false,
      error: { message: `Failed to fetch prediction history for ${req.params.market}` }
    });
  }
});

export default router;
