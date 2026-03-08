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
    grid?: number | {
        columns: number;
        rows?: number;
    };
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
export default function mergeImages(inputPaths: string[], outputPath: string, options?: Partial<MergeImagesOptions>): Promise<void>;
