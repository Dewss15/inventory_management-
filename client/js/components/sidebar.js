const NAV_ITEMS = [
  { hash: '#/dashboard',    label: 'Dashboard',    icon: '\u25A0' },
  { hash: '#/products',     label: 'Products',     icon: '\u25B6' },
  { hash: '#/receipts',     label: 'Receipts',     icon: '\u2B07' },
  { hash: '#/deliveries',   label: 'Deliveries',   icon: '\u2B06' },
  { hash: '#/warehouses',   label: 'Warehouses',   icon: '\u2302' },
  { hash: '#/locations',    label: 'Locations',    icon: '\u25C9' },
  { hash: '#/stock',        label: 'Stock',        icon: '\u2630' },
  { hash: '#/move-history', label: 'Move History', icon: '\u21BA' },
];

export function renderSidebar(el) {
  el.innerHTML = `
    <div class="sidebar-brand"><h2>Flux IMS</h2></div>
    <ul class="nav-list">
      ${NAV_ITEMS.map(item => `
        <li>
          <a href="${item.hash}" class="nav-link" data-hash="${item.hash}">
            <span class="nav-icon">${item.icon}</span>
            ${item.label}
          </a>
        </li>
      `).join('')}
    </ul>
  `;
}

export function setActive(hash) {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.hash === hash);
  });
}
