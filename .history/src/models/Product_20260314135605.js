const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  sku:        { type: String, required: true, unique: true },
  category:   { type: String, required: true },
  unit:       { type: String, required: true },
  stock:      { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Product', productSchema);
