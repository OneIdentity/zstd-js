import * as asmFactory from 'tmp/asm-dec';
import {ZstdSimpleDec as ZstdSimple, ZstdStreamDec as ZstdStream, setupZstd, ZstdDec} from '../../common';

export {ZstdSimple, ZstdStream, ZstdDec};

export async function ZstdInit(): Promise<ZstdDec> {
  return setupZstd(asmFactory, {ZstdSimple, ZstdStream}) as Promise<ZstdDec>;
}
