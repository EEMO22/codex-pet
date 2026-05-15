import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import pngToIco from 'png-to-ico';
import { PNG } from 'pngjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(appRoot, '..', '..');
const sourcePath = path.join(repoRoot, 'pet-runs', 'vera-clear', 'frames', 'idle', '00.png');
const assetsRoot = path.join(appRoot, 'assets');
const sizes = [16, 24, 32, 48, 64, 128, 256];

fs.mkdirSync(assetsRoot, { recursive: true });

const source = PNG.sync.read(fs.readFileSync(sourcePath));
const crop = getAlphaBounds(source);
const pngPaths = sizes.map((size) => {
  const outputPath = path.join(assetsRoot, `icon-${size}.png`);
  const image = renderIcon(source, crop, size);
  fs.writeFileSync(outputPath, PNG.sync.write(image));
  return outputPath;
});

fs.copyFileSync(path.join(assetsRoot, 'icon-256.png'), path.join(assetsRoot, 'icon.png'));
fs.writeFileSync(path.join(assetsRoot, 'icon.ico'), await pngToIco(pngPaths));

function getAlphaBounds(image) {
  let minX = image.width;
  let minY = image.height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      const index = (image.width * y + x) << 2;
      if (image.data[index + 3] === 0 || isGreenKeyPixel(image, index)) {
        continue;
      }

      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (maxX < minX || maxY < minY) {
    return { x: 0, y: 0, width: image.width, height: image.height };
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1
  };
}

function renderIcon(sourceImage, cropRect, size) {
  const output = new PNG({ width: size, height: size });
  output.data.fill(0);

  const maxArtworkSize = Math.round(size * 0.84);
  const scale = Math.min(maxArtworkSize / cropRect.width, maxArtworkSize / cropRect.height);
  const targetWidth = Math.max(1, Math.round(cropRect.width * scale));
  const targetHeight = Math.max(1, Math.round(cropRect.height * scale));
  const targetX = Math.round((size - targetWidth) / 2);
  const targetY = Math.round((size - targetHeight) / 2);

  for (let y = 0; y < targetHeight; y += 1) {
    for (let x = 0; x < targetWidth; x += 1) {
      const sourceX = cropRect.x + Math.min(cropRect.width - 1, Math.floor(x / scale));
      const sourceY = cropRect.y + Math.min(cropRect.height - 1, Math.floor(y / scale));
      copyPixel(sourceImage, output, sourceX, sourceY, targetX + x, targetY + y);
    }
  }

  return output;
}

function copyPixel(sourceImage, targetImage, sourceX, sourceY, targetX, targetY) {
  const sourceIndex = (sourceImage.width * sourceY + sourceX) << 2;
  const targetIndex = (targetImage.width * targetY + targetX) << 2;

  if (isGreenKeyPixel(sourceImage, sourceIndex)) {
    targetImage.data[targetIndex] = 0;
    targetImage.data[targetIndex + 1] = 0;
    targetImage.data[targetIndex + 2] = 0;
    targetImage.data[targetIndex + 3] = 0;
    return;
  }

  targetImage.data[targetIndex] = sourceImage.data[sourceIndex];
  targetImage.data[targetIndex + 1] = sourceImage.data[sourceIndex + 1];
  targetImage.data[targetIndex + 2] = sourceImage.data[sourceIndex + 2];
  targetImage.data[targetIndex + 3] = sourceImage.data[sourceIndex + 3];
}

function isGreenKeyPixel(image, index) {
  const red = image.data[index];
  const green = image.data[index + 1];
  const blue = image.data[index + 2];
  const alpha = image.data[index + 3];

  return alpha > 0 && green >= 8 && green > red + 4 && green > blue + 4;
}
