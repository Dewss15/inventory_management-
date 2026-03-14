const stockService = require('../services/stockService');

function handle(res, promise, successStatus = 200) {
  return promise
    .then((data) => res.status(successStatus).json(data))
    .catch((err) => res.status(err.status || 500).json({ error: err.message }));
}

exports.getAllStock = (req, res) =>
  handle(res, stockService.getAllStock());

exports.updateStock = (req, res) =>
  handle(res, stockService.updateStock(req.params.id, req.body));
