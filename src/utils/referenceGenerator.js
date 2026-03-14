const Counter = require('../models/Counter');

async function generateReference(type) {
  const key = type === 'receipt' ? 'WH_IN' : 'WH_OUT';
  const label = type === 'receipt' ? 'IN' : 'OUT';

  const counter = await Counter.findOneAndUpdate(
    { name: key },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const padded = String(counter.seq).padStart(4, '0');
  return `WH/${label}/${padded}`;
}

module.exports = { generateReference };
