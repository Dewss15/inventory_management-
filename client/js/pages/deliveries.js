import { api } from '../api.js';
import { renderTable } from '../components/table.js';
import { statusBadge } from '../components/statusBadge.js';
import { openModal, closeModal } from '../components/modal.js';
import { showToast } from '../components/toast.js';
import { productLinesHTML, bindProductLines, collectProductLines } from '../components/formHelpers.js';

const COLUMNS = [
  { key: 'reference', label: 'Reference', render: (r) => `<strong>${r.reference}</strong>` },
  { key: 'delivery_address', label: 'Address' },
  { key: 'schedule_date', label: 'Schedule', render: (r) => new Date(r.schedule_date).toLocaleDateString() },
  { key: 'status', label: 'Status', render: (r) => statusBadge(r.status) },
  { key: 'products', label: 'Items', render: (r) => r.products?.length || 0 },
];

function actionButtons(row) {
  const btns = [];
  if (row.status === 'Draft')   btns.push(`<button class="btn btn-primary btn-sm" data-id="${row._id}" data-action="Ready">Mark Ready</button>`);
  if (row.status === 'Waiting') btns.push(`<button class="btn btn-primary btn-sm" data-id="${row._id}" data-action="Ready">Mark Ready</button>`);
  if (row.status === 'Ready')   btns.push(`<button class="btn btn-success btn-sm" data-id="${row._id}" data-action="Done">Mark Done</button>`);
  return btns.length ? btns.join(' ') : '<span class="text-muted">-</span>';
}

async function loadTable() {
  const data = await api.get('/deliveries');
  const wrap = document.getElementById('deliveries-table-wrap');
  wrap.innerHTML = renderTable(COLUMNS, data, actionButtons);

  wrap.querySelectorAll('[data-action]').forEach(btn => {
    btn.onclick = async () => {
      btn.disabled = true;
      try {
        await api.patch(`/deliveries/${btn.dataset.id}/status`, { status: btn.dataset.action });
        showToast(`Delivery updated to ${btn.dataset.action}`, 'success');
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
      <h1>Deliveries</h1>
      <button class="btn btn-primary" id="btn-new-delivery">+ New Delivery</button>
    </div>
    <div class="table-wrap" id="deliveries-table-wrap">Loading...</div>
  `;

  try { await loadTable(); } catch (err) { showToast(err.message, 'error'); }

  document.getElementById('btn-new-delivery').onclick = async () => {
    let products = [];
    try { products = await api.get('/products'); } catch (err) { showToast(err.message, 'error'); return; }

    openModal('New Delivery', `
      <form id="delivery-form">
        <div class="form-group"><label>Delivery Address</label><input name="delivery_address" required></div>
        <div class="form-group"><label>Schedule Date</label><input name="schedule_date" type="date" required></div>
        ${productLinesHTML(products)}
        <div class="flex-end mt-16">
          <button type="button" class="btn btn-secondary" onclick="document.getElementById('modal-backdrop').classList.add('hidden')">Cancel</button>
          <button type="submit" class="btn btn-primary">Create</button>
        </div>
      </form>
    `);
    bindProductLines(products);

    document.getElementById('delivery-form').onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const lines = collectProductLines();
      if (lines.length === 0) { showToast('Add at least one product', 'error'); return; }
      try {
        const result = await api.post('/deliveries', {
          delivery_address: fd.get('delivery_address').trim(),
          schedule_date:    fd.get('schedule_date'),
          products:         lines,
        });
        closeModal();
        if (result.status === 'Waiting') {
          showToast('Delivery created with status Waiting (insufficient stock)', 'info');
        } else {
          showToast('Delivery created', 'success');
        }
        await loadTable();
      } catch (err) {
        showToast(err.message, 'error');
      }
    };
  };
}
