const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  console.log('Installing Certbot and generating SSL...');
  const cmd = 'apt-get update && apt-get install -y certbot python3-certbot-nginx && certbot --nginx -d xn----btb2aqbl.xn--p1ai --non-interactive --agree-tos -m admin@ladogapark.ru --redirect';
  conn.exec(cmd, (err, stream) => {
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