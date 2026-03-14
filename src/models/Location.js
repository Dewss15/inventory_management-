const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  warehouse_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  created_at:   { type: Date, default: Date.now },
});

module.exports = mongoose.model('Location', locationSchema);
