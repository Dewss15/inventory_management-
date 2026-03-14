const receiptService = require('../services/receiptService');

function handle(res, promise, successStatus = 200) {
  return promise
    .then((data) => res.status(successStatus).json(data))
    .catch((err) => res.status(err.status || 500).json({ error: err.message }));
}

exports.createReceipt = (req, res) =>
  handle(res, receiptService.createReceipt(req.body, req.user.id), 201);

exports.getAllReceipts = (req, res) =>
  handle(res, receiptService.getAllReceipts());

exports.getReceiptById = (req, res) =>
  handle(res, receiptService.getReceiptById(req.params.id));

exports.updateStatus = (req, res) =>
  handle(res, receiptService.updateStatus(req.params.id, req.body.status));
