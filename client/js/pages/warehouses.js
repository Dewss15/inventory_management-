import { api } from '../api.js';
import { renderTable } from '../components/table.js';
import { openModal, closeModal } from '../components/modal.js';
import { showToast } from '../components/toast.js';

const COLUMNS = [
  { key: 'name',       label: 'Name' },
  { key: 'short_code', label: 'Short Code', render: (r) => `<strong>${r.short_code}</strong>` },
  { key: 'address',    label: 'Address' },
  { key: 'created_at', label: 'Created', render: (r) => new Date(r.created_at).toLocaleDateString() },
];

async function loadTable() {
  const data = await api.get('/warehouses');
  document.getElementById('warehouses-table-wrap').innerHTML = renderTable(COLUMNS, data);
}

export async function render(container) {
  container.innerHTML = `
    <div class="page-header">
      <h1>Warehouses</h1>
      <button class="btn btn-primary" id="btn-new-warehouse">+ New Warehouse</button>
    </div>
    <div class="table-wrap" id="warehouses-table-wrap">Loading...</div>
  `;

  try { await loadTable(); } catch (err) { showToast(err.message, 'error'); }

  document.getElementById('btn-new-warehouse').onclick = () => {
    openModal('New Warehouse', `
      <form id="warehouse-form">
        <div class="form-group"><label>Name</label><input name="name" required></div>
        <div class="form-group"><label>Short Code</label><input name="short_code" required placeholder="e.g. WH01"></div>
        <div class="form-group"><label>Address</label><input name="address" placeholder="Optional"></div>
        <div class="flex-end mt-16">
          <button type="button" class="btn btn-secondary" onclick="document.getElementById('modal-backdrop').classList.add('hidden')">Cancel</button>
          <button type="submit" class="btn btn-primary">Create</button>
        </div>
      </form>
    `);

    document.getElementById('warehouse-form').onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      try {
        await api.post('/warehouses', {
          name:       fd.get('name').trim(),
          short_code: fd.get('short_code').trim(),
          address:    fd.get('address').trim(),
        });
        closeModal();
        showToast('Warehouse created', 'success');
        await loadTable();
      } catch (err) {
        showToast(err.message, 'error');
      }
    };
  };
}
