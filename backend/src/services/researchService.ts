import axios from 'axios';

export type OHLCV = { timestamp: number; open: number; high: number; low: number; close: number; volume: number };

const UPBIT_API_URL = process.env.UPBIT_API_URL || 'https://api.upbit.com/v1';

export async function fetchUpbitMinutesByDays(market: string, minutes: number, days: number): Promise<OHLCV[]> {
  // Upbit minutes candles supports count up to 200 per call; loop by timestamp backward
  const perCall = 200;
  const total = Math.min(days * (1440 / minutes), 2000);
  let fetched: OHLCV[] = [];
  let to: string | undefined = undefined;
  while (fetched.length < total) {
    const url = `${UPBIT_API_URL}/candles/minutes/${minutes}`;
    const params: any = { market, count: Math.min(perCall, total - fetched.length) };
    if (to) params.to = to;
    const { data } = await axios.get(url, { params, headers: { Accept: 'application/json' }, timeout: 15000 });
    if (!data || data.length === 0) break;
    const chunk: OHLCV[] = data.map((d: any) => ({
      timestamp: new Date(d.candle_date_time_kst).getTime(),
      open: d.opening_price,
      high: d.high_price,
      low: d.low_price,
      close: d.trade_price,
      volume: d.candle_acc_trade_volume,
    }));
    fetched = fetched.concat(chunk);
    to = data[data.length - 1].candle_date_time_kst;
    if (data.length < perCall) break;
  }
  // Upbit minutes returns newest-first; reverse to oldest-first
  return fetched.reverse();
}

export function rsi(values: number[], period = 14): number[] {
  const out: number[] = new Array(values.length).fill(0);
  let gain = 0, loss = 0;
  for (let i = 1; i < values.length; i++) {
    const diff = values[i] - values[i-1];
    gain += Math.max(0, diff);
    loss += Math.max(0, -diff);
    if (i >= period) {
      if (i > period) {
        const prevDiff = values[i-period+1] - values[i-period];
        gain -= Math.max(0, prevDiff);
        loss -= Math.max(0, -prevDiff);
      }
      const avgGain = gain / period;
      const avgLoss = loss / period || 1e-9;
      const rs = avgGain / avgLoss;
      out[i] = 100 - 100 / (1 + rs);
    }
  }
  return out;
}

export function macd(values: number[], fast = 12, slow = 26, signal = 9) {
  const ema = (arr: number[], p: number) => {
    const k = 2 / (p + 1);
    const o: number[] = [];
    arr.forEach((v, i) => o.push(i === 0 ? v : v * k + o[i-1] * (1 - k)));
    return o;
  };
  const fastE = ema(values, fast);
  const slowE = ema(values, slow);
  const line = fastE.map((v, i) => v - (slowE[i] ?? v));
  const signalE = ema(line, signal);
  const hist = line.map((v, i) => v - (signalE[i] ?? v));
  return { line, signal: signalE, hist };
}

export function bollinger(values: number[], period = 20, mult = 2) {
  const out = values.map((_, i) => {
    const start = Math.max(0, i - period + 1);
    const win = values.slice(start, i + 1);
    const mean = win.reduce((a,b)=>a+b,0) / Math.max(1, win.length);
    const variance = win.reduce((acc,v)=>acc + Math.pow(v-mean,2), 0) / Math.max(1, win.length);
    const sd = Math.sqrt(variance);
    return { mid: mean, upper: mean + mult*sd, lower: mean - mult*sd };
  });
  return out;
}

export function atr(ohlcv: OHLCV[], period = 14) {
  const trs: number[] = ohlcv.map((c, i) => {
    if (i === 0) return c.high - c.low;
    const prevClose = ohlcv[i-1].close;
    return Math.max(
      c.high - c.low,
      Math.abs(c.high - prevClose),
      Math.abs(c.low - prevClose)
    );
  });
  const out: number[] = [];
  trs.forEach((v, i) => {
    const start = Math.max(0, i - period + 1);
    const win = trs.slice(start, i + 1);
    out.push(win.reduce((a,b)=>a+b,0) / Math.max(1, win.length));
  });
  return out;
}

export type FixedPeriodResult = {
  buyDay: number; buyHour: number; buyMinute: number;
  sellDay: number; sellHour: number; sellMinute: number;
  avgReturn: number; winRate: number; wins: number; losses: number; samples: number;
  returns: number[];
};

export function analyzeFixedPeriodProfit(ohlcv: OHLCV[], holdingMinutes: number): FixedPeriodResult[] {
  // Precompute time parts
  const stamps = ohlcv.map(c => c.timestamp);
  const close = ohlcv.map(c => c.close);
  const days = stamps.map(ts => new Date(ts));
  const weekday = days.map(d => (d.getDay()+6)%7); // convert Sun=6 to 6, Mon=0
  const hour = days.map(d => d.getHours());
  const minute = days.map(d => d.getMinutes());

  const indexByTime: Record<string, number[]> = {};
  for (let i = 0; i < stamps.length; i++) {
    const key = `${weekday[i]}-${hour[i]}-${minute[i]}`;
    (indexByTime[key] ||= []).push(i);
  }

  const results: FixedPeriodResult[] = [];
  for (let bd=0; bd<7; bd++) {
    for (let bh=0; bh<24; bh++) {
      for (let bm=0; bm<60; bm++) {
        const totalMin = bh*60 + bm + holdingMinutes;
        let sd = bd; let sh = Math.floor(totalMin/60); let sm = totalMin % 60; if (sh>=24){ sh-=24; sd=(bd+1)%7; }
        const buys = indexByTime[`${bd}-${bh}-${bm}`] || [];
        const sells = indexByTime[`${sd}-${sh}-${sm}`] || [];
        const n = Math.min(buys.length, sells.length);
        if (n === 0) continue;
        const returns: number[] = [];
        for (let k=0; k<n; k++) {
          const bIdx = buys[k]; const sIdx = sells[k]; if (sIdx <= bIdx) continue;
          const r = (close[sIdx] - close[bIdx]) / close[bIdx] * 100;
          returns.push(r - 0.1); // net fee example 0.1%
        }
        if (returns.length === 0) continue;
        const avg = returns.reduce((a,b)=>a+b,0)/returns.length;
        const wins = returns.filter(r=>r>0).length;
        const losses = returns.length - wins;
        const winRate = (wins/returns.length)*100;
        results.push({
          buyDay: bd, buyHour: bh, buyMinute: bm,
          sellDay: sd, sellHour: sh, sellMinute: sm,
          avgReturn: Number(avg.toFixed(3)), winRate: Number(winRate.toFixed(2)), wins, losses, samples: returns.length,
          returns
        });
      }
    }
  }
  results.sort((a,b)=> b.winRate - a.winRate);
  return results;
}
