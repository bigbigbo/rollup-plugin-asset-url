import path from 'path';
import buble from 'rollup-plugin-buble';
import postcss from 'rollup-plugin-postcss';
import image from '../src/index.js';

export default {
  input: path.resolve(__dirname, './src/index.js'),
  output: [
    {
      file: path.resolve(__dirname, './dist/lib/index.js'),
      format: 'cjs',
      sourcemap: true
    },
    {
      file: path.resolve(__dirname, './dist/es/index.js'),
      format: 'es',
      sourcemap: true
    }
  ],
  plugins: [
    postcss({
      extract: true
    }),
    image({
      fileName: '[name]-[hash][extname]',
      output: './static/images/',
      limit: 8 * 1024,
      reserveImportInJs: true
    }),
    buble()
  ]
};
