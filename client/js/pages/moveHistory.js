import { api } from '../api.js';
import { renderTable } from '../components/table.js';
import { statusBadge } from '../components/statusBadge.js';
import { showToast } from '../components/toast.js';

const COLUMNS = [
  { key: 'reference', label: 'Reference', render: (r) => `<strong>${r.reference}</strong>` },
  { key: 'product_id', label: 'Product', render: (r) => r.product_id?.name || '-' },
  { key: 'date', label: 'Date', render: (r) => new Date(r.date).toLocaleDateString() },
  { key: 'contact', label: 'Contact' },
  { key: 'from_location', label: 'From' },
  { key: 'to_location', label: 'To' },
  { key: 'quantity', label: 'Qty', render: (r) => {
    const cls = r.quantity > 0 ? 'text-success' : 'text-danger';
    const sign = r.quantity > 0 ? '+' : '';
    return `<strong class="${cls}">${sign}${r.quantity}</strong>`;
  }},
  { key: 'status', label: 'Status', render: (r) => statusBadge(r.status) },
];

export async function render(container) {
  container.innerHTML = `
    <div class="page-header"><h1>Move History</h1></div>
    <div class="table-wrap" id="move-history-table-wrap">Loading...</div>
  `;

  try {
    const data = await api.get('/move-history');
    document.getElementById('move-history-table-wrap').innerHTML = renderTable(COLUMNS, data);
  } catch (err) {
    showToast(err.message, 'error');
  }
}
