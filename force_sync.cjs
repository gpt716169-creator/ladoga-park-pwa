const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const script = `
    const axios = require('axios');
    const sqlite3 = require('sqlite3');
    const db = new sqlite3.Database('/var/www/ladoga-park/database.sqlite');
    
    // API Keys provided by user
    const TL_CABINS = {
      propertyId: '52159',
      connection: 'api_connection_9d1aa_ca2fef1de5',
      key: 'CHXoevsKt6nKJqQZs2bJxL7zlFMUydrx',
      authUrl: 'https://partner.tlintegration.com/auth/token',
      apiUrl: 'https://partner.tlintegration.com/api/read-reservation/v1' 
    };
    
    let tlAccessToken = null;
    let tokenExpiresAt = 0;
    
    async function getTlAccessToken() {
      const now = Date.now();
      if (!tlAccessToken || now > tokenExpiresAt - 60000) {
        const qs = require('qs');
        const response = await axios.post(TL_CABINS.authUrl, qs.stringify({
          grant_type: 'client_credentials',
          client_id: TL_CABINS.connection,
          client_secret: TL_CABINS.key
        }), {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        tlAccessToken = response.data.access_token;
        tokenExpiresAt = now + (response.data.expires_in * 1000);
      }
      return tlAccessToken;
    }
    
    async function syncBookings() {
      console.log('[Sync] Starting TravelLine sync...');
      try {
        const token = await getTlAccessToken();
        let url = \`\${TL_CABINS.apiUrl}/properties/\${TL_CABINS.propertyId}/bookings\`;
        let hasMore = true;
        let allSummaries = [];
    
        while (hasMore) {
          const res = await axios.get(url, { headers: { 'Authorization': \`Bearer \${token}\` } });
          const summaries = res.data.bookingSummaries || [];
          allSummaries = allSummaries.concat(summaries);
          
          if (res.data.hasMoreData && res.data.continueToken) {
             url = \`\${TL_CABINS.apiUrl}/properties/\${TL_CABINS.propertyId}/bookings?continueToken=\${encodeURIComponent(res.data.continueToken)}\`;
          } else {
             hasMore = false;
          }
        }
        
        const activeSummaries = allSummaries.filter(s => s.status !== 'Cancelled');
        
        for (let i = activeSummaries.length - 1; i >= Math.max(0, activeSummaries.length - 200); i--) {
          const summary = activeSummaries[i];
          const existing = await new Promise((resolve) => db.get('SELECT modified_at, status FROM bookings WHERE id = ?', [summary.number], (err, row) => resolve(row)));
          
          if (!existing || existing.modified_at !== summary.modifiedDateTime || existing.status !== summary.status) {
            try {
              const detailRes = await axios.get(\`\${TL_CABINS.apiUrl}/properties/\${TL_CABINS.propertyId}/bookings/\${summary.number}\`, {
                 headers: { 'Authorization': \`Bearer \${token}\` }
              });
              const b = detailRes.data.booking;
              if (b && b.roomStays && b.roomStays[0]) {
                const rs = b.roomStays[0];
                let guestName = b.customer?.firstName || rs.guests?.[0]?.firstName || "Гость";
                guestName = guestName.replace(/\\*/g, '').trim() || "Гость";
                const phone = b.customer?.phone || "";
                const cabin = rs.roomType?.name || "Домик";
                const arr = rs.stayDates.arrivalDateTime.split('T')[0];
                const dep = rs.stayDates.departureDateTime.split('T')[0];
                
                db.run(\`INSERT INTO bookings (id, guest_name, cabin_name, arrival_date, departure_date, status, phone, modified_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT(id) DO UPDATE SET 
                        guest_name=excluded.guest_name, cabin_name=excluded.cabin_name,
                        arrival_date=excluded.arrival_date, departure_date=excluded.departure_date,
                        status=excluded.status, phone=excluded.phone, modified_at=excluded.modified_at\`,
                  [summary.number, guestName, cabin, arr, dep, summary.status, phone, summary.modifiedDateTime]);
              }
            } catch (detailErr) {}
          }
        }
        console.log('[Sync] Done.');
      } catch (err) {
        console.error('[Sync] Error:', err.message);
      }
    }
    syncBookings();
  `;
  conn.exec(`cd /var/www/ladoga-park && node -e "${script.replace(/"/g, '\\"')}"`, (err, stream) => {
    if (err) throw err;
    let data = '';
    stream.on('data', d => data += d).on('close', () => {
      console.log('Sync execution:', data);
      conn.end();
    });
    stream.stderr.on('data', d => data += d);
  });
}).connect({
  host: '132.243.17.20',
  port: 22,
  username: 'root',
  password: '@bh)/94\\q8o3xBOX'
});