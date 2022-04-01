import * as asmFactory from 'tmp/asm-full';
import * as wasmFactory from 'tmp/wasm-full';
import {setupZstd, ZstdCodec, ZstdSimple, ZstdStream} from '../common';

const isWasmSupported: boolean = typeof WebAssembly === 'object' && typeof WebAssembly.instantiate === 'function';
const wasmOrAsmFactory: EmscriptenModule | any = isWasmSupported ? wasmFactory : asmFactory;

export {ZstdStream, ZstdSimple, ZstdCodec};

export async function ZstdInit(): Promise<ZstdCodec> {
  return setupZstd(wasmOrAsmFactory, {ZstdSimple, ZstdStream}) as Promise<ZstdCodec>;
}
