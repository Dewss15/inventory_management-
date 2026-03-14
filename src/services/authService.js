const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OtpCode = require('../models/OtpCode');

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{9,}$/;

function createError(message, status = 400) {
  const err = new Error(message);
  err.status = status;
  return err;
}

async function signup({ login_id, email, password }) {
  if (!login_id || login_id.length < 6 || login_id.length > 12) {
    throw createError('loginId must be between 6 and 12 characters');
  }
  if (!PASSWORD_REGEX.test(password)) {
    throw createError(
      'Password must be more than 8 characters and contain uppercase, lowercase, and a special character'
    );
  }

  const existing = await User.findOne({ login_id });
  if (existing) throw createError('Login ID already taken');

  const password_hash = await bcrypt.hash(password, 10);
  const user = await User.create({ login_id, email, password_hash });
  return { id: user._id, login_id: user.login_id, email: user.email };
}

async function login({ login_id, password }) {
  const user = await User.findOne({ login_id });
  if (!user) throw createError('Invalid Login ID or Password', 401);

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) throw createError('Invalid Login ID or Password', 401);

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
  return { token };
}

async function forgotPassword({ email }) {
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const expires_at = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  await OtpCode.deleteMany({ email });
  await OtpCode.create({ email, otp, expires_at });

  // In production, send otp via email. For now, return it in response.
  return { message: 'OTP sent', otp };
}

async function verifyOtp({ email, otp }) {
  const record = await OtpCode.findOne({ email, otp });
  if (!record) throw createError('Invalid OTP');
  if (record.expires_at < new Date()) {
    await record.deleteOne();
    throw createError('OTP has expired');
  }
  return { message: 'OTP verified' };
}

async function resetPassword({ email, otp, newPassword }) {
  const record = await OtpCode.findOne({ email, otp });
  if (!record) throw createError('Invalid OTP');
  if (record.expires_at < new Date()) {
    await record.deleteOne();
    throw createError('OTP has expired');
  }

  if (!PASSWORD_REGEX.test(newPassword)) {
    throw createError(
      'Password must be more than 8 characters and contain uppercase, lowercase, and a special character'
    );
  }

  const password_hash = await bcrypt.hash(newPassword, 10);
  await User.findOneAndUpdate({ email }, { password_hash });
  await record.deleteOne();

  return { message: 'Password reset successfully' };
}

module.exports = { signup, login, forgotPassword, verifyOtp, resetPassword };
