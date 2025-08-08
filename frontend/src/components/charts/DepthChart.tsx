import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

type Level = { price: number; cum: number };

type Props = {
  bids: Level[];
  asks: Level[];
};

const DepthChart: React.FC<Props> = ({ bids, asks }) => {
  const bidSorted = [...bids].sort((a,b)=>a.price-b.price);
  const askSorted = [...asks].sort((a,b)=>a.price-b.price);
  const data = {
    labels: [...bidSorted.map(b=>b.price), ...askSorted.map(a=>a.price)],
    datasets: [
      {
        label: 'Bids',
        data: bidSorted.map(b=>b.cum),
        borderColor: '#22c55e',
        backgroundColor: '#22c55e33',
        fill: true,
        pointRadius: 0,
      },
      {
        label: 'Asks',
        data: askSorted.map(a=>a.cum),
        borderColor: '#ef4444',
        backgroundColor: '#ef444433',
        fill: true,
        pointRadius: 0,
      }
    ]
  };
  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#cbd5e1' } } },
    scales: { x: { ticks: { color: '#9ca3af' } }, y: { ticks: { color: '#9ca3af' } } }
  };
  return <div style={{ height: 220 }}><Line data={data} options={options} /></div>;
};

export default DepthChart;
