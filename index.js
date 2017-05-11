'use strict';

var glslify = require('glslify');
var rollupPluginutils = require('rollup-pluginutils');
var path = require('path');

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

function glslify$1(options) {
  if ( options === void 0 ) options = {};

  var flags = Object.assign({}, {
    removeComments: true,
    removeDuplicateWhitespaces: true,
  }, options);

  var filter = rollupPluginutils.createFilter(
    options.include || '**/*.+(glsl|vert|frag)',
    options.exclude);

  return {
    name: 'glslify',

    transform: function transform(code, id) {
      if (!filter(id)) {
        return null
      }
      var source = glslify.compile(code, {
        basedir: options.basedir || path.dirname(id),
        transform: options.transform,
      });
      if (flags.removeComments) {
        source = source
          .replace(/[ \t]*\/\/.*\n/g, '')
          .replace(/[ \t]*\/\*[\s\S]*?\*\//g, '');
      }
      if (flags.removeDuplicateWhitespaces) {
        source = source
          .replace(/\n{2,}/g, '\n')
          .replace(/([ \t]){2,}/g, '$1');
      }
      var transformedCode = "export default " + (JSON.stringify(source)) + ";";
      return {
        code: transformedCode,
        map: { mappings: '' },
      }
    },
  }
}

module.exports = glslify$1;
