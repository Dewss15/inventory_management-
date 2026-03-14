const deliveryService = require('../services/deliveryService');

async function createDelivery(req, res) {
  try {
    const delivery = await deliveryService.createDelivery(req.body);
    return res.status(201).json(delivery);
  } catch (err) {
    return res.status(err.status || 400).json({ error: err.message });
  }
}

async function updateDeliveryStatus(req, res) {
  try {
    const delivery = await deliveryService.updateDeliveryStatus(req.params.id, req.body.status);
    return res.json(delivery);
  } catch (err) {
    return res.status(err.status || 400).json({ error: err.message });
  }
}

async function getDeliveries(req, res) {
  try {
    const deliveries = await deliveryService.getDeliveries();
    return res.json(deliveries);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = { createDelivery, updateDeliveryStatus, getDeliveries };
