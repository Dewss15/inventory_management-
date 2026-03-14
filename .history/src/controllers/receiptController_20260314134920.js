const receiptService = require('../services/receiptService');

async function createReceipt(req, res) {
  try {
    const receipt = await receiptService.createReceipt(req.body, req.user.id);
    return res.status(201).json(receipt);
  } catch (err) {
    return res.status(err.status || 400).json({ error: err.message });
  }
}

async function updateReceiptStatus(req, res) {
  try {
    const receipt = await receiptService.updateReceiptStatus(req.params.id, req.body.status);
    return res.json(receipt);
  } catch (err) {
    return res.status(err.status || 400).json({ error: err.message });
  }
}

async function getReceipts(req, res) {
  try {
    const receipts = await receiptService.getReceipts();
    return res.json(receipts);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = { createReceipt, updateReceiptStatus, getReceipts };
