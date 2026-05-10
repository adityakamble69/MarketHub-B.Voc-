const express = require('express');
const db = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/products — Public
router.get('/', (req, res) => {
  try {
    const { category, search, min_price, max_price } = req.query;
    let query = `
      SELECT p.*, pi.image_url as thumbnail, vp.shop_name, c.name as category_name
      FROM products p
      LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1
      LEFT JOIN vendor_profiles vp ON vp.id = p.vendor_id
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.status = 'active'
    `;
    const params = [];
    if (category)  { query += ' AND c.slug = ?';   params.push(category); }
    if (search)    { query += ' AND p.name LIKE ?'; params.push(`%${search}%`); }
    if (min_price) { query += ' AND p.price >= ?';  params.push(min_price); }
    if (max_price) { query += ' AND p.price <= ?';  params.push(max_price); }
    query += ' ORDER BY p.created_at DESC';

    const products = db.prepare(query).all(...params);
    res.json({ products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/:id — Public
router.get('/:id', (req, res) => {
  try {
    const product = db.prepare(`
      SELECT p.*, vp.shop_name, c.name as category_name
      FROM products p
      LEFT JOIN vendor_profiles vp ON vp.id = p.vendor_id
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.id = ? AND p.status = 'active'
    `).get(req.params.id);

    if (!product) return res.status(404).json({ error: 'Product not found' });

    const images  = db.prepare('SELECT * FROM product_images WHERE product_id = ?').all(req.params.id);
    const reviews = db.prepare(`
      SELECT r.*, u.name as reviewer FROM reviews r
      JOIN users u ON u.id = r.user_id WHERE r.product_id = ?
    `).all(req.params.id);

    res.json({ ...product, images, reviews });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products — Vendor
router.post('/', authenticate, authorize('vendor'), (req, res) => {
  try {
    const { name, description, price, discount_price, stock, category_id } = req.body;

    const vendor = db.prepare('SELECT id FROM vendor_profiles WHERE user_id = ?').get(req.user.id);
    if (!vendor) return res.status(404).json({ error: 'Vendor profile not found' });

    const slug = name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();

    const result = db.prepare(`
      INSERT INTO products (vendor_id, category_id, name, slug, description, price, discount_price, stock, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `).run(vendor.id, category_id || null, name, slug, description, price, discount_price || null, stock || 0);

    res.status(201).json({ message: 'Product created', productId: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/products/:id — Vendor
router.put('/:id', authenticate, authorize('vendor'), (req, res) => {
  try {
    const vendor  = db.prepare('SELECT id FROM vendor_profiles WHERE user_id = ?').get(req.user.id);
    const product = db.prepare('SELECT id FROM products WHERE id = ? AND vendor_id = ?').get(req.params.id, vendor.id);
    if (!product) return res.status(404).json({ error: 'Product not found or not yours' });

    const { name, description, price, discount_price, stock, status } = req.body;
    db.prepare(`
      UPDATE products SET name=?, description=?, price=?, discount_price=?, stock=?, status=? WHERE id=?
    `).run(name, description, price, discount_price || null, stock, status, req.params.id);

    res.json({ message: 'Product updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/products/:id
router.delete('/:id', authenticate, authorize('vendor', 'admin'), (req, res) => {
  try {
    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;