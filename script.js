/**
 * কৃষি প্যাকেজিং হিসাব (Agricultural Packaging Inventory & POS)
 * Clean, Production-Ready Standalone Vanilla JavaScript (script.js)
 * Features:
 * - Live Supabase PostgreSQL sync (products & sales) + localStorage offline fallback
 * - Toggle Cart Logic (1st click adds, 2nd click removes) + (+/-) quantity controls
 * - 10 Regular Customers Avatar Grid + Photo Upload & Profile Editor
 * - Dark/Light Mode Toggle + Font Size/Weight/Family Customization (SutonnyMJ)
 * - Date-Isolated POS Sessions, Sales History, Restock Audit & Full Analytics
 */

const SUPABASE_URL = 'https://mbjgvsivtkavpvtqwhsb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_satWtSpdLxBaJ2FgXY3GJg_co5w-3ZD';

let supabaseClient = null;
try {
  if (typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function') {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
} catch (err) {
  console.warn('Supabase SDK init failed, using localStorage fallback:', err);
}

const STORAGE_KEYS = {
  PRODUCTS: 'standalone_agri_products',
  SALES: 'standalone_agri_sales',
  CUSTOMERS: 'standalone_agri_customers',
  LANG: 'standalone_agri_lang',
  THEME: 'standalone_agri_theme',
  TYPOGRAPHY: 'standalone_agri_typography',
};

const CATEGORIES = ['সব', 'ক্যারেট', 'কাগজ', 'অন্যান্য', 'বস্তা (পানি)', 'বস্তা (সাদা)', 'বস্তা (নিল)', 'বস্তা (নেট)'];

const DEFAULT_TYPOGRAPHY = { sizeScale: 'large', weight: '700', family: 'sutonny' };
const FONT_SIZE_MAP = { normal: '16.5px', large: '18px', xlarge: '20px' };
const FONT_FAMILY_MAP = {
  sutonny: "'SutonnyMJ', 'Noto Sans Bengali', 'Hind Siliguri', 'Outfit', system-ui, sans-serif",
  noto: "'Noto Sans Bengali', 'Hind Siliguri', 'Outfit', system-ui, sans-serif",
  hind: "'Hind Siliguri', 'Noto Sans Bengali', 'Outfit', system-ui, sans-serif",
};

const INITIAL_REGULAR_CUSTOMERS = [
  { id: 'cust_1', name: 'সাইফুল ইসলাম', shopName: 'মেসার্স সাইফুল ট্রেডার্স', phone: '01711-223344', shirtColor: '#059669', skinTone: '#d99b72', hairColor: '#1e293b', hasBeard: true },
  { id: 'cust_2', name: 'কামাল ইসলাম', shopName: 'কামাল ফল আড়ত', phone: '01812-334455', shirtColor: '#4f46e5', skinTone: '#c6865c', hairColor: '#0f172a', hasGlasses: true },
  { id: 'cust_3', name: 'মাসুদ রানা', shopName: 'মাসুদ এন্টারপ্রাইজ', phone: '01913-445566', shirtColor: '#d97706', skinTone: '#e2ab82', hairColor: '#27272a' },
  { id: 'cust_4', name: 'হাজী রফিকুল ইসলাম', shopName: 'রফিকুল অ্যান্ড সন্স', phone: '01714-556677', shirtColor: '#0d9488', skinTone: '#cf916a', hairColor: '#cbd5e1', hasBeard: true, hasCap: true },
  { id: 'cust_5', name: 'আব্দুল করিম', shopName: 'করিম সবজি ভান্ডার', phone: '01615-667788', shirtColor: '#2563eb', skinTone: '#b8764c', hairColor: '#18181b', hasBeard: true },
  { id: 'cust_6', name: 'জসিম উদ্দিন', shopName: 'জসিম বাণিজ্যালয়', phone: '01716-778899', shirtColor: '#e11d48', skinTone: '#dfa37a', hairColor: '#334155', hasGlasses: true },
  { id: 'cust_7', name: 'মিজানুর রহমান', shopName: 'মিজান ট্রেডিং', phone: '01817-889900', shirtColor: '#7c3aed', skinTone: '#c88a62', hairColor: '#0f172a' },
  { id: 'cust_8', name: 'তারেক আহমেদ', shopName: 'তারেক এগ্রো সাপ্লাই', phone: '01918-990011', shirtColor: '#0891b2', skinTone: '#e5b088', hairColor: '#1e293b', hasGlasses: true },
  { id: 'cust_9', name: 'ফারুক হোসেন', shopName: 'ফারুক কৃষি বাজার', phone: '01719-112233', shirtColor: '#ea580c', skinTone: '#bd7c52', hairColor: '#27272a', hasBeard: true },
  { id: 'cust_10', name: 'সোহেল মিয়া', shopName: 'সোহেল আড়তদারি', phone: '01511-224466', shirtColor: '#c026d3', skinTone: '#d6976e', hairColor: '#18181b' },
];

const INITIAL_PRODUCTS = [
  { id: 1, name: 'ক্যারেট - ১নং', category: 'ক্যারেট', buy_price: 260, sell_price: 300, unit: 'পিস', stock: 50, minStockAlert: 15 },
  { id: 2, name: 'ক্যারেট - ২নং', category: 'ক্যারেট', buy_price: 180, sell_price: 200, unit: 'পিস', stock: 50, minStockAlert: 15 },
  { id: 3, name: 'রিম (বড় সাদা কাগজ)', category: 'কাগজ', buy_price: 50, sell_price: 68, unit: 'কেজি', stock: 100, minStockAlert: 20 },
  { id: 4, name: 'কফি রিম (ছোট সাদা কাগজ)', category: 'কাগজ', buy_price: 60, sell_price: 80, unit: 'কেজি', stock: 100, minStockAlert: 20 },
  { id: 5, name: 'পেপার', category: 'কাগজ', buy_price: 55, sell_price: 70, unit: 'কেজি', stock: 100, minStockAlert: 20 },
  { id: 6, name: 'ফরমা', category: 'কাগজ', buy_price: 50, sell_price: 70, unit: 'কেজি', stock: 100, minStockAlert: 20 },
  { id: 7, name: 'সুতলি', category: 'অন্যান্য', buy_price: 210, sell_price: 240, unit: 'কেজি', stock: 100, minStockAlert: 20 },
  { id: 8, name: 'কাকড়া', category: 'অন্যান্য', buy_price: 117, sell_price: 150, unit: 'কেজি', stock: 100, minStockAlert: 20 },
  { id: 9, name: 'চান্দি', category: 'অন্যান্য', buy_price: 9, sell_price: 15, unit: 'পিস', stock: 200, minStockAlert: 30 },
  { id: 10, name: 'বেল্ট', category: 'অন্যান্য', buy_price: 32, sell_price: 42, unit: 'পিস', stock: 200, minStockAlert: 30 },
  { id: 11, name: 'ফম', category: 'অন্যান্য', buy_price: 1, sell_price: 2, unit: 'পিস', stock: 500, minStockAlert: 50 },
  { id: 12, name: 'কাটুন', category: 'অন্যান্য', buy_price: 65, sell_price: 70, unit: 'জোড়া', stock: 50, minStockAlert: 15 },
  { id: 13, name: 'পানি - ২৪/৪২', category: 'বস্তা (পানি)', buy_price: 21, sell_price: 28, unit: 'পিস', stock: 150, minStockAlert: 25 },
  { id: 14, name: 'পানি - ২৮/৪৫', category: 'বস্তা (পানি)', buy_price: 26, sell_price: 33, unit: 'পিস', stock: 150, minStockAlert: 25 },
  { id: 15, name: 'পানি - ২৮/৪৪', category: 'বস্তা (পানি)', buy_price: 26, sell_price: 33, unit: 'পিস', stock: 150, minStockAlert: 25 },
  { id: 16, name: 'পানি - ২৮/৪৮', category: 'বস্তা (পানি)', buy_price: 28, sell_price: 34, unit: 'পিস', stock: 150, minStockAlert: 25 },
  { id: 17, name: 'পানি - ৩০/৫২', category: 'বস্তা (পানি)', buy_price: 0, sell_price: 0, unit: 'পিস', stock: 0, minStockAlert: 20 },
  { id: 18, name: 'সাদা - ২৮/৪৬', category: 'বস্তা (সাদা)', buy_price: 0, sell_price: 0, unit: 'পিস', stock: 0, minStockAlert: 20 },
  { id: 19, name: 'সাদা - ২৮/৪৮', category: 'বস্তা (সাদা)', buy_price: 0, sell_price: 0, unit: 'পিস', stock: 0, minStockAlert: 20 },
  { id: 20, name: 'সাদা - ৩০/৫২', category: 'বস্তা (সাদা)', buy_price: 32, sell_price: 38, unit: 'পিস', stock: 150, minStockAlert: 25 },
  { id: 21, name: 'সাদা - ৩২/৫৬', category: 'বস্তা (সাদা)', buy_price: 30, sell_price: 40, unit: 'পিস', stock: 150, minStockAlert: 25 },
  { id: 22, name: 'নিল - ২৮/৪৮', category: 'বস্তা (নিল)', buy_price: 27, sell_price: 34, unit: 'পিস', stock: 150, minStockAlert: 25 },
  { id: 23, name: 'নিল - ৩০/৫২', category: 'বস্তা (নিল)', buy_price: 0, sell_price: 0, unit: 'পিস', stock: 0, minStockAlert: 20 },
  { id: 24, name: 'নেট - ২২/৩৮', category: 'বস্তা (নেট)', buy_price: 21, sell_price: 26, unit: 'পিস', stock: 150, minStockAlert: 25 },
  { id: 25, name: 'নেট - ২৪/৩৬', category: 'বস্তা (নেট)', buy_price: 0, sell_price: 0, unit: 'পিস', stock: 0, minStockAlert: 20 },
  { id: 26, name: 'নেট - ২৪/৪০', category: 'বস্তা (নেট)', buy_price: 24, sell_price: 28, unit: 'পিস', stock: 150, minStockAlert: 25 },
  { id: 27, name: 'নেট - ২৮/৪৬', category: 'বস্তা (নেট)', buy_price: 25, sell_price: 30, unit: 'পিস', stock: 150, minStockAlert: 25 },
  { id: 28, name: 'নেট - ৩০/৫২', category: 'বস্তা (নেট)', buy_price: 26, sell_price: 34, unit: 'পিস', stock: 150, minStockAlert: 25 },
  { id: 29, name: 'নেট - ৩২/৫৬', category: 'বস্তা (নেট)', buy_price: 34, sell_price: 40, unit: 'পিস', stock: 150, minStockAlert: 25 },
];

// ----------------- DATE, STORAGE & UI HELPERS -----------------
function getLocalDateKey(dateObj) {
  const d = dateObj || new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function getLocalMonthKey(dateObj) {
  const d = dateObj || new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
function getLocalDateTimeForDate(dateKey) {
  const now = new Date();
  const base = dateKey && /^\d{4}-\d{2}-\d{2}$/.test(dateKey) ? dateKey : getLocalDateKey(now);
  return `${base} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}
function extractSaleDateKey(rawDate) {
  if (!rawDate) return '';
  const s = String(rawDate).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const d = new Date(s);
  return isNaN(d.getTime()) ? '' : getLocalDateKey(d);
}
function isDateWithinLastDays(dateKey, days) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return false;
  const todayKey = getLocalDateKey();
  const end = new Date(`${todayKey}T23:59:59`).getTime();
  const start = new Date(`${todayKey}T00:00:00`);
  start.setDate(start.getDate() - Math.max(0, days - 1));
  const target = new Date(`${dateKey}T12:00:00`).getTime();
  return target >= start.getTime() && target <= end;
}
function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
function cleanProductTitle(name) {
  return String(name || '').replace(/\s*\(🟢 উপলব্ধ\)/g, '').replace(/\s*\(🔴 স্টক নেই\)/g, '').trim();
}
function formatTaka(num) {
  return '৳ ' + (Math.round((Number(num) || 0) * 100) / 100).toLocaleString('en-US');
}
function getCategoryCardClass(cat) {
  const map = {
    'ক্যারেট': 'cat-crate',
    'কাগজ': 'cat-paper',
    'বস্তা (পানি)': 'cat-water',
    'বস্তা (সাদা)': 'cat-white',
    'বস্তা (নিল)': 'cat-blue',
    'বস্তা (নেট)': 'cat-net',
  };
  return map[cat] || 'cat-other';
}
function loadJsonStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}
function saveJsonStorage(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
}

// ----------------- APPLICATION STATE -----------------
const state = {
  products: [],
  sales: [],
  customers: JSON.parse(JSON.stringify(INITIAL_REGULAR_CUSTOMERS)),
  currentTab: 'dashboard',
  lang: 'bn',
  theme: 'light',
  typography: Object.assign({}, DEFAULT_TYPOGRAPHY, loadJsonStorage(STORAGE_KEYS.TYPOGRAPHY, {})),
  sessionDate: getLocalDateKey(),
  selectedCustomerId: 'cust_1',
  posCustomerName: 'সাইফুল ইসলাম',
  posCustomerPhone: '01711-223344',
  customerSearchTerm: '',
  showAddCustomerForm: false,
  posCategoryFilter: 'সব',
  posProductSearch: '',
  cart: [],
  posDiscount: 0,
  posPaidAmount: '',
  posPaymentMethod: 'ক্যাশ (Cash)',
  posNote: '',
  editingCustomerId: null,
  productSearchTerm: '',
  productCategoryFilter: 'সব',
  productStockFilter: 'all',
  salesSearchTerm: '',
  salesDueFilter: 'all',
  salesDateMode: 'today',
  salesFilterDate: getLocalDateKey(),
  analyticsMode: 'daily',
  analyticsDailyDate: getLocalDateKey(),
  analyticsMonth: getLocalMonthKey(),
  analyticsCustomerName: INITIAL_REGULAR_CUSTOMERS[0].name,
  analyticsCustRange: '30d',
  analyticsCustDate: getLocalDateKey(),
  editingProductId: null,
  isLoading: true,
  isSubmitting: false,
  syncMode: 'connecting',
  syncMessage: '',
};

// ----------------- THEME, TYPOGRAPHY & TOAST -----------------
function applyTypographySettings(cfg) {
  const t = cfg || state.typography || DEFAULT_TYPOGRAPHY;
  const root = document.documentElement;
  root.style.setProperty('--app-font-size', FONT_SIZE_MAP[t.sizeScale] || '18px');
  root.style.setProperty('--app-font-weight', t.weight || '700');
  root.style.setProperty('--app-font-family', FONT_FAMILY_MAP[t.family] || FONT_FAMILY_MAP.sutonny);
}

function applyTheme(theme) {
  state.theme = theme === 'dark' ? 'dark' : 'light';
  if (state.theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
  else document.documentElement.removeAttribute('data-theme');
  try { localStorage.setItem(STORAGE_KEYS.THEME, state.theme); } catch (e) {}
  const btn = document.getElementById('theme-toggle-btn');
  if (btn) {
    const isBn = state.lang === 'bn';
    btn.textContent = state.theme === 'dark' ? (isBn ? '☀️ লাইট' : '☀️ Light') : (isBn ? '🌙 ডার্ক' : '🌙 Dark');
  }
}

function showToast(message, type) {
  let box = document.getElementById('agri-toast-box');
  if (!box) {
    box = document.createElement('div');
    box.id = 'agri-toast-box';
    document.body.appendChild(box);
  }
  const bg = type === 'error' ? '#e11d48' : type === 'info' ? '#2563eb' : '#059669';
  const toast = document.createElement('div');
  toast.style.cssText = `background:${bg}; color:#fff; padding:12px 18px; border-radius:12px; font-weight:700; box-shadow:0 10px 25px rgba(0,0,0,0.22); max-width:360px; font-size:0.95rem; transition:opacity 0.25s ease;`;
  toast.textContent = message;
  box.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 260);
  }, 3200);
}

