const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec('cat /var/www/ladoga-park/server.js', (err, stream) => {
    if (err) throw err;
    let data = '';
    stream.on('data', d => data += d);
    stream.on('close', () => {
       const lines = data.split('\\n');
       for(let i = 350; i < 390; i++) console.log((i+1)+':', lines[i]);
       conn.end();
    });
  });
}).connect({
  host: '132.243.17.20',
  port: 22,
  username: 'root',
  password: '@bh)/94\\q8o3xBOX'
});