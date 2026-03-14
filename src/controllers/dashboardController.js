const dashboardService = require('../services/dashboardService');

function handle(res, promise, successStatus = 200) {
  return promise
    .then((data) => res.status(successStatus).json(data))
    .catch((err) => res.status(err.status || 500).json({ error: err.message }));
}

exports.getDashboardStats = (req, res) =>
  handle(res, dashboardService.getDashboardStats());
