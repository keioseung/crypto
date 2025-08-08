export function sma(values: number[], period: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - period + 1);
    const window = values.slice(start, i + 1);
    out.push(window.reduce((a,b)=>a+b,0) / window.length);
  }
  return out;
}

export function ema(values: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const out: number[] = [];
  values.forEach((v, i) => {
    if (i === 0) out.push(v);
    else out.push(v * k + out[i-1] * (1 - k));
  });
  return out;
}

export function rsi(values: number[], period: number = 14): number[] {
  const gains: number[] = [0];
  const losses: number[] = [0];
  for (let i = 1; i < values.length; i++) {
    const diff = values[i] - values[i-1];
    gains[i] = Math.max(0, diff);
    losses[i] = Math.max(0, -diff);
  }
  const avgGain = ema(gains, period);
  const avgLoss = ema(losses, period);
  return avgGain.map((g, i) => {
    const l = avgLoss[i] || 1e-9;
    const rs = g / l;
    return 100 - 100 / (1 + rs);
  });
}

export function macd(values: number[], fast: number = 12, slow: number = 26, signal: number = 9) {
  const emaFast = ema(values, fast);
  const emaSlow = ema(values, slow);
  const line = emaFast.map((v, i) => v - (emaSlow[i] ?? v));
  const signalLine = ema(line, signal);
  const hist = line.map((v, i) => v - (signalLine[i] ?? v));
  return { line, signal: signalLine, hist };
}

export function bollinger(values: number[], period: number = 20, mult: number = 2) {
  const mids = sma(values, period);
  const out = values.map((_, i) => {
    const start = Math.max(0, i - period + 1);
    const window = values.slice(start, i + 1);
    const mean = mids[i];
    const variance = window.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / window.length;
    const sd = Math.sqrt(variance);
    return {
      mid: mean,
      upper: mean + mult * sd,
      lower: mean - mult * sd,
    };
  });
  return out;
}
