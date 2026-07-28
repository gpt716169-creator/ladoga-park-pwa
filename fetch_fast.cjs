const axios = require('axios');
const qs = require('qs');
async function test() {
  try {
    const auth = await axios.post('https://partner.tlintegration.com/auth/token', qs.stringify({
      grant_type: 'client_credentials',
      client_id: 'api_connection_9d1aa_ca2fef1de5',
      client_secret: 'CHXoevsKt6nKJqQZs2bJxL7zlFMUydrx'
    }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
    const token = auth.data.access_token;
    
    let url = 'https://partner.tlintegration.com/api/read-reservation/v1/properties/52159/bookings';
    let hasMore = true;
    let allSummaries = [];
    
    while(hasMore) {
      const res = await axios.get(url, { headers: { 'Authorization': 'Bearer ' + token } });
      const summaries = res.data.bookingSummaries || [];
      allSummaries = allSummaries.concat(summaries);
      
      if(res.data.hasMoreData && res.data.continueToken) {
         url = 'https://partner.tlintegration.com/api/read-reservation/v1/properties/52159/bookings?continueToken=' + encodeURIComponent(res.data.continueToken);
      } else {
         hasMore = false;
      }
    }
    
    let active = allSummaries.filter(s => s.status !== 'Cancelled');
    let recentActive = active.slice(-50); // Last 50 modified active bookings
    
    let todayBookings = [];
    const today = '2026-07-28';
    
    for(let i = recentActive.length - 1; i >= 0; i--) {
        const s = recentActive[i];
        try {
           const d = await axios.get('https://partner.tlintegration.com/api/read-reservation/v1/properties/52159/bookings/' + s.number, { headers: { 'Authorization': 'Bearer ' + token } });
           const b = d.data.booking;
           if (b && b.roomStays && b.roomStays[0]) {
               const rs = b.roomStays[0];
               const arr = rs.stayDates.arrivalDateTime.split('T')[0];
               const dep = rs.stayDates.departureDateTime.split('T')[0];
               if (arr === today || dep === today || (arr <= today && dep > today)) {
                   todayBookings.push({
                      guest: b.customer?.firstName || rs.guests?.[0]?.firstName || 'Гость',
                      cabin: rs.roomType?.name || 'Домик',
                      arr: arr,
                      dep: dep
                   });
               }
           }
        } catch(e) {}
    }
    
    console.log('--- РЕАЛЬНЫЕ БРОНИ НА СЕГОДНЯ ---');
    if (todayBookings.length === 0) console.log('Нет активных броней на сегодня.');
    todayBookings.forEach(b => console.log(b.guest + ' | ' + b.cabin + ' | ' + b.arr + ' - ' + b.dep));
    
  } catch(e) {
    console.log(e.message);
  }
}
test();