// ----------------- DATA NORMALIZATION & SUPABASE SYNC -----------------
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
  let items = [];
  if (Array.isArray(raw.items)) items = raw.items;
  else if (typeof raw.items === 'string') {
    try { const parsed = JSON.parse(raw.items); if (Array.isArray(parsed)) items = parsed; } catch (e) {}
  }
  const totalAmount = Number(raw.totalAmount ?? raw.total_amount ?? 0);
  const discount = Number(raw.discount ?? 0);
  const netPayable = Number(raw.netPayable ?? raw.net_payable ?? Math.max(0, totalAmount - discount));
  const paidAmount = Number(raw.paidAmount ?? raw.paid_amount ?? netPayable);
  const dueAmount = Number(raw.dueAmount ?? raw.due_amount ?? Math.max(0, netPayable - paidAmount));
  const totalCost = Number(raw.totalCost ?? raw.total_cost ?? 0);
  const profit = Number(raw.profit ?? (netPayable - totalCost));
  return {
    id: String(raw.id),
    memoNo: String(raw.memoNo ?? raw.memo_no ?? ('MEMO-' + String(raw.id).slice(-4))),
    customerName: String(raw.customerName ?? raw.customer_name ?? 'অজানা কাস্টমার'),
    customerPhone: String(raw.customerPhone ?? raw.customer_phone ?? raw.phone ?? ''),
    items,
    totalAmount,
    totalCost,
    profit,
    discount,
    netPayable,
    paidAmount,
    dueAmount,
    paymentMethod: String(raw.paymentMethod ?? raw.payment_method ?? 'ক্যাশ (Cash)'),
    date: String(raw.date || getLocalDateTimeForDate(getLocalDateKey())),
    note: String(raw.note || ''),
  };
}

window.loadState = async function() {
  state.isLoading = true;
  render();

  try {
    const savedLang = localStorage.getItem(STORAGE_KEYS.LANG);
    if (savedLang === 'bn' || savedLang === 'en') state.lang = savedLang;
    applyTheme(localStorage.getItem(STORAGE_KEYS.THEME) === 'dark' ? 'dark' : 'light');
    state.typography = Object.assign({}, DEFAULT_TYPOGRAPHY, loadJsonStorage(STORAGE_KEYS.TYPOGRAPHY, {}));
    applyTypographySettings(state.typography);
  } catch (e) {}

  const savedCust = loadJsonStorage(STORAGE_KEYS.CUSTOMERS, null);
  state.customers = Array.isArray(savedCust) && savedCust.length > 0 ? savedCust : JSON.parse(JSON.stringify(INITIAL_REGULAR_CUSTOMERS));
  const fallbackProducts = (loadJsonStorage(STORAGE_KEYS.PRODUCTS, []) || []).map(normalizeProduct);
  const fallbackSales = (loadJsonStorage(STORAGE_KEYS.SALES, []) || []).map(normalizeSale);

  if (!supabaseClient) {
    state.products = fallbackProducts.length > 0 ? fallbackProducts : JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
    state.sales = fallbackSales;
    state.syncMode = 'local';
    state.syncMessage = 'Supabase SDK লোড হয়নি, লোকাল স্টোরেজে চলছে';
    state.isLoading = false;
    render();
    return;
  }

  try {
    const [prodRes, salesRes] = await Promise.all([
      supabaseClient.from('products').select('*').order('id', { ascending: true }),
      supabaseClient.from('sales').select('*').order('date', { ascending: false }),
    ]);

    if (prodRes.error || salesRes.error) {
      const errObj = prodRes.error || salesRes.error;
      state.products = fallbackProducts.length > 0 ? fallbackProducts : JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
      state.sales = fallbackSales;
      state.syncMode = 'local';
      state.syncMessage = errObj.message || 'Supabase fetch error';
    } else {
      state.products = (prodRes.data || []).map(normalizeProduct).sort((a, b) => a.id - b.id);
      state.sales = (salesRes.data || []).map(normalizeSale);
      state.syncMode = 'supabase';
      state.syncMessage = '';
      saveJsonStorage(STORAGE_KEYS.PRODUCTS, state.products);
      saveJsonStorage(STORAGE_KEYS.SALES, state.sales);
    }
  } catch (err) {
    state.products = fallbackProducts.length > 0 ? fallbackProducts : JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
    state.sales = fallbackSales;
    state.syncMode = 'local';
    state.syncMessage = err && err.message ? err.message : 'Network error';
  }

  state.isLoading = false;
  render();
};

async function saveProductToDb(product) {
  saveJsonStorage(STORAGE_KEYS.PRODUCTS, state.products);
  if (!supabaseClient) return { ok: false, error: 'Offline mode' };
  try {
    const { error } = await supabaseClient.from('products').upsert([product]);
    if (error) return { ok: false, error: error.message };
    state.syncMode = 'supabase';
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message || 'Network error' };
  }
}

async function updateProductStockInDb(prodId, newStock) {
  saveJsonStorage(STORAGE_KEYS.PRODUCTS, state.products);
  if (!supabaseClient) return { ok: false };
  try {
    const { error } = await supabaseClient.from('products').update({ stock: newStock }).eq('id', prodId);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

async function deleteProductFromDb(prodId) {
  saveJsonStorage(STORAGE_KEYS.PRODUCTS, state.products);
  if (!supabaseClient) return;
  try { await supabaseClient.from('products').delete().eq('id', prodId); } catch (e) {}
}

async function insertSaleToDb(saleRecord) {
  if (!supabaseClient) {
    saveJsonStorage(STORAGE_KEYS.SALES, [saleRecord, ...state.sales]);
    return { ok: true, localOnly: true };
  }
  const totalQty = (saleRecord.items || []).reduce((s, it) => s + Number(it.quantity || 0), 0);
  const summaryNames = (saleRecord.items || []).map((it) => `${cleanProductTitle(it.productName)} (${it.quantity} ${it.unit})`).join(', ');
  const extendedPayload = Object.assign({}, saleRecord, {
    phone: saleRecord.customerPhone || '',
    quantity: Number(totalQty.toFixed(2)),
    productName: summaryNames,
  });

  try {
    const res = await supabaseClient.from('sales').insert([extendedPayload]).select();
    if (res.error) {
      const msg = res.error.message || '';
      if (res.error.code === 'PGRST204' || res.error.code === '42703' || msg.toLowerCase().includes('column')) {
        const retry = await supabaseClient.from('sales').insert([saleRecord]).select();
        if (retry.error) return { ok: false, error: retry.error.message };
        state.syncMode = 'supabase';
        return { ok: true };
      }
      return { ok: false, error: msg };
    }
    state.syncMode = 'supabase';
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message || 'Network error' };
  }
}

async function deleteSaleFromDb(saleId) {
  saveJsonStorage(STORAGE_KEYS.SALES, state.sales);
  if (!supabaseClient) return;
  try { await supabaseClient.from('sales').delete().eq('id', saleId); } catch (e) {}
}

function generateMemoNo() {
  return `MEMO-${String(state.sales.length + 101).padStart(4, '0')}-${Date.now().toString(36).slice(-4).toUpperCase()}`;
}

// ----------------- AVATAR & IMAGE HELPERS -----------------
function compressImageFile(file, maxSize, callback) {
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width: w, height: h } = img;
      if (w > h && w > maxSize) { h = Math.round((h * maxSize) / w); w = maxSize; }
      else if (h >= w && h > maxSize) { w = Math.round((w * maxSize) / h); h = maxSize; }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, w, h);
        callback(canvas.toDataURL('image/jpeg', 0.82));
      } else {
        callback(reader.result);
      }
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

function renderAvatarSvg(cust, sizePx) {
  const c = cust || {};
  const sizeStyle = sizePx ? `width:${sizePx}px; height:${sizePx}px;` : '';
  if (c.customPhoto) {
    return `<div class="customer-avatar-wrap" style="${sizeStyle}"><img src="${c.customPhoto}" alt="${esc(c.name)}" style="width:100%; height:100%; object-fit:cover;" /></div>`;
  }
  const skin = c.skinTone || '#d99b72';
  const hair = c.hairColor || '#1e293b';
  const shirt = c.shirtColor || '#059669';
  return `<div class="customer-avatar-wrap" style="background:${shirt}33; ${sizeStyle}">
    <svg viewBox="0 0 64 64" width="100%" height="100%">
      <circle cx="32" cy="32" r="32" fill="${shirt}" opacity="0.22" />
      <path d="M10 64 C10 48, 20 43, 32 43 C44 43, 54 48, 54 64 Z" fill="${shirt}" />
      <rect x="27" y="36" width="10" height="10" rx="4" fill="${skin}" />
      <rect x="20" y="14" width="24" height="26" rx="12" fill="${skin}" />
      ${c.hasCap
        ? '<path d="M19 20 C19 10, 45 10, 45 20 Z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1" />'
        : `<path d="M20 22 C20 12, 44 12, 44 22 C41 16, 23 16, 20 22 Z" fill="${hair}" />`}
      <circle cx="26.5" cy="26.5" r="1.7" fill="#0f172a" />
      <circle cx="37.5" cy="26.5" r="1.7" fill="#0f172a" />
      ${c.hasGlasses ? '<g stroke="#0f172a" stroke-width="1.5" fill="rgba(255,255,255,0.25)"><rect x="22" y="23.5" width="8.5" height="6" rx="2"/><rect x="33.5" y="23.5" width="8.5" height="6" rx="2"/><line x1="30.5" y1="26" x2="33.5" y2="26"/></g>' : ''}
      ${c.hasBeard ? `<path d="M20 28 C20 38, 26 42, 32 42 C38 42, 44 38, 44 28 C42 32, 38 35, 32 35 C26 35, 22 32, 20 28 Z" fill="${hair}" opacity="0.9" />` : ''}
      <path d="M28 33.5 Q32 36.5 36 33.5" fill="none" stroke="${c.hasBeard ? '#ffffff' : '#7c2d12'}" stroke-width="1.6" stroke-linecap="round" />
    </svg>
  </div>`;
}

// ----------------- CORE RENDER & SYNC BANNER -----------------
function updateFooterSyncStatus() {
  const footer = document.getElementById('db-sync-footer');
  if (!footer) return;
  const isBn = state.lang === 'bn';
  const syncText = state.syncMode === 'supabase' ? (isBn ? 'Supabase লাইভ সংযুক্ত' : 'Supabase Live') : (isBn ? 'লোকাল ব্যাকআপ মোড' : 'Local Backup');
  footer.textContent = `${isBn ? 'মুদ্রা: ৳ (টাকা)' : 'Currency: ৳ (BDT)'} · ${state.products.length} ${isBn ? 'টি পণ্য' : 'products'} · ${syncText}`;
}

function renderSyncNoticeBanner() {
  if (state.syncMode !== 'local' || !state.syncMessage) return '';
  const isBn = state.lang === 'bn';
  return `<div class="sync-banner">
    <div><strong>${isBn ? 'লোকাল ব্যাকআপ মোড:' : 'Local Backup Mode:'}</strong> <span>${esc(state.syncMessage)}</span></div>
    <button type="button" class="btn btn-outline btn-sm" onclick="loadState()">🔄 ${isBn ? 'আবার সিঙ্ক করুন' : 'Retry Sync'}</button>
  </div>`;
}

window.render = function() {
  document.querySelectorAll('.nav-item, .mobile-nav-item').forEach((el) => {
    el.classList.toggle('active', el.dataset.tab === state.currentTab);
  });
  const langBtn = document.getElementById('lang-toggle-btn');
  if (langBtn) langBtn.textContent = state.lang === 'bn' ? 'English' : 'বাংলা';

  applyTheme(state.theme);
  applyTypographySettings(state.typography);
  updateFooterSyncStatus();

  const main = document.getElementById('app-main-content');
  if (!main) return;
  if (state.isLoading) {
    main.innerHTML = `<div class="loading-state"><div class="spinner"></div><div>${state.lang === 'bn' ? 'ডাটাবেজ থেকে তথ্য লোড হচ্ছে...' : 'Loading data from Supabase...'}</div></div>`;
    return;
  }
  if (state.currentTab === 'dashboard') renderDashboard(main);
  else if (state.currentTab === 'products') renderProducts(main);
  else if (state.currentTab === 'history') renderHistory(main);
  else if (state.currentTab === 'restock') renderRestock(main);
  else if (state.currentTab === 'analytics') renderAnalytics(main);
};

// ----------------- 1. DASHBOARD & POS VIEW -----------------
function renderCustomerGridHtml() {
  const isBn = state.lang === 'bn';
  const q = state.customerSearchTerm.trim().toLowerCase();
  const filtered = state.customers.filter((c) => !q || c.name.toLowerCase().includes(q) || (c.shopName || '').toLowerCase().includes(q) || (c.phone || '').includes(q));
  if (filtered.length === 0) {
    return `<div style="grid-column:1/-1; text-align:center; padding:18px; color:var(--color-text-subtle);">${isBn ? 'কোনো গ্রাহক পাওয়া যায়নি' : 'No matching customers'}</div>`;
  }
  return filtered.map((c) => {
    const isSelected = state.selectedCustomerId === c.id && state.posCustomerName === c.name;
    return `<div class="customer-card ${isSelected ? 'selected' : ''}" onclick="selectRegularCustomer('${esc(c.id)}')">
      <span class="customer-edit-badge" title="${isBn ? 'ছবি পরিবর্তন' : 'Edit Photo'}" onclick="event.stopPropagation(); openCustomerSettingsModal('${esc(c.id)}')">📷</span>
      ${isSelected ? '<span class="customer-check-badge">✓</span>' : ''}
      ${renderAvatarSvg(c)}
      <div class="customer-name-text">${esc(c.name)}</div>
    </div>`;
  }).join('');
}

function renderPosProductGridHtml() {
  const isBn = state.lang === 'bn';
  const available = state.products.filter((p) => p.stock > 0 && p.sell_price > 0);
  const q = state.posProductSearch.trim().toLowerCase();
  const filtered = available.filter((p) => {
    const catOk = state.posCategoryFilter === 'সব' || p.category === state.posCategoryFilter;
    const qOk = !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    return catOk && qOk;
  });

  if (state.products.length === 0) {
    return `<div style="grid-column:1/-1; text-align:center; padding:24px;">
      <p style="margin-bottom:10px; color:var(--color-text-muted);">${isBn ? 'ডাটাবেজে কোনো পণ্য পাওয়া যায়নি।' : 'No products in database.'}</p>
      <button type="button" class="btn btn-primary btn-sm" onclick="seedDefaultProductsToSupabase()">📦 ${isBn ? 'প্রাথমিক ২৯টি পণ্য যোগ করুন' : 'Seed 29 Default Products'}</button>
    </div>`;
  }
  if (filtered.length === 0) {
    return `<div style="grid-column:1/-1; text-align:center; padding:24px; color:var(--color-text-subtle);">${isBn ? 'এই ক্যাটাগরিতে উপলব্ধ পণ্য নেই' : 'No available products in this category'}</div>`;
  }
  return filtered.map((p) => {
    const cartEntry = state.cart.find((item) => item.productId === p.id);
    const inCartQty = cartEntry ? cartEntry.quantity : 0;
    return `<button type="button" class="product-card ${getCategoryCardClass(p.category)} ${inCartQty > 0 ? 'selected' : ''}" title="${inCartQty > 0 ? (isBn ? 'কার্ট থেকে সরাতে আবার ক্লিক করুন' : 'Click again to remove') : (isBn ? 'কার্টে যোগ করতে ক্লিক করুন' : 'Click to add')}" onclick="toggleProductInCart(${p.id})">
      <div style="display:flex; justify-content:space-between; align-items:center; gap:6px;">
        <span class="product-card-cat">${esc(p.category)}</span>
        ${inCartQty > 0 ? `<span class="in-cart-pill">✓ ${inCartQty} ${esc(p.unit)}</span>` : '<span style="font-weight:800; opacity:0.6;">+</span>'}
      </div>
      <div class="product-card-title">${esc(cleanProductTitle(p.name))}</div>
      <div class="product-card-footer">
        <span class="font-mono" style="font-weight:800; font-size:1.15rem; color:var(--color-primary);">৳${p.sell_price}<small style="font-size:0.8rem; color:var(--color-text-subtle);">/${esc(p.unit)}</small></span>
        <span class="font-mono" style="font-size:0.9rem; font-weight:700;">${p.stock} ${esc(p.unit)}</span>
      </div>
    </button>`;
  }).join('');
}

