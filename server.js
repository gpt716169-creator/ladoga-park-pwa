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
async function syncBookings() {
  console.log('[Sync] Starting TravelLine sync...');
  try {
    const token = await getTlAccessToken();
    let url = `${TL_CABINS.apiUrl}/properties/${TL_CABINS.propertyId}/bookings`;
    let hasMore = true;
    let allSummaries = [];

    while (hasMore) {
      const res = await axios.get(url, { headers: { 'Authorization': `Bearer ${token}` } });
      const summaries = res.data.bookingSummaries || [];
      allSummaries = allSummaries.concat(summaries);
      
      if (res.data.hasMoreData && res.data.continueToken) {
         url = `${TL_CABINS.apiUrl}/properties/${TL_CABINS.propertyId}/bookings?continueToken=${encodeURIComponent(res.data.continueToken)}`;
      } else {
         hasMore = false;
      }
    }
    
    // We only care about non-cancelled bookings that might intersect with our current dates.
    // To avoid fetching thousands of details, we only fetch details for active bookings that changed.
    const activeSummaries = allSummaries.filter(s => s.status !== 'Cancelled');
    
    // Process them backwards so we do newest first
    for (let i = activeSummaries.length - 1; i >= Math.max(0, activeSummaries.length - 200); i--) {
      const summary = activeSummaries[i];
      // Check if we need to update it
      const existing = await new Promise((resolve) => db.get('SELECT modified_at, status FROM bookings WHERE id = ?', [summary.number], (err, row) => resolve(row)));
      
      if (!existing || existing.modified_at !== summary.modifiedDateTime || existing.status !== summary.status) {
        // Fetch details
        try {
          const detailRes = await axios.get(`${TL_CABINS.apiUrl}/properties/${TL_CABINS.propertyId}/bookings/${summary.number}`, {
             headers: { 'Authorization': `Bearer ${token}` }
          });
          const b = detailRes.data.booking;
          if (b && b.roomStays && b.roomStays[0]) {
            const rs = b.roomStays[0];
            let guestName = b.customer?.firstName || rs.guests?.[0]?.firstName || "Гость";
            guestName = guestName.replace(/\*/g, '').trim() || "Гость";
            const phone = b.customer?.phone || "";
            const cabin = rs.roomType?.name || "Домик";
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
          console.error(`[Sync] Failed to fetch details for ${summary.number}`);
        }
      }
    }
    console.log('[Sync] TravelLine sync completed. Processed ' + allSummaries.length + ' total summaries.');
  } catch (err) {
    console.error('[Sync] Error:', err.message);
  }
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

// ==========================================
// SAUNA AVAILABILITY PROXY
// ==========================================
app.get('/api/saunas/availability', async (req, res) => {
  try {
    const token = await getTlSaunaAccessToken();
    
    // We do a basic search to verify API connectivity.
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const url = `${TL_SAUNAS.apiUrl}/properties/${TL_SAUNAS.propertyId}/room-stays?arrivalDate=${today}&departureDate=${tomorrow}&adults=1`;
    
    try {
      const response = await axios.get(url, {
        headers: { 'Authorization': `Bearer ${token}` },
        timeout: 5000
      });
      console.log('TravelLine Saunas API Connectivity Success!');
    } catch (apiErr) {
      console.warn('TravelLine Saunas Search returned an error (often due to PMS unmapped resources), falling back to mock data.', apiErr.response?.status);
    }
    
    // Return mock slots until TL supports hourly resource mapping via Partner API
    const dynamicSlots = [
      { time: '12:00', available: true, price: 4000 },
      { time: '15:00', available: true, price: 4500 },
      { time: '18:00', available: true, price: 5500 },
      { time: '21:00', available: false, price: 5500 }
    ];
    setCachedApi(cacheKey, dynamicSlots);
    res.json({ success: true, data: dynamicSlots });
    
  } catch (error) {
    console.error('TravelLine Saunas Auth Error:', error.message);
    res.json({ success: false, error: 'TravelLine API unavailable' });
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
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  db.all(`
    SELECT b.*, 
           (SELECT GROUP_CONCAT(stage || ':' || status) FROM sms_logs s WHERE s.booking_id = b.id) as sms_stages
    FROM bookings b
    WHERE b.status = 'Confirmed' 
      AND (b.arrival_date IN (?, ?, ?) OR b.departure_date IN (?, ?, ?) OR (? >= b.arrival_date AND ? < b.departure_date))
    ORDER BY b.arrival_date ASC
  `, [yesterday, today, tomorrow, yesterday, today, tomorrow, today, today], (err, rows) => {
    if (err) return res.status(500).json({ success: false, error: 'Database error' });
    
    const dashboard = { tomorrowArrivals: [], currentStays: [], todayDepartures: [] };

    rows.forEach(row => {
      const sms = {};
      if (row.sms_stages) {
        row.sms_stages.split(',').forEach(s => {
          const parts = s.split(':');
          sms[parts[0]] = parts[1];
        });
      }
      row.sms = sms;

      if (row.arrival_date === tomorrow) {
        dashboard.tomorrowArrivals.push(row);
      } else if (row.departure_date === today) {
        dashboard.todayDepartures.push(row);
      } else if (today >= row.arrival_date && today < row.departure_date) {
        dashboard.currentStays.push(row);
      } else if (row.arrival_date === today) {
        dashboard.currentStays.push(row);
      }
    });

    res.json({ success: true, data: dashboard });
  });
});

app.post('/api/admin/sync', async (req, res) => {
  await syncBookings();
  res.json({ success: true });
});

app.use(express.static(path.join(__dirname, 'dist')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 TravelLine Proxy Server running on port ${PORT}`);
});
