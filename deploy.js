import { NodeSSH } from 'node-ssh';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ssh = new NodeSSH();

async function deploy() {
  try {
    console.log('Connecting to VPS...');
    await ssh.connect({
      host: '132.243.17.20',
      username: 'root',
      password: '@bh)/94\\q8o3xBOX'
    });
    console.log('Connected!');

    // 1. Install Nginx, Node.js and PM2
    console.log('Installing Nginx, Node.js and PM2...');
    await ssh.execCommand('apt-get update && apt-get install -y nginx curl && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs && npm install -g pm2');

    // 2. Prepare directory
    console.log('Preparing web directory...');
    await ssh.execCommand('mkdir -p /var/www/ladoga-park');

    // 3. Upload built files
    console.log('Uploading files from dist to VPS...');
    const distPath = path.join(__dirname, 'dist');
    const failed = [];
    const successful = [];
    await ssh.putDirectory(distPath, '/var/www/ladoga-park', {
      recursive: true,
      concurrency: 10,
      tick: function(localPath, remotePath, error) {
        if (error) {
          failed.push(localPath);
        } else {
          successful.push(localPath);
        }
      }
    });
    console.log(`Uploaded ${successful.length} files. Failed: ${failed.length}`);

    // 3.5 Upload Server scripts and start PM2
    console.log('Uploading server scripts...');
    await ssh.putFile(path.join(__dirname, 'server.js'), '/var/www/ladoga-park/server.js');
    await ssh.putFile(path.join(__dirname, 'package.json'), '/var/www/ladoga-park/package.json');
    console.log('Starting Node.js server...');
    await ssh.execCommand('cd /var/www/ladoga-park && npm install express cors axios qs node-cron sqlite3 multer jsonwebtoken bcryptjs && pm2 restart server || pm2 start server.js --name server');
    
    console.log('Patching DB with saunas if missing...');
    await ssh.execCommand(`node -e "const sqlite3 = require('sqlite3'); const db = new sqlite3.Database('/var/www/ladoga-park/database.sqlite'); db.run(\\\"INSERT OR IGNORE INTO catalog_items (id, displayName, desc, price, category, icon, isQuickOrder) VALUES ('sauna-forest', 'Баня в лесу у поляны', 'Прогрев до 85°C', 4000, 'sauna', '🌲', 0), ('sauna-lake', 'Баня на берегу Ладоги', 'Спуск к воде', 4000, 'sauna', '🌊', 0), ('hottub-siberian', 'Сибирский банный чан', 'Теплый чан', 3500, 'sauna', '♨️', 0), ('aroma-tub', 'Арома-купель', 'На цитрусах', 3500, 'sauna', '🍋', 0)\\\");"`);

    // 4. Configure Nginx (DISABLED PERMANENTLY TO PRESERVE MANUAL SSL CONFIG)
    console.log('Skipping Nginx auto-config to preserve SSL certificates...');
    
    console.log('✅ Deployment successful! Your site is live at http://132.243.17.20');
    process.exit(0);
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

deploy();