function renderDashboard(container) {
  const isBn = state.lang === 'bn';
  const todayKey = getLocalDateKey();
  const sessionDate = state.sessionDate || todayKey;
  const availableProducts = state.products.filter((p) => p.stock > 0 && p.sell_price > 0);
  const sessionSales = state.sales.filter((s) => extractSaleDateKey(s.date) === sessionDate);

  // Sync cart items with current stock
  state.cart = state.cart.filter((item) => {
    const fresh = state.products.find((p) => p.id === item.productId);
    return fresh && fresh.stock > 0;
  });

  const totalStockUnits = state.products.reduce((acc, p) => acc + p.stock, 0);
  const totalRevenue = sessionSales.reduce((acc, s) => acc + s.netPayable, 0);
  const totalProfit = sessionSales.reduce((acc, s) => acc + s.profit, 0);
  const totalDue = sessionSales.reduce((acc, s) => acc + s.dueAmount, 0);
  const lowStockCount = state.products.filter((p) => p.stock <= (p.minStockAlert || 15)).length;

  container.innerHTML = `
    ${renderSyncNoticeBanner()}

    <div class="session-strip">
      <div style="display:flex; flex-wrap:wrap; align-items:center; gap:10px;">
        <span style="font-weight:800;">📅 ${isBn ? 'বিক্রি সেশনের তারিখ:' : 'Session Date:'}</span>
        <input type="date" class="form-control font-mono" style="width:auto; padding:6px 12px; font-weight:800;" value="${sessionDate}" onchange="if(this.value){state.sessionDate=this.value; render();}" />
        ${sessionDate === todayKey
          ? `<span class="status-pill status-in-stock">${isBn ? 'আজকের আলাদা হিসাব সক্রিয়' : 'Today Active'}</span>`
          : `<button type="button" class="btn btn-outline btn-sm" onclick="state.sessionDate='${todayKey}'; render();">${isBn ? 'আজকের তারিখে ফিরুন' : 'Reset Today'}</button>`}
      </div>
      <div style="display:flex; flex-wrap:wrap; gap:8px;">
        <button type="button" class="btn btn-outline btn-sm" onclick="openFontSettingsModal()">🔤 ${isBn ? 'ফন্ট ও স্টাইল' : 'Font & Style'}</button>
        <button type="button" class="btn btn-outline btn-sm" onclick="state.currentTab='analytics'; render();">📊 ${isBn ? 'হিসাব ও রিপোর্ট' : 'Analytics'}</button>
      </div>
    </div>

    <div class="kpi-grid">
      <div class="kpi-card kpi-sky"><div class="kpi-header"><span>${isBn ? 'মোট পণ্যের ধরন' : 'Product Types'}</span><span>📦</span></div><div class="kpi-value tabular-nums">${state.products.length} <small style="font-size:0.9rem">${isBn ? 'টি' : 'items'}</small></div><div class="kpi-subtext">${isBn ? 'উপলব্ধ:' : 'In stock:'} ${availableProducts.length} ${isBn ? 'টি' : ''}</div></div>
      <div class="kpi-card kpi-teal"><div class="kpi-header"><span>${isBn ? 'মোট স্টক মজুদ' : 'Total Stock'}</span><span>📊</span></div><div class="kpi-value tabular-nums">${totalStockUnits.toLocaleString()}</div><div class="kpi-subtext">${isBn ? 'সকল আইটেম মিলিয়ে' : 'All items'}</div></div>
      <div class="kpi-card kpi-violet"><div class="kpi-header"><span>${sessionDate === todayKey ? (isBn ? 'আজকের বিক্রি' : "Today's Sales") : (isBn ? 'সেশনের বিক্রি' : 'Session Sales')}</span><span>🧾</span></div><div class="kpi-value tabular-nums">${sessionSales.length} <small style="font-size:0.9rem">${isBn ? 'বার' : 'txns'}</small></div><div class="kpi-subtext">${sessionDate}</div></div>
      <div class="kpi-card kpi-emerald"><div class="kpi-header"><span>${sessionDate === todayKey ? (isBn ? 'আজকের বিক্রয়মূল্য' : "Today's Revenue") : (isBn ? 'সেশনের বিক্রয়মূল্য' : 'Session Revenue')}</span><span>📈</span></div><div class="kpi-value tabular-nums" style="color:var(--color-primary)">${formatTaka(totalRevenue)}</div><div class="kpi-subtext">${isBn ? 'মোট ক্যাশ ও পাওনা' : 'Gross sales'}</div></div>
      <div class="kpi-card kpi-indigo"><div class="kpi-header"><span>${sessionDate === todayKey ? (isBn ? 'আজকের নীট লাভ' : "Today's Profit") : (isBn ? 'সেশনের লাভ' : 'Session Profit')}</span><span>💰</span></div><div class="kpi-value tabular-nums" style="color:#6366f1">${formatTaka(totalProfit)}</div><div class="kpi-subtext">${totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) + '% ' + (isBn ? 'মার্জিন' : 'margin') : '0%'}</div></div>
      <div class="kpi-card kpi-amber"><div class="kpi-header"><span>${isBn ? 'বাকি পাওনা টাকা' : 'Due Receivables'}</span><span>⚠️</span></div><div class="kpi-value tabular-nums" style="color:${totalDue > 0 ? 'var(--color-warning)' : 'inherit'}">${formatTaka(totalDue)}</div><div class="kpi-subtext">${lowStockCount > 0 ? lowStockCount + ' ' + (isBn ? 'আইটেমে কম স্টক' : 'low stock') : (isBn ? 'স্টক সন্তোষজনক' : 'Healthy')}</div></div>
    </div>

    <div class="pos-layout">
      <div class="panel">
        <div class="panel-header panel-header-gradient">
          <div class="panel-title"><span>🛒</span><span>${isBn ? 'মাল্টি-প্রোডাক্ট সেলস এন্ট্রি (POS)' : 'Multi-Product Sale Entry (POS)'}</span></div>
          <span id="pos-header-cart-count" style="font-size:0.9rem; font-weight:700;">${state.cart.length > 0 ? `${isBn ? 'কার্টে' : 'Cart:'} ${state.cart.length}${isBn ? 'টি পণ্য' : ''}` : (isBn ? 'স্বয়ংক্রিয় স্টক সমন্বয়' : 'Auto Stock Sync')}</span>
        </div>

        <div class="panel-body">
          <form id="pos-sale-form">
            <div class="pos-step-header">
              <div class="pos-step-title"><span class="step-badge">১</span><span>${isBn ? 'নিয়মিত গ্রাহক নির্বাচন করুন' : 'Select Regular Customer'}</span></div>
              <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
                <input type="text" class="form-control" style="width:160px; padding:7px 12px; font-size:0.9rem;" placeholder="${isBn ? 'গ্রাহক খুঁজুন...' : 'Search...'}" value="${esc(state.customerSearchTerm)}" oninput="handleCustomerSearch(this.value)" />
                <button type="button" class="btn btn-outline btn-sm" onclick="openCustomerSettingsModal()">📷 ${isBn ? 'ছবি ও প্রোফাইল' : 'Photos'}</button>
                <button type="button" class="btn btn-outline btn-sm" onclick="toggleAddCustomerForm()">${state.showAddCustomerForm ? '✕ ' + (isBn ? 'বন্ধ' : 'Close') : '+ ' + (isBn ? 'নতুন গ্রাহক' : 'Add')}</button>
              </div>
            </div>

            ${state.showAddCustomerForm ? `
              <div style="padding:14px; border:1px solid var(--color-primary-border); background:var(--color-primary-light); border-radius:12px; margin-bottom:14px;">
                <div class="grid-3 form-group">
                  <input type="text" id="new-cust-name" class="form-control" placeholder="${isBn ? 'গ্রাহকের নাম *' : 'Name *'}" />
                  <input type="text" id="new-cust-shop" class="form-control" placeholder="${isBn ? 'দোকানের নাম (ঐচ্ছিক)' : 'Shop Name'}" />
                  <input type="text" id="new-cust-phone" class="form-control" placeholder="017xxxxxxxx" />
                </div>
                <button type="button" class="btn btn-primary btn-sm" onclick="saveNewCustomer()">${isBn ? 'গ্রাহক সংরক্ষণ ও সিলেক্ট' : 'Save & Select'}</button>
              </div>` : ''}

            <div id="pos-customer-grid" class="customer-grid">${renderCustomerGridHtml()}</div>

            <div class="grid-2 form-group">
              <div><label class="form-label">${isBn ? 'কাস্টমারের নাম' : 'Customer Name'} *</label><input type="text" id="pos-customer-name" class="form-control" style="font-weight:700" value="${esc(state.posCustomerName)}" oninput="state.posCustomerName=this.value" required /></div>
              <div><label class="form-label">${isBn ? 'মোবাইল নম্বর (ঐচ্ছিক)' : 'Phone Number'}</label><input type="text" id="pos-customer-phone" class="form-control font-mono" style="font-weight:700" value="${esc(state.posCustomerPhone)}" oninput="state.posCustomerPhone=this.value" placeholder="017xxxxxxxx" /></div>
            </div>

            <div style="border-top:1px solid var(--color-border); padding-top:20px; margin-top:20px;">
              <div class="pos-step-header">
                <div class="pos-step-title"><span class="step-badge" style="background:#059669">২</span><span>${isBn ? 'পণ্যে ক্লিক করে কার্টে যোগ/রিমুভ করুন' : 'Click Product to Toggle in Cart'}</span></div>
                <input type="text" class="form-control" style="width:195px; padding:7px 12px; font-size:0.9rem;" placeholder="${isBn ? 'পণ্য বা সাইজ খুঁজুন...' : 'Search product...'}" value="${esc(state.posProductSearch)}" oninput="handlePosProductSearch(this.value)" />
              </div>
              <div id="pos-category-chips" class="chip-group">
                ${CATEGORIES.map((c) => `<button type="button" class="chip ${state.posCategoryFilter === c ? 'active' : ''}" onclick="setPosCategory('${esc(c)}')">${esc(c)}</button>`).join('')}
              </div>
              <div id="pos-product-grid" class="product-grid">${renderPosProductGridHtml()}</div>
            </div>

            <div style="border-top:1px solid var(--color-border); padding-top:20px; margin-top:14px;">
              <div class="pos-step-header">
                <div class="pos-step-title"><span class="step-badge" style="background:#d97706">৩</span><span>${isBn ? 'সক্রিয় কার্ট ও পরিমাণ (+/-)' : 'Active Cart & Quantity (+/-)'}</span></div>
                <button type="button" id="clear-cart-btn" class="btn btn-outline btn-sm" style="color:var(--color-danger); display:${state.cart.length > 0 ? 'inline-flex' : 'none'};" onclick="clearPosCart()">🗑️ ${isBn ? 'কার্ট খালি করুন' : 'Clear Cart'}</button>
              </div>
              <div id="pos-cart-container"></div>
            </div>

            <div style="border-top:1px solid var(--color-border); padding-top:20px; margin-top:14px;">
              <div class="pos-step-header"><div class="pos-step-title"><span class="step-badge" style="background:#0d9488">৪</span><span>${isBn ? 'পেমেন্ট ও মেমো চূড়ান্ত করুন' : 'Payment & Checkout'}</span></div></div>
              <div class="grid-3 form-group">
                <div>
                  <label class="form-label">${isBn ? 'পেমেন্ট মাধ্যম' : 'Payment Method'}</label>
                  <select id="pos-payment-method" class="form-control" onchange="state.posPaymentMethod=this.value; updatePosCalculations()">
                    ${['ক্যাশ (Cash)', 'বিকাশ (bKash)', 'নগদ (Nagad)', 'ব্যাংক (Bank)', 'বাকি (Due)'].map((pm) => `<option value="${pm}" ${state.posPaymentMethod === pm ? 'selected' : ''}>${pm}</option>`).join('')}
                  </select>
                </div>
                <div><label class="form-label">${isBn ? 'ছাড় / ডিসকাউন্ট (৳)' : 'Discount (৳)'}</label><input type="number" id="pos-discount" class="form-control font-mono" value="${state.posDiscount || ''}" placeholder="0" min="0" oninput="state.posDiscount=parseFloat(this.value)||0; updatePosCalculations()" /></div>
                <div><label class="form-label">${isBn ? 'পরিশোধিত টাকা (৳)' : 'Paid Amount (৳)'}</label><input type="number" id="pos-paid" class="form-control font-mono" value="${esc(state.posPaidAmount)}" placeholder="${isBn ? 'পূর্ণ টাকা' : 'Full amount'}" oninput="state.posPaidAmount=this.value; updatePosCalculations()" /></div>
              </div>
              <div class="form-group"><label class="form-label">${isBn ? 'চালানের নোট (ঐচ্ছিক)' : 'Note'}</label><input type="text" id="pos-note" class="form-control" value="${esc(state.posNote)}" oninput="state.posNote=this.value" placeholder="${isBn ? 'যেমন: আড়তে ডেলিভারি দেওয়া হয়েছে' : 'Delivery note...'}" /></div>
              <button type="submit" class="btn btn-primary" style="width:100%; padding:15px; font-size:1.1rem; font-weight:800;" ${state.isSubmitting ? 'disabled' : ''}>
                <span>✓</span><span>${isBn ? 'বিক্রি নিশ্চিত করুন ও মেমো তৈরি করুন' : 'Confirm Sale & Generate Memo'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <div style="position:sticky; top:90px;">
        <div class="panel" style="margin-bottom:20px;">
          <div class="panel-header panel-header-indigo">
            <span class="panel-title">${isBn ? 'লাইভ কার্ট সামারি' : 'Live Cart Summary'}</span>
            <span id="summary-item-badge" style="font-size:0.85rem; font-weight:800; background:rgba(255,255,255,0.22); padding:4px 10px; border-radius:10px;"></span>
          </div>
          <div class="panel-body" id="pos-calculations-box"></div>
        </div>

        <div class="panel">
          <div class="panel-header"><span class="panel-title">${isBn ? 'জনপ্রিয় আইটেম স্টক' : 'Popular Items Stock'}</span></div>
          <div class="panel-body" style="padding:12px 18px;">
            ${state.products.slice(0, 6).map((p) => `
              <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid var(--color-border-subtle); font-size:0.95rem;">
                <div><div style="font-weight:700">${esc(cleanProductTitle(p.name))}</div><div style="color:var(--color-text-subtle); font-size:0.85rem">৳${p.sell_price} / ${esc(p.unit)}</div></div>
                <div class="font-mono" style="font-weight:800; color:${p.stock === 0 ? 'var(--color-danger)' : p.stock < 20 ? 'var(--color-warning)' : 'var(--color-primary)'}">${p.stock} ${esc(p.unit)}</div>
              </div>`).join('')}
          </div>
        </div>
      </div>
    </div>

    <div class="panel" style="margin-top:24px;">
      <div class="panel-header" style="flex-wrap:wrap; gap:8px;">
        <div>
          <span class="panel-title">${sessionDate === todayKey ? (isBn ? 'আজকের বিক্রয়সমূহ (পৃথক সেশন)' : "Today's Sales") : `${sessionDate} ${isBn ? 'তারিখের বিক্রয়সমূহ' : 'Sales'}`}</span>
          <div style="font-size:0.85rem; color:var(--color-text-subtle); font-weight:600;">${isBn ? 'পূর্বের বা অন্য দিনের হিসাব এখানে মিশবে না' : 'Isolated by date'}</div>
        </div>
        <span style="font-size:0.9rem; font-weight:700; color:var(--color-text-subtle)">${sessionSales.length} ${isBn ? 'টি বিক্রি' : 'sales'}</span>
      </div>
      ${sessionSales.length === 0
        ? `<div style="padding:32px; text-align:center; color:var(--color-text-muted); font-weight:700;">${isBn ? `${sessionDate} তারিখে এখনো কোনো বিক্রি রেকর্ড হয়নি।` : `No sales recorded on ${sessionDate}.`}</div>`
        : `<div class="table-responsive"><table class="data-table"><thead><tr><th>${isBn ? 'মেমো নং' : 'Memo'}</th><th>${isBn ? 'তারিখ ও সময়' : 'Date'}</th><th>${isBn ? 'কাস্টমার' : 'Customer'}</th><th>${isBn ? 'পণ্য ও পরিমাণ' : 'Items'}</th><th class="text-right">${isBn ? 'মোট টাকা' : 'Total'}</th><th class="text-right">${isBn ? 'লাভ' : 'Profit'}</th><th class="text-center">${isBn ? 'পেমেন্ট' : 'Payment'}</th><th class="text-center">${isBn ? 'রসিদ' : 'Memo'}</th></tr></thead><tbody>
          ${sessionSales.slice(0, 12).map((sale) => `<tr>
            <td class="font-mono" style="font-weight:800">${esc(sale.memoNo)}</td>
            <td style="color:var(--color-text-subtle)">${esc(sale.date)}</td>
            <td style="font-weight:700">${esc(sale.customerName)}</td>
            <td>${esc((sale.items || []).map((it) => `${cleanProductTitle(it.productName)} (${it.quantity} ${it.unit})`).join(', ') || '-')}</td>
            <td class="text-right font-mono" style="font-weight:800">${formatTaka(sale.netPayable)}</td>
            <td class="text-right font-mono" style="font-weight:800; color:var(--color-primary)">${formatTaka(sale.profit)}</td>
            <td class="text-center"><div>${esc(sale.paymentMethod)}</div>${sale.dueAmount > 0 ? `<div style="color:var(--color-danger); font-size:0.85rem; font-weight:700">বাকি: ৳${sale.dueAmount}</div>` : ''}</td>
            <td class="text-center"><button type="button" class="btn btn-outline btn-sm" onclick="showInvoiceModal('${esc(sale.id)}')">👁️ ${isBn ? 'মেমো' : 'Memo'}</button></td>
          </tr>`).join('')}
        </tbody></table></div>`}
    </div>
  `;

  const form = document.getElementById('pos-sale-form');
  if (form) form.onsubmit = handlePosSubmit;
  renderCartSection();
}

