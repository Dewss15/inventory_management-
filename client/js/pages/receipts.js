import { api } from '../api.js';
import { renderTable } from '../components/table.js';
import { statusBadge } from '../components/statusBadge.js';
import { openModal, closeModal } from '../components/modal.js';
import { showToast } from '../components/toast.js';
import { productLinesHTML, bindProductLines, collectProductLines } from '../components/formHelpers.js';

const COLUMNS = [
  { key: 'reference', label: 'Reference', render: (r) => `<strong>${r.reference}</strong>` },
  { key: 'receive_from', label: 'From' },
  { key: 'schedule_date', label: 'Schedule', render: (r) => new Date(r.schedule_date).toLocaleDateString() },
  { key: 'status', label: 'Status', render: (r) => statusBadge(r.status) },
  { key: 'products', label: 'Items', render: (r) => r.products?.length || 0 },
  { key: 'responsible_user', label: 'User', render: (r) => r.responsible_user?.login_id || '-' },
];

function actionButtons(row) {
  if (row.status === 'Draft') return `<button class="btn btn-primary btn-sm" data-id="${row._id}" data-action="Ready">Mark Ready</button>`;
  if (row.status === 'Ready') return `<button class="btn btn-success btn-sm" data-id="${row._id}" data-action="Done">Mark Done</button>`;
  return '<span class="text-muted">-</span>';
}

async function loadTable() {
  const data = await api.get('/receipts');
  const wrap = document.getElementById('receipts-table-wrap');
  wrap.innerHTML = renderTable(COLUMNS, data, actionButtons);

  wrap.querySelectorAll('[data-action]').forEach(btn => {
    btn.onclick = async () => {
      btn.disabled = true;
      try {
        await api.patch(`/receipts/${btn.dataset.id}/status`, { status: btn.dataset.action });
        showToast(`Receipt updated to ${btn.dataset.action}`, 'success');
        await loadTable();
      } catch (err) {
        showToast(err.message, 'error');
        btn.disabled = false;
      }
    };
  });
}

export async function render(container) {
  container.innerHTML = `
    <div class="page-header">
      <h1>Receipts</h1>
      <button class="btn btn-primary" id="btn-new-receipt">+ New Receipt</button>
    </div>
    <div class="table-wrap" id="receipts-table-wrap">Loading...</div>
  `;

  try { await loadTable(); } catch (err) { showToast(err.message, 'error'); }

  document.getElementById('btn-new-receipt').onclick = async () => {
    let products = [];
    try { products = await api.get('/products'); } catch (err) { showToast(err.message, 'error'); return; }

    openModal('New Receipt', `
      <form id="receipt-form">
        <div class="form-group"><label>Receive From</label><input name="receive_from" required></div>
        <div class="form-group"><label>Schedule Date</label><input name="schedule_date" type="date" required></div>
        ${productLinesHTML(products)}
        <div class="flex-end mt-16">
          <button type="button" class="btn btn-secondary" onclick="document.getElementById('modal-backdrop').classList.add('hidden')">Cancel</button>
          <button type="submit" class="btn btn-primary">Create</button>
        </div>
      </form>
    `);
    bindProductLines(products);

    document.getElementById('receipt-form').onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const lines = collectProductLines();
      if (lines.length === 0) { showToast('Add at least one product', 'error'); return; }
      try {
        await api.post('/receipts', {
          receive_from:  fd.get('receive_from').trim(),
          schedule_date: fd.get('schedule_date'),
          products:      lines,
        });
        closeModal();
        showToast('Receipt created', 'success');
        await loadTable();
      } catch (err) {
        showToast(err.message, 'error');
      }
    };
  };
}
