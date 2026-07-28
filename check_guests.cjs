const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const script = `
    const sqlite3 = require('sqlite3');
    const db = new sqlite3.Database('/var/www/ladoga-park/database.sqlite');
    
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    
    db.all("SELECT * FROM bookings WHERE status != 'Cancelled'", (err, rows) => {
      let result = 'Guests for ' + today + ':\\n';
      
      const tomorrowArrivals = [];
      const currentStays = [];
      const todayDepartures = [];

      rows.forEach(b => {
        const arr = b.arrival_date.split('T')[0];
        const dep = b.departure_date.split('T')[0];
        
        if (arr === tomorrow) {
          tomorrowArrivals.push(b);
        } else if (dep === today) {
          todayDepartures.push(b);
        } else if (arr <= today && dep > today) {
          currentStays.push(b);
        }
      });
      
      result += '\\n[Заезжают завтра (' + tomorrow + ')]\\n';
      tomorrowArrivals.forEach(b => result += b.guest_name + ' | ' + b.cabin_name + ' | ' + b.arrival_date + ' - ' + b.departure_date + '\\n');
      
      result += '\\n[Проживают сейчас (на ' + today + ')]\\n';
      currentStays.forEach(b => result += b.guest_name + ' | ' + b.cabin_name + ' | ' + b.arrival_date + ' - ' + b.departure_date + '\\n');
      
      result += '\\n[Выезжают сегодня (' + today + ')]\\n';
      todayDepartures.forEach(b => result += b.guest_name + ' | ' + b.cabin_name + ' | ' + b.arrival_date + ' - ' + b.departure_date + '\\n');
      
      console.log(result);
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