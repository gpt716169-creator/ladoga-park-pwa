const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const script = `
    const axios = require('axios');
    const querystring = require('querystring');
    async function run() {
      const creds = Buffer.from('52159:api_connection_9d1aa_ca2fef1de5:CHXoevsKt6nKJqQZs2bJxL7zlFMUydrx').toString('base64');
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
        let tlRes = await axios.post('https://partner.tlintegration.com/api/search/v1/properties/54511/room-stays', payload, { headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' } });
        console.log("SUCCESS");
        console.log(JSON.stringify(tlRes.data, null, 2));
      } catch(e) {
        console.log("ERROR");
        console.log(e.response ? JSON.stringify(e.response.data, null, 2) : e.message);
      }
    }
    run().catch(e => console.log("CATCH ERR:", e.message));
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