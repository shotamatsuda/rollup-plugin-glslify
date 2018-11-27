// MIT License
// Copyright (C) 2016-Present Shota Matsuda

/* eslint-env mocha */
/* eslint-disable no-unused-expressions */

const buble = require('rollup-plugin-buble')
const chai = require('chai')
const glslify = require('..')
const rollup = require('rollup')

const expect = chai.expect

process.chdir(__dirname)

function execute (bundle) {
  return bundle.generate({
    format: 'cjs'
  }).then(generated => {
    // eslint-disable-next-line no-new-func
    const fn = new Function('module', 'exports', 'require', generated.code)
    const module = { exports: {} }
    fn(module, module.exports, require)
    return module
  })
}

describe('rollup-plugin-glslify', () => {
  it('imports .glsl, .frag and .vert files as strings', () => {
    return rollup.rollup({
      input: 'sample/index.js',
      plugins: [
        glslify(),
        buble()
      ]
    }).then(execute).then(module => {
      expect(module.exports.module).not.undefined
      expect(module.exports.module.value).null
      expect(module.exports.fragmentShader).a('string')
      expect(module.exports.vertexShader).a('string')
      expect(module.exports.transform).a('string')
    })
  })
})
