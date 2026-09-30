import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('.', import.meta.url));
const port = Number(process.env.PORT || 5181);
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.json':'application/json; charset=utf-8','.jpg':'image/jpeg','.pdf':'application/pdf'};
const server = http.createServer(async (req,res) => {
  try {
    if (!['GET','HEAD'].includes(req.method)) { res.writeHead(405, {Allow:'GET, HEAD'}); return res.end(); }
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/health') { res.writeHead(200, {'Content-Type':'application/json'}); return res.end(JSON.stringify({app:'ccna-learning-lab',status:'ok'})); }
    const pathname = decodeURIComponent(url.pathname);
    if (pathname !== '/' && !/^\/(src\/|data\/|favicon\.svg$|index\.html$)/.test(pathname)) { res.writeHead(404); return res.end('Not found'); }
    const file = resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!file.startsWith(root.endsWith(sep) ? root : root+sep) || !(await stat(file)).isFile()) { res.writeHead(404); return res.end('Not found'); }
    const data = await readFile(file);
    res.writeHead(200, {'Content-Type':types[extname(file)] || 'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'"});
    res.end(req.method === 'HEAD' ? undefined : data);
  } catch { res.writeHead(404); res.end('Not found'); }
});
server.on('error',error=>{ console.error(error.code === 'EADDRINUSE' ? `Port ${port} is already in use. Open http://localhost:${port} or set PORT.` : error.message); process.exitCode=1; });
server.listen(port,'127.0.0.1',()=>console.log(`CCNA Lab: http://localhost:${port}`));
