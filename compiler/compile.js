const fs = require('fs');
const Compiler = require('./compiler');
const fullLibraryConfig = JSON.parse(fs.readFileSync('compiler/compile-config-full.json', {encoding: 'utf8'}));
const decodeLibraryConfig = JSON.parse(fs.readFileSync('compiler/compile-config-decompress.json', {encoding: 'utf8'}));

const fullCompiler = new Compiler(fullLibraryConfig);
const decodeCompiler = new Compiler(decodeLibraryConfig);

fullCompiler.compile('tmp/zstd.c', 'tmp/wasm-full.js', false, 'FULL - MODERN - WASM');

fullCompiler.compile('tmp/zstd.c', 'tmp/asm-full.js', true, 'FULL - LEGACY - ASM');

decodeCompiler.compile('tmp/zstddeclib.c', 'tmp/wasm-dec.js', false, 'DECODE - MODERN - WASM');

decodeCompiler.compile('tmp/zstddeclib.c', 'tmp/asm-dec.js', true, 'DECODE - LEGACY - ASM');
