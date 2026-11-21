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
const SUPABASE_STORAGE_BUCKET = '01';
const STORAGE_RLS_FIX_SQL = [
  "INSERT INTO storage.buckets (id, name, public) VALUES ('01', '01', true) ON CONFLICT (id) DO UPDATE SET public = true;",
  'DROP POLICY IF EXISTS "Public read bucket 01" ON storage.objects;',
  'DROP POLICY IF EXISTS "Public insert bucket 01" ON storage.objects;',
  'DROP POLICY IF EXISTS "Public update bucket 01" ON storage.objects;',
  'DROP POLICY IF EXISTS "Allow all bucket 01" ON storage.objects;',
  'CREATE POLICY "Allow all bucket 01" ON storage.objects FOR ALL TO anon, authenticated, public USING (bucket_id = \'01\') WITH CHECK (bucket_id = \'01\');',
].join('\n');

function normalizeImageUrl(val) {
  if (typeof val !== 'string') return '';
  const trimmed = val.trim();
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return '';
  return trimmed;
}

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

// ----------------- REVISED BANGLADESH BENGALI CALENDAR HELPERS -----------------
const BN_DIGITS_MAP = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
function toBengaliDigits(value) {
  return String(value).replace(/\d/g, (d) => BN_DIGITS_MAP[Number(d)]);
}

const BN_MONTHS = [
  'বৈশাখ', 'জ্যৈষ্ঠ', 'আষাঢ়', 'শ্রাবণ', 'ভাদ্র', 'আশ্বিন',
  'কার্তিক', 'অগ্রহায়ণ', 'পৌষ', 'মাঘ', 'ফাল্গুন', 'চৈত্র',
];
const BN_MONTHS_EN = [
  'Boishakh', 'Jyoishtho', 'Asharh', 'Shrabon', 'Bhadro', 'Ashwin',
  'Kartik', 'Agrahayan', 'Poush', 'Magh', 'Falgun', 'Chaitra',
];
const GREG_MONTHS_BN = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর',
];

function formatBengaliOrdinalDay(day) {
  if (day === 1) return 'পহেলা';
  if (day === 2) return 'দোসরা';
  if (day === 3) return 'তেসরা';
  if (day === 4) return 'চৌঠা';
  const dStr = toBengaliDigits(day);
  return day <= 18 ? `${dStr}ই` : `${dStr}শে`;
}

function getBengaliDateInfo(dateInput) {
  let gYear;
  let gMonth; // 1-12
  let gDay;
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateInput)) {
    const parts = dateInput.slice(0, 10).split('-').map(Number);
    gYear = parts[0];
    gMonth = parts[1];
    gDay = parts[2];
  } else {
    const d = dateInput instanceof Date && !isNaN(dateInput.getTime()) ? dateInput : new Date();
    gYear = d.getFullYear();
    gMonth = d.getMonth() + 1;
    gDay = d.getDate();
  }

  const targetUtc = Date.UTC(gYear, gMonth - 1, gDay);
  const currentPohelaBoishakhUtc = Date.UTC(gYear, 3, 14);
  const bnStartGregYear = targetUtc >= currentPohelaBoishakhUtc ? gYear : gYear - 1;
  const pohelaBoishakhUtc = Date.UTC(bnStartGregYear, 3, 14);
  let remainingDays = Math.floor((targetUtc - pohelaBoishakhUtc) / 86400000);

  const febGregYear = bnStartGregYear + 1;
  const isBanglaLeapYear = (febGregYear % 4 === 0 && febGregYear % 100 !== 0) || (febGregYear % 400 === 0);
  const monthLengths = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, isBanglaLeapYear ? 30 : 29, 30];

  let monthIdx = 0;
  while (monthIdx < 11 && remainingDays >= monthLengths[monthIdx]) {
    remainingDays -= monthLengths[monthIdx];
    monthIdx += 1;
  }

  const day = remainingDays + 1;
  const year = bnStartGregYear - 593;
  const monthNameBn = BN_MONTHS[monthIdx];
  const monthNameEn = BN_MONTHS_EN[monthIdx];
  const ordinalDayBn = formatBengaliOrdinalDay(day);
  const yearBn = toBengaliDigits(year);
  const gregorianBn = `${toBengaliDigits(gDay)} ${GREG_MONTHS_BN[gMonth - 1]} ${toBengaliDigits(gYear)}`;
  const fullBn = `${ordinalDayBn} ${monthNameBn}, ${yearBn} বঙ্গাব্দ (${monthNameBn} মাস)`;
  const fullEn = `${day} ${monthNameEn}, ${year} BS (${monthNameEn} Month)`;

  return { day, monthIdx, monthNameBn, monthNameEn, year, ordinalDayBn, yearBn, gregorianBn, fullBn, fullEn };
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

function loadSavedTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME) || localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') return saved;
  } catch (e) {}
  return document.documentElement.getAttribute('data-theme') === 'dark' || document.documentElement.classList.contains('dark')
    ? 'dark'
    : 'light';
}

// ----------------- APPLICATION STATE -----------------
const state = {
  products: [],
  sales: [],
  customers: JSON.parse(JSON.stringify(INITIAL_REGULAR_CUSTOMERS)),
  currentTab: 'dashboard',
  lang: 'bn',
  theme: loadSavedTheme(),
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
  modalProductImage: '',
  modalProductUploading: false,
  newCustomerPhotoUrl: '',
  newCustomerUploading: false,
  uploadingCustomerId: null,
  uploadingProductId: null,
  isLoading: true,
  isSubmitting: false,
  syncMode: 'connecting',
  syncMessage: '',
  storageRlsBlocked: false,
  storageRlsDismissed: false,
};

// ----------------- THEME, TYPOGRAPHY & TOAST -----------------
function applyTypographySettings(cfg) {
  const t = cfg || state.typography || DEFAULT_TYPOGRAPHY;
  const root = document.documentElement;
  root.style.setProperty('--app-font-size', FONT_SIZE_MAP[t.sizeScale] || '18px');
  root.style.setProperty('--app-font-weight', t.weight || '700');
  root.style.setProperty('--app-font-family', FONT_FAMILY_MAP[t.family] || FONT_FAMILY_MAP.sutonny);
}

function applyTheme(theme, persist) {
  state.theme = theme === 'dark' ? 'dark' : 'light';
  const isDark = state.theme === 'dark';
  const root = document.documentElement;
  if (isDark) {
    root.setAttribute('data-theme', 'dark');
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
  } else {
    root.removeAttribute('data-theme');
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
  }
  if (persist !== false) {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, state.theme);
      localStorage.setItem('theme', state.theme);
    } catch (e) {}
  }
  const btn = document.getElementById('theme-toggle-btn');
  if (btn) {
    const isBn = state.lang === 'bn';
    btn.textContent = isDark ? (isBn ? '☀️ লাইট' : '☀️ Light') : (isBn ? '🌙 ডার্ক' : '🌙 Dark');
    btn.setAttribute('aria-pressed', String(isDark));
  }
}

applyTheme(state.theme, false);

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
    Image: normalizeImageUrl(raw.Image ?? raw.image),
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
    Image: normalizeImageUrl(raw.Image ?? raw.image),
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
  try {
    const savedLang = localStorage.getItem(STORAGE_KEYS.LANG);
    if (savedLang === 'bn' || savedLang === 'en') state.lang = savedLang;
    applyTheme(loadSavedTheme(), false);
    state.typography = Object.assign({}, DEFAULT_TYPOGRAPHY, loadJsonStorage(STORAGE_KEYS.TYPOGRAPHY, {}));
    applyTypographySettings(state.typography);
  } catch (e) {}

  state.isLoading = true;
  render();

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
      const cachedProdImgMap = {};
      fallbackProducts.forEach((fp) => {
        const img = normalizeImageUrl(fp.Image);
        if (fp.id && img) cachedProdImgMap[String(fp.id)] = img;
      });
      const cachedSaleImgMap = {};
      fallbackSales.forEach((fs) => {
        const img = normalizeImageUrl(fs.Image);
        if (fs.id && img) cachedSaleImgMap[String(fs.id)] = img;
      });

      state.products = (prodRes.data || [])
        .map((row) => {
          const p = normalizeProduct(row);
          if (!normalizeImageUrl(p.Image) && cachedProdImgMap[String(p.id)]) {
            p.Image = cachedProdImgMap[String(p.id)];
          }
          return p;
        })
        .sort((a, b) => a.id - b.id);
      state.sales = (salesRes.data || []).map((row) => {
        const s = normalizeSale(row);
        if (!normalizeImageUrl(s.Image) && cachedSaleImgMap[String(s.id)]) {
          s.Image = cachedSaleImgMap[String(s.id)];
        }
        return s;
      });
      syncCustomerImagesFromSales();
      state.syncMode = 'supabase';
      state.syncMessage = '';
      saveJsonStorage(STORAGE_KEYS.PRODUCTS, state.products);
      saveJsonStorage(STORAGE_KEYS.SALES, state.sales);
    }
  } catch (err) {
    state.products = fallbackProducts.length > 0 ? fallbackProducts : JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
    state.sales = fallbackSales;
    syncCustomerImagesFromSales();
    state.syncMode = 'local';
    state.syncMessage = err && err.message ? err.message : 'Network error';
  }

  state.isLoading = false;
  render();
};

function syncCustomerImagesFromSales() {
  const map = {};
  (state.sales || []).forEach((s) => {
    const key = String(s.customerName || '').trim();
    const img = normalizeImageUrl(s.Image);
    if (key && img && !map[key]) map[key] = img;
  });
  let changed = false;
  state.customers = (state.customers || []).map((c) => {
    const key = String(c.name || '').trim();
    const fromSale = map[key];
    if (fromSale && c.Image !== fromSale) {
      changed = true;
      return Object.assign({}, c, { Image: fromSale });
    }
    return c;
  });
  if (changed) saveJsonStorage(STORAGE_KEYS.CUSTOMERS, state.customers);
}

