import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let fontCache = null;

export async function loadGeistFonts() {
  if (fontCache) return fontCache;
  const fontsDir = path.join(__dirname, 'fonts');
  const files = [
    { file: 'Geist-Thin.ttf',         name: 'Geist',     weight: 200 },
    { file: 'Geist-Regular.ttf',      name: 'Geist',     weight: 400 },
    { file: 'Geist-Bold.ttf',         name: 'Geist',     weight: 700 },
    { file: 'GeistMono-Regular.ttf',  name: 'GeistMono', weight: 400 },
    { file: 'GeistMono-Medium.ttf',   name: 'GeistMono', weight: 500 }
  ];
  fontCache = await Promise.all(
    files.map(async (f) => {
      const buf = await fs.readFile(path.join(fontsDir, f.file));
      return { name: f.name, data: buf, weight: f.weight, style: 'normal' };
    })
  );
  return fontCache;
}
