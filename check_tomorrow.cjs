const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('/var/www/ladoga-park/database.sqlite');
db.all("SELECT id, guest_name, cabin_name, arrival_date, departure_date FROM bookings WHERE arrival_date = '2026-07-29' AND status = 'Active'", (err, rows) => {
    if (err) console.error(err);
    else console.log(JSON.stringify(rows, null, 2));
    db.close();
});