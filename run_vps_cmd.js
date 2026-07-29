import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

async function run() {
  await ssh.connect({
    host: '132.243.17.20',
    username: 'root',
    password: '@bh)/94\\q8o3xBOX'
  });

  const scriptContent = `
    const axios = require('/var/www/ladoga-park/node_modules/axios');
    const qs = require('/var/www/ladoga-park/node_modules/qs');
    const sqlite3 = require('/var/www/ladoga-park/node_modules/sqlite3');
    const db = new sqlite3.Database('/var/www/ladoga-park/database.sqlite');

    const TL_CABINS = {
      propertyId: '52159',
      connection: 'api_connection_9d1aa_ca2fef1de5',
      key: 'CHXoevsKt6nKJqQZs2bJxL7zlFMUydrx',
      authUrl: 'https://partner.tlintegration.com/auth/token',
      apiUrl: 'https://partner.tlintegration.com/api/read-reservation/v1'
    };

    async function debugSync() {
      const auth = await axios.post(TL_CABINS.authUrl, qs.stringify({
        grant_type: 'client_credentials',
        client_id: TL_CABINS.connection,
        client_secret: TL_CABINS.key
      }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
      const token = auth.data.access_token;

      let continueToken = null;
      let hasMore = true;
      const allSummaries = [];

      while (hasMore) {
        let url = TL_CABINS.apiUrl + '/properties/52159/bookings';
        if (continueToken) url += '?continueToken=' + encodeURIComponent(continueToken);
        const res = await axios.get(url, { headers: { 'Authorization': 'Bearer ' + token } });
        const list = res.data.bookingSummaries || [];
        allSummaries.push(...list);
        continueToken = res.data.continueToken;
        hasMore = !!(res.data.hasMoreData && continueToken);
        console.log('Fetched page, total summaries so far:', allSummaries.length);
      }

      console.log('TOTAL SUMMARIES:', allSummaries.length);
      const yuliaSummaryIndex = allSummaries.findIndex(x => x.number === '20260730-52159-454100769');
      console.log('Yulia summary index in allSummaries:', yuliaSummaryIndex);

      const activeSummaries = allSummaries.filter(s => s.status !== 'Cancelled');
      console.log('TOTAL ACTIVE SUMMARIES:', activeSummaries.length);
      const yuliaActiveIndex = activeSummaries.findIndex(x => x.number === '20260730-52159-454100769');
      console.log('Yulia active index in activeSummaries:', yuliaActiveIndex);

      const startIndex = activeSummaries.length - 1;
      const endIndex = Math.max(0, activeSummaries.length - 300);
      console.log('Sync loop range:', startIndex, 'down to', endIndex);
      console.log('Is Yulia active index (' + yuliaActiveIndex + ') inside range [' + endIndex + ', ' + startIndex + ']? ', (yuliaActiveIndex >= endIndex && yuliaActiveIndex <= startIndex));
      
      if (yuliaActiveIndex >= 0) {
        console.log('Yulia summary details:', activeSummaries[yuliaActiveIndex]);
      }
    }

    debugSync().catch(console.error);
  `;

  await ssh.execCommand("cat << 'EOF' > /var/www/ladoga-park/debug_sync.cjs\n" + scriptContent + "\nEOF");
  const res = await ssh.execCommand('node /var/www/ladoga-park/debug_sync.cjs');
  console.log('STDOUT:\n', res.stdout);
  if (res.stderr) console.error('STDERR:\n', res.stderr);
  ssh.dispose();
}

run().catch(console.error);
