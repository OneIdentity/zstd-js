import {ZstdBuffer} from '../zstd-buffer';
import {common, isInitialized, wasm} from '../zstd';

export class ZstdStreamDec {
  protected static readonly positionSize: number = 4;
  private static isDecompressInit = false;
  private static inputSize: number;
  private static outputSize: number;

  private static zstdDStreamInSize: () => number;
  private static zstdDStreamOutSize: () => number;
  private static zstdCreateDStream: () => number;
  private static zstdInitDStream: (dctx: number) => number;
  private static zstdFreeDStream: (dctx: number) => number;
  private static zstdDecompressStreamSimpleArgs: (
    dctx: number,
    dst: number,
    dstCapacity: number,
    dstPos: number,
    src: number,
    srcCapacity: number,
    srcPos: number,
  ) => number;

  public static decompress(payload: Uint8Array): Uint8Array {
    if (!isInitialized())
      throw new Error('Error: Zstd library not initialized. Please call the ZstdInit before usages');
    if (!ZstdStreamDec.isDecompressInit) {
      ZstdStreamDec.initDecompressFunctions();
      ZstdStreamDec.isDecompressInit = true;
    }
    const inputPtr: number = wasm._malloc(ZstdStreamDec.inputSize * payload.BYTES_PER_ELEMENT);
    const outputPtr: number = wasm._malloc(ZstdStreamDec.outputSize * payload.BYTES_PER_ELEMENT);

    const dctx: number | null = ZstdStreamDec.zstdCreateDStream();
    if (!dctx) {
      wasm._free(inputPtr);
      wasm._free(outputPtr);
      throw new Error('ZSTD Stream decompress initialization failed.');
    }

    let toRead: number;
    toRead = ZstdStreamDec.zstdInitDStream(dctx);

    let filePos = 0;

    const inputPosPtr: number = wasm._malloc(ZstdStreamDec.positionSize);
    const outputPosPtr: number = wasm._malloc(ZstdStreamDec.positionSize);
    let result = new Uint8Array([]);
    try {
      while (filePos < payload.length) {
        const readBytes: number = ZstdStreamDec.calculateReadBytes(filePos, toRead, payload);

        wasm.HEAPU8.set(payload.subarray(filePos, filePos + readBytes), inputPtr);
        filePos += readBytes;
        const lastChunk: boolean = readBytes < toRead;

        const input = new ZstdBuffer(inputPosPtr, readBytes, inputPtr);
        while (wasm.getValue(input.positionPtr, 'i32') < input.size) {
          const output = new ZstdBuffer(outputPosPtr, ZstdStreamDec.outputSize, outputPtr);
          wasm.setValue(output.positionPtr, 0, 'i32');
          wasm.setValue(input.positionPtr, 0, 'i32');

          toRead = ZstdStreamDec.zstdDecompressStreamSimpleArgs(
            dctx,
            output.dataPtr,
            output.size,
            output.positionPtr,
            input.dataPtr,
            input.size,
            input.positionPtr,
          );
          common.checkError(toRead);

          result = ZstdStreamDec.getDataFromTransformation(output, result);
        }

        wasm.setValue(input.positionPtr, 0, 'i32');
        if (lastChunk) break;
      }
    } finally {
      ZstdStreamDec.zstdFreeDStream(dctx);
      wasm._free(inputPtr);
      wasm._free(outputPtr);
      wasm._free(inputPosPtr);
      wasm._free(outputPosPtr);
    }

    return result;
  }

  protected static calculateReadBytes = (filePos: number, toRead: number, payload: Uint8Array): number =>
    Math.min(filePos + toRead, payload.length) - filePos;

  protected static getDataFromTransformation(output: ZstdBuffer, result: Uint8Array): Uint8Array {
    const newResults = wasm.HEAPU8.subarray(output.dataPtr, output.dataPtr + wasm.getValue(output.positionPtr, 'i32'));
    const newResultsArray = new Uint8Array(result.length + newResults.length);

    newResultsArray.set(result);
    newResultsArray.set(newResults, result.length);

    return newResultsArray;
  }

  private static initDecompressFunctions(): void {
    ZstdStreamDec.zstdDStreamInSize = wasm.cwrap('ZSTD_DStreamInSize', 'number', []);
    ZstdStreamDec.zstdDStreamOutSize = wasm.cwrap('ZSTD_DStreamOutSize', 'number', []);
    ZstdStreamDec.zstdCreateDStream = wasm.cwrap('ZSTD_createDStream', 'number', []);
    ZstdStreamDec.zstdInitDStream = wasm.cwrap('ZSTD_initDStream', 'number', ['number']);
    ZstdStreamDec.zstdDecompressStreamSimpleArgs = wasm.cwrap('ZSTD_decompressStream_simpleArgs', 'number', [
      'number',
      'number',
      'number',
      'number',
      'number',
      'number',
    ]);
    ZstdStreamDec.zstdFreeDStream = wasm.cwrap('ZSTD_freeDStream', 'number', ['number']);
    ZstdStreamDec.inputSize = ZstdStreamDec.zstdDStreamInSize();
    ZstdStreamDec.outputSize = ZstdStreamDec.zstdDStreamOutSize();
  }
}
