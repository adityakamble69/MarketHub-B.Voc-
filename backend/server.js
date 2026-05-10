
require('./database/init');  // ← ye line add karo
// backend/server.js
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app = express();

// ─── Middleware ─────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── API Routes ─────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders',   require('./routes/orders'));
app.use('/api/vendor',   require('./routes/vendor'));

// ─── Cart Routes (inline) ───────────────────────
const db = require('./config/db');
const { authenticate, authorize } = require('./middleware/auth');

app.get('/api/cart', authenticate, authorize('buyer'), async (req, res) => {
  try {
    const [items] = await db.query(`
      SELECT ci.*, p.name, p.price, p.discount_price, p.stock,
        (SELECT image_url FROM product_images WHERE product_id=p.id AND is_primary=1 LIMIT 1) as image,
        vp.shop_name
      FROM cart_items ci
      JOIN products p ON p.id = ci.product_id
      JOIN vendor_profiles vp ON vp.id = p.vendor_id
      WHERE ci.user_id = ?
    `, [req.user.id]);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/cart', authenticate, authorize('buyer'), async (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;
    const [existing] = await db.query('SELECT id, quantity FROM cart_items WHERE user_id=? AND product_id=?', [req.user.id, product_id]);
    if (existing.length) {
      await db.query('UPDATE cart_items SET quantity = quantity + ? WHERE id = ?', [quantity, existing[0].id]);
    } else {
      await db.query('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)', [req.user.id, product_id, quantity]);
    }
    res.json({ message: 'Cart updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/cart/:id', authenticate, authorize('buyer'), async (req, res) => {
  try {
    await db.query('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Item removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Categories ─────────────────────────────────
app.get('/api/categories', async (req, res) => {
  try {
    const [cats] = await db.query('SELECT * FROM categories');
    res.json(cats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Health Check ────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

// ─── 404 Handler ────────────────────────────────
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// ─── Error Handler ───────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Start ───────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
