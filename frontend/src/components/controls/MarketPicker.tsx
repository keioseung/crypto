import React from 'react';

type Props = {
  market: string;
  onMarket: (m: string) => void;
  minutes: number;
  onMinutes: (m: number) => void;
};

const presets = ['KRW-BTC','KRW-ETH','KRW-XRP','KRW-SOL'];
const minutePresets = [1, 5, 15, 60, 240];

const MarketPicker: React.FC<Props> = ({ market, onMarket, minutes, onMinutes }) => {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <select value={market} onChange={e=>onMarket(e.target.value)} className="input w-44">
        {presets.map(p => <option key={p} value={p}>{p}</option>)}
      </select>
      <select value={minutes} onChange={e=>onMinutes(Number(e.target.value))} className="input w-28">
        {minutePresets.map(m => <option key={m} value={m}>{m}m</option>)}
      </select>
    </div>
  );
};

export default MarketPicker;
