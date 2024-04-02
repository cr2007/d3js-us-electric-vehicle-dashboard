import {
  mouseoverHandler,
  mouseoutHandler,
  getCheckedCarMakes,
} from './helper.js';

export default class BarChart {
  constructor(svgSelector) {
    this.svgSelector = svgSelector;
  }

  // Helper function to filter data based on the car manufacturer ("Make" column)
  filterCarModel(data, make) {
    const filteredData = data.filter((d) =>
      d.Make.toLowerCase().includes(make.toLowerCase())
    );

    const modelSet = new Set();
    filteredData.forEach((d) => modelSet.add(d.Model));

    const modelCounts = Array.from(modelSet).map((model) => ({
      model,
      count: filteredData.filter((d) => d.Model === model).length,
    }));

    return modelCounts;
  }

  // Showcasing the bar chart
  renderBarChart(data, displayModels = false) {
    let counts = [];

    if (displayModels) {
      counts = data;
    } else {
      // Fetching all the car makes
      const checkedMakes = getCheckedCarMakes(data, 'bc-dropdown-content');

      const filteredData = data.filter((d) => checkedMakes.includes(d.Make));

      const carMakes = d3.rollup(
        filteredData,
        (v) => v.length,
        (d) => d.Make
      );

      counts = Array.from(carMakes, ([make, count]) => ({
        make,
        count,
      }));
    }

    // Dynamic width
    const container = d3.select('#bar-chart-container');
    const containerWidth = container.node().getBoundingClientRect().width;

    // Dimensions
    const width = containerWidth - 50;
    const height = 500;
    const margin = { top: 10, right: 10, bottom: 30, left: 45 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Reset the chart every time a search is being made
    d3.select('#bar-chart').selectAll('*').remove();

    // Applying the default dimensions and zoom to the SVG
    const svg = d3
      .select(this.svgSelector)
      .attr('viewBox', `0 0 ${containerWidth} ${height}`)
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .attr('width', '100%')
      .style('display', 'block')
      .call(zoom);

    // Styling
    const barChart = svg
      .append('g')
      .attr('fill', '#5E3FBE')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Determining which property to use for the x-axis
    const property = displayModels ? 'model' : 'make';

    // Setting up x and y scales
    const xScale = d3
      .scaleBand()
      .domain(counts.map((d) => d[property]))
      .range([0, chartWidth])
      .padding(0.15);

    const xAxis = d3.axisBottom(xScale).tickSizeOuter(0);

    const xAxisGroup = barChart
      .append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(xAxis);

    // Removing the defaulted lines for a better visual
    xAxisGroup.select('.domain').attr('display', 'none');

    xAxisGroup
      .selectAll('text')
      .attr('dy', '1em')
      .attr('font-weight', '500')
      .text((d) => (d.length > 6 ? d.substring(0, 4) + '...' : d));

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(counts, (d) => d.count)])
      .nice()
      .range([chartHeight, 0]);

    // Y-axis counts
    const yAxisGrp = barChart
      .append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yScale));

    yAxisGrp.select('.domain').attr('display', 'none');

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

    // What is displayed when hovering over a specific bar
    const content = (d) => `${d[property]}<br/>${d.count}`;

    // Adding the bars to the barChart
    barChart
      .selectAll('.bar')
      .data(counts)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => xScale(d[property]))
      .attr('y', chartHeight)
      .attr('width', xScale.bandwidth())
      .attr('height', 0)
      .on('mouseover', mouseoverHandler(tooltip, content, 0.85))
      .on('mouseout', mouseoutHandler(tooltip))
      .transition()
      .duration(800)
      .attr('y', (d) => yScale(d.count))
      .attr('height', (d) => chartHeight - yScale(d.count));

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
            xScale.range(
              [10, chartWidth].map((d) => event.transform.applyX(d))
            );

            svg
              .selectAll('.bar')
              .attr('x', (d) => xScale(displayModels ? d.model : d.make))
              .attr('width', xScale.bandwidth())
              .attr('y', (d) => yScale(d.count))
              .attr('height', (d) => chartHeight - yScale(d.count));

            svg.selectAll('.x-axis').call(xAxis);

            svg
              .selectAll('.x-axis text')
              .text((d) => (d.length > 6 ? d.substring(0, 4) + '...' : d));
          })
      );
    }
  }
}
