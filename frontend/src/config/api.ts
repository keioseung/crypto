// API Configuration
export const API_CONFIG = {
  // Backend API URL
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || 'https://crypto-production-0730.up.railway.app',
  
  // WebSocket URL
  WS_URL: import.meta.env.VITE_WS_URL || 'wss://crypto-production-0730.up.railway.app',
  
  // API Endpoints
  ENDPOINTS: {
    // Market Data
    MARKETS: '/api/v1/markets',
    TICKERS: '/api/v1/tickers',
    CANDLES: '/api/v1/candles',
    ORDERBOOK: '/api/v1/orderbook',
    
    // AI Predictions
    PREDICTIONS: '/api/v1/predictions',
    MODELS: '/api/v1/models',
    TRAIN: '/api/v1/train',
    
    // Technical Analysis
    TECHNICAL: '/api/v1/technical',
    INDICATORS: '/api/v1/indicators',
    PATTERNS: '/api/v1/patterns',
    
    // WebSocket
    WEBSOCKET: '/api/v1/websocket',
    
    // Health Check
    HEALTH: '/health'
  }
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BACKEND_URL}${endpoint}`;
};

// Helper function to get WebSocket URL
export const getWsUrl = (): string => {
  return API_CONFIG.WS_URL;
};

// API Client Configuration
export const API_CLIENT_CONFIG = {
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
};
