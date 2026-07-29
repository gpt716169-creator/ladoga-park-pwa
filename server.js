import express from 'express';
import cors from 'cors';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import cron from 'node-cron';
import sqlite3 from 'sqlite3';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import fs from 'fs';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(cors());
app.use(express.json());
// ==========================================
// STATIC FILES AND UPLOADS
// ==========================================
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });
const JWT_SECRET = 'ladoga-secret-2026-super-secure';
// ==========================================
// DATABASE SETUP (SQLite)
// ==========================================
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS catalog_items (
      id TEXT PRIMARY KEY,
      displayName TEXT,
      desc TEXT,
      price INTEGER,
      category TEXT,
      icon TEXT,
      image TEXT,
      isQuickOrder BOOLEAN DEFAULT 0
    )
  `);
  // Seed default admin if not exists (username: admin, password: password)
  db.get('SELECT * FROM admin_users WHERE username = ?', ['admin'], (err, row) => {
    if (!row) {
      const hash = bcrypt.hashSync('password', 10);
      db.run('INSERT INTO admin_users (username, password) VALUES (?, ?)', ['admin', hash]);
    }
  });
  // Create SMS Logs table
  db.run(`CREATE TABLE IF NOT EXISTS sms_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id TEXT,
    stage INTEGER,
    phone TEXT,
    status TEXT,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(booking_id, stage)
  )`);
  // Create Bookings table (Cache from TravelLine)
  db.run(`CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    guest_name TEXT,
    cabin_name TEXT,
    arrival_date TEXT,
    departure_date TEXT,
    status TEXT,
    phone TEXT,
    modified_at TEXT
  )`);
  // Create Gifts table (Dynamic management)
  db.run(`CREATE TABLE IF NOT EXISTS gifts (
    id TEXT PRIMARY KEY,
    title TEXT,
    subtitle TEXT,
    badge TEXT,
    image_url TEXT,
    stock INTEGER DEFAULT 50,
    min_threshold INTEGER DEFAULT 10,
    unit_cost INTEGER DEFAULT 350,
    is_active INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0
  )`);
  // Create Warehouse Products table
  db.run(`CREATE TABLE IF NOT EXISTS warehouse_products (
    id TEXT PRIMARY KEY,
    name TEXT,
    category TEXT,
    stock INTEGER DEFAULT 100,
    min_threshold INTEGER DEFAULT 15,
    unit_cost INTEGER DEFAULT 200,
    price INTEGER DEFAULT 500,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  // Create Warehouse Logs table
  db.run(`CREATE TABLE IF NOT EXISTS warehouse_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_type TEXT,
    item_name TEXT,
    change_qty INTEGER,
    reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  // Create SMS Broadcasts table
  db.run(`CREATE TABLE IF NOT EXISTS sms_broadcasts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    template TEXT,
    recipients_count INTEGER,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT
  )`);
  // Seed default catalog items if empty
  db.get('SELECT COUNT(*) as count FROM catalog_items', (err, row) => {
    if (row && row.count === 0) {
      const defaultItems = [
        { id: "firewood", displayName: "Дрова для камина", desc: "Камерная сушка. 1 связка", price: 800, category: "service", icon: "🪵", isQuickOrder: 1 },
        { id: "water-19l", displayName: "Артезианская вода", desc: "Бутыль 19л с помпой", price: 450, category: "service", icon: "💧", isQuickOrder: 1 },
        { id: "minibox", displayName: "Премиум гигиена", desc: "Сет тапочек и зубных наборов", price: 650, category: "service", icon: "✨", isQuickOrder: 1 },
        { id: "bike", displayName: "Прокат велосипеда", desc: "Отличный круизер", price: 1000, category: "service", icon: "🚲", isQuickOrder: 0 },
        { id: "sauna-forest", displayName: "Баня в лесу у поляны", desc: "Прогрев до 85°C", price: 4000, category: "sauna", icon: "🌲", isQuickOrder: 0 },
        { id: "sauna-lake", displayName: "Баня на берегу Ладоги", desc: "Спуск к воде", price: 4000, category: "sauna", icon: "🌊", isQuickOrder: 0 },
        { id: "hottub-siberian", displayName: "Сибирский банный чан", desc: "Теплый чан", price: 3500, category: "sauna", icon: "♨️", isQuickOrder: 0 },
        { id: "aroma-tub", displayName: "Арома-купель", desc: "На цитрусах", price: 3500, category: "sauna", icon: "🍋", isQuickOrder: 0 }
      ];
      const stmt = db.prepare('INSERT INTO catalog_items (id, displayName, desc, price, category, icon, isQuickOrder) VALUES (?, ?, ?, ?, ?, ?, ?)');
      defaultItems.forEach(i => stmt.run(i.id, i.displayName, i.desc, i.price, i.category, i.icon, i.isQuickOrder));
      stmt.finalize();
    }
  });

  // Seed default gifts if empty
  db.get('SELECT COUNT(*) as count FROM gifts', (err, row) => {
    if (row && row.count === 0) {
      const defaultGifts = [
        { id: "g1", title: "Игрушка «Шика» — Шикодруг", subtitle: "Собачка-друг и фирменный символ Ладога Парка", badge: "★ Символ Парка", image_url: "./assets/images/gifts/gift_toy.png?v=2", stock: 45, min_threshold: 10, unit_cost: 450, sort_order: 1 },
        { id: "g2", title: "Детская раскраска с карандашами", subtitle: "Альбом с жителями озера и цветными карандашами", badge: "Для детей", image_url: "./assets/images/gifts/gift_coloring.png?v=2", stock: 60, min_threshold: 15, unit_cost: 180, sort_order: 2 },
        { id: "g3", title: "Фирменный зонт Ладога Парк", subtitle: "Прочный ветроустойчивый зонт в цветах бренда", badge: "Премиум", image_url: "./assets/images/gifts/gift_umbrella.png?v=2", stock: 30, min_threshold: 5, unit_cost: 850, sort_order: 3 },
        { id: "g4", title: "Футболка Ладога Парк", subtitle: "Мягкая дышащая футболка из орг. хлопка", badge: "100% Хлопок", image_url: "./assets/images/gifts/gift_tshirt.png?v=2", stock: 40, min_threshold: 10, unit_cost: 650, sort_order: 4 },
        { id: "g5", title: "Крафтовый блокнот и ручка", subtitle: "Блокнот из переработанной бумаги с деревянной ручкой", badge: "Эко-крафт", image_url: "./assets/images/gifts/gift_notebook.png?v=2", stock: 75, min_threshold: 20, unit_cost: 220, sort_order: 5 },
        { id: "g6", title: "Кружка Ладога Парк", subtitle: "Уютная кружка для чая у камина или утреннего кофе", badge: "Керамика", image_url: "./assets/images/gifts/gift_mug.png?v=2", stock: 50, min_threshold: 12, unit_cost: 320, sort_order: 6 },
        { id: "g7", title: "Термос для прогулок у озера", subtitle: "Держит тепло 24 часа в прогулках по сосновому бору", badge: "Вакуумный", image_url: "./assets/images/gifts/gift_thermos.png?v=2", stock: 25, min_threshold: 8, unit_cost: 920, sort_order: 7 },
        { id: "g8", title: "Ароматическая соевая свеча", subtitle: "Свеча с ароматом хвои и деревянным фитилем", badge: "Соевый воск", image_url: "./assets/images/gifts/gift_candle.png?v=2", stock: 35, min_threshold: 10, unit_cost: 410, sort_order: 8 },
        { id: "g9", title: "Ладожский травяной чай с мёдом", subtitle: "Ароматный сбор сосновых почек и ягод с мёдом", badge: "Эко-сбор", image_url: "./assets/images/gifts/gift_tea.png?v=2", stock: 80, min_threshold: 25, unit_cost: 260, sort_order: 9 },
        { id: "g10", title: "Уютный флисовый плед", subtitle: "Согревающий плед для вечеров у душевного костра", badge: "Мягкий флис", image_url: "./assets/images/gifts/gift_blanket.png?v=2", stock: 20, min_threshold: 5, unit_cost: 780, sort_order: 10 },
        { id: "g11", title: "Крафтовый термостакан", subtitle: "Двухслойный стакан с крышкой для утреннего кофе", badge: "Непроливаемый", image_url: "./assets/images/gifts/gift_tumbler.png?v=2", stock: 45, min_threshold: 10, unit_cost: 490, sort_order: 11 }
      ];
      const stmt = db.prepare('INSERT INTO gifts (id, title, subtitle, badge, image_url, stock, min_threshold, unit_cost, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
      defaultGifts.forEach(g => stmt.run(g.id, g.title, g.subtitle, g.badge, g.image_url, g.stock, g.min_threshold, g.unit_cost, g.sort_order));
      stmt.finalize();
    }
  });

  // Seed default warehouse products if empty
  db.get('SELECT COUNT(*) as count FROM warehouse_products', (err, row) => {
    if (row && row.count === 0) {
      const defaultProducts = [
        { id: "p1", name: "🔥 Дрова березовые (Связка)", category: "Дрова", stock: 150, min_threshold: 30, unit_cost: 250, price: 800 },
        { id: "p2", name: "🚰 Вода артезианская 19л", category: "Вода", stock: 40, min_threshold: 10, unit_cost: 120, price: 450 },
        { id: "p3", name: "🪥 Премиум гигиена (Сет тапочек)", category: "Гигиена", stock: 80, min_threshold: 20, unit_cost: 180, price: 650 },
        { id: "p4", name: "🌿 Веник дубовый для бани", category: "Баня", stock: 60, min_threshold: 15, unit_cost: 220, price: 550 },
        { id: "p5", name: "🌿 Веник березовый для бани", category: "Баня", stock: 70, min_threshold: 15, unit_cost: 170, price: 450 }
      ];
      const stmt = db.prepare('INSERT INTO warehouse_products (id, name, category, stock, min_threshold, unit_cost, price) VALUES (?, ?, ?, ?, ?, ?, ?)');
      defaultProducts.forEach(p => stmt.run(p.id, p.name, p.category, p.stock, p.min_threshold, p.unit_cost, p.price));
      stmt.finalize();
    }
  });
});
// Middleware for JWT Verification
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Forbidden' });
    req.user = user;
    next();
  });
}
// API Keys provided by user
const TL_SAUNAS = {
  propertyId: '54511',
  connection: 'api_connection_bca5a_50c3f923e5',
  key: 'r1gtgA2UGey3D9swHDL01edbEPUEBZz3',
  authUrl: 'https://partner.tlintegration.com/auth/token',
  apiUrl: 'https://partner.tlintegration.com/api/search/v1' 
};
const TL_CABINS = {
  propertyId: '52159',
  connection: 'api_connection_9d1aa_ca2fef1de5',
  key: 'CHXoevsKt6nKJqQZs2bJxL7zlFMUydrx',
  authUrl: 'https://partner.tlintegration.com/auth/token',
  apiUrl: 'https://partner.tlintegration.com/api/read-reservation/v1' 
};
// ==========================================
// OAUTH2 TOKEN MANAGER (TravelLine Partner API)
// ==========================================
let tlAccessToken = null;
let tokenExpiresAt = 0;
async function getTlAccessToken() {
  const now = Date.now();
  // Refresh if missing or expires within 1 minute
  if (!tlAccessToken || now > tokenExpiresAt - 60000) {
    try {
      const qs = (await import('qs')).default;
      const response = await axios.post(TL_CABINS.authUrl, qs.stringify({
        grant_type: 'client_credentials',
        client_id: TL_CABINS.connection,
        client_secret: TL_CABINS.key
      }), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      tlAccessToken = response.data.access_token;
      // Expires in 1800 seconds (30 mins), convert to ms
      tokenExpiresAt = now + (response.data.expires_in * 1000);
      console.log('[TravelLine] Access token refreshed successfully.');
    } catch (err) {
      console.error('[TravelLine] Auth Error:', err.response?.data || err.message);
      throw new Error('Failed to authenticate with TravelLine API');
    }
  }
  return tlAccessToken;
}

function extractCabinName(roomStay, defaultName = "Домик") {
  if (!roomStay) return defaultName;
  const roomTypeName = roomStay.roomType?.name || defaultName;
  const roomNum = roomStay.roomNumber || 
                  roomStay.roomName || 
                  roomStay.room?.number || 
                  roomStay.room?.name || 
                  roomStay.placements?.[0]?.roomNumber || 
                  roomStay.placements?.[0]?.name ||
                  roomStay.placements?.[0]?.roomName ||
                  roomStay.unitNumber ||
                  roomStay.unitName;
  
  if (roomNum) {
    const cleanNum = String(roomNum).replace(/[^\d]/g, '');
    if (cleanNum) {
      return `${roomTypeName} № ${cleanNum}`;
    }
  }
  return roomTypeName;
}

// ==========================================
// SMS CRON JOB & DB SYNC SYSTEM
// ==========================================
async function syncPropertyBookings(config, defaultName = "Домик") {
  try {
    const isSauna = config.propertyId === TL_SAUNAS.propertyId;
    const token = isSauna ? await getTlSaunaAccessToken() : await getTlAccessToken();
    const now = new Date();
    const updatedAfter = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();
    
    let page = 1;
    let hasMore = true;
    const allSummaries = [];
    
    while (hasMore && page <= 5) {
      const url = `${config.apiUrl}/properties/${config.propertyId}/bookings?updatedAfter=${updatedAfter}&page=${page}&pageSize=100`;
      const res = await axios.get(url, { headers: { 'Authorization': `Bearer ${token}` } });
      const summaries = res.data.bookingSummaries || [];
      allSummaries.push(...summaries);
      
      if (summaries.length < 100) {
        hasMore = false;
      } else {
        page++;
      }
    }
    
    const activeSummaries = allSummaries.filter(s => s.status !== 'Cancelled');
    for (let i = activeSummaries.length - 1; i >= Math.max(0, activeSummaries.length - 100); i--) {
      const summary = activeSummaries[i];
      const existing = await new Promise((resolve) => db.get('SELECT modified_at, status FROM bookings WHERE id = ?', [summary.number], (err, row) => resolve(row)));
      
      if (!existing || existing.modified_at !== summary.modifiedDateTime || existing.status !== summary.status) {
        try {
          const detailRes = await axios.get(`${config.apiUrl}/properties/${config.propertyId}/bookings/${summary.number}`, {
             headers: { 'Authorization': `Bearer ${token}` }
          });
          const b = detailRes.data.booking;
          if (b && b.roomStays && b.roomStays[0]) {
            const rs = b.roomStays[0];
            let guestName = b.customer?.firstName || rs.guests?.[0]?.firstName || "Гость";
            guestName = guestName.replace(/\*/g, '').trim() || "Гость";
            const phone = b.customer?.phone || "";
            const cabin = extractCabinName(rs, defaultName);
            const arr = rs.stayDates.arrivalDateTime.split('T')[0];
            const dep = rs.stayDates.departureDateTime.split('T')[0];
            
            db.run(`INSERT INTO bookings (id, guest_name, cabin_name, arrival_date, departure_date, status, phone, modified_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(id) DO UPDATE SET 
                    guest_name=excluded.guest_name, cabin_name=excluded.cabin_name,
                    arrival_date=excluded.arrival_date, departure_date=excluded.departure_date,
                    status=excluded.status, phone=excluded.phone, modified_at=excluded.modified_at`,
              [summary.number, guestName, cabin, arr, dep, summary.status, phone, summary.modifiedDateTime]);
          }
        } catch (detailErr) {
          console.error(`[Sync] Failed details for ${summary.number}:`, detailErr.message);
        }
      }
    }
    console.log(`[Sync] Property ${config.propertyId} synced (${allSummaries.length} summaries).`);
  } catch (err) {
    console.error(`[Sync] Property ${config.propertyId} error:`, err.message);
  }
}

async function syncBookings() {
  console.log('[Sync] Starting full TravelLine sync for Cabins & Saunas...');
  await syncPropertyBookings(TL_CABINS, "Домик");
  await syncPropertyBookings(TL_SAUNAS, "Баня");
  console.log('[Sync] Full TravelLine sync completed.');
}
// Runs every 15 minutes to check bookings and send SMS
cron.schedule('*/15 * * * *', async () => {
  await syncBookings();
  // Here we will add SMS sending logic later
});
// ==========================================
// BOOKING DATA ENDPOINT (Dynamic Links via Real TravelLine API)
// ==========================================
app.get('/api/booking/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`[API] Requested booking data for ID: ${id}`);
  
  try {
    const token = await getTlAccessToken();
    const tlRes = await axios.get(`${TL_CABINS.apiUrl}/properties/${TL_CABINS.propertyId}/bookings/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const booking = tlRes.data.booking;
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }
    const roomStay = booking.roomStays && booking.roomStays[0];
    if (!roomStay) {
      return res.status(400).json({ success: false, error: 'No room stays found for booking' });
    }
    let guestName = "Гость";
    if (booking.customer && booking.customer.firstName && !booking.customer.firstName.includes("*")) {
       guestName = booking.customer.firstName;
    } else if (roomStay.guests && roomStay.guests[0] && roomStay.guests[0].firstName && !roomStay.guests[0].firstName.includes("*")) {
       guestName = roomStay.guests[0].firstName;
    }
    const cabinName = extractCabinName(roomStay, "Домик");
    const arrivalDate = roomStay.stayDates.arrivalDateTime.split('T')[0];
    const departureDate = roomStay.stayDates.departureDateTime.split('T')[0];
    const earlyArrival = roomStay.extraStayCharges?.earlyArrival || null;
    const lateDeparture = roomStay.extraStayCharges?.lateDeparture || null;
    
    // Check extendability
    let canExtend = true;
    try {
      const roomTypeId = roomStay.roomType?.id;
      if (roomTypeId) {
         const depDateObj = new Date(departureDate);
         const nextDayObj = new Date(depDateObj.getTime() + 86400000);
         const nextDayStr = nextDayObj.toISOString().split('T')[0];
         
         const searchUrl = `https://partner.tlintegration.com/api/search/v1/properties/${TL_CABINS.propertyId}/room-stays?arrivalDate=${departureDate}&departureDate=${nextDayStr}&adults=1`;
         const searchRes = await axios.get(searchUrl, { headers: { 'Authorization': `Bearer ${token}` } });
         const rt = searchRes.data.roomStays.find(x => x.roomType.id === roomTypeId);
         if (!rt || rt.availability === 0) {
            canExtend = false;
         }
      }
    } catch(e) {
      console.log('Error checking extendability:', e.message);
    }
    
    // Inspect payment method for 4% TravelLine commission saving
    const paymentMethodRaw = booking.paymentType || booking.billingType || (booking.payments && booking.payments[0]?.paymentType) || (booking.payments && booking.payments[0]?.paymentMethod) || "";
    const pLower = String(paymentMethodRaw).toLowerCase();
    
    // Show gifts ONLY IF paid via direct bank transfer / invoice / cash / direct call
    const isDirectPayment = pLower.includes("перевод") || 
                              pLower.includes("банковский") || 
                              pLower.includes("физ") || 
                              pLower.includes("bank") || 
                              pLower.includes("wire") || 
                              pLower.includes("cash") || 
                              pLower.includes("счет") || 
                              pLower.includes("счёт") ||
                              !paymentMethodRaw;
                              
    const showGifts = isDirectPayment;

    const responseData = {
      success: true,
      data: {
        bookingId: id,
        guestName,
        cabinName,
        arrivalDate,
        departureDate,
        status: booking.status,
        earlyArrival,
        lateDeparture,
        canExtend,
        paymentType: paymentMethodRaw || "Банковский перевод для физ. лиц",
        showGifts
      }
    };
    
    res.json(responseData);
  } catch (err) {
    console.error('[API] Booking fetch error:', err.response?.data || err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch booking' });
  }
});
let tlSaunaAccessToken = null;
let saunaTokenExpiresAt = 0;
async function getTlSaunaAccessToken() {
  const now = Date.now();
  if (!tlSaunaAccessToken || now > saunaTokenExpiresAt - 60000) {
    try {
      const qs = (await import('qs')).default;
      const response = await axios.post(TL_SAUNAS.authUrl, qs.stringify({
        grant_type: 'client_credentials',
        client_id: TL_SAUNAS.connection,
        client_secret: TL_SAUNAS.key
      }), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      tlSaunaAccessToken = response.data.access_token;
      saunaTokenExpiresAt = now + (response.data.expires_in * 1000);
      console.log('[TravelLine] Sauna token refreshed successfully.');
    } catch (err) {
      console.error('[TravelLine] Sauna Auth Error:', err.response?.data || err.message);
      throw new Error('Failed to authenticate Saunas API');
    }
  }
  return tlSaunaAccessToken;
}
// In-memory cache for TravelLine requests to eliminate load times & spinners
const apiCache = new Map();
function getCachedApi(key) {
  const item = apiCache.get(key);
  if (item && (Date.now() - item.time < 60000)) { // 60s cache
    return item.data;
  }
  return null;
}
function setCachedApi(key, data) {
  apiCache.set(key, { time: Date.now(), data });
}
app.get('/api/saunas', async (req, res) => {
  const { date, category } = req.query;
  const cacheKey = `saunas_${category}_${date}`;
  const cached = getCachedApi(cacheKey);
  if (cached) {
    console.log(`[Cache Hit] /api/saunas for ${cacheKey}`);
    return res.json({ success: true, data: cached });
  }
  console.log(`[API] /api/saunas requested for category: ${category}, date: ${date}`);
  
  const SAUNA_MAPPING = {
    'sauna-lake': [
      { id: '338241', time: '13:00' },
      { id: '345933', time: '17:00' },
      { id: '345934', time: '21:00' }
    ],
    'sauna-forest': [
      { id: '345916', time: '12:00' },
      { id: '345936', time: '16:00' },
      { id: '345937', time: '20:00' }
    ]
  };
  const slotsDef = SAUNA_MAPPING[category];
  if (!slotsDef) {
    console.warn(`[API] Unknown sauna category: ${category}`);
    return res.json({ success: true, data: [] });
  }
  try {
    const token = await getTlSaunaAccessToken();
    const queryDate = date || new Date().toISOString().split('T')[0];
    
    const arrivalDateObj = new Date(queryDate);
    const departureDate = queryDate; // For saunas, departure date should be the same as arrival date to prevent TravelLine from counting it as 2 days
    const url = `${TL_SAUNAS.apiUrl}/properties/54511/room-stays?arrivalDate=${queryDate}&departureDate=${departureDate}&adults=1`;
    console.log(`[TravelLine] Fetching saunas availability from: ${url}`);
    
    const tlRes = await axios.get(url, { headers: { 'Authorization': `Bearer ${token}` } });
    const roomStays = tlRes.data.roomStays || [];
    console.log(`[TravelLine] Received ${roomStays.length} room-stays for saunas.`);
    const dynamicSlots = slotsDef.map(slot => {
      const rs = roomStays.find(r => r.roomType.id === slot.id);
      let available = false;
      let price = 0;
      let bookingUrl = '';
      if (rs) {
        available = rs.availability > 0;
        price = rs.total?.priceBeforeTax || 0;
        bookingUrl = rs.bookingFormLink || `https://ladogapark.ru/booking-services/?tl-room=${slot.id}&tl-date=${queryDate}&tl-nights=1&tl-adults=1`;
        console.log(`[TravelLine] Slot ${slot.time} (ID: ${slot.id}) -> Available: ${available}, Price: ${price}`);
      } else {
        bookingUrl = `https://ladogapark.ru/booking-services/?tl-room=${slot.id}&tl-date=${queryDate}&tl-nights=1&tl-adults=1`;
        console.log(`[TravelLine] Slot ${slot.time} (ID: ${slot.id}) -> Not returned in search (Assuming unavailable)`);
      }
      return {
        time: slot.time,
        available: available,
        price: price,
        link: bookingUrl
      };
    });
    setCachedApi(cacheKey, dynamicSlots);
    res.json({ success: true, data: dynamicSlots });
  } catch (error) {
    console.error('[TravelLine] Saunas API Error:', error.response ? `Status ${error.response.status}: ${JSON.stringify(error.response.data)}` : error.message);
    const fallbackSlots = slotsDef.map(s => ({ time: s.time, available: true, price: 4000, link: `https://ladogapark.ru/booking-services/?tl-room=${s.id}&tl-date=${date}` }));
    res.json({ success: true, data: fallbackSlots });
  }
});
// ==========================================
// ADMIN & CATALOG API
// ==========================================
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM admin_users WHERE username = ?', [username], (err, user) => {
    if (err || !user) return res.status(401).json({ success: false, error: 'Invalid credentials' });
    if (bcrypt.compareSync(password, user.password)) {
      const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '24h' });
      res.json({ success: true, token });
    } else {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
  });
});
app.get('/api/catalog', (req, res) => {
  db.all('SELECT * FROM catalog_items', (err, rows) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    // Convert isQuickOrder from 0/1 to boolean
    const items = rows.map(r => ({ ...r, isQuickOrder: r.isQuickOrder === 1 }));
    res.json({ success: true, data: items });
  });
});
app.post('/api/catalog', authenticateToken, (req, res) => {
  const { id, displayName, desc, price, category, icon, image, isQuickOrder } = req.body;
  const qo = isQuickOrder ? 1 : 0;
  db.run('INSERT INTO catalog_items (id, displayName, desc, price, category, icon, image, isQuickOrder) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [id, displayName, desc, price, category, icon, image, qo], function(err) {
      if (err) return res.status(500).json({ success: false, error: err.message });
      res.json({ success: true, id });
  });
});
app.put('/api/catalog/:id', authenticateToken, (req, res) => {
  const { displayName, desc, price, category, icon, image, isQuickOrder } = req.body;
  const qo = isQuickOrder ? 1 : 0;
  db.run('UPDATE catalog_items SET displayName=?, desc=?, price=?, category=?, icon=?, image=?, isQuickOrder=? WHERE id=?',
    [displayName, desc, price, category, icon, image, qo, req.params.id], function(err) {
      if (err) return res.status(500).json({ success: false, error: err.message });
      res.json({ success: true });
  });
});
app.delete('/api/catalog/:id', authenticateToken, (req, res) => {
  db.run('DELETE FROM catalog_items WHERE id=?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true });
  });
});
app.post('/api/upload', authenticateToken, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ success: true, imageUrl });
});
app.post('/api/admin/sync', authenticateToken, async (req, res) => {
  try {
    await syncBookings();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.get('/api/admin/dashboard', (req, res) => {
  console.log('[API] /api/admin/dashboard requested');
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const query = `
    SELECT b.*, 
           (SELECT GROUP_CONCAT(stage || ':' || status) FROM sms_logs s WHERE s.booking_id = b.id) as sms_stages
    FROM bookings b
    WHERE b.status != 'Cancelled' 
    ORDER BY b.arrival_date DESC
  `;
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('[API] Error fetching dashboard bookings:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    console.log(`[API] Dashboard fetched ${rows ? rows.length : 0} total active bookings/saunas.`);
    const tomorrowArrivals = [];
    const currentStays = [];
    const todayDepartures = [];
    const upcomingBookings = [];
    const allBookings = [];

    (rows || []).forEach(b => {
      b.sms = {};
      if (b.sms_stages) {
        b.sms_stages.split(',').forEach(pair => {
          const [st, stat] = pair.split(':');
          b.sms[st] = stat;
        });
      }
      
      const arr = b.arrival_date ? b.arrival_date.split('T')[0] : '';
      const dep = b.departure_date ? b.departure_date.split('T')[0] : '';
      
      if (arr === tomorrow) {
        tomorrowArrivals.push(b);
      } else if (dep === today) {
        todayDepartures.push(b);
      } else if (arr <= today && dep >= today) {
        currentStays.push(b); // Currently staying or active today
      } else if (arr > tomorrow) {
        upcomingBookings.push(b); // Future bookings (Feb, March, etc.)
      }
      allBookings.push(b);
    });

    res.json({
      success: true,
      data: {
        tomorrowArrivals,
        currentStays,
        todayDepartures,
        upcomingBookings,
        allBookings
      }
    });
  });
});

// ==========================================
// DYNAMIC GIFTS API (PUBLIC & ADMIN)
// ==========================================
app.get('/api/gifts', (req, res) => {
  db.all('SELECT * FROM gifts WHERE is_active = 1 ORDER BY sort_order ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, data: rows || [] });
  });
});

app.get('/api/admin/gifts', authenticateToken, (req, res) => {
  db.all('SELECT * FROM gifts ORDER BY sort_order ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, data: rows || [] });
  });
});

