import fs from 'fs';
import path from 'path';
import im from 'imagemagick';

/**
 * Position coordinates for placing an image on the output canvas.
 */
export interface ImagePosition {
  /** Horizontal offset in pixels from the left edge. */
  x: number;
  /** Vertical offset in pixels from the top edge. */
  y: number;
}

/**
 * Options for configuring image merging behavior.
 */
export interface MergeImagesOptions {
  /**
   * Direction of the merged image.
   * Used in append mode (when neither `positions` nor `grid` is specified).
   * @default 'vertical'
   */
  direction: 'vertical' | 'horizontal';

  /**
   * The background color of the merged image.
   * Accepts a color name, a hex color, or a numerical RGB, RGBA, HSL, HSLA, CMYK, or CMYKA specification.
   * For example, `'blue'`, `'#ddddff'`, `'rgb(255,255,255)'`, etc.
   * @default 'white'
   */
  background: string;

  /**
   * Offset in pixels between each image.
   * Used in append mode and grid mode.
   * @default 0
   */
  offset: number;

  /**
   * Manual position for each input image, keyed by image index.
   * When specified, images are placed at exact (x, y) coordinates on an auto-sized canvas.
   * The canvas size is automatically calculated from the positions and image dimensions.
   * Cannot be used together with `grid`.
   * @default undefined
   */
  positions?: Record<number, ImagePosition>;

  /**
   * Merge images in a grid layout.
   * Specify a number for columns only (rows are auto-calculated),
   * or an object with `columns` and optional `rows`.
   * Cannot be used together with `positions`.
   * @default undefined
   */
  grid?: number | {columns: number; rows?: number};
}

/**
 * Validate common parameters shared by all merge modes.
 * @param {string[]} inputPaths Path list of images to merge.
 * @param {string} outputPath Output destination path for the merged image.
 * @throws {TypeError} inputPaths is not an array, is empty, outputPath is empty, or input files do not exist.
 */
function validateCommonParameters(inputPaths: string[], outputPath: string): void {
  if (!Array.isArray(inputPaths))
    throw new TypeError('inputPaths must be an array that contains images');
  else if (inputPaths.length < 1)
    throw new TypeError('inputPaths must contain at least one image');
  else if (!outputPath)
    throw new TypeError('outputPath should be a file path');

  const missingInputPaths = inputPaths.filter(inputPath => !fs.existsSync(inputPath));
  if (missingInputPaths.length > 0)
    throw new TypeError(`Input path ${missingInputPaths.join(', ')} not found`);
}

/**
 * Validate append mode specific parameters.
 * @param {MergeImagesOptions} options Merge options containing direction and offset.
 * @throws {TypeError} The direction option is invalid or offset is negative.
 */
function validateAppendParameters(options: MergeImagesOptions): void {
  if (!/^(vertical|horizontal)$/.test(options.direction))
    throw new TypeError('The direction option should be "vertical" or "horizontal"');
  if (options.offset < 0)
    throw new TypeError('The offset option should be a number greater than or equal to 0');
}

/**
 * Validate positions mode specific parameters.
 * @param {string[]} inputPaths Path list of images to merge.
 * @param {Record<number, ImagePosition>} positions Position map keyed by image index.
 * @throws {TypeError} Positions are missing for some images or contain invalid coordinates.
 */
function validatePositionsParameters(inputPaths: string[], positions: Record<number, ImagePosition>): void {
  for (let i = 0; i < inputPaths.length; i++) {
    if (!positions[i])
      throw new TypeError(`Position for image at index ${i} is not specified`);
    if (typeof positions[i].x !== 'number' || typeof positions[i].y !== 'number')
      throw new TypeError(`Position for image at index ${i} must have numeric x and y values`);
    if (positions[i].x < 0 || positions[i].y < 0)
      throw new TypeError(`Position for image at index ${i} must have non-negative x and y values`);
  }
}

/**
 * Validate grid mode specific parameters.
 * @param {number|{columns: number, rows?: number}} grid Grid layout configuration.
 * @throws {TypeError} Grid columns/rows are invalid.
 */
