const fs = require('fs');
const sizeOf = require('image-size');
const mergeImages = require('../dist/build.common.cjs');

const INPUT_DIR = `${__dirname}/input`;
const OUTPUT_DIR = `${__dirname}/output`;

/**
 * Get the pixel dimensions of an image file.
 * @param {string} filePath Image file path.
 * @returns {{width: number, height: number}} Width and height in pixels.
 */
const getDimensions = (filePath) => {
  const {width, height} = sizeOf(filePath);
  return {width, height};
};

/**
 * Calculate aggregate dimensions for a list of images.
 * Returns total and max width/height, with optional offset between images.
 * @param {string[]} filePaths Image file paths.
 * @param {{offsetX?: number, offsetY?: number}} options Spacing between images.
 * @returns {{totalWidth: number, totalHeight: number, maxWidth: number, maxHeight: number}}
 */
const calcDimensions = (filePaths, {offsetX = 0, offsetY = 0} = {}) => {
  const result = filePaths.reduce((acc, filePath) => {
    const {width, height} = getDimensions(filePath);
    acc.totalWidth += width;
    acc.totalHeight += height;
    acc.maxWidth = Math.max(acc.maxWidth, width);
    acc.maxHeight = Math.max(acc.maxHeight, height);
    return acc;
  }, {totalWidth: 0, totalHeight: 0, maxWidth: 0, maxHeight: 0});
  result.totalHeight += (filePaths.length - 1) * offsetY;
  result.totalWidth += (filePaths.length - 1) * offsetX;
  return result;
};

// Clean output directory before each test run.
beforeAll(() => {
  if (fs.existsSync(OUTPUT_DIR))
    fs.rmSync(OUTPUT_DIR, {recursive: true, force: true});
});

describe('Append mode', () => {
  test('Merges vertically by default', async () => {
    const inputPaths = [`${INPUT_DIR}/red-square.jpg`, `${INPUT_DIR}/green-square.jpg`, `${INPUT_DIR}/blue-square.jpg`];
    const outputPath = `${OUTPUT_DIR}/vertical.jpg`;
    await mergeImages(inputPaths, outputPath);
    expect(fs.existsSync(outputPath)).toBe(true);
    const {width, height} = getDimensions(outputPath);
    const {totalHeight, maxWidth} = calcDimensions(inputPaths);
    expect(width).toBe(maxWidth);
    expect(height).toBe(totalHeight);
  });

  test('Merges horizontally with direction option', async () => {
    const inputPaths = [`${INPUT_DIR}/red-square.jpg`, `${INPUT_DIR}/green-square.jpg`, `${INPUT_DIR}/blue-square.jpg`];
    const outputPath = `${OUTPUT_DIR}/horizontal.jpg`;
    await mergeImages(inputPaths, outputPath, {direction: 'horizontal'});
    expect(fs.existsSync(outputPath)).toBe(true);
    const {width, height} = getDimensions(outputPath);
    const {maxHeight, totalWidth} = calcDimensions(inputPaths);
    expect(width).toBe(totalWidth);
    expect(height).toBe(maxHeight);
  });

  test('Merges vertically with spacing', async () => {
    const inputPaths = [`${INPUT_DIR}/red-square.jpg`, `${INPUT_DIR}/green-square.jpg`, `${INPUT_DIR}/blue-square.jpg`];
    const outputPath = `${OUTPUT_DIR}/vertical-spacing.jpg`;
    const offset = 30;
    await mergeImages(inputPaths, outputPath, {offset, background: '#000'});
    expect(fs.existsSync(outputPath)).toBe(true);
    const {width, height} = getDimensions(outputPath);
    const {totalHeight, maxWidth} = calcDimensions(inputPaths, {offsetY: offset});
    expect(width).toBe(maxWidth);
    expect(height).toBe(totalHeight);
  });

  test('Merges horizontally with spacing', async () => {
    const inputPaths = [`${INPUT_DIR}/red-square.jpg`, `${INPUT_DIR}/green-square.jpg`, `${INPUT_DIR}/blue-square.jpg`];
    const outputPath = `${OUTPUT_DIR}/horizontal-spacing.jpg`;
    const offset = 30;
    await mergeImages(inputPaths, outputPath, {direction: 'horizontal', offset, background: '#000'});
    expect(fs.existsSync(outputPath)).toBe(true);
    const {width, height} = getDimensions(outputPath);
    const {maxHeight, totalWidth} = calcDimensions(inputPaths, {offsetX: offset});
    expect(width).toBe(totalWidth);
    expect(height).toBe(maxHeight);
  });

  test('Vertical merge adjusts width to the largest image', async () => {
    const inputPaths = [`${INPUT_DIR}/red-square.jpg`, `${INPUT_DIR}/green-square.jpg`, `${INPUT_DIR}/teal-wide.jpg`];
    const outputPath = `${OUTPUT_DIR}/vertical-mixed-sizes.jpg`;
    await mergeImages(inputPaths, outputPath, {background: '#000'});
    expect(fs.existsSync(outputPath)).toBe(true);
    const {width, height} = getDimensions(outputPath);
    const {totalHeight, maxWidth} = calcDimensions(inputPaths);
    expect(width).toBe(maxWidth);
    expect(height).toBe(totalHeight);
  });

  test('Horizontal merge adjusts height to the largest image', async () => {
    const inputPaths = [`${INPUT_DIR}/red-square.jpg`, `${INPUT_DIR}/green-square.jpg`, `${INPUT_DIR}/yellow-tall.jpg`];
    const outputPath = `${OUTPUT_DIR}/horizontal-mixed-sizes.jpg`;
    await mergeImages(inputPaths, outputPath, {direction: 'horizontal', background: '#000'});
    expect(fs.existsSync(outputPath)).toBe(true);
    const {width, height} = getDimensions(outputPath);
    const {maxHeight, totalWidth} = calcDimensions(inputPaths);
    expect(width).toBe(totalWidth);
    expect(height).toBe(maxHeight);
  });
});