// ----------------- POS INTERACTIONS (FOCUS-SAFE & TOGGLE CART) -----------------
window.handleCustomerSearch = function(val) {
  state.customerSearchTerm = val;
  const grid = document.getElementById('pos-customer-grid');
  if (grid) grid.innerHTML = renderCustomerGridHtml();
};

window.toggleAddCustomerForm = function() {
  state.showAddCustomerForm = !state.showAddCustomerForm;
  render();
};

window.saveNewCustomer = function() {
  const name = (document.getElementById('new-cust-name')?.value || '').trim();
  const shop = (document.getElementById('new-cust-shop')?.value || '').trim();
  const phone = (document.getElementById('new-cust-phone')?.value || '').trim();
  if (!name) { showToast(state.lang === 'bn' ? 'দয়া করে গ্রাহকের নাম লিখুন!' : 'Enter customer name!', 'error'); return; }
  const colors = ['#059669', '#4f46e5', '#d97706', '#0891b2', '#e11d48'];
  const cust = {
    id: 'cust_' + Date.now(),
    name,
    shopName: shop || 'নিয়মিত ক্রেতা',
    phone,
    shirtColor: colors[state.customers.length % colors.length],
    skinTone: '#d99b72',
    hairColor: '#1e293b',
  };
  state.customers.unshift(cust);
  saveJsonStorage(STORAGE_KEYS.CUSTOMERS, state.customers);
  state.selectedCustomerId = cust.id;
  state.posCustomerName = cust.name;
  state.posCustomerPhone = cust.phone;
  state.showAddCustomerForm = false;
  showToast(state.lang === 'bn' ? 'নতুন গ্রাহক যোগ হয়েছে!' : 'Customer added!', 'success');
  render();
};

window.selectRegularCustomer = function(custId) {
  const cust = state.customers.find((c) => c.id === custId);
  if (!cust) return;
  state.selectedCustomerId = cust.id;
  state.posCustomerName = cust.name;
  state.posCustomerPhone = cust.phone || '';
  const nameInput = document.getElementById('pos-customer-name');
  const phoneInput = document.getElementById('pos-customer-phone');
  if (nameInput) nameInput.value = cust.name;
  if (phoneInput) phoneInput.value = cust.phone || '';
  const grid = document.getElementById('pos-customer-grid');
  if (grid) grid.innerHTML = renderCustomerGridHtml();
};

window.setPosCategory = function(cat) {
  state.posCategoryFilter = cat;
  const chips = document.getElementById('pos-category-chips');
  if (chips) chips.innerHTML = CATEGORIES.map((c) => `<button type="button" class="chip ${state.posCategoryFilter === c ? 'active' : ''}" onclick="setPosCategory('${esc(c)}')">${esc(c)}</button>`).join('');
  const grid = document.getElementById('pos-product-grid');
  if (grid) grid.innerHTML = renderPosProductGridHtml();
};

window.handlePosProductSearch = function(val) {
  state.posProductSearch = val;
  const grid = document.getElementById('pos-product-grid');
  if (grid) grid.innerHTML = renderPosProductGridHtml();
};

function syncPosGridAndCartUI() {
  const grid = document.getElementById('pos-product-grid');
  if (grid) grid.innerHTML = renderPosProductGridHtml();
  const clearBtn = document.getElementById('clear-cart-btn');
  if (clearBtn) clearBtn.style.display = state.cart.length > 0 ? 'inline-flex' : 'none';
  const hdrCount = document.getElementById('pos-header-cart-count');
  if (hdrCount) {
    const isBn = state.lang === 'bn';
    hdrCount.textContent = state.cart.length > 0 ? `${isBn ? 'কার্টে' : 'Cart:'} ${state.cart.length}${isBn ? 'টি পণ্য' : ''}` : (isBn ? 'স্বয়ংক্রিয় স্টক সমন্বয়' : 'Auto Stock Sync');
  }
  renderCartSection();
}

// Toggle Cart Logic: 1st click adds, 2nd click removes completely
window.toggleProductInCart = function(prodId) {
  const prod = state.products.find((p) => p.id === prodId);
  if (!prod || prod.stock <= 0) return;
  const idx = state.cart.findIndex((item) => item.productId === prodId);
  if (idx !== -1) state.cart.splice(idx, 1);
  else state.cart.push({ productId: prodId, quantity: 1, customRate: null });
  syncPosGridAndCartUI();
};
window.addToCart = window.toggleProductInCart;

window.adjustCartQty = function(prodId, delta) {
  const prod = state.products.find((p) => p.id === prodId);
  const item = state.cart.find((c) => c.productId === prodId);
  if (!prod || !item) return;
  item.quantity = Math.max(1, Math.min(prod.stock, Number(((item.quantity || 1) + delta).toFixed(2))));
  syncPosGridAndCartUI();
};

window.setCartQtyDirect = function(prodId, rawVal) {
  const prod = state.products.find((p) => p.id === prodId);
  const item = state.cart.find((c) => c.productId === prodId);
  if (!prod || !item) return;
  const parsed = parseFloat(rawVal);
  item.quantity = rawVal === '' || isNaN(parsed) ? 0 : Math.max(0, Math.min(prod.stock, parsed));
  const grid = document.getElementById('pos-product-grid');
  if (grid) grid.innerHTML = renderPosProductGridHtml();
  updatePosCalculations();
};

window.setCartRateDirect = function(prodId, rawVal) {
  const item = state.cart.find((c) => c.productId === prodId);
  if (!item) return;
  const parsed = parseFloat(rawVal);
  item.customRate = rawVal.trim() === '' || isNaN(parsed) ? null : Math.max(0, parsed);
  updatePosCalculations();
};

window.removeFromCart = function(prodId) {
  state.cart = state.cart.filter((c) => c.productId !== prodId);
  syncPosGridAndCartUI();
};

window.clearPosCart = function() {
  state.cart = [];
  state.posDiscount = 0;
  state.posPaidAmount = '';
  syncPosGridAndCartUI();
};

window.renderCartSection = function() {
  const container = document.getElementById('pos-cart-container');
  const isBn = state.lang === 'bn';
  if (!container) { updatePosCalculations(); return; }
  if (state.cart.length === 0) {
    container.innerHTML = `<div class="cart-empty-box">${isBn ? 'এখনো কোনো পণ্য কার্টে যোগ করা হয়নি — উপরের তালিকা থেকে পণ্যের কার্ডে ক্লিক করুন' : 'Cart is empty — click any product card above'}</div>`;
    updatePosCalculations();
    return;
  }

  container.innerHTML = `<div class="cart-list">${state.cart.map((item, idx) => {
    const prod = state.products.find((p) => p.id === item.productId);
    if (!prod) return '';
    const rate = item.customRate !== null && item.customRate !== undefined ? item.customRate : prod.sell_price;
    const lineTotal = (item.quantity || 0) * rate;
    const lineProfit = lineTotal - (item.quantity || 0) * prod.buy_price;
    return `<div class="cart-item-row">
      <div class="cart-item-top">
        <div>
          <div style="font-size:1.05rem; font-weight:800;">#${idx + 1} ${esc(cleanProductTitle(prod.name))} <span style="font-size:0.85rem; color:var(--color-text-subtle);">(${esc(prod.category)})</span></div>
          <div style="font-size:0.875rem; color:var(--color-text-muted);">${isBn ? 'মজুদ:' : 'Stock:'} <strong class="font-mono">${prod.stock} ${esc(prod.unit)}</strong> · ${isBn ? 'ক্রয়:' : 'Buy:'} ৳${prod.buy_price}</div>
        </div>
        <div style="display:flex; align-items:center; gap:10px;">
          <div class="text-right">
            <div class="font-mono" id="cart-line-total-${prod.id}" style="font-size:1.1rem; font-weight:800;">${formatTaka(lineTotal)}</div>
            <div class="font-mono" id="cart-line-profit-${prod.id}" style="font-size:0.85rem; font-weight:700; color:var(--color-primary);">${isBn ? 'লাভ:' : 'Profit:'} ${formatTaka(lineProfit)}</div>
          </div>
          <button type="button" class="btn btn-outline btn-sm" style="color:var(--color-danger)" onclick="removeFromCart(${prod.id})">✕</button>
        </div>
      </div>
      <div class="cart-item-controls">
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <label class="form-label" style="margin:0">${isBn ? 'পরিমাণ' : 'Qty'} (${esc(prod.unit)})</label>
            <div style="display:flex; gap:4px;">
              <button type="button" class="btn btn-outline btn-sm" style="padding:2px 8px;" onclick="adjustCartQty(${prod.id}, 5)">+5</button>
              <button type="button" class="btn btn-outline btn-sm" style="padding:2px 8px;" onclick="adjustCartQty(${prod.id}, 10)">+10</button>
            </div>
          </div>
          <div class="qty-stepper">
            <button type="button" class="qty-btn" onclick="adjustCartQty(${prod.id}, -1)">-</button>
            <input type="number" class="form-control qty-input font-mono" value="${item.quantity === 0 ? '' : item.quantity}" min="0.1" max="${prod.stock}" step="any" oninput="setCartQtyDirect(${prod.id}, this.value)" />
            <button type="button" class="qty-btn" onclick="adjustCartQty(${prod.id}, 1)">+</button>
          </div>
        </div>
        <div>
          <label class="form-label">${isBn ? 'বিক্রয় দর (৳)' : 'Sell Rate (৳)'}</label>
          <input type="number" class="form-control font-mono" style="font-weight:800" value="${item.customRate !== null && item.customRate !== undefined ? item.customRate : ''}" placeholder="৳${prod.sell_price}" min="0" step="any" oninput="setCartRateDirect(${prod.id}, this.value)" />
        </div>
      </div>
    </div>`;
  }).join('')}</div>`;

  updatePosCalculations();
};

window.updatePosCalculations = function() {
  const calcBox = document.getElementById('pos-calculations-box');
  const itemBadge = document.getElementById('summary-item-badge');
  const isBn = state.lang === 'bn';
  if (itemBadge) itemBadge.textContent = `${state.cart.length} ${isBn ? 'টি পণ্য' : 'items'}`;
  if (!calcBox) return;

  let totalAmount = 0;
  let totalCost = 0;
  const unitTotals = {};
  let summaryRowsHtml = '';

  state.cart.forEach((item) => {
    const prod = state.products.find((p) => p.id === item.productId);
    if (!prod) return;
    const qty = Math.max(0, item.quantity || 0);
    const rate = item.customRate !== null && item.customRate !== undefined ? item.customRate : prod.sell_price;
    const lineTotal = qty * rate;
    const lineCost = qty * prod.buy_price;
    totalAmount += lineTotal;
    totalCost += lineCost;
    unitTotals[prod.unit] = (unitTotals[prod.unit] || 0) + qty;

    const lineTotalEl = document.getElementById(`cart-line-total-${prod.id}`);
    const lineProfitEl = document.getElementById(`cart-line-profit-${prod.id}`);
    if (lineTotalEl) lineTotalEl.textContent = formatTaka(lineTotal);
    if (lineProfitEl) lineProfitEl.textContent = `${isBn ? 'লাভ: ' : 'Profit: '}${formatTaka(lineTotal - lineCost)}`;

    summaryRowsHtml += `<div class="summary-cart-row"><div style="min-width:0"><div style="font-weight:700">${esc(cleanProductTitle(prod.name))}</div><div class="font-mono" style="font-size:0.82rem; color:var(--color-text-subtle)">${qty} ${esc(prod.unit)} × ৳${rate}</div></div><div class="font-mono" style="font-weight:800">${formatTaka(lineTotal)}</div></div>`;
  });

  const unitBreakdown = Object.keys(unitTotals).map((u) => `${Math.round(unitTotals[u] * 100) / 100} ${u}`).join(' + ');
  const discount = Number(state.posDiscount) || 0;
  const netPayable = Math.max(0, totalAmount - discount);
  const paid = state.posPaidAmount !== '' && !isNaN(Number(state.posPaidAmount))
    ? Number(state.posPaidAmount)
    : (state.posPaymentMethod === 'বাকি (Due)' ? 0 : netPayable);
  const due = Math.max(0, netPayable - paid);
  const profit = netPayable - totalCost;
  const marginPct = netPayable > 0 ? ((profit / netPayable) * 100).toFixed(1) : '0';

  calcBox.innerHTML = `
    ${state.cart.length === 0
      ? `<div style="padding:14px; text-align:center; border:1px dashed var(--color-border); border-radius:10px; color:var(--color-text-subtle); margin-bottom:14px;">${isBn ? 'কার্টে পণ্য যোগ করলে এখানে রিয়েল-টাইম হিসাব দেখাবে' : 'Add products for real-time summary'}</div>`
      : `<div class="summary-cart-items">${summaryRowsHtml}</div>`}
    <div class="calc-row"><span>${isBn ? 'মোট পরিমাণ:' : 'Total Qty:'}</span><span class="font-mono" style="font-weight:800; color:var(--color-text-main)">${esc(unitBreakdown) || '0'}</span></div>
    <div class="calc-row"><span>${isBn ? 'মোট বিক্রয়মূল্য:' : 'Subtotal:'}</span><span class="font-mono" style="font-weight:800; color:var(--color-text-main)">${formatTaka(totalAmount)}</span></div>
    ${discount > 0 ? `<div class="calc-row" style="color:var(--color-danger)"><span>${isBn ? 'ছাড়:' : 'Discount:'}</span><span class="font-mono">- ${formatTaka(discount)}</span></div>` : ''}
    <div class="calc-row total"><span>${isBn ? 'সর্বমোট প্রদেয় টাকা:' : 'Net Payable:'}</span><span class="font-mono" style="color:var(--color-primary)">${formatTaka(netPayable)}</span></div>
    <div class="calc-row"><span>${isBn ? 'আসল ক্রয় খরচ:' : 'Total Cost:'}</span><span class="font-mono">${formatTaka(totalCost)}</span></div>
    <div class="profit-badge-box">
      <div><div style="font-weight:800;">${isBn ? 'সম্ভাব্য নীট লাভ:' : 'Net Profit:'}</div><div style="font-size:0.85rem; font-weight:700; color:var(--color-primary)">${marginPct}% ${isBn ? 'মার্জিন' : 'margin'}</div></div>
      <div class="font-mono" style="font-size:1.35rem; font-weight:800; color:var(--color-primary)">${formatTaka(profit)}</div>
    </div>
    ${due > 0 ? `<div class="due-warning-box"><span style="font-weight:800;">${isBn ? 'বাকি থাকবে (Due):' : 'Due:'}</span><span class="font-mono" style="font-weight:800; color:var(--color-warning)">${formatTaka(due)}</span></div>` : ''}
    <button type="button" class="btn btn-primary" style="width:100%; margin-top:14px; padding:12px; font-weight:800;" ${state.cart.length === 0 || state.isSubmitting ? 'disabled' : ''} onclick="handlePosSubmit()">
      ✓ ${isBn ? 'বিক্রি নিশ্চিত করুন ও মেমো' : 'Confirm Sale & Memo'}
    </button>
  `;
};

