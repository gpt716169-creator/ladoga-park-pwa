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
    let count = 0;
    let hasMore = true;
    
    while(hasMore && count < 10000) {
      const res = await axios.get(url, { headers: { 'Authorization': 'Bearer ' + token } });
      const summaries = res.data.bookingSummaries || [];
      
      if (count === 0 && summaries.length > 0) {
         console.log('First booking modified:', summaries[0].modifiedDateTime);
      }
      
      count += summaries.length;
      
      if(res.data.hasMoreData && res.data.continueToken) {
         url = 'https://partner.tlintegration.com/api/read-reservation/v1/properties/52159/bookings?continueToken=' + encodeURIComponent(res.data.continueToken);
      } else {
         hasMore = false;
         if (summaries.length > 0) {
            console.log('Last booking modified:', summaries[summaries.length-1].modifiedDateTime);
         }
      }
    }
    
    console.log('Total bookings in TravelLine:', count);
  } catch(e) {
    console.log(e.message);
  }
}
test();