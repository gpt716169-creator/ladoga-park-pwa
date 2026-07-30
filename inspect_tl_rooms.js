import axios from 'axios';
import qs from 'qs';

const TL_CABINS = {
  propertyId: '52159',
  connection: 'api_connection_9d1aa_ca2fef1de5',
  key: 'CHXoevsKt6nKJqQZs2bJxL7zlFMUydrx',
  authUrl: 'https://partner.tlintegration.com/auth/token',
  apiUrl: 'https://partner.tlintegration.com/api/read-reservation/v1'
};

async function inspectBookings() {
  const auth = await axios.post(TL_CABINS.authUrl, qs.stringify({
    grant_type: 'client_credentials',
    client_id: TL_CABINS.connection,
    client_secret: TL_CABINS.key
  }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
  const token = auth.data.access_token;

  const numbers = ['20260730-52159-454100769', '20260730-52159-454199493'];
  for (let num of numbers) {
    const detailRes = await axios.get(TL_CABINS.apiUrl + '/properties/52159/bookings/' + num, {
       headers: { 'Authorization': 'Bearer ' + token }
    });
    console.log('--- BOOKING ' + num + ' ---');
    console.log(JSON.stringify(detailRes.data.booking, null, 2));
  }
}

inspectBookings().catch(console.error);