window.handlePosSubmit = async function(e) {
  if (e && e.preventDefault) e.preventDefault();
  if (state.isSubmitting) return;
  const isBn = state.lang === 'bn';
  const customerName = (document.getElementById('pos-customer-name')?.value || state.posCustomerName || '').trim();
  const customerPhone = (document.getElementById('pos-customer-phone')?.value || state.posCustomerPhone || '').trim();

  if (!customerName) { showToast(isBn ? 'দয়া করে কাস্টমারের নাম লিখুন!' : 'Enter customer name!', 'error'); return; }
  if (state.cart.length === 0) { showToast(isBn ? 'কার্টে কোনো পণ্য নেই!' : 'Cart is empty!', 'error'); return; }

  const saleItems = [];
  let totalAmount = 0;
  let totalCost = 0;

  for (const cartItem of state.cart) {
    const prod = state.products.find((p) => p.id === cartItem.productId);
    if (!prod) continue;
    const qty = Number(cartItem.quantity) || 0;
    if (qty <= 0) { showToast(`${cleanProductTitle(prod.name)} — ${isBn ? 'পরিমাণ ০ এর বেশি হতে হবে!' : 'Qty must be > 0!'}`, 'error'); return; }
    if (qty > prod.stock) { showToast(`${cleanProductTitle(prod.name)} — ${isBn ? 'অপর্যাপ্ত স্টক!' : 'Insufficient stock!'}`, 'error'); return; }
    const rate = cartItem.customRate !== null && cartItem.customRate !== undefined ? cartItem.customRate : prod.sell_price;
    const itemTotal = qty * rate;
    const itemCost = qty * prod.buy_price;
    totalAmount += itemTotal;
    totalCost += itemCost;
    saleItems.push({
      productId: prod.id,
      productName: prod.name,
      category: prod.category,
      quantity: qty,
      unit: prod.unit,
      buyPrice: prod.buy_price,
      sellPrice: rate,
      totalCost: itemCost,
      totalAmount: itemTotal,
      profit: itemTotal - itemCost,
    });
  }

  const discount = Number(state.posDiscount) || 0;
  const netPayable = Math.max(0, totalAmount - discount);
  const paid = state.posPaidAmount !== '' && !isNaN(Number(state.posPaidAmount))
    ? Number(state.posPaidAmount)
    : (state.posPaymentMethod === 'বাকি (Due)' ? 0 : netPayable);
  const due = Math.max(0, netPayable - paid);
  const profit = netPayable - totalCost;

  const saleRecord = {
    id: `sale_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    memoNo: generateMemoNo(),
    customerName,
    customerPhone,
    items: saleItems,
    totalAmount,
    totalCost,
    profit,
    discount,
    netPayable,
    paidAmount: paid,
    dueAmount: due,
    paymentMethod: state.posPaymentMethod,
    date: getLocalDateTimeForDate(state.sessionDate),
    note: (state.posNote || '').trim(),
  };

  state.isSubmitting = true;
  updatePosCalculations();

  const insertRes = await insertSaleToDb(saleRecord);
  state.isSubmitting = false;

  if (!insertRes.ok) {
    state.syncMessage = insertRes.error || 'Supabase insert error';
    showToast(`${isBn ? 'বিক্রি সংরক্ষণ ব্যর্থ:' : 'Save failed:'} ${state.syncMessage}`, 'error');
    render();
    return;
  }

  for (const sold of saleItems) {
    const pObj = state.products.find((p) => p.id === sold.productId);
    if (pObj) {
      pObj.stock = Math.max(0, Number((pObj.stock - sold.quantity).toFixed(2)));
      await updateProductStockInDb(pObj.id, pObj.stock);
    }
  }

  state.sales.unshift(saleRecord);
  saveJsonStorage(STORAGE_KEYS.SALES, state.sales);
  state.cart = [];
  state.posDiscount = 0;
  state.posPaidAmount = '';
  state.posNote = '';

  showToast(`${isBn ? 'বিক্রি সফল হয়েছে!' : 'Sale confirmed!'} (${saleRecord.memoNo})`, 'success');
  render();
  showInvoiceModal(saleRecord.id);
};

// ----------------- 2. PRODUCTS MANAGEMENT VIEW -----------------
function renderProducts(container) {
  const isBn = state.lang === 'bn';
  const totalCostVal = state.products.reduce((acc, p) => acc + p.stock * p.buy_price, 0);
  const totalRetailVal = state.products.reduce((acc, p) => acc + p.stock * p.sell_price, 0);
  const inStockCount = state.products.filter((p) => p.stock > 0).length;
  const outOfStockCount = state.products.filter((p) => p.stock === 0).length;

  const filtered = state.products.filter((p) => {
    const q = state.productSearchTerm.toLowerCase();
    const mSearch = !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    const mCat = state.productCategoryFilter === 'সব' || p.category === state.productCategoryFilter;
    const mStock = state.productStockFilter === 'all' ? true : state.productStockFilter === 'in_stock' ? p.stock > 0 : p.stock === 0;
    return mSearch && mCat && mStock;
  });

  container.innerHTML = `
    ${renderSyncNoticeBanner()}
    <div class="kpi-grid">
      <div class="kpi-card kpi-sky"><div class="kpi-header"><span>${isBn ? 'মোট ক্রয়মূল্য' : 'Stock Cost'}</span></div><div class="kpi-value tabular-nums">${formatTaka(totalCostVal)}</div></div>
      <div class="kpi-card kpi-emerald"><div class="kpi-header"><span>${isBn ? 'মোট বিক্রয়মূল্য' : 'Retail Value'}</span></div><div class="kpi-value tabular-nums" style="color:var(--color-primary)">${formatTaka(totalRetailVal)}</div></div>
      <div class="kpi-card kpi-indigo"><div class="kpi-header"><span>${isBn ? 'সম্ভাব্য লাভ' : 'Potential Profit'}</span></div><div class="kpi-value tabular-nums" style="color:#6366f1">${formatTaka(totalRetailVal - totalCostVal)}</div></div>
      <div class="kpi-card kpi-amber"><div class="kpi-header"><span>${isBn ? 'মজুদ অবস্থা' : 'Stock Health'}</span></div><div class="kpi-value tabular-nums">${inStockCount} / <span style="color:var(--color-danger)">${outOfStockCount}</span></div></div>
    </div>
    <div class="panel">
      <div class="panel-header" style="flex-wrap:wrap; gap:10px;">
        <input type="text" class="form-control" style="max-width:320px;" placeholder="${isBn ? 'পণ্যের নাম বা সাইজ খুঁজুন...' : 'Search product...'}" value="${esc(state.productSearchTerm)}" oninput="state.productSearchTerm=this.value; renderProductsTableOnly()" />
        <div style="display:flex; gap:8px;">
          <button type="button" class="btn btn-outline" onclick="exportProductsCSV()">📥 ${isBn ? 'CSV ডাউনলোড' : 'Export CSV'}</button>
          <button type="button" class="btn btn-primary" onclick="showProductModal(null)">+ ${isBn ? 'নতুন পণ্য' : 'Add Product'}</button>
        </div>
      </div>
      <div style="padding:12px 20px; border-bottom:1px solid var(--color-border); display:flex; flex-wrap:wrap; justify-content:space-between; gap:10px;">
        <div class="chip-group" style="margin:0">${CATEGORIES.map((c) => `<button type="button" class="chip ${state.productCategoryFilter === c ? 'active' : ''}" onclick="state.productCategoryFilter='${esc(c)}'; render()">${esc(c)}</button>`).join('')}</div>
        <div style="display:flex; gap:6px;">
          <button type="button" class="chip ${state.productStockFilter === 'all' ? 'active' : ''}" onclick="state.productStockFilter='all'; render()">${isBn ? 'সব' : 'All'}</button>
          <button type="button" class="chip ${state.productStockFilter === 'in_stock' ? 'active' : ''}" onclick="state.productStockFilter='in_stock'; render()">${isBn ? 'উপলব্ধ' : 'In Stock'}</button>
          <button type="button" class="chip ${state.productStockFilter === 'out_of_stock' ? 'active' : ''}" onclick="state.productStockFilter='out_of_stock'; render()">${isBn ? 'স্টক শেষ' : 'Empty'}</button>
        </div>
      </div>
      <div class="table-responsive" id="products-table-wrap">${buildProductsTableHtml(filtered)}</div>
    </div>
  `;
}

function buildProductsTableHtml(filtered) {
  const isBn = state.lang === 'bn';
  return `<table class="data-table"><thead><tr><th class="text-center">ID</th><th>${isBn ? 'পণ্যের নাম' : 'Name'}</th><th>${isBn ? 'ক্যাটাগরি' : 'Category'}</th><th class="text-right">${isBn ? 'ক্রয়' : 'Buy'}</th><th class="text-right">${isBn ? 'বিক্রয়' : 'Sell'}</th><th class="text-center">${isBn ? 'স্টক' : 'Stock'}</th><th class="text-center">${isBn ? 'স্ট্যাটাস' : 'Status'}</th><th class="text-right">${isBn ? 'অ্যাকশন' : 'Actions'}</th></tr></thead><tbody>
    ${filtered.length === 0 ? `<tr><td colspan="8" style="text-align:center; padding:28px; color:var(--color-text-muted);">${isBn ? 'কোনো পণ্য পাওয়া যায়নি' : 'No products found'}</td></tr>` : filtered.map((p) => {
      const isZero = p.stock === 0;
      const isLow = p.stock > 0 && p.stock <= (p.minStockAlert || 15);
      return `<tr>
        <td class="text-center font-mono">${p.id}</td>
        <td style="font-weight:700">${esc(cleanProductTitle(p.name))}</td>
        <td>${esc(p.category)}</td>
        <td class="text-right font-mono">৳${p.buy_price}</td>
        <td class="text-right font-mono" style="font-weight:700">৳${p.sell_price}</td>
        <td class="text-center font-mono" style="font-weight:800">${p.stock} ${esc(p.unit)}</td>
        <td class="text-center">${isZero ? `<span class="status-pill status-out-stock">${isBn ? 'স্টক শেষ' : 'Out'}</span>` : isLow ? `<span class="status-pill status-low-stock">${isBn ? 'কম স্টক' : 'Low'}</span>` : `<span class="status-pill status-in-stock">${isBn ? 'উপলব্ধ' : 'In Stock'}</span>`}</td>
        <td class="text-right"><div style="display:inline-flex; gap:6px;">
          <button type="button" class="btn btn-outline btn-sm" onclick="quickRestockItem(${p.id}, 20)">+20</button>
          <button type="button" class="btn btn-outline btn-sm" onclick="quickRestockItem(${p.id}, 50)">+50</button>
          <button type="button" class="btn btn-outline btn-sm" onclick="showProductModal(${p.id})">✏️</button>
          <button type="button" class="btn btn-outline btn-sm" style="color:var(--color-danger)" onclick="deleteProductItem(${p.id})">🗑️</button>
        </div></td>
      </tr>`;
    }).join('')}
  </tbody></table>`;
}

window.renderProductsTableOnly = function() {
  const wrap = document.getElementById('products-table-wrap');
  if (!wrap) return;
  const q = state.productSearchTerm.toLowerCase();
  const filtered = state.products.filter((p) => (!q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)) && (state.productCategoryFilter === 'সব' || p.category === state.productCategoryFilter) && (state.productStockFilter === 'all' ? true : state.productStockFilter === 'in_stock' ? p.stock > 0 : p.stock === 0));
  wrap.innerHTML = buildProductsTableHtml(filtered);
};

window.quickRestockItem = async function(prodId, qty) {
  const prod = state.products.find((p) => p.id === prodId);
  if (!prod) return;
  prod.stock += qty;
  await saveProductToDb(prod);
  showToast(`${cleanProductTitle(prod.name)} +${qty} ${prod.unit}`, 'success');
  render();
};

window.deleteProductItem = async function(prodId) {
  const prod = state.products.find((p) => p.id === prodId);
  if (!prod) return;
  state.products = state.products.filter((p) => p.id !== prodId);
  await deleteProductFromDb(prodId);
  showToast(`${cleanProductTitle(prod.name)} ${state.lang === 'bn' ? 'মুছে ফেলা হয়েছে' : 'deleted'}`, 'info');
  render();
};

window.exportProductsCSV = function() {
  const headers = ['ID', 'Name', 'Category', 'Buy Price', 'Sell Price', 'Unit', 'Stock'];
  const rows = state.products.map((p) => [p.id, `"${p.name}"`, `"${p.category}"`, p.buy_price, p.sell_price, p.unit, p.stock]);
  const csv = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const a = document.createElement('a');
  a.href = encodeURI(csv);
  a.download = 'agri_products.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
};

// ----------------- 3. SALES HISTORY VIEW -----------------
function renderHistory(container) {
  const isBn = state.lang === 'bn';
  const todayKey = getLocalDateKey();
  const getFilteredSales = () => state.sales.filter((s) => {
    const q = state.salesSearchTerm.toLowerCase();
    const mSearch = !q || s.customerName.toLowerCase().includes(q) || s.memoNo.toLowerCase().includes(q);
    const mDue = state.salesDueFilter === 'all' ? true : state.salesDueFilter === 'due_only' ? s.dueAmount > 0 : s.dueAmount === 0;
    const sDate = extractSaleDateKey(s.date);
    const mDate = state.salesDateMode === 'all' ? true : state.salesDateMode === 'today' ? sDate === todayKey : sDate === state.salesFilterDate;
    return mSearch && mDue && mDate;
  });

  const filtered = getFilteredSales();
  const totalRev = filtered.reduce((acc, s) => acc + s.netPayable, 0);
  const totalProf = filtered.reduce((acc, s) => acc + s.profit, 0);
  const totalDue = filtered.reduce((acc, s) => acc + s.dueAmount, 0);

  container.innerHTML = `
    ${renderSyncNoticeBanner()}
    <div class="kpi-grid">
      <div class="kpi-card kpi-sky"><div class="kpi-header"><span>${isBn ? 'মোট বিক্রি' : 'Revenue'}</span></div><div class="kpi-value tabular-nums">${formatTaka(totalRev)}</div></div>
      <div class="kpi-card kpi-emerald"><div class="kpi-header"><span>${isBn ? 'নীট লাভ' : 'Profit'}</span></div><div class="kpi-value tabular-nums" style="color:var(--color-primary)">${formatTaka(totalProf)}</div></div>
      <div class="kpi-card kpi-amber"><div class="kpi-header"><span>${isBn ? 'বাকি পাওনা' : 'Due'}</span></div><div class="kpi-value tabular-nums">${formatTaka(totalDue)}</div></div>
    </div>
    <div class="panel">
      <div class="panel-header" style="flex-wrap:wrap; gap:10px;">
        <input type="text" class="form-control" style="max-width:260px;" placeholder="${isBn ? 'কাস্টমার বা মেমো দিয়ে খুঁজুন...' : 'Search...'}" value="${esc(state.salesSearchTerm)}" oninput="state.salesSearchTerm=this.value; renderHistoryTableOnly()" />
        <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
          <button type="button" class="chip ${state.salesDateMode === 'today' ? 'active' : ''}" onclick="state.salesDateMode='today'; render()">${isBn ? 'আজকের সেশন' : 'Today'}</button>
          <button type="button" class="chip ${state.salesDateMode === 'date' ? 'active' : ''}" onclick="state.salesDateMode='date'; render()">${isBn ? 'তারিখ অনুযায়ী' : 'By Date'}</button>
          ${state.salesDateMode === 'date' ? `<input type="date" class="form-control font-mono" style="width:auto; padding:6px 10px;" value="${state.salesFilterDate}" onchange="state.salesFilterDate=this.value; render()" />` : ''}
          <button type="button" class="chip ${state.salesDateMode === 'all' ? 'active' : ''}" onclick="state.salesDateMode='all'; render()">${isBn ? 'সব তারিখ' : 'All Dates'}</button>
          <button type="button" class="chip ${state.salesDueFilter === 'all' ? 'active' : ''}" onclick="state.salesDueFilter='all'; render()">${isBn ? 'সব' : 'All'}</button>
          <button type="button" class="chip ${state.salesDueFilter === 'due_only' ? 'active' : ''}" onclick="state.salesDueFilter='due_only'; render()">${isBn ? 'বাকি' : 'Due'}</button>
          <button type="button" class="chip ${state.salesDueFilter === 'paid_only' ? 'active' : ''}" onclick="state.salesDueFilter='paid_only'; render()">${isBn ? 'পরিশোধিত' : 'Paid'}</button>
          <button type="button" class="btn btn-outline" onclick="exportSalesCSV()">📥 CSV</button>
        </div>
      </div>
      <div class="table-responsive" id="history-table-wrap">${buildHistoryTableHtml(filtered)}</div>
    </div>
  `;
}

function buildHistoryTableHtml(filtered) {
  const isBn = state.lang === 'bn';
  return `<table class="data-table"><thead><tr><th>${isBn ? 'মেমো' : 'Memo'}</th><th>${isBn ? 'তারিখ' : 'Date'}</th><th>${isBn ? 'কাস্টমার' : 'Customer'}</th><th>${isBn ? 'পণ্য' : 'Items'}</th><th class="text-right">${isBn ? 'টাকা' : 'Amount'}</th><th class="text-right">${isBn ? 'লাভ' : 'Profit'}</th><th class="text-right">${isBn ? 'অ্যাকশন' : 'Actions'}</th></tr></thead><tbody>
    ${filtered.length === 0 ? `<tr><td colspan="7" style="text-align:center; padding:32px; color:var(--color-text-muted)">${isBn ? 'নির্বাচিত ফিল্টারে কোনো বিক্রি পাওয়া যায়নি' : 'No matching sales'}</td></tr>` : filtered.map((sale) => `<tr>
      <td class="font-mono" style="font-weight:700">${esc(sale.memoNo)}</td>
      <td>${esc(sale.date)}</td>
      <td style="font-weight:700">${esc(sale.customerName)}</td>
      <td>${esc((sale.items || []).map((it) => `${cleanProductTitle(it.productName)} × ${it.quantity} ${it.unit}`).join(', '))}</td>
      <td class="text-right font-mono" style="font-weight:700">${formatTaka(sale.netPayable)}</td>
      <td class="text-right font-mono" style="font-weight:700; color:var(--color-primary)">${formatTaka(sale.profit)}</td>
      <td class="text-right">
        <button type="button" class="btn btn-outline btn-sm" onclick="showInvoiceModal('${esc(sale.id)}')">👁️ ${isBn ? 'মেমো' : 'Memo'}</button>
        <button type="button" class="btn btn-outline btn-sm" style="color:var(--color-danger)" onclick="revertSaleRecord('${esc(sale.id)}')">🗑️</button>
      </td>
    </tr>`).join('')}
  </tbody></table>`;
}

window.renderHistoryTableOnly = function() {
  const wrap = document.getElementById('history-table-wrap');
  if (!wrap) return;
  const todayKey = getLocalDateKey();
  const q = state.salesSearchTerm.toLowerCase();
  const filtered = state.sales.filter((s) => (!q || s.customerName.toLowerCase().includes(q) || s.memoNo.toLowerCase().includes(q)) && (state.salesDueFilter === 'all' ? true : state.salesDueFilter === 'due_only' ? s.dueAmount > 0 : s.dueAmount === 0) && (state.salesDateMode === 'all' ? true : state.salesDateMode === 'today' ? extractSaleDateKey(s.date) === todayKey : extractSaleDateKey(s.date) === state.salesFilterDate));
  wrap.innerHTML = buildHistoryTableHtml(filtered);
};

window.revertSaleRecord = async function(saleId) {
  const sale = state.sales.find((s) => s.id === String(saleId));
  if (!sale) return;
  for (const it of sale.items || []) {
    const prod = state.products.find((p) => p.id === it.productId);
    if (prod) { prod.stock += Number(it.quantity || 0); await saveProductToDb(prod); }
  }
  state.sales = state.sales.filter((s) => s.id !== String(saleId));
  await deleteSaleFromDb(saleId);
  showToast(`${sale.memoNo} ${state.lang === 'bn' ? 'বাতিল ও স্টক ফেরত সম্পন্ন' : 'reverted & restocked'}`, 'info');
  render();
};

window.exportSalesCSV = function() {
  const headers = ['Memo No', 'Date', 'Customer', 'Amount', 'Profit', 'Paid', 'Due'];
  const rows = state.sales.map((s) => [s.memoNo, s.date, `"${s.customerName}"`, s.netPayable, s.profit, s.paidAmount, s.dueAmount]);
  const csv = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const a = document.createElement('a');
  a.href = encodeURI(csv);
  a.download = 'sales_ledger.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
};

// ----------------- 4. RESTOCK & AUDIT VIEW -----------------
function renderRestock(container) {
  const isBn = state.lang === 'bn';
  const outOfStock = state.products.filter((p) => p.stock === 0);
  const lowStock = state.products.filter((p) => p.stock > 0 && p.stock <= (p.minStockAlert || 15));
  const optimal = state.products.filter((p) => p.stock > (p.minStockAlert || 15));

  container.innerHTML = `
    ${renderSyncNoticeBanner()}
    <div class="kpi-grid">
      <div class="kpi-card" style="background:var(--color-danger-bg)"><div class="kpi-header" style="color:var(--color-danger)"><span>${isBn ? 'স্টক শেষ' : 'Out of Stock'}</span></div><div class="kpi-value tabular-nums">${outOfStock.length}</div></div>
      <div class="kpi-card" style="background:var(--color-warning-bg)"><div class="kpi-header" style="color:var(--color-warning)"><span>${isBn ? 'কম স্টক' : 'Low Stock'}</span></div><div class="kpi-value tabular-nums">${lowStock.length}</div></div>
      <div class="kpi-card" style="background:var(--color-primary-light)"><div class="kpi-header" style="color:var(--color-primary)"><span>${isBn ? 'পর্যাপ্ত মজুদ' : 'Optimal'}</span></div><div class="kpi-value tabular-nums">${optimal.length}</div></div>
    </div>
    <div class="panel">
      <div class="panel-header"><span class="panel-title">${isBn ? 'দ্রুত স্টক রিস্টক প্যানেল' : 'Restock Panel'}</span></div>
      <div class="table-responsive"><table class="data-table"><thead><tr><th>${isBn ? 'পণ্য' : 'Product'}</th><th class="text-center">${isBn ? 'বর্তমান স্টক' : 'Stock'}</th><th class="text-center">${isBn ? 'নতুন ক্রয়দর' : 'Buy Rate'}</th><th class="text-center">${isBn ? 'যোগ পরিমাণ' : 'Add Qty'}</th><th class="text-right">${isBn ? 'অ্যাকশন' : 'Action'}</th></tr></thead><tbody>
        ${[...outOfStock, ...lowStock, ...optimal].map((p) => `<tr>
          <td><strong>${esc(cleanProductTitle(p.name))}</strong><div style="font-size:0.8rem; color:var(--color-text-subtle)">${esc(p.category)}</div></td>
          <td class="text-center font-mono" style="font-weight:800">${p.stock} ${esc(p.unit)}</td>
          <td class="text-center"><input type="number" id="restock-price-${p.id}" class="form-control font-mono" style="width:95px; text-align:center; display:inline-block" value="${p.buy_price}" /></td>
          <td class="text-center"><input type="number" id="restock-qty-${p.id}" class="form-control font-mono" style="width:90px; text-align:center; display:inline-block" value="${p.stock === 0 ? 100 : 50}" min="1" /></td>
          <td class="text-right"><button type="button" class="btn btn-primary btn-sm" onclick="submitRestock(${p.id})">+ ${isBn ? 'রিস্টক' : 'Restock'}</button></td>
        </tr>`).join('')}
      </tbody></table></div>
    </div>
  `;
}

window.submitRestock = async function(prodId) {
  const prod = state.products.find((p) => p.id === prodId);
  if (!prod) return;
  const qty = parseFloat(document.getElementById(`restock-qty-${prodId}`)?.value) || 0;
  const price = parseFloat(document.getElementById(`restock-price-${prodId}`)?.value) || prod.buy_price;
  if (qty <= 0) return;
  prod.stock += qty;
  if (price > 0) prod.buy_price = price;
  await saveProductToDb(prod);
  showToast(`${cleanProductTitle(prod.name)} +${qty} ${prod.unit} রিস্টক সম্পন্ন`, 'success');
  render();
};

// ----------------- 5. ANALYTICS VIEW -----------------
function summarizeSales(salesList) {
  let totalRevenue = 0, totalCost = 0, totalProfit = 0, totalPaid = 0, totalDue = 0;
  const itemMap = {};
  salesList.forEach((s) => {
    totalRevenue += Number(s.netPayable || 0);
    totalCost += Number(s.totalCost || 0);
    totalProfit += Number(s.profit || 0);
    totalPaid += Number(s.paidAmount || 0);
    totalDue += Number(s.dueAmount || 0);
    (s.items || []).forEach((it) => {
      const title = cleanProductTitle(it.productName);
      const key = `${title}__${it.unit}`;
      if (!itemMap[key]) itemMap[key] = { name: title, unit: it.unit, qty: 0, amount: 0 };
      itemMap[key].qty += Number(it.quantity || 0);
      itemMap[key].amount += Number(it.totalAmount || 0);
    });
  });
  return {
    count: salesList.length,
    totalRevenue,
    totalCost,
    totalProfit,
    totalPaid,
    totalDue,
    profitMargin: totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0',
    itemBreakdown: Object.values(itemMap).sort((a, b) => b.amount - a.amount),
  };
}

function renderAnalytics(container) {
  const isBn = state.lang === 'bn';
  const mode = state.analyticsMode || 'daily';
  let bodyHtml = '';

  if (mode === 'daily') {
    const dailySales = state.sales.filter((s) => extractSaleDateKey(s.date) === state.analyticsDailyDate);
    const ds = summarizeSales(dailySales);
    bodyHtml = `
      <div class="panel">
        <div class="panel-header" style="flex-wrap:wrap; gap:10px;">
          <span class="panel-title">📅 ${isBn ? 'দৈনিক বিক্রয় ও লাভের হিসাব' : 'Daily Breakdown'}</span>
          <div style="display:flex; gap:8px; align-items:center;">
            <input type="date" class="form-control font-mono" style="width:auto;" value="${state.analyticsDailyDate}" onchange="state.analyticsDailyDate=this.value; render()" />
            <button type="button" class="btn btn-outline btn-sm" onclick="state.analyticsDailyDate='${getLocalDateKey()}'; render()">${isBn ? 'আজকে' : 'Today'}</button>
          </div>
        </div>
        <div class="panel-body">
          <div class="kpi-grid" style="margin-bottom:18px;">
            <div class="kpi-card kpi-violet"><div class="kpi-header"><span>${isBn ? 'মোট লেনদেন' : 'Transactions'}</span></div><div class="kpi-value tabular-nums">${ds.count}</div></div>
            <div class="kpi-card kpi-emerald"><div class="kpi-header"><span>${isBn ? 'মোট বিক্রি' : 'Revenue'}</span></div><div class="kpi-value tabular-nums" style="color:var(--color-primary)">${formatTaka(ds.totalRevenue)}</div></div>
            <div class="kpi-card kpi-indigo"><div class="kpi-header"><span>${isBn ? 'নীট লাভ' : 'Profit'}</span></div><div class="kpi-value tabular-nums" style="color:#6366f1">${formatTaka(ds.totalProfit)}</div><div class="kpi-subtext">${ds.profitMargin}% ${isBn ? 'মার্জিন' : 'margin'}</div></div>
            <div class="kpi-card kpi-amber"><div class="kpi-header"><span>${isBn ? 'বাকি পাওনা' : 'Due'}</span></div><div class="kpi-value tabular-nums">${formatTaka(ds.totalDue)}</div></div>
          </div>
          <div class="grid-2">
            <div>
              <h4 style="margin-bottom:10px; font-weight:800;">${isBn ? 'পণ্য অনুযায়ী বিক্রয়' : 'Items Sold'}</h4>
              ${ds.itemBreakdown.length === 0 ? `<p style="color:var(--color-text-muted)">${isBn ? 'এই দিনে কোনো পণ্য বিক্রি হয়নি' : 'No items sold'}</p>` : `<table class="data-table"><thead><tr><th>${isBn ? 'পণ্য' : 'Product'}</th><th class="text-right">${isBn ? 'পরিমাণ' : 'Qty'}</th><th class="text-right">${isBn ? 'টাকা' : 'Total'}</th></tr></thead><tbody>${ds.itemBreakdown.map((it) => `<tr><td><strong>${esc(it.name)}</strong></td><td class="text-right font-mono">${Number(it.qty.toFixed(2))} ${esc(it.unit)}</td><td class="text-right font-mono" style="font-weight:800">${formatTaka(it.amount)}</td></tr>`).join('')}</tbody></table>`}
            </div>
            <div>
              <h4 style="margin-bottom:10px; font-weight:800;">${isBn ? 'গ্রাহক ও মেমো তালিকা' : 'Memos'}</h4>
              ${dailySales.length === 0 ? `<p style="color:var(--color-text-muted)">${isBn ? 'কোনো মেমো নেই' : 'No memos'}</p>` : dailySales.map((s) => `<div style="padding:10px 12px; margin-bottom:8px; border:1px solid var(--color-border); border-radius:10px; display:flex; justify-content:space-between; align-items:center; gap:8px;"><div><strong>${esc(s.customerName)}</strong> <span class="font-mono" style="font-size:0.85rem; color:var(--color-text-subtle)">(${esc(s.memoNo)})</span><div style="font-size:0.85rem; color:var(--color-text-muted)">${esc((s.items || []).map((it) => `${cleanProductTitle(it.productName)} ${it.quantity} ${it.unit}`).join(', '))}</div></div><div class="text-right"><div class="font-mono" style="font-weight:800">${formatTaka(s.netPayable)}</div><button type="button" class="btn btn-outline btn-sm" onclick="showInvoiceModal('${esc(s.id)}')">👁️ ${isBn ? 'মেমো' : 'Memo'}</button></div></div>`).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  } else if (mode === 'period') {
    const ws = summarizeSales(state.sales.filter((s) => isDateWithinLastDays(extractSaleDateKey(s.date), 7)));
    const monthlySales = state.sales.filter((s) => extractSaleDateKey(s.date).slice(0, 7) === state.analyticsMonth);
    const ms = summarizeSales(monthlySales);
    const dayMap = {};
    monthlySales.forEach((s) => { const dk = extractSaleDateKey(s.date); if (!dayMap[dk]) dayMap[dk] = []; dayMap[dk].push(s); });
    const monthDays = Object.keys(dayMap).sort().reverse().map((dk) => ({ dateKey: dk, summary: summarizeSales(dayMap[dk]) }));

    bodyHtml = `
      <div class="panel" style="margin-bottom:20px;">
        <div class="panel-header panel-header-indigo" style="color:#fff;"><span class="panel-title">📈 ${isBn ? 'গত ৭ দিনের সারসংক্ষেপ' : 'Weekly (7 Days)'}</span><span style="font-weight:800;">${ws.count} ${isBn ? 'টি মেমো' : 'memos'}</span></div>
        <div class="panel-body"><div class="kpi-grid" style="margin-bottom:0;">
          <div class="kpi-card kpi-emerald"><div class="kpi-header"><span>${isBn ? '৭ দিনের বিক্রি' : '7-Day Sales'}</span></div><div class="kpi-value tabular-nums" style="color:var(--color-primary)">${formatTaka(ws.totalRevenue)}</div></div>
          <div class="kpi-card kpi-sky"><div class="kpi-header"><span>${isBn ? 'ক্রয় খরচ' : 'Cost'}</span></div><div class="kpi-value tabular-nums">${formatTaka(ws.totalCost)}</div></div>
          <div class="kpi-card kpi-indigo"><div class="kpi-header"><span>${isBn ? 'সাপ্তাহিক লাভ' : 'Weekly Profit'}</span></div><div class="kpi-value tabular-nums" style="color:#6366f1">${formatTaka(ws.totalProfit)}</div></div>
          <div class="kpi-card kpi-amber"><div class="kpi-header"><span>${isBn ? '৭ দিনের বাকি' : 'Due'}</span></div><div class="kpi-value tabular-nums">${formatTaka(ws.totalDue)}</div></div>
        </div></div>
      </div>
      <div class="panel">
        <div class="panel-header" style="flex-wrap:wrap; gap:10px;"><span class="panel-title">🗓️ ${isBn ? 'মাসিক হিসাব' : 'Monthly Summary'}</span><input type="month" class="form-control font-mono" style="width:auto;" value="${state.analyticsMonth}" onchange="state.analyticsMonth=this.value; render()" /></div>
        <div class="panel-body">
          <div class="kpi-grid">
            <div class="kpi-card kpi-emerald"><div class="kpi-header"><span>${isBn ? 'মাসিক বিক্রি' : 'Monthly Revenue'}</span></div><div class="kpi-value tabular-nums" style="color:var(--color-primary)">${formatTaka(ms.totalRevenue)}</div></div>
            <div class="kpi-card kpi-indigo"><div class="kpi-header"><span>${isBn ? 'মাসিক লাভ' : 'Monthly Profit'}</span></div><div class="kpi-value tabular-nums" style="color:#6366f1">${formatTaka(ms.totalProfit)}</div></div>
            <div class="kpi-card kpi-amber"><div class="kpi-header"><span>${isBn ? 'মাসিক বাকি' : 'Monthly Due'}</span></div><div class="kpi-value tabular-nums">${formatTaka(ms.totalDue)}</div></div>
          </div>
          ${monthDays.length === 0 ? `<p style="color:var(--color-text-muted)">${isBn ? 'এই মাসে কোনো বিক্রয়ের তথ্য নেই' : 'No sales this month'}</p>` : `<div class="table-responsive"><table class="data-table"><thead><tr><th>${isBn ? 'তারিখ' : 'Date'}</th><th class="text-center">${isBn ? 'মেমো' : 'Memos'}</th><th class="text-right">${isBn ? 'বিক্রি' : 'Revenue'}</th><th class="text-right">${isBn ? 'লাভ' : 'Profit'}</th><th class="text-right">${isBn ? 'বাকি' : 'Due'}</th></tr></thead><tbody>${monthDays.map((r) => `<tr><td class="font-mono" style="font-weight:800">${r.dateKey}</td><td class="text-center font-mono">${r.summary.count}</td><td class="text-right font-mono" style="font-weight:800">${formatTaka(r.summary.totalRevenue)}</td><td class="text-right font-mono" style="font-weight:800; color:var(--color-primary)">${formatTaka(r.summary.totalProfit)}</td><td class="text-right font-mono">${formatTaka(r.summary.totalDue)}</td></tr>`).join('')}</tbody></table></div>`}
        </div>
      </div>
    `;
  } else {
    const namesSet = new Set([...state.customers.map((c) => c.name), ...state.sales.map((s) => s.customerName).filter(Boolean)]);
    const customerNames = Array.from(namesSet);
    if (!state.analyticsCustomerName && customerNames.length > 0) state.analyticsCustomerName = customerNames[0];
    const custSales = state.sales.filter((s) => {
      if (s.customerName !== state.analyticsCustomerName) return false;
      const dk = extractSaleDateKey(s.date);
      if (state.analyticsCustRange === 'specific') return dk === state.analyticsCustDate;
      if (state.analyticsCustRange === '7d') return isDateWithinLastDays(dk, 7);
      if (state.analyticsCustRange === '30d') return isDateWithinLastDays(dk, 30);
      return true;
    });
    const cs = summarizeSales(custSales);

    bodyHtml = `
      <div class="panel">
        <div class="panel-header" style="flex-wrap:wrap; gap:10px;">
          <span class="panel-title">👤 ${isBn ? 'গ্রাহকভিত্তিক খতিয়ান ও রিপোর্ট' : 'Customer Report'}</span>
          <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
            <select class="form-control" style="width:auto; font-weight:800;" onchange="state.analyticsCustomerName=this.value; render()">${customerNames.map((cn) => `<option value="${esc(cn)}" ${cn === state.analyticsCustomerName ? 'selected' : ''}>${esc(cn)}</option>`).join('')}</select>
            <button type="button" class="chip ${state.analyticsCustRange === 'specific' ? 'active' : ''}" onclick="state.analyticsCustRange='specific'; render()">${isBn ? 'নির্দিষ্ট দিন' : 'Day'}</button>
            ${state.analyticsCustRange === 'specific' ? `<input type="date" class="form-control font-mono" style="width:auto;" value="${state.analyticsCustDate}" onchange="state.analyticsCustDate=this.value; render()" />` : ''}
            <button type="button" class="chip ${state.analyticsCustRange === '7d' ? 'active' : ''}" onclick="state.analyticsCustRange='7d'; render()">৭ দিন</button>
            <button type="button" class="chip ${state.analyticsCustRange === '30d' ? 'active' : ''}" onclick="state.analyticsCustRange='30d'; render()">১ মাস</button>
            <button type="button" class="chip ${state.analyticsCustRange === 'all' ? 'active' : ''}" onclick="state.analyticsCustRange='all'; render()">সব সময়</button>
          </div>
        </div>
        <div class="panel-body">
          <div class="kpi-grid">
            <div class="kpi-card kpi-sky"><div class="kpi-header"><span>${isBn ? 'মোট মেমো' : 'Orders'}</span></div><div class="kpi-value tabular-nums">${cs.count}</div></div>
            <div class="kpi-card kpi-emerald"><div class="kpi-header"><span>${isBn ? 'মোট ক্রয়' : 'Spent'}</span></div><div class="kpi-value tabular-nums" style="color:var(--color-primary)">${formatTaka(cs.totalRevenue)}</div></div>
            <div class="kpi-card kpi-teal"><div class="kpi-header"><span>${isBn ? 'পরিশোধিত' : 'Paid'}</span></div><div class="kpi-value tabular-nums">${formatTaka(cs.totalPaid)}</div></div>
            <div class="kpi-card kpi-amber"><div class="kpi-header"><span>${isBn ? 'মোট বাকি' : 'Due'}</span></div><div class="kpi-value tabular-nums" style="color:${cs.totalDue > 0 ? 'var(--color-danger)' : 'inherit'}">${formatTaka(cs.totalDue)}</div></div>
          </div>
          <h4 style="margin-bottom:10px; font-weight:800;">${esc(state.analyticsCustomerName)} — ${isBn ? 'পণ্য অনুযায়ী মোট পরিমাণ' : 'Purchased Items'}</h4>
          ${cs.itemBreakdown.length === 0 ? `<p style="color:var(--color-text-muted); margin-bottom:16px;">${isBn ? 'এই সময়ে কোনো পণ্য কেনেননি' : 'No items'}</p>` : `<div class="table-responsive" style="margin-bottom:20px;"><table class="data-table"><thead><tr><th>${isBn ? 'পণ্য' : 'Product'}</th><th class="text-right">${isBn ? 'মোট পরিমাণ' : 'Qty'}</th><th class="text-right">${isBn ? 'মোট টাকা' : 'Value'}</th></tr></thead><tbody>${cs.itemBreakdown.map((it) => `<tr><td><strong>${esc(it.name)}</strong></td><td class="text-right font-mono" style="font-weight:800; color:var(--color-primary)">${Number(it.qty.toFixed(2))} ${esc(it.unit)}</td><td class="text-right font-mono" style="font-weight:800">${formatTaka(it.amount)}</td></tr>`).join('')}</tbody></table></div>`}
          <h4 style="margin-bottom:10px; font-weight:800;">${isBn ? 'মেমো তালিকা' : 'Memos'}</h4>
          ${custSales.map((s) => `<div style="padding:10px 14px; margin-bottom:8px; border:1px solid var(--color-border); border-radius:10px; display:flex; justify-content:space-between; align-items:center; gap:10px;"><div><strong class="font-mono">${esc(s.memoNo)}</strong> · <span style="font-size:0.875rem; color:var(--color-text-subtle)">${esc(s.date)}</span><div style="font-size:0.9rem;">${esc((s.items || []).map((it) => `${cleanProductTitle(it.productName)} (${it.quantity} ${it.unit})`).join(', '))}</div></div><div class="text-right"><div class="font-mono" style="font-weight:800">${formatTaka(s.netPayable)}</div><button type="button" class="btn btn-outline btn-sm" style="margin-top:4px;" onclick="showInvoiceModal('${esc(s.id)}')">👁️ মেমো</button></div></div>`).join('')}
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    ${renderSyncNoticeBanner()}
    <div class="analytics-mode-tabs">
      <button type="button" class="chip ${mode === 'daily' ? 'active' : ''}" onclick="state.analyticsMode='daily'; render()">📅 ${isBn ? 'দৈনিক (আজকের) হিসাব' : 'Daily'}</button>
      <button type="button" class="chip ${mode === 'period' ? 'active' : ''}" onclick="state.analyticsMode='period'; render()">📈 ${isBn ? 'সাপ্তাহিক ও মাসিক রিপোর্ট' : 'Weekly & Monthly'}</button>
      <button type="button" class="chip ${mode === 'customer' ? 'active' : ''}" onclick="state.analyticsMode='customer'; render()">👤 ${isBn ? 'গ্রাহকভিত্তিক বিস্তারিত' : 'Customer-Specific'}</button>
    </div>
    ${bodyHtml}
  `;
}

// ----------------- MODALS: INVOICE, PRODUCT, CUSTOMER PHOTOS, FONT -----------------
window.showInvoiceModal = function(saleId) {
  const sale = state.sales.find((s) => s.id === String(saleId));
  if (!sale) return;
  const isBn = state.lang === 'bn';
  const overlay = document.getElementById('invoice-modal-overlay');
  const box = document.getElementById('printable-cash-memo');
  if (!overlay || !box) return;

  box.innerHTML = `
    <div style="text-align:center; border-bottom:1px dashed #94a3b8; padding-bottom:14px; margin-bottom:14px;">
      <h2 style="font-size:1.5rem; font-weight:800; color:#0f172a;">${isBn ? 'মেসার্স কৃষি প্যাকেজিং ও আড়ত' : 'M/S AGRI PACKAGING'}</h2>
      <p style="font-size:0.875rem; color:#475569">${isBn ? 'মোবাইল: ০১৭১২-৩৪৫৬৭৮, ০১৮১২-৩৪৫৬৭৮' : 'Mobile: 01712-345678'}</p>
    </div>
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; font-size:0.9rem; background:#f8fafc; padding:12px; border-radius:8px; margin-bottom:14px; color:#0f172a;">
      <div><div>${isBn ? 'কাস্টমার:' : 'Customer:'}</div><strong>${esc(sale.customerName)}</strong><div>${esc(sale.customerPhone || '')}</div></div>
      <div style="text-align:right;"><div class="font-mono"><strong>${esc(sale.memoNo)}</strong></div><div>${esc(sale.date)}</div><div>${esc(sale.paymentMethod)}</div></div>
    </div>
    <table style="width:100%; border-collapse:collapse; font-size:0.9rem; margin-bottom:14px; color:#0f172a;">
      <thead><tr style="background:#f1f5f9; border-bottom:2px solid #cbd5e1;"><th style="padding:8px; text-align:left;">${isBn ? 'পণ্য' : 'Product'}</th><th style="padding:8px; text-align:center;">${isBn ? 'পরিমাণ' : 'Qty'}</th><th style="padding:8px; text-align:right;">${isBn ? 'দর' : 'Rate'}</th><th style="padding:8px; text-align:right;">${isBn ? 'মোট' : 'Total'}</th></tr></thead>
      <tbody>${(sale.items || []).map((it) => `<tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:8px;"><strong>${esc(cleanProductTitle(it.productName))}</strong></td><td style="padding:8px; text-align:center;" class="font-mono">${it.quantity} ${esc(it.unit)}</td><td style="padding:8px; text-align:right;" class="font-mono">৳${it.sellPrice}</td><td style="padding:8px; text-align:right; font-weight:700;" class="font-mono">৳${it.totalAmount}</td></tr>`).join('')}</tbody>
    </table>
    <div style="text-align:right; font-size:0.95rem; color:#0f172a;">
      <div><strong>${isBn ? 'সর্বমোট প্রদেয়:' : 'Net Payable:'}</strong> <span class="font-mono">${formatTaka(sale.netPayable)}</span></div>
      <div>${isBn ? 'পরিশোধিত:' : 'Paid:'} <span class="font-mono" style="color:#059669">${formatTaka(sale.paidAmount)}</span></div>
      ${sale.dueAmount > 0 ? `<div style="color:#e11d48"><strong>${isBn ? 'বাকি:' : 'Due:'}</strong> <span class="font-mono">${formatTaka(sale.dueAmount)}</span></div>` : ''}
    </div>
  `;
  overlay.classList.add('active');
};
window.closeInvoiceModal = () => document.getElementById('invoice-modal-overlay')?.classList.remove('active');
window.printInvoice = () => window.print();

window.showProductModal = function(prodId) {
  state.editingProductId = prodId;
  const overlay = document.getElementById('product-modal-overlay');
  if (!overlay) return;
  const prod = prodId ? state.products.find((p) => p.id === prodId) : null;
  document.getElementById('modal-prod-name').value = prod ? prod.name : '';
  document.getElementById('modal-prod-category').value = prod ? prod.category : 'ক্যারেট';
  document.getElementById('modal-prod-buy').value = prod ? prod.buy_price : 0;
  document.getElementById('modal-prod-sell').value = prod ? prod.sell_price : 0;
  document.getElementById('modal-prod-unit').value = prod ? prod.unit : 'পিস';
  document.getElementById('modal-prod-stock').value = prod ? prod.stock : 100;
  document.getElementById('modal-prod-alert').value = prod ? (prod.minStockAlert || 20) : 20;
  overlay.classList.add('active');
};
window.closeProductModal = () => { document.getElementById('product-modal-overlay')?.classList.remove('active'); state.editingProductId = null; };

window.handleSaveProductModal = async function(e) {
  e.preventDefault();
  const name = document.getElementById('modal-prod-name').value.trim();
  if (!name) return;
  const payload = {
    name,
    category: document.getElementById('modal-prod-category').value,
    buy_price: parseFloat(document.getElementById('modal-prod-buy').value) || 0,
    sell_price: parseFloat(document.getElementById('modal-prod-sell').value) || 0,
    unit: document.getElementById('modal-prod-unit').value,
    stock: parseFloat(document.getElementById('modal-prod-stock').value) || 0,
    minStockAlert: parseFloat(document.getElementById('modal-prod-alert').value) || 20,
  };
  let savedProd = null;
  if (state.editingProductId) {
    const existing = state.products.find((p) => p.id === state.editingProductId);
    if (existing) { Object.assign(existing, payload); savedProd = existing; }
  } else {
    const nextId = state.products.length > 0 ? Math.max(...state.products.map((p) => p.id)) + 1 : 1;
    savedProd = Object.assign({ id: nextId }, payload);
    state.products.push(savedProd);
  }
  if (savedProd) await saveProductToDb(savedProd);
  closeProductModal();
  showToast(state.lang === 'bn' ? 'পণ্য সংরক্ষণ সম্পন্ন হয়েছে!' : 'Product saved!', 'success');
  render();
};

window.openCustomerSettingsModal = function(targetCustId) {
  const overlay = document.getElementById('customer-settings-modal-overlay');
  if (!overlay) return;
  if (targetCustId) state.editingCustomerId = targetCustId;
  renderCustomerSettingsModal();
  overlay.classList.add('active');
};
window.closeCustomerSettingsModal = () => { state.editingCustomerId = null; document.getElementById('customer-settings-modal-overlay')?.classList.remove('active'); render(); };

window.renderCustomerSettingsModal = function() {
  const body = document.getElementById('customer-settings-body');
  if (!body) return;
  const isBn = state.lang === 'bn';
  body.innerHTML = `<div class="customer-settings-grid">${state.customers.map((c) => {
    const isEditing = state.editingCustomerId === c.id;
    return `<div class="customer-settings-card">
      <div>${renderAvatarSvg(c, 64)}</div>
      <div style="flex:1; min-width:0;">
        ${isEditing ? `
          <input type="text" id="edit-cust-name-${esc(c.id)}" class="form-control" style="margin-bottom:6px; padding:6px 10px;" value="${esc(c.name)}" />
          <input type="text" id="edit-cust-shop-${esc(c.id)}" class="form-control" style="margin-bottom:6px; padding:6px 10px;" value="${esc(c.shopName)}" />
          <input type="text" id="edit-cust-phone-${esc(c.id)}" class="form-control font-mono" style="margin-bottom:8px; padding:6px 10px;" value="${esc(c.phone || '')}" />
          <div style="display:flex; gap:6px; flex-wrap:wrap;">
            <label class="btn btn-outline btn-sm" style="cursor:pointer;">📷 ${isBn ? 'ছবি দিন' : 'Photo'}<input type="file" accept="image/*" style="display:none" onchange="uploadCustomerPhoto('${esc(c.id)}', this)" /></label>
            <button type="button" class="btn btn-primary btn-sm" onclick="saveCustomerProfileEdit('${esc(c.id)}')">${isBn ? 'সংরক্ষণ' : 'Save'}</button>
            <button type="button" class="btn btn-outline btn-sm" onclick="state.editingCustomerId=null; renderCustomerSettingsModal()">${isBn ? 'বাতিল' : 'Cancel'}</button>
          </div>
        ` : `
          <div style="font-size:1.05rem; font-weight:800;">${esc(c.name)}</div>
          <div style="font-size:0.875rem; color:var(--color-text-muted);">${esc(c.shopName)}</div>
          <div class="font-mono" style="font-size:0.85rem; color:var(--color-text-subtle); margin-bottom:10px;">${esc(c.phone || '')}</div>
          <div style="display:flex; flex-wrap:wrap; gap:6px;">
            <label class="btn btn-outline btn-sm" style="cursor:pointer;">📷 ${c.customPhoto ? (isBn ? 'ছবি বদলান' : 'Change') : (isBn ? 'ছবি আপলোড' : 'Upload')}<input type="file" accept="image/*" style="display:none" onchange="uploadCustomerPhoto('${esc(c.id)}', this)" /></label>
            ${c.customPhoto ? `<button type="button" class="btn btn-outline btn-sm" onclick="resetCustomerPhoto('${esc(c.id)}')">↩️ ${isBn ? 'অবতার' : 'Avatar'}</button>` : ''}
            <button type="button" class="btn btn-outline btn-sm" onclick="state.editingCustomerId='${esc(c.id)}'; renderCustomerSettingsModal()">✏️ ${isBn ? 'এডিট' : 'Edit'}</button>
          </div>
        `}
      </div>
    </div>`;
  }).join('')}</div>`;
};

window.uploadCustomerPhoto = function(custId, inputEl) {
  const file = inputEl.files && inputEl.files[0];
  if (!file) return;
  compressImageFile(file, 260, (dataUrl) => {
    const cust = state.customers.find((c) => c.id === custId);
    if (cust) {
      cust.customPhoto = dataUrl;
      saveJsonStorage(STORAGE_KEYS.CUSTOMERS, state.customers);
      showToast(`${cust.name}-এর ছবি আপডেট হয়েছে!`, 'success');
      renderCustomerSettingsModal();
    }
  });
};

window.resetCustomerPhoto = function(custId) {
  const cust = state.customers.find((c) => c.id === custId);
  if (cust) { delete cust.customPhoto; saveJsonStorage(STORAGE_KEYS.CUSTOMERS, state.customers); renderCustomerSettingsModal(); }
};

window.saveCustomerProfileEdit = function(custId) {
  const cust = state.customers.find((c) => c.id === custId);
  if (!cust) return;
  const n = document.getElementById(`edit-cust-name-${custId}`)?.value.trim();
  const s = document.getElementById(`edit-cust-shop-${custId}`)?.value.trim();
  const p = document.getElementById(`edit-cust-phone-${custId}`)?.value.trim();
  if (!n) return;
  cust.name = n;
  cust.shopName = s || 'নিয়মিত ক্রেতা';
  cust.phone = p || '';
  saveJsonStorage(STORAGE_KEYS.CUSTOMERS, state.customers);
  state.editingCustomerId = null;
  renderCustomerSettingsModal();
};

window.resetCustomersDefault = function() {
  state.customers = JSON.parse(JSON.stringify(INITIAL_REGULAR_CUSTOMERS));
  saveJsonStorage(STORAGE_KEYS.CUSTOMERS, state.customers);
  showToast('১০ জন নিয়মিত গ্রাহকের তালিকা রিসেট হয়েছে', 'info');
  renderCustomerSettingsModal();
};

window.openFontSettingsModal = function() {
  const overlay = document.getElementById('font-settings-modal-overlay');
  if (!overlay) return;
  renderFontSettingsModal();
  overlay.classList.add('active');
};
window.closeFontSettingsModal = () => { document.getElementById('font-settings-modal-overlay')?.classList.remove('active'); render(); };
window.updateTypographyField = function(field, value) {
  state.typography[field] = value;
  applyTypographySettings(state.typography);
  saveJsonStorage(STORAGE_KEYS.TYPOGRAPHY, state.typography);
  renderFontSettingsModal();
};
window.resetTypographyDefault = function() {
  state.typography = Object.assign({}, DEFAULT_TYPOGRAPHY);
  applyTypographySettings(state.typography);
  saveJsonStorage(STORAGE_KEYS.TYPOGRAPHY, state.typography);
  renderFontSettingsModal();
};

window.renderFontSettingsModal = function() {
  const body = document.getElementById('font-settings-body');
  if (!body) return;
  const t = state.typography || DEFAULT_TYPOGRAPHY;
  const isBn = state.lang === 'bn';
  body.innerHTML = `<div style="display:flex; flex-direction:column; gap:18px;">
    <div>
      <label class="form-label">${isBn ? 'লেখার আকার (Font Size)' : 'Font Size'}</label>
      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px;">
        <button type="button" class="chip ${t.sizeScale === 'normal' ? 'active' : ''}" onclick="updateTypographyField('sizeScale','normal')">স্বাভাবিক (১৬.৫px)</button>
        <button type="button" class="chip ${t.sizeScale === 'large' ? 'active' : ''}" onclick="updateTypographyField('sizeScale','large')">বড় (১৮px)</button>
        <button type="button" class="chip ${t.sizeScale === 'xlarge' ? 'active' : ''}" onclick="updateTypographyField('sizeScale','xlarge')">আরও বড় (২০px)</button>
      </div>
    </div>
    <div>
      <label class="form-label">${isBn ? 'লেখার পুরুত্ব (Boldness)' : 'Font Weight'}</label>
      <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:8px;">
        <button type="button" class="chip ${t.weight === '500' ? 'active' : ''}" onclick="updateTypographyField('weight','500')">হালকা (500)</button>
        <button type="button" class="chip ${t.weight === '600' ? 'active' : ''}" onclick="updateTypographyField('weight','600')">মাঝারি (600)</button>
        <button type="button" class="chip ${t.weight === '700' ? 'active' : ''}" onclick="updateTypographyField('weight','700')">বোল্ড (700)</button>
        <button type="button" class="chip ${t.weight === '800' ? 'active' : ''}" onclick="updateTypographyField('weight','800')">গাঢ় (800)</button>
      </div>
    </div>
    <div>
      <label class="form-label">${isBn ? 'বাংলা ফন্টের ধরন' : 'Font Family'}</label>
      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px;">
        <button type="button" class="chip ${t.family === 'sutonny' ? 'active' : ''}" onclick="updateTypographyField('family','sutonny')">সুতনি এমজে (SutonnyMJ)</button>
        <button type="button" class="chip ${t.family === 'noto' ? 'active' : ''}" onclick="updateTypographyField('family','noto')">নোটো বাংলা (Noto)</button>
        <button type="button" class="chip ${t.family === 'hind' ? 'active' : ''}" onclick="updateTypographyField('family','hind')">হিন্দ শিলিগুড়ি (Hind)</button>
      </div>
    </div>
    <div style="padding:16px; border-radius:12px; background:var(--color-surface-muted); border:1px solid var(--color-border);">
      <div style="font-size:0.85rem; color:var(--color-text-subtle); margin-bottom:4px;">লাইভ প্রিভিউ:</div>
      <div style="font-size:1.2rem; font-weight:800;">সুতলি · বস্তা (পানি/নেট) · ক্যারেট - ১নং · কাগজ</div>
      <div style="margin-top:4px;">আজকের মোট বিক্রি ৳ ১৫,৪৫০ — সব বাংলা লেখা স্পষ্ট ও বোল্ড দেখাচ্ছে।</div>
    </div>
  </div>`;
};

window.seedDefaultProductsToSupabase = async function() {
  state.products = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
  saveJsonStorage(STORAGE_KEYS.PRODUCTS, state.products);
  if (supabaseClient) {
    try { await supabaseClient.from('products').upsert(state.products); } catch (e) {}
  }
  showToast('প্রাথমিক ২৯টি পণ্য লোড হয়েছে!', 'success');
  render();
};

window.resetAllData = async function() {
  state.products = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
  state.sales = [];
  saveJsonStorage(STORAGE_KEYS.PRODUCTS, state.products);
  saveJsonStorage(STORAGE_KEYS.SALES, state.sales);
  if (supabaseClient) {
    try {
      await supabaseClient.from('sales').delete().neq('id', '');
      await supabaseClient.from('products').upsert(state.products);
    } catch (e) {}
  }
  showToast('প্রাথমিক ২৯টি পণ্যের ডেটা রিসেট হয়েছে', 'info');
  render();
};

// ----------------- AUTO DOM ENHANCEMENT & INITIALIZATION -----------------
function ensureStandaloneEnhancements() {
  if (!document.getElementById('agri-standalone-enhancements-css')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'agri-standalone-enhancements-css';
    styleEl.textContent = `
      :root { --app-font-size: 18px; --app-font-weight: 700; --app-font-family: 'SutonnyMJ', 'Noto Sans Bengali', 'Hind Siliguri', 'Outfit', system-ui, sans-serif; }
      html { font-family: var(--app-font-family); font-size: var(--app-font-size); }
      body { font-family: var(--app-font-family); font-weight: var(--app-font-weight); }
      #agri-toast-box { position: fixed; bottom: 22px; right: 22px; z-index: 9999; display: flex; flex-direction: column; gap: 10px; }
      .session-strip { background-color: var(--color-surface, #fff); border: 1px solid var(--color-border, #e2e8f0); border-radius: 14px; padding: 12px 16px; margin-bottom: 18px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; }
      .analytics-mode-tabs { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px; }
      .customer-name-text { font-size: 1.05rem; font-weight: 800; line-height: 1.3; }
      .customer-edit-badge { position: absolute; top: 6px; left: 6px; width: 26px; height: 26px; border-radius: 9999px; background: var(--color-surface, #fff); border: 1px solid var(--color-border, #e2e8f0); display: flex; align-items: center; justify-content: center; font-size: 0.78rem; cursor: pointer; }
      .customer-check-badge { position: absolute; top: 6px; right: 6px; width: 22px; height: 22px; border-radius: 9999px; background: var(--color-primary, #059669); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 800; }
      .product-card-title { font-size: 1.25rem !important; font-weight: 800 !important; line-height: 1.3 !important; }
    `;
    document.head.appendChild(styleEl);
  }

  const navLinks = document.querySelector('.nav-links');
  if (navLinks && !navLinks.querySelector('[data-tab="analytics"]')) {
    const b = document.createElement('button');
    b.className = 'nav-item';
    b.dataset.tab = 'analytics';
    b.textContent = 'হিসাব ও রিপোর্ট';
    navLinks.appendChild(b);
  }
  const mobileNav = document.querySelector('.mobile-nav');
  if (mobileNav && !mobileNav.querySelector('[data-tab="analytics"]')) {
    const b = document.createElement('button');
    b.className = 'mobile-nav-item';
    b.dataset.tab = 'analytics';
    b.textContent = 'হিসাব ও রিপোর্ট';
    mobileNav.appendChild(b);
  }
  const actionZone = document.querySelector('.action-zone');
  if (actionZone && !document.getElementById('font-settings-btn')) {
    const b = document.createElement('button');
    b.id = 'font-settings-btn';
    b.type = 'button';
    b.className = 'btn btn-outline btn-sm';
    b.textContent = '🔤 ফন্ট';
    b.onclick = () => window.openFontSettingsModal();
    actionZone.insertBefore(b, actionZone.firstChild);
  }
  if (!document.getElementById('customer-settings-modal-overlay')) {
    const m = document.createElement('div');
    m.id = 'customer-settings-modal-overlay';
    m.className = 'modal-overlay';
    m.innerHTML = `<div class="modal-card" style="max-width:780px;"><div class="modal-header panel-header-indigo" style="color:#fff;"><div><h3 style="font-size:1.15rem; font-weight:800;">নিয়মিত গ্রাহক প্রোফাইল ও ছবি সেটিংস</h3><div style="font-size:0.85rem; opacity:0.9;">ছবি আপলোড, পরিবর্তন বা তথ্য এডিট করুন</div></div><button class="btn-icon" style="color:#fff;" onclick="closeCustomerSettingsModal()">✕</button></div><div class="modal-body" id="customer-settings-body"></div><div class="modal-footer" style="justify-content:space-between;"><button type="button" class="btn btn-outline btn-sm" onclick="resetCustomersDefault()">ডিফল্ট ১০ গ্রাহক রিসেট</button><button type="button" class="btn btn-primary" onclick="closeCustomerSettingsModal()">সম্পন্ন</button></div></div>`;
    document.body.appendChild(m);
  }
  if (!document.getElementById('font-settings-modal-overlay')) {
    const m = document.createElement('div');
    m.id = 'font-settings-modal-overlay';
    m.className = 'modal-overlay';
    m.innerHTML = `<div class="modal-card" style="max-width:600px;"><div class="modal-header panel-header-indigo" style="color:#fff;"><div><h3 style="font-size:1.15rem; font-weight:800;">ফন্ট সাইজ ও বোল্ড কাস্টমাইজেশন</h3><div style="font-size:0.85rem; opacity:0.9;">বাংলা লেখার সাইজ, পুরুত্ব ও ফন্ট স্টাইল নির্ধারণ করুন</div></div><button class="btn-icon" style="color:#fff;" onclick="closeFontSettingsModal()">✕</button></div><div class="modal-body" id="font-settings-body"></div><div class="modal-footer" style="justify-content:space-between;"><button type="button" class="btn btn-outline btn-sm" onclick="resetTypographyDefault()">ডিফল্ট সেটিংস</button><button type="button" class="btn btn-primary" onclick="closeFontSettingsModal()">সম্পন্ন</button></div></div>`;
    document.body.appendChild(m);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  ensureStandaloneEnhancements();

  document.querySelectorAll('[data-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.currentTab = btn.dataset.tab;
      render();
    });
  });

  const themeBtn = document.getElementById('theme-toggle-btn');
  if (themeBtn) themeBtn.addEventListener('click', () => applyTheme(state.theme === 'dark' ? 'light' : 'dark'));

  const langBtn = document.getElementById('lang-toggle-btn');
  if (langBtn) {
    langBtn.addEventListener('click', () => {
      state.lang = state.lang === 'bn' ? 'en' : 'bn';
      try { localStorage.setItem(STORAGE_KEYS.LANG, state.lang); } catch (e) {}
      render();
    });
  }

  const resetBtn = document.getElementById('reset-data-btn');
  if (resetBtn) resetBtn.addEventListener('click', window.resetAllData);

  const modalForm = document.getElementById('product-modal-form');
  if (modalForm) modalForm.onsubmit = window.handleSaveProductModal;

  window.loadState();
});
