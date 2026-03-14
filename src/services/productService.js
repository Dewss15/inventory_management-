const Product = require('../models/Product');

function createError(message, status = 400) {
  const err = new Error(message);
  err.status = status;
  return err;
}

async function createProduct({ name, sku, category, unit, initialStock = 0 }) {
  const exists = await Product.findOne({ sku });
  if (exists) throw createError('SKU already exists', 409);

  const product = await Product.create({ name, sku, category, unit, stock: initialStock });
  return product;
}

async function getAllProducts() {
  return await Product.find().sort({ created_at: -1 });
}

module.exports = { createProduct, getAllProducts };
