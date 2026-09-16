import fs from 'node:fs';
import zlib from 'node:zlib';

function createPNG(width, height, getPixel) {
  // RGBA buffer: each scanline has 1 filter byte (0) followed by width * 4 bytes
  const lineSize = 1 + width * 4;
  const rawData = Buffer.alloc(lineSize * height);

  for (let y = 0; y < height; y++) {
    const offset = y * lineSize;
    rawData[offset] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y, width, height);
      const pxOffset = offset + 1 + x * 4;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 72, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);
  const crc = crc32(body);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);
  return Buffer.concat([len, body, crcBuf]);
}

// CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

// Render MiGaTUBE vinyl & neon icon
function renderPixel(x, y, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const maxR = w * 0.46;

  // Background dark obsidian green
  let r = 5, g = 9, b = 7, a = 255;

  if (dist <= maxR) {
    // Vinyl body
    const normDist = dist / maxR;
    r = Math.floor(10 * (1 - normDist * 0.8));
    g = Math.floor(25 * (1 - normDist * 0.7));
    b = Math.floor(18 * (1 - normDist * 0.8));

    // Concentric grooves
    if (dist > w * 0.22 && dist < maxR * 0.95) {
      const ring = Math.floor(dist) % 6;
      if (ring === 0) {
        g += 35;
        r += 10;
        b += 15;
      }
    }

    // Outer neon ring
    if (dist >= maxR - 4 && dist <= maxR) {
      r = 0; g = 255; b = 136;
    }

    // Center label
    if (dist < w * 0.20) {
      r = 6; g = 38; b = 24;
      if (dist >= w * 0.19) {
        r = 0; g = 255; b = 136;
      }
      // Play triangle in center
      const px = (x - cx) / (w * 0.12);
      const py = (y - cy) / (w * 0.12);
      if (px >= -0.4 && px <= 0.6 && Math.abs(py) <= (0.6 - px) * 0.85) {
        r = 0; g = 255; b = 136;
      }
      // Spindle hole
      if (dist < w * 0.035) {
        r = 0; g = 0; b = 0;
      }
    }
  }

  return [r, g, b, a];
}

// Create files
if (!fs.existsSync('./public')) {
  fs.mkdirSync('./public', { recursive: true });
}

fs.writeFileSync('./public/pwa-192x192.png', createPNG(192, 192, renderPixel));
fs.writeFileSync('./public/pwa-512x512.png', createPNG(512, 512, renderPixel));
fs.writeFileSync('./public/pwa-maskable-512x512.png', createPNG(512, 512, renderPixel));
fs.writeFileSync('./public/apple-touch-icon.png', createPNG(180, 180, renderPixel));
fs.writeFileSync('./public/favicon.ico', createPNG(32, 32, renderPixel));

console.log('MiGaTUBE PWA Icons generated successfully!');