function getCustomerImageUrl(customerName, custObj) {
  const c = custObj || (state.customers || []).find((cu) => cu.name === customerName);
  const directCust = normalizeImageUrl(c && (c.Image || c.customPhoto));
  const key = String(customerName || (c && c.name) || '').trim();
  if (key) {
    const foundSale = (state.sales || []).find((s) => String(s.customerName || '').trim() === key && normalizeImageUrl(s.Image));
    if (foundSale) return normalizeImageUrl(foundSale.Image);
  }
  return directCust || '';
}

function getProductByTitle(title) {
  const clean = cleanProductTitle(title);
  return (state.products || []).find((p) => cleanProductTitle(p.name) === clean) || null;
}

async function saveProductToDb(product) {
  saveJsonStorage(STORAGE_KEYS.PRODUCTS, state.products);
  if (!supabaseClient) return { ok: false, error: 'Offline mode' };
  try {
    const payload = {
      id: product.id,
      name: product.name,
      category: product.category,
      buy_price: Number(product.buy_price) || 0,
      sell_price: Number(product.sell_price) || 0,
      unit: product.unit,
      stock: Number(product.stock) || 0,
      minStockAlert: Number(product.minStockAlert) || 15,
      Image: normalizeImageUrl(product.Image) || null,
    };
    let res = await supabaseClient.from('products').upsert([payload]);
    if (res.error) {
      const msg = (res.error.message || '').toLowerCase();
      if (res.error.code === 'PGRST204' || res.error.code === '42703' || msg.includes('image') || msg.includes('column')) {
        const fallbackPayload = Object.assign({}, payload);
        delete fallbackPayload.Image;
        res = await supabaseClient.from('products').upsert([fallbackPayload]);
      }
    }
    if (res.error) return { ok: false, error: res.error.message };
    state.syncMode = 'supabase';
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message || 'Network error' };
  }
}

async function updateProductImageInDb(prodId, imageUrl) {
  const cleanUrl = normalizeImageUrl(imageUrl) || null;
  saveJsonStorage(STORAGE_KEYS.PRODUCTS, state.products);
  if (!supabaseClient) return { ok: true, localOnly: true };
  try {
    const { error } = await supabaseClient.from('products').update({ Image: cleanUrl }).eq('id', prodId);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err && err.message) || 'Network error' };
  }
}

async function updateCustomerSalesImageInDb(customerName, imageUrl) {
  const cleanName = String(customerName || '').trim();
  const cleanUrl = normalizeImageUrl(imageUrl) || null;
  state.sales = (state.sales || []).map((s) =>
    String(s.customerName || '').trim() === cleanName ? Object.assign({}, s, { Image: cleanUrl || '' }) : s
  );
  saveJsonStorage(STORAGE_KEYS.SALES, state.sales);
  if (!supabaseClient || !cleanName) return { ok: true, localOnly: true };
  try {
    const { error } = await supabaseClient.from('sales').update({ Image: cleanUrl }).eq('customerName', cleanName);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err && err.message) || 'Network error' };
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

function generateFallbackUuid() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function resolveNextFallbackSaleId() {
  if (!supabaseClient) return generateFallbackUuid();
  try {
    const { data } = await supabaseClient.from('sales').select('id').limit(100);
    if (Array.isArray(data) && data.length > 0) {
      const numericIds = data
        .map((r) => r.id)
        .filter((v) => typeof v === 'number' || (typeof v === 'string' && /^\d+$/.test(v.trim())))
        .map((v) => Number(v))
        .filter((n) => Number.isFinite(n));
      if (numericIds.length > 0 && numericIds.length === data.length) {
        return Math.max(...numericIds) + 1;
      }
    }
  } catch (e) {}
  return generateFallbackUuid();
}

async function insertSaleToDb(saleRecord) {
  if (!supabaseClient) {
    saveJsonStorage(STORAGE_KEYS.SALES, [saleRecord, ...state.sales]);
    return { ok: true, localOnly: true, sale: saleRecord };
  }
  const totalQty = (saleRecord.items || []).reduce((s, it) => s + Number(it.quantity || 0), 0);
  const summaryNames = (saleRecord.items || []).map((it) => `${cleanProductTitle(it.productName)} (${it.quantity} ${it.unit})`).join(', ');

  // Strip client-side `id` so Supabase DB default (gen_random_uuid() / identity) assigns a unique PK
  const corePayload = {
    memoNo: saleRecord.memoNo,
    customerName: saleRecord.customerName,
    customerPhone: saleRecord.customerPhone || '',
    Image: normalizeImageUrl(saleRecord.Image) || null,
    items: saleRecord.items,
    totalAmount: saleRecord.totalAmount,
    totalCost: saleRecord.totalCost,
    profit: saleRecord.profit,
    discount: saleRecord.discount,
    netPayable: saleRecord.netPayable,
    paidAmount: saleRecord.paidAmount,
    dueAmount: saleRecord.dueAmount,
    paymentMethod: saleRecord.paymentMethod,
    date: saleRecord.date,
    note: saleRecord.note || '',
  };

  const extendedPayload = Object.assign({}, corePayload, {
    phone: saleRecord.customerPhone || '',
    quantity: Number(totalQty.toFixed(2)),
    productName: summaryNames,
  });

  try {
    let activePayload = extendedPayload;
    let res = await supabaseClient.from('sales').insert([activePayload]).select();
    if (res.error) {
      const msg = (res.error.message || '').toLowerCase();
      if (res.error.code === 'PGRST204' || res.error.code === '42703' || msg.includes('column')) {
        activePayload = corePayload;
        res = await supabaseClient.from('sales').insert([activePayload]).select();
        if (res.error && (res.error.code === 'PGRST204' || res.error.code === '42703' || (res.error.message || '').toLowerCase().includes('image'))) {
          const minimalPayload = Object.assign({}, corePayload);
          delete minimalPayload.Image;
          activePayload = minimalPayload;
          res = await supabaseClient.from('sales').insert([activePayload]).select();
        }
      }
    }

    if (res.error) {
      const errCode = res.error.code || '';
      const errMsg = (res.error.message || '').toLowerCase();
      const isPkOrNullIdIssue =
        errCode === '23505' ||
        errCode === '23502' ||
        errMsg.includes('duplicate key') ||
        errMsg.includes('sales_pkey') ||
        errMsg.includes('null value in column "id"');

      if (isPkOrNullIdIssue) {
        const fallbackId = await resolveNextFallbackSaleId();
        res = await supabaseClient.from('sales').insert([Object.assign({}, activePayload, { id: fallbackId })]).select();
        if (res.error && res.error.code === '23505') {
          const secondId = typeof fallbackId === 'number' ? fallbackId + 1 : generateFallbackUuid();
          res = await supabaseClient.from('sales').insert([Object.assign({}, activePayload, { id: secondId })]).select();
        }
      }
    }

    if (res.error) {
      const errCode = res.error.code || '';
      const errMsg = (res.error.message || '').toLowerCase();
      if (errCode === '23505' || errMsg.includes('sales_pkey')) {
        try {
          const { data: dupCust } = await supabaseClient
            .from('sales')
            .select('id')
            .eq('customerName', saleRecord.customerName)
            .limit(1);
          if (Array.isArray(dupCust) && dupCust.length > 0) {
            return {
              ok: false,
              error: `Supabase sales টেবিলে "customerName" কলামে Primary Key ("Sales_pkey") রয়েছে, তাই "${saleRecord.customerName}"-এর নতুন বিক্রি আটকে যাচ্ছে। Supabase SQL Editor-এ Run করুন: ALTER TABLE public.sales DROP CONSTRAINT IF EXISTS "Sales_pkey"; ALTER TABLE public.sales ALTER COLUMN id SET DEFAULT gen_random_uuid()::text; ALTER TABLE public.sales ADD PRIMARY KEY (id);`,
            };
          }
        } catch (e) {}
      }
      return { ok: false, error: res.error.message || 'Supabase insert error' };
    }

    state.syncMode = 'supabase';
    state.syncMessage = '';
    const insertedRow = Array.isArray(res.data) && res.data.length > 0 ? normalizeSale(res.data[0]) : saleRecord;
    return { ok: true, sale: insertedRow };
  } catch (err) {
    return { ok: false, error: (err && err.message) || 'Network error' };
  }
}

async function deleteSaleFromDb(saleId) {
  saveJsonStorage(STORAGE_KEYS.SALES, state.sales);
  if (!supabaseClient) return;
  try { await supabaseClient.from('sales').delete().eq('id', saleId); } catch (e) {}
}

function generateMemoNo() {
  const rand = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `MEMO-${String(state.sales.length + 101).padStart(4, '0')}-${Date.now().toString(36).slice(-4).toUpperCase()}${rand}`;
}

// ----------------- AVATAR, PRODUCT THUMBNAIL & SUPABASE STORAGE HELPERS -----------------
window.handleImgFallbackError = function(imgEl) {
  if (!imgEl) return;
  imgEl.style.display = 'none';
  const sibling = imgEl.nextElementSibling;
  if (sibling) sibling.classList.remove('img-fallback-hidden');
};

function compressImageToBlob(file, maxSize) {
  return new Promise((resolve) => {
    if (!file) { resolve({ blob: null, ext: 'jpg', contentType: 'image/jpeg' }); return; }
    if (file.type === 'image/svg+xml') {
      resolve({ blob: file, ext: 'svg', contentType: 'image/svg+xml' });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width || maxSize;
        let h = img.height || maxSize;
        if (w > h && w > maxSize) { h = Math.round((h * maxSize) / w); w = maxSize; }
        else if (h >= w && h > maxSize) { w = Math.round((w * maxSize) / h); h = maxSize; }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx && typeof canvas.toBlob === 'function') {
          ctx.drawImage(img, 0, 0, w, h);
          canvas.toBlob((blob) => {
            if (blob) resolve({ blob, ext: 'jpg', contentType: 'image/jpeg' });
            else resolve({ blob: file, ext: 'jpg', contentType: file.type || 'image/jpeg' });
          }, 'image/jpeg', 0.85);
        } else {
          resolve({ blob: file, ext: 'jpg', contentType: file.type || 'image/jpeg' });
        }
      };
      img.onerror = () => resolve({ blob: file, ext: 'jpg', contentType: file.type || 'image/jpeg' });
      img.src = reader.result;
    };
    reader.onerror = () => resolve({ blob: file, ext: 'jpg', contentType: file.type || 'image/jpeg' });
    reader.readAsDataURL(file);
  });
}

