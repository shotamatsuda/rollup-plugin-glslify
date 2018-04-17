'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var glslify = require('glslify');
var rollupPluginutils = require('rollup-pluginutils');
var path = require('path');
var stream = require('stream');
var deparser = _interopDefault(require('glsl-deparser'));
var parser = _interopDefault(require('glsl-parser'));
var tokenizer = _interopDefault(require('glsl-tokenizer/stream'));

// The MIT License

function minify(glsl) {
  return new Promise((resolve, reject) => {
    let result = '';
    const stream$$1 = new stream.Readable();
    stream$$1.pipe(tokenizer()).pipe(parser()).pipe(deparser(false)).on('data', buffer => {
      result += buffer.toString();
    }).on('end', () => resolve(result));
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