function validateGridParameters(grid: number | {columns: number; rows?: number}): void {
  if (typeof grid === 'number') {
    if (!Number.isInteger(grid) || grid < 1)
      throw new TypeError('The grid option must be a positive integer');
  } else {
    if (!Number.isInteger(grid.columns) || grid.columns < 1)
      throw new TypeError('The grid columns must be a positive integer');
    if (grid.rows !== undefined && (!Number.isInteger(grid.rows) || grid.rows < 1))
      throw new TypeError('The grid rows must be a positive integer');
  }
}

/**
 * Get image dimensions using ImageMagick identify.
 * @param {string} imagePath Path to the image file.
 * @returns {Promise<{width: number, height: number}>} A promise that resolves to the image dimensions.
 */
function getImageDimensions(imagePath: string): Promise<{width: number; height: number}> {
  return new Promise((resolve, reject) => {
    im.identify(imagePath, (err: any, result: any) => {
      if (err)
        return void reject(err);
      resolve({width: result.width, height: result.height});
    });
  });
}

/**
 * Execute an ImageMagick convert command.
 * @param {string[]} convertArgs Argument list for the convert command.
 * @returns {Promise<void>} A promise that resolves when the command completes.
 */
function runConvert(convertArgs: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    im.convert(convertArgs, (err: any) => {
      if (err)
        return void reject(err);
      resolve();
    });
  });
}

/**
 * Ensure the output directory exists, creating it if necessary.
 * @param {string} outputPath Output file path whose parent directory will be created.
 */
function ensureOutputDirectory(outputPath: string): void {
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, {recursive: true});
    fs.chmodSync(outputDir, 0o755);
  }
}

/**
 * Merge images using the append mode (vertical or horizontal).
 * @param {string[]} inputPaths Path list of images to merge.
 * @param {string} outputPath Output destination path for the merged image.
 * @param {MergeImagesOptions} options Merge options.
 * @returns {Promise<void>}
 */
async function mergeAppend(inputPaths: string[], outputPath: string, options: MergeImagesOptions): Promise<void> {
  const convertArgs: string[] = [];

  // Set background color.
  convertArgs.push('-background');
  convertArgs.push(options.background);

  // Add input images, inserting transparent spacers between them if offset > 0.
  if (options.offset > 0)
    convertArgs.push('-size', options.direction === 'vertical' ? `x${options.offset}` : `${options.offset}x`);
  convertArgs.push(inputPaths[0]);
  for (const inputPath of inputPaths.slice(1)) {
    if (options.offset > 0)
      convertArgs.push('xc:none');
    convertArgs.push(inputPath);
  }

  // Set the append direction: -append for vertical, +append for horizontal.
  convertArgs.push(options.direction === 'vertical' ? '-append' : '+append');
  convertArgs.push(outputPath);

  ensureOutputDirectory(outputPath);
  await runConvert(convertArgs);
}

/**
 * Merge images using free-form positioning on an auto-sized canvas.
 * @param {string[]} inputPaths Path list of images to merge.
 * @param {string} outputPath Output destination path for the merged image.
 * @param {MergeImagesOptions} options Merge options containing positions.
 * @returns {Promise<void>}
 */
async function mergePositioned(inputPaths: string[], outputPath: string, options: MergeImagesOptions): Promise<void> {
  const positions = options.positions!;

  // Get dimensions of all input images to calculate canvas size.
  const dimensions = await Promise.all(inputPaths.map(imagePath => getImageDimensions(imagePath)));

  // Calculate canvas size from positions and image dimensions.
  let canvasWidth = 0;
  let canvasHeight = 0;
  for (let i = 0; i < inputPaths.length; i++) {
    canvasWidth = Math.max(canvasWidth, positions[i].x + dimensions[i].width);
    canvasHeight = Math.max(canvasHeight, positions[i].y + dimensions[i].height);
  }

  // Build convert command: create canvas, then composite each image at its position.
  const convertArgs: string[] = [];
  convertArgs.push('-size', `${canvasWidth}x${canvasHeight}`, `xc:${options.background}`);
  for (let i = 0; i < inputPaths.length; i++) {
    convertArgs.push(inputPaths[i], '-geometry', `+${positions[i].x}+${positions[i].y}`, '-composite');
  }
  convertArgs.push(outputPath);

  ensureOutputDirectory(outputPath);
  await runConvert(convertArgs);
}

