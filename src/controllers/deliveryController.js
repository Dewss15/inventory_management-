const deliveryService = require('../services/deliveryService');

function handle(res, promise, successStatus = 200) {
  return promise
    .then((data) => res.status(successStatus).json(data))
    .catch((err) => res.status(err.status || 500).json({ error: err.message }));
}

exports.createDelivery = (req, res) =>
  handle(res, deliveryService.createDelivery(req.body), 201);

exports.getAllDeliveries = (req, res) =>
  handle(res, deliveryService.getAllDeliveries());

exports.getDeliveryById = (req, res) =>
  handle(res, deliveryService.getDeliveryById(req.params.id));

exports.updateStatus = (req, res) =>
  handle(res, deliveryService.updateStatus(req.params.id, req.body.status));
