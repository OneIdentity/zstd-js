import {ZstdSimple} from '../zstd-simple';
import {ZstdStream} from '../zstd-stream';

export interface ZstdCodec {
  ZstdSimple: typeof ZstdSimple;
  ZstdStream: typeof ZstdStream;
}
