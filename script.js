/**
 * Agricultural Packaging Inventory & POS (কৃষি প্যাকেজিং হিসাব)
 * Clean, Standalone Vanilla JavaScript for GitHub Pages & Vercel
 * Integrated with Supabase PostgreSQL + automatic localStorage offline fallback
 */

var SUPABASE_URL = 'https://mbjgvsivtkavpvtqwhsb.supabase.co';
var SUPABASE_ANON_KEY = 'sb_publishable_satWtSpdLxBaJ2FgXY3GJg_co5w-3ZD';

var supabaseClient = null;
try {
  if (typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function') {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
} catch (err) {
  console.warn('Supabase SDK could not initialize, falling back to localStorage:', err);
}

var STORAGE_KEYS = {
  PRODUCTS: 'standalone_agri_products',
  SALES: 'standalone_agri_sales',
  LANG: 'standalone_agri_lang',
};

// Initial 29 Products
var INITIAL_PRODUCTS = [
  // Crate & Paper & General Items
  { id: 1, name: "ক্যারেট - ১নং", category: "ক্যারেট", buy_price: 260, sell_price: 300, unit: "পিস", stock: 50, minStockAlert: 15 },
  { id: 2, name: "ক্যারেট - ২নং", category: "ক্যারেট", buy_price: 180, sell_price: 200, unit: "পিস", stock: 50, minStockAlert: 15 },
  { id: 3, name: "রিম (বড় সাদা কাগজ)", category: "কাগজ", buy_price: 50, sell_price: 68, unit: "কেজি", stock: 100, minStockAlert: 20 },
  { id: 4, name: "কফি রিম (ছোট সাদা কাগজ)", category: "কাগজ", buy_price: 60, sell_price: 80, unit: "কেজি", stock: 100, minStockAlert: 20 },
  { id: 5, name: "পেপার", category: "কাগজ", buy_price: 55, sell_price: 70, unit: "কেজি", stock: 100, minStockAlert: 20 },
  { id: 6, name: "ফরমা", category: "কাগজ", buy_price: 50, sell_price: 70, unit: "কেজি", stock: 100, minStockAlert: 20 },
  { id: 7, name: "সুতলি", category: "অন্যান্য", buy_price: 210, sell_price: 240, unit: "কেজি", stock: 100, minStockAlert: 20 },
  { id: 8, name: "কাকড়া", category: "অন্যান্য", buy_price: 117, sell_price: 150, unit: "কেজি", stock: 100, minStockAlert: 20 },
  { id: 9, name: "চান্দি", category: "অন্যান্য", buy_price: 9, sell_price: 15, unit: "পিস", stock: 200, minStockAlert: 30 },
  { id: 10, name: "বেল্ট", category: "অন্যান্য", buy_price: 32, sell_price: 42, unit: "পিস", stock: 200, minStockAlert: 30 },
  { id: 11, name: "ফম", category: "অন্যান্য", buy_price: 1, sell_price: 2, unit: "পিস", stock: 500, minStockAlert: 50 },
  { id: 12, name: "কাটুন", category: "অন্যান্য", buy_price: 65, sell_price: 70, unit: "জোড়া", stock: 50, minStockAlert: 15 },
  // Sacks (Water, White, Blue, Net)
  { id: 13, name: "পানি - ২৪/৪২ (🟢 উপলব্ধ)", category: "বস্তা (পানি)", buy_price: 21, sell_price: 28, unit: "পিস", stock: 150, minStockAlert: 25 },
  { id: 14, name: "পানি - ২৮/৪৫ (🟢 উপলব্ধ)", category: "বস্তা (পানি)", buy_price: 26, sell_price: 33, unit: "পিস", stock: 150, minStockAlert: 25 },
  { id: 15, name: "পানি - ২৮/৪৪ (🟢 উপলব্ধ)", category: "বস্তা (পানি)", buy_price: 26, sell_price: 33, unit: "পিস", stock: 150, minStockAlert: 25 },
  { id: 16, name: "পানি - ২৮/৪৮ (🟢 উপলব্ধ)", category: "বস্তা (পানি)", buy_price: 28, sell_price: 34, unit: "পিস", stock: 150, minStockAlert: 25 },
  { id: 17, name: "পানি - ৩০/৫২ (🔴 স্টক নেই)", category: "বস্তা (পানি)", buy_price: 0, sell_price: 0, unit: "পিস", stock: 0, minStockAlert: 20 },
  { id: 18, name: "সাদা - ২৮/৪৬ (🔴 স্টক নেই)", category: "বস্তা (সাদা)", buy_price: 0, sell_price: 0, unit: "পিস", stock: 0, minStockAlert: 20 },
  { id: 19, name: "সাদা - ২৮/৪৮ (🔴 স্টক নেই)", category: "বস্তা (সাদা)", buy_price: 0, sell_price: 0, unit: "পিস", stock: 0, minStockAlert: 20 },
  { id: 20, name: "সাদা - ৩০/৫২ (🟢 উপলব্ধ)", category: "বস্তা (সাদা)", buy_price: 32, sell_price: 38, unit: "পিস", stock: 150, minStockAlert: 25 },
  { id: 21, name: "সাদা - ৩২/৫৬ (🟢 উপলব্ধ)", category: "বস্তা (সাদা)", buy_price: 30, sell_price: 40, unit: "পিস", stock: 150, minStockAlert: 25 },
  { id: 22, name: "নিল - ২৮/৪৮ (🟢 উপলব্ধ)", category: "বস্তা (নিল)", buy_price: 27, sell_price: 34, unit: "পিস", stock: 150, minStockAlert: 25 },
  { id: 23, name: "নিল - ৩০/৫২ (🔴 স্টক নেই)", category: "বস্তা (নিল)", buy_price: 0, sell_price: 0, unit: "পিস", stock: 0, minStockAlert: 20 },
  { id: 24, name: "নেট - ২২/৩৮ (🟢 উপলব্ধ)", category: "বস্তা (নেট)", buy_price: 21, sell_price: 26, unit: "পিস", stock: 150, minStockAlert: 25 },
  { id: 25, name: "নেট - ২৪/৩৬ (🔴 স্টক নেই)", category: "বস্তা (নেট)", buy_price: 0, sell_price: 0, unit: "পিস", stock: 0, minStockAlert: 20 },
  { id: 26, name: "নেট - ২৪/৪০ (🟢 উপলব্ধ)", category: "বস্তা (নেট)", buy_price: 24, sell_price: 28, unit: "পিস", stock: 150, minStockAlert: 25 },
  { id: 27, name: "নেট - ২৮/৪৬ (🟢 উপলব্ধ)", category: "বস্তা (নেট)", buy_price: 25, sell_price: 30, unit: "পিস", stock: 150, minStockAlert: 25 },
  { id: 28, name: "নেট - ৩০/৫২ (🟢 উপলব্ধ)", category: "বস্তা (নেট)", buy_price: 26, sell_price: 34, unit: "পিস", stock: 150, minStockAlert: 25 },
  { id: 29, name: "নেট - ৩২/৫৬ (🟢 উপলব্ধ)", category: "বস্তা (নেট)", buy_price: 34, sell_price: 40, unit: "পিস", stock: 150, minStockAlert: 25 },
];

var CATEGORIES = [
  'সব',
  'ক্যারেট',
  'কাগজ',
  'অন্যান্য',
  'বস্তা (পানি)',
  'বস্তা (সাদা)',
  'বস্তা (নিল)',
  'বস্তা (নেট)',
];

// App State
var state = {
  products: [],
  sales: [],
  currentTab: 'dashboard',
  lang: 'bn',
  posCategoryFilter: 'সব',
  productSearchTerm: '',
  productCategoryFilter: 'সব',
  productStockFilter: 'all',
  salesSearchTerm: '',
  salesDueFilter: 'all',
  editingProductId: null,
  isLoading: true,
  syncMode: 'connecting', // 'supabase' | 'local' | 'connecting'
  syncMessage: '',
};

// ----------------- NORMALIZATION & CACHE HELPERS -----------------
function normalizeProduct(raw) {
  return {
    id: Number(raw.id),
    name: String(raw.name || ''),
    category: String(raw.category || 'অন্যান্য'),
    buy_price: Number(raw.buy_price ?? raw.buyPrice ?? 0),
    sell_price: Number(raw.sell_price ?? raw.sellPrice ?? 0),
    unit: String(raw.unit || 'পিস'),
    stock: Number(raw.stock ?? 0),
    minStockAlert: Number(raw.minStockAlert ?? raw.min_stock_alert ?? 15),
  };
}

function normalizeSale(raw) {
  var parsedItems = [];
  if (Array.isArray(raw.items)) {
    parsedItems = raw.items;
  } else if (typeof raw.items === 'string') {
    try {
      var tmp = JSON.parse(raw.items);
      if (Array.isArray(tmp)) parsedItems = tmp;
    } catch (e) {
      parsedItems = [];
    }
  }

  var totalAmount = Number(raw.totalAmount ?? raw.total_amount ?? 0);
  var discount = Number(raw.discount ?? 0);
  var netPayable = Number(raw.netPayable ?? raw.net_payable ?? Math.max(0, totalAmount - discount));
  var paidAmount = Number(raw.paidAmount ?? raw.paid_amount ?? netPayable);
  var dueAmount = Number(raw.dueAmount ?? raw.due_amount ?? Math.max(0, netPayable - paidAmount));
  var totalCost = Number(raw.totalCost ?? raw.total_cost ?? 0);
  var profit = Number(raw.profit ?? (netPayable - totalCost));

  return {
    id: String(raw.id),
    memoNo: String(raw.memoNo ?? raw.memo_no ?? ('MEMO-' + String(raw.id).slice(-4))),
    customerName: String(raw.customerName ?? raw.customer_name ?? 'অজানা কাস্টমার'),
    customerPhone: raw.customerPhone ?? raw.customer_phone ?? '',
    items: parsedItems,
    totalAmount: totalAmount,
    totalCost: totalCost,
    profit: profit,
    discount: discount,
    netPayable: netPayable,
    paidAmount: paidAmount,
    dueAmount: dueAmount,
    paymentMethod: String(raw.paymentMethod ?? raw.payment_method ?? 'ক্যাশ (Cash)'),
    date: String(raw.date || new Date().toISOString().slice(0, 16).replace('T', ' ')),
    note: raw.note || '',
  };
}

function loadLocalProducts() {
  try {
    var saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (saved) {
      var parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(normalizeProduct);
      }
    }
  } catch (e) {}
  return JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
}

