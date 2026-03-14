const moveHistoryService = require('../services/moveHistoryService');

function handle(res, promise, successStatus = 200) {
  return promise
    .then((data) => res.status(successStatus).json(data))
    .catch((err) => res.status(err.status || 500).json({ error: err.message }));
}

exports.getAllMoveHistory = (req, res) =>
  handle(res, moveHistoryService.getAllMoveHistory());
