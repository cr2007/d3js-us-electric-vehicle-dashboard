export default class BarChart {
  constructor(svgSelector) {
    this.svgSelector = svgSelector;
  }

  renderBarChart(data, displayModels = false) {
    let counts = data;

    // If no search is being made, showcase the data by car make
    if (!displayModels) {
      counts = d3.rollup(
        data,
        (v) => v.length,
        (d) => d.Make
      );

      counts = Array.from(counts, ([make, count]) => ({
        make,
        count,
      }));
    }

    // Dimensions
    const width = 1000;
    const height = 400;
    const margin = { top: 10, right: 10, bottom: 30, left: 45 };
    const chartWidth = width - margin.left - margin.right - 50;
    const chartHeight = height - margin.top - margin.bottom;

    // Reset the chart every time a search is being made
    d3.select('#bar-chart').selectAll('*').remove();

    // Applying the default dimensions and zoom to the SVG
    const svg = d3
      .select(this.svgSelector)
      .attr('width', width)
      .attr('height', height)
      .call(zoom);

    // Styling
    const chart = svg
      .append('g')
      .attr('fill', '#5E3FBE')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Determining which property to use for the x-axis domain
    const property = displayModels ? 'model' : 'make';

    // Setting up x and y scales
    const x = d3
      .scaleBand()
      .domain(counts.map((d) => d[property]))
      .range([0, chartWidth])
      .padding(0.1);

    const xAxis = d3.axisBottom(x).tickSizeOuter(0);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(counts, (d) => d.count)])
      .nice()
      .range([chartHeight, 0]);

    // Adding the bars to the chart
    chart
      .selectAll('.bar')
      .data(counts)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => x(displayModels ? d.model : d.make))
      .attr('y', chartHeight)
      .attr('width', x.bandwidth())
      .attr('height', 0)
      .on('mouseover', (event, d) => {
        tooltip.transition().duration(200).style('opacity', 0.9);
        tooltip
          .html(`${d.count}`)
          .style('left', `${event.pageX}px`)
          .style('top', `${event.pageY}px`);
      })
      .on('mouseout', () => {
        tooltip.transition().duration(500).style('opacity', 0);
      })
      .transition()
      .duration(800)
      .attr('y', (d) => y(d.count))
      .attr('height', (d) => chartHeight - y(d.count));

    // TODO: Adjust the UI of the hover
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

    const xAxisGroup = chart
      .append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(xAxis);

    // Removing the defaulted lines for a better visual
    xAxisGroup.select('.domain').attr('display', 'none');
    xAxisGroup.selectAll('.tick line').attr('display', 'none');

    // X-axis labels
    xAxisGroup
      .selectAll('text')
      .style('text-anchor', 'middle')
      .attr('font-size', '8px')
      .attr('dy', '1em')
      .text((d) => (d.length > 10 ? d.substring(0, 8) + '...' : d));

    // Y-axis counts
    const yAxisGrp = chart
      .append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(y));

    yAxisGrp.select('.domain').attr('display', 'none');

    // Responsible for applying zoom to the chart
    function zoom(svg) {
      const extent = [
        [margin.left, margin.top],
        [chartWidth, height - margin.top],
      ];

      svg.call(
        d3
          .zoom()
          .scaleExtent([1, 8])
          .translateExtent(extent)
          .extent(extent)
          .on('zoom', (event) => {
            x.range([10, chartWidth].map((d) => event.transform.applyX(d)));

            svg
              .selectAll('.bar')
              .attr('x', (d) => x(displayModels ? d.model : d.make))
              .attr('width', x.bandwidth())
              .attr('y', (d) => y(d.count))
              .attr('height', (d) => chartHeight - y(d.count));

            svg.selectAll('.x-axis').call(xAxis);

            svg
              .selectAll('.x-axis text')
              .text((d) => (d.length > 10 ? d.substring(0, 8) + '...' : d));
          })
      );
    }
  }
}
