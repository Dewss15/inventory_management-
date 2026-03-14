import { auth } from './auth.js';
import { registerRoute, start, navigate } from './router.js';
import { renderSidebar, setActive } from './components/sidebar.js';

import { render as loginPage } from './pages/login.js';
import { render as signupPage } from './pages/signup.js';
import { render as forgotPasswordPage } from './pages/forgotPassword.js';
import { render as dashboardPage } from './pages/dashboard.js';
import { render as productsPage } from './pages/products.js';
import { render as receiptsPage } from './pages/receipts.js';
import { render as deliveriesPage } from './pages/deliveries.js';
import { render as warehousesPage } from './pages/warehouses.js';
import { render as locationsPage } from './pages/locations.js';
import { render as stockPage } from './pages/stock.js';
import { render as moveHistoryPage } from './pages/moveHistory.js';

// Public routes
registerRoute('#/login', loginPage, true);
registerRoute('#/signup', signupPage, true);
registerRoute('#/forgot-password', forgotPasswordPage, true);

// Protected routes
registerRoute('#/dashboard', dashboardPage);
registerRoute('#/products', productsPage);
registerRoute('#/receipts', receiptsPage);
registerRoute('#/deliveries', deliveriesPage);
registerRoute('#/warehouses', warehousesPage);
registerRoute('#/locations', locationsPage);
registerRoute('#/stock', stockPage);
registerRoute('#/move-history', moveHistoryPage);

// Layout refs
const authLayout = document.getElementById('auth-layout');
const appLayout  = document.getElementById('app-layout');
let sidebarRendered = false;

const PAGE_TITLES = {
  '#/dashboard':    'Dashboard',
  '#/products':     'Products',
  '#/receipts':     'Receipts',
  '#/deliveries':   'Deliveries',
  '#/warehouses':   'Warehouses',
  '#/locations':    'Locations',
  '#/stock':        'Stock',
  '#/move-history': 'Move History',
};

function showAuthLayout() {
  authLayout.classList.remove('hidden');
  appLayout.classList.add('hidden');
}

function showAppLayout(hash) {
  authLayout.classList.add('hidden');
  appLayout.classList.remove('hidden');

  if (!sidebarRendered) {
    renderSidebar(document.getElementById('sidebar'));
    sidebarRendered = true;
  }
  setActive(hash);

  const topBar = document.getElementById('top-bar');
  const user = auth.getUser();
  topBar.innerHTML = `
    <span class="page-title">${PAGE_TITLES[hash] || ''}</span>
    <div class="user-menu">
      <span>${user?.login_id || ''}</span>
      <button class="btn btn-secondary btn-sm" id="btn-logout">Logout</button>
    </div>
  `;
  topBar.querySelector('#btn-logout').onclick = () => {
    auth.clear();
    sidebarRendered = false;
    navigate('#/login');
  };
}

function getContainer(isPublic) {
  return isPublic
    ? document.getElementById('auth-content')
    : document.getElementById('page-content');
}

start(getContainer, () => auth.isLoggedIn(), showAuthLayout, showAppLayout);
