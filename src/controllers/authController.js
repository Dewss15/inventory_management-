const authService = require('../services/authService');

function handle(res, promise, successStatus = 200) {
  return promise
    .then((data) => res.status(successStatus).json(data))
    .catch((err) => res.status(err.status || 500).json({ error: err.message }));
}

exports.signup = (req, res) =>
  handle(res, authService.signup(req.body), 201);

exports.login = (req, res) =>
  handle(res, authService.login(req.body));

exports.forgotPassword = (req, res) =>
  handle(res, authService.forgotPassword(req.body));

exports.verifyOtp = (req, res) =>
  handle(res, authService.verifyOtp(req.body));

exports.resetPassword = (req, res) =>
  handle(res, authService.resetPassword(req.body));
