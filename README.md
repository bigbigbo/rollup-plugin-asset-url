# rollup-plugin-asset-url
fork from [rollup-plugin-url](https://github.com/rollup/rollup-plugin-url) . Similar to rollup-plugin-url and add `reserveImportInJs` option .

## Why ?
 when i use `rollup-plugin-url` build my component that with image then used in webpack, it has some problem .

- rollup-plugin-url 

webpack can not resolve such a url
 ```js
var loadingIcon = './static/images/loading-24b7d7fd646f1365.gif';
React.createElement('img', { className: 'loading-img', src: loadingIcon, alt: '' })
 ```

 - rollup-plugin-asset-url

 webpack work well
```js
var loadingIcon = require('./static/images/loading-24b7d7fd646f1365.gif');
React.createElement('img', { className: 'loading-img', src: loadingIcon, alt: '' })
```

## Install 
```js
npm install rollup-plugin-asset-url -D
// or
yarn add rollup-plugin-asset-url -D
```

## Usage

```js
// rollup.config.js
import url from "rollup-plugin-asset-url"

export default {
  // ...
  plugins: [
    url({
      fileName: '[name]-[hash][extname]',
      output: './static/',
      limit: 8 * 1024,
      reserveImportInJs: true // default to true . if true, it will reserve require code
    }),
  ]
}
```

## Options

### limit
Optional. Type: `number`.

This is the file size limit to inline files. If files exceed this limit, they will be copied instead to the destination folder and the hashed filename will be given instead. If value set to 0 all files will be copied.

Defaults to 8kb.

### include / exclude
Optional. Type: a minimatch pattern, or array of minimatch patterns

These patterns determine which files are inlined. Defaults to .svg, .png, .jpg and .gif files.

### fileName
Optional. Type: `string`

It accepts the following string replacements:

[hash] - The hash value of the file's contents
[name] - The name of the imported file, without it's file extension
[extname] - The extension of the imported file, including the leading .

Defaults to: `"[hash][extname]"`

### output
Optional. Type: `string`

It is a `relative path` and what relate with `rollup.output.file`

```jsx
// src/index.js
import image from '../../assets/images/demo.png'

const Demo = () => <img src={image} alt="" />

export default Demo

// rollup.config.js
export default {
  input: './src/index.js',
  output: {
    file: './dist/index.js',
    format: 'cjs'
  },
  plugins: [
    url({
      fileName: '[name]-[hash][extname]',
      output: './static/',
      limit: 8 * 1024,
      reserveImportInJs: true // default to true . if true, it will reserve require code
    }),
  ]
}

// output dir
│  index.js
│
└─static
    demo-8b7028a9ad9ac27a.png

// output index.js
var image = require('./static/demo-8b7028a9ad9ac27a.png')
```
