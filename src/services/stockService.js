const Stock = require('../models/Stock');

function createError(message, status = 400) {
  const err = new Error(message);
  err.status = status;
  return err;
}

async function getAllStock() {
  const records = await Stock.find()
    .populate('product_id')
    .populate('warehouse_id')
    .populate('location_id');

  return records.map((s) => ({
    _id:          s._id,
    product:      s.product_id,
    warehouse:    s.warehouse_id,
    location:     s.location_id,
    per_unit_cost: s.unit_cost,
    on_hand:      s.quantity,
    free_to_use:  s.quantity,
  }));
}

async function updateStock(id, { quantity, unit_cost }) {
  const update = {};
  if (quantity  !== undefined) update.quantity  = quantity;
  if (unit_cost !== undefined) update.unit_cost = unit_cost;

  const stock = await Stock.findByIdAndUpdate(id, update, { new: true, runValidators: true })
    .populate('product_id')
    .populate('warehouse_id')
    .populate('location_id');

  if (!stock) throw createError('Stock record not found', 404);

  return {
    _id:           stock._id,
    product:       stock.product_id,
    warehouse:     stock.warehouse_id,
    location:      stock.location_id,
    per_unit_cost: stock.unit_cost,
    on_hand:       stock.quantity,
    free_to_use:   stock.quantity,
  };
}

module.exports = { getAllStock, updateStock };
