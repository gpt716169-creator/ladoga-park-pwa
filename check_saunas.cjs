const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('/var/www/ladoga-park/database.sqlite');
db.all("SELECT id, displayName, desc FROM catalog_items WHERE category = 'sauna'", (err, rows) => {
  console.log(rows);
});