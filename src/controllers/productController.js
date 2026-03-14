const productService = require('../services/productService');

function handle(res, promise, successStatus = 200) {
  return promise
    .then((data) => res.status(successStatus).json(data))
    .catch((err) => res.status(err.status || 500).json({ error: err.message }));
}

exports.createProduct = (req, res) =>
  handle(res, productService.createProduct(req.body), 201);

exports.getAllProducts = (req, res) =>
  handle(res, productService.getAllProducts());
