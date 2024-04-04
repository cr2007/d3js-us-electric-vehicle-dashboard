import { mouseoverHandler, mouseoutHandler, axisLabel } from './helper.js';

export default class StackedBarChart {
  constructor(svgSelector) {
    this.svgSelector = svgSelector;
  }

  renderStackedBarChart(data) {
    console.log('Stacked bar chart data:', data);

    // Correct keys based on your data structure
    const keys = [
      'Battery Electric Vehicle (BEV)',
      'Plug-in Hybrid Electric Vehicle (PHEV)',
    ];

    const container = d3.select('#stacked-bar-chart-container');
    const containerWidth = container.node().getBoundingClientRect().width;

    // Dimensions and margins
    const margin = { top: 20, right: 20, bottom: 40, left: 80 };
    const width = containerWidth - 5;
    const height = 580 - margin.top - margin.bottom;

    // Scales
    const xScale = d3
      .scaleBand()
      .rangeRound([0, width])
      .padding(0.1)
      .domain(data.map((d) => d.year));

    const yScale = d3
      .scaleLinear()
      .rangeRound([height, 0])
      .domain([0, d3.max(data, (d) => d[keys[0]] + d[keys[1]])]);

    const yAxis = d3.axisLeft(yScale);

    const colorScale = d3
      .scaleOrdinal()
      .domain(keys)
      .range(['#f5a067', '#5E3FBE']);

    d3.select(this.svgSelector).selectAll('*').remove();

    const svg = d3
      .select(this.svgSelector)
      .attr('width', '100%')
      .attr('height', height + margin.top + margin.bottom)
      .attr(
        'viewBox',
        `0 0 ${containerWidth} ${height + margin.top + margin.bottom}`
      )
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .style('display', 'block')
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Stack the data
    const stackedData = d3.stack().keys(keys)(data);

    // Create the bars
    svg
      .append('g')
      .selectAll('g')
      .data(stackedData)
      .enter()
      .append('g')
      .attr('fill', (d) => colorScale(d.key))
      .selectAll('rect')
      .data((d) => d)
      .enter()
      .append('rect')
      .attr('x', (d) => xScale(d.data.year))
      .attr('y', (d) => yScale(0))
      .attr('height', 0)
      .attr('width', xScale.bandwidth())
      .transition()
      .duration(800)
      .attr('y', (d) => yScale(d[1]))
      .attr('height', (d) => yScale(d[0]) - yScale(d[1]));

    // Applying the x and y axis
    const xAxisGroup = svg
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    xAxisGroup.select('.domain').attr('display', 'none');

    // Adding the X label
    axisLabel({
      axisGroup: xAxisGroup,
      orientation: 'x',
      width,
      y: 40,
      text: 'Years',
    });

    const yAxisGroup = svg.append('g').call(yAxis);
    yAxisGroup.select('.domain').attr('display', 'none');

    // Adding the Y label
    axisLabel({
      axisGroup: yAxisGroup,
      orientation: 'y',
      height: height,
      y: -70,
      text: 'Number of Electric Vehicle Types Sold',
    });

    // Add a tooltip
    const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('padding', '5px')
      .style('background-color', '#ffffff')
      .style('border', '1px solid #cccccc')
      .style('border-radius', '5px')
      .style('box-shadow', '0 2px 2px rgba(0, 0, 0, 0.1)')
      .style('pointer-events', 'none');

    const content = (d) =>
      `${d[0] ? keys[1] : keys[0]}<br/>${d.data.year}: ${d[1] - d[0]}`;

    svg
      .selectAll('rect')
      .on('mouseover', mouseoverHandler(tooltip, content, 0.85))
      .on('mouseout', mouseoutHandler(tooltip));
  }
}