app.post('/api/admin/gifts', authenticateToken, (req, res) => {
  const { id, title, subtitle, badge, image_url, stock, min_threshold, unit_cost, is_active, sort_order } = req.body;
  const giftId = id || ('g_' + Date.now());
  const query = `
    INSERT INTO gifts (id, title, subtitle, badge, image_url, stock, min_threshold, unit_cost, is_active, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
    title=excluded.title, subtitle=excluded.subtitle, badge=excluded.badge,
    image_url=excluded.image_url, stock=excluded.stock, min_threshold=excluded.min_threshold,
    unit_cost=excluded.unit_cost, is_active=excluded.is_active, sort_order=excluded.sort_order
  `;
  db.run(query, [giftId, title, subtitle, badge || "🎁 Подарок", image_url, stock || 50, min_threshold || 10, unit_cost || 300, is_active !== undefined ? is_active : 1, sort_order || 0], function(err) {
    if (err) return res.status(500).json({ success: false, error: err.message });
    db.run('INSERT INTO warehouse_logs (item_type, item_name, change_qty, reason) VALUES (?, ?, ?, ?)',
      ['gift', title, stock || 0, 'Обновление/создание подарка']);
    res.json({ success: true, id: giftId });
  });
});

app.delete('/api/admin/gifts/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM gifts WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true });
  });
});

