import('node-ssh').then(async ({NodeSSH}) => {
  const ssh = new NodeSSH();
  await ssh.connect({ host: '132.243.17.20', username: 'root', password: '@bh)/94\\q8o3xBOX' });
  console.log('Connected to VPS! Running certbot...');
  const res = await ssh.execCommand('certbot --nginx -d xn----btb2aqbl.xn--p1ai -d www.xn----btb2aqbl.xn--p1ai --non-interactive --agree-tos -m admin@ladogapark.ru --redirect --reinstall');
  console.log('Certbot stdout:', res.stdout);
  console.log('Certbot stderr:', res.stderr);
  
  await ssh.execCommand('systemctl restart nginx');
  console.log('Nginx restarted.');
  process.exit(0);
});
