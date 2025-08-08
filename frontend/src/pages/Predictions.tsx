import React, { useMemo, useState } from 'react';
import Card from '@/components/ui/Card';
import LineChart, { SeriesPoint } from '@/components/ui/LineChart';
import MarketPicker from '@/components/controls/MarketPicker';
import { useCandles } from '@/hooks/useCandles';
import axios from 'axios';
import { getApiUrl } from '@/config/api';
import { Tab } from '@headlessui/react'

// New model definitions
const regressionModels = [
  { key: 'sma', label: 'SMA (Simple Moving Average)', color: '#10b981' },
  { key: 'ema', label: 'EMA (Exponential Moving Average)', color: '#f59e0b' },
  { key: 'ensemble', label: 'Ensemble (SMA + EMA)', color: '#e879f9' },
  { key: 'lstm', label: 'LSTM (Coming Soon)', color: '#3b82f6', disabled: true },
  { key: 'gru', label: 'GRU (Coming Soon)', color: '#ef4444', disabled: true },
];

const classificationModels = [
    { key: 'trend', label: 'Simple Trend Classifier' },
    { key: 'rsi_threshold', label: 'RSI-based (Coming Soon)', disabled: true },
    { key: 'random_forest', label: 'Random Forest (Coming Soon)', disabled: true },
]

// A simple helper for class names
function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}

const Predictions: React.FC = () => {
  const [market, setMarket] = useState('KRW-BTC');
  const [minutes, setMinutes] = useState(60);
  const [steps, setSteps] = useState(24);
  const [selectedRegression, setSelectedRegression] = useState<string[]>(['ensemble']);
  const { data: candles = [] } = useCandles(market, minutes, 240);

  const [trendResult, setTrendResult] = useState({ label: 'N/A', confidence: 0 });

  const base: SeriesPoint[] = useMemo(() => candles.map(c => ({ x: c.timestamp, y: c.close })), [candles]);
  const [preds, setPreds] = useState<Record<string, SeriesPoint[]>>({});

  async function runRegression() {
    const series = candles.map(c => c.close);
    const modelsToRun = selectedRegression.filter(m => !regressionModels.find(rm => rm.key === m)?.disabled);
    const results = await Promise.all(modelsToRun.map(m => axios.post(getApiUrl('/api/v1/predictions'), { series, model: m, steps })));
    const next: Record<string, SeriesPoint[]> = {};
    modelsToRun.forEach((m, i) => {
      next[m] = results[i].data.points.map((p: any) => ({ x: p.timestamp, y: p.value }));
    });
    setPreds(next);
  }

  async function runClassification() {
      const series = candles.map(c => c.close).slice(-20); // Use last 20 points
      const result = await axios.post(getApiUrl('/api/v1/predictions/classify'), { series });
      setTrendResult(result.data);
  }

  const lines = [
    { label: 'Close', data: base, color: '#60a5fa' },
    ...selectedRegression.map((m) => ({
        label: regressionModels.find(x=>x.key===m)!.label,
        data: preds[m] || [],
        color: regressionModels.find(x=>x.key===m)!.color,
        dashed: true
    }))
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Left Column: Controls */}
      <div className="lg:col-span-1 space-y-6">
        <Card title="Market & Timeframe">
            <MarketPicker market={market} onMarket={setMarket} minutes={minutes} onMinutes={setMinutes} />
        </Card>

        <Tab.Group>
            <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
                <Tab className={({ selected }) =>
                    classNames(
                    'w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700',
                    'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                    selected
                        ? 'bg-white shadow'
                        : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                    )
                }>Regression</Tab>
                <Tab className={({ selected }) =>
                    classNames(
                    'w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700',
                    'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                    selected
                        ? 'bg-white shadow'
                        : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                    )
                }>Classification</Tab>
            </Tab.List>
            <Tab.Panels className="mt-2">
                <Tab.Panel className="rounded-xl bg-gray-800 p-3 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2">
                    <div className="space-y-4">
                        <h3 className="text-white font-semibold">Price Prediction Models</h3>
                        <div className="space-y-2">
                            {regressionModels.map(m => (
                                <label key={m.key} className={`flex items-center space-x-2 ${m.disabled ? 'cursor-not-allowed text-gray-500' : 'cursor-pointer'}`}>
                                    <input
                                        type="checkbox"
                                        className="checkbox"
                                        value={m.key}
                                        checked={selectedRegression.includes(m.key)}
                                        disabled={m.disabled}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedRegression([...selectedRegression, m.key])
                                            } else {
                                                setSelectedRegression(selectedRegression.filter(k => k !== m.key))
                                            }
                                        }}
                                    />
                                    <span>{m.label}</span>
                                </label>
                            ))}
                        </div>
                        <div>
                            <label className="label">Prediction Steps</label>
                            <input type="number" min={6} max={72} step={6} className="input w-full" value={steps} onChange={e=>setSteps(Number(e.target.value))} />
                        </div>
                        <button className="btn-primary w-full" onClick={runRegression}>Run Regression</button>
                    </div>
                </Tab.Panel>
                <Tab.Panel className="rounded-xl bg-gray-800 p-3 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2">
                    <div className="space-y-4">
                        <h3 className="text-white font-semibold">Trend Prediction Models</h3>
                        <div className="space-y-2">
                            {classificationModels.map(m => (
                                <label key={m.key} className={`flex items-center space-x-2 ${m.disabled ? 'cursor-not-allowed text-gray-500' : 'cursor-pointer'}`}>
                                    <input type="radio" name="classification-model" className="radio" value={m.key} defaultChecked={m.key === 'trend'} disabled={m.disabled} />
                                    <span>{m.label}</span>
                                </label>
                            ))}
                        </div>
                        <button className="btn-primary w-full" onClick={runClassification}>Run Classification</button>

                        <div className="pt-4">
                            <h4 className="font-semibold text-white">Result</h4>
                            <div className="text-center p-4 bg-gray-900 rounded-lg mt-2">
                                <span className={`text-2xl font-bold ${
                                    trendResult.label === 'bullish' ? 'text-green-500' :
                                    trendResult.label === 'bearish' ? 'text-red-500' : 'text-gray-400'
                                }`}>{trendResult.label.toUpperCase()}</span>
                                <p className="text-sm text-gray-400">Confidence: {(trendResult.confidence * 100).toFixed(1)}%</p>
                            </div>
                        </div>
                    </div>
                </Tab.Panel>
            </Tab.Panels>
        </Tab.Group>
      </div>

      {/* Right Column: Chart and Results */}
      <div className="lg:col-span-3 space-y-6">
        <Card title="Prediction Chart">
            <LineChart series={lines as any} height={450} />
        </Card>
      </div>
    </div>
  );
};

export default Predictions;
