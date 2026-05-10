const express = require('express');
const db = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/vendor/dashboard
router.get('/dashboard', authenticate, authorize('vendor'), (req, res) => {
  try {
    const vendor = db.prepare('SELECT * FROM vendor_profiles WHERE user_id = ?').get(req.user.id);
    if (!vendor) return res.status(404).json({ error: 'Vendor profile not found' });

    const { total_products } = db.prepare('SELECT COUNT(*) as total_products FROM products WHERE vendor_id = ?').get(vendor.id);
    const { total_orders }   = db.prepare('SELECT COUNT(*) as total_orders FROM order_items WHERE vendor_id = ?').get(vendor.id);
    const { total_revenue }  = db.prepare('SELECT COALESCE(SUM(net_amount),0) as total_revenue FROM payouts WHERE vendor_id = ? AND status = "processed"').get(vendor.id);
    const { pending_payouts }= db.prepare('SELECT COALESCE(SUM(net_amount),0) as pending_payouts FROM payouts WHERE vendor_id = ? AND status = "pending"').get(vendor.id);

    const recent_orders = db.prepare(`
      SELECT oi.*, o.created_at, o.status, p.name as product_name
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      JOIN products p ON p.id = oi.product_id
      WHERE oi.vendor_id = ?
      ORDER BY o.created_at DESC LIMIT 10
    `).all(vendor.id);

    res.json({
      vendor,
      stats: { total_products, total_orders, total_revenue, pending_payouts },
      recent_orders
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/vendor/products
router.get('/products', authenticate, authorize('vendor'), (req, res) => {
  try {
    const vendor = db.prepare('SELECT id FROM vendor_profiles WHERE user_id = ?').get(req.user.id);
    const products = db.prepare(`
      SELECT p.*, c.name as category_name,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as thumbnail
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.vendor_id = ? ORDER BY p.created_at DESC
    `).all(vendor.id);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/vendor/profile
router.put('/profile', authenticate, authorize('vendor'), (req, res) => {
  try {
    const { shop_name, description, phone, address } = req.body;
    db.prepare(`
      UPDATE vendor_profiles SET shop_name=?, description=?, phone=?, address=? WHERE user_id=?
    `).run(shop_name, description, phone, address, req.user.id);
    res.json({ message: 'Profile updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;