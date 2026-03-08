# Sandbox

A sandbox for verifying that node-merge-images works correctly via `npm link`.

## Usage

```sh
# 1. Register the link from the project root
cd /path/to/node-merge-images
npm link

# 2. Move to sandbox and link the package
cd sandbox
npm link node-merge-images

# 3. Run CJS test
node test-cjs.cjs

# 4. Run ESM test
node test-esm.mjs
```

Output images are generated in the `output/` directory.
