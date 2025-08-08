import React, { useMemo, useState } from 'react';
import Card from '@/components/ui/Card';
import LineChart, { SeriesPoint } from '@/components/ui/LineChart';
import MarketPicker from '@/components/controls/MarketPicker';
import { useCandles } from '@/hooks/useCandles';
import axios from 'axios';
import { getApiUrl } from '@/config/api';

const models = [
  { key: 'sma', label: 'SMA (window=10)', color: '#10b981' },
  { key: 'ema', label: 'EMA (window=12)', color: '#f59e0b' },
  { key: 'ensemble', label: 'Ensemble', color: '#e879f9' },
];

const Predictions: React.FC = () => {
  const [market, setMarket] = useState('KRW-BTC');
  const [minutes, setMinutes] = useState(60);
  const [steps, setSteps] = useState(24);
  const [selected, setSelected] = useState<string[]>(['ensemble']);
  const { data: candles = [] } = useCandles(market, minutes, 240);

  const base: SeriesPoint[] = useMemo(() => candles.map(c => ({ x: c.timestamp, y: c.close })), [candles]);
  const [preds, setPreds] = useState<Record<string, SeriesPoint[]>>({});

  async function runPredict() {
    const series = candles.map(c => c.close);
    const results = await Promise.all(selected.map(m => axios.post(getApiUrl('/api/v1/predictions'), { series, model: m, steps })));
    const next: Record<string, SeriesPoint[]> = {};
    selected.forEach((m, i) => {
      next[m] = results[i].data.points.map((p: any) => ({ x: p.timestamp, y: p.value }));
    });
    setPreds(next);
  }

  const lines = [
    { label: 'Close', data: base, color: '#60a5fa' },
    ...selected.map((m) => ({ label: models.find(x=>x.key===m)!.label, data: preds[m] || [], color: models.find(x=>x.key===m)!.color, dashed: true }))
  ];

  return (
    <div className="space-y-6">
      <Card title="Prediction Controls" actions={
        <div className="flex flex-wrap gap-2">
          <MarketPicker market={market} onMarket={setMarket} minutes={minutes} onMinutes={setMinutes} />
          <select className="input w-44" multiple value={selected} onChange={(e)=> setSelected(Array.from(e.target.selectedOptions).map(o=>o.value))}>
            {models.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
          </select>
          <input type="number" min={6} max={72} step={6} className="input w-28" value={steps} onChange={e=>setSteps(Number(e.target.value))} />
          <button className="btn-primary" onClick={runPredict}>Run</button>
        </div>
      }>
        <LineChart series={lines as any} height={360} />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Signals (mock)">
          <ul className="text-sm text-white/80 space-y-2">
            <li>Golden Cross detected on 1h</li>
            <li>Bollinger squeeze forming</li>
            <li>Momentum increasing</li>
          </ul>
        </Card>
        <Card title="Risk/Reward (mock)">
          <div className="text-sm text-dark-300">Projected Risk: 2.1%, Reward: 5.8%</div>
          <div className="mt-2 h-3 bg-dark-800 rounded">
            <div className="h-3 bg-emerald-500 rounded" style={{ width: '74%' }} />
          </div>
        </Card>
        <Card title="Strategy (mock)">
          <div className="text-sm text-white/80">Buy zone: 44.8M - 45.2M KRW, Stop: 44.0M, TP: 46.5M</div>
        </Card>
      </div>
    </div>
  );
};

export default Predictions;
