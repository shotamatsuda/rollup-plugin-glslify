// The MIT License
// Copyright (C) 2016-Present Shota Matsuda

import { compile } from 'glslify'
import { createFilter } from 'rollup-pluginutils'
import { dirname } from 'path'
import { Readable } from 'stream'
import deparser from 'glsl-deparser'
import parser from 'glsl-parser'
import tokenizer from 'glsl-tokenizer/stream'

function minify(glsl) {
  return new Promise((resolve, reject) => {
    let result = ''
    const stream = new Readable()
    stream
      .pipe(tokenizer())
      .pipe(parser())
      .pipe(deparser(false))
      .on('data', buffer => result += buffer.toString())
      .on('end', () => resolve(result))
    stream.push(glsl)
    stream.push(null)
  })
}

export default function glslify(options = {}) {
  const filter = createFilter(
    options.include || '**/*.+(glsl|vert|frag)',
    options.exclude)

  return {
    name: 'glslify',

    async transform(code, id) {
      if (!filter(id)) {
        return null
      }
      let source = compile(code, {
        basedir: options.basedir || dirname(id),
        transform: options.transform,
      })
      if (options.minify) {
        const minified = await minify(source)
        if (!minified) {
          console.warn('Failed to minify:', id)
        } else {
          source = minified
        }
      }
      const transformedCode = `export default ${JSON.stringify(source)};`
      return {
        code: transformedCode,
        map: { mappings: '' },
      }
    },
  }
}
