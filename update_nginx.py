from paramiko import SSHClient, AutoAddPolicy

ssh = SSHClient()
ssh.set_missing_host_key_policy(AutoAddPolicy())
ssh.connect('132.243.17.20', username='root', password=r'@bh)/94\q8o3xBOX')

conf_content = """server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name xn----btb2aqbl.xn--p1ai www.xn----btb2aqbl.xn--p1ai 132.243.17.20 _;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl default_server;
    listen [::]:443 ssl default_server;
    server_name xn----btb2aqbl.xn--p1ai www.xn----btb2aqbl.xn--p1ai 132.243.17.20 _;

    ssl_certificate /etc/letsencrypt/live/xn----btb2aqbl.xn--p1ai/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/xn----btb2aqbl.xn--p1ai/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    root /var/www/ladoga-park;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-store, no-cache, must-revalidate, max-age=0";
    }

    location ~* \.(js|css)$ {
        add_header Cache-Control "no-cache, must-revalidate";
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:3000;
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
"""

sftp = ssh.open_sftp()
with sftp.file('/etc/nginx/sites-available/default', 'w') as f:
    f.write(conf_content)
sftp.close()

stdin, stdout, stderr = ssh.exec_command('nginx -t && systemctl reload nginx')
print('STDOUT:', stdout.read().decode('utf-8'))
print('STDERR:', stderr.read().decode('utf-8'))
ssh.close()
