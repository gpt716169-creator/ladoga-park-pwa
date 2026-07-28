const axios = require('axios');
const qs = require('qs');
async function test() {
  try {
    const auth = await axios.post('https://partner.tlintegration.com/auth/token', qs.stringify({
      grant_type: 'client_credentials',
      client_id: 'api_connection_bca5a_50c3f923e5',
      client_secret: 'r1gtgA2UGey3D9swHDL01edbEPUEBZz3'
    }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
    const token = auth.data.access_token;
    
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const url = 'https://partner.tlintegration.com/api/search/v1/properties/54511/room-stays?arrivalDate=' + today + '&departureDate=' + tomorrow + '&adults=1';
    
    const res = await axios.get(url, { headers: { 'Authorization': 'Bearer ' + token } });
    
    const seen = new Set();
    for (let r of res.data.roomStays) {
       const id = r.roomType.id;
       if (seen.has(id)) continue;
       seen.add(id);
       const htmlRes = await axios.get(r.bookingFormLink);
       
       const match = htmlRes.data.match(new RegExp(`"id":${id}.*?(?:"name"|"title"):"([^"]+)"`));
       if (match) {
         console.log(id, match[1]);
       } else {
         const match2 = htmlRes.data.match(new RegExp(`"${id}".{0,100}?"([^"]*Баня[^"]*)"`));
         if(match2) console.log(id, match2[1]);
         else {
             // Let's just find anything near the ID
             console.log(id, 'Not found automatically');
         }
       }
    }
  } catch(e) {
    console.log(e.message);
  }
}
test();