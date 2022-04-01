import {ZstdSimpleDec} from '../zstd-simple';
import {ZstdStreamDec} from '../zstd-stream';

export interface ZstdDec {
  ZstdSimple: typeof ZstdSimpleDec;
  ZstdStream: typeof ZstdStreamDec;
}
