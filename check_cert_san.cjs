const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
  conn.exec('openssl x509 -in /etc/letsencrypt/live/xn----btb2aqbl.xn--p1ai/fullchain.pem -text -noout', (err, stream) => {
    if (err) throw err;
    stream.on('data', d => {
      const text = d.toString();
      if (text.includes('Subject Alternative Name') || text.includes('DNS:')) {
        console.log(text.substring(text.indexOf('Subject Alternative Name'), text.indexOf('Subject Alternative Name') + 200));
      }
    });
    stream.stderr.on('data', d => process.stdout.write(d));
    stream.on('close', () => conn.end());
  });
}).connect({ host: '132.243.17.20', port: 22, username: 'root', password: '@bh)/94\\q8o3xBOX' });
