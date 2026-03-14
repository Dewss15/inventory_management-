const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  short_code: { type: String, required: true, unique: true, uppercase: true },
  address:    { type: String },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Warehouse', warehouseSchema);
