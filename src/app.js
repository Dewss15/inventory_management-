require('dotenv').config();
const express = require('express');
const { connectDB } = require('./config/db');

const authRoutes      = require('./routes/authRoutes');
const productRoutes   = require('./routes/productRoutes');
const receiptRoutes   = require('./routes/receiptRoutes');
const deliveryRoutes  = require('./routes/deliveryRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
app.use(express.json());

app.use('/auth',      authRoutes);
app.use('/products',  productRoutes);
app.use('/receipts',  receiptRoutes);
app.use('/deliveries', deliveryRoutes);
app.use('/dashboard', dashboardRoutes);

// 404
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });

module.exports = app;
