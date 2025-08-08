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
  let gainEMA = 0, lossEMA = 0;
  for (let i = 1; i < values.length; i++) {
    const diff = values[i] - values[i-1];
    const gain = Math.max(0, diff);
    const loss = Math.max(0, -diff);
    const k = 2 / (period + 1);
    if (i === 1) {
      gainEMA = gain; lossEMA = loss;
    } else {
      gainEMA = gain * k + gainEMA * (1 - k);
      lossEMA = loss * k + lossEMA * (1 - k);
    }
    if (i >= period) {
      const rs = gainEMA / (lossEMA || 1e-9);
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
  const stamps = ohlcv.map(c => c.timestamp);
  const close = ohlcv.map(c => c.close);
  const days = stamps.map(ts => new Date(ts));
  const weekday = days.map(d => (d.getDay()+6)%7);
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
          returns.push(r - 0.1);
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

// === Additional indicators ===
export function adxAndDI(ohlcv: OHLCV[], period = 14) {
  const len = ohlcv.length;
  const tr: number[] = new Array(len).fill(0);
  const plusDM: number[] = new Array(len).fill(0);
  const minusDM: number[] = new Array(len).fill(0);
  for (let i=1;i<len;i++){
    const upMove = ohlcv[i].high - ohlcv[i-1].high;
    const downMove = ohlcv[i-1].low - ohlcv[i].low;
    plusDM[i] = (upMove>downMove && upMove>0)? upMove:0;
    minusDM[i] = (downMove>upMove && downMove>0)? downMove:0;
    const highLow = ohlcv[i].high - ohlcv[i].low;
    const highClose = Math.abs(ohlcv[i].high - ohlcv[i-1].close);
    const lowClose = Math.abs(ohlcv[i].low - ohlcv[i-1].close);
    tr[i] = Math.max(highLow, highClose, lowClose);
  }
  const smooth = (arr:number[])=>{
    const out:number[]=[]; let sum=0;
    for(let i=0;i<arr.length;i++){
      sum += arr[i]; if(i>=period){ sum -= arr[i-period]; }
      out[i] = i>=period-1 ? sum/period : 0;
    }
    return out;
  };
  const trS = smooth(tr); const plusDMS = smooth(plusDM); const minusDMS = smooth(minusDM);
  const plusDI = plusDMS.map((v,i)=> i===0?0: 100 * (v/(trS[i]||1e-9)));
  const minusDI = minusDMS.map((v,i)=> i===0?0: 100 * (v/(trS[i]||1e-9)));
  const dx = plusDI.map((p,i)=> {
    const m = minusDI[i]||0; const den = p + m || 1e-9; return i===0?0: 100 * Math.abs((p - m) / den);
  });
  const adx:number[]=[]; let sum=0; for(let i=0;i<dx.length;i++){ sum+=dx[i]; if(i>=period){ sum-=dx[i-period]; } adx[i]= i>=period-1? sum/period:0; }
  return { adx, plusDI, minusDI };
}

export function parabolicSAR(ohlcv: OHLCV[], step=0.02, maxStep=0.2){
  const len=ohlcv.length; const sar:number[]=new Array(len).fill(0); let trend=1; let ep=ohlcv[0].low; let af=step; sar[0]=ohlcv[0].low;
  for(let i=1;i<len;i++){
    const prevSAR=sar[i-1]; sar[i]=prevSAR + af*(ep - prevSAR);
    if(trend===1){
      if(ohlcv[i].low < sar[i]){ trend=-1; sar[i]=ep; ep=ohlcv[i].low; af=step; }
      else { if(ohlcv[i].high>ep){ ep=ohlcv[i].high; af=Math.min(af+step,maxStep);} if(sar[i]>ohlcv[i-1].low) sar[i]=ohlcv[i-1].low; if(sar[i]>ohlcv[i].low) sar[i]=ohlcv[i].low; }
    } else {
      if(ohlcv[i].high > sar[i]){ trend=1; sar[i]=ep; ep=ohlcv[i].high; af=step; }
      else { if(ohlcv[i].low<ep){ ep=ohlcv[i].low; af=Math.min(af+step,maxStep);} if(sar[i]<ohlcv[i-1].high) sar[i]=ohlcv[i-1].high; if(sar[i]<ohlcv[i].high) sar[i]=ohlcv[i].high; }
    }
  }
  return sar;
}

export function cci(ohlcv: OHLCV[], period=20){
  const tp = ohlcv.map(c => (c.high + c.low + c.close)/3);
  const out:number[]=[]; for(let i=0;i<tp.length;i++){ const start=Math.max(0,i-period+1); const win=tp.slice(start,i+1); const ma=win.reduce((a,b)=>a+b,0)/Math.max(1,win.length); const md=win.reduce((a,v)=>a+Math.abs(v-ma),0)/Math.max(1,win.length); out[i] = md? (tp[i]-ma)/(0.015*md):0; }
  return out;
}

export function stochastic(ohlcv: OHLCV[], kPeriod=14, dPeriod=3){
  const k:number[]=[]; for(let i=0;i<ohlcv.length;i++){ const start=Math.max(0,i-kPeriod+1); const win=ohlcv.slice(start,i+1); const hh=Math.max(...win.map(w=>w.high)); const ll=Math.min(...win.map(w=>w.low)); const denom = (hh-ll)||1e-9; k[i] = 100 * ((ohlcv[i].close - ll)/denom); }
  const d:number[]=[]; for(let i=0;i<k.length;i++){ const start=Math.max(0,i-dPeriod+1); const win=k.slice(start,i+1); d[i]= win.reduce((a,b)=>a+b,0)/win.length; }
  return { k, d };
}

export function obv(ohlcv: OHLCV[]){
  const out:number[]=[0]; for(let i=1;i<ohlcv.length;i++){ if(ohlcv[i].close>ohlcv[i-1].close) out[i]=out[i-1]+ohlcv[i].volume; else if(ohlcv[i].close<ohlcv[i-1].close) out[i]=out[i-1]-ohlcv[i].volume; else out[i]=out[i-1]; }
  return out;
}

export function volumeOscillator(ohlcv: OHLCV[], short=5, long=20){
  const vol = ohlcv.map(c=>c.volume);
  const ema=(arr:number[],p:number)=>{ const k=2/(p+1); const o:number[]=[]; arr.forEach((v,i)=> o.push(i===0?v: v*k+o[i-1]*(1-k))); return o; };
  const vs=ema(vol, short), vl=ema(vol, long);
  return vs.map((v,i)=> ((v - (vl[i]||v))/Math.max(1e-9,(vl[i]||v)))*100 );
}

export function adLine(ohlcv: OHLCV[]){
  const out:number[]=[]; let sum=0; for(let i=0;i<ohlcv.length;i++){ const c=ohlcv[i]; const denom = (c.high - c.low) || 1e-9; const mfm = ((c.close - c.low) - (c.high - c.close)) / denom; sum += mfm * c.volume; out[i]=sum; } return out;
}

export function keltnerChannel(ohlcv: OHLCV[], period=20, mult=2){
  const close = ohlcv.map(c=>c.close);
  const ema=(arr:number[],p:number)=>{ const k=2/(p+1); const o:number[]=[]; arr.forEach((v,i)=> o.push(i===0?v: v*k+o[i-1]*(1-k))); return o; };
  const mid = ema(close, period);
  const a = atr(ohlcv, period);
  const upper = mid.map((m,i)=> m + mult*(a[i]||0));
  const lower = mid.map((m,i)=> m - mult*(a[i]||0));
  return { mid, upper, lower };
}

export function ichimoku(ohlcv: OHLCV[]){
  const high = ohlcv.map(c=>c.high); const low=ohlcv.map(c=>c.low); const close=ohlcv.map(c=>c.close);
  const rollingMax=(arr:number[],p:number,i:number)=> Math.max(...arr.slice(Math.max(0,i-p+1), i+1));
  const rollingMin=(arr:number[],p:number,i:number)=> Math.min(...arr.slice(Math.max(0,i-p+1), i+1));
  const tenkan:number[]=[]; const kijun:number[]=[]; const spanA:number[]=[]; const spanB:number[]=[]; const chikou:number[]=[];
  for(let i=0;i<ohlcv.length;i++){
    const nineHigh=rollingMax(high,9,i), nineLow=rollingMin(low,9,i); tenkan[i]=(nineHigh+nineLow)/2;
    const twSixHigh=rollingMax(high,26,i), twSixLow=rollingMin(low,26,i); kijun[i]=(twSixHigh+twSixLow)/2;
    spanA[i]= (tenkan[i]+kijun[i])/2; // shift +26 on client if needed
    const fiftyTwoHigh=rollingMax(high,52,i), fiftyTwoLow=rollingMin(low,52,i); spanB[i]=(fiftyTwoHigh+fiftyTwoLow)/2; // shift +26
    chikou[i] = close[i]; // shift -26
  }
  return { tenkan, kijun, spanA, spanB, chikou };
}

export function pivotPoints(ohlcv: OHLCV[]){
  const out = ohlcv.map(c=>({ PP:(c.high+c.low+c.close)/3, R1: 0, S1:0, R2:0, S2:0 }));
  for(let i=0;i<ohlcv.length;i++){
    const c=ohlcv[i]; const PP=out[i].PP; out[i].R1 = 2*PP - c.low; out[i].S1 = 2*PP - c.high; out[i].R2 = PP + (c.high - c.low); out[i].S2 = PP - (c.high - c.low);
  }
  return out;
}
