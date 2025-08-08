// API Configuration
export const API_CONFIG = {
  // Backend API URL
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:2000',
  
  // WebSocket URL
  WS_URL: import.meta.env.VITE_WS_URL || 'ws://localhost:2000',
  
  // API Endpoints
  ENDPOINTS: {
    HEALTH: '/health',
    MARKETS: '/api/v1/markets',
    PREDICTIONS: '/api/v1/predictions',
    TECHNICAL: '/api/v1/technical',
    WEBSOCKET: '/api/v1/websocket'
  }
};

// API Client Configuration
export const API_CLIENT_CONFIG = {
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
};
