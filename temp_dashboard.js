app.get('/api/admin/dashboard', (req, res) => {
  console.log('[API] /api/admin/dashboard requested');
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const query = `
    SELECT b.*, 
           (SELECT GROUP_CONCAT(stage || ':' || status) FROM sms_logs s WHERE s.booking_id = b.id) as sms_stages
    FROM bookings b
    WHERE b.status = 'Confirmed' 
      AND (
        date(b.arrival_date) = date(?, '+1 day') OR 
        (date(b.arrival_date) <= date(?) AND date(b.departure_date) > date(?)) OR
        date(b.departure_date) = date(?)
      )
  `;

  db.all(query, [today, today, today, today], (err, rows) => {
    if (err) {
      console.error('[API] Error fetching dashboard bookings:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    console.log(`[API] Dashboard fetched ${rows ? rows.length : 0} active bookings for today.`);

    const tomorrowArrivals = [];
    const currentStays = [];
    const todayDepartures = [];

    rows.forEach(b => {
      b.sms = {};
      if (b.sms_stages) {
        b.sms_stages.split(',').forEach(pair => {
          const [st, stat] = pair.split(':');
          b.sms[st] = stat;
        });
      }
      
      const arr = b.arrival_date.split('T')[0];
      const dep = b.departure_date.split('T')[0];
      
      if (arr === tomorrow) {
        tomorrowArrivals.push(b);
      } else if (dep === today) {
        todayDepartures.push(b);
      } else {
        currentStays.push(b);
      }
    });

    res.json({
      success: true,
      data: {
        tomorrowArrivals,
        currentStays,
        todayDepartures
      }
    });
  });
});

app.listen(3000, () => {
  console.log('🚀 TravelLine Proxy Server running on port 3000');
});