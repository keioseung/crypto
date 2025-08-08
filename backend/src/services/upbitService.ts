import axios from 'axios';

const UPBIT_API_URL = process.env.UPBIT_API_URL || 'https://api.upbit.com/v1';

export type Candle = {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export async function fetchTickers(markets: string[] = ['KRW-BTC','KRW-ETH']) {
  const query = markets.join(',');
  const { data } = await axios.get(`${UPBIT_API_URL}/ticker`, {
    params: { markets: query },
    headers: { Accept: 'application/json' },
    timeout: 10000,
  });
  return data;
}

export async function fetchMinuteCandles(market: string, minutes: number = 60, count: number = 200): Promise<Candle[]> {
  const { data } = await axios.get(`${UPBIT_API_URL}/candles/minutes/${minutes}`, {
    params: { market, count },
    headers: { Accept: 'application/json' },
    timeout: 10000,
  });
  // Map to common candle shape
  return data.map((c: any) => ({
    timestamp: new Date(c.timestamp).getTime() || new Date(c.candle_date_time_kst).getTime(),
    open: c.opening_price,
    high: c.high_price,
    low: c.low_price,
    close: c.trade_price,
    volume: c.candle_acc_trade_volume,
  })).reverse();
}

export async function fetchOrderbook(market: string) {
  const { data } = await axios.get(`${UPBIT_API_URL}/orderbook`, {
    params: { markets: market },
    headers: { Accept: 'application/json' },
    timeout: 10000,
  });
  const ob = data[0];
  const units: any[] = ob.orderbook_units || [];
  const bids = units.map(u => ({ price: u.bid_price, size: u.bid_size }));
  const asks = units.map(u => ({ price: u.ask_price, size: u.ask_size }));
  // cumulative
  let cum = 0;
  const bidsCum = bids
    .sort((a,b)=>b.price-a.price)
    .map(b => { cum += b.size; return { ...b, cum }; });
  cum = 0;
  const asksCum = asks
    .sort((a,b)=>a.price-b.price)
    .map(a => { cum += a.size; return { ...a, cum }; });
  return { market: ob.market, timestamp: ob.timestamp, bids: bidsCum, asks: asksCum };
}
