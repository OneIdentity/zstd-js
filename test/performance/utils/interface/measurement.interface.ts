import {TestFunction} from './test-function.interface';
import {Measure} from './measure.interface';

export interface MeasurementResult {
  testFunction: TestFunction;
  measures: Measure[];
}
