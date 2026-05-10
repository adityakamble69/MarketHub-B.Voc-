// backend/routes/orders.js
const express = require('express');
const db = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// ─── POST /api/orders ─── Buyer: place order from cart
router.post('/', authenticate, authorize('buyer'), async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const { shipping_address, payment_method } = req.body;
    const userId = req.user.id;

    // Get cart items
    const [cartItems] = await conn.query(`
      SELECT ci.*, p.price, p.discount_price, p.stock, p.vendor_id, p.name
      FROM cart_items ci JOIN products p ON p.id = ci.product_id
      WHERE ci.user_id = ?
    `, [userId]);

    if (!cartItems.length) {
      await conn.rollback();
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Validate stock
    for (const item of cartItems) {
      if (item.stock < item.quantity) {
        await conn.rollback();
        return res.status(400).json({ error: `Insufficient stock for "${item.name}"` });
      }
    }

    // Calculate total
    const total = cartItems.reduce((sum, item) => {
      const price = item.discount_price || item.price;
      return sum + (price * item.quantity);
    }, 0);

    // Create order
    const [order] = await conn.query(`
      INSERT INTO orders (buyer_id, total_amount, shipping_address, payment_method)
      VALUES (?, ?, ?, ?)
    `, [userId, total, shipping_address, payment_method]);

    const orderId = order.insertId;
    const fee = parseFloat(process.env.PLATFORM_FEE_PERCENT || 10) / 100;

    // Create order items + payouts
    for (const item of cartItems) {
      const price = item.discount_price || item.price;
      const subtotal = price * item.quantity;

      await conn.query(`
        INSERT INTO order_items (order_id, product_id, vendor_id, quantity, unit_price, subtotal)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [orderId, item.product_id, item.vendor_id, item.quantity, price, subtotal]);

      await conn.query(`
        INSERT INTO payouts (vendor_id, order_id, amount, platform_fee, net_amount)
        VALUES (?, ?, ?, ?, ?)
      `, [item.vendor_id, orderId, subtotal, subtotal * fee, subtotal * (1 - fee)]);

      // Deduct stock
      await conn.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_id]);
    }

    // Clear cart
    await conn.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);

    await conn.commit();
    res.status(201).json({ message: 'Order placed successfully', orderId });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// ─── GET /api/orders ─── Buyer: own orders
router.get('/', authenticate, authorize('buyer'), async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT o.*, COUNT(oi.id) as item_count
      FROM orders o LEFT JOIN order_items oi ON oi.order_id = o.id
      WHERE o.buyer_id = ? GROUP BY o.id ORDER BY o.created_at DESC
    `, [req.user.id]);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/orders/:id ─── Buyer: order detail
router.get('/:id', authenticate, async (req, res) => {
  try {
    const [order] = await db.query('SELECT * FROM orders WHERE id = ? AND buyer_id = ?', [req.params.id, req.user.id]);
    if (!order.length) return res.status(404).json({ error: 'Order not found' });

    const [items] = await db.query(`
      SELECT oi.*, p.name, p.slug, vp.shop_name
      FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      JOIN vendor_profiles vp ON vp.id = oi.vendor_id
      WHERE oi.order_id = ?
    `, [req.params.id]);

    res.json({ ...order[0], items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PATCH /api/orders/:id/status ─── Admin/Vendor: update order status
router.patch('/:id/status', authenticate, authorize('admin', 'vendor'), async (req, res) => {
  try {
    const { status } = req.body;
    await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Order status updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
