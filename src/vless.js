import net from 'node:net';

export const DEFAULT_UUID = '6f6d52f0-b245-4c42-b939-32ee389e5515';
export const DEFAULT_PATH = '/@Marvel-Tech';

export function uuidBytes(uuid) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid)) {
    throw new Error('VLESS_UUID must be a valid UUID');
  }
  return Buffer.from(uuid.replaceAll('-', ''), 'hex');
}

export function parseVlessRequest(buffer, expectedUuid) {
  if (buffer.length < 24) return null;
  if (buffer[0] !== 0) throw new Error('Unsupported VLESS version');
  if (!buffer.subarray(1, 17).equals(expectedUuid)) throw new Error('Invalid UUID');
  const addonsLength = buffer[17];
  const offset = 18 + addonsLength;
  if (buffer.length < offset + 4) return null;
  const command = buffer[offset];
  if (command !== 1) throw new Error('Only TCP is supported');
  const port = buffer.readUInt16BE(offset + 1);
  const addressType = buffer[offset + 3];
  let start = offset + 4;
  let address;
  if (addressType === 1) {
    if (buffer.length < start + 4) return null;
    address = Array.from(buffer.subarray(start, start + 4)).join('.');
    start += 4;
  } else if (addressType === 2) {
    if (buffer.length < start + 1) return null;
    const len = buffer[start++];
    if (buffer.length < start + len) return null;
    address = buffer.subarray(start, start + len).toString('utf8');
    start += len;
  } else if (addressType === 3) {
    if (buffer.length < start + 16) return null;
    const chunks = [];
    for (let i=0; i<16; i+=2) chunks.push(buffer.readUInt16BE(start+i).toString(16));
    address = chunks.join(':');
    start += 16;
  } else {
    throw new Error('Invalid address type');
  }
  if (!port || !address) throw new Error('Missing destination');
  return { host: address, port, payload: buffer.subarray(start) };
}

export function attachVlessSocket(ws, expectedUuid) {
  let pending = Buffer.alloc(0);
  let upstream = null;
  let connected = false;
  const maxHeader = 8192;
  ws.on('message', (raw, isBinary) => {
    if (!isBinary) return ws.close(1003, 'Binary only');
    const data = Buffer.from(raw);
    if (upstream) {
      if (!upstream.destroyed) upstream.write(data);
      return;
    }
    pending = Buffer.concat([pending, data]);
    if (pending.length > maxHeader) return ws.close(1009, 'Header too large');
    let request;
    try { request = parseVlessRequest(pending, expectedUuid); }
    catch { return ws.close(1008, 'Invalid request'); }
    if (!request) return;
    pending = Buffer.alloc(0);
    upstream = net.connect({host: request.host, port: request.port});
    upstream.setTimeout(300000);
    upstream.once('connect', () => {
      connected = true;
      if (ws.readyState !== ws.OPEN) return upstream.destroy();
      ws.send(Buffer.from([0, 0])); // VLESS response header
      if (request.payload.length) upstream.write(request.payload);
    });
    upstream.on('data', chunk => { if (ws.readyState === ws.OPEN) ws.send(chunk); });
    upstream.on('error', () => { if (ws.readyState === ws.OPEN) ws.close(1011, 'Upstream error'); });
    upstream.on('timeout', () => upstream.destroy());
    upstream.on('close', () => { if (ws.readyState === ws.OPEN) ws.close(1000); });
  });
  ws.on('close', () => upstream?.destroy());
  ws.on('error', () => upstream?.destroy());
}
