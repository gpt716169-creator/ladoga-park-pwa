const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const script = `
    const axios = require('axios');
    const querystring = require('querystring');
    async function run() {
      const creds = Buffer.from('52159:api_connection_9d1aa_ca2fef1de5:CHXoevsKt6nKJqQZs2bJxL7zlFMUydrx').toString('base64');
      let res = await axios.post('https://extranet.travelline.ru/api/auth/token', 
        querystring.stringify({ grant_type: 'client_credentials' }), 
        { headers: { 'Authorization': 'Basic ' + creds, 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      const token = res.data.access_token;
      
      const urls = [
        'https://extranet.travelline.ru/api/extranet/v1/properties/54511/room-stays?arrivalDate=2026-07-30&departureDate=2026-07-31',
        'https://extranet.travelline.ru/api/extranet/v1/properties/54511/room-stays?arrivalDate=2026-07-30&departureDate=2026-07-31&adults=1',
        'https://extranet.travelline.ru/api/extranet/v1/properties/54511/room-stays?arrivalDate=2026-07-30&departureDate=2026-07-31&occupancy=1'
      ];
      for (let u of urls) {
        console.log('Testing:', u);
        let tlRes = await axios.get(u, { headers: { 'Authorization': 'Bearer ' + token } });
        let rs = tlRes.data.roomStays || [];
        if (rs.length > 0) {
          console.log('Price:', rs[0].total.priceBeforeTax);
        }
      }
    }
    run().catch(console.error);
  `;
  conn.exec(`cd /var/www/ladoga-park && node -e "${script.replace(/"/g, '\\"')}"`, (err, stream) => {
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d));
    stream.stderr.on('data', d => process.stderr.write(d));
    stream.on('close', () => conn.end());
  });
}).connect({
  host: '132.243.17.20',
  port: 22,
  username: 'root',
  password: '@bh)/94\\q8o3xBOX'
});