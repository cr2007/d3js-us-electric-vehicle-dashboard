import {
  mouseoverHandler,
  mouseoutHandler,
  getCheckedCarMakes,
  axisLabel,
} from './helper.js';

export default class BarChart {
  /**
   * Constructor for the BarChart class.
   * Initializes the BarChart with the provided SVG selector.
   *
   * @param {string} svgSelector - The selector for the SVG element to use for the bar chart.
   */
  constructor(svgSelector) {
    // Set the svgSelector property with the provided SVG selector
    this.svgSelector = svgSelector;
  }


  /**
   * Filters the provided data by car manufacturer ("Make") and counts the number of each model.
   *
   * @param {Array<Object>} data - The data to filter. Each object should have a "Make" and "Model" property.
   * @param {string} make - The car manufacturer to filter the data by. Only data where the "Make" includes this string will be included.
   * @returns {Array<Object>} The filtered and counted data. Each object has a "model" and "count" property.
   */
  filterCarModel(data, make) {
    // Filter the data to include only entries where the "Make" includes the provided string
    const filteredData = data.filter((d) =>
      d.Make.toLowerCase().includes(make.toLowerCase())
    );

    // Create a set to store the unique models
    const modelSet = new Set();
    // For each entry in the filtered data, add the "Model" to the set
    filteredData.forEach((d) => modelSet.add(d.Model));

    // Map the unique models to an array of objects, each with a "model" and "count" property
    const modelCounts = Array.from(modelSet).map((model) => ({
      model,
      // The "count" is the number of entries in the filtered data where the "Model" is the current model
      count: filteredData.filter((d) => d.Model === model).length,
    }));

    // Return the array of model counts
    return modelCounts;
  }


  /**
   * Initializes the SVG for the bar chart based on the specified dimensions.
   * The width of the SVG is dynamic to fit the size of the container, and the height is fixed.
   * The SVG is reset on each re-render.
   *
   * @returns {Object} An object containing the SVG, the bar chart group, the width and height of the bar chart, and the margins.
   */
  createBarChart() {
    // Select the container for the bar chart and get its width
    const container = d3.select('#bar-chart-container');
    const containerWidth = container.node().getBoundingClientRect().width;

    // Define the dimensions for the SVG and the bar chart
    const width = containerWidth - 50;
    const height = 450;
    const margin = { top: 10, right: 10, bottom: 30, left: 75 };
    const barChartWidth = width - margin.left - margin.right;
    const barChartHeight = height - margin.top - margin.bottom;

    // Reset the SVG by removing all its child elements
    d3.select(this.svgSelector).selectAll('*').remove();

    // Select the SVG and set its dimensions and style
    const svg = d3
      .select(this.svgSelector)
      .attr('viewBox', `0 0 ${width} ${height + 50}`)
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .attr('width', '100%')
      .style('display', 'block');

    // Append a group to the SVG for the bar chart, set its fill color, and translate it by the left and top margins
    const barChart = svg
      .append('g')
      .attr('fill', '#5E3FBE')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Return an object with the SVG, the bar chart group, the width and height of the bar chart, and the margins
    return { svg, barChart, barChartWidth, barChartHeight, margin };
  }


