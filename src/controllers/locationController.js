const locationService = require('../services/locationService');

function handle(res, promise, successStatus = 200) {
  return promise
    .then((data) => res.status(successStatus).json(data))
    .catch((err) => res.status(err.status || 500).json({ error: err.message }));
}

exports.createLocation = (req, res) =>
  handle(res, locationService.createLocation(req.body), 201);

exports.getAllLocations = (req, res) =>
  handle(res, locationService.getAllLocations());
