import React from 'react';
import Card from '@/components/ui/Card';

const Markets: React.FC = () => {
  const rows = Array.from({ length: 8 }).map((_, i) => ({
    market: i % 2 ? 'ETH/KRW' : 'BTC/KRW',
    price: i % 2 ? '₩3,200,000' : '₩45,000,000',
    change: (Math.random() * 6 - 3).toFixed(2),
    vol: i % 2 ? '5,678 ETH' : '1,234 BTC',
  }));

  return (
    <div className="space-y-6">
      <Card title="Markets">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-dark-300">
                <th className="py-2 pr-4">Market</th>
                <th className="py-2 pr-4">Price</th>
                <th className="py-2 pr-4">Change</th>
                <th className="py-2 pr-4">Volume</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr key={idx} className="border-t border-dark-700 text-white/90">
                  <td className="py-2 pr-4">{r.market}</td>
                  <td className="py-2 pr-4">{r.price}</td>
                  <td className={`py-2 pr-4 ${Number(r.change) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{r.change}%</td>
                  <td className="py-2 pr-4 text-dark-300">{r.vol}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Markets;
