export type PredictionPoint = { timestamp: number; value: number };
export type PredictionResult = { model: string; horizon: string; points: PredictionPoint[] };

export function smaPredict(series: number[], window: number = 10, steps: number = 20): PredictionResult {
  const sma = (arr: number[], w: number) => arr.slice(-w).reduce((a,b)=>a+b,0) / Math.max(1, Math.min(w, arr.length));
  const points: PredictionPoint[] = [];
  let seed = [...series];
  for (let i = 0; i < steps; i++) {
    const next = sma(seed, window);
    seed.push(next);
    points.push({ timestamp: Date.now() + (i+1)*60_000, value: next });
  }
  return { model: `SMA(${window})`, horizon: `${steps}m`, points };
}

export function emaPredict(series: number[], window: number = 10, steps: number = 20): PredictionResult {
  const k = 2/(window+1);
  const emaCalc = (arr: number[]) => arr.reduce((prev, curr, i) => (i === 0 ? curr : curr*k + prev*(1-k)), 0);
  const points: PredictionPoint[] = [];
  let seed = [...series];
  for (let i = 0; i < steps; i++) {
    const next = emaCalc(seed.slice(-window));
    seed.push(next);
    points.push({ timestamp: Date.now() + (i+1)*60_000, value: next });
  }
  return { model: `EMA(${window})`, horizon: `${steps}m`, points };
}

export function linearRegressionPredict(series: number[], steps: number = 20): PredictionResult {
  const n = series.length;
  const xs = Array.from({ length: n }, (_, i) => i + 1);
  const sumX = xs.reduce((a,b)=>a+b,0);
  const sumY = series.reduce((a,b)=>a+b,0);
  const sumXY = xs.reduce((acc, x, i) => acc + x * series[i], 0);
  const sumXX = xs.reduce((acc, x) => acc + x*x, 0);
  const denom = n * sumXX - sumX * sumX || 1e-9;
  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  const points: PredictionPoint[] = [];
  for (let i = 1; i <= steps; i++) {
    const x = n + i;
    const y = slope * x + intercept;
    points.push({ timestamp: Date.now() + i*60_000, value: y });
  }
  return { model: 'LinearRegression', horizon: `${steps}m`, points };
}

export function momentumPredict(series: number[], lookback: number = 5, steps: number = 20): PredictionResult {
  const recent = series.slice(-lookback);
  const delta = recent[recent.length-1] - recent[0];
  const stepDelta = delta / Math.max(1, lookback);
  const points: PredictionPoint[] = [];
  let last = series[series.length-1];
  for (let i=1;i<=steps;i++) {
    last += stepDelta;
    points.push({ timestamp: Date.now() + i*60_000, value: last });
  }
  return { model: `Momentum(${lookback})`, horizon: `${steps}m`, points };
}

export function meanReversionPredict(series: number[], window: number = 20, steps: number = 20): PredictionResult {
  const avg = series.slice(-window).reduce((a,b)=>a+b,0)/Math.max(1, Math.min(window, series.length));
  const last = series[series.length-1];
  const step = (avg - last) / steps;
  const points: PredictionPoint[] = [];
  let cur = last;
  for (let i=1;i<=steps;i++) { cur += step; points.push({ timestamp: Date.now() + i*60_000, value: cur }); }
  return { model: `MeanReversion(${window})`, horizon: `${steps}m`, points };
}

export function ensemblePredict(series: number[], steps: number = 20) {
  const a = smaPredict(series, 8, steps);
  const b = emaPredict(series, 12, steps);
  const c = linearRegressionPredict(series, steps);
  const points = a.points.map((p, i) => ({
    timestamp: p.timestamp,
    value: (p.value + b.points[i].value + c.points[i].value) / 3,
  }));
  return { model: 'Ensemble(SMA,EMA,LR)', horizon: `${steps}m`, points };
}

export function classifyTrend(latest: number[], threshold: number = 0.002) {
  const n = latest.length;
  if (n < 2) return { label: 'neutral', confidence: 0.5 } as const;
  const change = (latest[n-1] - latest[0]) / Math.max(1e-9, latest[0]);
  if (change > threshold) return { label: 'bullish', confidence: Math.min(0.95, Math.abs(change)*50) } as const;
  if (change < -threshold) return { label: 'bearish', confidence: Math.min(0.95, Math.abs(change)*50) } as const;
  return { label: 'neutral', confidence: 0.6 } as const;
}

export function classifyRSI(series: number[], period: number = 14) {
  const gains: number[] = [0];
  const losses: number[] = [0];
  for (let i = 1; i < series.length; i++) {
    const diff = series[i] - series[i-1];
    gains[i] = Math.max(0, diff);
    losses[i] = Math.max(0, -diff);
  }
  // simple RSI
  const avgGain = gains.slice(-period).reduce((a,b)=>a+b,0)/period;
  const avgLoss = losses.slice(-period).reduce((a,b)=>a+b,0)/period || 1e-9;
  const rs = avgGain/avgLoss;
  const rsi = 100 - 100/(1+rs);
  if (rsi > 70) return { label: 'overbought', confidence: Math.min(0.95, (rsi-70)/30) } as const;
  if (rsi < 30) return { label: 'oversold', confidence: Math.min(0.95, (30-rsi)/30) } as const;
  return { label: 'neutral', confidence: 0.6 } as const;
}

export function classifyVolatility(series: number[], window: number = 20) {
  const slice = series.slice(-window);
  const mean = slice.reduce((a,b)=>a+b,0)/Math.max(1, slice.length);
  const variance = slice.reduce((acc,v)=>acc+Math.pow(v-mean,2),0)/Math.max(1, slice.length);
  const sd = Math.sqrt(variance);
  if (sd/Math.max(1e-9, mean) > 0.03) return { label: 'high-vol', confidence: 0.8 } as const;
  if (sd/Math.max(1e-9, mean) > 0.015) return { label: 'mid-vol', confidence: 0.7 } as const;
  return { label: 'low-vol', confidence: 0.7 } as const;
}
