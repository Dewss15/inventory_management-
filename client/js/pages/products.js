import { api } from '../api.js';
import { renderTable } from '../components/table.js';
import { openModal, closeModal } from '../components/modal.js';
import { showToast } from '../components/toast.js';

const COLUMNS = [
  { key: 'name',     label: 'Name' },
  { key: 'sku',      label: 'SKU' },
  { key: 'category', label: 'Category' },
  { key: 'unit',     label: 'Unit' },
  { key: 'stock',    label: 'Stock', render: (r) => `<strong>${r.stock}</strong>` },
  { key: 'created_at', label: 'Created', render: (r) => new Date(r.created_at).toLocaleDateString() },
];

async function loadTable() {
  const data = await api.get('/products');
  document.getElementById('products-table-wrap').innerHTML = renderTable(COLUMNS, data);
}

export async function render(container) {
  container.innerHTML = `
    <div class="page-header">
      <h1>Products</h1>
      <button class="btn btn-primary" id="btn-new-product">+ New Product</button>
    </div>
    <div class="table-wrap" id="products-table-wrap">Loading...</div>
  `;

  try { await loadTable(); } catch (err) { showToast(err.message, 'error'); }

  document.getElementById('btn-new-product').onclick = () => {
    openModal('New Product', `
      <form id="product-form">
        <div class="form-group"><label>Name</label><input name="name" required></div>
        <div class="form-group"><label>SKU</label><input name="sku" required></div>
        <div class="form-group"><label>Category</label><input name="category" required></div>
        <div class="form-group"><label>Unit</label><input name="unit" required placeholder="e.g. pcs, kg, m"></div>
        <div class="form-group"><label>Initial Stock</label><input name="initialStock" type="number" value="0" min="0"></div>
        <div class="flex-end mt-16">
          <button type="button" class="btn btn-secondary" onclick="document.getElementById('modal-backdrop').classList.add('hidden')">Cancel</button>
          <button type="submit" class="btn btn-primary">Create</button>
        </div>
      </form>
    `);

    document.getElementById('product-form').onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      try {
        await api.post('/products', {
          name:         fd.get('name').trim(),
          sku:          fd.get('sku').trim(),
          category:     fd.get('category').trim(),
          unit:         fd.get('unit').trim(),
          initialStock: parseInt(fd.get('initialStock'), 10) || 0,
        });
        closeModal();
        showToast('Product created', 'success');
        await loadTable();
      } catch (err) {
        showToast(err.message, 'error');
      }
    };
  };
}