/**
 * Merge images in a grid layout.
 * @param {string[]} inputPaths Path list of images to merge.
 * @param {string} outputPath Output destination path for the merged image.
 * @param {MergeImagesOptions} options Merge options containing grid configuration.
 * @returns {Promise<void>}
 */
async function mergeGrid(inputPaths: string[], outputPath: string, options: MergeImagesOptions): Promise<void> {
  const columns = typeof options.grid === 'number' ? options.grid : options.grid!.columns;
  const rows = typeof options.grid === 'number'
    ? Math.ceil(inputPaths.length / columns)
    : (options.grid!.rows ?? Math.ceil(inputPaths.length / columns));

  // Get dimensions of all input images.
  const dimensions = await Promise.all(inputPaths.map(imagePath => getImageDimensions(imagePath)));

  // Calculate cell sizes (max width per column, max height per row).
  const colWidths: number[] = new Array(columns).fill(0);
  const rowHeights: number[] = new Array(rows).fill(0);
  for (let i = 0; i < inputPaths.length; i++) {
    const col = i % columns;
    const row = Math.floor(i / columns);
    colWidths[col] = Math.max(colWidths[col], dimensions[i].width);
    rowHeights[row] = Math.max(rowHeights[row], dimensions[i].height);
  }

  // Calculate canvas size including offsets between cells.
  const canvasWidth = colWidths.reduce((sum, w) => sum + w, 0) + (columns - 1) * options.offset;
  const canvasHeight = rowHeights.reduce((sum, h) => sum + h, 0) + (rows - 1) * options.offset;

  // Build convert command: create canvas, then composite each image at its grid position.
  const convertArgs: string[] = [];
  convertArgs.push('-size', `${canvasWidth}x${canvasHeight}`, `xc:${options.background}`);
  for (let i = 0; i < inputPaths.length; i++) {
    const col = i % columns;
    const row = Math.floor(i / columns);

    // Calculate x: sum of widths of previous columns + offsets.
    let x = 0;
    for (let c = 0; c < col; c++) x += colWidths[c] + options.offset;

    // Calculate y: sum of heights of previous rows + offsets.
    let y = 0;
    for (let r = 0; r < row; r++) y += rowHeights[r] + options.offset;

    convertArgs.push(inputPaths[i], '-geometry', `+${x}+${y}`, '-composite');
  }
  convertArgs.push(outputPath);

  ensureOutputDirectory(outputPath);
  await runConvert(convertArgs);
}

