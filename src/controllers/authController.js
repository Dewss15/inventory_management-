const authService = require('../services/authService');

async function signup(req, res) {
  try {
    const result = await authService.signup(req.body);
    return res.status(201).json(result);
  } catch (err) {
    return res.status(err.status || 400).json({ error: err.message });
  }
}

async function login(req, res) {
  try {
    const result = await authService.login(req.body);
    return res.json(result);
  } catch (err) {
    return res.status(err.status || 400).json({ error: err.message });
  }
}

async function forgotPassword(req, res) {
  try {
    const result = await authService.forgotPassword(req.body);
    return res.json(result);
  } catch (err) {
    return res.status(err.status || 400).json({ error: err.message });
  }
}

async function verifyOtp(req, res) {
  try {
    const result = await authService.verifyOtp(req.body);
    return res.json(result);
  } catch (err) {
    return res.status(err.status || 400).json({ error: err.message });
  }
}

async function resetPassword(req, res) {
  try {
    const result = await authService.resetPassword(req.body);
    return res.json(result);
  } catch (err) {
    return res.status(err.status || 400).json({ error: err.message });
  }
}

module.exports = { signup, login, forgotPassword, verifyOtp, resetPassword };
