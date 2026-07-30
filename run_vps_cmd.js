import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

async function run() {
  await ssh.connect({
    host: '132.243.17.20',
    username: 'root',
    password: '@bh)/94\\q8o3xBOX'
  });

  const nodeScript = `
    const sqlite3 = require('/var/www/ladoga-park/node_modules/sqlite3');
    const db = new sqlite3.Database('/var/www/ladoga-park/database.sqlite');
    
    db.all("SELECT * FROM gifts", [], (err, rows) => {
      if (err) console.error(err);
      console.log('GIFTS IN DB:', rows);
    });
  `;

  const result = await ssh.execCommand(`node -e "${nodeScript.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`);
  console.log('STDOUT:\n', result.stdout);
  if (result.stderr) console.error('STDERR:\n', result.stderr);
  ssh.dispose();
}

run().catch(console.error);
