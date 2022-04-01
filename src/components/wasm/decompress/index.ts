import * as wasmFactory from 'tmp/wasm-dec';
import {ZstdSimpleDec as ZstdSimple, ZstdStreamDec as ZstdStream, setupZstd, ZstdDec} from '../../common';

export {ZstdSimple, ZstdStream, ZstdDec};

export async function ZstdInit(): Promise<ZstdDec> {
  return setupZstd(wasmFactory, {ZstdSimple, ZstdStream}) as Promise<ZstdDec>;
}
