const { Client } = require('ssh2');
const conn = new Client();
const fs = require('fs');

conn.on('ready', () => {
  conn.exec('cat /var/www/ladoga-park/assets/main-Cvt8Ub9Z.js', (err, stream) => {
    let data = '';
    if (err) throw err;
    stream.on('data', d => { data += d.toString(); });
    stream.stderr.on('data', d => process.stderr.write(d));
    stream.on('close', () => {
      console.log('Fetched main-Cvt8Ub9Z.js from VPS, length:', data.length);
      fs.writeFileSync('C:/Users/Konstantin/.gemini/antigravity/scratch/ladoga-park/vps_main_1721.js', data, 'utf-8');
      conn.end();
    });
  });
}).connect({ host: '132.243.17.20', port: 22, username: 'root', password: '@bh)/94\\q8o3xBOX' });
