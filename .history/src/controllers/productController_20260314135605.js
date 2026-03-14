const productService = require('../services/productService');

async function createProduct(req, res) {
  try {
    const product = await productService.createProduct(req.body);
    return res.status(201).json(product);
  } catch (err) {
    return res.status(err.status || 400).json({ error: err.message });
  }
}

async function getProducts(req, res) {
  try {
    const products = await productService.getProducts();
    return res.json(products);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = { createProduct, getProducts };
