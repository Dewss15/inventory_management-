import { api } from '../api.js';
import { renderTable } from '../components/table.js';
import { openModal, closeModal } from '../components/modal.js';
import { showToast } from '../components/toast.js';

const COLUMNS = [
  { key: 'product',   label: 'Product',      render: (r) => r.product?.name || '-' },
  { key: 'warehouse', label: 'Warehouse',    render: (r) => r.warehouse?.name || '-' },
  { key: 'location',  label: 'Location',     render: (r) => r.location?.name || '-' },
  { key: 'on_hand',   label: 'On Hand',      render: (r) => `<strong>${r.on_hand ?? 0}</strong>` },
  { key: 'per_unit_cost', label: 'Unit Cost', render: (r) => r.per_unit_cost != null ? r.per_unit_cost.toFixed(2) : '-' },
  { key: 'free_to_use',   label: 'Free To Use' },
];

function actionButtons(row) {
  return `<button class="btn btn-primary btn-sm" data-id="${row._id}" data-onhand="${row.on_hand || 0}" data-cost="${row.per_unit_cost || 0}">Edit</button>`;
}

async function loadTable() {
  const data = await api.get('/stock');
  const wrap = document.getElementById('stock-table-wrap');
  wrap.innerHTML = renderTable(COLUMNS, data, actionButtons);

  wrap.querySelectorAll('[data-id]').forEach(btn => {
    btn.onclick = () => {
      const id   = btn.dataset.id;
      const qty  = btn.dataset.onhand;
      const cost = btn.dataset.cost;

      openModal('Edit Stock', `
        <form id="stock-form">
          <div class="form-group"><label>Quantity (On Hand)</label><input name="quantity" type="number" value="${qty}" min="0" required></div>
          <div class="form-group"><label>Unit Cost</label><input name="unit_cost" type="number" step="0.01" value="${cost}" min="0" required></div>
          <div class="flex-end mt-16">
            <button type="button" class="btn btn-secondary" onclick="document.getElementById('modal-backdrop').classList.add('hidden')">Cancel</button>
            <button type="submit" class="btn btn-primary">Save</button>
          </div>
        </form>
      `);

      document.getElementById('stock-form').onsubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        try {
          await api.patch(`/stock/${id}`, {
            quantity:  parseInt(fd.get('quantity'), 10),
            unit_cost: parseFloat(fd.get('unit_cost')),
          });
          closeModal();
          showToast('Stock updated', 'success');
          await loadTable();
        } catch (err) {
          showToast(err.message, 'error');
        }
      };
    };
  });
}

export async function render(container) {
  container.innerHTML = `
    <div class="page-header"><h1>Stock</h1></div>
    <div class="table-wrap" id="stock-table-wrap">Loading...</div>
  `;

  try { await loadTable(); } catch (err) { showToast(err.message, 'error'); }
}
