const Product = require('../models/Product');

async function createProduct({ name, sku, category, unit, initialStock = 0 }) {
  const product = await Product.create({ name, sku, category, unit, stock: initialStock });
  return product;
}

async function getProducts() {
  return Product.find().sort({ created_at: -1 });
}

module.exports = { createProduct, getProducts };