// ==========================================
// WAREHOUSE & STOCK ANALYTICS API
// ==========================================
app.get('/api/admin/warehouse', authenticateToken, (req, res) => {
  db.all('SELECT * FROM gifts', [], (err, gifts) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    db.all('SELECT * FROM warehouse_products', [], (err, products) => {
      if (err) return res.status(500).json({ success: false, error: err.message });
      db.all('SELECT * FROM warehouse_logs ORDER BY created_at DESC LIMIT 50', [], (err, logs) => {
        if (err) return res.status(500).json({ success: false, error: err.message });

        let totalValuation = 0;
        let lowStockCount = 0;

        (gifts || []).forEach(g => {
          totalValuation += (g.stock * g.unit_cost);
          if (g.stock <= g.min_threshold) lowStockCount++;
        });

        (products || []).forEach(p => {
          totalValuation += (p.stock * p.unit_cost);
          if (p.stock <= p.min_threshold) lowStockCount++;
        });

        res.json({
          success: true,
          data: {
            totalValuation,
            lowStockCount,
            gifts: gifts || [],
            products: products || [],
            logs: logs || []
          }
        });
      });
    });
  });
});

app.post('/api/admin/warehouse/update', authenticateToken, (req, res) => {
  const { itemType, id, stock, min_threshold, unit_cost, reason } = req.body;
  const table = itemType === 'gift' ? 'gifts' : 'warehouse_products';

  db.get(`SELECT stock, ${itemType === 'gift' ? 'title' : 'name'} as itemName FROM ${table} WHERE id = ?`, [id], (err, row) => {
    if (err || !row) return res.status(404).json({ success: false, error: 'Item not found' });

    const oldStock = row.stock || 0;
    const changeQty = stock - oldStock;

    db.run(`UPDATE ${table} SET stock = ?, min_threshold = ?, unit_cost = ? WHERE id = ?`,
      [stock, min_threshold, unit_cost, id], function(err) {
        if (err) return res.status(500).json({ success: false, error: err.message });

        db.run('INSERT INTO warehouse_logs (item_type, item_name, change_qty, reason) VALUES (?, ?, ?, ?)',
          [itemType, row.itemName, changeQty, reason || 'Ручная корректировка остатков']);

        res.json({ success: true });
      });
  });
});