function loadLocalSales() {
  try {
    var saved = localStorage.getItem(STORAGE_KEYS.SALES);
    if (saved) {
      var parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.map(normalizeSale);
      }
    }
  } catch (e) {}
  return [];
}

function saveLocalProducts() {
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(state.products));
  } catch (e) {}
}

function saveLocalSales() {
  try {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(state.sales));
  } catch (e) {}
}

// ----------------- SUPABASE + LOCAL STORAGE SYNC -----------------
async function loadState() {
  state.isLoading = true;
  render();

  try {
    var savedLang = localStorage.getItem(STORAGE_KEYS.LANG);
    if (savedLang === 'bn' || savedLang === 'en') state.lang = savedLang;
  } catch (e) {}

  var fallbackProducts = loadLocalProducts();
  var fallbackSales = loadLocalSales();

  if (!supabaseClient) {
    state.products = fallbackProducts;
    state.sales = fallbackSales;
    state.syncMode = 'local';
    state.syncMessage = 'Supabase SDK লোড হয়নি, লোকাল স্টোরেজে চলছে';
    state.isLoading = false;
    render();
    return;
  }

  try {
    var prodRes = await supabaseClient
      .from('products')
      .select('*')
      .order('id', { ascending: true });

    var salesRes = await supabaseClient
      .from('sales')
      .select('*')
      .order('date', { ascending: false });

    if (prodRes.error || salesRes.error) {
      var errMsg = (prodRes.error && prodRes.error.message) || (salesRes.error && salesRes.error.message) || 'Unknown error';
      console.warn('Supabase query error, using localStorage fallback:', errMsg);
      state.products = fallbackProducts;
      state.sales = fallbackSales;
      state.syncMode = 'local';
      state.syncMessage = errMsg;
    } else {
      if (prodRes.data && prodRes.data.length > 0) {
        state.products = prodRes.data.map(normalizeProduct);
      } else {
        // Seed initial 29 products to Supabase if table is empty
        state.products = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
        var seedRes = await supabaseClient.from('products').upsert(state.products);
        if (seedRes.error) {
          console.warn('Could not auto-seed products to Supabase:', seedRes.error.message);
        }
      }

      state.sales = (salesRes.data || []).map(normalizeSale);
      state.syncMode = 'supabase';
      state.syncMessage = '';

      saveLocalProducts();
      saveLocalSales();
    }
  } catch (error) {
    console.warn('Failed to connect to Supabase, using localStorage fallback:', error);
    state.products = fallbackProducts;
    state.sales = fallbackSales;
    state.syncMode = 'local';
    state.syncMessage = error && error.message ? error.message : 'Network error';
  }

  state.isLoading = false;
  render();
}

async function saveProductToDb(product) {
  saveLocalProducts();
  if (!supabaseClient) return;
  try {
    var res = await supabaseClient.from('products').upsert([product]);
    if (res.error) {
      console.error('Error saving product to Supabase:', res.error.message);
    } else {
      state.syncMode = 'supabase';
    }
  } catch (err) {
    console.error('Failed to save product to Supabase:', err);
  }
}

async function saveAllProductsToDb() {
  saveLocalProducts();
  if (!supabaseClient) return;
  try {
    var res = await supabaseClient.from('products').upsert(state.products);
    if (res.error) {
      console.error('Error saving products to Supabase:', res.error.message);
    }
  } catch (err) {
    console.error('Failed to save products to Supabase:', err);
  }
}

async function deleteProductFromDb(prodId) {
  saveLocalProducts();
  if (!supabaseClient) return;
  try {
    var res = await supabaseClient.from('products').delete().eq('id', prodId);
    if (res.error) {
      console.error('Error deleting product from Supabase:', res.error.message);
    }
  } catch (err) {
    console.error('Failed to delete product from Supabase:', err);
  }
}

async function insertSaleToDb(saleRecord) {
  saveLocalSales();
  if (!supabaseClient) return;
  try {
    var res = await supabaseClient.from('sales').insert([saleRecord]);
    if (res.error) {
      console.error('Error saving sale to Supabase:', res.error.message);
    } else {
      state.syncMode = 'supabase';
    }
  } catch (err) {
    console.error('Failed to save sale to Supabase:', err);
  }
}

async function deleteSaleFromDb(saleId) {
  saveLocalSales();
  if (!supabaseClient) return;
  try {
    var res = await supabaseClient.from('sales').delete().eq('id', saleId);
    if (res.error) {
      console.error('Error deleting sale from Supabase:', res.error.message);
    }
  } catch (err) {
    console.error('Failed to delete sale from Supabase:', err);
  }
}

// Helpers
function formatTaka(num) {
  return '৳ ' + (Math.round((num || 0) * 100) / 100).toLocaleString('en-US');
}

function generateMemoNo() {
  var count = state.sales.length + 101;
  return 'MEMO-' + count.toString().padStart(4, '0');
}

function updateFooterSyncStatus() {
  var footerEl = document.getElementById('db-sync-footer');
  if (!footerEl) return;
  var isBn = state.lang === 'bn';
  var syncLabel = state.syncMode === 'supabase'
    ? (isBn ? 'Supabase সংযুক্ত' : 'Supabase Synced')
    : (isBn ? 'লোকাল ব্যাকআপ মোড' : 'Local Backup Mode');
  footerEl.textContent = (isBn ? 'মুদ্রা: ৳ (টাকা)' : 'Currency: ৳ (BDT)') +
    ' · ' + state.products.length + (isBn ? 'টি পণ্য' : ' products') +
    ' · ' + syncLabel;
}

