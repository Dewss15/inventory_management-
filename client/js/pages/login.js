import { api } from '../api.js';
import { auth } from '../auth.js';
import { navigate } from '../router.js';
import { showToast } from '../components/toast.js';

export async function render(container) {
  container.innerHTML = `
    <div class="auth-card">
      <div class="auth-brand">
        <h1>Flux IMS</h1>
        <p>Inventory Management System</p>
      </div>
      <h2>Welcome back</h2>
      <p class="subtitle">Log in to your account</p>
      <form id="login-form">
        <div class="form-group">
          <label for="login_id">Login ID</label>
          <input type="text" id="login_id" name="login_id" placeholder="Enter your login ID" required minlength="6" maxlength="12" autocomplete="username">
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input type="password" id="password" name="password" placeholder="Enter your password" required autocomplete="current-password">
        </div>
        <button type="submit" class="btn btn-primary">Log In</button>
      </form>
      <div class="auth-footer">
        <a href="#/forgot-password">Forgot password?</a>
        <br><br>
        Don't have an account? <a href="#/signup">Sign up</a>
      </div>
    </div>
  `;

  document.getElementById('login-form').onsubmit = async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Logging in...';
    try {
      const data = await api.post('/auth/login', {
        login_id: document.getElementById('login_id').value.trim(),
        password: document.getElementById('password').value,
      });
      auth.setToken(data.token);
      auth.setUser(data.user);
      navigate('#/dashboard');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Log In';
    }
  };
}
