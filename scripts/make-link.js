const uuid = process.env.VLESS_UUID || '6f6d52f0-b245-4c42-b939-32ee389e5515';
const ip = '192.179.18.100';
const sni = 'crashlyticsreports-pa.googleapis.com';
const host = 'marvel-ech.ai.studio';
const path = '/@Marvel-Tech';
console.log(`vless://${uuid}@${ip}:443?encryption=none&security=tls&sni=${sni}&type=ws&host=${host}&path=${encodeURIComponent(path)}#@Marvel-Tech`);
