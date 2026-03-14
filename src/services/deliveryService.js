const Delivery = require('../models/Delivery');
const Product = require('../models/Product');
const MoveHistory = require('../models/MoveHistory');
const { generateReference } = require('../utils/referenceGenerator');

const VALID_TRANSITIONS = {
  Draft:   ['Waiting', 'Ready'],
  Waiting: ['Ready'],
  Ready:   ['Done'],
  Done:    [],
};

function createError(message, status = 400) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function populate(query) {
  return query.populate('products.product_id');
}

async function createDelivery({ delivery_address, schedule_date, products }) {
  const reference = await generateReference('delivery');

  let status = 'Draft';
  for (const item of products) {
    const product = await Product.findById(item.product_id);
    if (!product || product.stock < item.quantity) {
      status = 'Waiting';
      break;
    }
  }

  const delivery = await Delivery.create({
    reference,
    delivery_address,
    schedule_date,
    products,
    status,
  });
  return populate(Delivery.findById(delivery._id));
}

async function getAllDeliveries() {
  return populate(Delivery.find().sort({ created_at: -1 }));
}

async function getDeliveryById(id) {
  const delivery = await populate(Delivery.findById(id));
  if (!delivery) throw createError('Delivery not found', 404);
  return delivery;
}

async function updateStatus(id, newStatus) {
  const delivery = await Delivery.findById(id);
  if (!delivery) throw createError('Delivery not found', 404);

  const allowed = VALID_TRANSITIONS[delivery.status];
  if (!allowed.includes(newStatus)) {
    throw createError(`Invalid status transition: ${delivery.status} → ${newStatus}`);
  }

  if (newStatus === 'Done') {
    await _processDone(delivery);
  }

  delivery.status = newStatus;
  await delivery.save();
  return populate(Delivery.findById(id));
}

async function _processDone(delivery) {
  for (const item of delivery.products) {
    await Product.findByIdAndUpdate(
      item.product_id,
      { $inc: { stock: -item.quantity } }
    );

    await MoveHistory.create({
      reference:     delivery.reference,
      product_id:    item.product_id,
      date:          new Date(),
      contact:       delivery.delivery_address,
      from_location: 'Warehouse',
      to_location:   delivery.delivery_address,
      quantity:      -item.quantity,
      status:        'Done',
    });
  }
}

module.exports = { createDelivery, getAllDeliveries, getDeliveryById, updateStatus };
