const mongoose = require('mongoose');

const otpCodeSchema = new mongoose.Schema({
  email:      { type: String, required: true },
  otp:        { type: String, required: true },
  expires_at: { type: Date, required: true },
});

otpCodeSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('OtpCode', otpCodeSchema);
