module.exports = async (req, res) => {
  try {
    const url = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana&order=market_cap_desc&per_page=3&page=1&sparkline=true&price_change_percentage=24h';
    const upstream = await fetch(url, {
      headers: {
        'accept': 'application/json',
        'user-agent': 'personal-site-vercel'
      }
    });

    if (!upstream.ok) {
      res.status(upstream.status).json({ error: 'upstream_failed' });
      return;
    }

    const data = await upstream.json();
    res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate=30');
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'internal_error' });
  }
};
