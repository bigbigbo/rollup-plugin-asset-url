import path from 'path';
import babel from 'rollup-plugin-babel';

const external = ['rollup-pluginutils', 'mime', 'crypto', 'path', 'fs', 'mkpath'];

export default {
  input: path.resolve(__dirname, './src/index.js'),
  output: {
    file: path.resolve(__dirname, './dist/lib/index.js'),
    format: 'cjs'
  },
  external,
  plugins: [
    babel({
      exclude: 'node_modules/**',
      babelrc: true
    })
  ]
};
