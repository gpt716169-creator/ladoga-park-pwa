const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec('sqlite3 /var/www/ladoga-park/database.sqlite "SELECT id, guest_name, arrival_date, departure_date, status FROM bookings;"', (err, stream) => {
    if (err) throw err;
    let data = '';
    stream.on('data', d => data += d).on('close', () => {
      console.log(data);
      conn.end();
    });
    stream.stderr.on('data', d => data += d);
  });
}).connect({
  host: '132.243.17.20',
  port: 22,
  username: 'root',
  password: '@bh)/94\\q8o3xBOX'
});