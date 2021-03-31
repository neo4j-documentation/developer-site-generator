'use strict'

const Opal = require('opal-runtime').Opal
if ('encoding' in String.prototype && String(String.prototype.encoding) !== 'UTF-8') {
  String.prototype.encoding = Opal.const_get_local(Opal.const_get_qualified('::', 'Encoding'), 'UTF_8') // eslint-disable-line no-extend-native
}

const asciidoctor = require('asciidoctor.js')()
const $Neo4j = {}
const JupyterConverter = require('asciidoctor-jupyter')
const icypherInstructionExtension = require('./icypher-instruction-extension')

/**
 * Asciidoctor.js 1.5.x converter wrapper
 */
const JupyterConverterDelegator = (() => {
  const jupyterConverter = new JupyterConverter()
  const scope = Opal.klass(
    Opal.module(null, 'Neo4j', $Neo4j),
    Opal.module(null, 'Asciidoctor').Converter.Base,
    'JupyterConverter',
    function () {
    }
  )
  Opal.defn(scope, '$initialize', function initialize(backend, opts) {
    Opal.send(this, Opal.find_super_dispatcher(this, 'initialize', initialize), [backend, opts])
  })
  Opal.defn(scope, '$convert', function convert(node, transform, opts) {
    return jupyterConverter.convert(node, transform)
  })
  return scope
})()

const jupyterConverter = JupyterConverterDelegator.$new('jupyter', undefined)
const registry = asciidoctor.Extensions.create()
icypherInstructionExtension.register(registry)

function convert(input) {
  return asciidoctor.convert(input, Opal.hash({ backend: 'jupyter', converter: jupyterConverter, extension_registry: registry }))
}

module.exports = {
  convert
}
