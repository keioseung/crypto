import axios from 'axios';
import { logger } from '../utils/logger';

export interface UpbitTicker {
  market: string;
  trade_date: string;
  trade_time: string;
  trade_price: number;
  trade_volume: number;
  prev_closing_price: number;
  change: string;
  change_price: number;
  change_rate: number;
  signed_change_price: number;
  signed_change_rate: number;
  trade_timestamp: number;
  acc_trade_volume_24h: number;
  acc_trade_price_24h: number;
  acc_trade_volume: number;
  acc_trade_price: number;
  high_price: number;
  low_price: number;
  opening_price: number;
}

export interface UpbitCandle {
  market: string;
  candle_date_time_utc: string;
  candle_date_time_kst: string;
  opening_price: number;
  high_price: number;
  low_price: number;
  trade_price: number;
  timestamp: number;
  candle_acc_trade_price: number;
  candle_acc_trade_volume: number;
  unit: number;
}

export interface UpbitOrderBook {
  market: string;
  orderbook_units: Array<{
    ask_price: number;
    bid_price: number;
    ask_size: number;
    bid_size: number;
  }>;
  timestamp: number;
  total_ask_size: number;
  total_bid_size: number;
}

class UpbitService {
  private baseUrl = 'https://api.upbit.com/v1';
  private wsUrl = 'wss://api.upbit.com/websocket/v1';
  private supportedMarkets = [
    'KRW-BTC', 'KRW-ETH', 'KRW-BNB', 'KRW-ADA', 'KRW-SOL',
    'KRW-XRP', 'KRW-DOGE', 'KRW-DOT', 'KRW-MATIC', 'KRW-LINK'
  ];

  constructor() {
    logger.info('UpbitService initialized');
  }

  // 현재가 조회
  async getTickers(markets?: string[]): Promise<UpbitTicker[]> {
    try {
      const targetMarkets = markets || this.supportedMarkets;
      const response = await axios.get(`${this.baseUrl}/ticker`, {
        params: { markets: targetMarkets.join(',') },
        timeout: 10000
      });
      
      logger.debug(`Fetched ${response.data.length} tickers from Upbit`);
      return response.data;
    } catch (error) {
      logger.error('Error fetching tickers from Upbit:', error);
      throw new Error('Failed to fetch tickers from Upbit');
    }
  }

  // 캔들 데이터 조회
  async getCandles(
    market: string,
    unit: 'minutes' | 'days' | 'weeks' | 'months' = 'minutes',
    count: number = 200,
    to?: string
  ): Promise<UpbitCandle[]> {
    try {
      const params: any = { market, count };
      if (to) params.to = to;

      let endpoint = '';
      switch (unit) {
        case 'minutes':
          endpoint = '/candles/minutes/1';
          break;
        case 'days':
          endpoint = '/candles/days';
          break;
        case 'weeks':
          endpoint = '/candles/weeks';
          break;
        case 'months':
          endpoint = '/candles/months';
          break;
      }

      const response = await axios.get(`${this.baseUrl}${endpoint}`, {
        params,
        timeout: 10000
      });

      logger.debug(`Fetched ${response.data.length} candles for ${market} from Upbit`);
      return response.data;
    } catch (error) {
      logger.error(`Error fetching candles for ${market} from Upbit:`, error);
      throw new Error(`Failed to fetch candles for ${market} from Upbit`);
    }
  }

  // 호가 정보 조회
  async getOrderBook(markets: string[]): Promise<UpbitOrderBook[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/orderbook`, {
        params: { markets: markets.join(',') },
        timeout: 10000
      });

      logger.debug(`Fetched orderbook for ${markets.length} markets from Upbit`);
      return response.data;
    } catch (error) {
      logger.error('Error fetching orderbook from Upbit:', error);
      throw new Error('Failed to fetch orderbook from Upbit');
    }
  }

  // 거래소 정보 조회
  async getMarkets(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/market/all`, {
        timeout: 10000
      });

      const krwMarkets = response.data.filter((market: any) => 
        market.market.startsWith('KRW-')
      );

      logger.debug(`Fetched ${krwMarkets.length} KRW markets from Upbit`);
      return krwMarkets;
    } catch (error) {
      logger.error('Error fetching markets from Upbit:', error);
      throw new Error('Failed to fetch markets from Upbit');
    }
  }

  // 24시간 거래량 조회
  async get24HourVolume(market: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/ticker`, {
        params: { markets: market },
        timeout: 10000
      });

      if (response.data.length > 0) {
        const ticker = response.data[0];
        return {
          market: ticker.market,
          volume_24h: ticker.acc_trade_volume_24h,
          price_change_24h: ticker.signed_change_rate,
          high_24h: ticker.high_price,
          low_24h: ticker.low_price
        };
      }

      throw new Error(`No data found for market: ${market}`);
    } catch (error) {
      logger.error(`Error fetching 24h volume for ${market}:`, error);
      throw new Error(`Failed to fetch 24h volume for ${market}`);
    }
  }

  // 실시간 데이터 구독을 위한 WebSocket URL 생성
  generateWebSocketUrl(markets: string[], channels: string[] = ['ticker']): string {
    const format = 'SIMPLE';
    const ticket = Math.random().toString(36).substring(2);
    
    const params = {
      ticket,
      format,
      channels: channels.map(channel => ({
        channel,
        markets
      }))
    };

    return `${this.wsUrl}?${new URLSearchParams({ 
      ticket, 
      format,
      channels: JSON.stringify(params.channels)
    }).toString()}`;
  }

  // 데이터 정규화
  normalizeCandleData(candles: UpbitCandle[]): any[] {
    return candles.map(candle => ({
      timestamp: candle.timestamp,
      open: candle.opening_price,
      high: candle.high_price,
      low: candle.low_price,
      close: candle.trade_price,
      volume: candle.candle_acc_trade_volume,
      market: candle.market
    })).reverse(); // 시간순 정렬
  }

  // 기술적 지표 계산을 위한 데이터 준비
  prepareTechnicalData(candles: UpbitCandle[]): any[] {
    const normalized = this.normalizeCandleData(candles);
    
    return normalized.map((candle, index) => ({
      ...candle,
      index,
      returns: index > 0 ? (candle.close - normalized[index - 1].close) / normalized[index - 1].close : 0,
      volatility: this.calculateVolatility(normalized.slice(Math.max(0, index - 20), index + 1))
    }));
  }

  // 변동성 계산
  private calculateVolatility(prices: any[]): number {
    if (prices.length < 2) return 0;
    
    const returns = prices.slice(1).map((price, i) => 
      (price.close - prices[i].close) / prices[i].close
    );
    
    const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
    
    return Math.sqrt(variance);
  }

  // 지원되는 마켓 목록 반환
  getSupportedMarkets(): string[] {
    return [...this.supportedMarkets];
  }

  // 마켓 유효성 검사
  isValidMarket(market: string): boolean {
    return this.supportedMarkets.includes(market);
  }
}

// 싱글톤 인스턴스 생성
export const upbitService = new UpbitService();

// 초기화 함수
export const initializeUpbitService = async (): Promise<void> => {
  try {
    // 초기 연결 테스트
    await upbitService.getMarkets();
    logger.info('✅ UpbitService initialized successfully');
  } catch (error) {
    logger.error('❌ Failed to initialize UpbitService:', error);
    throw error;
  }
};
