import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  let reqUrl = decodeURIComponent(req.url.split('?')[0]);
  if (reqUrl === '/') reqUrl = '/index.html';

  let filePath = path.join(__dirname, reqUrl);

  // If path starts with /public, trim it or check public dir
  if (!fs.existsSync(filePath)) {
    const publicPath = path.join(__dirname, 'public', reqUrl);
    if (fs.existsSync(publicPath)) {
      filePath = publicPath;
    }
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Aggressive Browser Caching (1 year for videos & assets, 1 hour for html)
    const cacheControl = (ext === '.mp4' || ext === '.webm' || ext === '.png' || ext === '.jpg' || ext === '.css' || ext === '.js')
      ? 'public, max-age=31536000, immutable'
      : 'no-cache';

    // High-Speed Standard Video Streaming (Zero Throttling!)
    const range = req.headers.range;
    if (range && (ext === '.mp4' || ext === '.webm')) {
      const videoSize = stats.size;
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : videoSize - 1;
      const contentLength = (end - start) + 1;

      const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": contentType,
        "Cache-Control": cacheControl,
        "Access-Control-Allow-Origin": "*"
      };

      res.writeHead(206, headers);
      const videoStream = fs.createReadStream(filePath, { start, end });
      videoStream.pipe(res);
      return;
    }

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Cache-Control': cacheControl,
      'Access-Control-Allow-Origin': '*'
    });

    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Сервер «Ладога Парк PWA» успешно запущен с мгновенной стриминг-оптимизацией!`);
  console.log(`👉 Откройте в браузере: http://localhost:${PORT}`);
  console.log(`📱 Для доступа со смартфона (в той же Wi-Fi сети): http://<ваш-IP>:${PORT}\n`);
});
