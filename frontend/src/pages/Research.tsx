import React, { useEffect, useMemo, useState } from 'react';
import Card from '@/components/ui/Card';
import LineChart, { SeriesPoint } from '@/components/ui/LineChart';
import axios from 'axios';
import { getApiUrl } from '@/config/api';
import InfoBanner from '@/components/ui/InfoBanner';

function useResearchCandles(market: string, minutes: number, days: number) {
  const [data, setData] = useState<{ timestamp: number; open: number; high: number; low: number; close: number; volume: number }[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => { (async()=>{ setLoading(true); try { const { data } = await axios.get(getApiUrl('/api/v1/research/candles'), { params: { market, minutes, days }}); setData(data); } finally { setLoading(false); } })(); }, [market, minutes, days]);
  return { data, loading };
}

const Research: React.FC = () => {
  const [market, setMarket] = useState('KRW-BTC');
  const [minutes, setMinutes] = useState(60);
  const [days, setDays] = useState(30);
  const [holding, setHolding] = useState(3);
  const { data: candles } = useResearchCandles(market, minutes, days);

  const closeSeries: SeriesPoint[] = useMemo(()=>candles.map(c=>({ x: c.timestamp, y: c.close })), [candles]);

  const [fixed, setFixed] = useState<any[]>([]);
  async function runFixed() {
    const { data } = await axios.post(getApiUrl('/api/v1/research/fixed-period'), { market, minutes, days, holdingMinutes: holding });
    setFixed(data.slice(0, 200));
  }

  const [pack, setPack] = useState<any | null>(null);
  async function runAllIndicators() {
    const { data } = await axios.post(getApiUrl('/api/v1/research/indicators/all'), { market, minutes, days });
    setPack(data);
  }

  useEffect(() => { runAllIndicators(); }, [market, minutes, days]);

  const toSeries = (arr:number[]|undefined)=> (arr||[]).map((v,i)=> ({ x: candles[i]?.timestamp ?? (Date.now()+i), y: v }));

  return (
    <div className="space-y-6">
      <InfoBanner message="This page is for research purposes only. The data and strategies presented here are not financial advice and should not be used for actual trading. Always do your own research and consult with a financial advisor." />
      <Card title="Research Controls" actions={
        <div className="flex flex-wrap gap-2">
          <select className="input w-36" value={market} onChange={e=>setMarket(e.target.value)}>
            {['KRW-BTC','KRW-ETH','KRW-SOL','KRW-XRP'].map(m=>(<option key={m} value={m}>{m}</option>))}
          </select>
          <select className="input w-28" value={minutes} onChange={e=>setMinutes(Number(e.target.value))}>
            {[1,5,15,60,240].map(m=>(<option key={m} value={m}>{m}m</option>))}
          </select>
          <input className="input w-28" type="number" min={1} max={365} value={days} onChange={e=>setDays(Number(e.target.value))} />
          <input className="input w-28" type="number" min={1} max={240} value={holding} onChange={e=>setHolding(Number(e.target.value))} />
          <button className="btn-primary" onClick={runFixed}>Analyze Fixed Period</button>
        </div>
      }>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Close Price"><LineChart series={[{ label: 'Close', data: closeSeries, color: '#60a5fa' }]} height={240} /></Card>
          <Card title="RSI"><LineChart series={[{ label: 'RSI', data: toSeries(pack?.rsi), color: '#f59e0b' }]} height={240} /></Card>
          <Card title="MACD"><LineChart series={[{ label: 'MACD', data: toSeries(pack?.macd?.line), color: '#34d399' }, { label: 'Signal', data: toSeries(pack?.macd?.signal), color: '#ef4444' }]} height={240} /></Card>
          <Card title="ATR"><LineChart series={[{ label: 'ATR', data: toSeries(pack?.atr), color: '#a78bfa' }]} height={240} /></Card>
          <Card title="ADX & DI"><LineChart series={[{ label: 'ADX', data: toSeries(pack?.adxdi?.adx), color: '#22c55e' }, { label: '+DI', data: toSeries(pack?.adxdi?.plusDI), color: '#60a5fa' }, { label: '-DI', data: toSeries(pack?.adxdi?.minusDI), color: '#ef4444' }]} height={240} /></Card>
          <Card title="Stochastic K/D"><LineChart series={[{ label: 'K', data: toSeries(pack?.stochastic?.k), color: '#f97316' }, { label: 'D', data: toSeries(pack?.stochastic?.d), color: '#38bdf8' }]} height={240} /></Card>
          <Card title="OBV"><LineChart series={[{ label: 'OBV', data: toSeries(pack?.obv), color: '#10b981' }]} height={240} /></Card>
          <Card title="Volume Oscillator"><LineChart series={[{ label: 'VO', data: toSeries(pack?.vo), color: '#a3e635' }]} height={240} /></Card>
          <Card title="A/D Line"><LineChart series={[{ label: 'AD Line', data: toSeries(pack?.adline), color: '#fde047' }]} height={240} /></Card>
          <Card title="Keltner Channel"><LineChart series={[{ label: 'KC mid', data: toSeries(pack?.keltner?.mid), color: '#38bdf8' }, { label: 'KC upper', data: toSeries(pack?.keltner?.upper), color: '#14b8a6' }, { label: 'KC lower', data: toSeries(pack?.keltner?.lower), color: '#f43f5e' }]} height={240} /></Card>
          <Card title="Parabolic SAR"><LineChart series={[{ label: 'PSAR', data: toSeries(pack?.psar), color: '#e879f9' }]} height={240} /></Card>
          <Card title="CCI"><LineChart series={[{ label: 'CCI', data: toSeries(pack?.cci), color: '#facc15' }]} height={240} /></Card>
          <Card title="Ichimoku"><LineChart series={[{ label: 'Tenkan', data: toSeries(pack?.ichimoku?.tenkan), color: '#60a5fa' }, { label: 'Kijun', data: toSeries(pack?.ichimoku?.kijun), color: '#34d399' }, { label: 'SpanA', data: toSeries(pack?.ichimoku?.spanA), color: '#f59e0b' }, { label: 'SpanB', data: toSeries(pack?.ichimoku?.spanB), color: '#ef4444' }, { label: 'Chikou', data: toSeries(pack?.ichimoku?.chikou), color: '#a78bfa' }]} height={240} /></Card>
          <Card title="Pivot Points"><LineChart series={[{ label: 'PP', data: toSeries((pack?.pivots||[]).map((p:any)=>p.PP)), color: '#06b6d4' }, { label: 'R1', data: toSeries((pack?.pivots||[]).map((p:any)=>p.R1)), color: '#10b981' }, { label: 'S1', data: toSeries((pack?.pivots||[]).map((p:any)=>p.S1)), color: '#ef4444' }, { label: 'R2', data: toSeries((pack?.pivots||[]).map((p:any)=>p.R2)), color: '#84cc16' }, { label: 'S2', data: toSeries((pack?.pivots||[]).map((p:any)=>p.S2)), color: '#f97316' }]} height={240} /></Card>
        </div>
      </Card>

      <Card title="Top Fixed-Period Strategies (by WinRate)">
        <div className="max-h-80 overflow-auto text-sm">
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-dark-300">
                <th className="py-1 pr-2">Buy</th>
                <th className="py-1 pr-2">Sell</th>
                <th className="py-1 pr-2">Avg %</th>
                <th className="py-1 pr-2">Win %</th>
                <th className="py-1 pr-2">Samples</th>
              </tr>
            </thead>
            <tbody>
              {fixed.map((r,i)=> (
                <tr key={i} className="border-t border-dark-800 text-white/80">
                  <td className="py-1 pr-2">{r.buyDay}-{r.buyHour}:{r.buyMinute.toString().padStart(2,'0')}</td>
                  <td className="py-1 pr-2">{r.sellDay}-{r.sellHour}:{r.sellMinute.toString().padStart(2,'0')}</td>
                  <td className="py-1 pr-2">{r.avgReturn}%</td>
                  <td className="py-1 pr-2">{r.winRate}%</td>
                  <td className="py-1 pr-2">{r.samples}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Research;
