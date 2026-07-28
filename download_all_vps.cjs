const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const localBase = 'C:/Users/Konstantin/.gemini/antigravity/scratch/ladoga-park-vps-1721';
if (!fs.existsSync(localBase)) fs.mkdirSync(localBase, { recursive: true });

const conn = new Client();
conn.on('ready', () => {
  conn.sftp((err, sftp) => {
    if (err) throw err;

    function downloadDir(remoteDir, localDir) {
      if (!fs.existsSync(localDir)) fs.mkdirSync(localDir, { recursive: true });

      sftp.readdir(remoteDir, (readErr, list) => {
        if (readErr) {
          console.error('Error reading remote dir:', remoteDir, readErr);
          return;
        }

        list.forEach(item => {
          if (item.filename === 'node_modules' || item.filename === '.git') return;

          const remotePath = path.posix.join(remoteDir, item.filename);
          const localPath = path.join(localDir, item.filename);

          if (item.attrs.isDirectory()) {
            downloadDir(remotePath, localPath);
          } else {
            sftp.fastGet(remotePath, localPath, getErr => {
              if (getErr) {
                console.error('Failed to download:', remotePath, getErr);
              } else {
                console.log('Downloaded:', item.filename);
              }
            });
          }
        });
      });
    }

    downloadDir('/var/www/ladoga-park', localBase);
  });
}).connect({ host: '132.243.17.20', port: 22, username: 'root', password: '@bh)/94\\q8o3xBOX' });
