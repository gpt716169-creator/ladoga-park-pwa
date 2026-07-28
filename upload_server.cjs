const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.sftp((err, sftp) => {
    if (err) throw err;
    sftp.fastPut('server.js', '/var/www/ladoga-park/server.js', (err) => {
      if (err) throw err;
      conn.exec('pm2 restart ladoga-park', (err, stream) => {
        if (err) throw err;
        stream.on('data', d => process.stdout.write(d));
        stream.on('close', () => conn.end());
      });
    });
  });
}).connect({
  host: '132.243.17.20',
  port: 22,
  username: 'root',
  password: '@bh)/94\\q8o3xBOX'
});