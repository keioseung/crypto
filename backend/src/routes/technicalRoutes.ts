import { Router, Request, Response } from 'express';
import { upbitService } from '../services/upbitService';
import { aiService } from '../services/aiService';
import { apiRateLimiterMiddleware } from '../middleware/rateLimiter';
import { logger } from '../utils/logger';

const router = Router();

// 기술적 지표 계산
router.post('/indicators', apiRateLimiterMiddleware, async (req: Request, res: Response) => {
  try {
    const { market, period = '200' } = req.body;

    if (!market) {
      return res.status(400).json({
        success: false,
        error: { message: 'Market parameter is required' }
      });
    }

    const candles = await upbitService.getCandles(market, 'minutes', parseInt(period));
    const normalizedData = upbitService.normalizeCandleData(candles);
    const indicators = aiService.calculateTechnicalIndicators(normalizedData);

    return res.json({
      success: true,
      data: {
        indicators,
        market,
        period: parseInt(period),
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

// 패턴 분석
router.post('/patterns', apiRateLimiterMiddleware, async (req: Request, res: Response) => {
  try {
    const { market } = req.body;

    if (!market) {
      return res.status(400).json({
        success: false,
        error: { message: 'Market parameter is required' }
      });
    }

    const candles = await upbitService.getCandles(market, 'minutes', 200);
    const normalizedData = upbitService.normalizeCandleData(candles);

    // 패턴 분석 시뮬레이션
    const patterns = {
      doubleTop: Math.random() > 0.7,
      doubleBottom: Math.random() > 0.7,
      headAndShoulders: Math.random() > 0.8,
      inverseHeadAndShoulders: Math.random() > 0.8,
      triangle: Math.random() > 0.6,
      flag: Math.random() > 0.5,
      pennant: Math.random() > 0.5,
      wedge: Math.random() > 0.6,
      cupAndHandle: Math.random() > 0.7,
      roundingBottom: Math.random() > 0.6
    };

    const detectedPatterns = Object.entries(patterns)
      .filter(([_, detected]) => detected)
      .map(([pattern, _]) => pattern);

    return res.json({
      success: true,
      data: {
        patterns: detectedPatterns,
        allPatterns: patterns,
        market,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error analyzing patterns:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to analyze patterns' }
    });
  }
});

// 지지/저항선 분석
router.post('/support-resistance', apiRateLimiterMiddleware, async (req: Request, res: Response) => {
  try {
    const { market } = req.body;

    if (!market) {
      return res.status(400).json({
        success: false,
        error: { message: 'Market parameter is required' }
      });
    }

    const candles = await upbitService.getCandles(market, 'minutes', 200);
    const normalizedData = upbitService.normalizeCandleData(candles);

    const highs = normalizedData.map(d => d.high);
    const lows = normalizedData.map(d => d.low);
    const closes = normalizedData.map(d => d.close);

    // 피벗 포인트 계산
    const currentHigh = Math.max(...highs.slice(-20));
    const currentLow = Math.min(...lows.slice(-20));
    const currentClose = closes[closes.length - 1];

    const pivotPoint = (currentHigh + currentLow + currentClose) / 3;
    const r1 = 2 * pivotPoint - currentLow;
    const s1 = 2 * pivotPoint - currentHigh;
    const r2 = pivotPoint + (currentHigh - currentLow);
    const s2 = pivotPoint - (currentHigh - currentLow);

    // 주요 지지/저항선
    const supportLevels = [s2, s1, currentLow].filter(level => level > 0);
    const resistanceLevels = [currentHigh, r1, r2];

    return res.json({
      success: true,
      data: {
        pivotPoint,
        supportLevels,
        resistanceLevels,
        currentPrice: currentClose,
        market,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error calculating support/resistance:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to calculate support/resistance levels' }
    });
  }
});

// 변동성 분석
router.post('/volatility', apiRateLimiterMiddleware, async (req: Request, res: Response) => {
  try {
    const { market, period = '20' } = req.body;

    if (!market) {
      return res.status(400).json({
        success: false,
        error: { message: 'Market parameter is required' }
      });
    }

    const candles = await upbitService.getCandles(market, 'minutes', parseInt(period) + 50);
    const normalizedData = upbitService.normalizeCandleData(candles);

    // 변동성 계산
    const returns = normalizedData.slice(1).map((point, i) => 
      (point.close - normalizedData[i].close) / normalizedData[i].close
    );

    const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
    const volatility = Math.sqrt(variance) * 100;

    // ATR (Average True Range) 계산
    const trueRanges = normalizedData.slice(1).map((point, i) => {
      const high = point.high;
      const low = point.low;
      const prevClose = normalizedData[i].close;
      
      return Math.max(
        high - low,
        Math.abs(high - prevClose),
        Math.abs(low - prevClose)
      );
    });

    const atr = trueRanges.reduce((sum, tr) => sum + tr, 0) / trueRanges.length;

    return res.json({
      success: true,
      data: {
        volatility: volatility.toFixed(2),
        atr: atr.toFixed(2),
        period: parseInt(period),
        market,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error calculating volatility:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to calculate volatility' }
    });
  }
});

// 모멘텀 분석
router.post('/momentum', apiRateLimiterMiddleware, async (req: Request, res: Response) => {
  try {
    const { market } = req.body;

    if (!market) {
      return res.status(400).json({
        success: false,
        error: { message: 'Market parameter is required' }
      });
    }

    const candles = await upbitService.getCandles(market, 'minutes', 200);
    const normalizedData = upbitService.normalizeCandleData(candles);

    const indicators = aiService.calculateTechnicalIndicators(normalizedData);

    // 모멘텀 지표들
    const momentum = {
      rsi: indicators.rsi,
      macd: indicators.macd,
      priceMomentum: (normalizedData[normalizedData.length - 1].close - normalizedData[normalizedData.length - 10].close) / normalizedData[normalizedData.length - 10].close * 100,
      volumeMomentum: (normalizedData[normalizedData.length - 1].volume - indicators.volume_sma) / indicators.volume_sma * 100,
      smaMomentum: (indicators.sma20 - indicators.sma50) / indicators.sma50 * 100
    };

    // 모멘텀 신호
    const signals = {
      rsiSignal: indicators.rsi > 70 ? 'overbought' : indicators.rsi < 30 ? 'oversold' : 'neutral',
      macdSignal: indicators.macd.histogram > 0 ? 'bullish' : 'bearish',
      priceSignal: momentum.priceMomentum > 5 ? 'strong_bullish' : momentum.priceMomentum < -5 ? 'strong_bearish' : 'neutral',
      volumeSignal: momentum.volumeMomentum > 20 ? 'high_volume' : momentum.volumeMomentum < -20 ? 'low_volume' : 'normal'
    };

    return res.json({
      success: true,
      data: {
        momentum,
        signals,
        market,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error calculating momentum:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to calculate momentum indicators' }
    });
  }
});

// 거래량 분석
router.post('/volume-analysis', apiRateLimiterMiddleware, async (req: Request, res: Response) => {
  try {
    const { market } = req.body;

    if (!market) {
      return res.status(400).json({
        success: false,
        error: { message: 'Market parameter is required' }
      });
    }

    const candles = await upbitService.getCandles(market, 'minutes', 200);
    const normalizedData = upbitService.normalizeCandleData(candles);

    const volumes = normalizedData.map(d => d.volume);
    const prices = normalizedData.map(d => d.close);

    // 거래량 분석
    const avgVolume = volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length;
    const currentVolume = volumes[volumes.length - 1];
    const volumeRatio = currentVolume / avgVolume;

    // 거래량 가중 평균 가격 (VWAP)
    const vwap = normalizedData.reduce((sum, point) => sum + (point.close * point.volume), 0) / 
                 normalizedData.reduce((sum, point) => sum + point.volume, 0);

    // 거래량 프로파일
    const volumeProfile = {
      highVolume: volumes.filter(v => v > avgVolume * 1.5).length,
      normalVolume: volumes.filter(v => v >= avgVolume * 0.5 && v <= avgVolume * 1.5).length,
      lowVolume: volumes.filter(v => v < avgVolume * 0.5).length
    };

    return res.json({
      success: true,
      data: {
        currentVolume,
        averageVolume: avgVolume,
        volumeRatio: volumeRatio.toFixed(2),
        vwap: vwap.toFixed(2),
        volumeProfile,
        market,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error analyzing volume:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to analyze volume' }
    });
  }
});

export default router;
