# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2026-03-08

### Added

- Free-form positioning: place each image at exact (x, y) coordinates on an auto-sized canvas via the `positions` option.
- Grid layout: arrange images in rows and columns via the `grid` option. Supports both shorthand (`grid: 3`) and explicit form (`grid: {columns: 3, rows: 2}`).

### Changed

- Drop the [fs-extra](https://www.npmjs.com/package/fs-extra) dependency in favor of the built-in `fs` module.
- Rewrite README with usage examples for all merge modes.

## [1.0.1] - 2024-06-27

### Changed

- Drop the [nodejs-shared](https://www.npmjs.com/package/nodejs-shared) dependency in favor of built-in Node.js APIs.

## [1.0.0] - 2022-12-19

### Added

- Initial release with vertical and horizontal image merging, configurable spacing, and background color support.

[1.1.0]: https://github.com/shumatsumonobu/node-merge-images/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/shumatsumonobu/node-merge-images/compare/v1.0.0...v1.0.1
