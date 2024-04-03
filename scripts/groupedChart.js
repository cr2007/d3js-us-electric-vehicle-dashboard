import { mouseoverHandler, mouseoutHandler } from './helper.js';

export default class GroupedBarChart {
  constructor(svgSelector) {
    this.svgSelector = svgSelector;
  }

  renderGroupedBarChart(data) {
    const keys = data.reduce((acc, d) => {
      d.groups.forEach((g) => {
        if (acc.indexOf(g.grp) === -1) {
          acc.push(g.grp);
        }
      });
      return acc;
    }, []);

    // Dimensions and margins
    const margin = { top: 10, right: 20, bottom: 40, left: 80 };
    const width = 700 - margin.left - margin.right;
    const height = 550 - margin.top - margin.bottom;

    // Scales
    const xScale = d3
      .scaleLinear()
      .rangeRound([20, width])
      .domain([0, d3.max(data, (d) => d3.max(d.groups.map((g) => g.count)))])
      .nice();

    const yScale = d3
      .scaleBand()
      .rangeRound([50, height])
      .paddingInner(0.1)
      .domain(data.map((d) => d.yr));

    const colorScale = d3
      .scaleOrdinal()
      .domain(keys)
      .range(['#f5a067', '#5E3FBE']);

    d3.select(this.svgSelector).selectAll('*').remove();

    // Adding the SVG
    const svg = d3
      .select(this.svgSelector)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X Axis
    const xAxis = d3.axisBottom(xScale);
    const xAxisGroup = svg
      .append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis);

    xAxisGroup.select('.domain').attr('display', 'none');

    // Y Axis
    const yAxis = d3.axisLeft(yScale);
    const yAxisGroup = svg.append('g').attr('class', 'grid').call(yAxis);
    yAxisGroup.select('.domain').attr('display', 'none');

    // Grouping the bars together
    svg
      .selectAll('.bar-group')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'bar-group')
      .attr('transform', (d) => `translate(0,${yScale(d.yr)})`);

    const barWidth = yScale.bandwidth() / keys.length;

    // Applying hover to each bar
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

    data.map((d) => {
      const content = (g) => `${g.grp}<br/> ${g.count}`;

      const bars = svg
        .selectAll(`.bar-group-${d.yr}`)
        .data(d.groups)
        .enter()
        .append('rect')
        .attr('class', `bar-group-${d.yr}`)
        .attr('x', (g) => xScale(0))
        .attr('y', height)
        .attr('height', 0)
        .attr('width', (g) => xScale(g.count) - xScale(0))
        .attr('fill', (g) => colorScale(g.grp));

      bars
        .on('mouseover', mouseoverHandler(tooltip, content, 0.85))
        .on('mouseout', mouseoutHandler(tooltip));

      bars
        .transition()
        .duration(800)
        .attr('y', (g) => yScale(d.yr) + keys.indexOf(g.grp) * barWidth)
        .attr('height', barWidth);
    });
  }
}
