export default class ScatterPlot {
  constructor(svgSelector) {
    this.svgSelector = svgSelector;
    const margin = { top: 20, right: 20, bottom: 50, left: 100 };
    const width = 750;
    const height = 470;

    this.svg = d3
      .select(svgSelector)
      .attr('width', width)
      .attr('height', height + margin.top + margin.bottom);

    // Plot area
    this.plot = this.svg
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Scales and axes setup
    this.scaleX = d3.scaleLinear().range([20, 550]);
    this.scaleY = d3.scaleLinear().range([height, 0]);

    this.xAxis = this.plot
      .append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(this.scaleX));

    this.xAxis.select('.domain').attr('stroke', 'none');

    this.yAxis = this.plot.append('g').call(d3.axisLeft(this.scaleY));
    this.yAxis.select('.domain').attr('stroke', 'none');

    // Adjust X-axis label
    this.labelX = this.svg
      .append('text')
      .attr(
        'transform',
        `translate(${width / 2}, ${height + margin.top + margin.bottom - 10})`
      )
      .style('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', '500')
      .text('Years');

    // Y-axis label positioning
    this.labelY = this.svg
      .append('text')
      .attr('transform', `rotate(-90)`)
      .attr('y', margin.left / 3)
      .attr('x', -(margin.top + height / 2))
      .attr('dy', '.75em')
      .style('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', '500')
      .text('Electric Range (Kms)');
  }

  updateScales(data) {
    // Update scales
    this.scaleX = d3
      .scalePoint()
      .domain(data.map((d) => d[0]))
      .range([0, 550])
      .padding(0.5);

    this.scaleY.domain(d3.extent(data, (d) => d[1])).nice();

    // Update axes
    this.xAxis.call(d3.axisBottom(this.scaleX));
    this.yAxis.call(d3.axisLeft(this.scaleY));
  }

  render(data) {
    this.updateScales(data);

    // Gridlines
    this.yAxis
      .selectAll('.tick')
      .append('line')
      .classed('grid-line', true)
      .attr('stroke', 'lightgrey')
      .attr('stroke-dasharray', '3,3')
      .attr('x1', 0)
      .attr('x2', 550)
      .attr('y1', 0)
      .attr('y2', 0);

    // Showing the plots
    this.plot
      .selectAll('.scatter')
      .data(data)
      .join(
        (enter) =>
          enter
            .append('circle')
            .attr('class', 'scatter')
            .attr('cx', (d) => this.scaleX(d[0]))
            .attr('cy', (d) => this.scaleY(d[1]))
            .attr('r', 0)
            .attr('fill', '#6200EE')
            .transition()
            .duration(800)
            .attr('r', 6),
        (update) => update,
        (exit) => exit.remove()
      );
  }
}
