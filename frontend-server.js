/**
 * Lightweight static file server for the frontend (no external deps).
 * Serves files from ./frontend on PORT (default 3000) and supports a SPA fallback to index.html.
 */
const http = require('http');
const path = require('path');
const fs = require('fs');

const PORT = parseInt(process.env.FRONTEND_PORT || '3000', 10);
const ROOT = path.join(__dirname, 'frontend');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function safeJoin(base, target) {
  const targetPath = path.join(base, target);
  if (!targetPath.startsWith(base)) return base; // prevent path traversal
  return targetPath;
}

function send(res, status, content, headers = {}) {
  res.writeHead(status, { 'Content-Length': Buffer.byteLength(content), ...headers });
  res.end(content);
}

function serveFile(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') return send(res, 404, 'Not found');
      return send(res, 500, 'Server error');
    }
    const ext = path.extname(filePath).toLowerCase();
    const type = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'public, max-age=300' });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const urlPath = decodeURI(req.url.split('?')[0]);
  let rel = urlPath === '/' ? '/index.html' : urlPath;
  let filePath = safeJoin(ROOT, rel);

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }
    fs.stat(filePath, (err2) => {
      if (err2) {
        // SPA fallback: return index.html for unmatched routes (excluding obvious asset extensions)
        if (!path.extname(rel)) {
          return serveFile(path.join(ROOT, 'index.html'), res);
        }
        return send(res, 404, 'Not found');
      }
      serveFile(filePath, res);
    });
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend static server listening on http://localhost:${PORT}`);
});
