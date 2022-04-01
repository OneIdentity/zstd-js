import {ZstdSimpleDec} from './zstd-simple-dec';
import {common, isInitialized, wasm} from '../zstd';

export class ZstdSimple extends ZstdSimpleDec {
  private static isCompressInit = false;

  private static zstdCompress: (
    dst: number,
    dstCapacity: number,
    src: number,
    srcSize: number,
    compressionLevel: number,
  ) => number;
  private static zstdCompressBound: (srcSize: number) => number;

  public static compress(payload: Uint8Array, compressionLevel: number = 3): Uint8Array {
    if (!isInitialized())
      throw new Error('Error: Zstd library not initialized. Please call the ZstdInit before usages');
    if (!ZstdSimple.isCompressInit) {
      ZstdSimple.initCompressFunctions();
      ZstdSimple.isCompressInit = true;
    }
    if (payload.length <= 100) throw new Error('Length of the payload is too small. (Min length: >100)');
    const len = payload.byteLength + ZstdSimple.zstdFrameHeaderSizeMax;
    const srcPtr = ZstdSimple.createArrayPointer(payload, len);
    const dstPtr = wasm._malloc(ZstdSimple.zstdCompressBound(payload.length));

    try {
      const compressedRes = ZstdSimple.zstdCompress(
        dstPtr,
        ZstdSimple.zstdCompressBound(payload.length),
        srcPtr,
        len,
        compressionLevel,
      );
      common.checkError(compressedRes);

      return new Uint8Array(wasm.HEAPU8.subarray(dstPtr, dstPtr + compressedRes));
    } finally {
      wasm._free(srcPtr);
      wasm._free(dstPtr);
    }
  }

  private static initCompressFunctions(): void {
    ZstdSimple.zstdCompress = wasm.cwrap('ZSTD_compress', 'number', ['number', 'number', 'number', 'number', 'number']);
    ZstdSimple.zstdCompressBound = wasm.cwrap('ZSTD_compressBound', 'number', ['number']);
  }
}