describe('Position mode', () => {
  test('Places images at specified coordinates', async () => {
    const inputPaths = [`${INPUT_DIR}/red-square.jpg`, `${INPUT_DIR}/green-square.jpg`];
    const outputPath = `${OUTPUT_DIR}/positioned.jpg`;
    const positions = {0: {x: 0, y: 0}, 1: {x: 50, y: 50}};
    await mergeImages(inputPaths, outputPath, {positions});
    expect(fs.existsSync(outputPath)).toBe(true);

    // Verify canvas size matches expected dimensions from positions + image sizes.
    const dim0 = getDimensions(inputPaths[0]);
    const dim1 = getDimensions(inputPaths[1]);
    const expectedWidth = Math.max(positions[0].x + dim0.width, positions[1].x + dim1.width);
    const expectedHeight = Math.max(positions[0].y + dim0.height, positions[1].y + dim1.height);
    const {width, height} = getDimensions(outputPath);
    expect(width).toBe(expectedWidth);
    expect(height).toBe(expectedHeight);
  });
});

describe('Grid mode', () => {
  test('Arranges images in a grid with column count', async () => {
    const inputPaths = [
      `${INPUT_DIR}/red-square.jpg`, `${INPUT_DIR}/green-square.jpg`,
      `${INPUT_DIR}/blue-square.jpg`, `${INPUT_DIR}/red-square.jpg`,
    ];
    const outputPath = `${OUTPUT_DIR}/grid.jpg`;
    await mergeImages(inputPaths, outputPath, {grid: 2});
    expect(fs.existsSync(outputPath)).toBe(true);

    // 2x2 grid of same-sized squares: width = 2 images wide, height = 2 images tall.
    const dim = getDimensions(inputPaths[0]);
    const {width, height} = getDimensions(outputPath);
    expect(width).toBe(dim.width * 2);
    expect(height).toBe(dim.height * 2);
  });

  test('Arranges images in a grid with explicit columns and rows', async () => {
    const inputPaths = [
      `${INPUT_DIR}/red-square.jpg`, `${INPUT_DIR}/green-square.jpg`,
      `${INPUT_DIR}/blue-square.jpg`,
    ];
    const outputPath = `${OUTPUT_DIR}/grid-explicit.jpg`;
    await mergeImages(inputPaths, outputPath, {grid: {columns: 3, rows: 1}});
    expect(fs.existsSync(outputPath)).toBe(true);

    // 3x1 grid: all images in a single row.
    const {width, height} = getDimensions(outputPath);
    const {totalWidth, maxHeight} = calcDimensions(inputPaths);
    expect(width).toBe(totalWidth);
    expect(height).toBe(maxHeight);
  });

  test('Arranges images in a grid with spacing', async () => {
    const inputPaths = [
      `${INPUT_DIR}/red-square.jpg`, `${INPUT_DIR}/green-square.jpg`,
      `${INPUT_DIR}/blue-square.jpg`, `${INPUT_DIR}/red-square.jpg`,
    ];
    const outputPath = `${OUTPUT_DIR}/grid-spacing.jpg`;
    const offset = 10;
    await mergeImages(inputPaths, outputPath, {grid: 2, offset, background: '#000'});
    expect(fs.existsSync(outputPath)).toBe(true);
  });
});