  /**
   * Renders a bar chart to display the counts of car "Make" or "Model" based on user search.
   *
   * @param {Array<Object>} data - The data to render. Each object should have a "Make" or "Model" and "count" property.
   * @param {boolean} isDisplayingModels - A flag to indicate whether to display models or makes. Default is false (display makes).
   */
  renderBarChart(data, isDisplayingModels = false) {
    // Create the bar chart and get its dimensions and elements
    const { svg, barChart, barChartWidth, barChartHeight, margin } =
      this.createBarChart();

    let counts = [];

    // If displaying models, use the provided data directly
    if (isDisplayingModels) {
      counts = data;
    } else {
      // If displaying makes, filter and count the data by make
      const checkedMakes = getCheckedCarMakes(data, 'bc-dropdown-content');

      const filteredData = data.filter((d) => checkedMakes.includes(d.Make));

      const carMakes = d3.rollup(
        filteredData,
        (v) => v.length,
        (d) => d.Make
      );

      // Structuring the values to to associate each car make with its total count
      counts = Array.from(carMakes, ([make, count]) => ({
        make,
        count,
      }));
    }

    // Determine the data column to use based on whether displaying models or makes
    const colData = isDisplayingModels ? 'model' : 'make';

    // Set up the x-axis and its scale
    const xScale = d3
      .scaleBand()
      .domain(counts.map((d) => d[colData]))
      .range([0, barChartWidth])
      .padding(0.15);

    // X-axis to show each car "Make"
    const xAxis = d3.axisBottom(xScale).tickSizeOuter(0);

    const xAxisGroup = barChart
      .append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${barChartHeight})`)
      .call(xAxis);

    // Removing the defaulted x-axis line for a better visual
    xAxisGroup.select('.domain').attr('display', 'none');

    // Keeping the length of the x-axis values consistent to avoid overflowing
    xAxisGroup
      .selectAll('text')
      .attr('dy', '1em')
      .attr('font-weight', '500')
      .style('font-size', '10px')
      .text((d) => (d.length > 6 ? d.substring(0, 5) + '...' : d));

    // Adding the X label
    axisLabel({
      axisGroup: xAxisGroup,
      orientation: 'x',
      width: barChartWidth,
      y: 45,
      text: 'Car Manufacturers',
      fontSize: '14px',
    });

    // Setting up y-axis and its scale
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(counts, (d) => d.count)])
      .nice()
      .range([barChartHeight, 0]);

    // Y-axis counts for the number of sold cars
    const yAxisGrp = barChart
      .append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yScale));

    // Removing the defaulted y-axis line for a better visual
    yAxisGrp.select('.domain').attr('display', 'none');

    // Adding the Y label
    axisLabel({
      axisGroup: yAxisGrp,
      orientation: 'y',
      height: barChartHeight,
      y: -70,
      text: 'Number of Cars Sold',
      fontSize: '14px',
    });

    // Styling the tooltip on hover
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

    // The content that is displayed when hovering over a specific bar
    const content = (d) => `${d[colData]}<br/>${d.count}`;

    // Adding each bars to the barChart to fit within the SVG dimensions
    barChart
      .selectAll('.bar')
      .data(counts)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => xScale(d[colData]))
      .attr('y', barChartHeight)
      .attr('width', xScale.bandwidth())
      .attr('height', 0)
      .on('mouseover', mouseoverHandler(tooltip, content, 0.85))
      .on('mouseout', mouseoutHandler(tooltip))
      .transition()
      .duration(800)
      .attr('y', (d) => yScale(d.count))
      .attr('height', (d) => barChartHeight - yScale(d.count)); // Animating the bars from bottom to top

    // Setting up the zoom function on the SVG to fit within the chart
    function zoom(svg) {
      const extent = [
        [margin.left, margin.top],
        [barChartWidth, barChartHeight],
      ];

      svg.call(
        d3
          .zoom()
          .scaleExtent([1, 8])
          .translateExtent(extent)
          .extent(extent)
          .on('zoom', (event) => {
            xScale.range(
              [10, barChartWidth].map((d) => event.transform.applyX(d))
            );

            svg
              .selectAll('.bar')
              .attr('x', (d) => xScale(isDisplayingModels ? d.model : d.make))
              .attr('width', xScale.bandwidth())
              .attr('y', (d) => yScale(d.count))
              .attr('height', (d) => barChartHeight - yScale(d.count));

            svg.selectAll('.x-axis').call(xAxis);

            svg
              .selectAll('.x-axis text')
              .text((d) => (d.length > 6 ? d.substring(0, 5) + '...' : d));
          })
      );
    }

    // Using the helper function above to apply the zoom behaviour on the SVG
    svg.call(zoom);
  }
}
