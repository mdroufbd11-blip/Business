/**
 * Agricultural Packaging Inventory & POS (কৃষি প্যাকেজিং হিসাব)
 * Standalone Vanilla JavaScript for GitHub Pages & Vercel
 * Integrated with Supabase PostgreSQL + automatic localStorage offline fallback
 * Includes Dark/Light Mode, 10 Regular Customers Avatar Grid, & Category Product Grid
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
  CUSTOMERS: 'standalone_agri_customers',
  LANG: 'standalone_agri_lang',
  THEME: 'standalone_agri_theme',
  TYPOGRAPHY: 'standalone_agri_typography',
};

function getLocalDateKey(dateObj) {
  var d = dateObj || new Date();
  var y = d.getFullYear();
  var m = String(d.getMonth() + 1).padStart(2, '0');
  var day = String(d.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + day;
}

function getLocalMonthKey(dateObj) {
  var d = dateObj || new Date();
  var y = d.getFullYear();
  var m = String(d.getMonth() + 1).padStart(2, '0');
  return y + '-' + m;
}

function getLocalDateTimeForDate(dateKey) {
  var now = new Date();
  var hh = String(now.getHours()).padStart(2, '0');
  var mm = String(now.getMinutes()).padStart(2, '0');
  var base = (dateKey && /^\d{4}-\d{2}-\d{2}$/.test(dateKey)) ? dateKey : getLocalDateKey(now);
  return base + ' ' + hh + ':' + mm;
}

function extractSaleDateKey(rawDate) {
  if (!rawDate) return '';
  var trimmed = String(rawDate).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return trimmed.slice(0, 10);
  var parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) return getLocalDateKey(parsed);
  return '';
}

function isDateWithinLastDays(dateKey, days) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return false;
  var todayKey = getLocalDateKey();
  var end = new Date(todayKey + 'T23:59:59').getTime();
  var startDate = new Date(todayKey + 'T00:00:00');
  startDate.setDate(startDate.getDate() - Math.max(0, days - 1));
  var target = new Date(dateKey + 'T12:00:00').getTime();
  return target >= startDate.getTime() && target <= end;
}

var DEFAULT_TYPOGRAPHY = {
  sizeScale: 'large',
  weight: '700',
  family: 'sutonny',
};

var FONT_SIZE_MAP = {
  normal: '16.5px',
  large: '18px',
  xlarge: '20px',
};

var FONT_FAMILY_MAP = {
  sutonny: "'SutonnyMJ', 'Noto Sans Bengali', 'Hind Siliguri', 'Outfit', system-ui, sans-serif",
  noto: "'Noto Sans Bengali', 'Hind Siliguri', 'Outfit', system-ui, sans-serif",
  hind: "'Hind Siliguri', 'Noto Sans Bengali', 'Outfit', system-ui, sans-serif",
};

function loadTypographySettings() {
  try {
    var saved = localStorage.getItem(STORAGE_KEYS.TYPOGRAPHY);
    if (saved) {
      var parsed = JSON.parse(saved);
      return Object.assign({}, DEFAULT_TYPOGRAPHY, parsed || {});
    }
  } catch (e) {}
  return Object.assign({}, DEFAULT_TYPOGRAPHY);
}

function applyTypographySettings(settings) {
  var cfg = settings || DEFAULT_TYPOGRAPHY;
  var root = document.documentElement;
  root.style.setProperty('--app-font-size', FONT_SIZE_MAP[cfg.sizeScale] || '18px');
  root.style.setProperty('--app-font-weight', cfg.weight || '700');
  root.style.setProperty('--app-font-family', FONT_FAMILY_MAP[cfg.family] || FONT_FAMILY_MAP.sutonny);
}

var INITIAL_REGULAR_CUSTOMERS = [
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

// Initial 29 Products
var INITIAL_PRODUCTS = [
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

var CATEGORIES = ['সব', 'ক্যারেট', 'কাগজ', 'অন্যান্য', 'বস্তা (পানি)', 'বস্তা (সাদা)', 'বস্তা (নিল)', 'বস্তা (নেট)'];

var state = {
  products: [],
  sales: [],
  customers: JSON.parse(JSON.stringify(INITIAL_REGULAR_CUSTOMERS)),
  currentTab: 'dashboard',
  lang: 'bn',
  theme: 'light',
  typography: loadTypographySettings(),
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
  syncMode: 'connecting',
  syncMessage: '',
};

function cleanProductTitle(name) {
  return String(name || '')
    .replace(/\s*\(🟢 উপলব্ধ\)/g, '')
    .replace(/\s*\(🔴 স্টক নেই\)/g, '')
    .trim();
}

function getCategoryCardClass(cat) {
  if (cat === 'ক্যারেট') return 'cat-crate';
  if (cat === 'কাগজ') return 'cat-paper';
  if (cat === 'বস্তা (পানি)') return 'cat-water';
  if (cat === 'বস্তা (সাদা)') return 'cat-white';
  if (cat === 'বস্তা (নিল)') return 'cat-blue';
  if (cat === 'বস্তা (নেট)') return 'cat-net';
  return 'cat-other';
}

function compressImageFile(file, maxSize, callback) {
  var reader = new FileReader();
  reader.onload = function() {
    var img = new Image();
    img.onload = function() {
      var canvas = document.createElement('canvas');
      var w = img.width;
      var h = img.height;
      if (w > h) {
        if (w > maxSize) { h = Math.round((h * maxSize) / w); w = maxSize; }
      } else {
        if (h > maxSize) { w = Math.round((w * maxSize) / h); h = maxSize; }
      }
      canvas.width = w;
      canvas.height = h;
      var ctx = canvas.getContext('2d');
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

function renderAvatarSvg(cust, customSizePx) {
  var c = cust || {};
  var sizeStyle = customSizePx ? 'width:' + customSizePx + 'px; height:' + customSizePx + 'px;' : '';
  if (c.customPhoto) {
    return '<div class="customer-avatar-wrap" style="' + sizeStyle + '"><img src="' + c.customPhoto + '" alt="' + (c.name || '') + '" style="width:100%; height:100%; object-fit:cover;" /></div>';
  }
  var skin = c.skinTone || '#d99b72';
  var hair = c.hairColor || '#1e293b';
  var shirt = c.shirtColor || '#059669';
  return `
    <div class="customer-avatar-wrap" style="background:${shirt}33; ${sizeStyle}">
      <svg viewBox="0 0 64 64" width="100%" height="100%">
        <circle cx="32" cy="32" r="32" fill="${shirt}" opacity="0.22" />
        <path d="M10 64 C10 48, 20 43, 32 43 C44 43, 54 48, 54 64 Z" fill="${shirt}" />
        <path d="M25 43 L32 51 L39 43" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity="0.85" />
        <rect x="27" y="36" width="10" height="10" rx="4" fill="${skin}" />
        <circle cx="19" cy="27" r="3.2" fill="${skin}" />
        <circle cx="45" cy="27" r="3.2" fill="${skin}" />
        <rect x="20" y="14" width="24" height="26" rx="12" fill="${skin}" />
        ${c.hasCap
          ? '<path d="M19 20 C19 10, 45 10, 45 20 Z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1" />'
          : '<path d="M20 22 C20 12, 44 12, 44 22 C41 16, 23 16, 20 22 Z" fill="' + hair + '" />'}
        <circle cx="26.5" cy="26.5" r="1.7" fill="#0f172a" />
        <circle cx="37.5" cy="26.5" r="1.7" fill="#0f172a" />
        ${c.hasGlasses
          ? '<g stroke="#0f172a" stroke-width="1.5" fill="rgba(255,255,255,0.25)"><rect x="22" y="23.5" width="8.5" height="6" rx="2"/><rect x="33.5" y="23.5" width="8.5" height="6" rx="2"/><line x1="30.5" y1="26" x2="33.5" y2="26"/></g>'
          : ''}
        ${c.hasBeard
          ? '<path d="M20 28 C20 38, 26 42, 32 42 C38 42, 44 38, 44 28 C42 32, 38 35, 32 35 C26 35, 22 32, 20 28 Z" fill="' + hair + '" opacity="0.9" />'
          : ''}
        <path d="M28 33.5 Q32 36.5 36 33.5" fill="none" stroke="${c.hasBeard ? '#ffffff' : '#7c2d12'}" stroke-width="1.6" stroke-linecap="round" />
      </svg>
    </div>
  `;
}

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
    date: String(raw.date || getLocalDateTimeForDate(getLocalDateKey())),
    note: raw.note || '',
  };
}

function loadLocalProducts() {
  try {
    var saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (saved) {
      var parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed.map(normalizeProduct);
    }
  } catch (e) {}
  return [];
}

function loadLocalSales() {
  try {
    var saved = localStorage.getItem(STORAGE_KEYS.SALES);
    if (saved) {
      var parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed.map(normalizeSale);
    }
  } catch (e) {}
  return [];
}

function loadLocalCustomers() {
  try {
    var saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    if (saved) {
      var parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return JSON.parse(JSON.stringify(INITIAL_REGULAR_CUSTOMERS));
}

function saveLocalProducts() {
  try { localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(state.products)); } catch (e) {}
}
function saveLocalSales() {
  try { localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(state.sales)); } catch (e) {}
}
function saveLocalCustomers() {
  try { localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(state.customers)); } catch (e) {}
}

function applyTheme(theme) {
  state.theme = theme === 'dark' ? 'dark' : 'light';
  if (state.theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  try { localStorage.setItem(STORAGE_KEYS.THEME, state.theme); } catch (e) {}
  var themeBtn = document.getElementById('theme-toggle-btn');
  if (themeBtn) {
    var isBn = state.lang === 'bn';
    themeBtn.textContent = state.theme === 'dark'
      ? (isBn ? '☀️ লাইট' : '☀️ Light')
      : (isBn ? '🌙 ডার্ক' : '🌙 Dark');
  }
}

// ----------------- SUPABASE + LOCAL STORAGE SYNC -----------------
async function loadState() {
  state.isLoading = true;
  render();

  try {
    var savedLang = localStorage.getItem(STORAGE_KEYS.LANG);
    if (savedLang === 'bn' || savedLang === 'en') state.lang = savedLang;
    var savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    applyTheme(savedTheme === 'dark' ? 'dark' : 'light');
    state.typography = loadTypographySettings();
    applyTypographySettings(state.typography);
  } catch (e) {}

  state.customers = loadLocalCustomers();
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
    var prodRes = await supabaseClient.from('products').select('*');
    var salesRes = await supabaseClient.from('sales').select('*').order('date', { ascending: false });

    if (prodRes.error || salesRes.error) {
      var errMsg = (prodRes.error && prodRes.error.message) || (salesRes.error && salesRes.error.message) || 'Unknown error';
      console.error('Supabase fetch error:', prodRes.error || salesRes.error);
      state.products = fallbackProducts;
      state.sales = fallbackSales;
      state.syncMode = 'local';
      state.syncMessage = errMsg;
    } else {
      state.products = (prodRes.data || [])
        .map(normalizeProduct)
        .sort(function(a, b) { return a.id - b.id; });
      state.sales = (salesRes.data || []).map(normalizeSale);
      state.syncMode = 'supabase';
      state.syncMessage = '';
      saveLocalProducts();
      saveLocalSales();
    }
  } catch (error) {
    console.error('Supabase unreachable:', error);
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
  if (!supabaseClient) return { ok: false, error: 'Supabase client not configured' };
  try {
    var res = await supabaseClient.from('products').upsert([product]);
    if (res.error) {
      console.error('Error upserting product to Supabase:', res.error);
      return { ok: false, error: res.error.message };
    }
    state.syncMode = 'supabase';
    return { ok: true };
  } catch (err) {
    console.error(err);
    return { ok: false, error: err && err.message ? err.message : 'Network error' };
  }
}

async function updateProductStockInDb(prodId, newStock) {
  saveLocalProducts();
  if (!supabaseClient) return { ok: false, error: 'Supabase client not configured' };
  try {
    var res = await supabaseClient.from('products').update({ stock: newStock }).eq('id', prodId);
    if (res.error) {
      console.error('Error updating product stock in Supabase:', res.error);
      return { ok: false, error: res.error.message };
    }
    return { ok: true };
  } catch (err) {
    console.error(err);
    return { ok: false, error: err && err.message ? err.message : 'Network error' };
  }
}

async function deleteProductFromDb(prodId) {
  saveLocalProducts();
  if (!supabaseClient) return;
  try { await supabaseClient.from('products').delete().eq('id', prodId); } catch (err) { console.error(err); }
}

async function insertSaleToDb(saleRecord) {
  if (!supabaseClient) {
    return { ok: false, error: 'Supabase ক্লায়েন্ট সংযুক্ত নয়।' };
  }
  var totalQty = (saleRecord.items || []).reduce(function(sum, it) {
    return sum + Number(it.quantity || 0);
  }, 0);
  var summaryNames = (saleRecord.items || []).map(function(it) {
    return it.productName + ' (' + it.quantity + ' ' + it.unit + ')';
  }).join(', ');
  var extendedPayload = Object.assign({}, saleRecord, {
    phone: saleRecord.customerPhone || '',
    quantity: Number(totalQty.toFixed(2)),
    productName: summaryNames,
  });

  try {
    var res = await supabaseClient.from('sales').insert([extendedPayload]).select();
    if (res.error) {
      var msg = res.error.message || '';
      if (res.error.code === 'PGRST204' || res.error.code === '42703' || msg.toLowerCase().indexOf('column') !== -1) {
        var retry = await supabaseClient.from('sales').insert([saleRecord]).select();
        if (retry.error) {
          console.error('Supabase sale insert error:', retry.error);
          return { ok: false, error: retry.error.message };
        }
        state.syncMode = 'supabase';
        saveLocalSales();
        return { ok: true };
      }
      console.error('Supabase sale insert error:', res.error);
      return { ok: false, error: msg };
    }
    state.syncMode = 'supabase';
    saveLocalSales();
    return { ok: true };
  } catch (err) {
    console.error('Supabase sale insert failed:', err);
    return { ok: false, error: err && err.message ? err.message : 'Network error' };
  }
}

async function deleteSaleFromDb(saleId) {
  saveLocalSales();
  if (!supabaseClient) return;
  try { await supabaseClient.from('sales').delete().eq('id', saleId); } catch (err) { console.error(err); }
}

function formatTaka(num) {
  return '৳ ' + (Math.round((num || 0) * 100) / 100).toLocaleString('en-US');
}

function generateMemoNo() {
  var count = state.sales.length + 101;
  var token = Date.now().toString(36).slice(-4).toUpperCase();
  return 'MEMO-' + count.toString().padStart(4, '0') + '-' + token;
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

function render() {
  document.querySelectorAll('.nav-item').forEach(function(el) {
    el.classList.toggle('active', el.dataset.tab === state.currentTab);
  });
  document.querySelectorAll('.mobile-nav-item').forEach(function(el) {
    el.classList.toggle('active', el.dataset.tab === state.currentTab);
  });

  var langBtn = document.getElementById('lang-toggle-btn');
  if (langBtn) langBtn.textContent = state.lang === 'bn' ? 'English' : 'বাংলা';

  applyTheme(state.theme);
  applyTypographySettings(state.typography);
  updateFooterSyncStatus();

  var main = document.getElementById('app-main-content');
  if (!main) return;

  if (state.isLoading) {
    var isBn = state.lang === 'bn';
    main.innerHTML = `<div class="loading-state"><div class="spinner"></div><div>${isBn ? 'ডাটাবেজ থেকে তথ্য লোড হচ্ছে...' : 'Loading inventory & sales...'}</div></div>`;
    return;
  }

  if (state.currentTab === 'dashboard') renderDashboard(main);
  else if (state.currentTab === 'products') renderProducts(main);
  else if (state.currentTab === 'history') renderHistory(main);
  else if (state.currentTab === 'restock') renderRestock(main);
  else if (state.currentTab === 'analytics') renderAnalytics(main);
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
  var todayKey = getLocalDateKey();
  var sessionDate = state.sessionDate || todayKey;
  var availableProducts = state.products.filter(function(p) { return p.stock > 0 && p.sell_price > 0; });

  // Isolate POS KPIs & table to active sessionDate so previous days never mix
  var sessionSales = state.sales.filter(function(s) {
    return extractSaleDateKey(s.date) === sessionDate;
  });

  var totalTypes = state.products.length;
  var totalStockUnits = state.products.reduce(function(acc, p) { return acc + p.stock; }, 0);
  var totalSalesCount = sessionSales.length;
  var totalRevenue = sessionSales.reduce(function(acc, s) { return acc + s.netPayable; }, 0);
  var totalProfit = sessionSales.reduce(function(acc, s) { return acc + s.profit; }, 0);
  var totalDue = sessionSales.reduce(function(acc, s) { return acc + s.dueAmount; }, 0);
  var lowStockCount = state.products.filter(function(p) { return p.stock <= (p.minStockAlert || 15); }).length;

  var filteredCustomers = state.customers.filter(function(c) {
    var q = state.customerSearchTerm.trim().toLowerCase();
    if (!q) return true;
    return c.name.toLowerCase().includes(q) || c.shopName.toLowerCase().includes(q) || c.phone.includes(q);
  });

  var filteredPosProducts = availableProducts.filter(function(p) {
    var catOk = state.posCategoryFilter === 'সব' || p.category === state.posCategoryFilter;
    var q = state.posProductSearch.trim().toLowerCase();
    var qOk = !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    return catOk && qOk;
  });

  // Sync cart items with latest product objects
  state.cart = state.cart.filter(function(item) {
    var fresh = state.products.find(function(p) { return p.id === item.productId; });
    return fresh && fresh.stock > 0;
  });

  container.innerHTML = `
    ${renderSyncNoticeBanner()}

    <!-- Session Date Isolation & Quick Style Controls -->
    <div class="session-strip">
      <div style="display:flex; flex-wrap:wrap; align-items:center; gap:10px;">
        <span style="font-weight:800;">📅 ${isBn ? 'বিক্রি সেশনের তারিখ:' : 'Session Date:'}</span>
        <input type="date" class="form-control font-mono" style="width:auto; padding:6px 12px; font-weight:800;" value="${sessionDate}" onchange="if(this.value){state.sessionDate=this.value; render();}" />
        ${sessionDate === todayKey
          ? '<span class="status-pill status-in-stock">' + (isBn ? 'আজকের আলাদা হিসাব সক্রিয়' : 'Today Active') + '</span>'
          : '<button type="button" class="btn btn-outline btn-sm" onclick="state.sessionDate=\'' + todayKey + '\'; render();">' + (isBn ? 'আজকের তারিখে ফিরুন' : 'Reset Today') + '</button>'}
      </div>
      <div style="display:flex; flex-wrap:wrap; gap:8px;">
        <button type="button" class="btn btn-outline btn-sm" onclick="openFontSettingsModal()">🔤 ${isBn ? 'ফন্ট ও স্টাইল' : 'Font & Style'}</button>
        <button type="button" class="btn btn-outline btn-sm" onclick="state.currentTab='analytics'; render();">📊 ${isBn ? 'হিসাব ও রিপোর্ট' : 'Analytics'}</button>
      </div>
    </div>

    <!-- KPI Grid (Session-Isolated) -->
    <div class="kpi-grid">
      <div class="kpi-card kpi-sky">
        <div class="kpi-header"><span>${isBn ? 'মোট পণ্যের ধরন' : 'Product Types'}</span><span>📦</span></div>
        <div class="kpi-value tabular-nums">${totalTypes} <small style="font-size:0.9rem">${isBn ? 'টি' : 'items'}</small></div>
        <div class="kpi-subtext">${isBn ? 'উপলব্ধ:' : 'In stock:'} ${availableProducts.length} ${isBn ? 'টি' : ''}</div>
      </div>
      <div class="kpi-card kpi-teal">
        <div class="kpi-header"><span>${isBn ? 'মোট স্টক মজুদ' : 'Total Stock'}</span><span>📊</span></div>
        <div class="kpi-value tabular-nums">${totalStockUnits.toLocaleString()}</div>
        <div class="kpi-subtext">${isBn ? 'সকল আইটেম মিলিয়ে' : 'Across all items'}</div>
      </div>
      <div class="kpi-card kpi-violet">
        <div class="kpi-header"><span>${sessionDate === todayKey ? (isBn ? 'আজকের বিক্রি' : "Today's Sales") : (isBn ? 'সেশনের বিক্রি' : 'Session Sales')}</span><span>🧾</span></div>
        <div class="kpi-value tabular-nums">${totalSalesCount} <small style="font-size:0.9rem">${isBn ? 'বার' : 'txns'}</small></div>
        <div class="kpi-subtext">${sessionDate}</div>
      </div>
      <div class="kpi-card kpi-emerald">
        <div class="kpi-header"><span>${sessionDate === todayKey ? (isBn ? 'আজকের বিক্রয়মূল্য' : "Today's Revenue") : (isBn ? 'সেশনের বিক্রয়মূল্য' : 'Session Revenue')}</span><span>📈</span></div>
        <div class="kpi-value tabular-nums" style="color:var(--color-primary)">${formatTaka(totalRevenue)}</div>
        <div class="kpi-subtext">${isBn ? 'মোট ক্যাশ ও পাওনা' : 'Gross sales'}</div>
      </div>
      <div class="kpi-card kpi-indigo">
        <div class="kpi-header"><span>${sessionDate === todayKey ? (isBn ? 'আজকের নীট লাভ' : "Today's Profit") : (isBn ? 'সেশনের লাভ' : 'Session Profit')}</span><span>💰</span></div>
        <div class="kpi-value tabular-nums" style="color:#6366f1">${formatTaka(totalProfit)}</div>
        <div class="kpi-subtext">${totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) + '% ' + (isBn ? 'মার্জিন' : 'margin') : '0%'}</div>
      </div>
      <div class="kpi-card kpi-amber">
        <div class="kpi-header"><span>${isBn ? 'বাকি পাওনা টাকা' : 'Due Receivables'}</span><span>⚠️</span></div>
        <div class="kpi-value tabular-nums" style="color:${totalDue > 0 ? 'var(--color-warning)' : 'inherit'}">${formatTaka(totalDue)}</div>
        <div class="kpi-subtext">${lowStockCount > 0 ? lowStockCount + ' ' + (isBn ? 'আইটেমে কম স্টক' : 'items low') : (isBn ? 'স্টক সন্তোষজনক' : 'Healthy')}</div>
      </div>
    </div>

    <div class="pos-layout">
      <div class="panel">
        <div class="panel-header panel-header-gradient">
          <div class="panel-title">
            <span>🛒</span>
            <span>${isBn ? 'মাল্টি-প্রোডাক্ট সেলস এন্ট্রি (POS)' : 'Multi-Product Sale Entry (POS)'}</span>
          </div>
          <span style="font-size:0.9rem; font-weight:700; opacity:0.95">${state.cart.length > 0 ? (isBn ? 'কার্টে ' + state.cart.length + 'টি পণ্য' : state.cart.length + ' in cart') : (isBn ? 'স্বয়ংক্রিয় স্টক সমন্বয়' : 'Auto Stock Sync')}</span>
        </div>

        <div class="panel-body">
          <form id="pos-sale-form">
            <!-- Step 1: 10 Regular Customers Grid + Photo Settings -->
            <div class="pos-step-header">
              <div class="pos-step-title">
                <span class="step-badge">১</span>
                <span>${isBn ? 'নিয়মিত গ্রাহক নির্বাচন করুন' : 'Select Regular Customer'}</span>
              </div>
              <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
                <input type="text" class="form-control" style="width:160px; padding:7px 12px; font-size:0.9rem;" placeholder="${isBn ? 'গ্রাহক খুঁজুন...' : 'Search...'}" value="${state.customerSearchTerm}" oninput="handleCustomerSearch(this.value)" />
                <button type="button" class="btn btn-outline btn-sm" onclick="openCustomerSettingsModal()">
                  📷 ${isBn ? 'ছবি ও প্রোফাইল সেটিংস' : 'Edit Photos'}
                </button>
                <button type="button" class="btn btn-outline btn-sm" onclick="toggleAddCustomerForm()">
                  ${state.showAddCustomerForm ? '✕ ' + (isBn ? 'বন্ধ' : 'Close') : '+ ' + (isBn ? 'নতুন গ্রাহক' : 'Add')}
                </button>
              </div>
            </div>

            ${state.showAddCustomerForm ? `
              <div style="padding:14px; border:1px solid var(--color-primary-border); background:var(--color-primary-light); border-radius:12px; margin-bottom:14px;">
                <div class="grid-3 form-group">
                  <input type="text" id="new-cust-name" class="form-control" placeholder="${isBn ? 'গ্রাহকের নাম *' : 'Name *'}" />
                  <input type="text" id="new-cust-shop" class="form-control" placeholder="${isBn ? 'দোকানের নাম (ঐচ্ছিক)' : 'Shop Name (Optional)'}" />
                  <input type="text" id="new-cust-phone" class="form-control" placeholder="017xxxxxxxx" />
                </div>
                <button type="button" class="btn btn-primary btn-sm" onclick="saveNewCustomer()">${isBn ? 'গ্রাহক সংরক্ষণ ও সিলেক্ট করুন' : 'Save & Select'}</button>
              </div>
            ` : ''}

            <div class="customer-grid">
              ${filteredCustomers.map(function(c) {
                var isSelected = state.selectedCustomerId === c.id && state.posCustomerName === c.name;
                return `
                  <div class="customer-card ${isSelected ? 'selected' : ''}" onclick="selectRegularCustomer('${c.id}')">
                    <span class="customer-edit-badge" title="${isBn ? 'ছবি পরিবর্তন' : 'Edit Photo'}" onclick="event.stopPropagation(); openCustomerSettingsModal('${c.id}')">📷</span>
                    ${isSelected ? '<span class="customer-check-badge">✓</span>' : ''}
                    ${renderAvatarSvg(c)}
                    <div class="customer-name-text">${c.name}</div>
                  </div>
                `;
              }).join('')}
            </div>

            <div class="grid-2 form-group">
              <div>
                <label class="form-label">${isBn ? 'কাস্টমারের নাম' : 'Customer Name'} *</label>
                <input type="text" id="pos-customer-name" class="form-control" style="font-weight:700" value="${state.posCustomerName}" oninput="state.posCustomerName=this.value" required />
              </div>
              <div>
                <label class="form-label">${isBn ? 'মোবাইল নম্বর (ঐচ্ছিক)' : 'Phone Number (Optional)'}</label>
                <input type="text" id="pos-customer-phone" class="form-control font-mono" style="font-weight:700" value="${state.posCustomerPhone}" oninput="state.posCustomerPhone=this.value" placeholder="017xxxxxxxx" />
              </div>
            </div>

            <!-- Step 2: Category Tabs & Multi-Product Selection Grid -->
            <div style="border-top:1px solid var(--color-border); padding-top:20px; margin-top:20px;">
              <div class="pos-step-header">
                <div class="pos-step-title">
                  <span class="step-badge" style="background:#059669">২</span>
                  <span>${isBn ? 'একটির পর একটি পণ্য কার্টে যোগ করুন' : 'Click Products to Add to Cart'}</span>
                </div>
                <input type="text" class="form-control" style="width:195px; padding:7px 12px; font-size:0.9rem;" placeholder="${isBn ? 'পণ্য বা সাইজ খুঁজুন...' : 'Search product...'}" value="${state.posProductSearch}" oninput="handlePosProductSearch(this.value)" />
              </div>

              <div class="chip-group">
                ${CATEGORIES.map(function(c) {
                  return '<button type="button" class="chip ' + (state.posCategoryFilter === c ? 'active' : '') + '" onclick="setPosCategory(\'' + c + '\')">' + c + '</button>';
                }).join('')}
              </div>

              <div class="product-grid">
                ${filteredPosProducts.length === 0
                  ? '<div style="grid-column:1/-1; text-align:center; padding:24px; color:var(--color-text-subtle)">' + (isBn ? 'এই ক্যাটাগরিতে উপলব্ধ পণ্য নেই' : 'No available stock') + '</div>'
                  : filteredPosProducts.map(function(p) {
                      var cartEntry = state.cart.find(function(item) { return item.productId === p.id; });
                      var inCartQty = cartEntry ? cartEntry.quantity : 0;
                      return `
                        <button type="button" class="product-card ${getCategoryCardClass(p.category)} ${inCartQty > 0 ? 'selected' : ''}" title="${inCartQty > 0 ? (isBn ? 'কার্ট থেকে সরাতে আবার ক্লিক করুন' : 'Click again to remove') : (isBn ? 'কার্টে যোগ করতে ক্লিক করুন' : 'Click to add')}" onclick="addToCart(${p.id})">
                          <div style="display:flex; justify-content:space-between; align-items:center; gap:6px;">
                            <span class="product-card-cat">${p.category}</span>
                            ${inCartQty > 0 ? '<span class="in-cart-pill">✓ ' + inCartQty + ' ' + p.unit + '</span>' : '<span style="font-weight:800; opacity:0.6;">+</span>'}
                          </div>
                          <div class="product-card-title">${cleanProductTitle(p.name)}</div>
                          <div class="product-card-footer">
                            <span class="font-mono" style="font-weight:800; font-size:1.15rem; color:var(--color-primary)">৳${p.sell_price}<small style="font-size:0.8rem; color:var(--color-text-subtle)">/${p.unit}</small></span>
                            <span class="font-mono" style="font-size:0.9rem; font-weight:700">${p.stock} ${p.unit}</span>
                          </div>
                        </button>
                      `;
                    }).join('')}
              </div>
            </div>

            <!-- Step 3: Active Multi-Product Cart & Flexible Quantity Controls -->
            <div style="border-top:1px solid var(--color-border); padding-top:20px; margin-top:14px;">
              <div class="pos-step-header">
                <div class="pos-step-title">
                  <span class="step-badge" style="background:#d97706">৩</span>
                  <span>${isBn ? 'সক্রিয় কার্ট ও পরিমাণ নিয়ন্ত্রণ' : 'Active Cart & Quantity Controls'}</span>
                </div>
                ${state.cart.length > 0 ? '<button type="button" class="btn btn-outline btn-sm" style="color:var(--color-danger)" onclick="clearPosCart()">🗑️ ' + (isBn ? 'কার্ট খালি করুন' : 'Clear Cart') + '</button>' : ''}
              </div>

              <div id="pos-cart-container"></div>
            </div>

            <!-- Step 4: Payment & Checkout -->
            <div style="border-top:1px solid var(--color-border); padding-top:20px; margin-top:14px;">
              <div class="pos-step-header">
                <div class="pos-step-title">
                  <span class="step-badge" style="background:#0d9488">৪</span>
                  <span>${isBn ? 'পেমেন্ট ও চালান চূড়ান্ত করুন' : 'Payment & Checkout'}</span>
                </div>
              </div>

              <div class="grid-3 form-group">
                <div>
                  <label class="form-label">${isBn ? 'পেমেন্ট মাধ্যম' : 'Payment Method'}</label>
                  <select id="pos-payment-method" class="form-control" onchange="state.posPaymentMethod=this.value; updatePosCalculations()">
                    <option value="ক্যাশ (Cash)" ${state.posPaymentMethod === 'ক্যাশ (Cash)' ? 'selected' : ''}>ক্যাশ (Cash)</option>
                    <option value="বিকাশ (bKash)" ${state.posPaymentMethod === 'বিকাশ (bKash)' ? 'selected' : ''}>বিকাশ (bKash)</option>
                    <option value="নগদ (Nagad)" ${state.posPaymentMethod === 'নগদ (Nagad)' ? 'selected' : ''}>নগদ (Nagad)</option>
                    <option value="ব্যাংক (Bank)" ${state.posPaymentMethod === 'ব্যাংক (Bank)' ? 'selected' : ''}>ব্যাংক (Bank)</option>
                    <option value="বাকি (Due)" ${state.posPaymentMethod === 'বাকি (Due)' ? 'selected' : ''}>বাকি (Due)</option>
                  </select>
                </div>
                <div>
                  <label class="form-label">${isBn ? 'ছাড় / ডিসকাউন্ট (৳)' : 'Discount (৳)'}</label>
                  <input type="number" id="pos-discount" class="form-control font-mono" value="${state.posDiscount || ''}" placeholder="0" min="0" oninput="state.posDiscount=parseFloat(this.value)||0; updatePosCalculations()" />
                </div>
                <div>
                  <label class="form-label">${isBn ? 'পরিশোধিত টাকা (৳)' : 'Paid Amount (৳)'}</label>
                  <input type="number" id="pos-paid" class="form-control font-mono" value="${state.posPaidAmount}" placeholder="${isBn ? 'পূর্ণ টাকা' : 'Full amount'}" oninput="state.posPaidAmount=this.value; updatePosCalculations()" />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">${isBn ? 'চালানের বিবরণ বা নোট (ঐচ্ছিক)' : 'Memo Note (Optional)'}</label>
                <input type="text" id="pos-note" class="form-control" value="${state.posNote}" oninput="state.posNote=this.value" placeholder="${isBn ? 'যেমন: আড়তে ডেলিভারি দেওয়া হয়েছে' : 'Delivery details...'}" />
              </div>

              <button type="submit" class="btn btn-primary" style="width:100%; padding:15px; font-size:1.1rem; font-weight:800;">
                <span>✓</span>
                <span>${isBn ? 'বিক্রি নিশ্চিত করুন ও মেমো তৈরি করুন' : 'Confirm Sale & Generate Memo'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Right Sidebar: Real-time Cart Summary -->
      <div style="position:sticky; top:90px;">
        <div class="panel" style="margin-bottom:20px;">
          <div class="panel-header panel-header-indigo">
            <span class="panel-title">${isBn ? 'লাইভ কার্ট ও হিসাব সামারি' : 'Live Cart Summary'}</span>
            <span id="summary-item-badge" style="font-size:0.85rem; font-weight:800; background:rgba(255,255,255,0.22); padding:4px 10px; border-radius:10px;"></span>
          </div>
          <div class="panel-body" id="pos-calculations-box"></div>
        </div>

        <div class="panel">
          <div class="panel-header">
            <span class="panel-title">${isBn ? 'জনপ্রিয় আইটেম স্টক' : 'Popular Items Stock'}</span>
          </div>
          <div class="panel-body" style="padding:12px 18px;">
            ${state.products.slice(0, 6).map(function(p) {
              return `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid var(--color-border-subtle); font-size:0.95rem;">
                  <div>
                    <div style="font-weight:700">${cleanProductTitle(p.name)}</div>
                    <div style="color:var(--color-text-subtle); font-size:0.85rem">৳${p.sell_price} / ${p.unit}</div>
                  </div>
                  <div class="text-right">
                    <div class="font-mono" style="font-weight:800; color:${p.stock === 0 ? 'var(--color-danger)' : (p.stock < 20 ? 'var(--color-warning)' : 'var(--color-primary)')}">
                      ${p.stock} ${p.unit}
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    </div>

    <div class="panel" style="margin-top:24px;">
      <div class="panel-header" style="flex-wrap:wrap; gap:8px;">
        <div>
          <span class="panel-title">${sessionDate === todayKey ? (isBn ? 'আজকের বিক্রয়সমূহ (পৃথক সেশন)' : "Today's Sales (Isolated)") : (sessionDate + ' ' + (isBn ? 'তারিখের বিক্রয়সমূহ' : 'Sales'))}</span>
          <div style="font-size:0.85rem; color:var(--color-text-subtle); font-weight:600;">${isBn ? 'পূর্বের বা অন্য দিনের হিসাব এখানে মিশবে না' : 'Isolated by date'}</div>
        </div>
        <span style="font-size:0.9rem; font-weight:700; color:var(--color-text-subtle)">${isBn ? 'এই সেশনে মোট ' + sessionSales.length + 'টি বিক্রি' : sessionSales.length + ' sales in session'}</span>
      </div>
      ${sessionSales.length === 0 ? `
        <div style="padding:32px; text-align:center; color:var(--color-text-muted); font-weight:700;">
          ${sessionDate === todayKey ? (isBn ? 'আজকের তারিখে এখনো কোনো বিক্রি রেকর্ড হয়নি।' : 'No sales recorded today yet.') : (isBn ? sessionDate + ' তারিখে কোনো বিক্রি নেই।' : 'No sales on ' + sessionDate)}
        </div>
      ` : `
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>${isBn ? 'মেমো নং' : 'Memo'}</th>
                <th>${isBn ? 'তারিখ ও সময়' : 'Date'}</th>
                <th>${isBn ? 'কাস্টমার' : 'Customer'}</th>
                <th>${isBn ? 'পণ্য ও পরিমাণ' : 'Products & Qty'}</th>
                <th class="text-right">${isBn ? 'মোট টাকা' : 'Total'}</th>
                <th class="text-right">${isBn ? 'লাভ' : 'Profit'}</th>
                <th class="text-center">${isBn ? 'পেমেন্ট' : 'Payment'}</th>
                <th class="text-center">${isBn ? 'রসিদ' : 'Receipt'}</th>
              </tr>
            </thead>
            <tbody>
              ${sessionSales.slice(0, 10).map(function(sale) {
                var itemsText = (sale.items || []).map(function(it) {
                  return cleanProductTitle(it.productName) + ' (' + it.quantity + ' ' + it.unit + ')';
                }).join(', ');
                return `
                  <tr>
                    <td class="font-mono" style="font-weight:800">${sale.memoNo}</td>
                    <td style="color:var(--color-text-subtle)">${sale.date}</td>
                    <td style="font-weight:700">${sale.customerName}</td>
                    <td>${itemsText || '-'}</td>
                    <td class="text-right font-mono" style="font-weight:800">${formatTaka(sale.netPayable)}</td>
                    <td class="text-right font-mono" style="font-weight:800; color:var(--color-primary)">${formatTaka(sale.profit)}</td>
                    <td class="text-center">
                      <div>${sale.paymentMethod}</div>
                      ${sale.dueAmount > 0 ? '<div style="color:var(--color-danger); font-size:0.85rem; font-weight:700">বাকি: ৳' + sale.dueAmount + '</div>' : ''}
                    </td>
                    <td class="text-center">
                      <button class="btn btn-outline btn-sm" onclick="showInvoiceModal('${sale.id}')">👁️ ${isBn ? 'মেমো' : 'Memo'}</button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `}
    </div>
  `;

  var form = document.getElementById('pos-sale-form');
  if (form) form.onsubmit = handlePosSubmit;
  renderCartSection();
}

window.handleCustomerSearch = function(val) {
  state.customerSearchTerm = val;
  renderDashboard(document.getElementById('app-main-content'));
};

window.toggleAddCustomerForm = function() {
  state.showAddCustomerForm = !state.showAddCustomerForm;
  renderDashboard(document.getElementById('app-main-content'));
};

window.saveNewCustomer = function() {
  var name = document.getElementById('new-cust-name').value.trim();
  var shop = document.getElementById('new-cust-shop').value.trim();
  var phone = document.getElementById('new-cust-phone').value.trim();
  if (!name) return;
  var colors = ['#059669', '#4f46e5', '#d97706', '#0891b2', '#e11d48'];
  var cust = {
    id: 'cust_' + Date.now(),
    name: name,
    shopName: shop || 'নিয়মিত ক্রেতা',
    phone: phone || '',
    shirtColor: colors[state.customers.length % colors.length],
    skinTone: '#d99b72',
    hairColor: '#1e293b',
  };
  state.customers.unshift(cust);
  saveLocalCustomers();
  state.selectedCustomerId = cust.id;
  state.posCustomerName = cust.name;
  state.posCustomerPhone = cust.phone;
  state.showAddCustomerForm = false;
  renderDashboard(document.getElementById('app-main-content'));
};

window.selectRegularCustomer = function(custId) {
  var cust = state.customers.find(function(c) { return c.id === custId; });
  if (!cust) return;
  state.selectedCustomerId = cust.id;
  state.posCustomerName = cust.name;
  state.posCustomerPhone = cust.phone;
  renderDashboard(document.getElementById('app-main-content'));
};

window.setPosCategory = function(cat) {
  state.posCategoryFilter = cat;
  renderDashboard(document.getElementById('app-main-content'));
};

window.handlePosProductSearch = function(val) {
  state.posProductSearch = val;
  renderDashboard(document.getElementById('app-main-content'));
};

window.addToCart = function(prodId) {
  var prod = state.products.find(function(p) { return p.id === prodId; });
  if (!prod || prod.stock <= 0) return;
  var existingIdx = state.cart.findIndex(function(item) { return item.productId === prodId; });
  if (existingIdx !== -1) {
    state.cart.splice(existingIdx, 1);
  } else {
    state.cart.push({ productId: prodId, quantity: 1, customRate: null });
  }
  renderDashboard(document.getElementById('app-main-content'));
};

window.adjustCartQty = function(prodId, delta) {
  var prod = state.products.find(function(p) { return p.id === prodId; });
  var item = state.cart.find(function(c) { return c.productId === prodId; });
  if (!prod || !item) return;
  var nextVal = Math.max(1, Math.min(prod.stock, Number(((item.quantity || 1) + delta).toFixed(2))));
  item.quantity = nextVal;
  renderCartSection();
};

window.setCartQtyDirect = function(prodId, rawVal) {
  var prod = state.products.find(function(p) { return p.id === prodId; });
  var item = state.cart.find(function(c) { return c.productId === prodId; });
  if (!prod || !item) return;
  if (rawVal === '') {
    item.quantity = 0;
  } else {
    var parsed = parseFloat(rawVal);
    item.quantity = isNaN(parsed) ? 0 : Math.max(0, Math.min(prod.stock, parsed));
  }
  updatePosCalculations();
};

window.setCartRateDirect = function(prodId, rawVal) {
  var item = state.cart.find(function(c) { return c.productId === prodId; });
  if (!item) return;
  if (rawVal.trim() === '') {
    item.customRate = null;
  } else {
    var parsed = parseFloat(rawVal);
    item.customRate = isNaN(parsed) ? null : Math.max(0, parsed);
  }
  updatePosCalculations();
};

window.removeFromCart = function(prodId) {
  state.cart = state.cart.filter(function(c) { return c.productId !== prodId; });
  renderDashboard(document.getElementById('app-main-content'));
};

window.clearPosCart = function() {
  state.cart = [];
  state.posDiscount = 0;
  state.posPaidAmount = '';
  renderDashboard(document.getElementById('app-main-content'));
};

window.renderCartSection = function() {
  var container = document.getElementById('pos-cart-container');
  var isBn = state.lang === 'bn';
  if (!container) { updatePosCalculations(); return; }

  if (state.cart.length === 0) {
    container.innerHTML = '<div class="cart-empty-box">' + (isBn ? 'এখনো কোনো পণ্য কার্টে যোগ করা হয়নি — উপরের তালিকা থেকে পণ্যের কার্ডে ক্লিক করুন' : 'Cart is empty — click any product card above to add') + '</div>';
    updatePosCalculations();
    return;
  }

  container.innerHTML = '<div class="cart-list">' + state.cart.map(function(item, idx) {
    var prod = state.products.find(function(p) { return p.id === item.productId; });
    if (!prod) return '';
    var rate = item.customRate !== null && item.customRate !== undefined ? item.customRate : prod.sell_price;
    var lineTotal = (item.quantity || 0) * rate;
    var lineProfit = lineTotal - ((item.quantity || 0) * prod.buy_price);
    return `
      <div class="cart-item-row">
        <div class="cart-item-top">
          <div>
            <div style="font-size:1.05rem; font-weight:800;">#${idx + 1} ${cleanProductTitle(prod.name)} <span style="font-size:0.85rem; color:var(--color-text-subtle); font-weight:700;">(${prod.category})</span></div>
            <div style="font-size:0.875rem; color:var(--color-text-muted); font-weight:600;">${isBn ? 'স্টকে মজুদ:' : 'In stock:'} <strong class="font-mono">${prod.stock} ${prod.unit}</strong> · ${isBn ? 'ক্রয়:' : 'Buy:'} ৳${prod.buy_price}</div>
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
              <label class="form-label" style="margin:0">${isBn ? 'পরিমাণ' : 'Quantity'} (${prod.unit})</label>
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
      </div>
    `;
  }).join('') + '</div>';

  updatePosCalculations();
};

window.updatePosCalculations = function() {
  var calcBox = document.getElementById('pos-calculations-box');
  var itemBadge = document.getElementById('summary-item-badge');
  var isBn = state.lang === 'bn';
  if (itemBadge) itemBadge.textContent = state.cart.length + ' ' + (isBn ? 'টি পণ্য' : 'items');
  if (!calcBox) return;

  var totalAmount = 0;
  var totalCost = 0;
  var unitTotals = {};
  var summaryRowsHtml = '';

  state.cart.forEach(function(item) {
    var prod = state.products.find(function(p) { return p.id === item.productId; });
    if (!prod) return;
    var qty = Math.max(0, item.quantity || 0);
    var rate = item.customRate !== null && item.customRate !== undefined ? item.customRate : prod.sell_price;
    var lineTotal = qty * rate;
    var lineCost = qty * prod.buy_price;
    totalAmount += lineTotal;
    totalCost += lineCost;
    unitTotals[prod.unit] = (unitTotals[prod.unit] || 0) + qty;

    var lineTotalEl = document.getElementById('cart-line-total-' + prod.id);
    var lineProfitEl = document.getElementById('cart-line-profit-' + prod.id);
    if (lineTotalEl) lineTotalEl.textContent = formatTaka(lineTotal);
    if (lineProfitEl) lineProfitEl.textContent = (isBn ? 'লাভ: ' : 'Profit: ') + formatTaka(lineTotal - lineCost);

    summaryRowsHtml += '<div class="summary-cart-row"><div style="min-width:0"><div style="font-weight:700">' + cleanProductTitle(prod.name) + '</div><div class="font-mono" style="font-size:0.82rem; color:var(--color-text-subtle)">' + qty + ' ' + prod.unit + ' × ৳' + rate + '</div></div><div class="font-mono" style="font-weight:800">' + formatTaka(lineTotal) + '</div></div>';
  });

  var unitBreakdown = Object.keys(unitTotals).map(function(u) {
    return (Math.round(unitTotals[u] * 100) / 100) + ' ' + u;
  }).join(' + ');

  var discount = Number(state.posDiscount) || 0;
  var netPayable = Math.max(0, totalAmount - discount);
  var paid = state.posPaidAmount !== '' && !isNaN(Number(state.posPaidAmount))
    ? Number(state.posPaidAmount)
    : (state.posPaymentMethod === 'বাকি (Due)' ? 0 : netPayable);
  var due = Math.max(0, netPayable - paid);
  var profit = netPayable - totalCost;
  var marginPct = netPayable > 0 ? ((profit / netPayable) * 100).toFixed(1) : '0';

  calcBox.innerHTML = `
    ${state.cart.length === 0
      ? '<div style="padding:14px; text-align:center; border:1px dashed var(--color-border); border-radius:10px; color:var(--color-text-subtle); margin-bottom:14px; font-weight:600;">' + (isBn ? 'কার্টে পণ্য যোগ করলে এখানে রিয়েল-টাইম হিসাব দেখাবে' : 'Add products to see real-time summary') + '</div>'
      : '<div class="summary-cart-items">' + summaryRowsHtml + '</div>'}
    <div class="calc-row">
      <span>${isBn ? 'মোট পরিমাণ:' : 'Total Qty:'}</span>
      <span class="font-mono tabular-nums" style="font-weight:800; color:var(--color-text-main)">${unitBreakdown || '0'}</span>
    </div>
    <div class="calc-row">
      <span>${isBn ? 'মোট বিক্রয়মূল্য:' : 'Subtotal:'}</span>
      <span class="font-mono tabular-nums" style="font-weight:800; color:var(--color-text-main)">${formatTaka(totalAmount)}</span>
    </div>
    ${discount > 0 ? `<div class="calc-row" style="color:var(--color-danger)"><span>${isBn ? 'ছাড়:' : 'Discount:'}</span><span class="font-mono">- ${formatTaka(discount)}</span></div>` : ''}
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
        <div style="font-weight:800; font-size:0.95rem;">${isBn ? 'সম্ভাব্য নীট লাভ:' : 'Net Profit:'}</div>
        <div style="font-size:0.85rem; font-weight:700; color:var(--color-primary)">${marginPct}% ${isBn ? 'প্রফিট মার্জিন' : 'margin'}</div>
      </div>
      <div class="font-mono" style="font-size:1.35rem; font-weight:800; color:var(--color-primary)">${formatTaka(profit)}</div>
    </div>
    ${due > 0 ? `
      <div class="due-warning-box">
        <span style="font-size:0.9rem; font-weight:800;">${isBn ? 'বাকি থাকবে (Due):' : 'Due Balance:'}</span>
        <span class="font-mono" style="font-weight:800; color:var(--color-warning)">${formatTaka(due)}</span>
      </div>
    ` : ''}
    <button type="button" class="btn btn-primary" style="width:100%; margin-top:14px; padding:12px; font-weight:800;" ${state.cart.length === 0 ? 'disabled' : ''} onclick="handlePosSubmit()">
      ✓ ${isBn ? 'বিক্রি সাবমিট ও মেমো' : 'Submit Sale & Memo'}
    </button>
  `;
};

async function handlePosSubmit(e) {
  if (e && e.preventDefault) e.preventDefault();
  var isBn = state.lang === 'bn';
  var customerName = (document.getElementById('pos-customer-name')?.value || state.posCustomerName || '').trim();
  var customerPhone = (document.getElementById('pos-customer-phone')?.value || state.posCustomerPhone || '').trim();

  if (!customerName) { alert(isBn ? 'দয়া করে কাস্টমারের নাম লিখুন!' : 'Please enter customer name!'); return; }
  if (state.cart.length === 0) { alert(isBn ? 'কার্টে কোনো পণ্য নেই! উপরের তালিকা থেকে পণ্য সিলেক্ট করুন।' : 'Cart is empty!'); return; }

  var saleItems = [];
  var totalAmount = 0;
  var totalCost = 0;

  for (var i = 0; i < state.cart.length; i++) {
    var cartItem = state.cart[i];
    var prod = state.products.find(function(p) { return p.id === cartItem.productId; });
    if (!prod) continue;
    var qty = Number(cartItem.quantity) || 0;
    if (qty <= 0) { alert(isBn ? '"' + cleanProductTitle(prod.name) + '"-এর পরিমাণ ০ এর বেশি হতে হবে!' : 'Quantity must be > 0!'); return; }
    if (qty > prod.stock) { alert(isBn ? '"' + cleanProductTitle(prod.name) + '" অপর্যাপ্ত স্টক! মজুদ: ' + prod.stock + ' ' + prod.unit : 'Insufficient stock!'); return; }
    var rate = cartItem.customRate !== null && cartItem.customRate !== undefined ? cartItem.customRate : prod.sell_price;
    var itemTotal = qty * rate;
    var itemCost = qty * prod.buy_price;
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

  var discount = Number(state.posDiscount) || 0;
  var netPayable = Math.max(0, totalAmount - discount);
  var paid = state.posPaidAmount !== '' && !isNaN(Number(state.posPaidAmount))
    ? Number(state.posPaidAmount)
    : (state.posPaymentMethod === 'বাকি (Due)' ? 0 : netPayable);
  var due = Math.max(0, netPayable - paid);
  var profit = netPayable - totalCost;

  var saleRecord = {
    id: 'sale_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    memoNo: generateMemoNo(),
    customerName: customerName,
    customerPhone: customerPhone || '',
    items: saleItems,
    totalAmount: totalAmount,
    totalCost: totalCost,
    profit: profit,
    discount: discount,
    netPayable: netPayable,
    paidAmount: paid,
    dueAmount: due,
    paymentMethod: state.posPaymentMethod,
    date: getLocalDateTimeForDate(state.sessionDate),
    note: (state.posNote || '').trim(),
  };

  var insertRes = await insertSaleToDb(saleRecord);
  if (!insertRes.ok) {
    state.syncMessage = insertRes.error || 'Supabase-এ বিক্রি সংরক্ষণ করা যায়নি!';
    alert((isBn ? 'বিক্রি সংরক্ষণ ব্যর্থ হয়েছে: ' : 'Failed to save sale: ') + state.syncMessage);
    render();
    return;
  }

  for (var j = 0; j < saleItems.length; j++) {
    var sold = saleItems[j];
    var pObj = state.products.find(function(p) { return p.id === sold.productId; });
    if (pObj) {
      pObj.stock = Math.max(0, Number((pObj.stock - sold.quantity).toFixed(2)));
      await updateProductStockInDb(pObj.id, pObj.stock);
    }
  }

  state.sales.unshift(saleRecord);
  saveLocalSales();

  state.cart = [];
  state.posDiscount = 0;
  state.posPaidAmount = '';
  state.posNote = '';

  render();
  showInvoiceModal(saleRecord.id);
}

// ----------------- CUSTOMER PROFILE & PHOTO SETTINGS MODAL -----------------
window.openCustomerSettingsModal = function(targetCustId) {
  var overlay = document.getElementById('customer-settings-modal-overlay');
  if (!overlay) return;
  if (targetCustId) state.editingCustomerId = targetCustId;
  renderCustomerSettingsModal();
  overlay.classList.add('active');
};

window.closeCustomerSettingsModal = function() {
  state.editingCustomerId = null;
  document.getElementById('customer-settings-modal-overlay')?.classList.remove('active');
  render();
};

// ----------------- FONT CUSTOMIZATION MODAL -----------------
window.openFontSettingsModal = function() {
  var overlay = document.getElementById('font-settings-modal-overlay');
  if (!overlay) return;
  renderFontSettingsModal();
  overlay.classList.add('active');
};

window.closeFontSettingsModal = function() {
  document.getElementById('font-settings-modal-overlay')?.classList.remove('active');
  render();
};

window.updateTypographyField = function(field, value) {
  state.typography[field] = value;
  applyTypographySettings(state.typography);
  try { localStorage.setItem(STORAGE_KEYS.TYPOGRAPHY, JSON.stringify(state.typography)); } catch (e) {}
  renderFontSettingsModal();
};

window.resetTypographyDefault = function() {
  state.typography = Object.assign({}, DEFAULT_TYPOGRAPHY);
  applyTypographySettings(state.typography);
  try { localStorage.setItem(STORAGE_KEYS.TYPOGRAPHY, JSON.stringify(state.typography)); } catch (e) {}
  renderFontSettingsModal();
};

window.renderFontSettingsModal = function() {
  var body = document.getElementById('font-settings-body');
  if (!body) return;
  var t = state.typography || DEFAULT_TYPOGRAPHY;
  var isBn = state.lang === 'bn';
  body.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:18px;">
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
    </div>
  `;
};

window.renderCustomerSettingsModal = function() {
  var body = document.getElementById('customer-settings-body');
  if (!body) return;
  var isBn = state.lang === 'bn';

  body.innerHTML = '<div class="customer-settings-grid">' + state.customers.map(function(c) {
    var isEditing = state.editingCustomerId === c.id;
    return `
      <div class="customer-settings-card">
        <div>${renderAvatarSvg(c, 64)}</div>
        <div style="flex:1; min-width:0;">
          ${isEditing ? `
            <input type="text" id="edit-cust-name-${c.id}" class="form-control" style="margin-bottom:6px; padding:6px 10px;" value="${c.name}" />
            <input type="text" id="edit-cust-shop-${c.id}" class="form-control" style="margin-bottom:6px; padding:6px 10px;" value="${c.shopName}" />
            <input type="text" id="edit-cust-phone-${c.id}" class="form-control font-mono" style="margin-bottom:8px; padding:6px 10px;" value="${c.phone || ''}" />
            <div style="display:flex; gap:6px;">
              <button type="button" class="btn btn-primary btn-sm" onclick="saveCustomerProfileEdit('${c.id}')">${isBn ? 'সংরক্ষণ' : 'Save'}</button>
              <button type="button" class="btn btn-outline btn-sm" onclick="state.editingCustomerId=null; renderCustomerSettingsModal()">${isBn ? 'বাতিল' : 'Cancel'}</button>
            </div>
          ` : `
            <div style="font-size:1.05rem; font-weight:800;">${c.name}</div>
            <div style="font-size:0.875rem; color:var(--color-text-muted); font-weight:600;">${c.shopName}</div>
            <div class="font-mono" style="font-size:0.85rem; color:var(--color-text-subtle); margin-bottom:10px;">${c.phone || ''}</div>
            <div style="display:flex; flex-wrap:wrap; gap:6px;">
              <label class="btn btn-outline btn-sm" style="cursor:pointer;">
                📷 ${c.customPhoto ? (isBn ? 'ছবি বদলান' : 'Change') : (isBn ? 'ছবি আপলোড' : 'Upload')}
                <input type="file" accept="image/*" style="display:none" onchange="uploadCustomerPhoto('${c.id}', this)" />
              </label>
              ${c.customPhoto ? '<button type="button" class="btn btn-outline btn-sm" onclick="resetCustomerPhoto(\'' + c.id + '\')">↩️ ' + (isBn ? 'অবতার' : 'Avatar') + '</button>' : ''}
              <button type="button" class="btn btn-outline btn-sm" onclick="state.editingCustomerId='${c.id}'; renderCustomerSettingsModal()">✏️ ${isBn ? 'এডিট' : 'Edit'}</button>
            </div>
          `}
        </div>
      </div>
    `;
  }).join('') + '</div>';
};

window.uploadCustomerPhoto = function(custId, inputEl) {
  var file = inputEl.files && inputEl.files[0];
  if (!file) return;
  compressImageFile(file, 260, function(dataUrl) {
    var cust = state.customers.find(function(c) { return c.id === custId; });
    if (cust) {
      cust.customPhoto = dataUrl;
      saveLocalCustomers();
      renderCustomerSettingsModal();
    }
  });
};

window.resetCustomerPhoto = function(custId) {
  var cust = state.customers.find(function(c) { return c.id === custId; });
  if (cust) {
    delete cust.customPhoto;
    saveLocalCustomers();
    renderCustomerSettingsModal();
  }
};

window.saveCustomerProfileEdit = function(custId) {
  var cust = state.customers.find(function(c) { return c.id === custId; });
  if (!cust) return;
  var n = document.getElementById('edit-cust-name-' + custId).value.trim();
  var s = document.getElementById('edit-cust-shop-' + custId).value.trim();
  var p = document.getElementById('edit-cust-phone-' + custId).value.trim();
  if (!n) return;
  cust.name = n;
  cust.shopName = s || 'নিয়মিত ক্রেতা';
  cust.phone = p;
  saveLocalCustomers();
  state.editingCustomerId = null;
  renderCustomerSettingsModal();
};

window.resetCustomersDefault = function() {
  if (confirm('সব গ্রাহকের ছবি ও তথ্য প্রাথমিক ১০ জন নিয়মিত গ্রাহকের তালিকা অনুযায়ী রিসেট করতে চান?')) {
    state.customers = JSON.parse(JSON.stringify(INITIAL_REGULAR_CUSTOMERS));
    saveLocalCustomers();
    renderCustomerSettingsModal();
  }
};

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
    <div class="kpi-grid">
      <div class="kpi-card kpi-sky"><div class="kpi-header"><span>${isBn ? 'মোট ক্রয়মূল্য' : 'Total Stock Cost'}</span></div><div class="kpi-value tabular-nums">${formatTaka(totalCostVal)}</div></div>
      <div class="kpi-card kpi-emerald"><div class="kpi-header"><span>${isBn ? 'মোট বিক্রয়মূল্য' : 'Retail Value'}</span></div><div class="kpi-value tabular-nums" style="color:var(--color-primary)">${formatTaka(totalRetailVal)}</div></div>
      <div class="kpi-card kpi-indigo"><div class="kpi-header"><span>${isBn ? 'সম্ভাব্য মোট লাভ' : 'Potential Profit'}</span></div><div class="kpi-value tabular-nums" style="color:#6366f1">${formatTaka(totalPotentialProfit)}</div></div>
      <div class="kpi-card kpi-amber"><div class="kpi-header"><span>${isBn ? 'মজুদ অবস্থা' : 'Stock Health'}</span></div><div class="kpi-value tabular-nums">${inStockCount} / <span style="color:var(--color-danger)">${outOfStockCount}</span></div></div>
    </div>
    <div class="panel">
      <div class="panel-header" style="flex-wrap:wrap; gap:10px;">
        <input type="text" class="form-control" style="max-width:340px;" placeholder="${isBn ? 'পণ্যের নাম বা সাইজ খুঁজুন...' : 'Search product...'}" value="${state.productSearchTerm}" oninput="handleProductSearch(this.value)" />
        <div style="display:flex; gap:8px;">
          <button class="btn btn-outline" onclick="exportProductsCSV()">📥 ${isBn ? 'CSV ডাউনলোড' : 'Export CSV'}</button>
          <button class="btn btn-primary" onclick="showProductModal(null)">+ ${isBn ? 'নতুন পণ্য' : 'Add Product'}</button>
        </div>
      </div>
      <div style="padding:12px 20px; border-bottom:1px solid var(--color-border); display:flex; flex-wrap:wrap; justify-content:space-between; gap:10px;">
        <div class="chip-group" style="margin:0">
          ${CATEGORIES.map(function(c) {
            return '<button class="chip ' + (state.productCategoryFilter === c ? 'active' : '') + '" onclick="setProductCategoryFilter(\'' + c + '\')">' + c + '</button>';
          }).join('')}
        </div>
        <div style="display:flex; gap:6px;">
          <button class="chip ${state.productStockFilter === 'all' ? 'active' : ''}" onclick="setProductStockFilter('all')">${isBn ? 'সব' : 'All'}</button>
          <button class="chip ${state.productStockFilter === 'in_stock' ? 'active' : ''}" onclick="setProductStockFilter('in_stock')">${isBn ? 'উপলব্ধ' : 'In Stock'}</button>
          <button class="chip ${state.productStockFilter === 'out_of_stock' ? 'active' : ''}" onclick="setProductStockFilter('out_of_stock')">${isBn ? 'স্টক শেষ' : 'Empty'}</button>
        </div>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th class="text-center">ID</th>
              <th>${isBn ? 'পণ্যের নাম' : 'Name'}</th>
              <th>${isBn ? 'ক্যাটাগরি' : 'Category'}</th>
              <th class="text-right">${isBn ? 'ক্রয়মূল্য' : 'Buy'}</th>
              <th class="text-right">${isBn ? 'বিক্রয়মূল্য' : 'Sell'}</th>
              <th class="text-center">${isBn ? 'স্টক' : 'Stock'}</th>
              <th class="text-center">${isBn ? 'স্ট্যাটাস' : 'Status'}</th>
              <th class="text-right">${isBn ? 'অ্যাকশন' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map(function(p) {
              var isZero = p.stock === 0;
              var isLow = p.stock > 0 && p.stock <= (p.minStockAlert || 15);
              return `
                <tr>
                  <td class="text-center font-mono">${p.id}</td>
                  <td style="font-weight:700">${cleanProductTitle(p.name)}</td>
                  <td>${p.category}</td>
                  <td class="text-right font-mono">৳${p.buy_price}</td>
                  <td class="text-right font-mono" style="font-weight:700">৳${p.sell_price}</td>
                  <td class="text-center font-mono" style="font-weight:800">${p.stock} ${p.unit}</td>
                  <td class="text-center">
                    ${isZero ? '<span class="status-pill status-out-stock">' + (isBn ? 'স্টক শেষ' : 'Out') + '</span>' :
                      (isLow ? '<span class="status-pill status-low-stock">' + (isBn ? 'কম স্টক' : 'Low') + '</span>' :
                      '<span class="status-pill status-in-stock">' + (isBn ? 'উপলব্ধ' : 'In Stock') + '</span>')}
                  </td>
                  <td class="text-right">
                    <div style="display:inline-flex; gap:6px;">
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

window.handleProductSearch = function(val) { state.productSearchTerm = val; renderProducts(document.getElementById('app-main-content')); };
window.setProductCategoryFilter = function(cat) { state.productCategoryFilter = cat; renderProducts(document.getElementById('app-main-content')); };
window.setProductStockFilter = function(f) { state.productStockFilter = f; renderProducts(document.getElementById('app-main-content')); };
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
  if (confirm(isBn ? 'আপনি কি "' + prod.name + '" মুছে ফেলতে চান?' : 'Delete product?')) {
    state.products = state.products.filter(function(p) { return p.id !== prodId; });
    await deleteProductFromDb(prodId);
    render();
  }
};
window.exportProductsCSV = function() {
  var headers = ['ID', 'Name', 'Category', 'Buy Price', 'Sell Price', 'Unit', 'Stock'];
  var rows = state.products.map(function(p) { return [p.id, '"' + p.name + '"', '"' + p.category + '"', p.buy_price, p.sell_price, p.unit, p.stock]; });
  var csv = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(function(r) { return r.join(','); })].join('\n');
  var a = document.createElement('a'); a.href = encodeURI(csv); a.download = 'agri_products.csv';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
};

// ----------------- 3. SALES HISTORY -----------------
function renderHistory(container) {
  var isBn = state.lang === 'bn';
  var todayKey = getLocalDateKey();
  var filtered = state.sales.filter(function(s) {
    var mSearch = s.customerName.toLowerCase().includes(state.salesSearchTerm.toLowerCase()) || s.memoNo.toLowerCase().includes(state.salesSearchTerm.toLowerCase());
    var mDue = state.salesDueFilter === 'all' ? true : state.salesDueFilter === 'due_only' ? s.dueAmount > 0 : s.dueAmount === 0;
    var sDate = extractSaleDateKey(s.date);
    var mDate = state.salesDateMode === 'all' ? true : (state.salesDateMode === 'today' ? sDate === todayKey : sDate === state.salesFilterDate);
    return mSearch && mDue && mDate;
  });
  var totalRev = filtered.reduce(function(acc, s) { return acc + s.netPayable; }, 0);
  var totalProf = filtered.reduce(function(acc, s) { return acc + s.profit; }, 0);
  var totalDue = filtered.reduce(function(acc, s) { return acc + s.dueAmount; }, 0);

  container.innerHTML = `
    ${renderSyncNoticeBanner()}
    <div class="kpi-grid">
      <div class="kpi-card kpi-sky"><div class="kpi-header"><span>${isBn ? 'মোট বিক্রি' : 'Revenue'}</span></div><div class="kpi-value tabular-nums">${formatTaka(totalRev)}</div></div>
      <div class="kpi-card kpi-emerald"><div class="kpi-header"><span>${isBn ? 'নীট লাভ' : 'Profit'}</span></div><div class="kpi-value tabular-nums" style="color:var(--color-primary)">${formatTaka(totalProf)}</div></div>
      <div class="kpi-card kpi-amber"><div class="kpi-header"><span>${isBn ? 'বাকি পাওনা' : 'Due'}</span></div><div class="kpi-value tabular-nums">${formatTaka(totalDue)}</div></div>
    </div>
    <div class="panel">
      <div class="panel-header" style="flex-wrap:wrap; gap:10px;">
        <input type="text" class="form-control" style="max-width:280px;" placeholder="${isBn ? 'কাস্টমার বা মেমো দিয়ে খুঁজুন...' : 'Search...'}" value="${state.salesSearchTerm}" oninput="handleSalesSearch(this.value)" />
        <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
          <button class="chip ${state.salesDateMode === 'today' ? 'active' : ''}" onclick="state.salesDateMode='today'; renderHistory(document.getElementById('app-main-content'))">${isBn ? 'আজকের সেশন' : 'Today'}</button>
          <button class="chip ${state.salesDateMode === 'date' ? 'active' : ''}" onclick="state.salesDateMode='date'; renderHistory(document.getElementById('app-main-content'))">${isBn ? 'তারিখ অনুযায়ী' : 'By Date'}</button>
          ${state.salesDateMode === 'date' ? '<input type="date" class="form-control font-mono" style="width:auto; padding:6px 10px;" value="' + state.salesFilterDate + '" onchange="state.salesFilterDate=this.value; renderHistory(document.getElementById(\'app-main-content\'))" />' : ''}
          <button class="chip ${state.salesDateMode === 'all' ? 'active' : ''}" onclick="state.salesDateMode='all'; renderHistory(document.getElementById('app-main-content'))">${isBn ? 'সব তারিখ' : 'All Dates'}</button>
          <button class="chip ${state.salesDueFilter === 'all' ? 'active' : ''}" onclick="setSalesDueFilter('all')">${isBn ? 'সব' : 'All'}</button>
          <button class="chip ${state.salesDueFilter === 'due_only' ? 'active' : ''}" onclick="setSalesDueFilter('due_only')">${isBn ? 'বাকি' : 'Due'}</button>
          <button class="chip ${state.salesDueFilter === 'paid_only' ? 'active' : ''}" onclick="setSalesDueFilter('paid_only')">${isBn ? 'পরিশোধিত' : 'Paid'}</button>
          <button class="btn btn-outline" onclick="exportSalesCSV()">📥 CSV</button>
        </div>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead><tr><th>${isBn ? 'মেমো' : 'Memo'}</th><th>${isBn ? 'তারিখ' : 'Date'}</th><th>${isBn ? 'কাস্টমার' : 'Customer'}</th><th>${isBn ? 'পণ্য' : 'Items'}</th><th class="text-right">${isBn ? 'টাকা' : 'Amount'}</th><th class="text-right">${isBn ? 'লাভ' : 'Profit'}</th><th class="text-right">${isBn ? 'অ্যাকশন' : 'Actions'}</th></tr></thead>
          <tbody>
            ${filtered.length === 0 ? '<tr><td colspan="7" style="text-align:center; padding:32px; color:var(--color-text-muted)">' + (isBn ? 'নির্বাচিত ফিল্টারে কোনো বিক্রি পাওয়া যায়নি' : 'No sales match filter') + '</td></tr>' : filtered.map(function(sale) {
              var itemsHtml = (sale.items || []).map(function(it) { return cleanProductTitle(it.productName) + ' × ' + it.quantity + ' ' + it.unit; }).join(', ');
              return `
                <tr>
                  <td class="font-mono" style="font-weight:700">${sale.memoNo}</td>
                  <td>${sale.date}</td>
                  <td style="font-weight:700">${sale.customerName}</td>
                  <td>${itemsHtml}</td>
                  <td class="text-right font-mono" style="font-weight:700">${formatTaka(sale.netPayable)}</td>
                  <td class="text-right font-mono" style="font-weight:700; color:var(--color-primary)">${formatTaka(sale.profit)}</td>
                  <td class="text-right">
                    <button class="btn btn-outline btn-sm" onclick="showInvoiceModal('${sale.id}')">👁️ ${isBn ? 'মেমো' : 'Memo'}</button>
                    <button class="btn btn-outline btn-sm" style="color:var(--color-danger)" onclick="revertSaleRecord('${sale.id}')">🗑️</button>
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

window.handleSalesSearch = function(val) { state.salesSearchTerm = val; renderHistory(document.getElementById('app-main-content')); };
window.setSalesDueFilter = function(f) { state.salesDueFilter = f; renderHistory(document.getElementById('app-main-content')); };
window.revertSaleRecord = async function(saleId) {
  var isBn = state.lang === 'bn';
  var sale = state.sales.find(function(s) { return s.id === String(saleId); });
  if (!sale) return;
  if (confirm(isBn ? 'মেমো (' + sale.memoNo + ') বাতিল করে স্টক ফেরত নিতে চান?' : 'Revert memo?')) {
    (sale.items || []).forEach(function(it) {
      var prod = state.products.find(function(p) { return p.id === it.productId; });
      if (prod) { prod.stock += Number(it.quantity || 0); saveProductToDb(prod); }
    });
    state.sales = state.sales.filter(function(s) { return s.id !== String(saleId); });
    await deleteSaleFromDb(saleId);
    render();
  }
};
window.exportSalesCSV = function() {
  var headers = ['Memo No', 'Date', 'Customer', 'Amount', 'Profit', 'Paid', 'Due'];
  var rows = state.sales.map(function(s) { return [s.memoNo, s.date, '"' + s.customerName + '"', s.netPayable, s.profit, s.paidAmount, s.dueAmount]; });
  var csv = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(function(r) { return r.join(','); })].join('\n');
  var a = document.createElement('a'); a.href = encodeURI(csv); a.download = 'sales_ledger.csv';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
};

// ----------------- 5. COMPREHENSIVE ANALYTICS (Daily / Weekly & Monthly / Customer-Specific) -----------------
function summarizeStandalonePeriod(salesList) {
  var totalRevenue = 0;
  var totalCost = 0;
  var totalProfit = 0;
  var totalPaid = 0;
  var totalDue = 0;
  var itemMap = {};

  salesList.forEach(function(s) {
    totalRevenue += Number(s.netPayable || 0);
    totalCost += Number(s.totalCost || 0);
    totalProfit += Number(s.profit || 0);
    totalPaid += Number(s.paidAmount || 0);
    totalDue += Number(s.dueAmount || 0);
    (s.items || []).forEach(function(it) {
      var title = cleanProductTitle(it.productName);
      var key = title + '__' + it.unit;
      if (!itemMap[key]) {
        itemMap[key] = { name: title, unit: it.unit, category: it.category || '', qty: 0, amount: 0, profit: 0 };
      }
      itemMap[key].qty += Number(it.quantity || 0);
      itemMap[key].amount += Number(it.totalAmount || 0);
      itemMap[key].profit += Number(it.profit || 0);
    });
  });

  var itemBreakdown = Object.values(itemMap).sort(function(a, b) { return b.amount - a.amount; });
  var profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0';
  return {
    count: salesList.length,
    totalRevenue: totalRevenue,
    totalCost: totalCost,
    totalProfit: totalProfit,
    totalPaid: totalPaid,
    totalDue: totalDue,
    profitMargin: profitMargin,
    itemBreakdown: itemBreakdown,
  };
}

function renderAnalytics(container) {
  var isBn = state.lang === 'bn';
  var mode = state.analyticsMode || 'daily';

  var dailySales = state.sales.filter(function(s) {
    return extractSaleDateKey(s.date) === state.analyticsDailyDate;
  });
  var dailySummary = summarizeStandalonePeriod(dailySales);

  var weeklySales = state.sales.filter(function(s) {
    return isDateWithinLastDays(extractSaleDateKey(s.date), 7);
  });
  var weeklySummary = summarizeStandalonePeriod(weeklySales);

  var monthlySales = state.sales.filter(function(s) {
    return extractSaleDateKey(s.date).slice(0, 7) === state.analyticsMonth;
  });
  var monthlySummary = summarizeStandalonePeriod(monthlySales);

  // Day-by-day rows for monthly view
  var monthDayMap = {};
  monthlySales.forEach(function(s) {
    var dk = extractSaleDateKey(s.date);
    if (!monthDayMap[dk]) monthDayMap[dk] = [];
    monthDayMap[dk].push(s);
  });
  var monthDays = Object.keys(monthDayMap).sort().reverse().map(function(dk) {
    return { dateKey: dk, summary: summarizeStandalonePeriod(monthDayMap[dk]) };
  });

  // Customer-specific list & filter
  var allNames = {};
  state.customers.forEach(function(c) { allNames[c.name] = true; });
  state.sales.forEach(function(s) { if (s.customerName) allNames[s.customerName] = true; });
  var customerNames = Object.keys(allNames);
  if (!state.analyticsCustomerName && customerNames.length > 0) {
    state.analyticsCustomerName = customerNames[0];
  }

  var custSales = state.sales.filter(function(s) {
    if (s.customerName !== state.analyticsCustomerName) return false;
    var dk = extractSaleDateKey(s.date);
    if (state.analyticsCustRange === 'specific') return dk === state.analyticsCustDate;
    if (state.analyticsCustRange === '7d') return isDateWithinLastDays(dk, 7);
    if (state.analyticsCustRange === '30d') return isDateWithinLastDays(dk, 30);
    return true;
  });
  var custSummary = summarizeStandalonePeriod(custSales);

  var contentHtml = '';
  if (mode === 'daily') {
    contentHtml = `
      <div class="panel" style="margin-bottom:20px;">
        <div class="panel-header" style="flex-wrap:wrap; gap:10px;">
          <span class="panel-title">📅 ${isBn ? 'দৈনিক বিক্রয় ও লাভের হিসাব' : 'Daily Breakdown'}</span>
          <div style="display:flex; gap:8px; align-items:center;">
            <input type="date" class="form-control font-mono" style="width:auto;" value="${state.analyticsDailyDate}" onchange="state.analyticsDailyDate=this.value; renderAnalytics(document.getElementById('app-main-content'))" />
            <button type="button" class="btn btn-outline btn-sm" onclick="state.analyticsDailyDate='${getLocalDateKey()}'; renderAnalytics(document.getElementById('app-main-content'))">${isBn ? 'আজকে' : 'Today'}</button>
          </div>
        </div>
        <div class="panel-body">
          <div class="kpi-grid" style="margin-bottom:18px;">
            <div class="kpi-card kpi-violet"><div class="kpi-header"><span>${isBn ? 'মোট লেনদেন' : 'Transactions'}</span></div><div class="kpi-value tabular-nums">${dailySummary.count} ${isBn ? 'টি' : ''}</div></div>
            <div class="kpi-card kpi-emerald"><div class="kpi-header"><span>${isBn ? 'মোট বিক্রি' : 'Total Sales'}</span></div><div class="kpi-value tabular-nums" style="color:var(--color-primary)">${formatTaka(dailySummary.totalRevenue)}</div></div>
            <div class="kpi-card kpi-indigo"><div class="kpi-header"><span>${isBn ? 'নীট লাভ' : 'Net Profit'}</span></div><div class="kpi-value tabular-nums" style="color:#6366f1">${formatTaka(dailySummary.totalProfit)}</div><div class="kpi-subtext">${dailySummary.profitMargin}% ${isBn ? 'মার্জিন' : 'margin'}</div></div>
            <div class="kpi-card kpi-amber"><div class="kpi-header"><span>${isBn ? 'বাকি পাওনা' : 'Due'}</span></div><div class="kpi-value tabular-nums">${formatTaka(dailySummary.totalDue)}</div></div>
          </div>

          <div class="grid-2">
            <div>
              <h4 style="margin-bottom:10px; font-weight:800;">${isBn ? 'পণ্য অনুযায়ী বিক্রয় পরিমাণ' : 'Items Sold'}</h4>
              ${dailySummary.itemBreakdown.length === 0 ? '<p style="color:var(--color-text-muted)">এই দিনে কোনো পণ্য বিক্রি হয়নি</p>' : `
                <table class="data-table">
                  <thead><tr><th>${isBn ? 'পণ্য' : 'Product'}</th><th class="text-right">${isBn ? 'পরিমাণ' : 'Qty'}</th><th class="text-right">${isBn ? 'টাকা' : 'Total'}</th></tr></thead>
                  <tbody>
                    ${dailySummary.itemBreakdown.map(function(it) {
                      return '<tr><td><strong>' + it.name + '</strong></td><td class="text-right font-mono">' + Number(it.qty.toFixed(2)) + ' ' + it.unit + '</td><td class="text-right font-mono" style="font-weight:800">' + formatTaka(it.amount) + '</td></tr>';
                    }).join('')}
                  </tbody>
                </table>
              `}
            </div>
            <div>
              <h4 style="margin-bottom:10px; font-weight:800;">${isBn ? 'কারা কারা কিনেছেন (মেমো তালিকা)' : 'Customers Today'}</h4>
              ${dailySales.length === 0 ? '<p style="color:var(--color-text-muted)">কোনো মেমো নেই</p>' : dailySales.map(function(s) {
                return '<div style="padding:10px 12px; margin-bottom:8px; border:1px solid var(--color-border); border-radius:10px; display:flex; justify-content:space-between; align-items:center; gap:8px;"><div><strong>' + s.customerName + '</strong> <span class="font-mono" style="font-size:0.85rem; color:var(--color-text-subtle)">(' + s.memoNo + ')</span><div style="font-size:0.85rem; color:var(--color-text-muted)">' + (s.items || []).map(function(it){return cleanProductTitle(it.productName) + ' ' + it.quantity + ' ' + it.unit;}).join(', ') + '</div></div><div class="text-right"><div class="font-mono" style="font-weight:800">' + formatTaka(s.netPayable) + '</div><button class="btn btn-outline btn-sm" onclick="showInvoiceModal(\'' + s.id + '\')">👁️ মেমো</button></div></div>';
              }).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  } else if (mode === 'period') {
    contentHtml = `
      <div class="panel" style="margin-bottom:20px;">
        <div class="panel-header panel-header-indigo" style="color:#fff;">
          <span class="panel-title">📈 ${isBn ? 'গত ৭ দিনের (সাপ্তাহিক) সারসংক্ষেপ' : 'Weekly (Last 7 Days) Summary'}</span>
          <span style="font-weight:800;">${weeklySummary.count} ${isBn ? 'টি মেমো' : 'memos'}</span>
        </div>
        <div class="panel-body">
          <div class="kpi-grid" style="margin-bottom:0;">
            <div class="kpi-card kpi-emerald"><div class="kpi-header"><span>${isBn ? '৭ দিনের বিক্রি' : '7-Day Sales'}</span></div><div class="kpi-value tabular-nums" style="color:var(--color-primary)">${formatTaka(weeklySummary.totalRevenue)}</div></div>
            <div class="kpi-card kpi-sky"><div class="kpi-header"><span>${isBn ? 'ক্রয় খরচ' : 'Cost'}</span></div><div class="kpi-value tabular-nums">${formatTaka(weeklySummary.totalCost)}</div></div>
            <div class="kpi-card kpi-indigo"><div class="kpi-header"><span>${isBn ? 'সাপ্তাহিক নীট লাভ' : 'Weekly Profit'}</span></div><div class="kpi-value tabular-nums" style="color:#6366f1">${formatTaka(weeklySummary.totalProfit)}</div><div class="kpi-subtext">${weeklySummary.profitMargin}% ${isBn ? 'মার্জিন' : 'margin'}</div></div>
            <div class="kpi-card kpi-amber"><div class="kpi-header"><span>${isBn ? '৭ দিনের বাকি' : '7-Day Due'}</span></div><div class="kpi-value tabular-nums">${formatTaka(weeklySummary.totalDue)}</div></div>
          </div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header" style="flex-wrap:wrap; gap:10px;">
          <span class="panel-title">🗓️ ${isBn ? 'মাসিক হিসাব ও দিনভিত্তিক তালিকা' : 'Monthly Summary'}</span>
          <input type="month" class="form-control font-mono" style="width:auto;" value="${state.analyticsMonth}" onchange="state.analyticsMonth=this.value; renderAnalytics(document.getElementById('app-main-content'))" />
        </div>
        <div class="panel-body">
          <div class="kpi-grid">
            <div class="kpi-card kpi-emerald"><div class="kpi-header"><span>${isBn ? 'মাসিক মোট বিক্রি' : 'Monthly Revenue'}</span></div><div class="kpi-value tabular-nums" style="color:var(--color-primary)">${formatTaka(monthlySummary.totalRevenue)}</div></div>
            <div class="kpi-card kpi-indigo"><div class="kpi-header"><span>${isBn ? 'মাসিক নীট লাভ' : 'Monthly Profit'}</span></div><div class="kpi-value tabular-nums" style="color:#6366f1">${formatTaka(monthlySummary.totalProfit)}</div></div>
            <div class="kpi-card kpi-amber"><div class="kpi-header"><span>${isBn ? 'মাসিক বাকি' : 'Monthly Due'}</span></div><div class="kpi-value tabular-nums">${formatTaka(monthlySummary.totalDue)}</div></div>
          </div>

          <h4 style="margin:12px 0; font-weight:800;">${isBn ? 'এই মাসের দিনভিত্তিক বিক্রয় ও লাভ' : 'Day-by-Day'}</h4>
          ${monthDays.length === 0 ? '<p style="color:var(--color-text-muted)">এই মাসে কোনো বিক্রয়ের তথ্য নেই</p>' : `
            <div class="table-responsive">
              <table class="data-table">
                <thead><tr><th>${isBn ? 'তারিখ' : 'Date'}</th><th class="text-center">${isBn ? 'মেমো' : 'Memos'}</th><th class="text-right">${isBn ? 'বিক্রি' : 'Revenue'}</th><th class="text-right">${isBn ? 'নীট লাভ' : 'Profit'}</th><th class="text-right">${isBn ? 'বাকি' : 'Due'}</th></tr></thead>
                <tbody>
                  ${monthDays.map(function(row) {
                    return '<tr><td class="font-mono" style="font-weight:800">' + row.dateKey + '</td><td class="text-center font-mono">' + row.summary.count + '</td><td class="text-right font-mono" style="font-weight:800">' + formatTaka(row.summary.totalRevenue) + '</td><td class="text-right font-mono" style="font-weight:800; color:var(--color-primary)">' + formatTaka(row.summary.totalProfit) + '</td><td class="text-right font-mono">' + formatTaka(row.summary.totalDue) + '</td></tr>';
                  }).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
      </div>
    `;
  } else {
    contentHtml = `
      <div class="panel">
        <div class="panel-header" style="flex-wrap:wrap; gap:10px;">
          <span class="panel-title">👤 ${isBn ? 'গ্রাহকভিত্তিক বিস্তারিত খতিয়ান ও পণ্য রিপোর্ট' : 'Customer-Specific Report'}</span>
          <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
            <select class="form-control" style="width:auto; font-weight:800;" onchange="state.analyticsCustomerName=this.value; renderAnalytics(document.getElementById('app-main-content'))">
              ${customerNames.map(function(cn) {
                return '<option value="' + cn + '" ' + (cn === state.analyticsCustomerName ? 'selected' : '') + '>' + cn + '</option>';
              }).join('')}
            </select>
            <button type="button" class="chip ${state.analyticsCustRange === 'specific' ? 'active' : ''}" onclick="state.analyticsCustRange='specific'; renderAnalytics(document.getElementById('app-main-content'))">${isBn ? 'নির্দিষ্ট দিন' : 'Specific Day'}</button>
            ${state.analyticsCustRange === 'specific' ? '<input type="date" class="form-control font-mono" style="width:auto;" value="' + state.analyticsCustDate + '" onchange="state.analyticsCustDate=this.value; renderAnalytics(document.getElementById(\'app-main-content\'))" />' : ''}
            <button type="button" class="chip ${state.analyticsCustRange === '7d' ? 'active' : ''}" onclick="state.analyticsCustRange='7d'; renderAnalytics(document.getElementById('app-main-content'))">${isBn ? '৭ দিন' : '7 Days'}</button>
            <button type="button" class="chip ${state.analyticsCustRange === '30d' ? 'active' : ''}" onclick="state.analyticsCustRange='30d'; renderAnalytics(document.getElementById('app-main-content'))">${isBn ? '১ মাস' : '1 Month'}</button>
            <button type="button" class="chip ${state.analyticsCustRange === 'all' ? 'active' : ''}" onclick="state.analyticsCustRange='all'; renderAnalytics(document.getElementById('app-main-content'))">${isBn ? 'সব সময়' : 'All Time'}</button>
          </div>
        </div>
        <div class="panel-body">
          <div class="kpi-grid">
            <div class="kpi-card kpi-sky"><div class="kpi-header"><span>${isBn ? 'মোট মেমো / বার' : 'Orders'}</span></div><div class="kpi-value tabular-nums">${custSummary.count} ${isBn ? 'বার' : ''}</div></div>
            <div class="kpi-card kpi-emerald"><div class="kpi-header"><span>${isBn ? 'মোট ক্রয়মূল্য' : 'Total Spent'}</span></div><div class="kpi-value tabular-nums" style="color:var(--color-primary)">${formatTaka(custSummary.totalRevenue)}</div></div>
            <div class="kpi-card kpi-teal"><div class="kpi-header"><span>${isBn ? 'মোট পরিশোধ' : 'Paid'}</span></div><div class="kpi-value tabular-nums">${formatTaka(custSummary.totalPaid)}</div></div>
            <div class="kpi-card kpi-amber"><div class="kpi-header"><span>${isBn ? 'মোট বাকি' : 'Due Balance'}</span></div><div class="kpi-value tabular-nums" style="color:${custSummary.totalDue > 0 ? 'var(--color-danger)' : 'inherit'}">${formatTaka(custSummary.totalDue)}</div></div>
          </div>

          <h4 style="margin-bottom:10px; font-weight:800;">${state.analyticsCustomerName} — ${isBn ? 'মোট পণ্যের পরিমাণ (কোন পণ্য কত নিয়েছেন)' : 'Total Quantity Purchased per Item'}</h4>
          ${custSummary.itemBreakdown.length === 0 ? '<p style="color:var(--color-text-muted); margin-bottom:16px;">এই সময়ে কোনো পণ্য নেয়নি</p>' : `
            <div class="table-responsive" style="margin-bottom:20px;">
              <table class="data-table">
                <thead><tr><th>${isBn ? 'পণ্যের নাম' : 'Product'}</th><th class="text-right">${isBn ? 'মোট পরিমাণ' : 'Total Qty'}</th><th class="text-right">${isBn ? 'মোট টাকা' : 'Total Value'}</th></tr></thead>
                <tbody>
                  ${custSummary.itemBreakdown.map(function(it) {
                    return '<tr><td><strong>' + it.name + '</strong></td><td class="text-right font-mono" style="font-weight:800; color:var(--color-primary)">' + Number(it.qty.toFixed(2)) + ' ' + it.unit + '</td><td class="text-right font-mono" style="font-weight:800">' + formatTaka(it.amount) + '</td></tr>';
                  }).join('')}
                </tbody>
              </table>
            </div>
          `}

          <h4 style="margin-bottom:10px; font-weight:800;">${isBn ? 'লেনদেন ও মেমো তালিকা' : 'Transaction Memos'}</h4>
          ${custSales.length === 0 ? '<p style="color:var(--color-text-muted)">কোনো মেমো পাওয়া যায়নি</p>' : custSales.map(function(s) {
            return '<div style="padding:10px 14px; margin-bottom:8px; border:1px solid var(--color-border); border-radius:10px; display:flex; justify-content:space-between; align-items:center; gap:10px;"><div><strong class="font-mono">' + s.memoNo + '</strong> · <span style="font-size:0.875rem; color:var(--color-text-subtle)">' + s.date + '</span><div style="font-size:0.9rem;">' + (s.items || []).map(function(it){return cleanProductTitle(it.productName) + ' (' + it.quantity + ' ' + it.unit + ')';}).join(', ') + '</div></div><div class="text-right"><div class="font-mono" style="font-weight:800">' + formatTaka(s.netPayable) + '</div>' + (s.dueAmount > 0 ? '<div style="color:var(--color-danger); font-size:0.85rem; font-weight:800;">বাকি: ' + formatTaka(s.dueAmount) + '</div>' : '') + '<button class="btn btn-outline btn-sm" style="margin-top:4px;" onclick="showInvoiceModal(\'' + s.id + '\')">👁️ মেমো</button></div></div>';
          }).join('')}
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    ${renderSyncNoticeBanner()}
    <div class="analytics-mode-tabs">
      <button type="button" class="chip ${mode === 'daily' ? 'active' : ''}" onclick="state.analyticsMode='daily'; renderAnalytics(document.getElementById('app-main-content'))">📅 ${isBn ? 'দৈনিক (আজকের) হিসাব' : 'Daily'}</button>
      <button type="button" class="chip ${mode === 'period' ? 'active' : ''}" onclick="state.analyticsMode='period'; renderAnalytics(document.getElementById('app-main-content'))">📈 ${isBn ? 'সাপ্তাহিক ও মাসিক রিপোর্ট' : 'Weekly & Monthly'}</button>
      <button type="button" class="chip ${mode === 'customer' ? 'active' : ''}" onclick="state.analyticsMode='customer'; renderAnalytics(document.getElementById('app-main-content'))">👤 ${isBn ? 'গ্রাহকভিত্তিক বিস্তারিত' : 'Customer-Specific'}</button>
    </div>
    ${contentHtml}
  `;
}

// ----------------- 4. RESTOCK & AUDIT -----------------
function renderRestock(container) {
  var isBn = state.lang === 'bn';
  var outOfStock = state.products.filter(function(p) { return p.stock === 0; });
  var lowStock = state.products.filter(function(p) { return p.stock > 0 && p.stock <= (p.minStockAlert || 15); });
  var optimal = state.products.filter(function(p) { return p.stock > (p.minStockAlert || 15); });

  container.innerHTML = `
    ${renderSyncNoticeBanner()}
    <div class="kpi-grid">
      <div class="kpi-card" style="background:var(--color-danger-bg)"><div class="kpi-header" style="color:var(--color-danger)"><span>${isBn ? 'স্টক শেষ' : 'Out of Stock'}</span></div><div class="kpi-value tabular-nums">${outOfStock.length}</div></div>
      <div class="kpi-card" style="background:var(--color-warning-bg)"><div class="kpi-header" style="color:var(--color-warning)"><span>${isBn ? 'কম স্টক' : 'Low Stock'}</span></div><div class="kpi-value tabular-nums">${lowStock.length}</div></div>
      <div class="kpi-card" style="background:var(--color-primary-light)"><div class="kpi-header" style="color:var(--color-primary)"><span>${isBn ? 'পর্যাপ্ত মজুদ' : 'Optimal'}</span></div><div class="kpi-value tabular-nums">${optimal.length}</div></div>
    </div>
    <div class="panel">
      <div class="panel-header"><span class="panel-title">${isBn ? 'দ্রুত স্টক রিস্টক প্যানেল' : 'Restock Panel'}</span></div>
      <div class="table-responsive">
        <table class="data-table">
          <thead><tr><th>${isBn ? 'পণ্য' : 'Product'}</th><th class="text-center">${isBn ? 'বর্তমান স্টক' : 'Stock'}</th><th class="text-center">${isBn ? 'নতুন ক্রয়দর' : 'Buy Rate'}</th><th class="text-center">${isBn ? 'যোগ পরিমাণ' : 'Add Qty'}</th><th class="text-right">${isBn ? 'অ্যাকশন' : 'Action'}</th></tr></thead>
          <tbody>
            ${[...outOfStock, ...lowStock, ...optimal].map(function(p) {
              return `
                <tr>
                  <td><strong>${cleanProductTitle(p.name)}</strong><div style="font-size:0.8rem; color:var(--color-text-subtle)">${p.category}</div></td>
                  <td class="text-center font-mono" style="font-weight:800">${p.stock} ${p.unit}</td>
                  <td class="text-center"><input type="number" id="restock-price-${p.id}" class="form-control font-mono" style="width:95px; text-align:center; display:inline-block" value="${p.buy_price}" /></td>
                  <td class="text-center"><input type="number" id="restock-qty-${p.id}" class="form-control font-mono" style="width:90px; text-align:center; display:inline-block" value="${p.stock === 0 ? 100 : 50}" min="1" /></td>
                  <td class="text-right"><button class="btn btn-primary btn-sm" onclick="submitRestock(${p.id})">+ ${isBn ? 'রিস্টক' : 'Restock'}</button></td>
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
  var prod = state.products.find(function(p) { return p.id === prodId; });
  if (!prod) return;
  var qty = parseFloat(document.getElementById('restock-qty-' + prodId).value) || 0;
  var price = parseFloat(document.getElementById('restock-price-' + prodId).value) || prod.buy_price;
  if (qty <= 0) return;
  prod.stock += qty;
  if (price > 0) prod.buy_price = price;
  await saveProductToDb(prod);
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
    <div style="text-align:center; border-bottom:1px dashed #94a3b8; padding-bottom:14px; margin-bottom:14px;">
      <h2 style="font-size:1.5rem; font-weight:800; color:#0f172a;">${isBn ? 'মেসার্স কৃষি প্যাকেজিং ও আড়ত' : 'M/S AGRI PACKAGING & TRADING'}</h2>
      <p style="font-size:0.875rem; color:#475569">${isBn ? 'মোবাইল: ০১৭১২-৩৪৫৬৭৮, ০১৮১২-৩৪৫৬৭৮' : 'Mobile: 01712-345678'}</p>
    </div>
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; font-size:0.9rem; background:#f8fafc; padding:12px; border-radius:8px; margin-bottom:14px; color:#0f172a;">
      <div><div>${isBn ? 'কাস্টমার:' : 'Customer:'}</div><strong>${sale.customerName}</strong><div>${sale.customerPhone || ''}</div></div>
      <div style="text-align:right;"><div class="font-mono"><strong>${sale.memoNo}</strong></div><div>${sale.date}</div><div>${sale.paymentMethod}</div></div>
    </div>
    <table style="width:100%; border-collapse:collapse; font-size:0.9rem; margin-bottom:14px; color:#0f172a;">
      <thead><tr style="background:#f1f5f9; border-bottom:2px solid #cbd5e1;"><th style="padding:8px; text-align:left;">${isBn ? 'পণ্য' : 'Product'}</th><th style="padding:8px; text-align:center;">${isBn ? 'পরিমাণ' : 'Qty'}</th><th style="padding:8px; text-align:right;">${isBn ? 'দর' : 'Rate'}</th><th style="padding:8px; text-align:right;">${isBn ? 'মোট' : 'Total'}</th></tr></thead>
      <tbody>
        ${(sale.items || []).map(function(item) {
          return '<tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:8px;"><strong>' + cleanProductTitle(item.productName) + '</strong></td><td style="padding:8px; text-align:center;" class="font-mono">' + item.quantity + ' ' + item.unit + '</td><td style="padding:8px; text-align:right;" class="font-mono">৳' + item.sellPrice + '</td><td style="padding:8px; text-align:right; font-weight:700;" class="font-mono">৳' + item.totalAmount + '</td></tr>';
        }).join('')}
      </tbody>
    </table>
    <div style="text-align:right; font-size:0.95rem; color:#0f172a;">
      <div><strong>${isBn ? 'সর্বমোট প্রদেয়:' : 'Net Payable:'}</strong> <span class="font-mono">${formatTaka(sale.netPayable)}</span></div>
      <div>${isBn ? 'পরিশোধিত:' : 'Paid:'} <span class="font-mono" style="color:#059669">${formatTaka(sale.paidAmount)}</span></div>
      ${sale.dueAmount > 0 ? '<div style="color:#e11d48"><strong>' + (isBn ? 'বাকি:' : 'Due:') + '</strong> <span class="font-mono">' + formatTaka(sale.dueAmount) + '</span></div>' : ''}
    </div>
  `;
  overlay.classList.add('active');
};

window.closeInvoiceModal = function() { document.getElementById('invoice-modal-overlay')?.classList.remove('active'); };
window.printInvoice = function() { window.print(); };

window.showProductModal = function(prodId) {
  state.editingProductId = prodId;
  var overlay = document.getElementById('product-modal-overlay');
  if (!overlay) return;
  var prod = prodId ? state.products.find(function(p) { return p.id === prodId; }) : null;
  document.getElementById('modal-prod-name').value = prod ? prod.name : '';
  document.getElementById('modal-prod-category').value = prod ? prod.category : 'ক্যারেট';
  document.getElementById('modal-prod-buy').value = prod ? prod.buy_price : 0;
  document.getElementById('modal-prod-sell').value = prod ? prod.sell_price : 0;
  document.getElementById('modal-prod-unit').value = prod ? prod.unit : 'পিস';
  document.getElementById('modal-prod-stock').value = prod ? prod.stock : 100;
  document.getElementById('modal-prod-alert').value = prod ? (prod.minStockAlert || 20) : 20;
  overlay.classList.add('active');
};

window.closeProductModal = function() { document.getElementById('product-modal-overlay')?.classList.remove('active'); state.editingProductId = null; };

window.handleSaveProductModal = async function(e) {
  e.preventDefault();
  var name = document.getElementById('modal-prod-name').value.trim();
  if (!name) return;
  var payload = {
    name: name,
    category: document.getElementById('modal-prod-category').value,
    buy_price: parseFloat(document.getElementById('modal-prod-buy').value) || 0,
    sell_price: parseFloat(document.getElementById('modal-prod-sell').value) || 0,
    unit: document.getElementById('modal-prod-unit').value,
    stock: parseFloat(document.getElementById('modal-prod-stock').value) || 0,
    minStockAlert: parseFloat(document.getElementById('modal-prod-alert').value) || 20,
  };
  var savedProd = null;
  if (state.editingProductId) {
    var existing = state.products.find(function(p) { return p.id === state.editingProductId; });
    if (existing) { Object.assign(existing, payload); savedProd = existing; }
  } else {
    var nextId = state.products.length > 0 ? Math.max.apply(null, state.products.map(function(p) { return p.id; })) + 1 : 1;
    savedProd = Object.assign({ id: nextId }, payload);
    state.products.push(savedProd);
  }
  if (savedProd) await saveProductToDb(savedProd);
  closeProductModal();
  render();
};

window.resetAllData = async function() {
  var isBn = state.lang === 'bn';
  if (confirm(isBn ? 'সতর্কতা: প্রাথমিক ২৯টি পণ্যের ডেটায় রিসেট করতে চান?' : 'Reset to default 29 products?')) {
    state.products = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
    state.sales = [];
    saveLocalProducts();
    saveLocalSales();
    if (supabaseClient) {
      try {
        await supabaseClient.from('sales').delete().neq('id', '');
        await supabaseClient.from('products').upsert(state.products);
      } catch (err) { console.warn(err); }
    }
    render();
  }
};

function ensureStandaloneEnhancements() {
  // 1. Inject dynamic typography & analytics/session CSS if missing from host style.css
  if (!document.getElementById('agri-standalone-enhancements-css')) {
    var styleEl = document.createElement('style');
    styleEl.id = 'agri-standalone-enhancements-css';
    styleEl.textContent = [
      ':root { --app-font-size: 18px; --app-font-weight: 700; --app-font-family: "SutonnyMJ", "Noto Sans Bengali", "Hind Siliguri", "Outfit", system-ui, sans-serif; }',
      'html { font-family: var(--app-font-family); font-size: var(--app-font-size); }',
      'body { font-family: var(--app-font-family); font-weight: var(--app-font-weight); }',
      '.session-strip { background-color: var(--color-surface, #fff); border: 1px solid var(--color-border, #e2e8f0); border-radius: 14px; padding: 12px 16px; margin-bottom: 18px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; box-shadow: 0 2px 6px rgba(15,23,42,0.05); }',
      '.analytics-mode-tabs { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px; }',
      '.customer-name-text { font-size: 1.05rem; font-weight: 800; line-height: 1.3; }',
      '.customer-edit-badge { position: absolute; top: 6px; left: 6px; width: 26px; height: 26px; border-radius: 9999px; background: var(--color-surface, #fff); border: 1px solid var(--color-border, #e2e8f0); display: flex; align-items: center; justify-content: center; font-size: 0.78rem; opacity: 0.92; cursor: pointer; }',
      '.customer-check-badge { position: absolute; top: 6px; right: 6px; width: 22px; height: 22px; border-radius: 9999px; background: var(--color-primary, #059669); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 800; }',
      '.product-card-title { font-size: 1.25rem !important; font-weight: 800 !important; line-height: 1.3 !important; }'
    ].join('\n');
    document.head.appendChild(styleEl);
  }

  // 2. Ensure Analytics nav tab exists in desktop & mobile navs
  var navLinks = document.querySelector('.nav-links');
  if (navLinks && !navLinks.querySelector('[data-tab="analytics"]')) {
    var deskBtn = document.createElement('button');
    deskBtn.className = 'nav-item';
    deskBtn.setAttribute('data-tab', 'analytics');
    deskBtn.textContent = 'হিসাব ও রিপোর্ট';
    navLinks.appendChild(deskBtn);
  }
  var mobileNav = document.querySelector('.mobile-nav');
  if (mobileNav && !mobileNav.querySelector('[data-tab="analytics"]')) {
    var mobBtn = document.createElement('button');
    mobBtn.className = 'mobile-nav-item';
    mobBtn.setAttribute('data-tab', 'analytics');
    mobBtn.textContent = 'হিসাব ও রিপোর্ট';
    mobileNav.appendChild(mobBtn);
  }

  // 3. Ensure Font button exists in header action zone
  var actionZone = document.querySelector('.action-zone');
  if (actionZone && !document.getElementById('font-settings-btn')) {
    var fontBtn = document.createElement('button');
    fontBtn.id = 'font-settings-btn';
    fontBtn.type = 'button';
    fontBtn.className = 'btn btn-outline btn-sm';
    fontBtn.title = 'ফন্ট সাইজ ও বোল্ড সেটিংস';
    fontBtn.textContent = '🔤 ফন্ট';
    fontBtn.onclick = function() { window.openFontSettingsModal(); };
    actionZone.insertBefore(fontBtn, actionZone.firstChild);
  }

  // 4. Ensure Customer Settings modal exists
  if (!document.getElementById('customer-settings-modal-overlay')) {
    var custModal = document.createElement('div');
    custModal.id = 'customer-settings-modal-overlay';
    custModal.className = 'modal-overlay';
    custModal.innerHTML = '<div class="modal-card" style="max-width:780px;"><div class="modal-header panel-header-indigo" style="color:#fff;"><div><h3 style="font-size:1.15rem; font-weight:800;">নিয়মিত গ্রাহক প্রোফাইল ও ছবি সেটিংস</h3><div style="font-size:0.85rem; opacity:0.9;">গ্রাহকের ছবি আপলোড, পরিবর্তন বা তথ্য এডিট করুন</div></div><button class="btn-icon" style="color:#fff;" onclick="closeCustomerSettingsModal()">✕</button></div><div class="modal-body" id="customer-settings-body"></div><div class="modal-footer" style="justify-content:space-between;"><button type="button" class="btn btn-outline btn-sm" onclick="resetCustomersDefault()">ডিফল্ট ১০ গ্রাহক রিসেট</button><button type="button" class="btn btn-primary" onclick="closeCustomerSettingsModal()">সম্পন্ন</button></div></div>';
    document.body.appendChild(custModal);
  }

  // 5. Ensure Font Settings modal exists
  if (!document.getElementById('font-settings-modal-overlay')) {
    var fontModal = document.createElement('div');
    fontModal.id = 'font-settings-modal-overlay';
    fontModal.className = 'modal-overlay';
    fontModal.innerHTML = '<div class="modal-card" style="max-width:600px;"><div class="modal-header panel-header-indigo" style="color:#fff;"><div><h3 style="font-size:1.15rem; font-weight:800;">ফন্ট সাইজ ও বোল্ড কাস্টমাইজেশন</h3><div style="font-size:0.85rem; opacity:0.9;">বাংলা লেখার সাইজ, পুরুত্ব (Bold) ও ফন্ট স্টাইল নির্ধারণ করুন</div></div><button class="btn-icon" style="color:#fff;" onclick="closeFontSettingsModal()">✕</button></div><div class="modal-body" id="font-settings-body"></div><div class="modal-footer" style="justify-content:space-between;"><button type="button" class="btn btn-outline btn-sm" onclick="resetTypographyDefault()">ডিফল্ট সেটিংস</button><button type="button" class="btn btn-primary" onclick="closeFontSettingsModal()">সম্পন্ন</button></div></div>';
    document.body.appendChild(fontModal);
  }
}

document.addEventListener('DOMContentLoaded', function() {
  ensureStandaloneEnhancements();

  document.querySelectorAll('[data-tab]').forEach(function(btn) {
    btn.addEventListener('click', function() { state.currentTab = btn.dataset.tab; render(); });
  });

  var themeBtn = document.getElementById('theme-toggle-btn');
  if (themeBtn) {
    themeBtn.addEventListener('click', function() {
      applyTheme(state.theme === 'dark' ? 'light' : 'dark');
    });
  }

  var langBtn = document.getElementById('lang-toggle-btn');
  if (langBtn) {
    langBtn.addEventListener('click', function() {
      state.lang = state.lang === 'bn' ? 'en' : 'bn';
      try { localStorage.setItem(STORAGE_KEYS.LANG, state.lang); } catch (e) {}
      render();
    });
  }

  var resetBtn = document.getElementById('reset-data-btn');
  if (resetBtn) resetBtn.addEventListener('click', resetAllData);

  var modalForm = document.getElementById('product-modal-form');
  if (modalForm) modalForm.onsubmit = handleSaveProductModal;

  loadState();
});
