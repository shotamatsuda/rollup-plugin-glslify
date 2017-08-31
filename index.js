'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var glslify = require('glslify');
var rollupPluginutils = require('rollup-pluginutils');
var path = require('path');
var stream = require('stream');
var deparser = _interopDefault(require('glsl-deparser'));
var parser = _interopDefault(require('glsl-parser'));
var tokenizer = _interopDefault(require('glsl-tokenizer/stream'));

//
//  The MIT License
//
//  Copyright (C) 2016-Present Shota Matsuda
//
//  Permission is hereby granted, free of charge, to any person obtaining a
//  copy of this software and associated documentation files (the "Software"),
//  to deal in the Software without restriction, including without limitation
//  the rights to use, copy, modify, merge, publish, distribute, sublicense,
//  and/or sell copies of the Software, and to permit persons to whom the
//  Software is furnished to do so, subject to the following conditions:
//
//  The above copyright notice and this permission notice shall be included in
//  all copies or substantial portions of the Software.
//
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
//  THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
//  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
//  DEALINGS IN THE SOFTWARE.
//

function minify(glsl) {
  return new Promise((resolve, reject) => {
    let result = '';
    const stream$$1 = new stream.Readable();
    stream$$1.pipe(tokenizer()).pipe(parser()).pipe(deparser(false)).on('data', buffer => result += buffer.toString()).on('end', () => resolve(result));
    stream$$1.push(glsl);
    stream$$1.push(null);
  });
}

function glslify$1(options = {}) {
  const filter = rollupPluginutils.createFilter(options.include || '**/*.+(glsl|vert|frag)', options.exclude);

  return {
    name: 'glslify',

    async transform(code, id) {
      if (!filter(id)) {
        return null;
      }
      let source = glslify.compile(code, {
        basedir: options.basedir || path.dirname(id),
        transform: options.transform
      });
      if (options.minify) {
        const minified = await minify(source);
        if (!minified) {
          console.warn('Failed to minify:', id);
        } else {
          source = minified;
        }
      }
      const transformedCode = `export default ${JSON.stringify(source)};`;
      return {
        code: transformedCode,
        map: { mappings: '' }
      };
    }
  };
}

module.exports = glslify$1;
