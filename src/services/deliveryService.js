const Delivery = require('../models/Delivery');
const Product = require('../models/Product');
const { generateReference } = require('../utils/referenceGenerator');

const STATUS_FLOW = ['Draft', 'Waiting', 'Ready', 'Done'];

function createError(message, status = 400) {
  const err = new Error(message);
  err.status = status;
  return err;
}

async function createDelivery({ delivery_address, schedule_date, products }) {
  const reference = await generateReference('delivery');

  // Check stock for each product; if any is insufficient → Waiting
  let status = 'Draft';
  for (const item of products) {
    const product = await Product.findById(item.product_id);
    if (!product) throw createError(`Product ${item.product_id} not found`, 404);
    if (item.quantity > product.stock) {
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
  return delivery;
}

async function updateDeliveryStatus(id, newStatus) {
  const delivery = await Delivery.findById(id);
  if (!delivery) throw createError('Delivery not found', 404);

  const currentIndex = STATUS_FLOW.indexOf(delivery.status);
  const nextIndex = STATUS_FLOW.indexOf(newStatus);

  if (nextIndex === -1) throw createError('Invalid status');
  if (nextIndex !== currentIndex + 1) {
    throw createError(`Cannot transition from ${delivery.status} to ${newStatus}`);
  }

  delivery.status = newStatus;

  if (newStatus === 'Done') {
    for (const item of delivery.products) {
      await Product.findByIdAndUpdate(item.product_id, {
        $inc: { stock: -item.quantity },
      });
    }
  }

  await delivery.save();
  return delivery;
}

async function getDeliveries() {
  return Delivery.find()
    .populate('products.product_id', 'name sku unit')
    .sort({ created_at: -1 });
}

module.exports = { createDelivery, updateDeliveryStatus, getDeliveries };
