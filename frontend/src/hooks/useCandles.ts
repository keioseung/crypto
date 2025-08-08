import { useQuery } from 'react-query';
import axios from 'axios';
import { getApiUrl } from '@/config/api';

export type Candle = { timestamp: number; open: number; high: number; low: number; close: number; volume: number };

export function useCandles(market: string, minutes: number, count: number) {
  return useQuery(['candles', market, minutes, count], async () => {
    const { data } = await axios.get<Candle[]>(getApiUrl('/api/v1/markets/candles'), {
      params: { market, minutes, count },
    });
    return data;
  }, { staleTime: 60_000 });
}
