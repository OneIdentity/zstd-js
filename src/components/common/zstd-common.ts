export class ZstdCommon {
  private readonly zstdGetErrorName: (errorCode: number) => string;
  private readonly zstdIsError: (errorCode: number) => boolean;

  constructor(wasm: EmscriptenModule | any) {
    this.zstdGetErrorName = wasm.cwrap('ZSTD_getErrorName', 'string', ['number']);
    this.zstdIsError = wasm.cwrap('ZSTD_isError', 'number', ['number']);
  }

  public checkError(ret: number): void {
    if (ret < 0) throw new Error(`ZSTD_ERROR: ${this.zstdGetErrorName(ret)},  error code: ${ret}`);
  }
}
