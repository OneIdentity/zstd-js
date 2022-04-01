import {ZstdBuffer} from '../zstd-buffer';
import {ZstdStreamDec} from './zstd-stream-dec';
import {common, isInitialized, wasm} from '../zstd';

export class ZstdStream extends ZstdStreamDec {
  private static readonly zstdEContinue: number = 1;
  private static readonly zstdEEnd: number = 2;
  private static readonly zstdCCompressionLevel: number = 100;
  private static readonly zstdCChecksumFlag: number = 201;
  private static readonly zstdCNbWorkers: number = 400;
  private static inputSizeCo: number;
  private static outputSizeCo: number;
  private static isCompressInit = false;

  private static zstdCStreamInSize: () => number;
  private static zstdCStreamOutSize: () => number;
  private static zstdCreateCStream: () => number;
  private static zstdInitCStream: (cctx: number) => number;
  private static zstdCCtxSetParameter: (cctx: number, param: number, value: number | boolean) => number;
  private static zstdCompressStream2SimpleArgs: (
    cctx: number,
    dst: number,
    dstCapacity: number,
    dstPos: number,
    src: number,
    srcCapacity: number,
    srcPos: number,
    end: number,
  ) => number;
  private static zstdFreeCStream: (cctx: number) => number;

  public static compress(payload: Uint8Array, compressionLevel: number = 3, checksum: boolean = false): Uint8Array {
    if (!isInitialized())
      throw new Error('Error: Zstd library not initialized. Please call the ZstdInit before usages');
    if (!ZstdStream.isCompressInit) {
      ZstdStream.initCompressFunctions();
      ZstdStream.isCompressInit = true;
    }
    const inputPtr: number = wasm._malloc(ZstdStream.inputSizeCo);
    const outputPtr: number = wasm._malloc(ZstdStream.outputSizeCo);

    let cctx: number;
    try {
      cctx = ZstdStream.initCompressStream();
    } catch (e) {
      wasm._free(inputPtr);
      wasm._free(outputPtr);
      throw new Error(e);
    }

    ZstdStream.setCompressionLevel(cctx, compressionLevel, checksum);

    const inputPosPtr: number = wasm._malloc(ZstdStream.positionSize);
    const outputPosPtr: number = wasm._malloc(ZstdStream.positionSize);
    let result = new Uint8Array([]);
    const toRead: number = ZstdStream.inputSizeCo;
    let filePos = 0;
    try {
      while (filePos < payload.length) {
        const readBytes: number = ZstdStream.calculateReadBytes(filePos, toRead, payload);

        wasm.HEAPU8.set(payload.subarray(filePos, filePos + readBytes), inputPtr);
        filePos += readBytes;

        const lastChunk: boolean = readBytes < toRead;
        const mode: number = lastChunk ? ZstdStream.zstdEEnd : ZstdStream.zstdEContinue;

        const input = new ZstdBuffer(inputPosPtr, readBytes, inputPtr);

        let finished: boolean;
        do {
          const output = new ZstdBuffer(outputPosPtr, ZstdStream.outputSizeCo, outputPtr);
          wasm.setValue(output.positionPtr, 0, 'i32');
          wasm.setValue(input.positionPtr, 0, 'i32');

          const ret = ZstdStream.zstdCompressStream2SimpleArgs(
            cctx,
            output.dataPtr,
            output.size,
            output.positionPtr,
            input.dataPtr,
            input.size,
            input.positionPtr,
            mode,
          );
          common.checkError(ret);

          result = ZstdStream.getDataFromTransformation(output, result);

          finished = lastChunk ? ret === 0 : wasm.getValue(input.positionPtr, 'i32') === input.size;
        } while (!finished);

        wasm.setValue(input.positionPtr, 0, 'i32');
        if (lastChunk) break;
      }
    } finally {
      ZstdStream.zstdFreeCStream(cctx);
      wasm._free(inputPtr);
      wasm._free(outputPtr);
      wasm._free(inputPosPtr);
      wasm._free(outputPosPtr);
    }

    return result;
  }

  private static setCompressionLevel(cctx: number, compressionLevel: number, checksum: boolean): void {
    common.checkError(ZstdStream.zstdCCtxSetParameter(cctx, ZstdStream.zstdCCompressionLevel, compressionLevel));
    common.checkError(ZstdStream.zstdCCtxSetParameter(cctx, ZstdStream.zstdCChecksumFlag, checksum));
    ZstdStream.zstdCCtxSetParameter(cctx, ZstdStream.zstdCNbWorkers, 4);
  }

  private static initCompressStream(): number {
    const cctx: number = ZstdStream.zstdCreateCStream();
    ZstdStream.zstdInitCStream(cctx);

    if (!cctx) throw new Error('ZSTD Stream compress initialization failed.');
    return cctx;
  }

  private static initCompressFunctions(): void {
    ZstdStream.zstdCStreamInSize = wasm.cwrap('ZSTD_CStreamInSize', 'number', []);
    ZstdStream.zstdCStreamOutSize = wasm.cwrap('ZSTD_CStreamOutSize', 'number', []);
    ZstdStream.zstdCreateCStream = wasm.cwrap('ZSTD_createCStream', 'number', []);
    ZstdStream.zstdInitCStream = wasm.cwrap('ZSTD_initCStream', 'number', ['number']);
    ZstdStream.zstdCCtxSetParameter = wasm.cwrap('ZSTD_CCtx_setParameter', 'number', ['number', 'number', 'number']);
    ZstdStream.zstdCompressStream2SimpleArgs = wasm.cwrap('ZSTD_compressStream2_simpleArgs', 'number', [
      'number',
      'number',
      'number',
      'number',
      'number',
      'number',
      'number',
    ]);
    ZstdStream.zstdFreeCStream = wasm.cwrap('ZSTD_freeCStream', 'number', ['number']);
    ZstdStream.inputSizeCo = ZstdStream.zstdCStreamInSize();
    ZstdStream.outputSizeCo = ZstdStream.zstdCStreamOutSize();
  }
}