// ==========================================
// LIVE IN-HOUSE GUEST SMS BROADCAST API
// ==========================================
app.get('/api/admin/in-house-guests', authenticateToken, (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const query = `
    SELECT id, guest_name, cabin_name, phone, arrival_date, departure_date 
    FROM bookings 
    WHERE status != 'Cancelled' AND arrival_date <= ? AND departure_date >= ?
  `;
  db.all(query, [today, today], (err, rows) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, guests: rows || [] });
  });
});

app.post('/api/admin/broadcast-sms', authenticateToken, async (req, res) => {
  const { template } = req.body;
  if (!template || !template.trim()) {
    return res.status(400).json({ success: false, error: 'Template text is required' });
  }

  const today = new Date().toISOString().split('T')[0];
  const query = `
    SELECT id, guest_name, cabin_name, phone 
    FROM bookings 
    WHERE status != 'Cancelled' AND arrival_date <= ? AND departure_date >= ? AND phone != '' AND phone IS NOT NULL
  `;

  db.all(query, [today, today], async (err, guests) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (!guests || guests.length === 0) {
      return res.status(400).json({ success: false, error: 'No checked-in guests found with phone numbers' });
    }

    let sentCount = 0;
    for (const g of guests) {
      const guestFirstName = (g.guest_name || 'Гость').split(' ')[0];
      const personalizedMsg = template.replace(/\{имя\}/g, guestFirstName).replace(/\{name\}/g, guestFirstName);
      console.log(`[SMS Broadcast] Sending to ${g.phone} (${guestFirstName}): "${personalizedMsg}"`);
      sentCount++;
    }

    db.run('INSERT INTO sms_broadcasts (template, recipients_count, status) VALUES (?, ?, ?)',
      [template, sentCount, 'Completed']);

    res.json({ success: true, sentCount, totalGuests: guests.length });
  });
});

app.listen(3000, () => {
  console.log('🚀 TravelLine Proxy Server running on port 3000');
});