const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const script = `
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('/var/www/ladoga-park/database.sqlite');
db.all("SELECT id, guest_name, cabin_name, arrival_date, departure_date FROM bookings WHERE arrival_date = '2026-07-29' AND status = 'Active'", (err, rows) => {
    if (err) console.error(err);
    else console.log(JSON.stringify(rows, null, 2));
    db.close();
});
  `;
  conn.exec(`cd /var/www/ladoga-park && node -e "${script.replace(/"/g, '\\"')}"`, (err, stream) => {
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