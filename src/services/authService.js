const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OtpCode = require('../models/OtpCode');
const transporter = require('../config/mailer');

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{9,}$/;

function createError(message, status = 400) {
  const err = new Error(message);
  err.status = status;
  return err;
}

async function signup({ login_id, email, password }) {
  if (!login_id || login_id.length < 6 || login_id.length > 12) {
    throw createError('Login ID must be between 6 and 12 characters');
  }
  if (!PASSWORD_REGEX.test(password)) {
    throw createError(
      'Password must be more than 8 characters and contain uppercase, lowercase, and a special character'
    );
  }

  const exists = await User.findOne({ login_id });
  if (exists) throw createError('Login ID already taken', 409);

  const emailExists = await User.findOne({ email: email.toLowerCase() });
  if (emailExists) throw createError('Email already registered', 409);

  const password_hash = await bcrypt.hash(password, 10);
  const user = await User.create({ login_id, email: email.toLowerCase(), password_hash });

  return { id: user._id, login_id: user.login_id, email: user.email };
}

async function login({ login_id, password }) {
  const user = await User.findOne({ login_id });
  if (!user) throw createError('Invalid Login ID or Password', 401);

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) throw createError('Invalid Login ID or Password', 401);

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  return { token, user: { id: user._id, login_id: user.login_id, email: user.email } };
}

async function forgotPassword({ email }) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw createError('No account found with that email', 404);

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const expires_at = new Date(
    Date.now() + (parseInt(process.env.OTP_EXPIRES_MINUTES) || 5) * 60 * 1000
  );

  await OtpCode.deleteMany({ email: email.toLowerCase() });
  await OtpCode.create({ email: email.toLowerCase(), otp, expires_at });

  transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Flux IMS — Password Reset OTP',
    text: `Your OTP is: ${otp}\n\nThis code expires in ${process.env.OTP_EXPIRES_MINUTES || 5} minutes.`,
    html: `<p>Your OTP is: <strong>${otp}</strong></p><p>This code expires in ${process.env.OTP_EXPIRES_MINUTES || 5} minutes.</p>`,
  }).catch((err) => console.error('Failed to send OTP email:', err.message));

  return { message: 'OTP sent to your email' };
}

async function verifyOtp({ email, otp }) {
  const record = await OtpCode.findOne({ email: email.toLowerCase(), otp });
  if (!record) throw createError('Invalid or expired OTP');
  if (record.expires_at < new Date()) {
    await record.deleteOne();
    throw createError('OTP has expired');
  }
  return { message: 'OTP verified' };
}

async function resetPassword({ email, otp, newPassword }) {
  const record = await OtpCode.findOne({ email: email.toLowerCase(), otp });
  if (!record) throw createError('Invalid or expired OTP');
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
  await User.findOneAndUpdate({ email: email.toLowerCase() }, { password_hash });
  await record.deleteOne();

  return { message: 'Password reset successfully' };
}

module.exports = { signup, login, forgotPassword, verifyOtp, resetPassword };
