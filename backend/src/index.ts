import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server as IOServer } from 'socket.io';
import { fetchTickers, fetchMinuteCandles, fetchOrderbook, fetchMarkets } from './services/upbitService';
import { smaPredict, emaPredict, ensemblePredict, classifyTrend } from './services/aiService';
import { fetchUpbitMinutesByDays, analyzeFixedPeriodProfit, rsi as rsiCalc, macd as macdCalc, bollinger as bbCalc, atr as atrCalc } from './services/researchService';

const app = express();
const server = http.createServer(app);
const io = new IOServer(server, {
  cors: { origin: process.env.FRONTEND_URL || '*', credentials: true }
});
const PORT = parseInt(process.env.PORT || '6060', 10);

console.log('🚀 Starting CryptoAI Backend Server...');
console.log(`📋 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔧 Port: ${PORT}`);
console.log(`🌐 Process ID: ${process.pid}`);

// CORS 설정
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://crypto-production-0c86.up.railway.app',
  credentials: true
}));

// 기본 미들웨어
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 테스트 엔드포인트
app.get('/', (req, res) => {
  res.json({ 
    message: 'CryptoAI Backend is running!',
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV || 'production',
    pid: process.pid,
    version: '1.0.0',
    frontendUrl: process.env.FRONTEND_URL || 'https://crypto-production-0c86.up.railway.app'
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    port: PORT,
    pid: process.pid,
  });
});

// Markets
app.get('/api/v1/markets/tickers', async (req, res) => {
  try {
    const markets = (req.query.markets as string)?.split(',') || ['KRW-BTC','KRW-ETH'];
    const data = await fetchTickers(markets);
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: 'failed_to_fetch_tickers', detail: e?.message });
  }
});

app.get('/api/v1/markets/candles', async (req, res) => {
  try {
    const market = (req.query.market as string) || 'KRW-BTC';
    const minutes = parseInt((req.query.minutes as string) || '60', 10);
    const count = parseInt((req.query.count as string) || '200', 10);
    const data = await fetchMinuteCandles(market, minutes, count);
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: 'failed_to_fetch_candles', detail: e?.message });
  }
});

app.get('/api/v1/markets/orderbook', async (req, res) => {
  try {
    const market = (req.query.market as string) || 'KRW-BTC';
    const data = await fetchOrderbook(market);
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: 'failed_to_fetch_orderbook', detail: e?.message });
  }
});

app.get('/api/v1/markets/supported', async (req, res) => {
  try {
    const data = await fetchMarkets(true);
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: 'failed_to_fetch_markets', detail: e?.message });
  }
});

// Predictions
app.post('/api/v1/predictions', async (req, res) => {
  try {
    const { series, model = 'ensemble', steps = 20 } = req.body as { series: number[]; model?: string; steps?: number };
    if (!Array.isArray(series) || series.length < 10) return res.status(400).json({ error: 'invalid_series' });
    let result;
    if (model === 'sma') result = smaPredict(series, 10, steps);
    else if (model === 'ema') result = emaPredict(series, 12, steps);
    else if (model === 'lr') result = linearRegressionPredict(series, steps);
    else if (model === 'momentum') result = momentumPredict(series, 6, steps);
    else if (model === 'meanrev') result = meanReversionPredict(series, 20, steps);
    else result = ensemblePredict(series, steps);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: 'failed_to_predict', detail: e?.message });
  }
});

app.post('/api/v1/predictions/stack', async (req, res) => {
  try {
    const { series, models = ['sma','ema','lr'], weights = [], steps = 20 } = req.body as { series: number[]; models?: string[]; weights?: number[]; steps?: number };
    if (!Array.isArray(series) || series.length < 10) return res.status(400).json({ error: 'invalid_series' });
    const list = models.length ? models : ['sma','ema','lr'];
    const w = (weights && weights.length === list.length ? weights : Array.from({length:list.length},()=>1));
    const sum = w.reduce((a,b)=>a+b,0) || 1;
    const norm = w.map(x=>x/sum);
    const preds = await Promise.all(list.map((m)=>{
      if (m === 'sma') return Promise.resolve(smaPredict(series, 10, steps));
      if (m === 'ema') return Promise.resolve(emaPredict(series, 12, steps));
      if (m === 'lr') return Promise.resolve(linearRegressionPredict(series, steps));
      if (m === 'momentum') return Promise.resolve(momentumPredict(series, 6, steps));
      if (m === 'meanrev') return Promise.resolve(meanReversionPredict(series, 20, steps));
      return Promise.resolve(ensemblePredict(series, steps));
    }));
    const points = preds[0].points.map((_, i) => {
      const timestamp = preds[0].points[i].timestamp;
      const value = preds.reduce((acc, p, j) => acc + (p.points[i]?.value ?? 0) * norm[j], 0);
      return { timestamp, value };
    });
    res.json({ model: `Stack(${list.join('+')})`, weights: norm, horizon: `${steps}m`, points, components: preds.map(p=>({ model: p.model, points: p.points })) });
  } catch (e: any) {
    res.status(500).json({ error: 'failed_to_stack', detail: e?.message });
  }
});

