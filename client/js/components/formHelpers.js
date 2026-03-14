/**
 * Builds the HTML for a dynamic product-line set (used in receipt/delivery create forms).
 * @param {Array<{_id, name, sku}>} products - list from GET /products
 * @returns {string} HTML
 */
export function productLinesHTML(products) {
  const optionsHTML = products.map(p =>
    `<option value="${p._id}">${p.name} (${p.sku})</option>`
  ).join('');

  return `
    <div id="product-lines">
      <label style="font-size:13px;font-weight:500;color:var(--text-secondary);margin-bottom:4px;display:block">Products</label>
      <div class="product-line" data-index="0">
        <select name="product_id" required>
          <option value="">Select product...</option>
          ${optionsHTML}
        </select>
        <input type="number" name="quantity" placeholder="Qty" min="1" required>
        <button type="button" class="btn-remove-line" title="Remove">&times;</button>
      </div>
    </div>
    <button type="button" class="btn btn-outline btn-sm mt-8" id="btn-add-line">+ Add product line</button>
  `;
}

/**
 * Call after injecting the form HTML to bind add/remove line events.
 * @param {Array<{_id, name, sku}>} products
 */
export function bindProductLines(products) {
  const container = document.getElementById('product-lines');
  const addBtn    = document.getElementById('btn-add-line');
  if (!addBtn) return;

  const optionsHTML = products.map(p =>
    `<option value="${p._id}">${p.name} (${p.sku})</option>`
  ).join('');

  addBtn.onclick = () => {
    const idx = container.querySelectorAll('.product-line').length;
    const row = document.createElement('div');
    row.className = 'product-line';
    row.dataset.index = idx;
    row.innerHTML = `
      <select name="product_id" required>
        <option value="">Select product...</option>
        ${optionsHTML}
      </select>
      <input type="number" name="quantity" placeholder="Qty" min="1" required>
      <button type="button" class="btn-remove-line" title="Remove">&times;</button>
    `;
    container.appendChild(row);
  };

  container.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-remove-line')) {
      const lines = container.querySelectorAll('.product-line');
      if (lines.length > 1) e.target.closest('.product-line').remove();
    }
  });
}

/**
 * Collect product lines from the form.
 * @returns {Array<{product_id, quantity}>}
 */
export function collectProductLines() {
  const lines = document.querySelectorAll('#product-lines .product-line');
  const result = [];
  lines.forEach(line => {
    const product_id = line.querySelector('select[name="product_id"]').value;
    const quantity   = parseInt(line.querySelector('input[name="quantity"]').value, 10);
    if (product_id && quantity > 0) {
      result.push({ product_id, quantity });
    }
  });
  return result;
}