function compressImageToDataUrl(file, maxSize, quality) {
  return new Promise((resolve) => {
    if (!file) { resolve(''); return; }
    const targetMax = maxSize || 320;
    const targetQuality = typeof quality === 'number' ? quality : 0.78;
    const reader = new FileReader();
    reader.onload = () => {
      const rawDataUrl = typeof reader.result === 'string' ? reader.result : '';
      if (!rawDataUrl) { resolve(''); return; }
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width || targetMax;
        let h = img.height || targetMax;
        if (w > h && w > targetMax) { h = Math.round((h * targetMax) / w); w = targetMax; }
        else if (h >= w && h > targetMax) { w = Math.round((w * targetMax) / h); h = targetMax; }
        canvas.width = Math.max(1, w);
        canvas.height = Math.max(1, h);
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(rawDataUrl); return; }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        try {
          const out = canvas.toDataURL('image/jpeg', targetQuality);
          resolve(out || rawDataUrl);
        } catch (e) {
          resolve(rawDataUrl);
        }
      };
      img.onerror = () => resolve(rawDataUrl);
      img.src = rawDataUrl;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

async function fallbackCompressForDb(file, bucketName, errMsg) {
  var compactUrl = await compressImageToDataUrl(file, 320, 0.78);
  if (!compactUrl) {
    return {
      ok: false,
      error: 'Storage আপলোড ব্যর্থ (Bucket "' + bucketName + '"): ' + errMsg,
    };
  }
  state.storageRlsBlocked = true;
  state.storageRlsDismissed = false;
  return {
    ok: true,
    publicUrl: compactUrl,
    storageFallback: true,
    storageError: errMsg,
  };
}

async function uploadImageToSupabaseStorage(file, folder, recordKey) {
  if (!file) {
    return { ok: false, error: 'কোনো ছবি ফাইল নির্বাচন করা হয়নি।' };
  }

  var bucketName = (typeof SUPABASE_STORAGE_BUCKET === 'string' && SUPABASE_STORAGE_BUCKET.trim())
    ? SUPABASE_STORAGE_BUCKET.trim()
    : '01';

  if (!supabaseClient || !supabaseClient.storage) {
    return fallbackCompressForDb(file, bucketName, 'Supabase Storage সংযোগ পাওয়া যায়নি');
  }

  var rawKey = String(recordKey || 'item').replace(/[^a-zA-Z0-9_-]+/g, '_').replace(/^_+|_+$/g, '');
  var safeKey = (rawKey || 'item').slice(0, 36);
  var cleanFolder = String(folder || 'uploads').replace(/[^a-zA-Z0-9_-]/g, '').trim();

  var prepared = await compressImageToBlob(file, 800);
  if (!prepared || !prepared.blob) {
    return fallbackCompressForDb(file, bucketName, 'ছবি প্রক্রিয়াকরণ ব্যর্থ হয়েছে');
  }

  var ext = String(prepared.ext || 'jpg').replace(/[^a-zA-Z0-9]/g, '') || 'jpg';
  var contentType = prepared.contentType || 'image/jpeg';
  var uniqueTag = Date.now() + '_' + Math.random().toString(36).slice(2, 6);
  var fileName = safeKey + '_' + uniqueTag + '.' + ext;
  var filePath = cleanFolder ? (cleanFolder + '/' + fileName) : fileName;

  var uploadBody = prepared.blob;
  try {
    if (typeof File === 'function' && !(prepared.blob instanceof File)) {
      uploadBody = new File([prepared.blob], fileName, { type: contentType });
    }
  } catch (wrapErr) {
    uploadBody = prepared.blob;
  }

  try {
    var uploadRes = await supabaseClient.storage
      .from(bucketName)
      .upload(filePath, uploadBody, {
        cacheControl: '3600',
        upsert: false,
        contentType: contentType,
      });

    // Retry at bucket root without folder if subfolder path triggers 400
    if (uploadRes.error && cleanFolder && String(uploadRes.error.statusCode || uploadRes.error.status || '') === '400') {
      filePath = fileName;
      uploadRes = await supabaseClient.storage
        .from(bucketName)
        .upload(filePath, uploadBody, {
          cacheControl: '3600',
          upsert: false,
          contentType: contentType,
        });
    }

    if (uploadRes.error) {
      var errMsg = uploadRes.error.message || 'Unknown storage error';
      var statusStr = String(uploadRes.error.statusCode || uploadRes.error.status || '');
      var lowerMsg = errMsg.toLowerCase();
      var shouldFallback =
        lowerMsg.indexOf('row-level security') !== -1 ||
        lowerMsg.indexOf('policy') !== -1 ||
        lowerMsg.indexOf('unauthorized') !== -1 ||
        lowerMsg.indexOf('permission') !== -1 ||
        lowerMsg.indexOf('bucket') !== -1 ||
        statusStr === '403' ||
        statusStr === '401' ||
        statusStr === '400' ||
        statusStr === '404';

      if (shouldFallback) {
        return fallbackCompressForDb(file, bucketName, errMsg);
      }
      return {
        ok: false,
        error: 'Storage আপলোড ব্যর্থ (Bucket "' + bucketName + '"): ' + errMsg,
      };
    }

    var pubRes = supabaseClient.storage.from(bucketName).getPublicUrl(filePath);
    var publicUrl = normalizeImageUrl(pubRes && pubRes.data ? pubRes.data.publicUrl : '');
    if (!publicUrl) {
      return fallbackCompressForDb(file, bucketName, 'পাবলিক URL তৈরি করা যায়নি');
    }
    state.storageRlsBlocked = false;
    return { ok: true, publicUrl: publicUrl };
  } catch (err) {
    var exMsg = (err && err.message) ? err.message : 'Storage network error';
    return fallbackCompressForDb(file, bucketName, exMsg);
  }
}

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #059669, #0d9488)',
  'linear-gradient(135deg, #4f46e5, #2563eb)',
  'linear-gradient(135deg, #d97706, #ea580c)',
  'linear-gradient(135deg, #e11d48, #db2777)',
  'linear-gradient(135deg, #7c3aed, #6366f1)',
  'linear-gradient(135deg, #0891b2, #0284c7)',
];

function getAvatarGradient(name) {
  const s = String(name || 'গ');
  let hash = 0;
  for (let i = 0; i < s.length; i += 1) hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
}

function getCustomerInitials(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'গ';
  if (parts.length === 1) return parts[0].slice(0, 2);
  return (parts[0][0] || '') + (parts[parts.length - 1][0] || '');
}

function buildAvatarFallbackContent(c, displayName, hidden, sizePx) {
  const hiddenCls = hidden ? ' img-fallback-hidden' : '';
  if (c && c.skinTone) {
    const skin = c.skinTone || '#d99b72';
    const hair = c.hairColor || '#1e293b';
    const shirt = c.shirtColor || '#059669';
    return `<svg class="${hiddenCls.trim()}" viewBox="0 0 64 64" width="100%" height="100%" style="background:${shirt}33; display:block;">
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
    </svg>`;
  }
  const fontPx = sizePx ? Math.max(11, Math.round(sizePx * 0.36)) : 16;
  return `<div class="customer-initials-badge${hiddenCls}" style="background:${getAvatarGradient(displayName)}; font-size:${fontPx}px;">${esc(getCustomerInitials(displayName))}</div>`;
}

function renderAvatarSvg(cust, sizePx, overrideName, overrideImageUrl) {
  const c = cust || {};
  const displayName = overrideName || c.name || 'কাস্টমার';
  const matchedCust = c.name ? c : (state.customers || []).find((cu) => cu.name === displayName);
  const resolvedUrl = normalizeImageUrl(overrideImageUrl) || getCustomerImageUrl(displayName, matchedCust || c);
  const sizeStyle = sizePx ? `width:${sizePx}px; height:${sizePx}px; flex-shrink:0;` : '';

  if (resolvedUrl) {
    return `<div class="customer-avatar-wrap" style="${sizeStyle}">
      <img src="${esc(resolvedUrl)}" alt="${esc(displayName)}" loading="lazy" referrerpolicy="no-referrer" style="width:100%; height:100%; object-fit:cover; display:block;" onerror="handleImgFallbackError(this)" />
      ${buildAvatarFallbackContent(matchedCust || c, displayName, true, sizePx)}
    </div>`;
  }
  return `<div class="customer-avatar-wrap" style="${sizeStyle}">
    ${buildAvatarFallbackContent(matchedCust || c, displayName, false, sizePx)}
  </div>`;
}

function getCategoryFallbackSvg(category) {
  const cat = String(category || '');
  if (cat === 'ক্যারেট') {
    return '<svg width="56%" height="56%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="9" y1="10" x2="9" y2="19"/><line x1="15" y1="10" x2="15" y2="19"/></svg>';
  }
  if (cat === 'কাগজ') {
    return '<svg width="56%" height="56%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="14" y2="17"/></svg>';
  }
  if (cat.includes('বস্তা')) {
    return '<svg width="56%" height="56%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 7h12l1 13H5L6 7z"/><path d="M9 7V5a3 3 0 0 1 6 0v2"/></svg>';
  }
  return '<svg width="56%" height="56%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>';
}

function renderProductThumbHtml(prod, sizeClass, fallbackName, fallbackCat) {
  const p = prod || (fallbackName ? getProductByTitle(fallbackName) : null);
  const name = cleanProductTitle((p && p.name) || fallbackName || 'পণ্য');
  const category = (p && p.category) || fallbackCat || '';
  const imgUrl = normalizeImageUrl(p && p.Image);
  const catCls = getCategoryCardClass(category);
  const szCls = sizeClass || 'thumb-sm';
  const iconSvg = getCategoryFallbackSvg(category);

  if (imgUrl) {
    return `<div class="product-thumb-wrap ${szCls}" title="${esc(name)}">
      <img class="product-thumb-img" src="${esc(imgUrl)}" alt="${esc(name)}" loading="lazy" referrerpolicy="no-referrer" onerror="handleImgFallbackError(this)" />
      <div class="product-thumb-fallback img-fallback-hidden ${catCls}">${iconSvg}</div>
    </div>`;
  }
  return `<div class="product-thumb-wrap ${szCls}" title="${esc(name)}">
    <div class="product-thumb-fallback ${catCls}">${iconSvg}</div>
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

window.copyStorageRlsSql = function() {
  const isBn = state.lang === 'bn';
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    navigator.clipboard.writeText(STORAGE_RLS_FIX_SQL).then(() => {
      showToast(isBn ? 'Storage RLS SQL কপি হয়েছে! Supabase SQL Editor-এ পেস্ট করে Run করুন।' : 'Storage RLS SQL copied!', 'success');
    }).catch(() => {
      showToast(isBn ? 'SQL কপি করা যায়নি, standalone/supabase_schema.sql থেকে নিন।' : 'Copy failed.', 'info');
    });
  } else {
    showToast(isBn ? 'standalone/supabase_schema.sql ফাইলের Section 5 SQL কপি করুন।' : 'Check standalone/supabase_schema.sql', 'info');
  }
};

window.dismissStorageRlsBanner = function() {
  state.storageRlsDismissed = true;
  render();
};

function renderSyncNoticeBanner() {
  const isBn = state.lang === 'bn';
  let html = '';
  if (state.syncMode === 'local' && state.syncMessage) {
    html += `<div class="sync-banner">
      <div><strong>${isBn ? 'লোকাল ব্যাকআপ মোড:' : 'Local Backup Mode:'}</strong> <span>${esc(state.syncMessage)}</span></div>
      <button type="button" class="btn btn-outline btn-sm" onclick="loadState()">🔄 ${isBn ? 'আবার সিঙ্ক করুন' : 'Retry Sync'}</button>
    </div>`;
  }
  if (state.storageRlsBlocked && !state.storageRlsDismissed) {
    html += `<div class="sync-banner" style="background:var(--color-warning-light, #fffbeb); border-color:var(--color-warning, #f59e0b);">
      <div style="flex:1; min-width:220px;">
        <strong>${isBn ? 'Bucket "01" RLS সীমাবদ্ধতা (স্বয়ংক্রিয় ব্যাকআপ চালু):' : 'Bucket "01" RLS Restricted (Auto-Saved Directly):'}</strong>
        <span>${isBn ? 'ছবি সরাসরি ডাটাবেজে সংরক্ষণ করা হয়েছে। Bucket "01"-এ সরাসরি আপলোড চালু করতে SQL Editor-এ Storage RLS পলিসি রান করুন।' : 'Photo saved directly in database. Run the Storage RLS policy in SQL Editor to enable Bucket "01" uploads.'}</span>
      </div>
      <div style="display:flex; gap:6px; flex-wrap:wrap;">
        <button type="button" class="btn btn-primary btn-sm" onclick="copyStorageRlsSql()">📋 ${isBn ? 'SQL কপি করুন' : 'Copy SQL'}</button>
        <button type="button" class="btn btn-outline btn-sm" onclick="dismissStorageRlsBanner()">✕ ${isBn ? 'লুকান' : 'Hide'}</button>
      </div>
    </div>`;
  }
  return html;
}

window.render = function() {
  document.querySelectorAll('.nav-item, .mobile-nav-item').forEach((el) => {
    el.classList.toggle('active', el.dataset.tab === state.currentTab);
  });
  const langBtn = document.getElementById('lang-toggle-btn');
  if (langBtn) langBtn.textContent = state.lang === 'bn' ? 'English' : 'বাংলা';

  applyTheme(state.theme, false);
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
    return `<div class="customer-card ${isSelected ? 'selected' : ''}" onclick="selectRegularCustomer('${esc(c.id)}')" title="${esc(c.name)}${c.shopName ? ' — ' + esc(c.shopName) : ''}">
      <div class="customer-avatar-ring">
        ${renderAvatarSvg(c)}
        ${isSelected ? '<span class="customer-check-badge">✓</span>' : ''}
        <span class="customer-edit-badge" title="${isBn ? 'ছবি পরিবর্তন' : 'Edit Photo'}" onclick="event.stopPropagation(); openCustomerSettingsModal('${esc(c.id)}')">📷</span>
      </div>
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
    const isLow = p.stock <= (p.minStockAlert || 15);
    return `<button type="button" class="product-card ${getCategoryCardClass(p.category)} ${inCartQty > 0 ? 'selected' : ''}" title="${esc(p.category)} — ${inCartQty > 0 ? (isBn ? 'কার্ট থেকে সরাতে আবার ক্লিক করুন' : 'Click again to remove') : (isBn ? 'কার্টে যোগ করতে ক্লিক করুন' : 'Click to add')}" onclick="toggleProductInCart(${p.id})">
      <div class="product-card-top">
        <div style="display:flex; align-items:center; gap:8px; min-width:0; flex:1;">
          ${renderProductThumbHtml(p, 'thumb-sm')}
          <div class="product-card-title" style="min-width:0;">${esc(cleanProductTitle(p.name))}</div>
        </div>
        ${inCartQty > 0 ? `<span class="in-cart-pill">✓ ${inCartQty}</span>` : '<span class="product-card-add">+</span>'}
      </div>
      <div class="product-card-meta">
        <span class="product-card-price font-mono">৳${p.sell_price}<small>/${esc(p.unit)}</small></span>
        <span class="product-card-stock font-mono ${isLow ? 'low' : ''}">${p.stock} ${esc(p.unit)}</span>
      </div>
    </button>`;
  }).join('');
}

