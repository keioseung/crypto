import React, { useEffect, useState } from 'react';
import { KPI } from '@/components/ui/KPI';
import Card from '@/components/ui/Card';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { TrendingUp, Activity, BarChart3 } from 'lucide-react';
import axios from 'axios';
import { getApiUrl } from '@/config/api';

type Ticker = { market: string; trade_price: number; acc_trade_price_24h: number; signed_change_rate?: number };

type Candle = { timestamp: number; open: number; high: number; low: number; close: number; volume: number };

const Dashboard: React.FC = () => {
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const mk = await axios.get(getApiUrl('/api/v1/markets/supported'));
        const krw = (mk.data as any[]).filter(m => m.market.startsWith('KRW-')).slice(0, 50).map(m=>m.market);
        const t = await axios.get(getApiUrl('/api/v1/markets/tickers'), { params: { markets: krw.join(',') }});
        setTickers(t.data);
        const c = await axios.get(getApiUrl('/api/v1/markets/candles'), { params: { market: 'KRW-BTC', minutes: 60, count: 120 }});
        setCandles(c.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const last = tickers.find(x => x.market === 'KRW-BTC');
  const volume24h = last?.acc_trade_price_24h ?? 0;

  const sorted = [...tickers].filter(t=>typeof t.signed_change_rate === 'number');
  sorted.sort((a,b)=> (b.signed_change_rate! - a.signed_change_rate!));
  const topGainers = sorted.slice(0,5);
  const topLosers = [...sorted].reverse().slice(0,5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="BTC Price" value={last ? `₩${last.trade_price.toLocaleString()}` : '-'} delta={""} icon={TrendingUp} accent="green" />
        <KPI label="24h Volume" value={`₩${Math.round(volume24h/1_000_000_000).toLocaleString()}B`} icon={Activity} accent="yellow" />
        <KPI label="Candles Loaded" value={candles.length} icon={BarChart3} accent="blue" />
        <KPI label="Markets" value={tickers.length} icon={Activity} accent="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Market Performance">
          <div className="h-64 grid place-items-center text-dark-300">
            {loading ? <SkeletonCard /> : (
              <div className="w-full text-xs text-dark-300">
                {candles.slice(-5).map(c => (
                  <div key={c.timestamp} className="flex justify-between border-b border-dark-800 py-1">
                    <span>{new Date(c.timestamp).toLocaleTimeString()}</span>
                    <span className="text-white/80">Close: {c.close.toLocaleString()}</span>
                    <span>Vol: {c.volume.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
        <Card title="Top Gainers (24h)">
          <div className="space-y-3 text-sm">
            {topGainers.map((t) => (
              <div key={t.market} className="flex items-center justify-between">
                <span className="text-white/80">{t.market}</span>
                <span className="text-emerald-400 font-medium">{((t.signed_change_rate ?? 0)*100).toFixed(2)}%</span>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Top Losers (24h)">
          <div className="space-y-3 text-sm">
            {topLosers.map((t) => (
              <div key={t.market} className="flex items-center justify-between">
                <span className="text-white/80">{t.market}</span>
                <span className="text-rose-400 font-medium">{((t.signed_change_rate ?? 0)*100).toFixed(2)}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
