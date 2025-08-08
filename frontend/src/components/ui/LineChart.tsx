import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  TimeScale,
  ChartData
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend, TimeScale);

export type SeriesPoint = { x: number | string | Date; y: number };

type LineChartProps = {
  height?: number;
  series: { label: string; data: SeriesPoint[]; color: string; dashed?: boolean; fill?: boolean }[];
};

const LineChart: React.FC<LineChartProps> = ({ series, height = 280 }) => {
  const data: ChartData<'line', SeriesPoint[], unknown> = {
    datasets: series.map(s => ({
      label: s.label,
      data: s.data,
      parsing: false as const,
      borderColor: s.color,
      backgroundColor: s.fill ? `${s.color}33` : s.color,
      borderWidth: 2,
      tension: 0.25,
      pointRadius: 0,
      fill: !!s.fill,
      borderDash: s.dashed ? [6, 6] : undefined,
    }))
  };
  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    scales: {
      x: { type: 'time', time: { unit: 'minute' }, grid: { color: '#1f2937' }, ticks: { color: '#9ca3af' } },
      y: { grid: { color: '#1f2937' }, ticks: { color: '#9ca3af' } },
    },
    plugins: {
      legend: { labels: { color: '#cbd5e1' } },
      tooltip: { enabled: true }
    }
  };
  return (
    <div style={{ height }}>
      <Line data={data} options={options} />
    </div>
  );
};

export default LineChart;
