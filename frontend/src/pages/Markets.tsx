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
  const [supported, setSupported] = useState<any[]>([]);

  useEffect(() => { (async()=>{
    const { data } = await axios.get(getApiUrl('/api/v1/markets/supported'));
    setSupported(data.filter((m:any)=>m.market.startsWith('KRW-')));
  })(); }, []);

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
          <Card title="Supported (KRW)" >
            <div className="max-h-64 overflow-auto text-sm">
              {supported.slice(0, 100).map((m:any)=> (
                <button key={m.market} className={`block w-full text-left px-2 py-1 rounded ${m.market===market?'bg-dark-800 text-white':'text-dark-300 hover:bg-dark-800/60'}`} onClick={()=>setMarket(m.market)}>
                  {m.market} <span className="text-dark-500">{m.korean_name}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Markets;
