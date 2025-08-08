import React, { useMemo, useState } from 'react';
import Card from '@/components/ui/Card';
import LineChart, { SeriesPoint } from '@/components/ui/LineChart';
import { useCandles } from '@/hooks/useCandles';

function backtestCloseCrossover(prices: number[]) {
  let cash = 1;
  let pos = 0; // position in units
  const equity: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    const up = prices[i] > prices[i-1];
    if (up && cash > 0) { pos = cash / prices[i]; cash = 0; }
    if (!up && pos > 0) { cash = pos * prices[i]; pos = 0; }
    const cur = cash > 0 ? cash : pos * prices[i];
    equity.push(cur);
  }
  const ret = equity[equity.length-1] - 1;
  const maxDD = equity.reduce((acc, v, idx) => {
    const peak = Math.max(...equity.slice(0, idx+1));
    return Math.min(acc, (v-peak)/peak);
  }, 0);
  return { equity, ret, maxDD };
}

const Backtesting: React.FC = () => {
  const { data: candles = [] } = useCandles('KRW-BTC', 60, 300);
  const prices = useMemo(()=>candles.map(c=>c.close), [candles]);
  const [equity, setEquity] = useState<number[]>([]);

  function run() {
    const r = backtestCloseCrossover(prices);
    setEquity(r.equity);
  }

  const curve: SeriesPoint[] = equity.map((v, i) => ({ x: i, y: v }));

  return (
    <div className="space-y-6">
      <Card title="Backtest Controls" actions={<button className="btn-primary" onClick={run}>Run</button>}>
        <div className="text-sm text-dark-300">Strategy: Close {'>'} PrevClose (toy example)</div>
      </Card>
      <Card title="Equity Curve">
        <LineChart series={[{ label: 'Equity', data: curve, color: '#34d399' }]} height={280} />
      </Card>
    </div>
  );
};

export default Backtesting;
