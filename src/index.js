import { stat, readFile, createReadStream, createWriteStream } from 'fs';
import path from 'path';

// rollup-utils
import { createFilter, dataToEsm } from 'rollup-pluginutils';

// dependencies
import crypto from 'crypto';
import mime from 'mime';
import mkpath from 'mkpath';

// utils
const promisily = fn => (...args) => {
  return new Promise((resolve, reject) => {
    fn(...args, (err, res) => {
      if (err) {
        return reject(err);
      }
      return resolve(res);
    });
  });
};

function copy(src, dest) {
  return new Promise((resolve, reject) => {
    const read = createReadStream(src);
    read.on('error', reject);
    const write = createWriteStream(dest);
    write.on('error', reject);
    write.on('finish', resolve);
    read.pipe(write);
  });
}

// https://github.com/filamentgroup/directory-encoder/blob/master/lib/svg-uri-encoder.js
function encodeSVG(buffer) {
  return (
    encodeURIComponent(
      buffer
        .toString('utf-8')
        // strip newlines and tabs
        .replace(/[\n\r]/gim, '')
        .replace(/\t/gim, ' ')
        // strip comments
        .replace(/<!\-\-(.*(?=\-\->))\-\->/gim, '')
        // replace
        .replace(/'/gim, '\\i')
    )
      // encode brackets
      .replace(/\(/g, '%28')
      .replace(/\)/g, '%29')
  );
}

const _stat = promisily(stat);
const _readFile = promisily(readFile);
const _mkpath = promisily(mkpath);

function image(options = {}) {
  const {
    limit = 8 * 1024,
    fileName = '[hash][extname]',
    include = ['**/*.svg', '**/*.png', '**/*.jpg', '**/*.gif'],
    exclude,
    output = '',
    hash = true,
    reserveImportInJs = true, // 是否保留js中的 import(或者 require) 语句
    compatibleWithCss = false // 是否兼容样式文件的 css url 语法, 如果启用该项
  } = options;

  const filter = createFilter(include, exclude);

  const copies = Object.create(null);

  return {
    name: 'image',
    async load(id) {
      if (!filter(id)) return null;

      const [stats, buffer] = await Promise.all([_stat(id), _readFile(id)]);

      let data;

      if ((limit && stats.size > limit) || limit === 0) {
        const hash = crypto
          .createHash('sha1')
          .update(buffer)
          .digest('hex')
          .substr(0, 16);
        const ext = path.extname(id);
        const name = path.basename(id, ext);

        let outputFileName = fileName
          .replace(/\[hash\]/g, hash)
          .replace(/\[extname\]/g, ext)
          .replace(/\[name\]/g, name);

        if (!!output) {
          // options 中指定的 output 为 rollup 中 output.file 的相对路径
          // 此处直接拼接，在复制图片的过程中会拼接 output.file 的路径，所以并无问题
          const separator = '/';
          const isEndWithSep = output.endsWith(separator);
          outputFileName = `${output}${isEndWithSep ? '' : separator}${outputFileName}`;
        }

        // generateBundle 复制 copies 中的文件
        copies[id] = outputFileName;

        // reserveImportInJs 为 true 并且资源文件大小超过 limit 时，
        // 会依旧保留其import(或者 require) 语句
        if (reserveImportInJs) {
          const code = `export default require('${outputFileName}');`;
          const ast = this.parse(`var a = require('a')`); // 只是需要这样的 ast 而已

          return { ast, code, map: { mappings: '' } };
        }
        data = `${outputFileName}`;
      } else {
        // transform to base64
        const mimetype = mime.getType(id);
        const isSVG = mimetype === 'image/svg+xml';
        data = isSVG ? encodeSVG(buffer) : buffer.toString('base64');
        const encoding = isSVG ? '' : ';base64';
        data = `data:${mimetype}${encoding},${data}`;
      }

      return `export default "${data}"`;
    },

    async generateBundle(outputOptions, bundle, isWrite) {
      const { file } = outputOptions;

      // like dist/es
      const base = path.dirname(file);

      await _mkpath(base);

      return Promise.all(
        Object.keys(copies).map(async name => {
          const output = copies[name];
          // Create a nested directory if the fileName pattern contains
          // a directory structure
          const outputDirectory = path.join(base, path.dirname(output));
          await _mkpath(outputDirectory);
          return copy(name, path.join(base, output));
        })
      );
    }
  };
}

export default image;
