import {common, isInitialized, wasm} from '../zstd';

export class ZstdSimpleDec {
  protected static zstdFrameHeaderSizeMax = 18;
  private static isDecompressInit = false;

  private static zstdDecompress: (dst: number, dstCapacity: number, src: number, compressedSize: number) => number;
  private static zstdGetFrameContentSize: (src: number, srcSize: number) => number;

  public static decompress(payload: Uint8Array): Uint8Array {
    if (!isInitialized())
      throw new Error('Error: Zstd library not initialized. Please call the ZstdInit before usages');
    if (!ZstdSimpleDec.isDecompressInit) {
      ZstdSimpleDec.initDecompressFunctions();
      ZstdSimpleDec.isDecompressInit = true;
    }
    const len = payload.length;
    const ptr = ZstdSimpleDec.createArrayPointer(payload, len);
    const contentSize = ZstdSimpleDec.zstdGetFrameContentSize(ptr, len);
    const heap = wasm._malloc(contentSize);

    common.checkError(contentSize);

    try {
      const decompressedRes = ZstdSimpleDec.zstdDecompress(heap, contentSize, ptr, len);
      common.checkError(decompressedRes);

      return new Uint8Array(wasm.HEAPU8.subarray(heap, heap + decompressedRes - ZstdSimpleDec.zstdFrameHeaderSizeMax));
    } finally {
      wasm._free(ptr);
      wasm._free(heap);
    }
  }

  protected static initDecompressFunctions(): void {
    ZstdSimpleDec.zstdDecompress = wasm.cwrap('ZSTD_decompress', 'number', ['number', 'number', 'number', 'number']);
    ZstdSimpleDec.zstdGetFrameContentSize = wasm.cwrap('ZSTD_getFrameContentSize', 'number', ['number', 'number']);
  }

  protected static createArrayPointer(arr: Uint8Array, len: number): number {
    const ptr: number = wasm._malloc(len);
    wasm.HEAPU8.set(arr, ptr);
    return ptr;
  }
}
