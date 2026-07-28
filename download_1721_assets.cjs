const { Client } = require('ssh2');
const conn = new Client();
const fs = require('fs');

conn.on('ready', () => {
  const files = [
    { remote: '/var/www/ladoga-park/assets/main-Cvt8Ub9Z.js', local: 'C:/Users/Konstantin/.gemini/antigravity/scratch/ladoga-park/vps_recovered_main_1721.js' },
    { remote: '/var/www/ladoga-park/assets/admin-Bq1P_3wx.js', local: 'C:/Users/Konstantin/.gemini/antigravity/scratch/ladoga-park/vps_recovered_admin_1721.js' },
    { remote: '/var/www/ladoga-park/assets/style-_lwd8Fjb.css', local: 'C:/Users/Konstantin/.gemini/antigravity/scratch/ladoga-park/vps_recovered_style_1721.css' }
  ];

  let completed = 0;
  files.forEach(f => {
    conn.exec(`cat ${f.remote}`, (err, stream) => {
      let data = '';
      if (err) throw err;
      stream.on('data', d => { data += d.toString(); });
      stream.on('close', () => {
        fs.writeFileSync(f.local, data, 'utf-8');
        console.log(`Saved ${f.local} (length: ${data.length})`);
        completed++;
        if (completed === files.length) {
          console.log('All 17:21 MSK assets fetched successfully from VPS!');
          conn.end();
        }
      });
    });
  });
}).connect({ host: '132.243.17.20', port: 22, username: 'root', password: '@bh)/94\\q8o3xBOX' });
