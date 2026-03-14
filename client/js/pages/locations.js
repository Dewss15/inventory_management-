import { api } from '../api.js';
import { renderTable } from '../components/table.js';
import { openModal, closeModal } from '../components/modal.js';
import { showToast } from '../components/toast.js';

const COLUMNS = [
  { key: 'name', label: 'Name' },
  { key: 'warehouse_id', label: 'Warehouse', render: (r) => r.warehouse_id?.name || '-' },
  { key: 'created_at', label: 'Created', render: (r) => new Date(r.created_at).toLocaleDateString() },
];

async function loadTable() {
  const data = await api.get('/locations');
  document.getElementById('locations-table-wrap').innerHTML = renderTable(COLUMNS, data);
}

export async function render(container) {
  container.innerHTML = `
    <div class="page-header">
      <h1>Locations</h1>
      <button class="btn btn-primary" id="btn-new-location">+ New Location</button>
    </div>
    <div class="table-wrap" id="locations-table-wrap">Loading...</div>
  `;

  try { await loadTable(); } catch (err) { showToast(err.message, 'error'); }

  document.getElementById('btn-new-location').onclick = async () => {
    let warehouses = [];
    try { warehouses = await api.get('/warehouses'); } catch (err) { showToast(err.message, 'error'); return; }

    const opts = warehouses.map(w => `<option value="${w._id}">${w.name} (${w.short_code})</option>`).join('');

    openModal('New Location', `
      <form id="location-form">
        <div class="form-group"><label>Name</label><input name="name" required placeholder="e.g. Rack A"></div>
        <div class="form-group">
          <label>Warehouse</label>
          <select name="warehouse_id" required>
            <option value="">Select warehouse...</option>
            ${opts}
          </select>
        </div>
        <div class="flex-end mt-16">
          <button type="button" class="btn btn-secondary" onclick="document.getElementById('modal-backdrop').classList.add('hidden')">Cancel</button>
          <button type="submit" class="btn btn-primary">Create</button>
        </div>
      </form>
    `);

    document.getElementById('location-form').onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      try {
        await api.post('/locations', {
          name:         fd.get('name').trim(),
          warehouse_id: fd.get('warehouse_id'),
        });
        closeModal();
        showToast('Location created', 'success');
        await loadTable();
      } catch (err) {
        showToast(err.message, 'error');
      }
    };
  };
}
