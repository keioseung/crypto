import React, { useEffect, useMemo, useState } from 'react';
import Card from '@/components/ui/Card';
import LineChart, { SeriesPoint } from '@/components/ui/LineChart';
import axios from 'axios';
import { getApiUrl } from '@/config/api';

type Candle = { timestamp: number; open: number; high: number; low: number; close: number; volume: number };

type Pred = { model: string; points: { timestamp: number; value: number }[] };

type Classify = { label: 'bullish' | 'bearish' | 'neutral'; confidence: number };

const TechnicalAnalysis: React.FC = () => {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [sma, setSma] = useState<Pred | null>(null);
  const [ema, setEma] = useState<Pred | null>(null);
  const [ens, setEns] = useState<Pred | null>(null);
  const [cls, setCls] = useState<Classify | null>(null);

  useEffect(() => {
    const run = async () => {
      const c = await axios.get(getApiUrl('/api/v1/markets/candles'), { params: { market: 'KRW-BTC', minutes: 60, count: 200 }});
      setCandles(c.data);
      const series = c.data.map((x: Candle) => x.close);
      const [smaR, emaR, ensR, clsR] = await Promise.all([
        axios.post(getApiUrl('/api/v1/predictions'), { series, model: 'sma', steps: 24 }),
        axios.post(getApiUrl('/api/v1/predictions'), { series, model: 'ema', steps: 24 }),
        axios.post(getApiUrl('/api/v1/predictions'), { series, model: 'ensemble', steps: 24 }),
        axios.post(getApiUrl('/api/v1/classify'), { series }),
      ]);
      setSma(smaR.data); setEma(emaR.data); setEns(ensR.data); setCls(clsR.data);
    };
    run();
  }, []);

  const baseSeries: SeriesPoint[] = useMemo(() => candles.map(c => ({ x: c.timestamp, y: c.close })), [candles]);
  const smaSeries: SeriesPoint[] = useMemo(() => sma?.points.map(p => ({ x: p.timestamp, y: p.value })) ?? [], [sma]);
  const emaSeries: SeriesPoint[] = useMemo(() => ema?.points.map(p => ({ x: p.timestamp, y: p.value })) ?? [], [ema]);
  const ensSeries: SeriesPoint[] = useMemo(() => ens?.points.map(p => ({ x: p.timestamp, y: p.value })) ?? [], [ens]);

  return (
    <div className="space-y-6">
      <Card title="AI Predictions (SMA / EMA / Ensemble)">
        <LineChart
          series={[
            { label: 'Close', data: baseSeries, color: '#60a5fa' },
            { label: 'SMA pred', data: smaSeries, color: '#10b981', dashed: true },
            { label: 'EMA pred', data: emaSeries, color: '#f59e0b', dashed: true },
            { label: 'Ensemble', data: ensSeries, color: '#e879f9', fill: true },
          ]}
          height={320}
        />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="AI Classification">
          <div className="text-sm">
            {cls ? (
              <>
                <div className="text-white/90">Trend: <span className={cls.label === 'bullish' ? 'text-emerald-400' : cls.label === 'bearish' ? 'text-rose-400' : 'text-yellow-400'}>{cls.label}</span></div>
                <div className="text-dark-300">Confidence: {(cls.confidence*100).toFixed(1)}%</div>
              </>
            ) : <div className="text-dark-300">Loading...</div>}
          </div>
        </Card>
        <Card title="Key Indicators (mock)">
          <div className="grid grid-cols-2 gap-3 text-sm text-white/80">
            <div className="flex justify-between"><span>RSI(14)</span><span>58.3</span></div>
            <div className="flex justify-between"><span>MACD</span><span>+0.023</span></div>
            <div className="flex justify-between"><span>BB Width</span><span>0.042</span></div>
            <div className="flex justify-between"><span>ATR</span><span>124,300</span></div>
          </div>
        </Card>
        <Card title="Risk Meter (mock)">
          <div className="text-sm text-dark-300">Low → High</div>
          <div className="h-3 bg-dark-800 rounded mt-2">
            <div className="h-3 bg-emerald-500 rounded" style={{ width: '42%' }} />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TechnicalAnalysis;
