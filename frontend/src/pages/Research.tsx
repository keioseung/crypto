import React, { useEffect, useMemo, useState } from 'react';
import Card from '@/components/ui/Card';
import LineChart, { SeriesPoint } from '@/components/ui/LineChart';
import axios from 'axios';
import { getApiUrl } from '@/config/api';

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

  const [ind, setInd] = useState<any | null>(null);
  async function runInd() {
    const { data } = await axios.post(getApiUrl('/api/v1/research/indicators'), { market, minutes, days });
    setInd(data);
  }

  useEffect(() => { runInd(); }, [market, minutes, days]);

  const rsiSeries: SeriesPoint[] = useMemo(()=> (ind?.rsi ?? []).map((v:number, i:number)=> ({ x: candles[i]?.timestamp ?? (Date.now()+i), y: v })), [ind, candles]);
  const macdSeries: SeriesPoint[] = useMemo(()=> (ind?.macd?.line ?? []).map((v:number, i:number)=> ({ x: candles[i]?.timestamp ?? (Date.now()+i), y: v })), [ind, candles]);
  const macdSignal: SeriesPoint[] = useMemo(()=> (ind?.macd?.signal ?? []).map((v:number, i:number)=> ({ x: candles[i]?.timestamp ?? (Date.now()+i), y: v })), [ind, candles]);
  const atrSeries: SeriesPoint[] = useMemo(()=> (ind?.atr ?? []).map((v:number, i:number)=> ({ x: candles[i]?.timestamp ?? (Date.now()+i), y: v })), [ind, candles]);

  return (
    <div className="space-y-6">
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
          <Card title="RSI"><LineChart series={[{ label: 'RSI', data: rsiSeries, color: '#f59e0b' }]} height={240} /></Card>
          <Card title="MACD"><LineChart series={[{ label: 'MACD', data: macdSeries, color: '#34d399' }, { label: 'Signal', data: macdSignal, color: '#ef4444' }]} height={240} /></Card>
          <Card title="ATR"><LineChart series={[{ label: 'ATR', data: atrSeries, color: '#a78bfa' }]} height={240} /></Card>
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
