const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const localDir = 'C:/Users/Konstantin/.gemini/antigravity/scratch/ladoga-park-vps-1721';

if (!fs.existsSync(localDir)) {
  fs.mkdirSync(localDir, { recursive: true });
}

console.log('Connecting to VPS to create tar archive of /var/www/ladoga-park...');

const conn = new Client();
conn.on('ready', () => {
  // Create tar archive excluding node_modules to make it super fast
  const cmd = 'tar -czf /tmp/vps_1721_site.tar.gz -C /var/www/ladoga-park --exclude="node_modules" .';
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => {
      console.log('Tar archive created on VPS! Downloading archive via SFTP...');
      conn.sftp((sftpErr, sftp) => {
        if (sftpErr) throw sftpErr;
        const localTar = path.join(localDir, 'vps_1721_site.tar.gz');
        sftp.fastGet('/tmp/vps_1721_site.tar.gz', localTar, (downloadErr) => {
          if (downloadErr) throw downloadErr;
          console.log('Archive downloaded to:', localTar);
          conn.end();

          // Extract tar locally
          console.log('Extracting archive locally...');
          try {
            execSync(`tar -xzf "${localTar}" -C "${localDir}"`, { stdio: 'inherit' });
            console.log('SUCCESS! All 17:21 files downloaded directly from VPS into:', localDir);
          } catch (e) {
            console.error('Extract error:', e);
          }
        });
      });
    });
  });
}).connect({ host: '132.243.17.20', port: 22, username: 'root', password: '@bh)/94\\q8o3xBOX' });
