const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const script = `
    const sqlite3 = require('sqlite3');
    const db = new sqlite3.Database('/var/www/ladoga-park/database.sqlite');
    
    // Calculate difference in days from 2019 to today
    const today = new Date();
    const oldDate = new Date('2019-07-28');
    const diffDays = Math.floor((today - oldDate) / (1000 * 60 * 60 * 24));

    db.run("UPDATE bookings SET arrival_date = date(arrival_date, '+" + diffDays + " days'), departure_date = date(departure_date, '+" + diffDays + " days')", function(err) {
      if (err) console.log(err);
      else console.log('Successfully shifted dates by ' + diffDays + ' days to make them current.');
    });
  `;
  conn.exec(`cd /var/www/ladoga-park && node -e "${script.replace(/"/g, '\\"')}"`, (err, stream) => {
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