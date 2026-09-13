import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { root, renderSite, validateSite } from './build.mjs';

const assets = resolve(root, 'public');
createServer(async (req, res) => {
  try {
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405).end(); return; }
    const url = new URL(req.url, 'http://127.0.0.1');
    let file = decodeURIComponent(url.pathname).slice(1) || 'index.html';
    if (!extname(file)) file += '.html';
    const path = resolve(assets, file);
    if (!path.startsWith(assets + sep)) { res.writeHead(403).end(); return; }
    const output = await renderSite();
    await validateSite(output);
    const body = output.get(file) ?? await readFile(path);
    const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };
    res.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch (error) {
    res.writeHead(error.code === 'ENOENT' ? 404 : 500).end('Preview unavailable');
    console.error(error.message);
  }
}).listen(4173, '127.0.0.1', () => console.log('http://127.0.0.1:4173'));
