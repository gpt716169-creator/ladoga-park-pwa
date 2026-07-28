const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const conf = `
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    listen 443 ssl default_server;
    listen [::]:443 ssl default_server;

    server_name лп-спб.рф www.лп-спб.рф xn----btb2aqbl.xn--p1ai www.xn----btb2aqbl.xn--p1ai 132.243.17.20 _;

    ssl_certificate /etc/letsencrypt/live/xn----btb2aqbl.xn--p1ai/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/xn----btb2aqbl.xn--p1ai/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    root /var/www/ladoga-park;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript font/woff2 image/svg+xml;
    gzip_comp_level 6;
    gzip_min_length 256;

    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|mp4|webm|webp)$ {
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
  conn.exec("cat << 'EOF' > /etc/nginx/sites-available/ladoga-park\n" + conf + "\nEOF\nsystemctl restart nginx", (err, stream) => {
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d));
    stream.stderr.on('data', d => process.stderr.write(d));
    stream.on('close', () => conn.end());
  });
}).connect({ host: '132.243.17.20', port: 22, username: 'root', password: '@bh)/94\\q8o3xBOX' });
