const express = require('express');
const cors = require('cors');
require('dotenv').config();

const chaosMiddleware = require('./middleware/chaos');
const orderService = require('./services/orderService');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check (bypasses chaos simulation)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Chaos middleware: injects 200ms-3s latency and 10% failure rate on all /api routes
app.use('/api', chaosMiddleware);

// GET /api/orders: search, filter, sort, paginate
app.get('/api/orders', async (req, res, next) => {
  try {
    const response = await orderService.getOrders(req.query);
    res.json(response);
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/:id: single order details
app.get('/api/orders/:id', async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: `Order ${req.params.id} not found.` });
    }
    res.json(order);
  } catch (err) {
    next(err);
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('API Error:', err.message);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
