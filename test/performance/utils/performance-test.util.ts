import {performance} from 'perf_hooks';
import * as fs from 'fs';
import * as path from 'path';
import {Measure, MeasurementResult, TestData, TestFunction} from './interface';

export class PerformanceTestUtil {
  static testFilesFolderName = 'test-files';

  static testFunctionsPerformance(
    testFunctions: TestFunction[],
    testImages: TestData[],
    repetition: number = 100,
  ): MeasurementResult[] {
    const data: MeasurementResult[] = [];
    testFunctions.forEach((func: any) => {
      const measures: Measure[] = [];
      let i = 0;
      testImages.forEach((img: {name: string; payload: Uint8Array}) => {
        measures.push({
          dataId: i + 1,
          avgTime: PerformanceTestUtil.getAverageCoDecPerformance(func.call, img.payload, repetition),
        });
        i++;
      });
      data.push({
        measures,
        testFunction: func,
      });
    });

    return data;
  }

  static loadCompressedSimpleImagesToUint8Arrays = (): TestData[] => {
    return PerformanceTestUtil.loadImagesToUint8Arrays('../test-files/compressed/simple');
  };

  static loadCompressedStreamImagesToUint8Arrays = (): TestData[] => {
    return PerformanceTestUtil.loadImagesToUint8Arrays('../test-files/compressed/stream');
  };

  static loadDecompressedImagesToUint8Arrays = (): TestData[] => {
    return PerformanceTestUtil.loadImagesToUint8Arrays('../test-files/decompressed');
  };

  private static getAverageCoDecPerformance = (func: any, data: any, repetition: number): number => {
    const timeMeasures = [];

    for (let i = 0; i < repetition; i++) {
      const start = performance.now();
      func(data);
      const end = performance.now();
      timeMeasures.push(end - start);
    }

    return PerformanceTestUtil.calculateAverageOfAnArray(timeMeasures);
  };

  private static calculateAverageOfAnArray = (arr: number[]): number =>
    arr.reduce((prev: number, curr: number) => prev + curr) / arr.length;

  private static loadImagesToUint8Arrays = (folderName: string): TestData[] => {
    const images: TestData[] = [];

    fs.readdirSync(path.join(__dirname, `${folderName}`)).forEach((fileName: string) =>
      images.push({
        name: fileName,
        payload: new Uint8Array(fs.readFileSync(path.resolve(__dirname, `${folderName}/${fileName}`))),
      }),
    );

    return images;
  };
}
