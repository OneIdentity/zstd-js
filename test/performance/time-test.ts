import {ZstdCodec, ZstdInit} from '../../lib/wasm';
import {PerformanceTestUtil} from './utils/performance-test.util';
import {PerformancePlotUtil} from './utils/performance-plot.util';

ZstdInit().then(({ZstdSimple, ZstdStream}: ZstdCodec) => {
  const decompressedImages = PerformanceTestUtil.loadDecompressedImagesToUint8Arrays();
  const simpleCompressedImages = PerformanceTestUtil.loadCompressedSimpleImagesToUint8Arrays();
  const streamCompressedImages = PerformanceTestUtil.loadCompressedStreamImagesToUint8Arrays();

  console.log('Stream Decompress Started');
  const streamDeMeasures = PerformanceTestUtil.testFunctionsPerformance(
    [{name: 'stream-decompress', call: ZstdStream.decompress, color: 'rgba(0,59,70,0.8)'}],
    streamCompressedImages,
    1000,
  );
  console.log('Stream Decompress Finished');

  console.log('Simple Decompress Started');
  const simpleDeMeasures = PerformanceTestUtil.testFunctionsPerformance(
    [{name: 'simple-decompress', call: ZstdSimple.decompress, color: 'rgba(7,87,91,0.8)'}],
    simpleCompressedImages,
    1000,
  );
  console.log('Simple Decompress Finished');

  console.log('Simple and Stream Compress Started');
  const compressMeasures = PerformanceTestUtil.testFunctionsPerformance(
    [
      {name: 'simple-compress', call: ZstdSimple.compress, color: 'rgba(102,165,173,1)'},
      {name: 'stream-compress', call: ZstdStream.compress, color: 'rgba(196,223,230,1)'},
    ],
    decompressedImages,
    1000,
  );
  console.log('Simple and Stream Compress Finished');

  const measurementResults = streamDeMeasures.concat(simpleDeMeasures, compressMeasures);

  PerformancePlotUtil.generateChartFromData(measurementResults);
});
