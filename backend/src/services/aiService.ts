export type PredictionPoint = { timestamp: number; value: number };
export type PredictionResult = { model: string; horizon: string; points: PredictionPoint[] };

export function smaPredict(series: number[], window: number = 10, steps: number = 20): PredictionResult {
  const sma = (arr: number[], w: number) => arr.slice(-w).reduce((a,b)=>a+b,0) / w;
  const points: PredictionPoint[] = [];
  let seed = [...series];
  for (let i = 0; i < steps; i++) {
    const next = sma(seed, Math.min(window, seed.length));
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

export function ensemblePredict(series: number[], steps: number = 20) {
  const a = smaPredict(series, 8, steps);
  const b = emaPredict(series, 12, steps);
  const points = a.points.map((p, i) => ({
    timestamp: p.timestamp,
    value: (p.value + b.points[i].value) / 2,
  }));
  return { model: 'Ensemble(SMA,EMA)', horizon: `${steps}m`, points };
}

export function classifyTrend(latest: number[], threshold: number = 0.002) {
  const n = latest.length;
  if (n < 2) return { label: 'neutral', confidence: 0.5 };
  const change = (latest[n-1] - latest[0]) / latest[0];
  if (change > threshold) return { label: 'bullish', confidence: Math.min(0.9, change*50) };
  if (change < -threshold) return { label: 'bearish', confidence: Math.min(0.9, -change*50) };
  return { label: 'neutral', confidence: 0.6 };
}
