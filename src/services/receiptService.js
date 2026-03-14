const Receipt = require('../models/Receipt');
const Product = require('../models/Product');
const { generateReference } = require('../utils/referenceGenerator');

const STATUS_FLOW = ['Draft', 'Ready', 'Done'];

function createError(message, status = 400) {
  const err = new Error(message);
  err.status = status;
  return err;
}

async function createReceipt({ receive_from, schedule_date, products }, userId) {
  const reference = await generateReference('receipt');
  const receipt = await Receipt.create({
    reference,
    receive_from,
    schedule_date,
    products,
    responsible_user: userId,
    status: 'Draft',
  });
  return receipt;
}

async function updateReceiptStatus(id, newStatus) {
  const receipt = await Receipt.findById(id);
  if (!receipt) throw createError('Receipt not found', 404);

  const currentIndex = STATUS_FLOW.indexOf(receipt.status);
  const nextIndex = STATUS_FLOW.indexOf(newStatus);

  if (nextIndex === -1) throw createError('Invalid status');
  if (nextIndex !== currentIndex + 1) {
    throw createError(`Cannot transition from ${receipt.status} to ${newStatus}`);
  }

  receipt.status = newStatus;

  if (newStatus === 'Done') {
    for (const item of receipt.products) {
      await Product.findByIdAndUpdate(item.product_id, {
        $inc: { stock: item.quantity },
      });
    }
  }

  await receipt.save();
  return receipt;
}

async function getReceipts() {
  return Receipt.find()
    .populate('products.product_id', 'name sku unit')
    .populate('responsible_user', 'login_id email')
    .sort({ created_at: -1 });
}

module.exports = { createReceipt, updateReceiptStatus, getReceipts };
