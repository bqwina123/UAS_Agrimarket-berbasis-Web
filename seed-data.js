const { pool, uuid } = require('./db');

async function seedMarketPrices() {
  const commodities = ['c1','c2','c3','c4','c5','c6','c7','c8','c9','c10','c11','c12','c13','c14','c15'];
  const markets = ['m1','m2','m3','m4','m5','m6','m7','m8'];
  const basePrices = { c1:14000, c2:11500, c3:45000, c4:62000, c5:32000, c6:28000, c7:12000, c8:18000, c9:15000, c10:26000, c11:35000, c12:30000, c13:18000, c14:17000, c15:8000 };
  const trends = ['up','down','stable'];

  console.log('Seeding market_prices...');
  let count = 0;
  for (const ci of commodities) {
    for (const mi of markets) {
      const base = basePrices[ci] || 10000;
      const variance = Math.round(base * (Math.random() * 0.3 - 0.1));
      const avg = base + variance;
      const id = `mp${++count}`;
      const trend = trends[Math.floor(Math.random() * 3)];
      await pool.query(
        'INSERT IGNORE INTO market_prices (id, commodityId, marketId, avgPrice, minPrice, maxPrice, trend) VALUES (?,?,?,?,?,?,?)',
        [id, ci, mi, avg, Math.round(avg * 0.8), Math.round(avg * 1.2), trend]
      );
    }
  }
  console.log(`Inserted ${count} market prices`);
}

async function seedPriceHistories() {
  const commodities = ['c1','c2','c3','c4','c5','c6','c7','c8','c9','c10','c11','c12','c13','c14','c15'];
  const markets = ['m1','m2','m3','m4','m5','m6','m7','m8'];
  const basePrices = { c1:14000, c2:11500, c3:45000, c4:62000, c5:32000, c6:28000, c7:12000, c8:18000, c9:15000, c10:26000, c11:35000, c12:30000, c13:18000, c14:17000, c15:8000 };

  console.log('Seeding price_histories (90 days)...');
  let count = 0;
  const batchSize = 100;
  let batch = [];

  for (const ci of commodities) {
    for (const mi of markets) {
      const base = basePrices[ci] || 10000;
      for (let d = 90; d >= 0; d--) {
        const date = new Date('2026-03-23');
        date.setDate(date.getDate() + d);
        const dateStr = date.toISOString().split('T')[0];
        const variance = Math.round(base * (Math.random() * 0.4 - 0.15));
        const price = Math.max(1000, base + variance);
        const id = `ph${++count}`;
        batch.push([id, ci, mi, price, dateStr]);
        
        if (batch.length >= batchSize) {
          await pool.query(
            'INSERT IGNORE INTO price_histories (id, commodityId, marketId, price, date) VALUES ?',
            [batch]
          );
          batch = [];
        }
      }
    }
  }
  if (batch.length > 0) {
    await pool.query(
      'INSERT IGNORE INTO price_histories (id, commodityId, marketId, price, date) VALUES ?',
      [batch]
    );
  }
  console.log(`Inserted ${count} price history records`);
}

async function main() {
  try {
    await seedMarketPrices();
    await seedPriceHistories();
    console.log('Seed complete!');
  } catch (e) {
    console.error('Seed error:', e);
  } finally {
    process.exit(0);
  }
}

main();
