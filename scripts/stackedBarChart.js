// Import helper functions from helper.js
import { mouseoverHandler, mouseoutHandler, axisLabel } from './helper.js';

/**
 * Class representing a StackedBarChart.
 */
export default class StackedBarChart {
  /**
   * Create a StackedBarChart.
   * @param {string} svgSelector - The selector for the SVG element.
   */
  constructor(svgSelector) {
    // Store the SVG selector for later use
    this.svgSelector = svgSelector;
  }

  /**
   * Render the stacked bar chart.
   * @param {Array} data - The data to render.
   */
  renderStackedBarChart(data) {
    // Log the data for debugging
    console.log('Stacked bar chart data:', data);

    // Define the keys for the data
    const keys = [
      'Battery Electric Vehicle (BEV)',
      'Plug-in Hybrid Electric Vehicle (PHEV)',
    ];

    // Get the width of the container
    const container = d3.select('#stacked-bar-chart-container');
    const containerWidth = container.node().getBoundingClientRect().width;

    // Define the margins, width, and height
    const margin = { top: 20, right: 20, bottom: 40, left: 80 };
    const width = containerWidth - 5;
    const height = 580 - margin.top - margin.bottom;

    // Define the scales
    const xScale = d3
      .scaleBand()
      .rangeRound([0, width])
      .padding(0.1)
      .domain(data.map((d) => d.year));

    const yScale = d3
      .scaleLinear()
      .rangeRound([height, 0])
      .domain([0, d3.max(data, (d) => d[keys[0]] + d[keys[1]])]);

    // Define the y-axis
    const yAxis = d3.axisLeft(yScale);

    // Define the color scale
    const colorScale = d3
      .scaleOrdinal()
      .domain(keys)
      .range(['#f5a067', '#5E3FBE']);

    // Remove all elements from the SVG
    d3.select(this.svgSelector).selectAll('*').remove();

    // Create the SVG element
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

    // Add the x-axis
    const xAxisGroup = svg
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    // Remove the domain line of the x-axis
    xAxisGroup.select('.domain').attr('display', 'none');

    // Add the x-axis label
    axisLabel({
      axisGroup: xAxisGroup,
      orientation: 'x',
      width,
      y: 40,
      text: 'Years',
    });

    // Add the y-axis
    const yAxisGroup = svg.append('g').call(yAxis);

    // Remove the domain line of the y-axis
    yAxisGroup.select('.domain').attr('display', 'none');

    // Add the y-axis label
    axisLabel({
      axisGroup: yAxisGroup,
      orientation: 'y',
      height: height,
      y: -70,
      text: 'Number of Electric Vehicle Types Sold',
    });

    // Create the tooltip
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

    // Define the content of the tooltip
    const content = (d) =>
      `${d[0] ? keys[1] : keys[0]}<br/>${d.data.year}: ${d[1] - d[0]}`;

    // Add mouseover and mouseout events to the bars
    svg
      .selectAll('rect')
      .on('mouseover', mouseoverHandler(tooltip, content, 0.85))
      .on('mouseout', mouseoutHandler(tooltip));
  }
}