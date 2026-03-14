const warehouseService = require('../services/warehouseService');

function handle(res, promise, successStatus = 200) {
  return promise
    .then((data) => res.status(successStatus).json(data))
    .catch((err) => res.status(err.status || 500).json({ error: err.message }));
}

exports.createWarehouse = (req, res) =>
  handle(res, warehouseService.createWarehouse(req.body), 201);

exports.getAllWarehouses = (req, res) =>
  handle(res, warehouseService.getAllWarehouses());
