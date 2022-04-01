import * as d3 from 'd3';
import * as path from 'path';
import * as fs from 'fs';
import {Measure, MeasurementResult} from './interface';

export class PerformancePlotUtil {
  private static margin = {top: 10, right: 150, bottom: 50, left: 60};
  private static width = 1100 - PerformancePlotUtil.margin.left - PerformancePlotUtil.margin.right;
  private static height = 1000 - PerformancePlotUtil.margin.top - PerformancePlotUtil.margin.bottom;

  static generateChartFromData(measurementResults: MeasurementResult[] | any) {
    const D3Node = require('d3-node');
    const d3n = new D3Node();
    const svg: SVGElement = PerformancePlotUtil.createSVGContainer(d3n);
    const maxX: number = measurementResults[0].measures.length;
    const maxY: number = d3.max(measurementResults, (data: MeasurementResult) =>
      d3.max(data.measures, (d: Measure) => d.avgTime),
    ) as any;
    const x: (x: number) => number = PerformancePlotUtil.createXAxis(svg, maxX);
    const y: (y: number) => number = PerformancePlotUtil.createYAxis(svg, maxY);

    PerformancePlotUtil.addXAxisLabel(svg);
    measurementResults.forEach((measurementResult: MeasurementResult) =>
      PerformancePlotUtil.addLine(svg, x, y, measurementResult),
    );

    fs.writeFileSync(path.join(__dirname, `../../../readme/plots/zstd.perf.test.svg`), d3n.svgString());
    fs.writeFileSync(
      path.join(__dirname, `../../../readme/data/zstd.data.json`),
      JSON.stringify(measurementResults, null, 2),
    );
  }

  private static createSVGContainer(d3n: any): SVGElement {
    return d3n
      .createSVG(PerformancePlotUtil.width, PerformancePlotUtil.height)
      .attr('style', 'background-color: white;')
      .append('g');
  }

  private static createXAxis(svg: SVGElement, length: number): (x: number) => number {
    const x = d3
      .scaleLinear()
      .domain([1, length])
      .range([PerformancePlotUtil.margin.left, PerformancePlotUtil.width - PerformancePlotUtil.margin.right]);

    const xAxis = (g: any) =>
      g
        .attr('transform', `translate(0,${PerformancePlotUtil.height - PerformancePlotUtil.margin.bottom})`)
        .call(d3.axisBottom(x).ticks(length).tickSizeOuter(0));

    (svg.append('g') as any).call(xAxis);
    return x;
  }

  private static createYAxis(svg: SVGElement, max: number): (y: number) => number {
    const y = d3
      .scaleLinear()
      .domain([0, max])
      .nice()
      .range([PerformancePlotUtil.height - PerformancePlotUtil.margin.bottom, PerformancePlotUtil.margin.top]);

    const yAxis = (g: any) =>
      g
        .attr('transform', `translate(${PerformancePlotUtil.margin.left},0)`)
        .call(
          d3
            .axisLeft(y)
            .ticks(PerformancePlotUtil.width / 10)
            .tickSizeOuter(0),
        )
        .call((g: any) => g.select('.domain').remove())
        .call((g: any) =>
          g.select('.tick:last-of-type text').clone().attr('x', 3).attr('text-anchor', 'start').text('ms'),
        );

    (svg.append('g') as any).call(yAxis);
    return y;
  }

  private static addXAxisLabel(svg: SVGElement): void {
    (svg.append('text') as any)
      .attr('x', PerformancePlotUtil.margin.left + PerformancePlotUtil.width / 3)
      .attr('y', PerformancePlotUtil.height - PerformancePlotUtil.margin.bottom / 3)
      .text('Data ID');
  }

  private static addLine(
    svg: SVGElement,
    x: (x: number) => number,
    y: (y: number) => number,
    data: MeasurementResult,
  ): void {
    const line = d3
      .line()
      .x((d: Measure | any) => x(d.dataId))
      .y((d: Measure | any) => y(d.avgTime));

    (svg.append('path') as any)
      .attr('fill', 'none')
      .attr('stroke', data.testFunction.color)
      .attr('stroke-width', 2)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('d', line(data.measures as any));

    (svg.append('text') as any)
      .attr(
        'transform',
        'translate(' +
          (PerformancePlotUtil.width - PerformancePlotUtil.margin.right + 10) +
          ',' +
          y(data.measures[data.measures.length - 1].avgTime) +
          ')',
      )
      .attr('dy', '.35em')
      .attr('text-anchor', 'start')
      .style('fill', data.testFunction.color)
      .text(data.testFunction.name);
  }
}
