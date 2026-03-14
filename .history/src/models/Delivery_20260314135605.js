const mongoose = require('mongoose');

const deliveryProductSchema = new mongoose.Schema(
  {
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity:   { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const deliverySchema = new mongoose.Schema({
  reference:        { type: String, required: true, unique: true },
  delivery_address: { type: String, required: true },
  schedule_date:    { type: Date, required: true },
  status:           { type: String, enum: ['Draft', 'Waiting', 'Ready', 'Done'], default: 'Draft' },
  products:         { type: [deliveryProductSchema], required: true },
  created_at:       { type: Date, default: Date.now },
});

module.exports = mongoose.model('Delivery', deliverySchema);
