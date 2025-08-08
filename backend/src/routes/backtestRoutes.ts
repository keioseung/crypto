import { Router, Request, Response } from 'express';
import { apiRateLimiterMiddleware } from '../middleware/rateLimiter';
import { logger } from '../utils/logger';

const router = Router();

// 백테스팅 실행
router.post('/run', apiRateLimiterMiddleware, async (req: Request, res: Response) => {
  try {
    const { 
      market, 
      strategy, 
      initialCapital = 10000, 
      startDate, 
      endDate,
      tradingFee = 0.001 
    } = req.body;

    if (!market || !strategy) {
      return res.status(400).json({
        success: false,
        error: { message: 'Market and strategy parameters are required' }
      });
    }

    // 백테스팅 시뮬레이션
    const results = await simulateBacktest({
      market,
      strategy,
      initialCapital,
      startDate,
      endDate,
      tradingFee
    });

    res.json({
      success: true,
      data: {
        results,
        market,
        strategy,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error running backtest:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to run backtest' }
    });
  }
});

// 전략 비교
router.post('/compare', apiRateLimiterMiddleware, async (req: Request, res: Response) => {
  try {
    const { 
      market, 
      strategies = ['buy_hold', 'moving_average', 'rsi', 'macd'], 
      initialCapital = 10000,
      startDate,
      endDate 
    } = req.body;

    if (!market) {
      return res.status(400).json({
        success: false,
        error: { message: 'Market parameter is required' }
      });
    }

    const comparison = [];

    for (const strategy of strategies) {
      try {
        const result = await simulateBacktest({
          market,
          strategy,
          initialCapital,
          startDate,
          endDate
        });
        comparison.push({ strategy, ...result });
      } catch (error) {
        logger.error(`Error in strategy ${strategy}:`, error);
        comparison.push({ strategy, error: 'Failed to run strategy' });
      }
    }

    res.json({
      success: true,
      data: {
        comparison,
        market,
        strategies,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error comparing strategies:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to compare strategies' }
    });
  }
});

// 포트폴리오 백테스팅
router.post('/portfolio', apiRateLimiterMiddleware, async (req: Request, res: Response) => {
  try {
    const { 
      markets, 
      weights, 
      initialCapital = 10000,
      startDate,
      endDate,
      rebalancePeriod = 7 
    } = req.body;

    if (!markets || !weights || markets.length !== weights.length) {
      return res.status(400).json({
        success: false,
        error: { message: 'Markets and weights arrays must be provided and have the same length' }
      });
    }

    // 포트폴리오 백테스팅 시뮬레이션
    const portfolioResult = await simulatePortfolioBacktest({
      markets,
      weights,
      initialCapital,
      startDate,
      endDate,
      rebalancePeriod
    });

    res.json({
      success: true,
      data: {
        portfolioResult,
        markets,
        weights,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error running portfolio backtest:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to run portfolio backtest' }
    });
  }
});

// 백테스팅 시뮬레이션 함수
async function simulateBacktest(params: any) {
  const { market, strategy, initialCapital, startDate, endDate, tradingFee = 0.001 } = params;

  // 시뮬레이션 데이터 생성
  const days = 365; // 1년
  const dailyReturns = Array.from({ length: days }, () => (Math.random() - 0.5) * 0.1);
  
  let capital = initialCapital;
  let shares = 0;
  const trades = [];
  const equity = [initialCapital];

  for (let i = 0; i < days; i++) {
    const dailyReturn = dailyReturns[i];
    const currentPrice = 100 * Math.pow(1 + dailyReturn, i); // 시작가 100

    // 전략별 매매 신호
    let signal = 'hold';
    switch (strategy) {
      case 'buy_hold':
        if (i === 0) signal = 'buy';
        break;
      case 'moving_average':
        if (i > 20) {
          const sma20 = equity.slice(-20).reduce((sum, val) => sum + val, 0) / 20;
          signal = currentPrice > sma20 ? 'buy' : 'sell';
        }
        break;
      case 'rsi':
        if (i > 14) {
          const rsi = calculateRSI(dailyReturns.slice(-14));
          signal = rsi < 30 ? 'buy' : rsi > 70 ? 'sell' : 'hold';
        }
        break;
      case 'macd':
        if (i > 26) {
          const macd = calculateMACD(dailyReturns.slice(-26));
          signal = macd > 0 ? 'buy' : 'sell';
        }
        break;
    }

    // 거래 실행
    if (signal === 'buy' && capital > 0) {
      const buyAmount = capital * 0.1; // 10%씩 매수
      const buyShares = (buyAmount * (1 - tradingFee)) / currentPrice;
      shares += buyShares;
      capital -= buyAmount;
      trades.push({ day: i, action: 'buy', price: currentPrice, shares: buyShares });
    } else if (signal === 'sell' && shares > 0) {
      const sellShares = shares * 0.1; // 10%씩 매도
      const sellAmount = sellShares * currentPrice * (1 - tradingFee);
      shares -= sellShares;
      capital += sellAmount;
      trades.push({ day: i, action: 'sell', price: currentPrice, shares: sellShares });
    }

    // 현재 자산 가치
    const currentEquity = capital + (shares * currentPrice);
    equity.push(currentEquity);
  }

  // 성과 지표 계산
  const finalEquity = equity[equity.length - 1];
  const totalReturn = (finalEquity - initialCapital) / initialCapital;
  const annualizedReturn = Math.pow(1 + totalReturn, 365 / days) - 1;
  
  const returns = equity.slice(1).map((val, i) => (val - equity[i]) / equity[i]);
  const volatility = Math.sqrt(returns.reduce((sum, ret) => sum + Math.pow(ret, 2), 0) / returns.length);
  const sharpeRatio = annualizedReturn / volatility;

  const maxDrawdown = calculateMaxDrawdown(equity);

  return {
    initialCapital,
    finalEquity,
    totalReturn: totalReturn * 100,
    annualizedReturn: annualizedReturn * 100,
    volatility: volatility * 100,
    sharpeRatio,
    maxDrawdown: maxDrawdown * 100,
    totalTrades: trades.length,
    winRate: calculateWinRate(trades),
    equity: equity.slice(-100), // 최근 100일만 반환
    trades: trades.slice(-20) // 최근 20거래만 반환
  };
}

// 포트폴리오 백테스팅 시뮬레이션
async function simulatePortfolioBacktest(params: any) {
  const { markets, weights, initialCapital, startDate, endDate, rebalancePeriod } = params;

  // 각 자산별 백테스팅
  const assetResults = [];
  for (let i = 0; i < markets.length; i++) {
    const result = await simulateBacktest({
      market: markets[i],
      strategy: 'buy_hold',
      initialCapital: initialCapital * weights[i],
      startDate,
      endDate
    });
    assetResults.push(result);
  }

  // 포트폴리오 성과 계산
  const portfolioReturn = assetResults.reduce((sum, result, i) => 
    sum + (result.totalReturn * weights[i]), 0
  );

  const portfolioVolatility = Math.sqrt(
    assetResults.reduce((sum, result, i) => 
      sum + Math.pow(result.volatility * weights[i], 2), 0
    )
  );

  return {
    portfolioReturn,
    portfolioVolatility,
    sharpeRatio: portfolioReturn / portfolioVolatility,
    assetResults,
    weights
  };
}

// 유틸리티 함수들
function calculateRSI(returns: number[]): number {
  const gains = returns.map(r => r > 0 ? r : 0);
  const losses = returns.map(r => r < 0 ? Math.abs(r) : 0);
  
  const avgGain = gains.reduce((sum, g) => sum + g, 0) / gains.length;
  const avgLoss = losses.reduce((sum, l) => sum + l, 0) / losses.length;
  
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

function calculateMACD(returns: number[]): number {
  if (returns.length < 26) return 0;
  
  const ema12 = calculateEMA(returns, 12);
  const ema26 = calculateEMA(returns, 26);
  return ema12 - ema26;
}

function calculateEMA(data: number[], period: number): number {
  const multiplier = 2 / (period + 1);
  let ema = data[0];
  
  for (let i = 1; i < data.length; i++) {
    ema = (data[i] * multiplier) + (ema * (1 - multiplier));
  }
  
  return ema;
}

function calculateMaxDrawdown(equity: number[]): number {
  let maxDrawdown = 0;
  let peak = equity[0];
  
  for (let i = 1; i < equity.length; i++) {
    if (equity[i] > peak) {
      peak = equity[i];
    } else {
      const drawdown = (peak - equity[i]) / peak;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    }
  }
  
  return maxDrawdown;
}

function calculateWinRate(trades: any[]): number {
  if (trades.length === 0) return 0;
  
  const profitableTrades = trades.filter(trade => {
    // 간단한 수익성 판단 (실제로는 더 복잡한 로직 필요)
    return trade.action === 'sell' && trade.price > 100; // 임시 기준
  }).length;
  
  return (profitableTrades / trades.length) * 100;
}

export default router;
