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

    // 4. Configure Nginx
    console.log('Configuring Nginx...');
    const nginxConfig = `
server {
    listen 80;
    server_name xn----btb2aqbl.xn--p1ai www.xn----btb2aqbl.xn--p1ai 132.243.17.20;
    root /var/www/ladoga-park;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript font/woff2 image/svg+xml;
    gzip_comp_level 6;
    gzip_min_length 256;

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|mp4|webm|webp)$ {
        expires 1y;
        add_header Cache-Control "public, no-transform, immutable";
        access_log off;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /uploads/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
`;
    await ssh.execCommand('cat << \'EOF\' > /etc/nginx/sites-available/ladoga-park\n' + nginxConfig + '\nEOF');
    await ssh.execCommand('ln -sf /etc/nginx/sites-available/ladoga-park /etc/nginx/sites-enabled/');
    await ssh.execCommand('rm -f /etc/nginx/sites-enabled/default'); // Remove default Nginx page
    
    // Maintain SSL configuration
    await ssh.execCommand('certbot --nginx -d xn----btb2aqbl.xn--p1ai --non-interactive --agree-tos -m admin@ladogapark.ru --redirect');

    // 5. Test & Restart Nginx
    const nginxTest = await ssh.execCommand('nginx -t');
    console.log('Nginx test:', nginxTest.stderr);
    await ssh.execCommand('systemctl restart nginx');
    
    console.log('✅ Deployment successful! Your site is live at http://132.243.17.20');
    process.exit(0);
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

deploy();
