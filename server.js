const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool, uuid } = require('./db');

const app = express();
const PORT = 3001;
const JWT_SECRET = 'agrimarket_secret_key_2026';

app.use(cors());
app.use(express.json({ limit: '10mb' }));

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'No token' });
  try {
    const token = header.split(' ')[1];
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (header) {
    try { req.user = jwt.verify(header.split(' ')[1], JWT_SECRET); } catch (e) {}
  }
  next();
}

// ============= AUTH =============
app.post('/api/auth/login', async (req, res) => {
  try {
    const { credential, password } = req.body;
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ? OR phone = ?', [credential, credential]);
    if (rows.length === 0) return res.status(400).json({ error: 'Akun tidak ditemukan' });
    const user = rows[0];
    if (user.password !== password) return res.status(400).json({ error: 'Password salah' });
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    delete user.password;
    res.json({ user, token });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, phone, password, role, location } = req.body;
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ? OR phone = ?', [email, phone]);
    if (existing.length > 0) return res.status(400).json({ error: 'Email atau nomor HP sudah terdaftar' });
    const id = uuid();
    await pool.query('INSERT INTO users (id, email, phone, password, name, role, location, isVerified, isActive) VALUES (?,?,?,?,?,?,?,TRUE,TRUE)', [id, email, phone, password, name, role, location]);
    const token = jwt.sign({ id, role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user: { id, email, phone, name, role, location, isVerified: true, isActive: true }, token });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, email, phone, name, role, location, avatar, isVerified, isActive, createdAt FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/auth/profile', authMiddleware, async (req, res) => {
  try {
    const { name, location, avatar } = req.body;
    await pool.query('UPDATE users SET name=?, location=?, avatar=? WHERE id=?', [name, location, avatar, req.user.id]);
    const [rows] = await pool.query('SELECT id, email, phone, name, role, location, avatar, isVerified, isActive, createdAt FROM users WHERE id = ?', [req.user.id]);
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/auth/password', authMiddleware, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const [rows] = await pool.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    if (rows[0].password !== oldPassword) return res.status(400).json({ error: 'Password lama salah' });
    await pool.query('UPDATE users SET password=? WHERE id=?', [newPassword, req.user.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ============= COMMODITIES =============
app.get('/api/commodities', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM commodities ORDER BY name');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/commodities/categories', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT DISTINCT category FROM commodities WHERE category IS NOT NULL ORDER BY category');
    res.json(rows.map(r => r.category));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/commodities', authMiddleware, async (req, res) => {
  try {
    const { name, category, unit, image, description } = req.body;
    const id = uuid();
    await pool.query('INSERT INTO commodities (id, name, category, unit, image, description) VALUES (?,?,?,?,?,?)', [id, name, category, unit, image, description]);
    const [rows] = await pool.query('SELECT * FROM commodities WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/commodities/:id', authMiddleware, async (req, res) => {
  try { await pool.query('DELETE FROM commodities WHERE id = ?', [req.params.id]); res.json({ success: true }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// ============= MARKETS =============
app.get('/api/markets', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM markets ORDER BY name');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/markets/provinces', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT DISTINCT province FROM markets WHERE province IS NOT NULL ORDER BY province');
    res.json(rows.map(r => r.province));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/markets', authMiddleware, async (req, res) => {
  try {
    const { name, city, province, type, latitude, longitude } = req.body;
    const id = uuid();
    await pool.query('INSERT INTO markets (id, name, city, province, type, latitude, longitude) VALUES (?,?,?,?,?,?,?)', [id, name, city, province, type, latitude, longitude]);
    const [rows] = await pool.query('SELECT * FROM markets WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/markets/:id', authMiddleware, async (req, res) => {
  try { await pool.query('DELETE FROM markets WHERE id = ?', [req.params.id]); res.json({ success: true }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// ============= MARKET PRICES =============
app.get('/api/market-prices', async (req, res) => {
  try {
    const { commodityId, marketId } = req.query;
    let sql = 'SELECT mp.*, m.name as marketName, m.city as marketCity, m.province as marketProvince FROM market_prices mp JOIN markets m ON m.id = mp.marketId';
    const params = [];
    const conditions = [];
    if (commodityId) { conditions.push('mp.commodityId = ?'); params.push(commodityId); }
    if (marketId) { conditions.push('mp.marketId = ?'); params.push(marketId); }
    if (conditions.length > 0) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY mp.date DESC';
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/market-prices/avg/:commodityId', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT AVG(avgPrice) as avgPrice FROM market_prices WHERE commodityId = ?', [req.params.commodityId]);
    res.json({ avgPrice: Math.round(rows[0].avgPrice || 0) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/market-prices', authMiddleware, async (req, res) => {
  try {
    const { commodityId, marketId, avgPrice, minPrice, maxPrice, trend } = req.body;
    const id = uuid();
    await pool.query('INSERT INTO market_prices (id, commodityId, marketId, avgPrice, minPrice, maxPrice, trend) VALUES (?,?,?,?,?,?,?)', [id, commodityId, marketId, avgPrice, minPrice, maxPrice, trend || 'stable']);
    const [rows] = await pool.query('SELECT * FROM market_prices WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/market-prices/bulk', authMiddleware, async (req, res) => {
  try {
    const { data } = req.body;
    let count = 0;
    for (const d of data) {
      const id = uuid();
      await pool.query('INSERT INTO market_prices (id, commodityId, marketId, avgPrice, minPrice, maxPrice, trend) VALUES (?,?,?,?,?,?,?)', [id, d.commodityId, d.marketId, d.avgPrice, d.minPrice || Math.round(d.avgPrice * 0.8), d.maxPrice || Math.round(d.avgPrice * 1.2), d.trend || 'stable']);
      count++;
    }
    res.json({ count });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/market-prices/:id', authMiddleware, async (req, res) => {
  try { await pool.query('DELETE FROM market_prices WHERE id = ?', [req.params.id]); res.json({ success: true }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// ============= PRODUCTS =============
app.get('/api/products', optionalAuth, async (req, res) => {
  try {
    const { farmerId, available } = req.query;
    let sql = 'SELECT p.*, c.name as commodityName, c.category as commodityCategory, c.image as commodityImage FROM products p LEFT JOIN commodities c ON c.id = p.commodityId';
    const params = [];
    const conditions = [];
    if (farmerId) { conditions.push('p.farmerId = ?'); params.push(farmerId); }
    if (available === 'true') { conditions.push('p.isAvailable = TRUE AND p.stock > 0'); }
    if (conditions.length > 0) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY p.createdAt DESC';
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT p.*, c.name as commodityName, c.category as commodityCategory, c.image as commodityImage, u.name as farmerName, u.location as farmerLocation FROM products p LEFT JOIN commodities c ON c.id = p.commodityId LEFT JOIN users u ON u.id = p.farmerId WHERE p.id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/products', authMiddleware, async (req, res) => {
  try {
    const { farmerId, commodityId, name, description, price, stock, unit, image } = req.body;
    const id = uuid();
    await pool.query('INSERT INTO products (id, farmerId, commodityId, name, description, price, stock, unit, image, status) VALUES (?,?,?,?,?,?,?,?,?,"active")', [id, farmerId, commodityId, name, description, price, stock, unit, image]);
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/products/:id', authMiddleware, async (req, res) => {
  try {
    const fields = [];
    const params = [];
    for (const key of ['name', 'description', 'price', 'stock', 'unit', 'image', 'isAvailable', 'status']) {
      if (req.body[key] !== undefined) { fields.push(key + '=?'); params.push(req.body[key]); }
    }
    if (fields.length > 0) { params.push(req.params.id); await pool.query('UPDATE products SET ' + fields.join(',') + ' WHERE id=?', params); }
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/products/:id', authMiddleware, async (req, res) => {
  try { await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]); res.json({ success: true }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// ============= CARTS =============
app.get('/api/carts', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM carts WHERE userId = ?', [req.user.id]);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/carts/add', authMiddleware, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const [prod] = await pool.query('SELECT * FROM products WHERE id = ?', [productId]);
    if (prod.length === 0) return res.status(404).json({ error: 'Product not found' });
    const p = prod[0];
    const [existing] = await pool.query('SELECT * FROM carts WHERE userId = ? AND productId = ?', [req.user.id, productId]);
    if (existing.length > 0) {
      const newQty = Math.min(existing[0].quantity + quantity, p.stock);
      await pool.query('UPDATE carts SET quantity=? WHERE id=?', [newQty, existing[0].id]);
    } else {
      await pool.query('INSERT INTO carts (id, userId, productId, productName, quantity, unit, price, farmerId, image, stock) VALUES (?,?,?,?,?,?,?,?,?,?)', [uuid(), req.user.id, productId, p.name, quantity, p.unit, p.price, p.farmerId, p.image, p.stock]);
    }
    const [rows] = await pool.query('SELECT * FROM carts WHERE userId = ?', [req.user.id]);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/carts/:productId', authMiddleware, async (req, res) => {
  try {
    const { quantity } = req.body;
    const [item] = await pool.query('SELECT * FROM carts WHERE userId = ? AND productId = ?', [req.user.id, req.params.productId]);
    if (item.length > 0) {
      const newQty = Math.max(1, Math.min(quantity, item[0].stock));
      await pool.query('UPDATE carts SET quantity=? WHERE id=?', [newQty, item[0].id]);
    }
    const [rows] = await pool.query('SELECT * FROM carts WHERE userId = ?', [req.user.id]);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/carts/:productId', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM carts WHERE userId = ? AND productId = ?', [req.user.id, req.params.productId]);
    const [rows] = await pool.query('SELECT * FROM carts WHERE userId = ?', [req.user.id]);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/carts', authMiddleware, async (req, res) => {
  try { await pool.query('DELETE FROM carts WHERE userId = ?', [req.user.id]); res.json({ success: true }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// ============= ORDERS =============
app.get('/api/orders', authMiddleware, async (req, res) => {
  try {
    const { role } = req.user;
    let sql, params;
    if (role === 'petani') {
      sql = 'SELECT * FROM orders WHERE farmerId = ? ORDER BY createdAt DESC';
      params = [req.user.id];
    } else {
      sql = 'SELECT * FROM orders WHERE buyerId = ? ORDER BY createdAt DESC';
      params = [req.user.id];
    }
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/orders/all', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM orders ORDER BY createdAt DESC');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/orders/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/orders', authMiddleware, async (req, res) => {
  try {
    const { farmerId, paymentMethod, shippingMethod, shippingCost, notes, items } = req.body;
    if (!items || items.length === 0) return res.status(400).json({ error: 'No items' });
    const totalPrice = items.reduce((s, i) => s + i.subtotal, 0) + (shippingCost || 0);
    const id = uuid();
    await pool.query('INSERT INTO orders (id, buyerId, farmerId, status, totalPrice, paymentMethod, shippingMethod, shippingCost, notes) VALUES (?,?,?,"pending",?,?,?,?,?)', [id, req.user.id, farmerId, totalPrice, paymentMethod, shippingMethod, shippingCost, notes]);
    for (const item of items) {
      await pool.query('INSERT INTO order_items (id, orderId, productId, commodityName, quantity, unit, price, subtotal) VALUES (?,?,?,?,?,?,?,?)', [uuid(), id, item.productId, item.commodityName, item.quantity, item.unit, item.price, item.subtotal]);
      await pool.query('UPDATE products SET stock = GREATEST(0, stock - ?) WHERE id = ?', [item.quantity, item.productId]);
    }
    await pool.query('INSERT INTO payments (id, orderId, userId, method, amount, status) VALUES (?,?,?,?,"pending")', [uuid(), id, req.user.id, paymentMethod, totalPrice]);
    res.json({ id, status: 'pending', totalPrice });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/orders/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    await pool.query('UPDATE orders SET status=?, updatedAt=NOW() WHERE id=?', [status, req.params.id]);
    const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/orders/:id/confirm-delivered', authMiddleware, async (req, res) => {
  try {
    await pool.query('UPDATE orders SET status="delivered", buyerConfirmed=TRUE, updatedAt=NOW() WHERE id=? AND status="shipped"', [req.params.id]);
    const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/orders/:id/items', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM order_items WHERE orderId = ?', [req.params.id]);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ============= PAYMENTS =============
app.get('/api/payments', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM payments WHERE userId = ?', [req.user.id]);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/payments/all', authMiddleware, async (req, res) => {
  try { const [rows] = await pool.query('SELECT * FROM payments'); res.json(rows); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/payments/upload-proof', authMiddleware, async (req, res) => {
  try {
    const { orderId, proofImage } = req.body;
    const [existing] = await pool.query('SELECT * FROM payments WHERE orderId = ?', [orderId]);
    if (existing.length > 0) {
      await pool.query('UPDATE payments SET proofImage=?, status="pending" WHERE orderId=?', [proofImage, orderId]);
    } else {
      const [order] = await pool.query('SELECT * FROM orders WHERE id = ?', [orderId]);
      if (order.length === 0) return res.status(404).json({ error: 'Order not found' });
      await pool.query('INSERT INTO payments (id, orderId, userId, method, amount, status, proofImage) VALUES (?,?,?,?,?,"pending",?)', [uuid(), orderId, req.user.id, order[0].paymentMethod, order[0].totalPrice, proofImage]);
    }
    const [rows] = await pool.query('SELECT * FROM payments WHERE orderId = ?', [orderId]);
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/payments/:id/verify', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    await pool.query('UPDATE payments SET status=?, verifiedAt=NOW(), verifiedBy=? WHERE id=?', [status, req.user.id, req.params.id]);
    if (status === 'verified') {
      const [pay] = await pool.query('SELECT * FROM payments WHERE id = ?', [req.params.id]);
      if (pay.length > 0) await pool.query('UPDATE orders SET status="confirmed", updatedAt=NOW() WHERE id=? AND status="pending"', [pay[0].orderId]);
    }
    const [rows] = await pool.query('SELECT * FROM payments WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ============= SHIPPINGS =============
app.get('/api/shippings/order/:orderId', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM shippings WHERE orderId = ?', [req.params.orderId]);
    res.json(rows[0] || null);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/shippings', authMiddleware, async (req, res) => {
  try {
    const { orderId, courier, trackingNumber, estimatedDays } = req.body;
    const id = uuid();
    await pool.query('INSERT INTO shippings (id, orderId, courier, trackingNumber, status, estimatedDays) VALUES (?,?,?,?,"shipping",?)', [id, orderId, courier, trackingNumber, estimatedDays]);
    await pool.query('UPDATE orders SET status="shipped", updatedAt=NOW() WHERE id=?', [orderId]);
    const [rows] = await pool.query('SELECT * FROM shippings WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ============= REVIEWS =============
app.get('/api/reviews/product/:productId', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM reviews WHERE productId = ? ORDER BY createdAt DESC', [req.params.productId]);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/reviews/average/:productId', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT AVG(rating) as avg, COUNT(*) as count FROM reviews WHERE productId = ?', [req.params.productId]);
    res.json({ avg: rows[0].avg || 0, count: rows[0].count });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/reviews/all', authMiddleware, async (req, res) => {
  try { const [rows] = await pool.query('SELECT * FROM reviews ORDER BY createdAt DESC'); res.json(rows); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/reviews', authMiddleware, async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    // Check if user has ordered this product
    const [ordered] = await pool.query(
      'SELECT o.id FROM orders o JOIN order_items oi ON oi.orderId = o.id WHERE o.buyerId = ? AND oi.productId = ? AND o.status = "delivered" LIMIT 1',
      [req.user.id, productId]
    );
    if (ordered.length === 0) return res.status(400).json({ error: 'Anda hanya bisa mengulas produk yang sudah dibeli dan diterima.' });
    const [user] = await pool.query('SELECT name FROM users WHERE id = ?', [req.user.id]);
    const id = uuid();
    await pool.query('INSERT INTO reviews (id, productId, userId, userName, rating, comment) VALUES (?,?,?,?,?,?)', [id, productId, req.user.id, user[0].name, rating, comment]);
    const [rows] = await pool.query('SELECT * FROM reviews WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/reviews/:id', authMiddleware, async (req, res) => {
  try { await pool.query('DELETE FROM reviews WHERE id = ?', [req.params.id]); res.json({ success: true }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// ============= WISHLISTS =============
app.get('/api/wishlists', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT w.*, p.name as productName, p.price, p.image, p.stock FROM wishlists w JOIN products p ON p.id = w.productId WHERE w.userId = ? ORDER BY w.addedAt DESC', [req.user.id]);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/wishlists/toggle', authMiddleware, async (req, res) => {
  try {
    const { productId } = req.body;
    const [existing] = await pool.query('SELECT id FROM wishlists WHERE userId = ? AND productId = ?', [req.user.id, productId]);
    if (existing.length > 0) {
      await pool.query('DELETE FROM wishlists WHERE userId = ? AND productId = ?', [req.user.id, productId]);
    } else {
      await pool.query('INSERT INTO wishlists (id, userId, productId) VALUES (?,?,?)', [uuid(), req.user.id, productId]);
    }
    const [rows] = await pool.query('SELECT w.*, p.name as productName, p.price, p.image FROM wishlists w JOIN products p ON p.id = w.productId WHERE w.userId = ? ORDER BY w.addedAt DESC', [req.user.id]);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ============= ADDRESSES =============
app.get('/api/addresses', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM addresses WHERE userId = ?', [req.user.id]);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/addresses', authMiddleware, async (req, res) => {
  try {
    const { label, address, city, province, phone, isDefault } = req.body;
    if (isDefault) await pool.query('UPDATE addresses SET isDefault=FALSE WHERE userId=?', [req.user.id]);
    const id = uuid();
    await pool.query('INSERT INTO addresses (id, userId, label, address, city, province, phone, isDefault) VALUES (?,?,?,?,?,?,?,?)', [id, req.user.id, label, address, city, province, phone, isDefault || false]);
    const [rows] = await pool.query('SELECT * FROM addresses WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/addresses/:id', authMiddleware, async (req, res) => {
  try { await pool.query('DELETE FROM addresses WHERE id = ? AND userId = ?', [req.params.id, req.user.id]); res.json({ success: true }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// ============= NOTIFICATIONS =============
app.get('/api/notifications', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC', [req.user.id]);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/notifications/unread-count', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM notifications WHERE userId = ? AND isRead = FALSE', [req.user.id]);
    res.json({ count: rows[0].count });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/notifications/:id/read', authMiddleware, async (req, res) => {
  try { await pool.query('UPDATE notifications SET isRead=TRUE WHERE id=?', [req.params.id]); res.json({ success: true }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/notifications/read-all', authMiddleware, async (req, res) => {
  try { await pool.query('UPDATE notifications SET isRead=TRUE WHERE userId=?', [req.user.id]); res.json({ success: true }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// ============= USERS (Admin) =============
app.get('/api/users', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, email, phone, name, role, location, avatar, isVerified, isActive, createdAt FROM users ORDER BY createdAt DESC');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/users', authMiddleware, async (req, res) => {
  try {
    const { email, phone, password, name, role, location } = req.body;
    const id = uuid();
    await pool.query('INSERT INTO users (id, email, phone, password, name, role, location, isVerified, isActive) VALUES (?,?,?,?,?,?,?,TRUE,TRUE)', [id, email, phone, password, name, role, location]);
    const [rows] = await pool.query('SELECT id, email, phone, name, role, location, isVerified, isActive, createdAt FROM users WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/users/:id/toggle-active', authMiddleware, async (req, res) => {
  try {
    const [user] = await pool.query('SELECT isActive FROM users WHERE id = ?', [req.params.id]);
    if (user.length === 0) return res.status(404).json({ error: 'Not found' });
    await pool.query('UPDATE users SET isActive = NOT isActive WHERE id = ?', [req.params.id]);
    const [rows] = await pool.query('SELECT id, email, phone, name, role, location, isVerified, isActive, createdAt FROM users WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/users/sync', authMiddleware, async (req, res) => {
  try {
    const { users } = req.body;
    if (!Array.isArray(users)) return res.status(400).json({ error: 'users array required' });
    await pool.query('DELETE FROM users');
    for (const u of users) {
      await pool.query('INSERT INTO users (id, email, phone, password, name, role, location, isVerified, isActive, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?)',
        [u.id, u.email, u.phone || '', u.password, u.name, u.role, u.location || '', u.isVerified || false, u.isActive !== false, u.createdAt || new Date().toISOString()]);
    }
    const [rows] = await pool.query('SELECT id, email, phone, name, role, location, avatar, isVerified, isActive, createdAt FROM users ORDER BY createdAt DESC');
    res.json({ success: true, count: users.length, users: rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ============= FARMLANDS =============
app.get('/api/farmlands/:farmerId', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM farmlands WHERE farmerId = ?', [req.params.farmerId]);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/farmlands', authMiddleware, async (req, res) => {
  try {
    const { farmerId, name, address, latitude, longitude, areaSize, areaUnit } = req.body;
    const id = uuid();
    await pool.query('INSERT INTO farmlands (id, farmerId, name, address, latitude, longitude, areaSize, areaUnit) VALUES (?,?,?,?,?,?,?,?)', [id, farmerId, name, address, latitude, longitude, areaSize, areaUnit]);
    const [rows] = await pool.query('SELECT * FROM farmlands WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/farmlands/:id', authMiddleware, async (req, res) => {
  try { await pool.query('DELETE FROM farmlands WHERE id = ?', [req.params.id]); res.json({ success: true }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// ============= PRODUCT CATEGORIES =============
app.get('/api/product-categories', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM product_categories ORDER BY name');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ============= PRICE ALERTS =============
app.get('/api/price-alerts', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM price_alerts WHERE userId = ?', [req.user.id]);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/price-alerts/toggle', authMiddleware, async (req, res) => {
  try {
    const { commodityId, direction, targetPrice } = req.body;
    const [existing] = await pool.query('SELECT * FROM price_alerts WHERE userId = ? AND commodityId = ?', [req.user.id, commodityId]);
    if (existing.length > 0) {
      const a = existing[0];
      await pool.query('UPDATE price_alerts SET isActive = NOT isActive, direction=?, targetPrice=? WHERE id=?', [direction || a.direction, targetPrice || a.targetPrice, a.id]);
    } else {
      await pool.query('INSERT INTO price_alerts (id, userId, commodityId, direction, targetPrice, isActive) VALUES (?,?,?,?,?,TRUE)', [uuid(), req.user.id, commodityId, direction || 'any', targetPrice || null]);
    }
    const [rows] = await pool.query('SELECT * FROM price_alerts WHERE userId = ?', [req.user.id]);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ============= PRICE HISTORIES =============
app.get('/api/price-histories/:commodityId', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const [rows] = await pool.query(
      'SELECT date, AVG(price) as avgPrice FROM price_histories WHERE commodityId = ? AND date >= DATE_SUB(CURDATE(), INTERVAL ? DAY) GROUP BY date ORDER BY date',
      [req.params.commodityId, days]
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ============= REPORTS =============
app.get('/api/reports/transactions', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let sql = 'SELECT * FROM orders';
    const params = [];
    const cond = [];
    if (startDate) { cond.push('createdAt >= ?'); params.push(startDate); }
    if (endDate) { cond.push('createdAt <= ?'); params.push(endDate); }
    if (cond.length > 0) sql += ' WHERE ' + cond.join(' AND ');
    const [orders] = await pool.query(sql, params);
    const totalRevenue = orders.reduce((s, o) => s + o.totalPrice, 0);
    res.json({ orders, totalRevenue, totalOrders: orders.length, avgOrderValue: orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0 });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/reports/farmer/:farmerId', async (req, res) => {
  try {
    const [orders] = await pool.query('SELECT * FROM orders WHERE farmerId = ?', [req.params.farmerId]);
    const [products] = await pool.query('SELECT * FROM products WHERE farmerId = ?', [req.params.farmerId]);
    const totalRevenue = orders.reduce((s, o) => s + o.totalPrice, 0);
    res.json({ orders, products, totalRevenue, totalOrders: orders.length, totalProducts: products.length });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ============= AUTO-CANCEL EXPIRED =============
app.post('/api/orders/check-expired', async (req, res) => {
  try {
    const [pending] = await pool.query('SELECT * FROM orders WHERE status = "pending"');
    let count = 0;
    for (const order of pending) {
      const hours = (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60);
      if (hours >= 24) {
        await pool.query('UPDATE orders SET status="expired", autoCancelledAt=NOW(), updatedAt=NOW() WHERE id=?', [order.id]);
        count++;
      }
    }
    res.json({ count, message: count + ' orders expired' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.listen(PORT, () => {
  console.log('AgriMarket API server running on http://localhost:' + PORT);
});
