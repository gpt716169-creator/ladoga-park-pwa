import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

async function run() {
  await ssh.connect({
    host: '132.243.17.20',
    username: 'root',
    password: '@bh)/94\\q8o3xBOX'
  });

  const res = await ssh.execCommand('pm2 logs --lines 30 --nostream');
  console.log('PM2 LOGS:\n', res.stdout);
  if (res.stderr) console.error('PM2 ERR LOGS:\n', res.stderr);
  ssh.dispose();
}

run().catch(console.error);
