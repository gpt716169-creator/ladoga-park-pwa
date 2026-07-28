const axios = require('axios');
const querystring = require('querystring');

async function testSaunaPrice() {
  const credentials = Buffer.from('52159:api_connection_9d1aa_ca2fef1de5:CHXoevsKt6nKJqQZs2bJxL7zlFMUydrx').toString('base64');
  let res = await axios.post('https://extranet.travelline.ru/api/auth/token', 
    querystring.stringify({ grant_type: 'client_credentials' }), 
    { headers: { 'Authorization': `Basic ${credentials}`, 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  const token = res.data.access_token;
  const date = '2026-07-30';
  const dep = '2026-07-31';

  // Try different adults params
  const urls = [
    `https://extranet.travelline.ru/api/extranet/v1/properties/54511/room-stays?arrivalDate=${date}&departureDate=${dep}`,
    `https://extranet.travelline.ru/api/extranet/v1/properties/54511/room-stays?arrivalDate=${date}&departureDate=${dep}&adults=1`,
    `https://extranet.travelline.ru/api/extranet/v1/properties/54511/room-stays?arrivalDate=${date}&departureDate=${dep}&occupancy=1`,
  ];

  for (let url of urls) {
    try {
      console.log('Fetching:', url);
      const tlRes = await axios.get(url, { headers: { 'Authorization': `Bearer ${token}` } });
      const roomStays = tlRes.data.roomStays || [];
      if (roomStays.length > 0) {
         console.log(`Price for room ${roomStays[0].roomType.name}: ${roomStays[0].total.priceBeforeTax}`);
      }
    } catch(e) {
      console.error(e.message);
    }
  }
}

testSaunaPrice();