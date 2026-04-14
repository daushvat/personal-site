module.exports = async (req, res) => {
  try {
    const tickerUrl = 'https://api.binance.com/api/v3/ticker/24hr?symbols=%5B%22BTCUSDT%22,%22ETHUSDT%22,%22SOLUSDT%22%5D';
    const klines = {
      BTCUSDT: 'https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1h&limit=168',
      ETHUSDT: 'https://api.binance.com/api/v3/klines?symbol=ETHUSDT&interval=1h&limit=168',
      SOLUSDT: 'https://api.binance.com/api/v3/klines?symbol=SOLUSDT&interval=1h&limit=168'
    };

    const [tickersRes, btcKlinesRes, ethKlinesRes, solKlinesRes] = await Promise.all([
      fetch(tickerUrl, { headers: { 'user-agent': 'personal-site-vercel' } }),
      fetch(klines.BTCUSDT, { headers: { 'user-agent': 'personal-site-vercel' } }),
      fetch(klines.ETHUSDT, { headers: { 'user-agent': 'personal-site-vercel' } }),
      fetch(klines.SOLUSDT, { headers: { 'user-agent': 'personal-site-vercel' } })
    ]);

    if (!tickersRes.ok || !btcKlinesRes.ok || !ethKlinesRes.ok || !solKlinesRes.ok) {
      res.status(502).json({ error: 'upstream_failed' });
      return;
    }

    const [tickers, btcKlines, ethKlines, solKlines] = await Promise.all([
      tickersRes.json(),
      btcKlinesRes.json(),
      ethKlinesRes.json(),
      solKlinesRes.json()
    ]);

    const sparkMap = {
      BTCUSDT: btcKlines.map(k => Number(k[4])),
      ETHUSDT: ethKlines.map(k => Number(k[4])),
      SOLUSDT: solKlines.map(k => Number(k[4]))
    };

    const meta = {
      BTCUSDT: { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', image: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png?v=040' },
      ETHUSDT: { id: 'ethereum', symbol: 'eth', name: 'Ethereum', image: 'https://cryptologos.cc/logos/ethereum-eth-logo.png?v=040' },
      SOLUSDT: { id: 'solana', symbol: 'sol', name: 'Solana', image: 'https://cryptologos.cc/logos/solana-sol-logo.png?v=040' }
    };

    const data = tickers.map(t => ({
      ...meta[t.symbol],
      current_price: Number(t.lastPrice),
      high_24h: Number(t.highPrice),
      low_24h: Number(t.lowPrice),
      price_change_24h: Number(t.priceChange),
      price_change_percentage_24h: Number(t.priceChangePercent),
      price_change_percentage_24h_in_currency: Number(t.priceChangePercent),
      last_updated: new Date(Number(t.closeTime)).toISOString(),
      sparkline_in_7d: { price: sparkMap[t.symbol] || [] }
    }));

    res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate=20');
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'internal_error' });
  }
};
