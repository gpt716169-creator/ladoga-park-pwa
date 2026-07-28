const axios = require('axios');
const querystring = require('querystring');
async function run() {
  let res = await axios.post('https://partner.tlintegration.com/auth/token', 
    querystring.stringify({ client_id: 'api_connection_bca5a_50c3f923e5', client_secret: 'r1gtgA2UGey3D9swHDL01edbEPUEBZz3', grant_type: 'client_credentials' }), 
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  const token = res.data.access_token;
  
  const urls = [
    'https://partner.tlintegration.com/api/search/v1/properties/54511/room-stays?arrivalDate=2026-07-30&departureDate=2026-07-31',
    'https://partner.tlintegration.com/api/search/v1/properties/54511/room-stays?arrivalDate=2026-07-30&departureDate=2026-07-31&adults=1',
    'https://partner.tlintegration.com/api/search/v1/properties/54511/room-stays?arrivalDate=2026-07-30&departureDate=2026-07-31&adults=2'
  ];
  for (let u of urls) {
    console.log('Testing:', u);
    let tlRes = await axios.get(u, { headers: { 'Authorization': 'Bearer ' + token } });
    let rs = tlRes.data.roomStays || [];
    if (rs.length > 0) {
      console.log('Prices:');
      rs.forEach(r => console.log('  ', r.roomType.id, r.total.priceBeforeTax));
    }
  }
}
run().catch(console.error);