// Render Current Tab
function render() {
  document.querySelectorAll('.nav-item').forEach(function(el) {
    el.classList.toggle('active', el.dataset.tab === state.currentTab);
  });
  document.querySelectorAll('.mobile-nav-item').forEach(function(el) {
    el.classList.toggle('active', el.dataset.tab === state.currentTab);
  });

  var langBtn = document.getElementById('lang-toggle-btn');
  if (langBtn) {
    langBtn.textContent = state.lang === 'bn' ? 'English' : 'বাংলা';
  }

  updateFooterSyncStatus();

  var main = document.getElementById('app-main-content');
  if (!main) return;

  if (state.isLoading) {
    var isBn = state.lang === 'bn';
    main.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <div>${isBn ? 'ডাটাবেজ থেকে তথ্য লোড হচ্ছে...' : 'Loading inventory & sales from database...'}</div>
      </div>
    `;
    return;
  }

  if (state.currentTab === 'dashboard') {
    renderDashboard(main);
  } else if (state.currentTab === 'products') {
    renderProducts(main);
  } else if (state.currentTab === 'history') {
    renderHistory(main);
  } else if (state.currentTab === 'restock') {
    renderRestock(main);
  }
}

function renderSyncNoticeBanner() {
  if (state.syncMode !== 'local' || !state.syncMessage) return '';
  var isBn = state.lang === 'bn';
  return `
    <div class="sync-banner">
      <div>
        <strong>${isBn ? 'লোকাল ব্যাকআপ মোডে চলছে:' : 'Running in Local Backup Mode:'}</strong>
        <span>${isBn ? 'Supabase টেবিল পাওয়া যায়নি বা সংযোগ বিচ্ছিন্ন রয়েছে।' : 'Supabase table missing or unreachable.'} (${state.syncMessage})</span>
      </div>
      <button type="button" class="btn btn-outline btn-sm" onclick="loadState()">
        🔄 ${isBn ? 'আবার চেষ্টা করুন' : 'Retry Sync'}
      </button>
    </div>
  `;
}

// ----------------- 1. DASHBOARD & POS -----------------
function renderDashboard(container) {
  var isBn = state.lang === 'bn';
  var availableProducts = state.products.filter(function(p) { return p.stock > 0 && p.sell_price > 0; });

  // KPI Calculations
  var totalTypes = state.products.length;
  var totalStockUnits = state.products.reduce(function(acc, p) { return acc + p.stock; }, 0);
  var totalSalesCount = state.sales.length;
  var totalRevenue = state.sales.reduce(function(acc, s) { return acc + s.netPayable; }, 0);
  var totalProfit = state.sales.reduce(function(acc, s) { return acc + s.profit; }, 0);
  var totalDue = state.sales.reduce(function(acc, s) { return acc + s.dueAmount; }, 0);
  var lowStockCount = state.products.filter(function(p) { return p.stock <= (p.minStockAlert || 15); }).length;

  var filteredPosProducts = availableProducts.filter(function(p) {
    return state.posCategoryFilter === 'সব' || p.category === state.posCategoryFilter;
  });

  container.innerHTML = `
    ${renderSyncNoticeBanner()}

    <!-- KPI Grid -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-header">
          <span>${isBn ? 'মোট পণ্যের ধরন' : 'Product Types'}</span>
          <span>📦</span>
        </div>
        <div class="kpi-value tabular-nums">${totalTypes} <small style="font-size:0.75rem">${isBn ? 'টি' : 'items'}</small></div>
        <div class="kpi-subtext">${isBn ? 'উপলব্ধ:' : 'In stock:'} ${availableProducts.length} ${isBn ? 'টি' : ''}</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-header">
          <span>${isBn ? 'মোট স্টক মজুদ' : 'Total Stock'}</span>
          <span>📊</span>
        </div>
        <div class="kpi-value tabular-nums">${totalStockUnits.toLocaleString()}</div>
        <div class="kpi-subtext">${isBn ? 'সকল আইটেম মিলিয়ে' : 'Across all items'}</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-header">
          <span>${isBn ? 'মোট বিক্রির এন্ট্রি' : 'Sales Records'}</span>
          <span>🧾</span>
        </div>
        <div class="kpi-value tabular-nums">${totalSalesCount} <small style="font-size:0.75rem">${isBn ? 'বার' : 'txns'}</small></div>
        <div class="kpi-subtext">${isBn ? 'সম্পন্ন মেমো' : 'Invoices logged'}</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-header">
          <span>${isBn ? 'মোট বিক্রয়মূল্য' : 'Total Revenue'}</span>
          <span>📈</span>
        </div>
        <div class="kpi-value tabular-nums" style="color:var(--color-primary)">${formatTaka(totalRevenue)}</div>
        <div class="kpi-subtext">${isBn ? 'মোট ক্যাশ ও পাওনা' : 'Gross sales'}</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-header">
          <span>${isBn ? 'মোট নীট লাভ' : 'Total Profit'}</span>
          <span>💰</span>
        </div>
        <div class="kpi-value tabular-nums" style="color:#4f46e5">${formatTaka(totalProfit)}</div>
        <div class="kpi-subtext">${totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) + '% ' + (isBn ? 'মার্জিন' : 'margin') : '0%'}</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-header">
          <span>${isBn ? 'বাকি পাওনা টাকা' : 'Due Receivables'}</span>
          <span>⚠️</span>
        </div>
        <div class="kpi-value tabular-nums" style="color:${totalDue > 0 ? 'var(--color-warning)' : 'inherit'}">${formatTaka(totalDue)}</div>
        <div class="kpi-subtext">${lowStockCount > 0 ? lowStockCount + ' ' + (isBn ? 'আইটেমে কম স্টক' : 'items low') : (isBn ? 'স্টক সন্তোষজনক' : 'Healthy')}</div>
      </div>
    </div>

    <!-- POS Section -->
    <div class="pos-layout">
      <!-- Sales Form -->
      <div class="panel">
        <div class="panel-header">
          <div class="panel-title">
            <span>🛒</span>
            <span>${isBn ? 'নতুন কাস্টমার সেলস এন্ট্রি (POS)' : 'New Customer Sale Entry'}</span>
          </div>
          <span style="font-size:0.75rem; color:var(--color-text-subtle)">${isBn ? 'স্বয়ংক্রিয় স্টক সমন্বয়' : 'Auto Stock Deduction'}</span>
        </div>
        <div class="panel-body">
          <form id="pos-sale-form">
            <div class="grid-2 form-group">
              <div>
                <label class="form-label">${isBn ? 'কাস্টমারের নাম' : 'Customer Name'} *</label>
                <input type="text" id="pos-customer-name" class="form-control" placeholder="${isBn ? 'যেমন: হাজী রফিকুল ইসলাম' : 'e.g. Rahim Trading'}" required />
              </div>
              <div>
                <label class="form-label">${isBn ? 'মোবাইল নম্বর (ঐচ্ছিক)' : 'Phone Number (Optional)'}</label>
                <input type="text" id="pos-customer-phone" class="form-control" placeholder="017xxxxxxxx" />
              </div>
            </div>

            <!-- Category Chips -->
            <div class="form-group">
              <label class="form-label">${isBn ? 'ক্যাটাগরি বাছাই করে দ্রুত খুঁজুন' : 'Filter by Category'}</label>
              <div class="chip-group">
                ${CATEGORIES.map(function(c) {
                  return '<button type="button" class="chip ' + (state.posCategoryFilter === c ? 'active' : '') + '" onclick="setPosCategory(\'' + c + '\')">' + c + '</button>';
                }).join('')}
              </div>
            </div>

            <!-- Product Select -->
            <div class="form-group">
              <label class="form-label">${isBn ? 'পণ্য নির্বাচন করুন' : 'Select Product'} *</label>
              <select id="pos-product-select" class="form-control" onchange="updatePosPreview()">
                ${filteredPosProducts.length === 0
                  ? '<option value="">' + (isBn ? 'এই ক্যাটাগরিতে স্টক নেই' : 'No available stock in category') + '</option>'
                  : filteredPosProducts.map(function(p) {
                      return '<option value="' + p.id + '">' + p.name + ' — ' + p.category + ' [স্টক: ' + p.stock + ' ' + p.unit + ' | দর: ৳' + p.sell_price + ']</option>';
                    }).join('')}
              </select>
            </div>

            <!-- Live Product Preview Box -->
            <div id="pos-product-preview" class="product-preview-box"></div>

            <!-- Quantity & Custom Price -->
            <div class="grid-2 form-group">
              <div>
                <label class="form-label">${isBn ? 'পরিমাণ' : 'Quantity'} *</label>
                <div class="qty-stepper">
                  <button type="button" class="qty-btn" onclick="adjustPosQty(-1)">-</button>
                  <input type="number" id="pos-qty" class="form-control qty-input font-mono" value="1" min="1" step="any" oninput="updatePosCalculations()" required />
                  <button type="button" class="qty-btn" onclick="adjustPosQty(1)">+</button>
                </div>
              </div>
              <div>
                <label class="form-label">${isBn ? 'বিশেষ বিক্রয় দর (৳) (ঐচ্ছিক)' : 'Custom Rate (৳)'}</label>
                <input type="number" id="pos-custom-rate" class="form-control font-mono" placeholder="${isBn ? 'ডিফল্ট রেট ব্যবহার হবে' : 'Default rate'}" oninput="updatePosCalculations()" />
              </div>
            </div>

            <!-- Payment mode, Discount, Paid -->
            <div class="grid-3 form-group">
              <div>
                <label class="form-label">${isBn ? 'পেমেন্ট মাধ্যম' : 'Payment Method'}</label>
                <select id="pos-payment-method" class="form-control">
                  <option value="ক্যাশ (Cash)">ক্যাশ (Cash)</option>
                  <option value="বিকাশ (bKash)">বিকাশ (bKash)</option>
                  <option value="নগদ (Nagad)">নগদ (Nagad)</option>
                  <option value="ব্যাংক (Bank)">ব্যাংক (Bank)</option>
                  <option value="বাকি (Due)">বাকি (Due)</option>
                </select>
              </div>
              <div>
                <label class="form-label">${isBn ? 'ছাড় / ডিসকাউন্ট (৳)' : 'Discount (৳)'}</label>
                <input type="number" id="pos-discount" class="form-control font-mono" value="0" min="0" oninput="updatePosCalculations()" />
              </div>
              <div>
                <label class="form-label">${isBn ? 'পরিশোধিত টাকা (৳)' : 'Paid Amount (৳)'}</label>
                <input type="number" id="pos-paid" class="form-control font-mono" placeholder="${isBn ? 'পূর্ণ টাকা' : 'Full amount'}" oninput="updatePosCalculations()" />
              </div>
            </div>

            <!-- Memo Note -->
            <div class="form-group">
              <label class="form-label">${isBn ? 'চালানের বিবরণ বা নোট (ঐচ্ছিক)' : 'Memo Note (Optional)'}</label>
              <input type="text" id="pos-note" class="form-control" placeholder="${isBn ? 'যেমন: আড়তে ডেলিভারি দেওয়া হয়েছে' : 'Delivery details...'}" />
            </div>

            <button type="submit" class="btn btn-primary" style="width:100%; padding:12px; font-size:0.9375rem">
              <span>✓</span>
              <span>${isBn ? 'বিক্রি নিশ্চিত করুন (Confirm Sale)' : 'Confirm Sale'}</span>
            </button>
          </form>
        </div>
      </div>

      <!-- Live Calculations & Quick Overview -->
      <div>
        <div class="panel" style="margin-bottom:20px;">
          <div class="panel-header">
            <span class="panel-title">${isBn ? 'চলতি বিক্রয় হিসাব ও লাভ' : 'Live Calculation'}</span>
          </div>
          <div class="panel-body" id="pos-calculations-box"></div>
        </div>

        <div class="panel">
          <div class="panel-header">
            <span class="panel-title">${isBn ? 'জনপ্রিয় আইটেম স্টক' : 'Popular Items Stock'}</span>
          </div>
          <div class="panel-body" style="padding:10px 16px;">
            ${state.products.slice(0, 6).map(function(p) {
              return `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid var(--color-border-subtle); font-size:0.75rem;">
                  <div>
                    <div style="font-weight:600">${p.name}</div>
                    <div style="color:var(--color-text-subtle); font-size:0.6875rem">৳${p.sell_price} / ${p.unit}</div>
                  </div>
                  <div class="text-right">
                    <div class="font-mono" style="font-weight:700; color:${p.stock === 0 ? 'var(--color-danger)' : (p.stock < 20 ? 'var(--color-warning)' : 'var(--color-primary)')}">
                      ${p.stock} ${p.unit}
                    </div>
                    <div style="font-size:0.625rem; color:var(--color-text-subtle)">
                      ${p.stock === 0 ? (isBn ? 'স্টক নেই' : 'Out of stock') : (isBn ? 'মজুদ আছে' : 'Available')}
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    </div>

    <!-- Recent 5 Sales Ledger -->
    ${state.sales.length > 0 ? `
      <div class="panel" style="margin-top:24px;">
        <div class="panel-header">
          <span class="panel-title">${isBn ? 'সর্বশেষ বিক্রয়সমূহ' : 'Recent Sales Records'}</span>
          <span style="font-size:0.75rem; color:var(--color-text-subtle)">${isBn ? 'মোট ' + state.sales.length + ' টির মধ্যে শেষ ৫টি' : 'Showing last 5 of ' + state.sales.length}</span>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>${isBn ? 'মেমো নং' : 'Memo'}</th>
                <th>${isBn ? 'তারিখ' : 'Date'}</th>
                <th>${isBn ? 'কাস্টমার' : 'Customer'}</th>
                <th>${isBn ? 'পণ্য ও পরিমাণ' : 'Products & Qty'}</th>
                <th class="text-right">${isBn ? 'মোট টাকা' : 'Total'}</th>
                <th class="text-right">${isBn ? 'লাভ' : 'Profit'}</th>
                <th class="text-center">${isBn ? 'পেমেন্ট' : 'Payment'}</th>
                <th class="text-center">${isBn ? 'রসিদ' : 'Receipt'}</th>
              </tr>
            </thead>
            <tbody>
              ${state.sales.slice(0, 5).map(function(sale) {
                var itemsText = (sale.items || []).map(function(it) {
                  return it.productName + ' (' + it.quantity + ' ' + it.unit + ')';
                }).join(', ');
                return `
                  <tr>
                    <td class="font-mono" style="font-weight:700">${sale.memoNo}</td>
                    <td style="color:var(--color-text-subtle)">${sale.date}</td>
                    <td style="font-weight:600">${sale.customerName}</td>
                    <td>${itemsText || '-'}</td>
                    <td class="text-right font-mono" style="font-weight:700">${formatTaka(sale.netPayable)}</td>
                    <td class="text-right font-mono" style="font-weight:700; color:var(--color-primary)">${formatTaka(sale.profit)}</td>
                    <td class="text-center">
                      <div>${sale.paymentMethod}</div>
                      ${sale.dueAmount > 0 ? '<div style="color:var(--color-danger); font-size:0.6875rem; font-weight:600">বাকি: ৳' + sale.dueAmount + '</div>' : ''}
                    </td>
                    <td class="text-center">
                      <button class="btn btn-outline btn-sm" onclick="showInvoiceModal('${sale.id}')">
                        👁️ ${isBn ? 'মেমো' : 'Memo'}
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    ` : ''}
  `;

  var form = document.getElementById('pos-sale-form');
  if (form) {
    form.onsubmit = handlePosSubmit;
  }
  updatePosPreview();
}

window.setPosCategory = function(cat) {
  state.posCategoryFilter = cat;
  renderDashboard(document.getElementById('app-main-content'));
};

window.adjustPosQty = function(delta) {
  var input = document.getElementById('pos-qty');
  if (input) {
    var val = Math.max(1, (parseFloat(input.value) || 1) + delta);
    input.value = val;
    updatePosCalculations();
  }
};

window.updatePosPreview = function() {
  var select = document.getElementById('pos-product-select');
  var preview = document.getElementById('pos-product-preview');
  if (!select || !preview) return;

  var prodId = parseInt(select.value, 10);
  var prod = state.products.find(function(p) { return p.id === prodId; });
  var isBn = state.lang === 'bn';

  if (!prod) {
    preview.innerHTML = '<span style="font-size:0.75rem; color:var(--color-text-subtle)">' + (isBn ? 'কোনো পণ্য সিলেক্ট করা নেই' : 'No product selected') + '</span>';
    updatePosCalculations();
    return;
  }

  preview.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.8125rem;">
      <strong style="color:var(--color-text-main)">${prod.name}</strong>
      <span style="color:var(--color-text-subtle); font-size:0.75rem">${prod.category}</span>
    </div>
    <div class="product-preview-stats">
      <div class="mini-stat">
        <span class="mini-stat-label">${isBn ? 'ক্রয়মূল্য' : 'Cost Rate'}</span>
        <span class="mini-stat-value font-mono">৳${prod.buy_price}</span>
        <span style="font-size:0.625rem; color:var(--color-text-subtle)">/${prod.unit}</span>
      </div>
      <div class="mini-stat">
        <span class="mini-stat-label">${isBn ? 'নির্ধারিত বিক্রয়মূল্য' : 'Sell Rate'}</span>
        <span class="mini-stat-value font-mono" style="color:var(--color-primary)">৳${prod.sell_price}</span>
        <span style="font-size:0.625rem; color:var(--color-text-subtle)">/${prod.unit}</span>
      </div>
      <div class="mini-stat">
        <span class="mini-stat-label">${isBn ? 'বর্তমান স্টক' : 'Stock'}</span>
        <span class="mini-stat-value font-mono" style="color:${prod.stock <= (prod.minStockAlert || 15) ? 'var(--color-danger)' : 'var(--color-text-main)'}">
          ${prod.stock} ${prod.unit}
        </span>
      </div>
    </div>
  `;

  updatePosCalculations();
};

window.updatePosCalculations = function() {
  var calcBox = document.getElementById('pos-calculations-box');
  var select = document.getElementById('pos-product-select');
  var qtyInput = document.getElementById('pos-qty');
  var customRateInput = document.getElementById('pos-custom-rate');
  var discountInput = document.getElementById('pos-discount');
  var paidInput = document.getElementById('pos-paid');
  if (!calcBox || !select) return;

  var prodId = parseInt(select.value, 10);
  var prod = state.products.find(function(p) { return p.id === prodId; });
  var isBn = state.lang === 'bn';
  if (!prod) {
    calcBox.innerHTML = '<div style="font-size:0.75rem; color:var(--color-text-subtle)">' + (isBn ? 'হিসাব দেখতে একটি পণ্য নির্বাচন করুন' : 'Select a product to calculate') + '</div>';
    return;
  }

  var qty = parseFloat(qtyInput ? qtyInput.value : 1) || 1;
  var customRate = customRateInput && customRateInput.value !== '' ? parseFloat(customRateInput.value) : prod.sell_price;
  var discount = parseFloat(discountInput ? discountInput.value : 0) || 0;

  var totalAmount = qty * customRate;
  var totalCost = qty * prod.buy_price;
  var netPayable = Math.max(0, totalAmount - discount);
  var paid = paidInput && paidInput.value !== '' ? parseFloat(paidInput.value) : netPayable;
  var due = Math.max(0, netPayable - paid);
  var profit = netPayable - totalCost;
  var marginPct = netPayable > 0 ? ((profit / netPayable) * 100).toFixed(1) : '0';

  calcBox.innerHTML = `
    <div class="calc-row">
      <span>${isBn ? 'মোট বিক্রয়মূল্য:' : 'Subtotal:'}</span>
      <span class="font-mono tabular-nums" style="font-weight:700; color:var(--color-text-main)">${formatTaka(totalAmount)}</span>
    </div>
    ${discount > 0 ? `
      <div class="calc-row" style="color:var(--color-danger)">
        <span>${isBn ? 'ছাড় / ডিসকাউন্ট:' : 'Discount:'}</span>
        <span class="font-mono tabular-nums">- ${formatTaka(discount)}</span>
      </div>
    ` : ''}
    <div class="calc-row total">
      <span>${isBn ? 'সর্বমোট প্রদেয় টাকা:' : 'Net Payable:'}</span>
      <span class="font-mono tabular-nums" style="color:var(--color-primary)">${formatTaka(netPayable)}</span>
    </div>
    <div class="calc-row">
      <span>${isBn ? 'আসল ক্রয় খরচ:' : 'Total Cost:'}</span>
      <span class="font-mono tabular-nums">${formatTaka(totalCost)}</span>
    </div>

    <div class="profit-badge-box">
      <div>
        <div style="font-weight:700; font-size:0.75rem; color:#065f46">${isBn ? 'সম্ভাব্য নীট লাভ:' : 'Net Profit:'}</div>
        <div style="font-size:0.6875rem; color:#047857">${marginPct}% ${isBn ? 'মার্জিন' : 'margin'}</div>
      </div>
      <div class="font-mono" style="font-size:1.1rem; font-weight:700; color:#065f46">
        ${formatTaka(profit)}
      </div>
    </div>

    ${due > 0 ? `
      <div class="due-warning-box">
        <span style="font-size:0.75rem; font-weight:600; color:#92400e">${isBn ? 'বাকি থাকবে (Due):' : 'Due Balance:'}</span>
        <span class="font-mono" style="font-weight:700; color:#b45309">${formatTaka(due)}</span>
      </div>
    ` : ''}
  `;
};

async function handlePosSubmit(e) {
  e.preventDefault();
  var isBn = state.lang === 'bn';
  var customerName = document.getElementById('pos-customer-name').value.trim();
  var customerPhone = document.getElementById('pos-customer-phone').value.trim();
  var select = document.getElementById('pos-product-select');
  var qtyInput = document.getElementById('pos-qty');
  var customRateInput = document.getElementById('pos-custom-rate');
  var paymentMethod = document.getElementById('pos-payment-method').value;
  var discountInput = document.getElementById('pos-discount');
  var paidInput = document.getElementById('pos-paid');
  var noteInput = document.getElementById('pos-note');

  if (!customerName) {
    alert(isBn ? 'দয়া করে কাস্টমারের নাম লিখুন!' : 'Please enter customer name!');
    return;
  }

  var prodId = parseInt(select.value, 10);
  var prod = state.products.find(function(p) { return p.id === prodId; });
  if (!prod) {
    alert(isBn ? 'দয়া করে পণ্য নির্বাচন করুন!' : 'Please select a product!');
    return;
  }

  var qty = parseFloat(qtyInput.value) || 1;
  if (qty <= 0) {
    alert(isBn ? 'পরিমাণ অবশ্যই ০ এর বেশি হতে হবে!' : 'Quantity must be greater than 0!');
    return;
  }
  if (qty > prod.stock) {
    alert(isBn ? 'অপর্যাপ্ত স্টক! স্টকে আছে মাত্র ' + prod.stock + ' ' + prod.unit : 'Insufficient stock! Only ' + prod.stock + ' available');
    return;
  }

  var customRate = customRateInput.value !== '' ? parseFloat(customRateInput.value) : prod.sell_price;
  var discount = parseFloat(discountInput.value) || 0;
  var totalAmount = qty * customRate;
  var totalCost = qty * prod.buy_price;
  var netPayable = Math.max(0, totalAmount - discount);
  var paid = paidInput.value !== '' ? parseFloat(paidInput.value) : netPayable;
  var due = Math.max(0, netPayable - paid);
  var profit = netPayable - totalCost;

  var saleRecord = {
    id: 'sale_' + Date.now(),
    memoNo: generateMemoNo(),
    customerName: customerName,
    customerPhone: customerPhone || '',
    items: [{
      productId: prod.id,
      productName: prod.name,
      category: prod.category,
      quantity: qty,
      unit: prod.unit,
      buyPrice: prod.buy_price,
      sellPrice: customRate,
      totalCost: totalCost,
      totalAmount: totalAmount,
      profit: profit,
    }],
    totalAmount: totalAmount,
    totalCost: totalCost,
    profit: profit,
    discount: discount,
    netPayable: netPayable,
    paidAmount: paid,
    dueAmount: due,
    paymentMethod: paymentMethod,
    date: new Date().toISOString().slice(0, 16).replace('T', ' '),
    note: noteInput.value.trim() || '',
  };

  // 1. Deduct stock & sync product
  prod.stock = Math.max(0, prod.stock - qty);
  await saveProductToDb(prod);

  // 2. Prepend sale & sync sale
  state.sales.unshift(saleRecord);
  await insertSaleToDb(saleRecord);

  // 3. Re-render and open Cash Memo
  render();
  showInvoiceModal(saleRecord.id);
}

// ----------------- 2. PRODUCT MANAGEMENT -----------------
function renderProducts(container) {
  var isBn = state.lang === 'bn';

  var totalCostVal = state.products.reduce(function(acc, p) { return acc + (p.stock * p.buy_price); }, 0);
  var totalRetailVal = state.products.reduce(function(acc, p) { return acc + (p.stock * p.sell_price); }, 0);
  var totalPotentialProfit = totalRetailVal - totalCostVal;
  var inStockCount = state.products.filter(function(p) { return p.stock > 0; }).length;
  var outOfStockCount = state.products.filter(function(p) { return p.stock === 0; }).length;

  var filtered = state.products.filter(function(p) {
    var matchSearch = p.name.toLowerCase().includes(state.productSearchTerm.toLowerCase()) ||
                      p.category.toLowerCase().includes(state.productSearchTerm.toLowerCase());
    var matchCat = state.productCategoryFilter === 'সব' || p.category === state.productCategoryFilter;
    var matchStock = state.productStockFilter === 'all' ? true :
                     state.productStockFilter === 'in_stock' ? p.stock > 0 : p.stock === 0;
    return matchSearch && matchCat && matchStock;
  });

  container.innerHTML = `
    ${renderSyncNoticeBanner()}

    <!-- Inventory Valuation Cards -->
    <div class="kpi-grid" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));">
      <div class="kpi-card">
        <div class="kpi-header">
          <span>${isBn ? 'মোট ইনভেন্টরি ক্রয়মূল্য' : 'Total Stock Cost'}</span>
          <span>💰</span>
        </div>
        <div class="kpi-value tabular-nums">${formatTaka(totalCostVal)}</div>
        <div class="kpi-subtext">${isBn ? 'গুদামের মালের আসল ক্রয় খরচ' : 'Valuation at cost'}</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-header">
          <span>${isBn ? 'মোট খুচরা বিক্রয়মূল্য' : 'Retail Value'}</span>
          <span>📈</span>
        </div>
        <div class="kpi-value tabular-nums" style="color:var(--color-primary)">${formatTaka(totalRetailVal)}</div>
        <div class="kpi-subtext">${isBn ? 'বর্তমান বিক্রয় দরে' : 'Current retail value'}</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-header">
          <span>${isBn ? 'সম্ভাব্য মোট লাভ' : 'Potential Profit'}</span>
          <span>✨</span>
        </div>
        <div class="kpi-value tabular-nums" style="color:#4f46e5">${formatTaka(totalPotentialProfit)}</div>
        <div class="kpi-subtext">${totalRetailVal > 0 ? ((totalPotentialProfit / totalRetailVal) * 100).toFixed(1) + '% ' + (isBn ? 'মার্জিন' : 'margin') : '0%'}</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-header">
          <span>${isBn ? 'মজুদ অবস্থা' : 'Stock Breakdown'}</span>
          <span>📦</span>
        </div>
        <div class="kpi-value" style="font-size:1.1rem">
          <span style="color:var(--color-primary)">${inStockCount} ${isBn ? 'উপলব্ধ' : 'available'}</span>
          <span style="color:var(--color-border); font-weight:normal">/</span>
          <span style="color:var(--color-danger)">${outOfStockCount} ${isBn ? 'শূন্য' : 'out'}</span>
        </div>
        <div class="kpi-subtext">${state.products.length} ${isBn ? 'ধরনের প্যাকেজিং পণ্য' : 'total items'}</div>
      </div>
    </div>

    <!-- Product Table Panel -->
    <div class="panel">
      <div class="panel-header" style="flex-wrap:wrap; gap:10px;">
        <div style="display:flex; align-items:center; gap:8px; flex:1; min-width:240px;">
          <input type="text" id="prod-search-input" class="form-control" style="max-width:320px;" placeholder="${isBn ? 'পণ্যের নাম বা সাইজ খুঁজুন...' : 'Search product or size...'}" value="${state.productSearchTerm}" oninput="handleProductSearch(this.value)" />
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <button class="btn btn-outline" onclick="exportProductsCSV()">
            📥 ${isBn ? 'CSV ডাউনলোড' : 'Export CSV'}
          </button>
          <button class="btn btn-primary" onclick="showProductModal(null)">
            + ${isBn ? 'নতুন পণ্য যোগ করুন' : 'Add Product'}
          </button>
        </div>
      </div>

      <!-- Filters Strip -->
      <div style="padding:10px 20px; background-color:#fafbfc; border-bottom:1px solid var(--color-border); display:flex; flex-wrap:wrap; justify-content:space-between; gap:10px; font-size:0.75rem;">
        <div style="display:flex; flex-wrap:wrap; align-items:center; gap:6px;">
          <span style="color:var(--color-text-subtle); margin-right:4px;">${isBn ? 'ক্যাটাগরি:' : 'Category:'}</span>
          ${CATEGORIES.map(function(c) {
            return '<button class="chip ' + (state.productCategoryFilter === c ? 'active' : '') + '" onclick="setProductCategoryFilter(\'' + c + '\')">' + c + '</button>';
          }).join('')}
        </div>
        <div style="display:flex; align-items:center; gap:4px; background:var(--color-surface-muted); padding:2px; border-radius:6px;">
          <button class="chip ${state.productStockFilter === 'all' ? 'active' : ''}" style="margin:0" onclick="setProductStockFilter('all')">${isBn ? 'সব' : 'All'}</button>
          <button class="chip ${state.productStockFilter === 'in_stock' ? 'active' : ''}" style="margin:0" onclick="setProductStockFilter('in_stock')">${isBn ? 'উপলব্ধ' : 'In Stock'}</button>
          <button class="chip ${state.productStockFilter === 'out_of_stock' ? 'active' : ''}" style="margin:0" onclick="setProductStockFilter('out_of_stock')">${isBn ? 'স্টক শেষ' : 'Empty'}</button>
        </div>
      </div>

      <!-- Table -->
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th class="text-center" style="width:40px">ID</th>
              <th>${isBn ? 'পণ্যের নাম ও সাইজ' : 'Product Name & Size'}</th>
              <th>${isBn ? 'ক্যাটাগরি' : 'Category'}</th>
              <th class="text-right">${isBn ? 'ক্রয়মূল্য (৳)' : 'Buy Rate (৳)'}</th>
              <th class="text-right">${isBn ? 'বিক্রয়মূল্য (৳)' : 'Sell Rate (৳)'}</th>
              <th class="text-right">${isBn ? 'লাভ প্রতি একক' : 'Profit / Unit'}</th>
              <th class="text-center">${isBn ? 'ইউনিট' : 'Unit'}</th>
              <th class="text-center">${isBn ? 'মজুদ স্টক' : 'Stock'}</th>
              <th class="text-center">${isBn ? 'স্ট্যাটাস' : 'Status'}</th>
              <th class="text-right">${isBn ? 'অ্যাকশন ও রিস্টক' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.length === 0 ? `
              <tr>
                <td colspan="10" class="text-center" style="padding:40px; color:var(--color-text-subtle)">
                  ${isBn ? 'কোনো পণ্য খুঁজে পাওয়া যায়নি' : 'No products found'}
                </td>
              </tr>
            ` : filtered.map(function(p) {
              var profit = p.sell_price - p.buy_price;
              var isZero = p.stock === 0;
              var isLow = p.stock > 0 && p.stock <= (p.minStockAlert || 15);
              return `
                <tr style="${isZero ? 'background-color:rgba(225,29,72,0.03)' : ''}">
                  <td class="text-center font-mono" style="color:var(--color-text-subtle)">${p.id}</td>
                  <td style="font-weight:600">${p.name}</td>
                  <td style="color:var(--color-text-muted)">${p.category}</td>
                  <td class="text-right font-mono tabular-nums">৳${p.buy_price}</td>
                  <td class="text-right font-mono tabular-nums" style="font-weight:700">৳${p.sell_price}</td>
                  <td class="text-right font-mono tabular-nums" style="color:var(--color-primary); font-weight:600">+৳${profit}</td>
                  <td class="text-center">${p.unit}</td>
                  <td class="text-center font-mono tabular-nums" style="font-weight:700; color:${isZero ? 'var(--color-danger)' : (isLow ? 'var(--color-warning)' : 'inherit')}">
                    ${p.stock}
                  </td>
                  <td class="text-center">
                    ${isZero ? '<span class="status-pill status-out-stock">' + (isBn ? 'স্টক শেষ' : 'Out') + '</span>' :
                      (isLow ? '<span class="status-pill status-low-stock">' + (isBn ? 'কম স্টক' : 'Low') + '</span>' :
                      '<span class="status-pill status-in-stock">' + (isBn ? 'উপলব্ধ' : 'In Stock') + '</span>')}
                  </td>
                  <td class="text-right">
                    <div style="display:inline-flex; align-items:center; gap:4px;">
                      <button class="btn btn-outline btn-sm" onclick="quickRestockItem(${p.id}, 20)">+20</button>
                      <button class="btn btn-outline btn-sm" onclick="quickRestockItem(${p.id}, 50)">+50</button>
                      <button class="btn btn-outline btn-sm" onclick="showProductModal(${p.id})">✏️</button>
                      <button class="btn btn-outline btn-sm" style="color:var(--color-danger)" onclick="deleteProductItem(${p.id})">🗑️</button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

window.handleProductSearch = function(val) {
  state.productSearchTerm = val;
  renderProducts(document.getElementById('app-main-content'));
};

window.setProductCategoryFilter = function(cat) {
  state.productCategoryFilter = cat;
  renderProducts(document.getElementById('app-main-content'));
};

window.setProductStockFilter = function(filter) {
  state.productStockFilter = filter;
  renderProducts(document.getElementById('app-main-content'));
};

window.quickRestockItem = async function(prodId, qty) {
  var prod = state.products.find(function(p) { return p.id === prodId; });
  if (!prod) return;
  prod.stock += qty;
  await saveProductToDb(prod);
  render();
};

window.deleteProductItem = async function(prodId) {
  var isBn = state.lang === 'bn';
  var prod = state.products.find(function(p) { return p.id === prodId; });
  if (!prod) return;
  if (confirm(isBn ? 'আপনি কি "' + prod.name + '" পণ্যটি মুছে ফেলতে চান?' : 'Delete product "' + prod.name + '"?')) {
    state.products = state.products.filter(function(p) { return p.id !== prodId; });
    await deleteProductFromDb(prodId);
    render();
  }
};

window.exportProductsCSV = function() {
  var headers = ['ID', 'Name', 'Category', 'Buy Price (BDT)', 'Sell Price (BDT)', 'Unit', 'Stock Qty', 'Status'];
  var rows = state.products.map(function(p) {
    return [
      p.id,
      '"' + p.name.replace(/"/g, '""') + '"',
      '"' + p.category + '"',
      p.buy_price,
      p.sell_price,
      p.unit,
      p.stock,
      p.stock > 0 ? 'In Stock' : 'Out of Stock'
    ];
  });
  var csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(function(e) { return e.join(','); })].join('\n');
  var encoded = encodeURI(csvContent);
  var a = document.createElement('a');
  a.setAttribute('href', encoded);
  a.setAttribute('download', 'agri_products_' + new Date().toISOString().slice(0, 10) + '.csv');
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

// ----------------- 3. SALES HISTORY & LEDGER -----------------
function renderHistory(container) {
  var isBn = state.lang === 'bn';

  var filtered = state.sales.filter(function(s) {
    var matchSearch = s.customerName.toLowerCase().includes(state.salesSearchTerm.toLowerCase()) ||
                      s.memoNo.toLowerCase().includes(state.salesSearchTerm.toLowerCase()) ||
                      (s.customerPhone && s.customerPhone.includes(state.salesSearchTerm));
    var matchDue = state.salesDueFilter === 'all' ? true :
                   state.salesDueFilter === 'due_only' ? s.dueAmount > 0 : s.dueAmount === 0;
    return matchSearch && matchDue;
  });

  var totalRev = filtered.reduce(function(acc, s) { return acc + s.netPayable; }, 0);
  var totalProf = filtered.reduce(function(acc, s) { return acc + s.profit; }, 0);
  var totalDue = filtered.reduce(function(acc, s) { return acc + s.dueAmount; }, 0);

  container.innerHTML = `
    ${renderSyncNoticeBanner()}

    <!-- History KPI Strip -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-header">
          <span>${isBn ? 'ফিল্টারকৃত মোট বিক্রি' : 'Filtered Revenue'}</span>
          <span>💵</span>
        </div>
        <div class="kpi-value tabular-nums">${formatTaka(totalRev)}</div>
        <div class="kpi-subtext">${filtered.length} ${isBn ? 'টি চালান' : 'invoices'}</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-header">
          <span>${isBn ? 'অর্জিত মোট নীট লাভ' : 'Net Profit'}</span>
          <span>📈</span>
        </div>
        <div class="kpi-value tabular-nums" style="color:var(--color-primary)">${formatTaka(totalProf)}</div>
        <div class="kpi-subtext">${totalRev > 0 ? ((totalProf / totalRev) * 100).toFixed(1) + '% ' + (isBn ? 'মার্জিন' : 'margin') : '0%'}</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-header">
          <span>${isBn ? 'বাকি বা পাওনা টাকা' : 'Due Receivables'}</span>
          <span>⚠️</span>
        </div>
        <div class="kpi-value tabular-nums" style="color:${totalDue > 0 ? 'var(--color-warning)' : 'inherit'}">${formatTaka(totalDue)}</div>
        <div class="kpi-subtext">${isBn ? 'কাস্টমারের নিকট বাকি' : 'Outstanding'}</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-header">
          <span>${isBn ? 'গড় বিক্রয় আকার' : 'Avg Invoice Size'}</span>
          <span>📊</span>
        </div>
        <div class="kpi-value tabular-nums">${filtered.length > 0 ? formatTaka(Math.round(totalRev / filtered.length)) : '৳ 0'}</div>
        <div class="kpi-subtext">${isBn ? 'প্রতি বিক্রয়ে গড়ে' : 'Per transaction'}</div>
      </div>
    </div>

    <!-- History Table Panel -->
    <div class="panel">
      <div class="panel-header" style="flex-wrap:wrap; gap:10px;">
        <div style="display:flex; align-items:center; gap:8px; flex:1; min-width:240px;">
          <input type="text" class="form-control" style="max-width:320px;" placeholder="${isBn ? 'কাস্টমার, মেমো বা ফোন দিয়ে খুঁজুন...' : 'Search customer, memo or phone...'}" value="${state.salesSearchTerm}" oninput="handleSalesSearch(this.value)" />
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <div style="display:flex; align-items:center; background:var(--color-surface-muted); padding:2px; border-radius:6px; font-size:0.75rem;">
            <button class="chip ${state.salesDueFilter === 'all' ? 'active' : ''}" style="margin:0" onclick="setSalesDueFilter('all')">${isBn ? 'সব' : 'All'}</button>
            <button class="chip ${state.salesDueFilter === 'due_only' ? 'active' : ''}" style="margin:0" onclick="setSalesDueFilter('due_only')">${isBn ? 'শুধু বাকি' : 'Due'}</button>
            <button class="chip ${state.salesDueFilter === 'paid_only' ? 'active' : ''}" style="margin:0" onclick="setSalesDueFilter('paid_only')">${isBn ? 'পরিশোধিত' : 'Paid'}</button>
          </div>
          <button class="btn btn-outline" onclick="exportSalesCSV()">
            📥 ${isBn ? 'লেজার CSV' : 'Export CSV'}
          </button>
        </div>
      </div>

      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>${isBn ? 'মেমো নং' : 'Memo'}</th>
              <th>${isBn ? 'তারিখ ও সময়' : 'Date & Time'}</th>
              <th>${isBn ? 'কাস্টমার' : 'Customer'}</th>
              <th>${isBn ? 'পণ্য ও পরিমাণ' : 'Products & Qty'}</th>
              <th class="text-right">${isBn ? 'বিক্রয়মূল্য (৳)' : 'Amount (৳)'}</th>
              <th class="text-right">${isBn ? 'লাভ (৳)' : 'Profit (৳)'}</th>
              <th class="text-center">${isBn ? 'পরিশোধ ও বাকি' : 'Payment & Due'}</th>
              <th class="text-right">${isBn ? 'অ্যাকশন' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.length === 0 ? `
              <tr>
                <td colspan="8" class="text-center" style="padding:40px; color:var(--color-text-subtle)">
                  ${isBn ? 'কোনো বিক্রির রেকর্ড পাওয়া যায়নি' : 'No sales records found'}
                </td>
              </tr>
            ` : filtered.map(function(sale) {
              var itemsHtml = (sale.items || []).map(function(it) {
                return '<div>' + it.productName + ' × ' + it.quantity + ' ' + it.unit + '</div>';
              }).join('');
              return `
                <tr>
                  <td class="font-mono" style="font-weight:700">${sale.memoNo}</td>
                  <td style="color:var(--color-text-subtle)">${sale.date}</td>
                  <td style="font-weight:600">
                    ${sale.customerName}
                    ${sale.customerPhone ? '<div style="font-size:0.6875rem; color:var(--color-text-subtle)">' + sale.customerPhone + '</div>' : ''}
                  </td>
                  <td>${itemsHtml || '-'}</td>
                  <td class="text-right font-mono" style="font-weight:700">${formatTaka(sale.netPayable)}</td>
                  <td class="text-right font-mono" style="font-weight:700; color:var(--color-primary)">${formatTaka(sale.profit)}</td>
                  <td class="text-center">
                    <div>${sale.paymentMethod}</div>
                    ${sale.dueAmount > 0 ? '<div class="font-mono" style="color:var(--color-danger); font-size:0.6875rem; font-weight:700;">বাকি: ৳' + sale.dueAmount + '</div>' : '<div style="color:var(--color-primary); font-size:0.6875rem">পরিশোধিত</div>'}
                  </td>
                  <td class="text-right">
                    <div style="display:inline-flex; align-items:center; gap:4px;">
                      <button class="btn btn-outline btn-sm" onclick="showInvoiceModal('${sale.id}')">👁️ ${isBn ? 'মেমো' : 'Memo'}</button>
                      <button class="btn btn-outline btn-sm" style="color:var(--color-danger)" title="${isBn ? 'বিক্রি বাতিল ও স্টক ফেরত' : 'Revert sale'}" onclick="revertSaleRecord('${sale.id}')">🗑️</button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

window.handleSalesSearch = function(val) {
  state.salesSearchTerm = val;
  renderHistory(document.getElementById('app-main-content'));
};

window.setSalesDueFilter = function(filter) {
  state.salesDueFilter = filter;
  renderHistory(document.getElementById('app-main-content'));
};

window.revertSaleRecord = async function(saleId) {
  var isBn = state.lang === 'bn';
  var sale = state.sales.find(function(s) { return s.id === String(saleId); });
  if (!sale) return;

  if (confirm(isBn ? 'আপনি কি মেমো (' + sale.memoNo + ') বাতিল করতে চান? বিক্রিত পণ্য স্বয়ংক্রিয়ভাবে মূল স্টকে ফেরত যাবে।' : 'Revert memo ' + sale.memoNo + '? Stock will be restored.')) {
    var updatedProducts = [];
    (sale.items || []).forEach(function(it) {
      var prod = state.products.find(function(p) { return p.id === it.productId; });
      if (prod) {
        prod.stock += Number(it.quantity || 0);
        updatedProducts.push(prod);
      }
    });

    for (var i = 0; i < updatedProducts.length; i++) {
      await saveProductToDb(updatedProducts[i]);
    }

    state.sales = state.sales.filter(function(s) { return s.id !== String(saleId); });
    await deleteSaleFromDb(saleId);
    render();
  }
};

window.exportSalesCSV = function() {
  var headers = ['Memo No', 'Date', 'Customer', 'Phone', 'Items', 'Amount (BDT)', 'Discount (BDT)', 'Net Payable (BDT)', 'Cost (BDT)', 'Profit (BDT)', 'Paid (BDT)', 'Due (BDT)', 'Payment Method'];
  var rows = state.sales.map(function(s) {
    var itemSummary = (s.items || []).map(function(i) { return i.productName + ' (' + i.quantity + ' ' + i.unit + ')'; }).join('; ');
    return [
      '"' + s.memoNo + '"',
      '"' + s.date + '"',
      '"' + s.customerName.replace(/"/g, '""') + '"',
      '"' + (s.customerPhone || '') + '"',
      '"' + itemSummary + '"',
      s.totalAmount,
      s.discount,
      s.netPayable,
      s.totalCost,
      s.profit,
      s.paidAmount,
      s.dueAmount,
      '"' + s.paymentMethod + '"'
    ];
  });
  var csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(function(e) { return e.join(','); })].join('\n');
  var encoded = encodeURI(csvContent);
  var a = document.createElement('a');
  a.setAttribute('href', encoded);
  a.setAttribute('download', 'sales_ledger_' + new Date().toISOString().slice(0, 10) + '.csv');
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

// ----------------- 4. RESTOCK & AUDIT -----------------
function renderRestock(container) {
  var isBn = state.lang === 'bn';
  var outOfStock = state.products.filter(function(p) { return p.stock === 0; });
  var lowStock = state.products.filter(function(p) { return p.stock > 0 && p.stock <= (p.minStockAlert || 15); });
  var optimal = state.products.filter(function(p) { return p.stock > (p.minStockAlert || 15); });

  container.innerHTML = `
    ${renderSyncNoticeBanner()}

    <!-- Restock Overview Cards -->
    <div class="kpi-grid">
      <div class="kpi-card" style="border-color:#fecdd3; background:#fff1f2">
        <div class="kpi-header" style="color:var(--color-danger)">
          <span>${isBn ? 'স্টক শেষ (জরুরি রিস্টক)' : 'Out of Stock'}</span>
          <span>⚠️</span>
        </div>
        <div class="kpi-value tabular-nums" style="color:var(--color-danger)">${outOfStock.length} <small style="font-size:0.75rem">${isBn ? 'টি আইটেম' : 'items'}</small></div>
        <div class="kpi-subtext" style="color:#9f1239">${isBn ? 'বিক্রি বন্ধ রয়েছে' : 'Urgent restock needed'}</div>
      </div>

      <div class="kpi-card" style="border-color:#fed7aa; background:#fffbeb">
        <div class="kpi-header" style="color:var(--color-warning)">
          <span>${isBn ? 'কম স্টক সতর্কতা' : 'Low Stock Warning'}</span>
          <span>⚠️</span>
        </div>
        <div class="kpi-value tabular-nums" style="color:var(--color-warning)">${lowStock.length} <small style="font-size:0.75rem">${isBn ? 'টি আইটেম' : 'items'}</small></div>
        <div class="kpi-subtext" style="color:#92400e">${isBn ? 'সীমার নিচে চলে এসেছে' : 'Below safety threshold'}</div>
      </div>

      <div class="kpi-card" style="border-color:#a7f3d0; background:#ecfdf5">
        <div class="kpi-header" style="color:var(--color-primary)">
          <span>${isBn ? 'পর্যাপ্ত মজুদ' : 'Optimal Stock'}</span>
          <span>✓</span>
        </div>
        <div class="kpi-value tabular-nums" style="color:var(--color-primary)">${optimal.length} <small style="font-size:0.75rem">${isBn ? 'টি আইটেম' : 'items'}</small></div>
        <div class="kpi-subtext" style="color:#065f46">${isBn ? 'পর্যাপ্ত মাল রয়েছে' : 'Healthy inventory'}</div>
      </div>
    </div>

    <!-- Restock Panel -->
    <div class="panel">
      <div class="panel-header">
        <div>
          <span class="panel-title">${isBn ? 'মাল আগমন ও দ্রুত স্টক রিস্টক প্যানেল' : 'Inward Restock Panel'}</span>
          <div style="font-size:0.75rem; color:var(--color-text-subtle); margin-top:2px;">
            ${isBn ? 'নতুন ট্রাক বা চালান আসলে সরাসরি নতুন স্টক পরিমাণ ও ক্রয়দর আপডেট করুন' : 'Directly replenish crates, paper and sacks'}
          </div>
        </div>
      </div>

      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>${isBn ? 'পণ্য ও বিবরণ' : 'Product & Description'}</th>
              <th>${isBn ? 'ক্যাটাগরি' : 'Category'}</th>
              <th class="text-center">${isBn ? 'বর্তমান স্টক' : 'Current Stock'}</th>
              <th class="text-center">${isBn ? 'বর্তমান ক্রয়দর' : 'Current Cost'}</th>
              <th class="text-center">${isBn ? 'নতুন ক্রয়দর (৳)' : 'New Cost (৳)'}</th>
              <th class="text-center">${isBn ? 'যোগ করার পরিমাণ' : 'Add Stock Qty'}</th>
              <th class="text-right">${isBn ? 'অ্যাকশন' : 'Action'}</th>
            </tr>
          </thead>
          <tbody>
            ${[...outOfStock, ...lowStock, ...optimal].map(function(p) {
              var isZero = p.stock === 0;
              var isLow = p.stock > 0 && p.stock <= (p.minStockAlert || 15);
              return `
                <tr style="${isZero ? 'background-color:rgba(225,29,72,0.03)' : (isLow ? 'background-color:rgba(217,119,6,0.03)' : '')}">
                  <td>
                    <div style="font-weight:600">${p.name}</div>
                    <div style="font-size:0.6875rem; color:var(--color-text-subtle)">বিক্রয়দর: ৳${p.sell_price} / ${p.unit}</div>
                  </td>
                  <td style="color:var(--color-text-muted)">${p.category}</td>
                  <td class="text-center font-mono" style="font-weight:700; color:${isZero ? 'var(--color-danger)' : (isLow ? 'var(--color-warning)' : 'inherit')}">
                    ${p.stock} ${p.unit}
                    ${isZero ? '<div style="font-size:0.625rem; color:var(--color-danger)">স্টক শেষ</div>' : ''}
                  </td>
                  <td class="text-center font-mono">৳${p.buy_price}</td>
                  <td class="text-center">
                    <input type="number" id="restock-price-${p.id}" class="form-control font-mono" style="width:90px; text-align:center; padding:4px;" value="${p.buy_price}" />
                  </td>
                  <td class="text-center">
                    <div style="display:inline-flex; align-items:center; gap:4px;">
                      <input type="number" id="restock-qty-${p.id}" class="form-control font-mono" style="width:80px; text-align:center; padding:4px; font-weight:700;" value="${isZero ? 100 : 50}" min="1" />
                      <span style="font-size:0.75rem; color:var(--color-text-subtle)">${p.unit}</span>
                    </div>
                  </td>
                  <td class="text-right">
                    <button class="btn btn-primary btn-sm" onclick="submitRestock(${p.id})">
                      + ${isBn ? 'রিস্টক করুন' : 'Restock'}
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

window.submitRestock = async function(prodId) {
  var isBn = state.lang === 'bn';
  var prod = state.products.find(function(p) { return p.id === prodId; });
  if (!prod) return;

  var qtyInput = document.getElementById('restock-qty-' + prodId);
  var priceInput = document.getElementById('restock-price-' + prodId);

  var addQty = parseFloat(qtyInput ? qtyInput.value : 0) || 0;
  var newPrice = parseFloat(priceInput ? priceInput.value : 0) || prod.buy_price;

  if (addQty <= 0) return;

  prod.stock += addQty;
  if (newPrice > 0) prod.buy_price = newPrice;

  await saveProductToDb(prod);
  alert(isBn ? 'সফলভাবে ' + prod.name + ' পণ্যে +' + addQty + ' ' + prod.unit + ' যোগ করা হয়েছে!' : 'Added +' + addQty + ' ' + prod.unit + ' to ' + prod.name + '!');
  render();
};

// ----------------- MODALS -----------------
window.showInvoiceModal = function(saleId) {
  var sale = state.sales.find(function(s) { return s.id === String(saleId); });
  if (!sale) return;

  var isBn = state.lang === 'bn';
  var overlay = document.getElementById('invoice-modal-overlay');
  var memoContainer = document.getElementById('printable-cash-memo');
  if (!overlay || !memoContainer) return;

  memoContainer.innerHTML = `
    <!-- Shop Header -->
    <div style="text-align:center; border-bottom:1px dashed #94a3b8; padding-bottom:14px; margin-bottom:14px;">
      <h2 style="font-size:1.4rem; font-weight:800; color:#0f172a; margin-bottom:4px;">
        ${isBn ? 'মেসার্স কৃষি প্যাকেজিং ও আড়ত' : 'M/S AGRI PACKAGING & TRADING'}
      </h2>
      <p style="font-size:0.75rem; color:#475569">
        ${isBn ? 'উন্নত মানের ক্যারেট, পেপার, সুতলি ও সকল প্রকার প্লাস্টিক ও নেট বস্তা পাইকারি ও খুচরা বিক্রেতা' : 'Wholesale & Retail: Crates, Paper, Twine & Sacks'}
      </p>
      <p style="font-size:0.75rem; color:#64748b; margin-top:2px;">
        ${isBn ? 'মোবাইল: ০১৭১২-৩৪৫৬৭৮, ০১৮১২-৩৪৫৬৭৮' : 'Mobile: 01712-345678, 01812-345678'}
      </p>
    </div>

    <!-- Details Grid -->
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; font-size:0.75rem; background:#f8fafc; padding:10px 14px; border-radius:6px; margin-bottom:14px;">
      <div>
        <div style="color:#64748b">${isBn ? 'কাস্টমারের নাম:' : 'Customer Name:'}</div>
        <div style="font-weight:700; font-size:0.875rem; color:#0f172a">${sale.customerName}</div>
        ${sale.customerPhone ? '<div style="color:#475569">' + (isBn ? 'ফোন:' : 'Phone:') + ' ' + sale.customerPhone + '</div>' : ''}
      </div>
      <div style="text-align:right;">
        <div style="color:#64748b">${isBn ? 'মেমো নম্বর:' : 'Memo No:'}</div>
        <div class="font-mono" style="font-weight:700; color:#0f172a">${sale.memoNo}</div>
        <div style="color:#64748b">${isBn ? 'তারিখ:' : 'Date:'} ${sale.date}</div>
        <div style="color:#64748b">${isBn ? 'পদ্ধতি:' : 'Payment:'} ${sale.paymentMethod}</div>
      </div>
    </div>

    <!-- Items Table -->
    <table style="width:100%; border-collapse:collapse; font-size:0.75rem; margin-bottom:14px;">
      <thead>
        <tr style="background:#f1f5f9; border-bottom:2px solid #cbd5e1;">
          <th style="padding:6px 8px; text-align:left;">${isBn ? 'পণ্যের বিবরণ' : 'Product'}</th>
          <th style="padding:6px 8px; text-align:center;">${isBn ? 'পরিমাণ' : 'Qty'}</th>
          <th style="padding:6px 8px; text-align:right;">${isBn ? 'দর (৳)' : 'Rate (৳)'}</th>
          <th style="padding:6px 8px; text-align:right;">${isBn ? 'মোট টাকা (৳)' : 'Total (৳)'}</th>
        </tr>
      </thead>
      <tbody>
        ${(sale.items || []).map(function(item) {
          return `
            <tr style="border-bottom:1px solid #e2e8f0;">
              <td style="padding:6px 8px;">
                <strong>${item.productName}</strong>
                <div style="font-size:0.6875rem; color:#64748b">${item.category}</div>
              </td>
              <td style="padding:6px 8px; text-align:center;" class="font-mono">${item.quantity} ${item.unit}</td>
              <td style="padding:6px 8px; text-align:right;" class="font-mono">৳${item.sellPrice}</td>
              <td style="padding:6px 8px; text-align:right; font-weight:700;" class="font-mono">৳${item.totalAmount}</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>

    <!-- Totals -->
    <div style="display:flex; justify-content:flex-end; margin-bottom:14px;">
      <div style="width:220px; font-size:0.75rem; display:flex; flex-direction:column; gap:4px;">
        <div style="display:flex; justify-content:space-between; color:#475569;">
          <span>${isBn ? 'উপমোট (Subtotal):' : 'Subtotal:'}</span>
          <span class="font-mono">${formatTaka(sale.totalAmount)}</span>
        </div>
        ${sale.discount > 0 ? `
          <div style="display:flex; justify-content:space-between; color:#059669; font-weight:600;">
            <span>${isBn ? 'ছাড় (Discount):' : 'Discount:'}</span>
            <span class="font-mono">- ${formatTaka(sale.discount)}</span>
          </div>
        ` : ''}
        <div style="display:flex; justify-content:space-between; font-weight:800; font-size:0.875rem; color:#0f172a; border-top:1px solid #cbd5e1; padding-top:4px;">
          <span>${isBn ? 'সর্বমোট প্রদেয়:' : 'Net Payable:'}</span>
          <span class="font-mono">${formatTaka(sale.netPayable)}</span>
        </div>
        <div style="display:flex; justify-content:space-between; color:#0f172a;">
          <span>${isBn ? 'পরিশোধিত:' : 'Paid:'}</span>
          <span class="font-mono" style="font-weight:700; color:#059669">${formatTaka(sale.paidAmount)}</span>
        </div>
        ${sale.dueAmount > 0 ? `
          <div style="display:flex; justify-content:space-between; color:#e11d48; font-weight:800; border-top:1px dashed #fecdd3; padding-top:4px;">
            <span>${isBn ? 'বাকি টাকা (Due):' : 'Due:'}</span>
            <span class="font-mono">${formatTaka(sale.dueAmount)}</span>
          </div>
        ` : ''}
      </div>
    </div>

    ${sale.note ? `
      <div style="background:#fffbeb; border:1px solid #fed7aa; padding:6px 10px; border-radius:4px; font-size:0.6875rem; color:#92400e; margin-bottom:16px;">
        <strong>${isBn ? 'নোট: ' : 'Note: '}</strong> ${sale.note}
      </div>
    ` : ''}

    <!-- Signatures -->
    <div style="margin-top:24px; padding-top:20px; border-top:1px dashed #cbd5e1; display:flex; justify-content:space-between; font-size:0.6875rem; color:#64748b;">
      <div style="text-align:center;">
        <div style="width:120px; border-bottom:1px solid #94a3b8; margin:0 auto 4px;"></div>
        <div>${isBn ? 'ক্রেতার স্বাক্ষর' : 'Customer Signature'}</div>
      </div>
      <div style="text-align:center;">
        <div style="width:120px; border-bottom:1px solid #94a3b8; margin:0 auto 4px;"></div>
        <div>${isBn ? 'বিক্রেতার স্বাক্ষর' : 'Authorized Signature'}</div>
      </div>
    </div>
  `;

  overlay.classList.add('active');
};

window.closeInvoiceModal = function() {
  var overlay = document.getElementById('invoice-modal-overlay');
  if (overlay) overlay.classList.remove('active');
};

window.printInvoice = function() {
  window.print();
};

window.showProductModal = function(prodId) {
  state.editingProductId = prodId;
  var isBn = state.lang === 'bn';
  var overlay = document.getElementById('product-modal-overlay');
  var title = document.getElementById('product-modal-title');
  if (!overlay) return;

  var prod = prodId ? state.products.find(function(p) { return p.id === prodId; }) : null;

  if (title) {
    title.textContent = prod ? (isBn ? 'পণ্য এডিট করুন' : 'Edit Product') : (isBn ? 'নতুন পণ্য যোগ করুন' : 'Add New Product');
  }

  document.getElementById('modal-prod-name').value = prod ? prod.name : '';
  document.getElementById('modal-prod-category').value = prod ? prod.category : 'ক্যারেট';
  document.getElementById('modal-prod-buy').value = prod ? prod.buy_price : 0;
  document.getElementById('modal-prod-sell').value = prod ? prod.sell_price : 0;
  document.getElementById('modal-prod-unit').value = prod ? prod.unit : 'পিস';
  document.getElementById('modal-prod-stock').value = prod ? prod.stock : 100;
  document.getElementById('modal-prod-alert').value = prod ? (prod.minStockAlert || 20) : 20;

  overlay.classList.add('active');
};

window.closeProductModal = function() {
  var overlay = document.getElementById('product-modal-overlay');
  if (overlay) overlay.classList.remove('active');
  state.editingProductId = null;
};

window.handleSaveProductModal = async function(e) {
  e.preventDefault();
  var name = document.getElementById('modal-prod-name').value.trim();
  var category = document.getElementById('modal-prod-category').value;
  var buy_price = parseFloat(document.getElementById('modal-prod-buy').value) || 0;
  var sell_price = parseFloat(document.getElementById('modal-prod-sell').value) || 0;
  var unit = document.getElementById('modal-prod-unit').value;
  var stock = parseFloat(document.getElementById('modal-prod-stock').value) || 0;
  var minStockAlert = parseFloat(document.getElementById('modal-prod-alert').value) || 20;

  if (!name) return;

  var savedProd = null;
  if (state.editingProductId) {
    var prod = state.products.find(function(p) { return p.id === state.editingProductId; });
    if (prod) {
      prod.name = name;
      prod.category = category;
      prod.buy_price = buy_price;
      prod.sell_price = sell_price;
      prod.unit = unit;
      prod.stock = stock;
      prod.minStockAlert = minStockAlert;
      savedProd = prod;
    }
  } else {
    var nextId = state.products.length > 0 ? Math.max.apply(null, state.products.map(function(p) { return p.id; })) + 1 : 1;
    savedProd = {
      id: nextId,
      name: name,
      category: category,
      buy_price: buy_price,
      sell_price: sell_price,
      unit: unit,
      stock: stock,
      minStockAlert: minStockAlert,
    };
    state.products.push(savedProd);
  }

  if (savedProd) {
    await saveProductToDb(savedProd);
  }
  closeProductModal();
  render();
};

// Reset data to defaults
window.resetAllData = async function() {
  var isBn = state.lang === 'bn';
  if (confirm(isBn ? 'সতর্কতা: এটি পূর্বের সকল পরিবর্তন মুছে দিয়ে প্রাথমিক ২৯টি পণ্যের ডেটায় রিসেট করবে। আপনি কি এগিয়ে যেতে চান?' : 'Warning: Reset all data to default 29 products?')) {
    state.products = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
    state.sales = [];
    saveLocalProducts();
    saveLocalSales();

    if (supabaseClient) {
      try {
        await supabaseClient.from('sales').delete().neq('id', '');
        await supabaseClient.from('products').upsert(state.products);
      } catch (err) {
        console.warn('Reset in Supabase failed:', err);
      }
    }
    render();
  }
};

// Global Init
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('[data-tab]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      state.currentTab = btn.dataset.tab;
      render();
    });
  });

  var langBtn = document.getElementById('lang-toggle-btn');
  if (langBtn) {
    langBtn.addEventListener('click', function() {
      state.lang = state.lang === 'bn' ? 'en' : 'bn';
      try {
        localStorage.setItem(STORAGE_KEYS.LANG, state.lang);
      } catch (e) {}
      render();
    });
  }

  var resetBtn = document.getElementById('reset-data-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', resetAllData);
  }

  var modalForm = document.getElementById('product-modal-form');
  if (modalForm) {
    modalForm.onsubmit = handleSaveProductModal;
  }

  loadState();
});
