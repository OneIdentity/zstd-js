import * as asmFactory from 'tmp/asm-dec';
import * as wasmFactory from 'tmp/wasm-dec';
import {setupZstd, ZstdDec, ZstdSimpleDec as ZstdSimple, ZstdStreamDec as ZstdStream} from '../../common';

const isWasmSupported: boolean = typeof WebAssembly === 'object' && typeof WebAssembly.instantiate === 'function';
const wasmOrAsmFactory: EmscriptenModule | any = isWasmSupported ? wasmFactory : asmFactory;

export {ZstdSimple, ZstdStream, ZstdDec};

export async function ZstdInit(): Promise<ZstdDec> {
  return setupZstd(wasmOrAsmFactory, {ZstdSimple, ZstdStream}) as Promise<ZstdDec>;
}
