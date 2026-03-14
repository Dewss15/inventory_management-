const Receipt = require('../models/Receipt');
const Delivery = require('../models/Delivery');

async function getDashboard() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    receiptTotal,
    receiptLate,
    receiptToReceive,
    deliveryTotal,
    deliveryLate,
    deliveryToDeliver,
    deliveryWaiting,
  ] = await Promise.all([
    Receipt.countDocuments(),
    Receipt.countDocuments({ schedule_date: { $lt: today }, status: { $ne: 'Done' } }),
    Receipt.countDocuments({ status: { $in: ['Draft', 'Ready'] } }),
    Delivery.countDocuments(),
    Delivery.countDocuments({ schedule_date: { $lt: today }, status: { $ne: 'Done' } }),
    Delivery.countDocuments({ status: { $in: ['Draft', 'Ready'] } }),
    Delivery.countDocuments({ status: 'Waiting' }),
  ]);

  return {
    receipts: {
      toReceive: receiptToReceive,
      late: receiptLate,
      operations: receiptTotal,
    },
    deliveries: {
      toDeliver: deliveryToDeliver,
      late: deliveryLate,
      waiting: deliveryWaiting,
      operations: deliveryTotal,
    },
  };
}

module.exports = { getDashboard };
