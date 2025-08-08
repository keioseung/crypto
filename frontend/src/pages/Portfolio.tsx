import React from 'react';
import Card from '@/components/ui/Card';

const Portfolio: React.FC = () => {
  const holdings = [
    { sym: 'BTC', alloc: 0.5, value: 12_500_000 },
    { sym: 'ETH', alloc: 0.3, value: 7_500_000 },
    { sym: 'SOL', alloc: 0.2, value: 5_000_000 },
  ];

  return (
    <div className="space-y-6">
      <Card title="Allocation">
        <div className="flex items-center gap-6">
          <div className="w-40 h-40 rounded-full bg-conic-to-r from-emerald-500 via-sky-500 to-violet-500" />
          <div className="text-sm text-white/80">
            {holdings.map(h => (
              <div key={h.sym} className="flex justify-between min-w-[200px]">
                <span>{h.sym}</span>
                <span>{Math.round(h.alloc*100)}%</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
      <Card title="Holdings">
        <div className="text-sm text-white/80 space-y-2">
          {holdings.map(h => (
            <div key={h.sym} className="flex justify-between border-b border-dark-800 pb-1">
              <span>{h.sym}</span>
              <span>₩{h.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Portfolio;
