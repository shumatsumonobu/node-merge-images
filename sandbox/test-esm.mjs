import path from 'path';
import {fileURLToPath} from 'url';
import mergeImages from 'node-merge-images';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INPUT_DIR = path.resolve(__dirname, 'images');
const OUTPUT_DIR = path.resolve(__dirname, 'output');

async function main() {
  const images = [
    `${INPUT_DIR}/red-square.jpg`,
    `${INPUT_DIR}/green-square.jpg`,
    `${INPUT_DIR}/blue-square.jpg`,
  ];

  // Vertical merge (default).
  await mergeImages(images, `${OUTPUT_DIR}/esm-vertical.jpg`);
  console.log('OK: vertical merge');

  // Horizontal merge.
  await mergeImages(images, `${OUTPUT_DIR}/esm-horizontal.jpg`, {direction: 'horizontal'});
  console.log('OK: horizontal merge');

  // Grid layout.
  await mergeImages(
    [...images, `${INPUT_DIR}/red-square.jpg`],
    `${OUTPUT_DIR}/esm-grid.jpg`,
    {grid: 2},
  );
  console.log('OK: grid merge');

  // Free-form positioning.
  await mergeImages(
    [images[0], images[1]],
    `${OUTPUT_DIR}/esm-positioned.jpg`,
    {positions: {0: {x: 0, y: 0}, 1: {x: 50, y: 50}}},
  );
  console.log('OK: positioned merge');

  console.log('\nAll ESM tests passed!');
}

main().catch(err => {
  console.error('FAIL:', err);
  process.exit(1);
});
