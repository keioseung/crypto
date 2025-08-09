import React, { useEffect, useMemo, useState } from 'react';
import Card from '@/components/ui/Card';
import LineChart, { SeriesPoint } from '@/components/ui/LineChart';
import MarketPicker from '@/components/controls/MarketPicker';
import ModelHelp from '@/components/controls/ModelHelp';
import ModelCatalog from '@/components/ai/ModelCatalog';
import { useCandles } from '@/hooks/useCandles';
import axios from 'axios';
import { getApiUrl } from '@/config/api';
import InfoBanner from '@/components/ui/InfoBanner';
import Chip from '@/components/ui/Chip';

const baseModels = [
  { key: 'sma', label: 'SMA', color: '#10b981' },
  { key: 'ema', label: 'EMA', color: '#f59e0b' },
  { key: 'lr', label: 'LR', color: '#e879f9' },
  { key: 'momentum', label: 'Momentum', color: '#22c55e' },
  { key: 'meanrev', label: 'MeanRev', color: '#60a5fa' },
  { key: 'ensemble', label: 'Ensemble', color: '#a78bfa' },
];

const presetSets: { name: string; models: string[] }[] = [
  { name: 'Default', models: ['ensemble'] },
  { name: 'Trend', models: ['ema','momentum'] },
  { name: 'Range', models: ['sma','meanrev'] },
  { name: 'All', models: ['sma','ema','lr','momentum','meanrev'] },
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

  const toggleModel = (key: string) => {
    setSelected(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const lines = [
    { label: 'Close', data: base, color: '#60a5fa' },
    ...selected.map((m) => ({ label: baseModels.find(x=>x.key===m)!.label, data: preds[m] || [], color: baseModels.find(x=>x.key===m)!.color, dashed: true })),
    ...(preds.stack ? [{ label: 'Stack', data: preds.stack, color: '#f472b6' }] : [])
  ];

  return (
    <div className="space-y-6">
      <InfoBanner
        title="AI Predictions 사용 방법"
        steps={[
          '1) 상단에서 마켓/주기를 선택하면 최근 데이터가 로드됩니다.',
          '2) 예측할 모델을 하나 이상 선택하면 그래프에 자동으로 오버레이됩니다.',
          '3) Stack 섹션에서 가중치 슬라이더를 조절하고 Run Stack을 눌러 혼합 예측을 보세요.',
          '4) 오른쪽 패널의 Multi Classification으로 현재 상태(추세/RSI/변동성)를 확인하세요.'
        ]}
        tips={[
          '모델 선택은 다중 선택 가능합니다. (Ctrl/⌘ 클릭)',
          'Ensemble은 전반적으로 안정적인 기본 선택입니다.',
          '변동성이 큰 구간은 EMA/Momentum, 횡보는 SMA/MeanRev가 유리합니다.'
        ]}
      />

      <Card title="Prediction Controls" actions={
        <div className="flex flex-wrap gap-2">
          <MarketPicker market={market} onMarket={setMarket} minutes={minutes} onMinutes={setMinutes} />
          <div className="flex flex-wrap gap-2">
            {presetSets.map(preset => (
              <Chip
                key={preset.name}
                label={preset.name}
                onClick={() => setSelected(preset.models)}
                variant={selected.length === preset.models.length && selected.every(s => preset.models.includes(s)) ? 'primary' : 'outline'}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {baseModels.map(m => (
              <Chip key={m.key} label={m.label} onClick={() => toggleModel(m.key)} variant={selected.includes(m.key)?'primary':'outline'} />
            ))}
          </div>
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
