import {ZstdCommon} from './zstd-common';
import {ZstdCodec, ZstdDec} from './codec';

let wasm: EmscriptenModule | any = null;
let common: ZstdCommon | any = null;

export function setupZstd(
  emscriptenFactory: EmscriptenModule | any,
  codec: ZstdCodec | ZstdDec | any,
): Promise<ZstdCodec | ZstdDec> {
  return new Promise<{ZstdStream: any; ZstdSimple: any}>((resolve, reject) => {
    if (wasm) resolve({ZstdSimple: codec.ZstdSimple, ZstdStream: codec.ZstdStream});
    const init: EmscriptenModuleFactory =
      typeof emscriptenFactory === 'function' ? emscriptenFactory : emscriptenFactory.default;
    init()
      .then((cookedWasm: EmscriptenModule | any) => {
        wasm = cookedWasm;
        common = new ZstdCommon(wasm);
        resolve({ZstdSimple: codec.ZstdSimple, ZstdStream: codec.ZstdStream});
      })
      .catch((err: Error) => {
        reject(err);
      });
  });
}

// Returns true if initialized and false if it isn't
export const isInitialized = (): boolean => !!wasm && !!common;

export {wasm, common};
