const Location = require('../models/Location');
const Warehouse = require('../models/Warehouse');

function createError(message, status = 400) {
  const err = new Error(message);
  err.status = status;
  return err;
}

async function createLocation({ name, warehouse_id }) {
  const warehouse = await Warehouse.findById(warehouse_id);
  if (!warehouse) throw createError('Warehouse not found', 404);

  return await Location.create({ name, warehouse_id });
}

async function getAllLocations() {
  return await Location.find().populate('warehouse_id').sort({ created_at: -1 });
}

module.exports = { createLocation, getAllLocations };
