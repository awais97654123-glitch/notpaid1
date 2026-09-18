const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Helper to write raw uncompressed PNG with deflateSync
function createPng(width, height, r, g, b) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // bit depth 8
  ihdr.writeUInt8(6, 9); // color type RGBA (6)
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Scanlines with filter byte 0
  const rowBytes = width * 4 + 1;
  const rawData = Buffer.alloc(rowBytes * height);

  const cx = width / 2;
  const cy = height / 2;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowBytes;
    rawData[rowOffset] = 0; // Filter None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      // Rich gradient background: Indigo/Blue
      const factor = (x + y) / (width + height);
      const pr = Math.round(14 * (1 - factor) + 37 * factor);
      const pg = Math.round(165 * (1 - factor) + 99 * factor);
      const pb = Math.round(233 * (1 - factor) + 235 * factor);

      // Rounded corners
      const cornerR = width * 0.22;
      let inBounds = true;

      const innerX = Math.max(cornerR, Math.min(width - cornerR, x));
      const innerY = Math.max(cornerR, Math.min(height - cornerR, y));
      const dx = x - innerX;
      const dy = y - innerY;
      if (dx * dx + dy * dy > cornerR * cornerR) {
        inBounds = false;
      }

      if (!inBounds) {
        rawData[pxOffset] = 0;
        rawData[pxOffset + 1] = 0;
        rawData[pxOffset + 2] = 0;
        rawData[pxOffset + 3] = 0; // Transparent
      } else {
        const relX = (x - cx) / (width * 0.5);
        const relY = (y - cy) / (height * 0.5);

        // Checkmark drawing
        const distToSegment = (px, py, x1, y1, x2, y2) => {
          const l2 = (x2 - x1) ** 2 + (y2 - y1) ** 2;
          if (l2 === 0) return Math.hypot(px - x1, py - y1);
          let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
          t = Math.max(0, Math.min(1, t));
          return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
        };

        const d1 = distToSegment(relX, relY, -0.38, 0.02, -0.08, 0.32);
        const d2 = distToSegment(relX, relY, -0.08, 0.32, 0.42, -0.28);
        const thickness = 0.12;

        if (d1 < thickness || d2 < thickness) {
          rawData[pxOffset] = 255;
          rawData[pxOffset + 1] = 255;
          rawData[pxOffset + 2] = 255;
          rawData[pxOffset + 3] = 255;
        } else {
          rawData[pxOffset] = pr;
          rawData[pxOffset + 1] = pg;
          rawData[pxOffset + 2] = pb;
          rawData[pxOffset + 3] = 255;
        }
      }
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressedData);
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

function crc32(buf) {
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ (-1)) >>> 0;
}

const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c >>> 0;
}

const publicDir = path.join(__dirname, '..', 'public');

fs.writeFileSync(path.join(publicDir, 'icon-192.png'), createPng(192, 192));
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), createPng(512, 512));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(180, 180));
fs.writeFileSync(path.join(publicDir, 'badge-72.png'), createPng(72, 72));

console.log('Successfully generated PWA and Web Push icons:');
console.log('- public/icon-192.png');
console.log('- public/icon-512.png');
console.log('- public/apple-touch-icon.png');
console.log('- public/badge-72.png');
