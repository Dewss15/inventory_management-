const Receipt = require('../models/Receipt');
const Delivery = require('../models/Delivery');

async function getDashboardStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    receiptsToReceive,
    receiptsLate,
    receiptsOperations,
    deliveriesToDeliver,
    deliveriesLate,
    deliveriesWaiting,
    deliveriesOperations,
  ] = await Promise.all([
    Receipt.countDocuments({ status: { $ne: 'Done' } }),
    Receipt.countDocuments({ status: { $ne: 'Done' }, schedule_date: { $lt: today } }),
    Receipt.countDocuments({ status: { $ne: 'Done' }, schedule_date: { $gte: today } }),
    Delivery.countDocuments({ status: { $ne: 'Done' } }),
    Delivery.countDocuments({ status: { $ne: 'Done' }, schedule_date: { $lt: today } }),
    Delivery.countDocuments({ status: 'Waiting' }),
    Delivery.countDocuments({ status: { $ne: 'Done' }, schedule_date: { $gte: today } }),
  ]);

  return {
    receipts: {
      toReceive:  receiptsToReceive,
      late:       receiptsLate,
      operations: receiptsOperations,
    },
    deliveries: {
      toDeliver:  deliveriesToDeliver,
      late:       deliveriesLate,
      waiting:    deliveriesWaiting,
      operations: deliveriesOperations,
    },
  };
}

module.exports = { getDashboardStats };
