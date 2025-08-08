import React, { useEffect, useMemo, useState } from 'react';
import Card from '@/components/ui/Card';
import LineChart, { SeriesPoint } from '@/components/ui/LineChart';
import MarketPicker from '@/components/controls/MarketPicker';
import ModelHelp from '@/components/controls/ModelHelp';
import ModelCatalog from '@/components/ai/ModelCatalog';
import { useCandles } from '@/hooks/useCandles';
import axios from 'axios';
import { getApiUrl } from '@/config/api';

const baseModels = [
  { key: 'sma', label: 'SMA', color: '#10b981' },
  { key: 'ema', label: 'EMA', color: '#f59e0b' },
  { key: 'lr', label: 'LR', color: '#e879f9' },
  { key: 'momentum', label: 'Momentum', color: '#22c55e' },
  { key: 'meanrev', label: 'MeanRev', color: '#60a5fa' },
  { key: 'ensemble', label: 'Ensemble', color: '#a78bfa' },
];

const Predictions: React.FC = () => {
  const [market, setMarket] = useState('KRW-BTC');
  const [minutes, setMinutes] = useState(60);
  const [steps, setSteps] = useState(24);
  const [selected, setSelected] = useState<string[]>(['ensemble']);
  const { data: candles = [] } = useCandles(market, minutes, 240);

  const base: SeriesPoint[] = useMemo(() => candles.map(c => ({ x: c.timestamp, y: c.close })), [candles]);
  const [preds, setPreds] = useState<Record<string, SeriesPoint[]>>({});
  const [stackWeights, setStackWeights] = useState<Record<string, number>>({ sma: 1, ema: 1, lr: 1 });
  const [multiCls, setMultiCls] = useState<any | null>(null);

  async function runPredict() {
    if (candles.length < 10) return;
    const series = candles.map(c => c.close);
    const results = await Promise.all(selected.map(m => axios.post(getApiUrl('/api/v1/predictions'), { series, model: m, steps })));
    const next: Record<string, SeriesPoint[]> = {};
    selected.forEach((m, i) => {
      next[m] = results[i].data.points.map((p: any) => ({ x: p.timestamp, y: p.value }));
    });
    setPreds(next);
  }

  async function runStack() {
    if (candles.length < 10) return;
    const series = candles.map(c => c.close);
    const models = Object.keys(stackWeights);
    const weights = models.map(k => stackWeights[k]);
    const { data } = await axios.post(getApiUrl('/api/v1/predictions/stack'), { series, models, weights, steps });
    setPreds(prev => ({ ...prev, stack: data.points.map((p: any)=>({ x: p.timestamp, y: p.value })) }));
  }

  async function runMultiCls() {
    if (candles.length < 10) return;
    const series = candles.map(c => c.close);
    const { data } = await axios.post(getApiUrl('/api/v1/classify/multi'), { series });
    setMultiCls(data);
  }

  useEffect(() => { runPredict(); runMultiCls(); }, [candles, selected, steps]);

  const lines = [
    { label: 'Close', data: base, color: '#60a5fa' },
    ...selected.map((m) => ({ label: baseModels.find(x=>x.key===m)!.label, data: preds[m] || [], color: baseModels.find(x=>x.key===m)!.color, dashed: true })),
    ...(preds.stack ? [{ label: 'Stack', data: preds.stack, color: '#f472b6' }] : [])
  ];

  return (
    <div className="space-y-6">
      <Card title="Prediction Controls" actions={
        <div className="flex flex-wrap gap-2">
          <MarketPicker market={market} onMarket={setMarket} minutes={minutes} onMinutes={setMinutes} />
          <select className="input w-44" multiple value={selected} onChange={(e)=> setSelected(Array.from(e.target.selectedOptions).map(o=>o.value))}>
            {baseModels.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
          </select>
          <input type="number" min={6} max={72} step={6} className="input w-28" value={steps} onChange={e=>setSteps(Number(e.target.value))} />
        </div>
      }>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <LineChart series={lines as any} height={360} />
            <Card title="Stacking (weights)">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                {Object.keys(stackWeights).map((k) => (
                  <div key={k} className="space-y-1">
                    <div className="text-white/80">{k.toUpperCase()}</div>
                    <input type="range" min={0} max={3} step={0.1} value={stackWeights[k]} onChange={(e)=>setStackWeights(s=>({...s, [k]: Number(e.target.value)}))} />
                    <div className="text-dark-300">{stackWeights[k].toFixed(1)}</div>
                  </div>
                ))}
              </div>
              <div className="mt-2">
                <button className="btn-primary" onClick={runStack}>Run Stack</button>
              </div>
            </Card>
          </div>
          <div className="space-y-4">
            <ModelHelp />
            <Card title="Model Catalog"><ModelCatalog /></Card>
            <Card title="Multi Classification">
              <div className="text-sm text-white/80">
                {multiCls ? (
                  <ul className="space-y-1">
                    <li>Trend: <span className="text-emerald-400">{multiCls.trend.label}</span> ({(multiCls.trend.confidence*100).toFixed(1)}%)</li>
                    <li>RSI: <span className="text-sky-400">{multiCls.rsi.label}</span> ({(multiCls.rsi.confidence*100).toFixed(1)}%)</li>
                    <li>Vol: <span className="text-amber-400">{multiCls.vol.label}</span> ({(multiCls.vol.confidence*100).toFixed(1)}%)</li>
                  </ul>
                ) : 'Loading...'}
              </div>
            </Card>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Predictions;
