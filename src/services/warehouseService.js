const Warehouse = require('../models/Warehouse');

function createError(message, status = 400) {
  const err = new Error(message);
  err.status = status;
  return err;
}

async function createWarehouse({ name, short_code, address }) {
  const exists = await Warehouse.findOne({ short_code: short_code.toUpperCase() });
  if (exists) throw createError('Short code already in use', 409);

  return await Warehouse.create({ name, short_code: short_code.toUpperCase(), address });
}

async function getAllWarehouses() {
  return await Warehouse.find().sort({ created_at: -1 });
}

module.exports = { createWarehouse, getAllWarehouses };
