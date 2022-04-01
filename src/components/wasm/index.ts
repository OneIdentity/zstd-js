import * as wasmFactory from 'tmp/wasm-full';
import {setupZstd, ZstdCodec, ZstdSimple, ZstdStream} from '../common';

export {ZstdSimple, ZstdStream, ZstdCodec};

export async function ZstdInit(): Promise<ZstdCodec> {
  return setupZstd(wasmFactory, {ZstdSimple, ZstdStream}) as Promise<ZstdCodec>;
}
