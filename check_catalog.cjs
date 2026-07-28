const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec('curl -s http://localhost:3000/api/catalog', (err, stream) => {
    if (err) throw err;
    let data = '';
    stream.on('data', d => data += d).on('close', () => {
      const items = JSON.parse(data).items.filter(i => i.category === 'sauna');
      console.log(JSON.stringify(items, null, 2));
      conn.end();
    });
  });
}).connect({
  host: '132.243.17.20',
  port: 22,
  username: 'root',
  password: '@bh)/94\\q8o3xBOX'
});