import * as asmFactory from 'tmp/asm-full';
import {ZstdSimple, ZstdStream, setupZstd, ZstdCodec} from '../common';

export {ZstdSimple, ZstdStream, ZstdCodec};

export async function ZstdInit(): Promise<ZstdCodec> {
  return setupZstd(asmFactory, {ZstdSimple, ZstdStream}) as Promise<ZstdCodec>;
}
