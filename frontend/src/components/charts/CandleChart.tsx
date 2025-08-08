import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { sma, ema, bollinger } from '@/utils/indicators';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, TimeScale);

type Candle = { timestamp: number; open: number; high: number; low: number; close: number; volume: number };

type Props = {
  candles: Candle[];
};

const CandleChart: React.FC<Props> = ({ candles }) => {
  const labels = useMemo(()=>candles.map(c=>c.timestamp), [candles]);
  const close = useMemo(()=>candles.map(c=>c.close), [candles]);
  const sma20 = useMemo(()=>sma(close, 20), [close]);
  const ema50 = useMemo(()=>ema(close, 50), [close]);
  const bb = useMemo(()=>bollinger(close, 20, 2), [close]);

  const data = {
    labels,
    datasets: [
      { label: 'Close', data: close, borderColor: '#60a5fa', backgroundColor: '#60a5fa', pointRadius: 0, tension: 0.25 },
      { label: 'SMA20', data: sma20, borderColor: '#34d399', pointRadius: 0 },
      { label: 'EMA50', data: ema50, borderColor: '#f59e0b', pointRadius: 0 },
      { label: 'BB Upper', data: bb.map(b=>b.upper), borderColor: '#94a3b8', pointRadius: 0, borderDash: [6,6] },
      { label: 'BB Lower', data: bb.map(b=>b.lower), borderColor: '#94a3b8', pointRadius: 0, borderDash: [6,6] },
    ]
  };
  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    scales: {
      x: { type: 'time', time: { unit: 'minute' }, grid: { color: '#1f2937' }, ticks: { color: '#9ca3af' } },
      y: { grid: { color: '#1f2937' }, ticks: { color: '#9ca3af' } },
    },
    plugins: { legend: { labels: { color: '#cbd5e1' } } }
  };
  return <div style={{ height: 320 }}><Line data={data} options={options} /></div>;
};

export default CandleChart;
