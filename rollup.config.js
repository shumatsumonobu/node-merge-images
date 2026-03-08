import {builtinModules, createRequire} from 'module';
import typescript from 'rollup-plugin-typescript2';
import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';

const require = createRequire(import.meta.url);
const pkg = require('./package.json');

export default {
  // Treat Node.js built-in modules (fs, path, os, etc.) as external dependencies.
  external: builtinModules,

  // TypeScript entry point.
  input: './src/index.ts',

  plugins: [
    // Compile TypeScript and emit declaration files to the directory specified in tsconfig.
    typescript({
      tsconfigDefaults: {compilerOptions: {}},
      tsconfig: "tsconfig.json",
      tsconfigOverride: {compilerOptions: {}},
      useTsconfigDeclarationDir: true
    }),

    // Minify the output bundles.
    terser(),

    // Allow importing JSON files (e.g., package.json).
    json(),

    // Convert CommonJS dependencies to ES modules for bundling.
    commonjs(),

    // Resolve third-party modules from node_modules.
    resolve({
      mainFields: ['module', 'main'],
    })
  ],

  // Generate both ESM and CommonJS bundles.
  output: [
    {
      format: 'esm',
      file: pkg.module
    }, {
      format: 'cjs',
      file: pkg.main
    }
  ],
}
