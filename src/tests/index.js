/**
 * Flux IMS — API Test Suite
 * Run: npm test  (server must be running on PORT from .env, default 3000)
 */

'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const http = require('http');

const PORT = process.env.PORT || 3000;
const BASE = `http://localhost:${PORT}`;
let token = '';
let productId = '';
let receiptId = '';
let deliveryId = '';

// Unique suffix per run to avoid data conflicts on re-runs
const RUN = Date.now().toString().slice(-6);
const TEST_USER    = `tst${RUN}`;       // 9 chars, unique
const TEST_EMAIL   = `tst${RUN}@example.com`;
const TEST_SKU1    = `SR-${RUN}`;
const TEST_SKU2    = `IP-${RUN}`;
const TEST_WH_CODE = `W${RUN}`;         // short_code unique per run

// ─── HTTP Helper ─────────────────────────────────────────────────────────────

function request(method, path, body = null, authToken = '') {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const url = new URL(`${BASE}${path}`);
    const options = {
      hostname: url.hostname,
      port:     url.port || 80,
      path:     url.pathname,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...(payload   ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

// ─── Assertion Helper ─────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(label, condition, detail = '') {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.error(`  ✗ ${label}${detail ? ` — ${detail}` : ''}`);
    failed++;
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

async function testAuth() {
  console.log('\n── Auth ──────────────────────────────────────────');

  // Signup
  let r = await request('POST', '/auth/signup', {
    login_id: TEST_USER,
    email:    TEST_EMAIL,
    password: 'Test@1234',
  });
  assert('POST /auth/signup — 201', r.status === 201, JSON.stringify(r.body));

  // Duplicate signup
  r = await request('POST', '/auth/signup', {
    login_id: TEST_USER,
    email:    TEST_EMAIL,
    password: 'Test@1234',
  });
  assert('POST /auth/signup — duplicate returns 409', r.status === 409, JSON.stringify(r.body));

  // Invalid password
  r = await request('POST', '/auth/signup', {
    login_id: `nu${RUN}`,
    email:    `nu${RUN}@example.com`,
    password: 'weakpass',
  });
  assert('POST /auth/signup — weak password rejected', r.status === 400, JSON.stringify(r.body));

  // Login
  r = await request('POST', '/auth/login', {
    login_id: TEST_USER,
    password: 'Test@1234',
  });
  assert('POST /auth/login — 200 with token', r.status === 200 && r.body.token, JSON.stringify(r.body));
  token = r.body.token || '';

  // Login — wrong password
  r = await request('POST', '/auth/login', {
    login_id: TEST_USER,
    password: 'WrongPass!',
  });
  assert('POST /auth/login — wrong password returns 401', r.status === 401, JSON.stringify(r.body));

  // Forgot password
  r = await request('POST', '/auth/forgot-password', {
    email: TEST_EMAIL,
  });
  assert(
    'POST /auth/forgot-password — 200',
    r.status === 200,
    JSON.stringify(r.body)
  );
  console.log('    (OTP sent via email — verify-otp and reset-password require a live OTP)');
}

async function testProducts() {
  console.log('\n── Products ──────────────────────────────────────');

  // Create product
  let r = await request('POST', '/products', {
    name:         `Steel Rod ${RUN}`,
    sku:          TEST_SKU1,
    category:     'Raw Materials',
    unit:         'pcs',
    initialStock: 50,
  }, token);
  assert('POST /products — 201', r.status === 201, JSON.stringify(r.body));
  productId = r.body._id || '';

  // Create second product (for stock test)
  r = await request('POST', '/products', {
    name:         `Iron Pipe ${RUN}`,
    sku:          TEST_SKU2,
    category:     'Raw Materials',
    unit:         'pcs',
    initialStock: 5,
  }, token);
  assert('POST /products (second) — 201', r.status === 201, JSON.stringify(r.body));

  // Get all products
  r = await request('GET', '/products', null, token);
  assert(
    'GET /products — 200, returns array',
    r.status === 200 && Array.isArray(r.body),
    JSON.stringify(r.body)
  );
  assert(
    'GET /products — initial stock set',
    r.body.some((p) => p.sku === TEST_SKU1 && p.stock === 50),
    `stocks: ${r.body.map((p) => `${p.sku}:${p.stock}`).join(', ')}`
  );
}

async function testReceipts() {
  console.log('\n── Receipts ──────────────────────────────────────');

  // Create receipt
  let r = await request('POST', '/receipts', {
    receive_from:  'Vendor A',
    schedule_date: new Date().toISOString(),
    products: [{ product_id: productId, quantity: 20 }],
  }, token);
  assert('POST /receipts — 201', r.status === 201, JSON.stringify(r.body));
  receiptId = r.body._id || '';

  const ref = r.body.reference;
  assert('POST /receipts — reference generated (WH/IN/)', ref && ref.startsWith('WH/IN/'), ref);
  assert('POST /receipts — status is Draft', r.body.status === 'Draft', r.body.status);

  // Draft → Ready
  r = await request('PATCH', `/receipts/${receiptId}/status`, { status: 'Ready' }, token);
  assert('PATCH /receipts/:id/status Draft→Ready — 200', r.status === 200, JSON.stringify(r.body));
  assert('status is Ready', r.body.status === 'Ready', r.body.status);

  // Invalid transition Ready → Draft
  r = await request('PATCH', `/receipts/${receiptId}/status`, { status: 'Draft' }, token);
  assert('Invalid transition returns 400', r.status === 400, JSON.stringify(r.body));

  // Ready → Done
  r = await request('PATCH', `/receipts/${receiptId}/status`, { status: 'Done' }, token);
  assert('PATCH /receipts/:id/status Ready→Done — 200', r.status === 200, JSON.stringify(r.body));
  assert('status is Done', r.body.status === 'Done', r.body.status);

  // Stock should have increased
  r = await request('GET', '/products', null, token);
  const product = r.body.find((p) => p._id === productId);
  assert(
    'Stock increased on receipt Done (50 + 20 = 70)',
    product && product.stock === 70,
    `stock is ${product?.stock}`
  );

  // Get receipts
  r = await request('GET', '/receipts', null, token);
  assert('GET /receipts — 200', r.status === 200 && Array.isArray(r.body), JSON.stringify(r.body));
}

async function testDeliveries() {
  console.log('\n── Deliveries ────────────────────────────────────');

  // Delivery with insufficient stock → Waiting
  let r = await request('POST', '/deliveries', {
    delivery_address: 'Customer B',
    schedule_date:    new Date().toISOString(),
    products: [{ product_id: productId, quantity: 9999 }],
  }, token);
  assert('POST /deliveries (insufficient stock) — 201', r.status === 201, JSON.stringify(r.body));
  assert('status is Waiting when stock insufficient', r.body.status === 'Waiting', r.body.status);

  // Delivery with sufficient stock → Draft
  r = await request('POST', '/deliveries', {
    delivery_address: 'Customer A',
    schedule_date:    new Date().toISOString(),
    products: [{ product_id: productId, quantity: 10 }],
  }, token);
  assert('POST /deliveries (sufficient stock) — 201', r.status === 201, JSON.stringify(r.body));
  assert('status is Draft when stock sufficient', r.body.status === 'Draft', r.body.status);
  deliveryId = r.body._id || '';

  const ref = r.body.reference;
  assert('reference generated (WH/OUT/)', ref && ref.startsWith('WH/OUT/'), ref);

  // Draft → Ready
  r = await request('PATCH', `/deliveries/${deliveryId}/status`, { status: 'Ready' }, token);
  assert('PATCH /deliveries/:id/status Draft→Ready — 200', r.status === 200, JSON.stringify(r.body));

  // Ready → Done
  r = await request('PATCH', `/deliveries/${deliveryId}/status`, { status: 'Done' }, token);
  assert('PATCH /deliveries/:id/status Ready→Done — 200', r.status === 200, JSON.stringify(r.body));
  assert('status is Done', r.body.status === 'Done', r.body.status);

  // Stock should have decreased
  r = await request('GET', '/products', null, token);
  const product = r.body.find((p) => p._id === productId);
  assert(
    'Stock decreased on delivery Done (70 - 10 = 60)',
    product && product.stock === 60,
    `stock is ${product?.stock}`
  );

  // Get deliveries
  r = await request('GET', '/deliveries', null, token);
  assert('GET /deliveries — 200', r.status === 200 && Array.isArray(r.body), JSON.stringify(r.body));
}

async function testMoveHistory() {
  console.log('\n── Move History ──────────────────────────────────');

  const r = await request('GET', '/move-history', null, token);
  assert('GET /move-history — 200', r.status === 200 && Array.isArray(r.body), JSON.stringify(r.body));

  const incoming = r.body.filter((m) => m.quantity > 0);
  const outgoing = r.body.filter((m) => m.quantity < 0);
  assert('Has positive (incoming) movements', incoming.length > 0, `incoming: ${incoming.length}`);
  assert('Has negative (outgoing) movements', outgoing.length > 0, `outgoing: ${outgoing.length}`);
  console.log(`    Total records: ${r.body.length} (${incoming.length} in, ${outgoing.length} out)`);
}

async function testWarehouses() {
  console.log('\n── Warehouses & Locations ────────────────────────');

  let r = await request('POST', '/warehouses', {
    name:       `Main Warehouse ${RUN}`,
    short_code: TEST_WH_CODE,
    address:    'Industrial Area',
  }, token);
  assert('POST /warehouses — 201', r.status === 201, JSON.stringify(r.body));
  const warehouseId = r.body._id;

  r = await request('GET', '/warehouses', null, token);
  assert('GET /warehouses — 200', r.status === 200 && Array.isArray(r.body), JSON.stringify(r.body));

  r = await request('POST', '/locations', {
    name:         'Rack A',
    warehouse_id: warehouseId,
  }, token);
  assert('POST /locations — 201', r.status === 201, JSON.stringify(r.body));

  r = await request('GET', '/locations', null, token);
  assert('GET /locations — 200', r.status === 200 && Array.isArray(r.body), JSON.stringify(r.body));
}

async function testDashboard() {
  console.log('\n── Dashboard ─────────────────────────────────────');

  const r = await request('GET', '/dashboard', null, token);
  assert('GET /dashboard — 200', r.status === 200, JSON.stringify(r.body));
  assert(
    'Has receipts stats',
    r.body.receipts !== undefined &&
    'toReceive' in r.body.receipts &&
    'late'       in r.body.receipts &&
    'operations' in r.body.receipts,
    JSON.stringify(r.body.receipts)
  );
  assert(
    'Has deliveries stats',
    r.body.deliveries !== undefined &&
    'toDeliver'  in r.body.deliveries &&
    'late'        in r.body.deliveries &&
    'waiting'     in r.body.deliveries &&
    'operations'  in r.body.deliveries,
    JSON.stringify(r.body.deliveries)
  );
  console.log(`    Stats: ${JSON.stringify(r.body, null, 2)}`);
}

// ─── Runner ───────────────────────────────────────────────────────────────────

(async () => {
  console.log('═══════════════════════════════════════════════════');
  console.log('  Flux IMS — API Test Suite');
  console.log('═══════════════════════════════════════════════════');

  try {
    await testAuth();
    await testProducts();
    await testReceipts();
    await testDeliveries();
    await testMoveHistory();
    await testWarehouses();
    await testDashboard();
  } catch (err) {
    console.error('\nFatal error during tests:', err.message);
    failed++;
  }

  console.log('\n═══════════════════════════════════════════════════');
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  console.log('═══════════════════════════════════════════════════\n');
  process.exit(failed > 0 ? 1 : 0);
})();
