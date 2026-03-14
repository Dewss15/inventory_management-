const dashboardService = require('../services/dashboardService');

async function getDashboard(req, res) {
  try {
    const stats = await dashboardService.getDashboard();
    return res.json(stats);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

module.exports = { getDashboard };
