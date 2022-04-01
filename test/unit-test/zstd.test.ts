import {ZstdCodec, ZstdInit, ZstdSimple, ZstdStream} from '../../lib/wasm';
import * as assert from 'assert';
import * as fs from 'fs';

const originalSimpleInputBuf: Buffer = fs.readFileSync(`${__dirname}/test-files/simple/original`);
const originalSimpleInputArr: Uint8Array = new Uint8Array(originalSimpleInputBuf);

const compressedSimpleInputBuf: Buffer = fs.readFileSync(`${__dirname}/test-files/simple/compressed`);
const compressedSimpleInputArr: Uint8Array = new Uint8Array(compressedSimpleInputBuf);

const originalStreamInputBuf: Buffer = fs.readFileSync(`${__dirname}/test-files/stream/original`);
const originalStreamInputArr: Uint8Array = new Uint8Array(originalStreamInputBuf);

const compressedStreamInputBuf: Buffer = fs.readFileSync(`${__dirname}/test-files/stream/compressed`);
const compressedStreamInputArr: Uint8Array = new Uint8Array(compressedStreamInputBuf);

(async () => {
  const codec = await ZstdInit();
  await runTest(codec);
  await runTest({ZstdSimple, ZstdStream});

  await ZstdInit().then((codec: ZstdCodec) => {
    runTest(codec);
  });
})();

function runTest(codec: ZstdCodec) {
  const {ZstdSimple, ZstdStream} = codec;
  // Simple zstd test
  let result: Uint8Array;

  result = ZstdSimple.compress(new Uint8Array(originalSimpleInputArr), 3);
  console.log('[Simple] Compress completed successfully.');

  result = ZstdSimple.decompress(compressedSimpleInputArr);
  assert.deepEqual(result, originalSimpleInputArr);
  console.log('[Simple] Decompress completed successfully.');

  // Stream zstd test
  result = ZstdStream.compress(new Uint8Array(originalStreamInputArr), 3);
  console.log('[Stream] Compress completed successfully.');

  result = ZstdStream.decompress(compressedStreamInputArr);
  assert.deepEqual(result, originalStreamInputArr);
  console.log('[Stream] Decompress completed successfully.');
}
