const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
  const cmd = `
echo "=== 1. VPS /var/www/ DIR LISTING ==="
ls -la -t /var/www/
echo "=== 2. VPS /var/www/ladoga-park DIR LISTING ==="
ls -la -t /var/www/ladoga-park/
echo "=== 3. VPS /var/www/ladoga-park/dist/assets/ LISTING ==="
ls -la -t /var/www/ladoga-park/dist/assets/ 2>/dev/null || ls -la -t /var/www/ladoga-park/assets/ 2>/dev/null
echo "=== 4. SEARCHING FOR .map FILES ON VPS ==="
find /var/www /root /tmp -name "*.map" 2>/dev/null
echo "=== 5. SEARCHING FOR OTHER PROJECTS OR BACKUPS ==="
find /var/www /root /tmp -maxdepth 3 -name "*.js" 2>/dev/null
`;
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d));
    stream.stderr.on('data', d => process.stderr.write(d));
    stream.on('close', () => {
      console.log('VPS Audit complete!');
      conn.end();
    });
  });
}).connect({ host: '132.243.17.20', port: 22, username: 'root', password: '@bh)/94\\q8o3xBOX' });