function renderDashboard(container) {
  const isBn = state.lang === 'bn';
  const todayKey = getLocalDateKey();
  const sessionDate = state.sessionDate || todayKey;
  const bnDateInfo = getBengaliDateInfo(sessionDate);
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
        <div class="session-date-meta">
          <span class="session-greg-date">${isBn ? bnDateInfo.gregorianBn : sessionDate}</span>
          <span class="session-meta-dot" aria-hidden="true">·</span>
          <span class="session-bengali-date">${isBn ? bnDateInfo.fullBn : bnDateInfo.fullEn}</span>
        </div>
        ${sessionDate === todayKey
          ? ''
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
                <div style="display:flex; flex-wrap:wrap; align-items:center; gap:10px; justify-content:space-between;">
                  <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                    <label class="btn btn-outline btn-sm" style="cursor:pointer;">
                      📷 ${state.newCustomerUploading ? (isBn ? 'আপলোড হচ্ছে...' : 'Uploading...') : (isBn ? 'গ্রাহকের ছবি দিন (Bucket 01)' : 'Upload Photo')}
                      <input type="file" id="new-cust-photo-file" accept="image/*" style="display:none" onchange="handleNewCustomerPhotoUpload(this)" />
                    </label>
                    ${state.newCustomerPhotoUrl ? `<span style="font-size:0.82rem; font-weight:700; color:var(--color-primary);">✓ ${isBn ? 'ছবি সংযুক্ত' : 'Photo attached'}</span>` : ''}
                  </div>
                  <button type="button" class="btn btn-primary btn-sm" ${state.newCustomerUploading ? 'disabled' : ''} onclick="saveNewCustomer()">${isBn ? 'গ্রাহক সংরক্ষণ ও সিলেক্ট' : 'Save & Select'}</button>
                </div>
              </div>` : ''}

            <div id="pos-customer-grid" class="customer-grid">${renderCustomerGridHtml()}</div>

            <div id="selected-customer-banner-wrap">${renderSelectedCustomerBannerHtml()}</div>

            <div class="grid-2 form-group">
              <div><label class="form-label">${isBn ? 'কাস্টমারের নাম' : 'Customer Name'} *</label><input type="text" id="pos-customer-name" class="form-control" style="font-weight:700" value="${esc(state.posCustomerName)}" oninput="state.posCustomerName=this.value; updateSelectedCustomerBanner();" required /></div>
              <div><label class="form-label">${isBn ? 'মোবাইল নম্বর (ঐচ্ছিক)' : 'Phone Number'}</label><input type="text" id="pos-customer-phone" class="form-control font-mono" style="font-weight:700" value="${esc(state.posCustomerPhone)}" oninput="state.posCustomerPhone=this.value; updateSelectedCustomerBanner();" placeholder="017xxxxxxxx" /></div>
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
              <div style="display:flex; justify-content:space-between; align-items:center; gap:10px; padding:9px 0; border-bottom:1px solid var(--color-border-subtle); font-size:0.95rem;">
                <div style="display:flex; align-items:center; gap:10px; min-width:0;">
                  ${renderProductThumbHtml(p, 'thumb-xs')}
                  <div style="min-width:0;"><div style="font-weight:700">${esc(cleanProductTitle(p.name))}</div><div style="color:var(--color-text-subtle); font-size:0.85rem">৳${p.sell_price} / ${esc(p.unit)}</div></div>
                </div>
                <div class="font-mono" style="font-weight:800; white-space:nowrap; color:${p.stock === 0 ? 'var(--color-danger)' : p.stock < 20 ? 'var(--color-warning)' : 'var(--color-primary)'}">${p.stock} ${esc(p.unit)}</div>
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
            <td><div style="display:flex; align-items:center; gap:9px;">${renderAvatarSvg(null, 32, sale.customerName, sale.Image)}<span style="font-weight:700">${esc(sale.customerName)}</span></div></td>
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

function renderSelectedCustomerBannerHtml() {
  const isBn = state.lang === 'bn';
  const cName = (state.posCustomerName || '').trim();
  if (!cName) return '';
  const cust = (state.customers || []).find((c) => c.id === state.selectedCustomerId) || (state.customers || []).find((c) => c.name === cName);
  const phone = state.posCustomerPhone || (cust && cust.phone) || '';
  const isBusy = state.uploadingCustomerId && cust && state.uploadingCustomerId === cust.id;
  return `<div class="selected-customer-banner">
    <div class="selected-customer-banner-left">
      ${renderAvatarSvg(cust, 44, cName)}
      <div style="min-width:0;">
        <div style="font-weight:800; font-size:0.98rem;">${esc(cName)}${cust && cust.shopName ? ` <span style="font-size:0.82rem; color:var(--color-text-muted); font-weight:600;">· ${esc(cust.shopName)}</span>` : ''}</div>
        <div class="font-mono" style="font-size:0.82rem; color:var(--color-text-muted);">${phone ? esc(phone) : (isBn ? 'নির্বাচিত গ্রাহক' : 'Selected customer')}</div>
      </div>
    </div>
    <label class="btn btn-outline btn-sm" style="cursor:pointer;">
      📷 ${isBusy ? (isBn ? 'আপলোড হচ্ছে...' : 'Uploading...') : (isBn ? 'ছবি আপলোড' : 'Upload Photo')}
      <input type="file" accept="image/*" style="display:none" onchange="uploadSelectedBannerCustomerPhoto(this)" />
    </label>
  </div>`;
}

window.updateSelectedCustomerBanner = function() {
  const wrap = document.getElementById('selected-customer-banner-wrap');
  if (wrap) wrap.innerHTML = renderSelectedCustomerBannerHtml();
};

// ----------------- POS INTERACTIONS (FOCUS-SAFE & TOGGLE CART) -----------------
window.handleCustomerSearch = function(val) {
  state.customerSearchTerm = val;
  const grid = document.getElementById('pos-customer-grid');
  if (grid) grid.innerHTML = renderCustomerGridHtml();
};

window.toggleAddCustomerForm = function() {
  state.showAddCustomerForm = !state.showAddCustomerForm;
  state.newCustomerPhotoUrl = '';
  render();
};

window.handleNewCustomerPhotoUpload = async function(inputEl) {
  const file = inputEl.files && inputEl.files[0];
  if (!file) return;
  state.newCustomerUploading = true;
  render();
  const cName = (document.getElementById('new-cust-name')?.value || 'customer').trim();
  const res = await uploadImageToSupabaseStorage(file, 'customers', cName || 'new_customer');
  state.newCustomerUploading = false;
  if (res.ok && res.publicUrl) {
    state.newCustomerPhotoUrl = res.publicUrl;
    if (res.storageFallback) {
      showToast(state.lang === 'bn' ? 'Storage RLS সীমাবদ্ধতার কারণে ছবি সরাসরি ডাটাবেজে সংরক্ষণ করা হয়েছে!' : 'Saved photo directly in database (Storage RLS restricted)!', 'info');
    } else {
      showToast(state.lang === 'bn' ? 'গ্রাহকের ছবি Bucket 01-এ আপলোড হয়েছে!' : 'Photo uploaded to bucket 01!', 'success');
    }
  } else {
    showToast(res.error || 'Upload failed', 'error');
  }
  render();
};

window.uploadSelectedBannerCustomerPhoto = async function(inputEl) {
  const file = inputEl.files && inputEl.files[0];
  if (!file) return;
  const cName = (state.posCustomerName || '').trim();
  if (!cName) return;
  const cust = (state.customers || []).find((c) => c.id === state.selectedCustomerId) || (state.customers || []).find((c) => c.name === cName);
  state.uploadingCustomerId = (cust && cust.id) || 'banner';
  updateSelectedCustomerBanner();
  const res = await uploadImageToSupabaseStorage(file, 'customers', cName);
  state.uploadingCustomerId = null;
  if (res.ok && res.publicUrl) {
    if (cust) {
      cust.Image = res.publicUrl;
      cust.customPhoto = res.publicUrl;
      saveJsonStorage(STORAGE_KEYS.CUSTOMERS, state.customers);
    }
    const dbRes = await updateCustomerSalesImageInDb(cName, res.publicUrl);
    if (!dbRes.ok) {
      showToast(`${cName}-এর ছবি প্রস্তুত হয়েছে (লোকালে সেভ হয়েছে), তবে sales টেবিলে সেভ হয়নি: ${dbRes.error}`, 'error');
    } else if (res.storageFallback) {
      showToast(`${cName}-এর ছবি সরাসরি ডাটাবেজে সংরক্ষণ করা হয়েছে! (Storage RLS সক্রিয় করুন)`, 'info');
    } else {
      showToast(`${cName}-এর ছবি সফলভাবে আপডেট হয়েছে!`, 'success');
    }
    if (res.storageFallback) {
      render();
      return;
    }
    const grid = document.getElementById('pos-customer-grid');
    if (grid) grid.innerHTML = renderCustomerGridHtml();
  } else {
    showToast(res.error || 'Upload failed', 'error');
  }
  updateSelectedCustomerBanner();
};

window.saveNewCustomer = async function() {
  const name = (document.getElementById('new-cust-name')?.value || '').trim();
  const shop = (document.getElementById('new-cust-shop')?.value || '').trim();
  const phone = (document.getElementById('new-cust-phone')?.value || '').trim();
  if (!name) { showToast(state.lang === 'bn' ? 'দয়া করে গ্রাহকের নাম লিখুন!' : 'Enter customer name!', 'error'); return; }
  const colors = ['#059669', '#4f46e5', '#d97706', '#0891b2', '#e11d48'];
  const photoUrl = normalizeImageUrl(state.newCustomerPhotoUrl);
  const cust = {
    id: 'cust_' + Date.now(),
    name,
    shopName: shop || 'নিয়মিত ক্রেতা',
    phone,
    Image: photoUrl || '',
    customPhoto: photoUrl || '',
    shirtColor: colors[state.customers.length % colors.length],
    skinTone: '#d99b72',
    hairColor: '#1e293b',
  };
  state.customers.unshift(cust);
  saveJsonStorage(STORAGE_KEYS.CUSTOMERS, state.customers);
  if (photoUrl) await updateCustomerSalesImageInDb(name, photoUrl);
  state.selectedCustomerId = cust.id;
  state.posCustomerName = cust.name;
  state.posCustomerPhone = cust.phone;
  state.showAddCustomerForm = false;
  state.newCustomerPhotoUrl = '';
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
  updateSelectedCustomerBanner();
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
        <div style="display:flex; align-items:center; gap:10px; min-width:0;">
          ${renderProductThumbHtml(prod, 'thumb-sm')}
          <div style="min-width:0;">
            <div style="font-size:1.05rem; font-weight:800;">#${idx + 1} ${esc(cleanProductTitle(prod.name))} <span style="font-size:0.85rem; color:var(--color-text-subtle);">(${esc(prod.category)})</span></div>
            <div style="font-size:0.875rem; color:var(--color-text-muted);">${isBn ? 'মজুদ:' : 'Stock:'} <strong class="font-mono">${prod.stock} ${esc(prod.unit)}</strong> · ${isBn ? 'ক্রয়:' : 'Buy:'} ৳${prod.buy_price}</div>
          </div>
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

    summaryRowsHtml += `<div class="summary-cart-row"><div style="display:flex; align-items:center; gap:8px; min-width:0">${renderProductThumbHtml(prod, 'thumb-xs')}<div style="min-width:0"><div style="font-weight:700">${esc(cleanProductTitle(prod.name))}</div><div class="font-mono" style="font-size:0.82rem; color:var(--color-text-subtle)">${qty} ${esc(prod.unit)} × ৳${rate}</div></div></div><div class="font-mono" style="font-weight:800">${formatTaka(lineTotal)}</div></div>`;
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

  const summaryCustomerName = (state.posCustomerName || '').trim();
  const summaryCustObj = (state.customers || []).find((c) => c.id === state.selectedCustomerId) || (state.customers || []).find((c) => c.name === summaryCustomerName);
  calcBox.innerHTML = `
    ${summaryCustomerName ? `<div style="display:flex; align-items:center; gap:10px; padding:8px 10px; border-radius:10px; background:var(--color-surface-muted); border:1px solid var(--color-border); margin-bottom:12px;">${renderAvatarSvg(summaryCustObj, 34, summaryCustomerName)}<div style="min-width:0;"><div style="font-weight:800; font-size:0.92rem;">${esc(summaryCustomerName)}</div>${state.posCustomerPhone ? `<div class="font-mono" style="font-size:0.78rem; color:var(--color-text-muted);">${esc(state.posCustomerPhone)}</div>` : ''}</div></div>` : ''}
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

  const matchedCustomer = (state.customers || []).find((c) => c.id === state.selectedCustomerId && c.name === customerName) || (state.customers || []).find((c) => c.name === customerName);
  const resolvedCustomerImage = getCustomerImageUrl(customerName, matchedCustomer);

  const saleRecord = {
    id: generateFallbackUuid(),
    memoNo: generateMemoNo(),
    customerName,
    customerPhone,
    Image: resolvedCustomerImage || '',
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
  document.querySelectorAll('#pos-sale-form button[type="submit"], #pos-calculations-box button[type="button"]').forEach((btn) => {
    btn.disabled = true;
  });
  updatePosCalculations();

  let pendingInvoiceId = null;
  try {
    const insertRes = await insertSaleToDb(saleRecord);

    if (!insertRes.ok) {
      state.syncMessage = insertRes.error || 'Supabase insert error';
      showToast(`${isBn ? 'বিক্রি সংরক্ষণ ব্যর্থ:' : 'Save failed:'} ${state.syncMessage}`, 'error');
      return;
    }

    const savedSale = insertRes.sale || saleRecord;

    for (const sold of saleItems) {
      const pObj = state.products.find((p) => p.id === sold.productId);
      if (pObj) {
        pObj.stock = Math.max(0, Number((pObj.stock - sold.quantity).toFixed(2)));
        await updateProductStockInDb(pObj.id, pObj.stock);
      }
    }

    state.sales.unshift(savedSale);
    saveJsonStorage(STORAGE_KEYS.SALES, state.sales);
    state.cart = [];
    state.posDiscount = 0;
    state.posPaidAmount = '';
    state.posNote = '';

    showToast(`${isBn ? 'বিক্রি সফল হয়েছে!' : 'Sale confirmed!'} (${savedSale.memoNo})`, 'success');
    pendingInvoiceId = savedSale.id;
  } finally {
    state.isSubmitting = false;
    render();
    if (pendingInvoiceId) showInvoiceModal(pendingInvoiceId);
  }
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
  return `<table class="data-table"><thead><tr><th class="text-center">ID</th><th>${isBn ? 'পণ্যের ছবি ও নাম' : 'Product'}</th><th>${isBn ? 'ক্যাটাগরি' : 'Category'}</th><th class="text-right">${isBn ? 'ক্রয়' : 'Buy'}</th><th class="text-right">${isBn ? 'বিক্রয়' : 'Sell'}</th><th class="text-center">${isBn ? 'স্টক' : 'Stock'}</th><th class="text-center">${isBn ? 'স্ট্যাটাস' : 'Status'}</th><th class="text-right">${isBn ? 'অ্যাকশন' : 'Actions'}</th></tr></thead><tbody>
    ${filtered.length === 0 ? `<tr><td colspan="8" style="text-align:center; padding:28px; color:var(--color-text-muted);">${isBn ? 'কোনো পণ্য পাওয়া যায়নি' : 'No products found'}</td></tr>` : filtered.map((p) => {
      const isZero = p.stock === 0;
      const isLow = p.stock > 0 && p.stock <= (p.minStockAlert || 15);
      const isUploading = state.uploadingProductId === p.id;
      return `<tr>
        <td class="text-center font-mono">${p.id}</td>
        <td>
          <div class="product-name-flex">
            <div class="prod-photo-wrap">
              ${renderProductThumbHtml(p, 'thumb-md')}
              <label class="prod-row-upload-btn" title="${isBn ? 'ছবি আপলোড (Bucket 01)' : 'Upload Photo'}">${isUploading ? '⏳' : '📷'}<input type="file" accept="image/*" style="display:none" ${isUploading ? 'disabled' : ''} onchange="uploadQuickProductPhoto(${p.id}, this)" /></label>
            </div>
            <span style="font-weight:700">${esc(cleanProductTitle(p.name))}</span>
          </div>
        </td>
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

window.uploadQuickProductPhoto = async function(prodId, inputEl) {
  const file = inputEl.files && inputEl.files[0];
  if (!file) return;
  const prod = state.products.find((p) => p.id === prodId);
  if (!prod) return;
  state.uploadingProductId = prodId;
  renderProductsTableOnly();
  const upRes = await uploadImageToSupabaseStorage(file, 'products', `prod_${prodId}_${prod.name}`);
  state.uploadingProductId = null;
  if (!upRes.ok || !upRes.publicUrl) {
    showToast(upRes.error || 'Upload failed', 'error');
    renderProductsTableOnly();
    return;
  }
  prod.Image = upRes.publicUrl;
  const dbRes = await updateProductImageInDb(prodId, upRes.publicUrl);
  if (!dbRes.ok) {
    showToast(`ছবি লোকালে সংরক্ষণ হয়েছে, তবে products টেবিলে সেভ হয়নি: ${dbRes.error}`, 'error');
  } else if (upRes.storageFallback) {
    showToast(`${cleanProductTitle(prod.name)}-এর ছবি সরাসরি ডাটাবেজে সংরক্ষণ হয়েছে!`, 'info');
  } else {
    showToast(`${cleanProductTitle(prod.name)}-এর ছবি আপলোড ও সেভ হয়েছে!`, 'success');
  }
  if (upRes.storageFallback) {
    render();
  } else {
    renderProductsTableOnly();
  }
};

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
      <td><div style="display:flex; align-items:center; gap:9px;">${renderAvatarSvg(null, 32, sale.customerName, sale.Image)}<span style="font-weight:700">${esc(sale.customerName)}</span></div></td>
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
          <td><div class="product-name-flex">${renderProductThumbHtml(p, 'thumb-sm')}<div><strong>${esc(cleanProductTitle(p.name))}</strong><div style="font-size:0.8rem; color:var(--color-text-subtle)">${esc(p.category)}</div></div></div></td>
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
              ${ds.itemBreakdown.length === 0 ? `<p style="color:var(--color-text-muted)">${isBn ? 'এই দিনে কোনো পণ্য বিক্রি হয়নি' : 'No items sold'}</p>` : `<table class="data-table"><thead><tr><th>${isBn ? 'পণ্য' : 'Product'}</th><th class="text-right">${isBn ? 'পরিমাণ' : 'Qty'}</th><th class="text-right">${isBn ? 'টাকা' : 'Total'}</th></tr></thead><tbody>${ds.itemBreakdown.map((it) => `<tr><td><div class="product-name-flex">${renderProductThumbHtml(null, 'thumb-xs', it.name)}<strong>${esc(it.name)}</strong></div></td><td class="text-right font-mono">${Number(it.qty.toFixed(2))} ${esc(it.unit)}</td><td class="text-right font-mono" style="font-weight:800">${formatTaka(it.amount)}</td></tr>`).join('')}</tbody></table>`}
            </div>
            <div>
              <h4 style="margin-bottom:10px; font-weight:800;">${isBn ? 'গ্রাহক ও মেমো তালিকা' : 'Memos'}</h4>
              ${dailySales.length === 0 ? `<p style="color:var(--color-text-muted)">${isBn ? 'কোনো মেমো নেই' : 'No memos'}</p>` : dailySales.map((s) => `<div style="padding:10px 12px; margin-bottom:8px; border:1px solid var(--color-border); border-radius:10px; display:flex; justify-content:space-between; align-items:center; gap:10px;"><div style="display:flex; align-items:center; gap:10px; min-width:0;">${renderAvatarSvg(null, 36, s.customerName, s.Image)}<div style="min-width:0;"><strong>${esc(s.customerName)}</strong> <span class="font-mono" style="font-size:0.85rem; color:var(--color-text-subtle)">(${esc(s.memoNo)})</span><div style="font-size:0.85rem; color:var(--color-text-muted)">${esc((s.items || []).map((it) => `${cleanProductTitle(it.productName)} ${it.quantity} ${it.unit}`).join(', '))}</div></div></div><div class="text-right"><div class="font-mono" style="font-weight:800">${formatTaka(s.netPayable)}</div><button type="button" class="btn btn-outline btn-sm" onclick="showInvoiceModal('${esc(s.id)}')">👁️ ${isBn ? 'মেমো' : 'Memo'}</button></div></div>`).join('')}
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
          <div style="display:flex; align-items:center; gap:10px;">
            ${renderAvatarSvg(null, 36, state.analyticsCustomerName)}
            <span class="panel-title">${esc(state.analyticsCustomerName)} — ${isBn ? 'খতিয়ান ও রিপোর্ট' : 'Customer Report'}</span>
          </div>
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
          ${cs.itemBreakdown.length === 0 ? `<p style="color:var(--color-text-muted); margin-bottom:16px;">${isBn ? 'এই সময়ে কোনো পণ্য কেনেননি' : 'No items'}</p>` : `<div class="table-responsive" style="margin-bottom:20px;"><table class="data-table"><thead><tr><th>${isBn ? 'পণ্য' : 'Product'}</th><th class="text-right">${isBn ? 'মোট পরিমাণ' : 'Qty'}</th><th class="text-right">${isBn ? 'মোট টাকা' : 'Value'}</th></tr></thead><tbody>${cs.itemBreakdown.map((it) => `<tr><td><div class="product-name-flex">${renderProductThumbHtml(null, 'thumb-xs', it.name)}<strong>${esc(it.name)}</strong></div></td><td class="text-right font-mono" style="font-weight:800; color:var(--color-primary)">${Number(it.qty.toFixed(2))} ${esc(it.unit)}</td><td class="text-right font-mono" style="font-weight:800">${formatTaka(it.amount)}</td></tr>`).join('')}</tbody></table></div>`}
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
      <div style="display:flex; align-items:center; gap:10px;">
        ${renderAvatarSvg(null, 42, sale.customerName, sale.Image)}
        <div><div>${isBn ? 'কাস্টমার:' : 'Customer:'}</div><strong>${esc(sale.customerName)}</strong><div>${esc(sale.customerPhone || '')}</div></div>
      </div>
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

function refreshModalProductImagePreview() {
  const prev = document.getElementById('modal-prod-image-preview');
  const removeBtn = document.getElementById('modal-prod-image-remove');
  const statusEl = document.getElementById('modal-prod-image-status');
  const nameVal = (document.getElementById('modal-prod-name')?.value || '').trim();
  const catVal = document.getElementById('modal-prod-category')?.value || 'অন্যান্য';
  if (prev) {
    prev.innerHTML = renderProductThumbHtml({ name: nameVal || 'পণ্য', category: catVal, Image: state.modalProductImage }, 'thumb-xl');
  }
  if (removeBtn) removeBtn.style.display = state.modalProductImage ? 'inline-flex' : 'none';
  if (statusEl) {
    statusEl.textContent = state.modalProductUploading
      ? '⏳ Supabase Storage Bucket "01"-এ আপলোড হচ্ছে...'
      : state.modalProductImage
        ? '✓ ছবির লিংক সংযুক্ত (products.Image-এ সেভ হবে)'
        : 'ছবি না দিলে ক্যাটাগরির আইকন দেখাবে';
  }
}

window.handleModalProductImageUpload = async function(inputEl) {
  const file = inputEl.files && inputEl.files[0];
  if (!file) return;
  state.modalProductUploading = true;
  refreshModalProductImagePreview();
  const prodName = (document.getElementById('modal-prod-name')?.value || '').trim();
  const res = await uploadImageToSupabaseStorage(file, 'products', prodName || (state.editingProductId ? `prod_${state.editingProductId}` : 'product'));
  state.modalProductUploading = false;
  if (res.ok && res.publicUrl) {
    state.modalProductImage = res.publicUrl;
    const urlInput = document.getElementById('modal-prod-image-url');
    if (urlInput) urlInput.value = res.publicUrl;
    if (res.storageFallback) {
      showToast(state.lang === 'bn' ? 'Storage RLS সীমাবদ্ধতার কারণে ছবি সরাসরি ডাটাবেজের জন্য প্রস্তুত হয়েছে!' : 'Image prepared directly for database!', 'info');
    } else {
      showToast(state.lang === 'bn' ? 'পণ্যের ছবি Bucket 01-এ আপলোড হয়েছে!' : 'Product photo uploaded!', 'success');
    }
  } else {
    showToast(res.error || 'Upload failed', 'error');
  }
  refreshModalProductImagePreview();
};

window.syncModalProductImageUrl = function(val) {
  state.modalProductImage = normalizeImageUrl(val);
  refreshModalProductImagePreview();
};

window.clearModalProductImage = function() {
  state.modalProductImage = '';
  const urlInput = document.getElementById('modal-prod-image-url');
  if (urlInput) urlInput.value = '';
  const fileInput = document.getElementById('modal-prod-image-file');
  if (fileInput) fileInput.value = '';
  refreshModalProductImagePreview();
};

window.showProductModal = function(prodId) {
  state.editingProductId = prodId;
  const overlay = document.getElementById('product-modal-overlay');
  if (!overlay) return;
  const prod = prodId ? state.products.find((p) => p.id === prodId) : null;
  state.modalProductImage = normalizeImageUrl(prod && prod.Image);
  state.modalProductUploading = false;
  document.getElementById('modal-prod-name').value = prod ? prod.name : '';
  document.getElementById('modal-prod-category').value = prod ? prod.category : 'ক্যারেট';
  document.getElementById('modal-prod-buy').value = prod ? prod.buy_price : 0;
  document.getElementById('modal-prod-sell').value = prod ? prod.sell_price : 0;
  document.getElementById('modal-prod-unit').value = prod ? prod.unit : 'পিস';
  document.getElementById('modal-prod-stock').value = prod ? prod.stock : 100;
  document.getElementById('modal-prod-alert').value = prod ? (prod.minStockAlert || 20) : 20;
  const urlInput = document.getElementById('modal-prod-image-url');
  if (urlInput) urlInput.value = state.modalProductImage;
  refreshModalProductImagePreview();
  overlay.classList.add('active');
};
window.closeProductModal = () => {
  document.getElementById('product-modal-overlay')?.classList.remove('active');
  state.editingProductId = null;
  state.modalProductImage = '';
};

window.handleSaveProductModal = async function(e) {
  e.preventDefault();
  const name = document.getElementById('modal-prod-name').value.trim();
  if (!name) return;
  const rawImgUrl = document.getElementById('modal-prod-image-url')?.value;
  const finalImg = normalizeImageUrl(rawImgUrl !== undefined ? rawImgUrl : state.modalProductImage);
  const payload = {
    name,
    category: document.getElementById('modal-prod-category').value,
    buy_price: parseFloat(document.getElementById('modal-prod-buy').value) || 0,
    sell_price: parseFloat(document.getElementById('modal-prod-sell').value) || 0,
    unit: document.getElementById('modal-prod-unit').value,
    stock: parseFloat(document.getElementById('modal-prod-stock').value) || 0,
    minStockAlert: parseFloat(document.getElementById('modal-prod-alert').value) || 20,
    Image: finalImg || '',
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
    const resolvedPhoto = getCustomerImageUrl(c.name, c);
    const isUploading = state.uploadingCustomerId === c.id;
    return `<div class="customer-settings-card">
      <div>${renderAvatarSvg(c, 64, c.name, resolvedPhoto)}</div>
      <div style="flex:1; min-width:0;">
        ${isEditing ? `
          <input type="text" id="edit-cust-name-${esc(c.id)}" class="form-control" style="margin-bottom:6px; padding:6px 10px;" value="${esc(c.name)}" />
          <input type="text" id="edit-cust-shop-${esc(c.id)}" class="form-control" style="margin-bottom:6px; padding:6px 10px;" value="${esc(c.shopName)}" />
          <input type="text" id="edit-cust-phone-${esc(c.id)}" class="form-control font-mono" style="margin-bottom:6px; padding:6px 10px;" value="${esc(c.phone || '')}" />
          <input type="url" id="edit-cust-image-${esc(c.id)}" class="form-control font-mono" style="margin-bottom:8px; padding:6px 10px; font-size:0.82rem;" placeholder="https://.../storage/v1/object/public/01/..." value="${esc(resolvedPhoto)}" />
          <div style="display:flex; gap:6px; flex-wrap:wrap;">
            <label class="btn btn-outline btn-sm" style="cursor:pointer;">📷 ${isUploading ? (isBn ? 'আপলোড হচ্ছে...' : 'Uploading...') : (isBn ? 'ছবি দিন (Bucket 01)' : 'Upload Photo')}<input type="file" accept="image/*" style="display:none" ${isUploading ? 'disabled' : ''} onchange="uploadCustomerPhoto('${esc(c.id)}', this)" /></label>
            <button type="button" class="btn btn-primary btn-sm" onclick="saveCustomerProfileEdit('${esc(c.id)}')">${isBn ? 'সংরক্ষণ' : 'Save'}</button>
            <button type="button" class="btn btn-outline btn-sm" onclick="state.editingCustomerId=null; renderCustomerSettingsModal()">${isBn ? 'বাতিল' : 'Cancel'}</button>
          </div>
        ` : `
          <div style="font-size:1.05rem; font-weight:800;">${esc(c.name)}</div>
          <div style="font-size:0.875rem; color:var(--color-text-muted);">${esc(c.shopName)}</div>
          <div class="font-mono" style="font-size:0.85rem; color:var(--color-text-subtle); margin-bottom:10px;">${esc(c.phone || '')}</div>
          <div style="display:flex; flex-wrap:wrap; gap:6px;">
            <label class="btn btn-outline btn-sm" style="cursor:pointer;">📷 ${isUploading ? (isBn ? 'আপলোড হচ্ছে...' : 'Uploading...') : resolvedPhoto ? (isBn ? 'ছবি বদলান' : 'Change') : (isBn ? 'ছবি আপলোড' : 'Upload')}<input type="file" accept="image/*" style="display:none" ${isUploading ? 'disabled' : ''} onchange="uploadCustomerPhoto('${esc(c.id)}', this)" /></label>
            ${resolvedPhoto ? `<button type="button" class="btn btn-outline btn-sm" onclick="resetCustomerPhoto('${esc(c.id)}')">↩️ ${isBn ? 'অবতার' : 'Avatar'}</button>` : ''}
            <button type="button" class="btn btn-outline btn-sm" onclick="state.editingCustomerId='${esc(c.id)}'; renderCustomerSettingsModal()">✏️ ${isBn ? 'এডিট' : 'Edit'}</button>
          </div>
        `}
      </div>
    </div>`;
  }).join('')}</div>`;
};

window.uploadCustomerPhoto = async function(custId, inputEl) {
  const file = inputEl.files && inputEl.files[0];
  if (!file) return;
  const cust = state.customers.find((c) => c.id === custId);
  if (!cust) return;
  state.uploadingCustomerId = custId;
  renderCustomerSettingsModal();
  const res = await uploadImageToSupabaseStorage(file, 'customers', cust.name || custId);
  state.uploadingCustomerId = null;
  if (!res.ok || !res.publicUrl) {
    showToast(res.error || 'Upload failed', 'error');
    renderCustomerSettingsModal();
    return;
  }
  cust.Image = res.publicUrl;
  cust.customPhoto = res.publicUrl;
  saveJsonStorage(STORAGE_KEYS.CUSTOMERS, state.customers);
  const dbRes = await updateCustomerSalesImageInDb(cust.name, res.publicUrl);
  if (!dbRes.ok) {
    showToast(`${cust.name}-এর ছবি লোকালে সংরক্ষণ হয়েছে, তবে sales টেবিলে সেভ হয়নি: ${dbRes.error}`, 'error');
  } else if (res.storageFallback) {
    showToast(`${cust.name}-এর ছবি সরাসরি ডাটাবেজে সংরক্ষণ হয়েছে!`, 'info');
  } else {
    showToast(`${cust.name}-এর ছবি Bucket 01 ও sales.Image-এ আপডেট হয়েছে!`, 'success');
  }
  renderCustomerSettingsModal();
};

window.resetCustomerPhoto = async function(custId) {
  const cust = state.customers.find((c) => c.id === custId);
  if (!cust) return;
  delete cust.customPhoto;
  delete cust.Image;
  saveJsonStorage(STORAGE_KEYS.CUSTOMERS, state.customers);
  await updateCustomerSalesImageInDb(cust.name, null);
  showToast(`${cust.name}-এর ডিফল্ট অবতার ফেরানো হয়েছে`, 'info');
  renderCustomerSettingsModal();
};

window.saveCustomerProfileEdit = async function(custId) {
  const cust = state.customers.find((c) => c.id === custId);
  if (!cust) return;
  const n = document.getElementById(`edit-cust-name-${custId}`)?.value.trim();
  const s = document.getElementById(`edit-cust-shop-${custId}`)?.value.trim();
  const p = document.getElementById(`edit-cust-phone-${custId}`)?.value.trim();
  const imgUrl = normalizeImageUrl(document.getElementById(`edit-cust-image-${custId}`)?.value);
  if (!n) return;
  cust.name = n;
  cust.shopName = s || 'নিয়মিত ক্রেতা';
  cust.phone = p || '';
  if (imgUrl) {
    cust.Image = imgUrl;
    cust.customPhoto = imgUrl;
  } else {
    delete cust.Image;
    delete cust.customPhoto;
  }
  saveJsonStorage(STORAGE_KEYS.CUSTOMERS, state.customers);
  await updateCustomerSalesImageInDb(n, imgUrl || null);
  state.editingCustomerId = null;
  showToast(`${n}-এর তথ্য সংরক্ষণ হয়েছে!`, 'success');
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
      :root { color-scheme: light; --app-font-size: 18px; --app-font-weight: 700; --app-font-family: 'SutonnyMJ', 'Noto Sans Bengali', 'Hind Siliguri', 'Outfit', system-ui, sans-serif; }
      [data-theme="dark"], html.dark { color-scheme: dark; }
      html { font-family: var(--app-font-family); font-size: var(--app-font-size); }
      body { font-family: var(--app-font-family); font-weight: var(--app-font-weight); }
      #agri-toast-box { position: fixed; bottom: 22px; right: 22px; z-index: 9999; display: flex; flex-direction: column; gap: 10px; }
      .session-strip { background-color: var(--color-surface, #fff); border: 1px solid var(--color-border, #e2e8f0); border-radius: 14px; padding: 12px 16px; margin-bottom: 18px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; }
      .session-date-meta { display: inline-flex; flex-wrap: wrap; align-items: center; gap: 6px; font-size: 0.9rem; line-height: 1.35; }
      .session-greg-date { font-weight: 700; color: var(--color-text-main); }
      .session-meta-dot { color: var(--color-text-subtle); font-weight: 800; }
      .session-bengali-date { font-weight: 800; color: var(--color-primary, #059669); }
      .analytics-mode-tabs { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px; }
      .customer-grid { display: grid !important; grid-template-columns: repeat(auto-fill, minmax(92px, 1fr)) !important; gap: 14px 10px !important; padding: 6px 4px; }
      .customer-card { background: transparent !important; border: none !important; padding: 4px 2px !important; gap: 7px !important; box-shadow: none !important; }
      .customer-card.selected { background: transparent !important; border: none !important; box-shadow: none !important; }
      .customer-avatar-ring { position: relative; width: 64px; height: 64px; border-radius: 9999px; padding: 3px; border: 2px solid var(--color-border, #e2e8f0); background-color: var(--color-surface, #fff); box-shadow: 0 2px 6px rgba(0,0,0,0.08); flex-shrink: 0; }
      .customer-card.selected .customer-avatar-ring { border-color: var(--color-primary, #059669); box-shadow: 0 0 0 3px rgba(16,185,129,0.25); }
      .customer-avatar-wrap { width: 100%; height: 100%; border-radius: 9999px; overflow: hidden; display: block; }
      .customer-name-text { font-size: 0.86rem !important; font-weight: 800; line-height: 1.25; max-width: 96px; }
      .customer-card.selected .customer-name-text { color: var(--color-primary, #059669); }
      .customer-edit-badge { position: absolute; bottom: -2px; right: -2px; width: 23px; height: 23px; border-radius: 9999px; background: var(--color-surface, #fff); border: 1px solid var(--color-border, #e2e8f0); display: flex; align-items: center; justify-content: center; font-size: 0.7rem; cursor: pointer; z-index: 2; }
      .customer-check-badge { position: absolute; top: -2px; right: -2px; width: 21px; height: 21px; border-radius: 9999px; background: var(--color-primary, #059669); color: #fff; border: 2px solid var(--color-surface, #fff); display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 800; z-index: 2; }
      .top-header { background: radial-gradient(ellipse 60% 120% at 15% 50%, rgba(217,119,6,0.16), transparent 65%), linear-gradient(180deg, #09090b 0%, #141418 55%, #0c0a09 100%) !important; border-bottom: 1px solid rgba(245,158,11,0.35) !important; box-shadow: 0 8px 28px -6px rgba(0,0,0,0.55); }
      .brand-zone span, .cinematic-jackal-title { font-family: 'Cinzel', Georgia, serif !important; font-size: 1.75rem !important; font-weight: 900 !important; letter-spacing: 0.08em; font-variant-caps: small-caps; line-height: 1.05; background-image: repeating-linear-gradient(125deg, rgba(255,255,255,0.22) 0px, rgba(255,255,255,0.22) 1px, rgba(69,26,3,0.14) 1px, rgba(69,26,3,0.14) 3px), linear-gradient(180deg, #fffbeb 0%, #fde047 18%, #eab308 42%, #a16207 52%, #facc15 74%, #fef08a 88%, #b45309 100%) !important; -webkit-background-clip: text !important; background-clip: text !important; color: transparent !important; -webkit-text-fill-color: transparent !important; filter: drop-shadow(0 1px 0 rgba(69,26,3,0.95)) drop-shadow(0 4px 10px rgba(0,0,0,0.78)); }
      .top-header .nav-item { color: #cbd5e1; }
      .top-header .nav-item.active { color: #fcd34d; border-bottom-color: #f59e0b; }
      .top-header .btn-outline { background-color: rgba(24,24,27,0.92); color: #fef3c7; border-color: rgba(245,158,11,0.32); }
      .product-grid { display: grid !important; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)) !important; gap: 8px !important; }
      .product-card { padding: 9px 11px !important; gap: 7px !important; border-radius: 12px !important; }
      .product-card-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 6px; }
      .product-card-title { font-size: 0.96rem !important; font-weight: 800 !important; line-height: 1.25 !important; }
      .product-card-add { font-size: 0.9rem; font-weight: 800; color: var(--color-text-subtle); flex-shrink: 0; }
      .product-card-meta { display: flex; justify-content: space-between; align-items: baseline; gap: 6px; padding-top: 6px; border-top: 1px solid var(--color-border, #e2e8f0); }
      .product-card-price { font-weight: 800; font-size: 0.96rem; color: var(--color-primary, #059669); font-variant-numeric: tabular-nums; }
      .product-card-price small { font-size: 0.76rem; color: var(--color-text-subtle); }
      .product-card-stock { font-size: 0.8rem; font-weight: 700; color: var(--color-text-muted); font-variant-numeric: tabular-nums; white-space: nowrap; }
      .product-card-stock.low { color: #d97706; }
      .img-fallback-hidden { display: none !important; }
      .customer-initials-badge { width: 100%; height: 100%; border-radius: 9999px; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 800; user-select: none; text-shadow: 0 1px 2px rgba(0,0,0,0.28); }
      .selected-customer-banner { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 10px 14px; margin-bottom: 14px; border-radius: 12px; border: 1px solid var(--color-primary-border, rgba(16,185,129,0.35)); background-color: var(--color-primary-light, rgba(16,185,129,0.08)); }
      .selected-customer-banner-left { display: flex; align-items: center; gap: 12px; min-width: 0; }
      .product-thumb-wrap { position: relative; border-radius: 10px; overflow: hidden; flex-shrink: 0; border: 1px solid var(--color-border, #e2e8f0); background-color: var(--color-surface, #fff); display: inline-flex; align-items: center; justify-content: center; }
      .product-thumb-wrap.thumb-xs { width: 28px; height: 28px; border-radius: 7px; }
      .product-thumb-wrap.thumb-sm { width: 38px; height: 38px; border-radius: 9px; }
      .product-thumb-wrap.thumb-md { width: 44px; height: 44px; border-radius: 10px; }
      .product-thumb-wrap.thumb-lg { width: 56px; height: 56px; border-radius: 12px; }
      .product-thumb-wrap.thumb-xl { width: 76px; height: 76px; border-radius: 14px; }
      .product-thumb-img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .product-thumb-fallback { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: var(--color-primary, #059669); background-color: var(--color-surface-muted, #f8fafc); }
      .product-thumb-fallback.cat-crate { background: rgba(217,119,6,0.14); color: #d97706; }
      .product-thumb-fallback.cat-paper { background: rgba(14,165,233,0.14); color: #0284c7; }
      .product-thumb-fallback.cat-water { background: rgba(6,182,212,0.14); color: #0891b2; }
      .product-thumb-fallback.cat-white { background: rgba(100,116,139,0.14); color: #475569; }
      .product-thumb-fallback.cat-blue { background: rgba(37,99,235,0.14); color: #2563eb; }
      .product-thumb-fallback.cat-net { background: rgba(16,185,129,0.14); color: #059669; }
      .product-thumb-fallback.cat-other { background: rgba(139,92,246,0.14); color: #7c3aed; }
      .product-name-flex { display: inline-flex; align-items: center; gap: 10px; min-width: 0; }
      .prod-photo-wrap { position: relative; display: inline-flex; flex-shrink: 0; }
      .prod-row-upload-btn { position: absolute; bottom: -4px; right: -4px; width: 21px; height: 21px; border-radius: 9999px; background: var(--color-surface, #fff); border: 1px solid var(--color-border, #e2e8f0); display: flex; align-items: center; justify-content: center; font-size: 0.65rem; cursor: pointer; }
      .modal-image-box { background-color: var(--color-surface-muted, #f8fafc); border: 1px solid var(--color-border, #e2e8f0); border-radius: 12px; padding: 12px 14px; margin-bottom: 14px; display: flex; gap: 14px; align-items: center; flex-wrap: wrap; }
      @media (max-width: 600px) {
        .customer-grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; gap: 12px 6px !important; }
        .customer-avatar-ring { width: 58px; height: 58px; }
        .product-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 7px !important; }
      }
    `;
    document.head.appendChild(styleEl);
  }

  if (!document.getElementById('cinzel-poster-font')) {
    const linkEl = document.createElement('link');
    linkEl.id = 'cinzel-poster-font';
    linkEl.rel = 'stylesheet';
    linkEl.href = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@700;800;900&display=swap';
    document.head.appendChild(linkEl);
  }

  document.title = 'My Business - POS ও ইনভেন্টরি ম্যানেজমেন্ট';
  const brandTitleSpan = document.querySelector('.brand-zone span');
  if (brandTitleSpan) {
    brandTitleSpan.textContent = 'My Business';
    brandTitleSpan.classList.add('cinematic-jackal-title');
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

  window.toggleTheme = () => {
    const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme, true);
  };

  const themeBtn = document.getElementById('theme-toggle-btn');
  if (themeBtn) {
    themeBtn.addEventListener('click', window.toggleTheme);
  }

  window.addEventListener('storage', (ev) => {
    if (ev.key === STORAGE_KEYS.THEME || ev.key === 'theme') {
      applyTheme(ev.newValue === 'dark' ? 'dark' : 'light', false);
    }
  });

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
