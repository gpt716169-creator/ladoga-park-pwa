const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const script = `
    const sqlite3 = require('sqlite3');
    const db = new sqlite3.Database('/var/www/ladoga-park/database.sqlite');
    db.run("UPDATE catalog_items SET desc = replace(desc, 'Карельский чай и мед включены в стоимость.', '') WHERE category = 'sauna'");
    db.run("UPDATE catalog_items SET desc = replace(desc, 'Карельский чай и мед.', '') WHERE category = 'sauna'");
    db.run("UPDATE catalog_items SET desc = replace(desc, 'В стоимость входит карельский чай и мед.', '') WHERE category = 'sauna'");
  `;
  conn.exec(`node -e "${script.replace(/"/g, '\\"')}"`, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => {
      console.log('Descriptions updated');
      conn.end();
    });
  });
}).connect({
  host: '132.243.17.20',
  port: 22,
  username: 'root',
  password: '@bh)/94\\q8o3xBOX'
});