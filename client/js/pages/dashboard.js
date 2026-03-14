import { api } from '../api.js';
import { showToast } from '../components/toast.js';

export async function render(container) {
  container.innerHTML = '<div class="page-header"><h1>Dashboard</h1></div><div class="stat-grid" id="stats-grid">Loading...</div>';

  try {
    const data = await api.get('/dashboard');
    const r = data.receipts;
    const d = data.deliveries;

    document.getElementById('stats-grid').innerHTML = `
      <div class="stat-card accent-blue">
        <div class="stat-value">${r.toReceive}</div>
        <div class="stat-label">To Receive</div>
      </div>
      <div class="stat-card accent-red">
        <div class="stat-value">${r.late}</div>
        <div class="stat-label">Receipts Late</div>
      </div>
      <div class="stat-card accent-green">
        <div class="stat-value">${r.operations}</div>
        <div class="stat-label">Receipt Operations</div>
      </div>
      <div class="stat-card accent-blue">
        <div class="stat-value">${d.toDeliver}</div>
        <div class="stat-label">To Deliver</div>
      </div>
      <div class="stat-card accent-red">
        <div class="stat-value">${d.late}</div>
        <div class="stat-label">Deliveries Late</div>
      </div>
      <div class="stat-card accent-amber">
        <div class="stat-value">${d.waiting}</div>
        <div class="stat-label">Waiting (Low Stock)</div>
      </div>
      <div class="stat-card accent-green">
        <div class="stat-value">${d.operations}</div>
        <div class="stat-label">Delivery Operations</div>
      </div>
    `;
  } catch (err) {
    showToast(err.message, 'error');
  }
}
