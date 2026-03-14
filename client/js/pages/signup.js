import { api } from '../api.js';
import { navigate } from '../router.js';
import { showToast } from '../components/toast.js';

export async function render(container) {
  container.innerHTML = `
    <div class="auth-card">
      <div class="auth-brand">
        <h1>Flux IMS</h1>
        <p>Inventory Management System</p>
      </div>
      <h2>Create account</h2>
      <p class="subtitle">Get started with Flux IMS</p>
      <form id="signup-form">
        <div class="form-group">
          <label for="login_id">Login ID</label>
          <input type="text" id="login_id" name="login_id" placeholder="6-12 characters" required minlength="6" maxlength="12">
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" name="email" placeholder="you@example.com" required>
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input type="password" id="password" name="password" placeholder="Create a password" required>
          <div class="form-hint">Must be 9+ characters with uppercase, lowercase, and a special character</div>
        </div>
        <button type="submit" class="btn btn-primary">Sign Up</button>
      </form>
      <div class="auth-footer">
        Already have an account? <a href="#/login">Log in</a>
      </div>
    </div>
  `;

  document.getElementById('signup-form').onsubmit = async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Creating account...';
    try {
      await api.post('/auth/signup', {
        login_id: document.getElementById('login_id').value.trim(),
        email:    document.getElementById('email').value.trim(),
        password: document.getElementById('password').value,
      });
      showToast('Account created! Please log in.', 'success');
      navigate('#/login');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Sign Up';
    }
  };
}
