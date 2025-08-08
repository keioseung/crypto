import { logger } from '../utils/logger';
import { upbitService } from './upbitService';

export interface PredictionResult {
  price: number;
  confidence: number;
  trend: 'bull' | 'bear' | 'neutral';
  volatility: number;
  support: number;
  resistance: number;
  timestamp: Date;
}

export interface TechnicalIndicators {
  sma20: number;
  sma50: number;
  ema12: number;
  ema26: number;
  rsi: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  bollinger: {
    upper: number;
    middle: number;
    lower: number;
  };
  volume_sma: number;
}

export interface ModelPerformance {
  modelName: string;
  accuracy: number;
  rmse: number;
  mae: number;
  lastUpdated: Date;
}

class AIService {
  private models: Map<string, any> = new Map();
  private performanceMetrics: Map<string, ModelPerformance> = new Map();

  constructor() {
    logger.info('AIService initialized');
    this.initializeModels();
  }

  private initializeModels() {
    // LSTM 모델 시뮬레이션
    this.models.set('lstm', {
      name: 'LSTM',
      type: 'regression',
      predict: this.lstmPrediction.bind(this),
      accuracy: 0.85
    });

    // GRU 모델 시뮬레이션
    this.models.set('gru', {
      name: 'GRU',
      type: 'regression',
      predict: this.gruPrediction.bind(this),
      accuracy: 0.83
    });

    // Random Forest 모델 시뮬레이션
    this.models.set('randomForest', {
      name: 'Random Forest',
      type: 'classification',
      predict: this.randomForestPrediction.bind(this),
      accuracy: 0.78
    });

    // SVM 모델 시뮬레이션
    this.models.set('svm', {
      name: 'SVM',
      type: 'classification',
      predict: this.svmPrediction.bind(this),
      accuracy: 0.76
    });

    // Transformer 모델 시뮬레이션
    this.models.set('transformer', {
      name: 'Transformer',
      type: 'regression',
      predict: this.transformerPrediction.bind(this),
      accuracy: 0.87
    });

    // CNN-LSTM 하이브리드 모델 시뮬레이션
    this.models.set('cnnLstm', {
      name: 'CNN-LSTM',
      type: 'regression',
      predict: this.cnnLstmPrediction.bind(this),
      accuracy: 0.84
    });

    logger.info(`Initialized ${this.models.size} AI models`);
  }

  // 기술적 지표 계산
  calculateTechnicalIndicators(data: any[]): TechnicalIndicators {
    if (data.length < 50) {
      throw new Error('Insufficient data for technical analysis');
    }

    const prices = data.map(d => d.close);
    const volumes = data.map(d => d.volume);

    return {
      sma20: this.calculateSMA(prices, 20),
      sma50: this.calculateSMA(prices, 50),
      ema12: this.calculateEMA(prices, 12),
      ema26: this.calculateEMA(prices, 26),
      rsi: this.calculateRSI(prices, 14),
      macd: this.calculateMACD(prices),
      bollinger: this.calculateBollingerBands(prices, 20),
      volume_sma: this.calculateSMA(volumes, 20)
    };
  }

  // 단순 이동평균
  private calculateSMA(data: number[], period: number): number {
    if (data.length < period) return 0;
    const sum = data.slice(-period).reduce((a, b) => a + b, 0);
    return sum / period;
  }

  // 지수 이동평균
  private calculateEMA(data: number[], period: number): number {
    if (data.length < period) return 0;
    
    const multiplier = 2 / (period + 1);
    let ema = data[0];
    
    for (let i = 1; i < data.length; i++) {
      ema = (data[i] * multiplier) + (ema * (1 - multiplier));
    }
    
    return ema;
  }

