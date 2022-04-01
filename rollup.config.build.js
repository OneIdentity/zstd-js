import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import ts from '@wessberg/rollup-plugin-ts';
import sourceMaps from 'rollup-plugin-sourcemaps';
import polyfill from 'rollup-plugin-polyfill';
import {terser} from 'rollup-plugin-terser';

const legacyDecode = {outputDir: 'lib/asm/decompress/', inputDir: 'src/components/asm/decompress/'};
const legacyFull = {outputDir: 'lib/asm/', inputDir: 'src/components/asm/'};
const modernDecode = {outputDir: 'lib/wasm/decompress/', inputDir: 'src/components/wasm/decompress/'};
const modernFull = {outputDir: 'lib/wasm/', inputDir: 'src/components/wasm/'};
const defaultCodec = {outputDir: 'lib/', inputDir: 'src/components/default/'};
const defaultDec = {outputDir: 'lib/decompress/', inputDir: 'src/components/default/decompress/'};
const packageName = 'zstdCodec';

const legacyPolyfill = polyfill([
  'core-js/features/object/assign',
  'core-js/features/typed-array/copy-within',
  'core-js/features/promise/any',
  'core-js/features/promise/finally',
  'core-js/features/promise/try',
  'core-js/features/promise/all-settled',
  'core-js/features/promise/index',
]);

const umdFactory = (inputDir, outputDir, isLegacy) => {
  const plugins = [
    resolve(),
    commonjs({
      requireReturnsDefault: false,
      ignore: id => {
        return ['path', 'fs'].includes(id);
      },
    }),
    ts(),
    sourceMaps(),
    terser({ecma: 5}),
  ];
  if (isLegacy) plugins.push(legacyPolyfill);
  return {
    input: inputDir + 'index.ts',
    output: {
      name: packageName,
      file: outputDir + 'index.umd.js',
      format: 'umd',
      sourcemap: true,
    },
    plugins,
  };
};

const msFactory = (inputDir, outputDir, isLegacy) => {
  const plugins = [
    commonjs({
      ignore: id => ['path', 'fs'].includes(id),
    }),
    ts(),
    sourceMaps(),
    terser({ecma: 5}),
  ];
  if (isLegacy) plugins.push(legacyPolyfill);
  return {
    input: inputDir + 'index.ts',
    external: ['ms'],
    plugins,
    output: [
      {file: outputDir + 'index.cjs.js', format: 'cjs', sourcemap: true, exports: 'named'},
      {file: outputDir + 'index.js', format: 'es', sourcemap: true, exports: 'named'},
    ],
  };
};

export default [
  // DECOMPRESS - WASM
  umdFactory(modernDecode.inputDir, modernDecode.outputDir, false),
  msFactory(modernDecode.inputDir, modernDecode.outputDir, false),

  // FULL - WASM
  umdFactory(modernFull.inputDir, modernFull.outputDir, false),
  msFactory(modernFull.inputDir, modernFull.outputDir, false),

  // DECOMPRESS - ASM
  umdFactory(legacyDecode.inputDir, legacyDecode.outputDir, true),
  msFactory(legacyDecode.inputDir, legacyDecode.outputDir, true),

  // FULL - ASM
  umdFactory(legacyFull.inputDir, legacyFull.outputDir, true),
  msFactory(legacyFull.inputDir, legacyFull.outputDir, true),

  // DECOMPRESS - ASM - WASM
  umdFactory(defaultDec.inputDir, defaultDec.outputDir, true),
  msFactory(defaultDec.inputDir, defaultDec.outputDir, true),

  // FULL - ASM - WASM
  umdFactory(defaultCodec.inputDir, defaultCodec.outputDir, true),
  msFactory(defaultCodec.inputDir, defaultCodec.outputDir, true),
];
