const mongoose = require('mongoose');

const receiptProductSchema = new mongoose.Schema(
  {
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity:   { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const receiptSchema = new mongoose.Schema({
  reference:        { type: String, required: true, unique: true },
  receive_from:     { type: String, required: true },
  schedule_date:    { type: Date, required: true },
  status:           { type: String, enum: ['Draft', 'Ready', 'Done'], default: 'Draft' },
  responsible_user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products:         { type: [receiptProductSchema], required: true },
  created_at:       { type: Date, default: Date.now },
});

module.exports = mongoose.model('Receipt', receiptSchema);
