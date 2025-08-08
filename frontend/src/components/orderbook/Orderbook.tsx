import React from 'react';

type Level = { price: number; size: number; cum: number };

type Props = {
  bids: Level[];
  asks: Level[];
};

const Orderbook: React.FC<Props> = ({ bids, asks }) => {
  return (
    <div className="grid grid-cols-2 gap-4 text-xs">
      <div>
        <div className="text-emerald-400 mb-1">Bids</div>
        <div className="space-y-1">
          {bids.slice(0, 15).map((b, i) => (
            <div key={i} className="flex justify-between border-b border-dark-800 pb-0.5">
              <span className="text-emerald-300">{b.price.toLocaleString()}</span>
              <span className="text-dark-300">{b.size.toFixed(4)}</span>
              <span className="text-dark-500">{b.cum.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="text-rose-400 mb-1">Asks</div>
        <div className="space-y-1">
          {asks.slice(0, 15).map((a, i) => (
            <div key={i} className="flex justify-between border-b border-dark-800 pb-0.5">
              <span className="text-rose-300">{a.price.toLocaleString()}</span>
              <span className="text-dark-300">{a.size.toFixed(4)}</span>
              <span className="text-dark-500">{a.cum.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Orderbook;
