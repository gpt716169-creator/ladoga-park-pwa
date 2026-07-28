const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
  const cmd = `certbot --nginx --cert-name xn----btb2aqbl.xn--p1ai -d xn----btb2aqbl.xn--p1ai -d www.xn----btb2aqbl.xn--p1ai -d лп-спб.рф -d www.лп-спб.рф --key-type rsa --expand --non-interactive --agree-tos -m admin@ladogapark.ru --redirect`;
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d));
    stream.stderr.on('data', d => process.stderr.write(d));
    stream.on('close', () => {
      console.log('Certbot expand complete');
      conn.end();
    });
  });
}).connect({ host: '132.243.17.20', port: 22, username: 'root', password: '@bh)/94\\q8o3xBOX' });
