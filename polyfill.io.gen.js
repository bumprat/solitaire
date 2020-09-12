const polyfillLibrary = require('polyfill-library')
const fs = require('fs')
const path = require('path')
polyfillLibrary.getPolyfillString({
  uaString: 'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1; Trident/4.0; WebMoney Advisor)',
  minify: false,
  features: {
    // Document: { flags: ['gated'] },
    // DocumentFragment: { flags: ['gated'] },
    // default: { flags: ['gated'] },
    'Array.from': { flags: ['gated'] },
    'Array.isArray': { flags: ['gated'] },
    'Array.prototype.entries': { flags: ['gated'] },
    'Array.prototype.filter': { flags: ['gated'] },
    'Array.prototype.find': { flags: ['gated'] },
    'Array.prototype.forEach': { flags: ['gated'] },
    'Array.prototype.includes': { flags: ['gated'] },
    'Array.prototype.indexOf': { flags: ['gated'] },
    'Array.prototype.keys': { flags: ['gated'] },
    'Array.prototype.map': { flags: ['gated'] },
    ArrayBuffer: { flags: ['gated'] },
    console: { flags: ['gated'] },
    DataView: { flags: ['gated'] },
    document: { flags: ['gated'] },
    Element: { flags: ['gated'] },
    'Function.prototype.bind': { flags: ['gated'] },
    Map: { flags: ['gated'] },
    'Object.create': { flags: ['gated'] },
    'Object.defineProperties': { flags: ['gated'] },
    'Object.defineProperty': { flags: ['gated'] },
    'Object.freeze': { flags: ['gated'] },
    'Object.getOwnPropertyDescriptor': { flags: ['gated'] },
    'Object.getOwnPropertyNames': { flags: ['gated'] },
    'Object.isExtensible': { flags: ['gated'] },
    'Object.keys': { flags: ['gated'] },
    Promise: { flags: ['gated'] },
    Set: { flags: ['gated'] },
    'String.prototype.includes': { flags: ['gated'] },
    'String.prototype.padStart': { flags: ['gated'] },
    Symbol: { flags: ['gated'] },
    'Symbol.iterator': { flags: ['gated'] },
    'Symbol.species': { flags: ['gated'] },
    'Symbol.toStringTag': { flags: ['gated'] },
    WeakMap: { flags: ['gated'] },
    WeakSet: { flags: ['gated'] }

  }
}).then(function (bundleString) {
  fs.writeFile(path.join('src', 'polyfill.js'), bundleString, 'utf-8', () => {
    console.log('Polyfill generated!')
  })
})
