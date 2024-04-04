export default class PieChart {
  /**
   * Constructor for the PieChart class.
   * Initializes the PieChart with the provided SVG selector.
   *
   * @param {string} svgSelector - The selector for the SVG element to use for the pie chart.
   */
  constructor(svgSelector) {
    // Set the svgSelector property with the provided SVG selector
    this.svgSelector = svgSelector;
  }


  /**
   * Creates a pie chart with the provided data.
   *
   * @param {Array<Object>} data - The data to use for the pie chart. Each object should have a "type" and "value" property.
   */
  createPieChart(data) {
    // Define the dimensions of the chart
    const width = 600;
    const height = 400;
    const radius = Math.min(width, height) / 2;

    // Remove all elements from the pie chart SVG to reset it
    d3.select('#pie-chart').selectAll('*').remove();

    // Define the color scale for the chart
    const colors = d3
      .scaleOrdinal()
      .domain(data.map((d) => d.type))
      .range(
        data.map((d) => {
          if (d.type === 'Plug-in Hybrid Electric Vehicle (PHEV)') {
            return '#5E3FBE';
          } else if (d.type === 'Battery Electric Vehicle (BEV)') {
            return '#f5a067';
          }
        })
      );

    // Select the SVG for the chart and set its dimensions
    const svg = d3
      .select('#pie-chart')
      .attr('width', width)
      .attr('height', height);

    // Define the pie function for the chart
    const pie = d3
      .pie()
      .value((d) => d.value)
      .sort(null);

    // Define the arc function for the chart
    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    // Create the arcs for the chart
    const arcs = svg
      .selectAll('.arc')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'arc')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    // Add the paths for the arcs with a transition
    arcs
      .append('path')
      .attr('d', arc)
      .attr('fill', (_, i) => colors(i))
      .transition()
      .duration(800)
      .attrTween('d', (d) => {
        const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return (t) => arc(interpolate(t));
      });

    // Add the text labels for the arcs
    arcs
      .append('text')
      .attr('transform', (d) => `translate(${arc.centroid(d)})`)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .text((d) => `${d.data.value.toFixed(1)}%`)
      .style('fill', (d) =>
        d.data.type === 'Battery Electric Vehicle (BEV)' ? '#black' : '#f4f0fd'
      )
      .style('font-size', '26px')
      .style('font-weight', '500');

    // Remove any extra arcs
    arcs.exit().remove();
  }


  /**
   * Renders a pie chart with the provided data and searched car make.
   * Filters the data based on the searched car make, calculates the counts and percentages for each electric vehicle type, and creates the pie chart.
   *
   * @param {Array<Object>} data - The data to use for the pie chart. Each object should have a "Make" and "Electric Vehicle Type" property.
   * @param {string} searchedMake - The car make to filter the data by. If provided, only data where the "Make" includes the searched make will be included.
   */
  renderPieChart(data, searchedMake) {
    let filteredData;

    // Check if a car make is being searched
    if (searchedMake !== undefined) {
      // If a car make is being searched, filter the data to include only entries where the "Make" includes the searched make
      filteredData = data.filter((d) =>
        d.Make.toLowerCase().includes(searchedMake.toLowerCase())
      );
    } else {
      // If no car make is being searched, use the original data
      filteredData = data;
    }

    // Extract the unique electric vehicle types from the data
    const types = Array.from(
      new Set(filteredData.map((d) => d['Electric Vehicle Type']))
    );

    // Calculate the count for each electric vehicle type
    const typeCounts = types.map((type) => ({
      type,
      count: filteredData.filter((d) => d['Electric Vehicle Type'] === type)
        .length,
    }));

    // Sum up the counts for all types
    const total = typeCounts.reduce((acc, curr) => acc + curr.count, 0);

    // Calculate the percentage for each type
    const percentages = typeCounts.map((type) => ({
      type: type.type,
      value: (type.count / total) * 100,
    }));

    // Create the pie chart with the calculated percentages
    this.createPieChart(percentages);
  }
}
