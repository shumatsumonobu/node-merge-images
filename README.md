# node-merge-images

Merge multiple images into one with ImageMagick.
Supports vertical/horizontal merging, custom spacing, free-form positioning, and grid layouts.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Supported OS

- Linux
- macOS

## Requirements

ImageMagick CLI tools must be installed on your system.

**macOS** (Homebrew):
```sh
brew install imagemagick
```

**Linux** (apt):
```sh
sudo apt-get install imagemagick
```

**Linux** (yum):
```sh
sudo yum -y install ImageMagick
```

## Installation

```sh
npm install node-merge-images
```

## Usage

```js
// CommonJS
const mergeImages = require('node-merge-images');

// ESM
import mergeImages from 'node-merge-images';
```

### Vertical merge (default)

```js
await mergeImages(['1.jpg', '2.jpg', '3.jpg'], 'output.jpg');
```

<img width="150" src="screenshots/vertical.jpg">

### Horizontal merge

```js
await mergeImages(['1.jpg', '2.jpg', '3.jpg'], 'output.jpg', {direction: 'horizontal'});
```

<img width="300" src="screenshots/horizontal.jpg">

### Vertical merge with spacing

Spacing is filled with the `background` color (`'#000'` in this example).

```js
await mergeImages(['1.jpg', '2.jpg', '3.jpg'], 'output.jpg', {offset: 30, background: '#000'});
```

<img width="150" src="screenshots/vertical-spacing.jpg">

### Horizontal merge with spacing

```js
await mergeImages(['1.jpg', '2.jpg', '3.jpg'], 'output.jpg', {
  direction: 'horizontal',
  offset: 30,
  background: '#000',
});
```

<img width="300" src="screenshots/horizontal-spacing.jpg">

### Merging images of different sizes

When images have different dimensions, the output adjusts to the largest width (vertical) or height (horizontal).

**Vertical:**
```js
await mergeImages(['1.jpg', '2.jpg', 'wide.jpg'], 'output.jpg', {background: '#000'});
```

<img width="200" src="screenshots/vertical-mixed-sizes.jpg">

**Horizontal:**
```js
await mergeImages(['1.jpg', '2.jpg', 'tall.jpg'], 'output.jpg', {direction: 'horizontal', background: '#000'});
```

<img width="300" src="screenshots/horizontal-mixed-sizes.jpg">

### Free-form positioning

Place each image at exact (x, y) coordinates on an auto-sized canvas.

```js
await mergeImages(['bg.jpg', 'icon.png', 'label.png'], 'output.jpg', {
  positions: {
    0: {x: 0, y: 0},
    1: {x: 10, y: 20},
    2: {x: 100, y: 50},
  },
});
```

<img width="200" src="screenshots/positioned.jpg">

### Grid layout

Arrange images in a grid by specifying the number of columns.

```js
// 3-column grid (rows auto-calculated)
await mergeImages(
  ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg'],
  'output.jpg',
  {grid: 3},
);

// Explicit 3x2 grid with spacing
await mergeImages(
  ['1.jpg', '2.jpg', '3.jpg', '4.jpg'],
  'output.jpg',
  {grid: {columns: 3, rows: 2}, offset: 10, background: '#000'},
);
```

<img width="200" src="screenshots/grid.jpg">

## API

### `mergeImages(inputPaths, outputPath[, options])`

Returns `Promise<void>`.

#### Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `inputPaths` | `string[]` | *required* | Paths of images to merge. |
| `outputPath` | `string` | *required* | Output path for the merged image. |
| `options.direction` | `'vertical' \| 'horizontal'` | `'vertical'` | Merge direction (append mode). |
| `options.background` | `string` | `'white'` | Background color. Accepts color names, hex (`'#ff0000'`), `rgb()`, etc. |
| `options.offset` | `number` | `0` | Spacing in pixels between images. |
| `options.positions` | `Record<number, {x, y}>` | — | Place each image at (x, y) coordinates. |
| `options.grid` | `number \| {columns, rows?}` | — | Arrange images in a grid layout. |

> **Note:** `positions` and `grid` cannot be used together.
> When `positions` is set, `direction` and `offset` are ignored.
> When `grid` is set, `direction` is ignored.

#### Errors

| Error | Condition |
|---|---|
| `TypeError` | `inputPaths` is not an array or is empty. |
| `TypeError` | `outputPath` is empty. |
| `TypeError` | `direction` is not `'vertical'` or `'horizontal'`. |
| `TypeError` | `offset` is negative. |
| `TypeError` | One or more input files do not exist. |
| `TypeError` | `positions` and `grid` are both specified. |
| `Error` | ImageMagick command execution failed. |

## Testing

```sh
npm test
```

## Author

**shumatsumonobu**

- [GitHub](https://github.com/shumatsumonobu)
- [X](https://x.com/shumatsumonobu)
- [Facebook](https://www.facebook.com/takuya.motoshima.7)

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

## License

[MIT](LICENSE)
