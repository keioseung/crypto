import React, { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import CandleChart from '@/components/charts/CandleChart';
import DepthChart from '@/components/charts/DepthChart';
import Orderbook from '@/components/orderbook/Orderbook';
import MarketPicker from '@/components/controls/MarketPicker';
import { useCandles } from '@/hooks/useCandles';
import axios from 'axios';
import { getApiUrl } from '@/config/api';

const Markets: React.FC = () => {
  const [market, setMarket] = useState('KRW-BTC');
  const [minutes, setMinutes] = useState(60);
  const { data: candles = [] } = useCandles(market, minutes, 240);
  const [orderbook, setOrderbook] = useState<any | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await axios.get(getApiUrl('/api/v1/markets/orderbook'), { params: { market } });
      setOrderbook(data);
    };
    load();
    const id = setInterval(load, 5_000);
    return () => clearInterval(id);
  }, [market]);

  return (
    <div className="space-y-6">
      <Card title="Market" actions={<MarketPicker market={market} onMarket={setMarket} minutes={minutes} onMinutes={setMinutes} />}>
        <CandleChart candles={candles} />
      </Card>

      {orderbook && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card title="Depth">
            <DepthChart bids={orderbook.bids} asks={orderbook.asks} />
          </Card>
          <Card title="Orderbook" >
            <Orderbook bids={orderbook.bids} asks={orderbook.asks} />
          </Card>
          <Card title="Recent Ticks (mock)">
            <div className="text-sm text-dark-300">Coming soon: real-time ticks via WebSocket</div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Markets;
