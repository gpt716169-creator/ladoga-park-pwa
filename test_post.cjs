const axios = require('axios');
const querystring = require('querystring');
async function run() {
  let res = await axios.post('https://partner.tlintegration.com/auth/token', 
    querystring.stringify({ client_id: 'api_connection_bca5a_50c3f923e5', client_secret: 'r1gtgA2UGey3D9swHDL01edbEPUEBZz3', grant_type: 'client_credentials' }), 
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  const token = res.data.access_token;
  
  const payload = {
    stayDates: { arrivalDateTime: '2026-07-30', departureDateTime: '2026-07-31' },
    occupancies: [{ adults: 1, children: [] }]
  };
  
  try {
    let tlRes = await axios.post('https://partner.tlintegration.com/api/search/v1/properties/54511/room-stays', payload, { headers: { 'Authorization': 'Bearer ' + token } });
    let rs = tlRes.data.roomStays || [];
    if (rs.length > 0) {
      console.log('Prices POST adults: 1');
      rs.forEach(r => console.log('  ', r.roomType.id, r.total.priceBeforeTax));
    }
  } catch(e) {
    console.error(e.response ? e.response.data : e.message);
  }
}
run().catch(console.error);