import http from 'node:http';
import { WebSocketServer } from 'ws';
import { attachVlessSocket, DEFAULT_UUID, DEFAULT_PATH, uuidBytes } from './vless.js';

const port = Number(process.env.PORT || 8080);
const path = process.env.VLESS_PATH || DEFAULT_PATH;
const uuid = uuidBytes(process.env.VLESS_UUID || DEFAULT_UUID);
const server = http.createServer((req, res) => {
  if (req.url === '/healthz' || req.url === '/') {
    res.writeHead(200, {'content-type':'application/json'});
    res.end(JSON.stringify({status:'ok',service:'Marvel-Tech',websocketPath:path}));
    return;
  }
  res.writeHead(404).end('Not found');
});
const wss = new WebSocketServer({noServer:true, maxPayload: 1024*1024});
server.on('upgrade', (req, socket, head) => {
  let pathname;
  try { pathname = new URL(req.url, 'http://localhost').pathname; }
  catch { socket.destroy(); return; }
  if (pathname !== path) { socket.write('HTTP/1.1 404 Not Found\r\n\r\n'); socket.destroy(); return; }
  wss.handleUpgrade(req, socket, head, ws => attachVlessSocket(ws, uuid));
});
server.listen(port, '0.0.0.0', () => console.log(`Marvel-Tech listening on ${port} path ${path}`));
