const mergeImages = require('../dist/build.common.cjs');

const INPUT_DIR = `${__dirname}/input`;
const OUTPUT_DIR = `${__dirname}/output`;

describe('Validation', () => {
  // Common parameter validation.
  test('Rejects non-array inputPaths', async () => {
    await expect(mergeImages(null, `${OUTPUT_DIR}/out.jpg`)).rejects.toThrow(TypeError);
  });

  test('Rejects empty inputPaths', async () => {
    await expect(mergeImages([], `${OUTPUT_DIR}/out.jpg`)).rejects.toThrow(TypeError);
  });

  test('Rejects empty outputPath', async () => {
    const inputPaths = [`${INPUT_DIR}/red-square.jpg`, `${INPUT_DIR}/green-square.jpg`];
    await expect(mergeImages(inputPaths, null)).rejects.toThrow(TypeError);
  });

  test('Rejects non-existent input files', async () => {
    await expect(mergeImages([`${INPUT_DIR}/no-such-file.jpg`], `${OUTPUT_DIR}/out.jpg`)).rejects.toThrow(TypeError);
  });

  // Append mode validation.
  test('Rejects invalid direction', async () => {
    const inputPaths = [`${INPUT_DIR}/red-square.jpg`, `${INPUT_DIR}/green-square.jpg`];
    await expect(mergeImages(inputPaths, `${OUTPUT_DIR}/out.jpg`, {direction: 'diagonal'})).rejects.toThrow(TypeError);
  });

  test('Rejects negative offset', async () => {
    const inputPaths = [`${INPUT_DIR}/red-square.jpg`, `${INPUT_DIR}/green-square.jpg`];
    await expect(mergeImages(inputPaths, `${OUTPUT_DIR}/out.jpg`, {offset: -1})).rejects.toThrow(TypeError);
  });

  // Position mode validation.
  test('Rejects positions with missing index', async () => {
    const inputPaths = [`${INPUT_DIR}/red-square.jpg`, `${INPUT_DIR}/green-square.jpg`];
    const positions = {0: {x: 0, y: 0}};  // Missing index 1.
    await expect(mergeImages(inputPaths, `${OUTPUT_DIR}/out.jpg`, {positions})).rejects.toThrow(TypeError);
  });

  test('Rejects positions with negative coordinates', async () => {
    const inputPaths = [`${INPUT_DIR}/red-square.jpg`];
    const positions = {0: {x: -1, y: 0}};
    await expect(mergeImages(inputPaths, `${OUTPUT_DIR}/out.jpg`, {positions})).rejects.toThrow(TypeError);
  });

  // Grid mode validation.
  test('Rejects grid with zero columns', async () => {
    const inputPaths = [`${INPUT_DIR}/red-square.jpg`, `${INPUT_DIR}/green-square.jpg`];
    await expect(mergeImages(inputPaths, `${OUTPUT_DIR}/out.jpg`, {grid: 0})).rejects.toThrow(TypeError);
  });

  test('Rejects grid with non-integer columns', async () => {
    const inputPaths = [`${INPUT_DIR}/red-square.jpg`, `${INPUT_DIR}/green-square.jpg`];
    await expect(mergeImages(inputPaths, `${OUTPUT_DIR}/out.jpg`, {grid: 1.5})).rejects.toThrow(TypeError);
  });

  // Mutual exclusion.
  test('Rejects positions and grid used together', async () => {
    const inputPaths = [`${INPUT_DIR}/red-square.jpg`];
    const options = {positions: {0: {x: 0, y: 0}}, grid: 2};
    await expect(mergeImages(inputPaths, `${OUTPUT_DIR}/out.jpg`, options)).rejects.toThrow(TypeError);
  });
});
