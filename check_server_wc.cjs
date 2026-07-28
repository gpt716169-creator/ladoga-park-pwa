const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec('wc -l /var/www/ladoga-park/server.js', (err, stream) => {
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