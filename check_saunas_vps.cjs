const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const script = `
    const sqlite3 = require('sqlite3');
    const db = new sqlite3.Database('/var/www/ladoga-park/database.sqlite');
    db.all("SELECT id, displayName, desc FROM catalog_items WHERE category = 'sauna'", (err, rows) => {
      console.log(rows);
    });
  `;
  conn.exec(`node -e "${script.replace(/"/g, '\\"')}"`, (err, stream) => {
    if (err) throw err;
    let data = '';
    stream.on('data', d => data += d).on('close', () => {
      console.log('Result:', data);
      conn.end();
    });
  });
}).connect({
  host: '132.243.17.20',
  port: 22,
  username: 'root',
  password: '@bh)/94\\q8o3xBOX'
});