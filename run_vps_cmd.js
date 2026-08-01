import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

async function run() {
  await ssh.connect({
    host: '132.243.17.20',
    username: 'root',
    password: '@bh)/94\\q8o3xBOX'
  });

  const res = await ssh.execCommand('curl -s https://лп-спб.рф/api/booking/20260731-52159-449544510');
  console.log('LIVE API RESPONSE:\n', res.stdout);
  ssh.dispose();
}

run().catch(console.error);
