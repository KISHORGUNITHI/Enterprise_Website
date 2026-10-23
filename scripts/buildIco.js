import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const images = [
  { size: 16, file: path.join(rootDir, 'frontend/assets/images/favicon-16x16.png') },
  { size: 32, file: path.join(rootDir, 'frontend/assets/images/favicon-32x32.png') },
  { size: 48, file: path.join(rootDir, 'frontend/assets/images/favicon-48x48.png') },
];

const pngBuffers = images.map(img => fs.readFileSync(img.file));

const numImages = images.length;
const headerSize = 6;
const dirEntrySize = 16;
let dataOffset = headerSize + numImages * dirEntrySize;

const icoHeader = Buffer.alloc(headerSize);
icoHeader.writeUInt16LE(0, 0); // Reserved
icoHeader.writeUInt16LE(1, 2); // 1 = Icon
icoHeader.writeUInt16LE(numImages, 4); // Number of images

const dirEntries = [];
for (let i = 0; i < numImages; i++) {
  const entry = Buffer.alloc(dirEntrySize);
  const size = images[i].size >= 256 ? 0 : images[i].size;
  const pngData = pngBuffers[i];
  
  entry.writeUInt8(size, 0); // Width
  entry.writeUInt8(size, 1); // Height
  entry.writeUInt8(0, 2);    // Color count (0 = no palette)
  entry.writeUInt8(0, 3);    // Reserved
  entry.writeUInt16LE(1, 4); // Color planes
  entry.writeUInt16LE(32, 6); // Bits per pixel
  entry.writeUInt32LE(pngData.length, 8); // Image data size
  entry.writeUInt32LE(dataOffset, 12); // Offset
  
  dirEntries.push(entry);
  dataOffset += pngData.length;
}

const finalBuffer = Buffer.concat([icoHeader, ...dirEntries, ...pngBuffers]);

const outPaths = [
  path.join(rootDir, 'frontend/favicon.ico'),
  path.join(rootDir, 'frontend/assets/images/favicon.ico'),
  path.join(rootDir, 'frontend/public/icons/favicon.ico')
];

for (const outPath of outPaths) {
  const parent = path.dirname(outPath);
  if (!fs.existsSync(parent)) {
    fs.mkdirSync(parent, { recursive: true });
  }
  fs.writeFileSync(outPath, finalBuffer);
  console.log('Written favicon.ico to:', outPath);
}

// Also create an SVG wrapper for browsers requesting /public/icons/favicon.svg
const svgPath = path.join(rootDir, 'frontend/public/icons/favicon.svg');
const pngBase64 = fs.readFileSync(path.join(rootDir, 'frontend/assets/images/favicon-48x48.png')).toString('base64');
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <image href="data:image/png;base64,${pngBase64}" width="48" height="48"/>
</svg>`;
fs.writeFileSync(svgPath, svgContent);
console.log('Written favicon.svg to:', svgPath);
