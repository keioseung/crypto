import React, { useMemo, useState } from 'react';
import Card from '@/components/ui/Card';
import CandleChart from '@/components/charts/CandleChart';
import MarketPicker from '@/components/controls/MarketPicker';
import { useCandles } from '@/hooks/useCandles';

const Markets: React.FC = () => {
  const [market, setMarket] = useState('KRW-BTC');
  const [minutes, setMinutes] = useState(60);
  const { data: candles = [] } = useCandles(market, minutes, 240);

  return (
    <div className="space-y-6">
      <Card title="Market" actions={<MarketPicker market={market} onMarket={setMarket} minutes={minutes} onMinutes={setMinutes} />}>
        <CandleChart candles={candles} />
      </Card>
    </div>
  );
};

export default Markets;