// Classification
app.post('/api/v1/classify', async (req, res) => {
  try {
    const { series, kind = 'trend' } = req.body as { series: number[]; kind?: string };
    if (!Array.isArray(series) || series.length < 10) return res.status(400).json({ error: 'invalid_series' });
    if (kind === 'rsi') return res.json(classifyRSI(series));
    if (kind === 'vol') return res.json(classifyVolatility(series));
    return res.json(classifyTrend(series.slice(-60)));
  } catch (e: any) {
    res.status(500).json({ error: 'failed_to_classify', detail: e?.message });
  }
});

app.post('/api/v1/classify/multi', async (req, res) => {
  try {
    const { series } = req.body as { series: number[] };
    if (!Array.isArray(series) || series.length < 10) return res.status(400).json({ error: 'invalid_series' });
    const trend = classifyTrend(series.slice(-60));
    const rsi = classifyRSI(series);
    const vol = classifyVolatility(series);
    res.json({ trend, rsi, vol });
  } catch (e: any) {
    res.status(500).json({ error: 'failed_to_classify_multi', detail: e?.message });
  }
});

app.get('/api/v1/research/candles', async (req, res) => {
  try {
    const market = (req.query.market as string) || 'KRW-BTC';
    const minutes = parseInt((req.query.minutes as string) || '60', 10);
    const days = parseInt((req.query.days as string) || '30', 10);
    const data = await fetchUpbitMinutesByDays(market, minutes, days);
    res.json(data);
  } catch (e:any) { res.status(500).json({ error: 'failed_to_fetch', detail: e?.message }); }
});

app.post('/api/v1/research/fixed-period', async (req, res) => {
  try {
    const { market = 'KRW-BTC', minutes = 1, days = 30, holdingMinutes = 3 } = req.body || {};
    const data = await fetchUpbitMinutesByDays(market, minutes, days);
    const result = analyzeFixedPeriodProfit(data, holdingMinutes);
    res.json(result);
  } catch (e:any) { res.status(500).json({ error: 'failed_to_analyze', detail: e?.message }); }
});

app.post('/api/v1/research/indicators', async (req, res) => {
  try {
    const { market = 'KRW-BTC', minutes = 60, days = 30 } = req.body || {};
    const data = await fetchUpbitMinutesByDays(market, minutes, days);
    const close = data.map(c=>c.close);
    const ind = {
      rsi: rsiCalc(close, 14),
      macd: macdCalc(close, 12, 26, 9),
      bb: bbCalc(close, 20, 2),
      atr: atrCalc(data, 14)
    };
    res.json(ind);
  } catch (e:any) { res.status(500).json({ error: 'failed_to_indicators', detail: e?.message }); }
});

// Socket.IO: per-socket polling subscription
io.on('connection', (socket) => {
  let timer: NodeJS.Timeout | null = null;
  let currentMarket = 'KRW-BTC';

  const start = () => {
    if (timer) clearInterval(timer);
    timer = setInterval(async () => {
      try {
        const ob = await fetchOrderbook(currentMarket);
        socket.emit('orderbook', ob);
      } catch {}
    }, 3000);
  };

  socket.on('subscribe:orderbook', (market: string) => {
    currentMarket = market || 'KRW-BTC';
    start();
  });

  socket.on('disconnect', () => {
    if (timer) clearInterval(timer);
  });
});

// 404 핸들러
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// 서버 시작
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on 0.0.0.0:${PORT}`);
});

// 서버 에러 핸들링
server.on('error', (error) => {
  console.error('❌ Server error:', error);
  process.exit(1);
});

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});
