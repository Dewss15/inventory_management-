require('dotenv').config();
const express = require('express');
const path    = require('path');

const authRoutes        = require('./routes/authRoutes');
const productRoutes     = require('./routes/productRoutes');
const receiptRoutes     = require('./routes/receiptRoutes');
const deliveryRoutes    = require('./routes/deliveryRoutes');
const warehouseRoutes   = require('./routes/warehouseRoutes');
const locationRoutes    = require('./routes/locationRoutes');
const stockRoutes       = require('./routes/stockRoutes');
const moveHistoryRoutes = require('./routes/moveHistoryRoutes');
const dashboardRoutes   = require('./routes/dashboardRoutes');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'client')));

// Public routes
app.use('/auth', authRoutes);

// Protected routes (auth applied inside each router)
app.use('/products',     productRoutes);
app.use('/receipts',     receiptRoutes);
app.use('/deliveries',   deliveryRoutes);
app.use('/warehouses',   warehouseRoutes);
app.use('/locations',    locationRoutes);
app.use('/stock',        stockRoutes);
app.use('/move-history', moveHistoryRoutes);
app.use('/dashboard',    dashboardRoutes);

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

module.exports = app;