/**
 * Merge multiple images into a single image using ImageMagick.
 *
 * Supports three modes:
 * - **Append mode** (default): Merge images vertically or horizontally in sequence.
 * - **Position mode**: Place each image at a specific (x, y) coordinate on an auto-sized canvas.
 * - **Grid mode**: Arrange images in a grid layout with a specified number of columns.
 *
 * @param {string[]} inputPaths Path list of images to merge.
 * @param {string} outputPath Output destination path for the merged image.
 * @param {Object} [options] Merge options.
 * @param {'vertical'|'horizontal'} [options.direction='vertical'] Direction of the merged image (append mode only).
 * @param {string} [options.background='white'] The background color of the merged image.
 *   Accepts a color name, a hex color, or a numerical RGB, RGBA, HSL, HSLA, CMYK, or CMYKA specification.
 *   For example, `'blue'`, `'#ddddff'`, `'rgb(255,255,255)'`, etc.
 * @param {number} [options.offset=0] Offset in pixels between each image (append and grid modes).
 * @param {Record<number, ImagePosition>} [options.positions] Manual position for each image by index.
 *   When specified, images are composited at the given (x, y) coordinates.
 * @param {number|{columns: number, rows?: number}} [options.grid] Grid layout configuration.
 *   Specify a number for columns only, or an object with `columns` and optional `rows`.
 * @throws {TypeError} inputPaths is not an array.
 * @throws {TypeError} inputPaths is empty.
 * @throws {TypeError} outputPath is empty.
 * @throws {TypeError} The direction option is not "vertical" or "horizontal".
 * @throws {TypeError} The offset option is negative.
 * @throws {TypeError} One or more input files do not exist.
 * @throws {TypeError} Both positions and grid are specified.
 * @throws {Error} ImageMagick command execution failed.
 * @returns {Promise<void>}
 * @example
 * // Merge images vertically (default).
 * await mergeImages(['/path/to/image1.jpg', '/path/to/image2.jpg'], '/path/to/output.jpg');
 *
 * @example
 * // Merge images horizontally.
 * await mergeImages(
 *   ['/path/to/image1.png', '/path/to/image2.png'],
 *   '/path/to/output.png',
 *   {direction: 'horizontal'},
 * );
 *
 * @example
 * // Merge with 20px spacing and a black background.
 * await mergeImages(
 *   ['/path/to/image1.jpg', '/path/to/image2.jpg', '/path/to/image3.jpg'],
 *   '/path/to/output.jpg',
 *   {offset: 20, background: '#000'},
 * );
 *
 * @example
 * // Place images at specific positions on a canvas.
 * await mergeImages(
 *   ['/path/to/bg.jpg', '/path/to/icon.png', '/path/to/text.png'],
 *   '/path/to/output.jpg',
 *   {positions: {0: {x: 0, y: 0}, 1: {x: 10, y: 20}, 2: {x: 100, y: 50}}},
 * );
 *
 * @example
 * // Merge 6 images in a 3-column grid (2 rows auto-calculated).
 * await mergeImages(
 *   ['/path/to/1.jpg', '/path/to/2.jpg', '/path/to/3.jpg', '/path/to/4.jpg', '/path/to/5.jpg', '/path/to/6.jpg'],
 *   '/path/to/output.jpg',
 *   {grid: 3},
 * );
 *
 * @example
 * // Merge images in a 3x2 grid with 10px spacing.
 * await mergeImages(
 *   ['/path/to/1.jpg', '/path/to/2.jpg', '/path/to/3.jpg', '/path/to/4.jpg'],
 *   '/path/to/output.jpg',
 *   {grid: {columns: 3, rows: 2}, offset: 10, background: '#000'},
 * );
 */
export default async function mergeImages(inputPaths: string[], outputPath: string, options: Partial<MergeImagesOptions> = {}): Promise<void> {
  // Apply default values to unspecified options.
  const mergedOptions: MergeImagesOptions = Object.assign({
    direction: 'vertical' as const,
    background: 'white',
    offset: 0,
  }, options);

  // Validate common parameters.
  validateCommonParameters(inputPaths, outputPath);

  // Positions and grid cannot be used together.
  if (mergedOptions.positions && mergedOptions.grid !== undefined)
    throw new TypeError('The positions and grid options cannot be used together');

  // Dispatch to the appropriate merge mode.
  if (mergedOptions.positions) {
    // Position mode: place each image at specific coordinates.
    validatePositionsParameters(inputPaths, mergedOptions.positions);
    await mergePositioned(inputPaths, outputPath, mergedOptions);
  } else if (mergedOptions.grid !== undefined) {
    // Grid mode: arrange images in a grid layout.
    validateGridParameters(mergedOptions.grid);
    validateAppendParameters(mergedOptions);
    await mergeGrid(inputPaths, outputPath, mergedOptions);
  } else {
    // Append mode: merge images sequentially.
    validateAppendParameters(mergedOptions);
    await mergeAppend(inputPaths, outputPath, mergedOptions);
  }
}
