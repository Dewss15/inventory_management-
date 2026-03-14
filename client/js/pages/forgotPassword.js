import { api } from '../api.js';
import { navigate } from '../router.js';
import { showToast } from '../components/toast.js';

let step = 1;
let savedEmail = '';
let savedOtp = '';

function stepDots(active) {
  return `<div class="step-indicator">
    <div class="step-dot ${active >= 1 ? 'active' : ''}"></div>
    <div class="step-dot ${active >= 2 ? 'active' : ''}"></div>
    <div class="step-dot ${active >= 3 ? 'active' : ''}"></div>
  </div>`;
}

function renderStep1(container) {
  container.innerHTML = `
    <div class="auth-card">
      <div class="auth-brand"><h1>Flux IMS</h1><p>Password Recovery</p></div>
      ${stepDots(1)}
      <h2>Forgot password?</h2>
      <p class="subtitle">Enter your email to receive an OTP</p>
      <form id="fp-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" placeholder="you@example.com" required>
        </div>
        <button type="submit" class="btn btn-primary">Send OTP</button>
      </form>
      <div class="auth-footer"><a href="#/login">Back to login</a></div>
    </div>
  `;
  document.getElementById('fp-form').onsubmit = async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.disabled = true;
    btn.textContent = 'Sending...';
    try {
      savedEmail = document.getElementById('email').value.trim();
      await api.post('/auth/forgot-password', { email: savedEmail });
      showToast('OTP sent to your email', 'success');
      step = 2;
      renderStep2(container);
    } catch (err) {
      showToast(err.message, 'error');
      btn.disabled = false;
      btn.textContent = 'Send OTP';
    }
  };
}

function renderStep2(container) {
  container.innerHTML = `
    <div class="auth-card">
      <div class="auth-brand"><h1>Flux IMS</h1><p>Password Recovery</p></div>
      ${stepDots(2)}
      <h2>Verify OTP</h2>
      <p class="subtitle">Enter the 6-digit code sent to ${savedEmail}</p>
      <form id="otp-form">
        <div class="form-group">
          <label for="otp">OTP Code</label>
          <input type="text" id="otp" placeholder="123456" required maxlength="6" pattern="[0-9]{6}" inputmode="numeric" style="text-align:center;font-size:20px;letter-spacing:6px;font-weight:600">
        </div>
        <button type="submit" class="btn btn-primary">Verify</button>
      </form>
      <div class="auth-footer"><a href="#/login">Back to login</a></div>
    </div>
  `;
  document.getElementById('otp-form').onsubmit = async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.disabled = true;
    btn.textContent = 'Verifying...';
    try {
      savedOtp = document.getElementById('otp').value.trim();
      await api.post('/auth/verify-otp', { email: savedEmail, otp: savedOtp });
      showToast('OTP verified!', 'success');
      step = 3;
      renderStep3(container);
    } catch (err) {
      showToast(err.message, 'error');
      btn.disabled = false;
      btn.textContent = 'Verify';
    }
  };
}

function renderStep3(container) {
  container.innerHTML = `
    <div class="auth-card">
      <div class="auth-brand"><h1>Flux IMS</h1><p>Password Recovery</p></div>
      ${stepDots(3)}
      <h2>Reset password</h2>
      <p class="subtitle">Enter your new password</p>
      <form id="reset-form">
        <div class="form-group">
          <label for="newPassword">New Password</label>
          <input type="password" id="newPassword" placeholder="New password" required>
          <div class="form-hint">Must be 9+ characters with uppercase, lowercase, and a special character</div>
        </div>
        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input type="password" id="confirmPassword" placeholder="Confirm password" required>
        </div>
        <button type="submit" class="btn btn-primary">Reset Password</button>
      </form>
      <div class="auth-footer"><a href="#/login">Back to login</a></div>
    </div>
  `;
  document.getElementById('reset-form').onsubmit = async (e) => {
    e.preventDefault();
    const pw  = document.getElementById('newPassword').value;
    const cpw = document.getElementById('confirmPassword').value;
    if (pw !== cpw) { showToast('Passwords do not match', 'error'); return; }
    const btn = e.target.querySelector('button');
    btn.disabled = true;
    btn.textContent = 'Resetting...';
    try {
      await api.post('/auth/reset-password', { email: savedEmail, otp: savedOtp, newPassword: pw });
      showToast('Password reset successfully!', 'success');
      step = 1;
      navigate('#/login');
    } catch (err) {
      showToast(err.message, 'error');
      btn.disabled = false;
      btn.textContent = 'Reset Password';
    }
  };
}

export async function render(container) {
  step = 1;
  savedEmail = '';
  savedOtp = '';
  renderStep1(container);
}
