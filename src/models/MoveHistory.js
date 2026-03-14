const mongoose = require('mongoose');

const moveHistorySchema = new mongoose.Schema({
  reference:     { type: String, required: true },
  product_id:    { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  date:          { type: Date, required: true },
  contact:       { type: String, required: true },
  from_location: { type: String, required: true },
  to_location:   { type: String, required: true },
  quantity:      { type: Number, required: true },
  status:        { type: String, default: 'Done' },
});

module.exports = mongoose.model('MoveHistory', moveHistorySchema);
