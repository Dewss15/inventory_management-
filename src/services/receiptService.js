const Receipt = require('../models/Receipt');
const Product = require('../models/Product');
const MoveHistory = require('../models/MoveHistory');
const { generateReference } = require('../utils/referenceGenerator');

const VALID_TRANSITIONS = { Draft: ['Ready'], Ready: ['Done'], Done: [] };

function createError(message, status = 400) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function populate(query) {
  return query
    .populate('responsible_user', 'login_id email')
    .populate('products.product_id');
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
  return populate(Receipt.findById(receipt._id));
}

async function getAllReceipts() {
  return populate(Receipt.find().sort({ created_at: -1 }));
}

async function getReceiptById(id) {
  const receipt = await populate(Receipt.findById(id));
  if (!receipt) throw createError('Receipt not found', 404);
  return receipt;
}

async function updateStatus(id, newStatus) {
  const receipt = await Receipt.findById(id);
  if (!receipt) throw createError('Receipt not found', 404);

  const allowed = VALID_TRANSITIONS[receipt.status];
  if (!allowed.includes(newStatus)) {
    throw createError(`Invalid status transition: ${receipt.status} → ${newStatus}`);
  }

  if (newStatus === 'Done') {
    await _processDone(receipt);
  }

  receipt.status = newStatus;
  await receipt.save();
  return populate(Receipt.findById(id));
}

async function _processDone(receipt) {
  for (const item of receipt.products) {
    await Product.findByIdAndUpdate(
      item.product_id,
      { $inc: { stock: item.quantity } }
    );

    await MoveHistory.create({
      reference:     receipt.reference,
      product_id:    item.product_id,
      date:          new Date(),
      contact:       receipt.receive_from,
      from_location: 'Vendor',
      to_location:   'Warehouse',
      quantity:      item.quantity,
      status:        'Done',
    });
  }
}

module.exports = { createReceipt, getAllReceipts, getReceiptById, updateStatus };
