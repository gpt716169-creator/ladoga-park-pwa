const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
  conn.exec("echo | openssl s_client -connect 127.0.0.1:443 -servername xn----btb2aqbl.xn--p1ai", (err, stream) => {
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d));
    stream.stderr.on('data', d => process.stderr.write(d));
    stream.on('close', () => conn.end());
  });
}).connect({ host: '132.243.17.20', port: 22, username: 'root', password: '@bh)/94\\q8o3xBOX' });
