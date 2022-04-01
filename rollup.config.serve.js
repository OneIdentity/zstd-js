import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import sourceMaps from 'rollup-plugin-sourcemaps';
import serve from 'rollup-plugin-serve';
import polyfill from 'rollup-plugin-polyfill';

export default {
  input: 'src/main.ts',
  output: [{file: 'example/main.umd.js', name: 'main', format: 'umd', sourcemap: true}],
  plugins: [
    polyfill([
      'core-js/features/object/assign',
      'core-js/features/typed-array/copy-within',
      'core-js/features/promise/any',
      'core-js/features/promise/finally',
      'core-js/features/promise/try',
      'core-js/features/promise/all-settled',
      'core-js/features/promise/index',
    ]),
    resolve(),
    commonjs(),
    typescript(),
    sourceMaps(),
    serve('example'),
  ],
};
