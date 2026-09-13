// A small typographic B, using the site's green. Both formats share this grid.
const glyph = ['111110', '110011', '110011', '111110', '110011', '110011', '110011', '111110'];
const background = [49, 76, 65];
const cells = glyph.flatMap((row, y) => [...row].flatMap((bit, x) => bit === '1' ? [{ x: x + 5, y: y + 4 }] : []));

export const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect width="16" height="16" fill="#314c41"/><g fill="#fff">${cells.map(({ x, y }) => `<rect x="${x}" y="${y}" width="1" height="1"/>`).join('')}</g></svg>\n`;

function bitmap(size) {
  const pixelBytes = size * size * 4;
  const maskBytes = Math.ceil(size / 32) * 4 * size;
  const data = Buffer.alloc(40 + pixelBytes + maskBytes);
  data.writeUInt32LE(40, 0); // BITMAPINFOHEADER
  data.writeInt32LE(size, 4);
  data.writeInt32LE(size * 2, 8); // Pixel data and transparency mask.
  data.writeUInt16LE(1, 12);
  data.writeUInt16LE(32, 14);
  data.writeUInt32LE(pixelBytes, 20);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const gx = Math.floor(x * 16 / size) - 5;
      const gy = Math.floor(y * 16 / size) - 4;
      const [r, g, b] = glyph[gy]?.[gx] === '1' ? [255, 255, 255] : background;
      const offset = 40 + ((size - y - 1) * size + x) * 4;
      data.set([b, g, r, 255], offset);
    }
  }
  return data;
}

export function faviconIco() {
  const sizes = [16, 32];
  const images = sizes.map(bitmap);
  const directory = Buffer.alloc(6 + 16 * sizes.length);
  directory.writeUInt16LE(1, 2);
  directory.writeUInt16LE(sizes.length, 4);
  let offset = directory.length;
  images.forEach((data, i) => {
    const entry = 6 + 16 * i;
    directory[entry] = sizes[i];
    directory[entry + 1] = sizes[i];
    directory.writeUInt16LE(1, entry + 4);
    directory.writeUInt16LE(32, entry + 6);
    directory.writeUInt32LE(data.length, entry + 8);
    directory.writeUInt32LE(offset, entry + 12);
    offset += data.length;
  });
  return Buffer.concat([directory, ...images]);
}
