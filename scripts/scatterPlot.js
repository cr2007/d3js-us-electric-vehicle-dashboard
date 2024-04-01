export default class ScatterPlot {
    constructor(svgSelector) {
      this.svgSelector = svgSelector;
      const margin = { top: 10, right: 20, bottom: 50, left: 80 };
      const width = 700;
      const height = 350;

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

      // Labels
      // this.labelX = this.svg
      //   .append('text')
      //   .attr(
      //     'transform',
      //     `translate(${width / 2 + margin.left}, ${height + margin.top + 40})`
      //   )
      //   .style('text-anchor', 'middle');
      // this.labelY = this.svg
      //   .append('text')
      //   .attr('transform', `rotate(-90)`)
      //   .attr('y', 0)
      //   .attr('x', 0 - height / 2)
      //   .attr('dy', '1em')
      //   .style('text-anchor', 'middle');
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

    //   setLabels(labelX, labelY) {
    //     this.labelX.text(labelX);
    //     this.labelY.text(labelY);
    //   }
  }
