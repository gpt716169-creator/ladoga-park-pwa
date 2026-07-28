const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
  const cmd = `
rm -rf /etc/letsencrypt/live/xn----btb2aqbl.xn--p1ai*
rm -rf /etc/letsencrypt/archive/xn----btb2aqbl.xn--p1ai*
rm -rf /etc/letsencrypt/renewal/xn----btb2aqbl.xn--p1ai*
certbot certonly --standalone -d xn----btb2aqbl.xn--p1ai -d www.xn----btb2aqbl.xn--p1ai --key-type rsa --non-interactive --agree-tos -m admin@ladogapark.ru
`;
  // Stop nginx briefly to allow standalone port 80 check
  conn.exec('systemctl stop nginx && ' + cmd + ' && systemctl start nginx', (err, stream) => {
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d));
    stream.stderr.on('data', d => process.stderr.write(d));
    stream.on('close', () => {
      console.log('Clean fresh RSA SSL cert generation complete!');
      conn.end();
    });
  });
}).connect({ host: '132.243.17.20', port: 22, username: 'root', password: '@bh)/94\\q8o3xBOX' });
