const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('/var/www/ladoga-park/database.sqlite');

function getMSKDate(offsetDays = 0) {
  const d = new Date(Date.now() + offsetDays * 86400000);
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Moscow', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}

const today = getMSKDate(0);
const tomorrow = getMSKDate(1);

console.log('MSK TODAY:', today, 'TOMORROW:', tomorrow);

db.all("SELECT id, guest_name, cabin_name, arrival_date, departure_date, status FROM bookings WHERE status != 'Cancelled' AND substr(arrival_date, 1, 4) >= '2025'", [], (err, rows) => {
  if (err) { console.error(err); return; }
  console.log('TOTAL ROWS IN DB:', rows.length);

  const tomorrowArrivals = [];
  const todayArrivals = [];
  const currentStays = [];

  rows.forEach(b => {
    const cabinLower = (b.cabin_name || '').toLowerCase();
    const guestLower = (b.guest_name || '').toLowerCase();
    if (cabinLower.includes('техн') || guestLower.includes('техн') || cabinLower.includes('категория') || guestLower.includes('категория')) {
      return;
    }
    const arr = b.arrival_date ? b.arrival_date.split('T')[0] : '';
    const dep = b.departure_date ? b.departure_date.split('T')[0] : '';

    if (arr === tomorrow) {
      tomorrowArrivals.push(b);
    } else if (arr === today) {
      todayArrivals.push(b);
    } else if (arr < today && dep >= today) {
      currentStays.push(b);
    }
  });

  console.log('TOMORROW ARRIVALS (' + tomorrowArrivals.length + '):', tomorrowArrivals.map(x => `${x.guest_name} (${x.cabin_name})`));
  console.log('TODAY ARRIVALS (' + todayArrivals.length + '):', todayArrivals.map(x => `${x.guest_name} (${x.cabin_name})`));
  console.log('CURRENT STAYS (' + currentStays.length + '):', currentStays.map(x => `${x.guest_name} (${x.cabin_name})`));
});