  // RSI 계산
  private calculateRSI(data: number[], period: number): number {
    if (data.length < period + 1) return 50;

    const gains: number[] = [];
    const losses: number[] = [];

    for (let i = 1; i < data.length; i++) {
      const change = data[i] - data[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }

    const avgGain = this.calculateSMA(gains, period);
    const avgLoss = this.calculateSMA(losses, period);

    if (avgLoss === 0) return 100;
    
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  // MACD 계산
  private calculateMACD(data: number[]): { macd: number; signal: number; histogram: number } {
    const ema12 = this.calculateEMA(data, 12);
    const ema26 = this.calculateEMA(data, 26);
    const macd = ema12 - ema26;
    const signal = this.calculateEMA([macd], 9); // 실제로는 MACD 라인을 계산해야 함
    const histogram = macd - signal;

    return { macd, signal, histogram };
  }

  // 볼린저 밴드 계산
  private calculateBollingerBands(data: number[], period: number): { upper: number; middle: number; lower: number } {
    if (data.length < period) {
      return { upper: 0, middle: 0, lower: 0 };
    }

    const sma = this.calculateSMA(data, period);
    const slice = data.slice(-period);
    const variance = slice.reduce((sum, val) => sum + Math.pow(val - sma, 2), 0) / period;
    const stdDev = Math.sqrt(variance);

    return {
      upper: sma + (stdDev * 2),
      middle: sma,
      lower: sma - (stdDev * 2)
    };
  }

  // LSTM 예측 시뮬레이션
  private lstmPrediction(data: any[], indicators: TechnicalIndicators): number {
    const lastPrice = data[data.length - 1].close;
    const trend = indicators.sma20 > indicators.sma50 ? 1 : -1;
    const _volatility = Math.abs(indicators.rsi - 50) / 50;
    
    // LSTM 특성을 반영한 예측
    const momentum = (lastPrice - data[Math.max(0, data.length - 10)].close) / lastPrice;
    const prediction = lastPrice * (1 + (trend * 0.02 + momentum * 0.5 + (Math.random() - 0.5) * 0.01));
    
    return Math.max(prediction, lastPrice * 0.5); // 최소 50% 하락 방지
  }

  // GRU 예측 시뮬레이션
  private gruPrediction(data: any[], indicators: TechnicalIndicators): number {
    const lastPrice = data[data.length - 1].close;
    const rsiSignal = indicators.rsi > 70 ? -0.01 : indicators.rsi < 30 ? 0.01 : 0;
    const macdSignal = indicators.macd.histogram > 0 ? 0.005 : -0.005;
    
    const prediction = lastPrice * (1 + rsiSignal + macdSignal + (Math.random() - 0.5) * 0.008);
    return Math.max(prediction, lastPrice * 0.5);
  }

  // Random Forest 분류 시뮬레이션
  private randomForestPrediction(data: any[], indicators: TechnicalIndicators): 'bull' | 'bear' | 'neutral' {
    const features = [
      indicators.rsi,
      indicators.macd.histogram,
      indicators.sma20 / indicators.sma50,
      indicators.bollinger.upper / indicators.bollinger.lower
    ];

    const score = features.reduce((sum, feature) => sum + feature, 0) / features.length;
    
    if (score > 1.1) return 'bull';
    if (score < 0.9) return 'bear';
    return 'neutral';
  }

  // SVM 분류 시뮬레이션
  private svmPrediction(data: any[], indicators: TechnicalIndicators): 'bull' | 'bear' | 'neutral' {
    const rsiWeight = 0.4;
    const macdWeight = 0.3;
    const volumeWeight = 0.3;

    const rsiScore = indicators.rsi > 50 ? 1 : -1;
    const macdScore = indicators.macd.histogram > 0 ? 1 : -1;
    const volumeScore = data[data.length - 1].volume > indicators.volume_sma ? 1 : -1;

    const weightedScore = rsiScore * rsiWeight + macdScore * macdWeight + volumeScore * volumeWeight;

    if (weightedScore > 0.3) return 'bull';
    if (weightedScore < -0.3) return 'bear';
    return 'neutral';
  }

  // Transformer 예측 시뮬레이션
  private transformerPrediction(data: any[], _indicators: TechnicalIndicators): number {
    const lastPrice = data[data.length - 1].close;
    
    // Transformer의 attention 메커니즘을 시뮬레이션
    const attentionWeights = data.slice(-20).map((_, i) => Math.exp(-i * 0.1));
    const weightedSum = data.slice(-20).reduce((sum, point, i) => 
      sum + point.close * attentionWeights[i], 0
    ) / attentionWeights.reduce((a, b) => a + b, 0);

    const trend = weightedSum > lastPrice ? 1 : -1;
    const prediction = lastPrice * (1 + trend * 0.015 + (Math.random() - 0.5) * 0.005);
    
    return Math.max(prediction, lastPrice * 0.5);
  }

  // CNN-LSTM 하이브리드 예측 시뮬레이션
  private cnnLstmPrediction(data: any[], _indicators: TechnicalIndicators): number {
    const lastPrice = data[data.length - 1].close;
    
    // CNN 패턴 인식 시뮬레이션
    const patternScore = this.detectPricePattern(data.slice(-10));
    
    // LSTM 시퀀스 학습 시뮬레이션
    const sequenceScore = this.analyzePriceSequence(data.slice(-20));
    
    const combinedScore = (patternScore + sequenceScore) / 2;
    const prediction = lastPrice * (1 + combinedScore * 0.02 + (Math.random() - 0.5) * 0.01);
    
    return Math.max(prediction, lastPrice * 0.5);
  }

  // 가격 패턴 감지
  private detectPricePattern(data: any[]): number {
    if (data.length < 5) return 0;
    
    const prices = data.map(d => d.close);
    const changes = prices.slice(1).map((price, i) => price - prices[i]);
    
    // 상승/하락 패턴 분석
    const upCount = changes.filter(change => change > 0).length;
    const downCount = changes.filter(change => change < 0).length;
    
    return (upCount - downCount) / changes.length;
  }

  // 가격 시퀀스 분석
  private analyzePriceSequence(_data: any[]): number {
    if (_data.length < 10) return 0;
    
    const prices = _data.map(d => d.close);
    const returns = prices.slice(1).map((price, i) => (price - prices[i]) / prices[i]);
    
    // 모멘텀과 평균 회귀 분석
    const momentum = returns.slice(-5).reduce((sum, ret) => sum + ret, 0);
    const meanReversion = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    
    return (momentum + meanReversion) / 2;
  }

  // 앙상블 예측
  async ensemblePrediction(market: string, _hours: number = 24): Promise<PredictionResult> {
    try {
      // 데이터 가져오기
      const candles = await upbitService.getCandles(market, 'minutes', 200);
      const normalizedData = upbitService.normalizeCandleData(candles);
      const indicators = this.calculateTechnicalIndicators(normalizedData);

      // 각 모델의 예측 수집
      const predictions: number[] = [];
      const classifications: ('bull' | 'bear' | 'neutral')[] = [];

      for (const [modelName, model] of this.models) {
        if (model.type === 'regression') {
          const prediction = model.predict(normalizedData, indicators);
          predictions.push(prediction);
        } else {
          const classification = model.predict(normalizedData, indicators);
          classifications.push(classification);
        }
      }

      // 앙상블 결과 계산
      const avgPrediction = predictions.reduce((sum, pred) => sum + pred, 0) / predictions.length;
      const confidence = this.calculateConfidence(predictions, classifications);
      const trend = this.determineTrend(classifications, indicators);
      const volatility = this.calculateVolatility(normalizedData);
      const { support, resistance } = this.calculateSupportResistance(normalizedData, indicators);

      const result: PredictionResult = {
        price: avgPrediction,
        confidence,
        trend,
        volatility,
        support,
        resistance,
        timestamp: new Date()
      };

      // 성능 메트릭 업데이트
      this.updatePerformanceMetrics(result, normalizedData);

      return result;
    } catch (error) {
      logger.error(`Error in ensemble prediction for ${market}:`, error);
      throw new Error(`Failed to generate ensemble prediction for ${market}`);
    }
  }

  // 신뢰도 계산
  private calculateConfidence(predictions: number[], classifications: ('bull' | 'bear' | 'neutral')[]): number {
    // 예측값의 표준편차를 기반으로 신뢰도 계산
    const mean = predictions.reduce((sum, pred) => sum + pred, 0) / predictions.length;
    const variance = predictions.reduce((sum, pred) => sum + Math.pow(pred - mean, 2), 0) / predictions.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = stdDev / mean;

    // 분류 모델의 일관성
    const bullCount = classifications.filter(c => c === 'bull').length;
    const bearCount = classifications.filter(c => c === 'bear').length;
    const _neutralCount = classifications.filter(c => c === 'neutral').length;
    const maxCount = Math.max(bullCount, bearCount, _neutralCount);
    const classificationConsistency = maxCount / classifications.length;

    // 최종 신뢰도 (0-1)
    const predictionConfidence = Math.max(0, 1 - coefficientOfVariation);
    return (predictionConfidence * 0.7 + classificationConsistency * 0.3) * 100;
  }

  // 트렌드 결정
  private determineTrend(classifications: ('bull' | 'bear' | 'neutral')[], indicators: TechnicalIndicators): 'bull' | 'bear' | 'neutral' {
    const bullCount = classifications.filter(c => c === 'bull').length;
    const bearCount = classifications.filter(c => c === 'bear').length;
    const neutralCount = classifications.filter(c => c === 'neutral').length;

    // 기술적 지표 보정
    const rsiBias = indicators.rsi > 70 ? -1 : indicators.rsi < 30 ? 1 : 0;
    const macdBias = indicators.macd.histogram > 0 ? 1 : -1;

    const totalBias = rsiBias + macdBias;
    const classificationScore = bullCount - bearCount;

    const finalScore = classificationScore + totalBias;

    if (finalScore > 1) return 'bull';
    if (finalScore < -1) return 'bear';
    return 'neutral';
  }

  // 변동성 계산
  private calculateVolatility(data: any[]): number {
    if (data.length < 20) return 0;

    const returns = data.slice(-20).map((point, i) => {
      if (i === 0) return 0;
      return (point.close - data[data.length - 21 + i - 1].close) / data[data.length - 21 + i - 1].close;
    });

    const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
    
    return Math.sqrt(variance) * 100; // 백분율로 반환
  }

  // 지지/저항선 계산
  private calculateSupportResistance(data: any[], indicators: TechnicalIndicators): { support: number; resistance: number } {
    const recentData = data.slice(-20);
    const highs = recentData.map(d => d.high);
    const lows = recentData.map(d => d.low);

    const resistance = Math.max(...highs);
    const support = Math.min(...lows);

    // 볼린저 밴드 보정
    const adjustedResistance = Math.min(resistance, indicators.bollinger.upper);
    const adjustedSupport = Math.max(support, indicators.bollinger.lower);

    return {
      support: adjustedSupport,
      resistance: adjustedResistance
    };
  }

  // 성능 메트릭 업데이트
  private updatePerformanceMetrics(_prediction: PredictionResult, _actualData: any[]) {
    // 실제 구현에서는 예측값과 실제값을 비교하여 성능을 업데이트
    this.models.forEach((model, modelName) => {
      this.performanceMetrics.set(modelName, {
        modelName,
        accuracy: model.accuracy,
        rmse: Math.random() * 100 + 50,
        mae: Math.random() * 50 + 25,
        lastUpdated: new Date()
      });
    });
  }

  // 모델 성능 조회
  getModelPerformance(): ModelPerformance[] {
    return Array.from(this.performanceMetrics.values());
  }

  // 특정 모델 예측
  async singleModelPrediction(market: string, _modelName: string): Promise<PredictionResult> {
    if (!this.models.has(_modelName)) {
      throw new Error(`Model ${_modelName} not found`);
    }

    const candles = await upbitService.getCandles(market, 'minutes', 200);
    const normalizedData = upbitService.normalizeCandleData(candles);
    const indicators = this.calculateTechnicalIndicators(normalizedData);

    const model = this.models.get(_modelName);
    const prediction = model.predict(normalizedData, indicators);

    return {
      price: prediction,
      confidence: model.accuracy * 100,
      trend: 'neutral', // 단일 모델은 기본적으로 neutral
      volatility: this.calculateVolatility(normalizedData),
      support: Math.min(...normalizedData.slice(-20).map(d => d.low)),
      resistance: Math.max(...normalizedData.slice(-20).map(d => d.high)),
      timestamp: new Date()
    };
  }
}

// 싱글톤 인스턴스 생성
export const aiService = new AIService();

// 초기화 함수
export const initializeAIService = async (): Promise<void> => {
  try {
    logger.info('✅ AIService initialized successfully');
  } catch (error) {
    logger.error('❌ Failed to initialize AIService:', error);
    throw error;
  }
};
