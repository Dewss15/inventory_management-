const Counter = require('../models/Counter');

const PREFIXES = {
  receipt: 'WH/IN',
  delivery: 'WH/OUT',
};

const COUNTER_NAMES = {
  receipt: 'receipt_seq',
  delivery: 'delivery_seq',
};

async function generateReference(type) {
  const prefix = PREFIXES[type];
  const counterName = COUNTER_NAMES[type];

  if (!prefix || !counterName) {
    throw new Error(`Unknown reference type: ${type}`);
  }

  const counter = await Counter.findOneAndUpdate(
    { name: counterName },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const padded = String(counter.seq).padStart(4, '0');
  return `${prefix}/${padded}`;
}

module.exports = { generateReference };
