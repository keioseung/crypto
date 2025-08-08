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
  private svmPrediction(data: any[], _indicators: TechnicalIndicators): 'bull' | 'bear' | 'neutral' {
    const lastPrice = data[data.length - 1].close;
    const avgPrice = data.slice(-20).reduce((sum, d) => sum + d.close, 0) / 20;
    
    const priceRatio = lastPrice / avgPrice;
    
    if (priceRatio > 1.05) return 'bull';
    if (priceRatio < 0.95) return 'bear';
    return 'neutral';
  }

  // Transformer 예측 시뮬레이션
  private transformerPrediction(data: any[], _indicators: TechnicalIndicators): number {
    const lastPrice = data[data.length - 1].close;
    const _data = data.slice(-50); // 최근 50개 데이터 포인트 사용
    
    // Transformer 특성을 반영한 예측 (attention mechanism 시뮬레이션)
    const attentionWeights = _data.map((_, i) => Math.exp(-i * 0.1)); // 시간에 따른 가중치 감소
    const weightedSum = _data.reduce((sum, point, i) => sum + point.close * attentionWeights[i], 0);
    const avgWeightedPrice = weightedSum / attentionWeights.reduce((sum, w) => sum + w, 0);
    
    const prediction = lastPrice * (1 + (avgWeightedPrice - lastPrice) / lastPrice * 0.3 + (Math.random() - 0.5) * 0.02);
    return Math.max(prediction, lastPrice * 0.5);
  }

  // CNN-LSTM Hybrid 예측 시뮬레이션
  private cnnLstmPrediction(data: any[], _indicators: TechnicalIndicators): number {
    const lastPrice = data[data.length - 1].close;
    
    // CNN 특성 추출 시뮬레이션 (패턴 인식)
    const priceChanges = data.slice(-20).map((d, i, arr) => i > 0 ? (d.close - arr[i-1].close) / arr[i-1].close : 0);
    const patternStrength = priceChanges.reduce((sum, change) => sum + Math.abs(change), 0) / priceChanges.length;
    
    // LSTM 시퀀스 모델링 시뮬레이션
    const trend = priceChanges.slice(-5).reduce((sum, change) => sum + change, 0);
    
    const prediction = lastPrice * (1 + trend * 0.5 + patternStrength * 0.1 + (Math.random() - 0.5) * 0.015);
    return Math.max(prediction, lastPrice * 0.5);
  }

  // 가격 패턴 감지
  private detectPricePattern(data: any[]): number {
    const prices = data.map(d => d.close);
    const lastPrice = prices[prices.length - 1];
    
    // 간단한 패턴 감지 (실제로는 더 복잡한 알고리즘 사용)
    const recentPrices = prices.slice(-10);
    const trend = recentPrices[recentPrices.length - 1] - recentPrices[0];
    
    return trend > 0 ? 1 : trend < 0 ? -1 : 0;
  }

  // 가격 시퀀스 분석
  private analyzePriceSequence(_data: any[]): number {
    // 시퀀스 분석 시뮬레이션
    return Math.random() * 2 - 1; // -1에서 1 사이의 값
  }

  // 앙상블 예측
  async ensemblePrediction(market: string, _hours: number = 24): Promise<PredictionResult> {
    try {
      const candles = await upbitService.getCandles(market, 'minutes', 200);
      const normalizedData = upbitService.normalizeCandleData(candles);
      const indicators = this.calculateTechnicalIndicators(normalizedData);

      // 각 모델의 예측 수행
      const predictions = [
        this.lstmPrediction(normalizedData, indicators),
        this.gruPrediction(normalizedData, indicators),
        this.transformerPrediction(normalizedData, indicators),
        this.cnnLstmPrediction(normalizedData, indicators)
      ];

      const classifications = [
        this.randomForestPrediction(normalizedData, indicators),
        this.svmPrediction(normalizedData, indicators)
      ];

      // 앙상블 평균 계산
      const avgPrediction = predictions.reduce((sum, pred) => sum + pred, 0) / predictions.length;
      
      // 신뢰도 계산
      const confidence = this.calculateConfidence(predictions, classifications);
      
      // 트렌드 결정
      const trend = this.determineTrend(classifications, indicators);
      
      // 변동성 계산
      const volatility = this.calculateVolatility(normalizedData);
      
      // 지지/저항선 계산
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
      throw error;
    }
  }

  // 신뢰도 계산
  private calculateConfidence(predictions: number[], classifications: ('bull' | 'bear' | 'neutral')[]): number {
    const predictionStd = Math.sqrt(predictions.reduce((sum, pred) => sum + Math.pow(pred - predictions.reduce((a, b) => a + b, 0) / predictions.length, 2), 0) / predictions.length);
    const avgPrediction = predictions.reduce((sum, pred) => sum + pred, 0) / predictions.length;
    
    // 예측값들의 표준편차가 작을수록 높은 신뢰도
    const predictionConfidence = Math.max(0, 100 - (predictionStd / avgPrediction) * 1000);
    
    // 분류 결과의 일관성
    const bullCount = classifications.filter(c => c === 'bull').length;
    const bearCount = classifications.filter(c => c === 'bear').length;
    const _neutralCount = classifications.filter(c => c === 'neutral').length;
    
    const classificationConfidence = Math.max(bullCount, bearCount) / classifications.length * 100;
    
    return Math.min(100, (predictionConfidence + classificationConfidence) / 2);
  }

  // 트렌드 결정
  private determineTrend(classifications: ('bull' | 'bear' | 'neutral')[], indicators: TechnicalIndicators): 'bull' | 'bear' | 'neutral' {
    const bullCount = classifications.filter(c => c === 'bull').length;
    const bearCount = classifications.filter(c => c === 'bear').length;
    
    // 기술적 지표와 분류 결과를 결합
    const rsiSignal = indicators.rsi > 70 ? -1 : indicators.rsi < 30 ? 1 : 0;
    const macdSignal = indicators.macd.histogram > 0 ? 1 : -1;
    
    const totalScore = (bullCount - bearCount) + rsiSignal + macdSignal;
    
    if (totalScore > 1) return 'bull';
    if (totalScore < -1) return 'bear';
    return 'neutral';
  }

  // 변동성 계산
  private calculateVolatility(data: any[]): number {
    const returns = data.slice(1).map((d, i) => (d.close - data[i].close) / data[i].close);
    const meanReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - meanReturn, 2), 0) / returns.length;
    
    return Math.sqrt(variance) * Math.sqrt(24 * 365); // 연간 변동성으로 변환
  }

  // 지지/저항선 계산
  private calculateSupportResistance(data: any[], indicators: TechnicalIndicators): { support: number; resistance: number } {
    const prices = data.map(d => d.close);
    const currentPrice = prices[prices.length - 1];
    
    // 볼린저 밴드 기반 지지/저항선
    const support = Math.min(indicators.bollinger.lower, currentPrice * 0.95);
    const resistance = Math.max(indicators.bollinger.upper, currentPrice * 1.05);
    
    return { support, resistance };
  }

  // 성능 메트릭 업데이트 (시뮬레이션)
  private updatePerformanceMetrics(_prediction: PredictionResult, _actualData: any[]) {
    // 실제 구현에서는 예측값과 실제값을 비교하여 성능 메트릭을 업데이트
    const _modelName = 'ensemble';
    // 성능 메트릭 업데이트 로직...
  }

  // 모델 성능 조회
  getModelPerformance(): ModelPerformance[] {
    return Array.from(this.performanceMetrics.values());
  }

  // 단일 모델 예측
  async singleModelPrediction(market: string, _modelName: string): Promise<PredictionResult> {
    try {
      const candles = await upbitService.getCandles(market, 'minutes', 200);
      const normalizedData = upbitService.normalizeCandleData(candles);
      const indicators = this.calculateTechnicalIndicators(normalizedData);

      // 단일 모델 예측 시뮬레이션
      const prediction = this.lstmPrediction(normalizedData, indicators);
      const volatility = this.calculateVolatility(normalizedData);
      const { support, resistance } = this.calculateSupportResistance(normalizedData, indicators);

      return {
        price: prediction,
        confidence: Math.random() * 30 + 70,
        trend: Math.random() > 0.5 ? 'bull' : 'bear',
        volatility,
        support,
        resistance,
        timestamp: new Date()
      };
    } catch (error) {
      logger.error(`Error in single model prediction for ${market}:`, error);
      throw error;
    }
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
