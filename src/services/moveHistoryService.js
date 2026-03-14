const MoveHistory = require('../models/MoveHistory');

async function getAllMoveHistory() {
  return await MoveHistory.find()
    .populate('product_id')
    .sort({ date: -1 });
}

module.exports = { getAllMoveHistory };
