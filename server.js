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
// ==========================================
// SMS CRON JOB & DB SYNC SYSTEM
// ==========================================
// We sync with TL API to update local cache
async function syncPropertyBookings(config, defaultName) {
  try {
    const isSauna = config.propertyId === TL_SAUNAS.propertyId;
    const token = isSauna ? await getTlSaunaAccessToken() : await getTlAccessToken();
    let url = `${config.apiUrl}/properties/${config.propertyId}/bookings`;
    let hasMore = true;
    let allSummaries = [];
    while (hasMore) {
      const res = await axios.get(url, { headers: { 'Authorization': `Bearer ${token}` } });
      const summaries = res.data.bookingSummaries || [];
      allSummaries = allSummaries.concat(summaries);
      
      if (res.data.hasMoreData && res.data.continueToken) {
         url = `${config.apiUrl}/properties/${config.propertyId}/bookings?continueToken=${encodeURIComponent(res.data.continueToken)}`;
      } else {
         hasMore = false;
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
            const cabin = rs.roomType?.name || defaultName;
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
    const cabinName = roomStay.roomType ? roomStay.roomType.name : "Домик";
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
        canExtend
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
      } else {
        currentStays.push(b);
      }
      allBookings.push(b);
    });

    res.json({
      success: true,
      data: {
        tomorrowArrivals,
        currentStays,
        todayDepartures,
        allBookings
      }
    });
  });
});
app.listen(3000, () => {
  console.log('🚀 TravelLine Proxy Server running on port 3000');
});