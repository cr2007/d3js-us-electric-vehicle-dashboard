export default class ScatterPlot {

  /**
   * Constructor for the ScatterPlot class.
   * Initializes the SVG, plot area, scales, axes, and labels.
   *
   * @param {string} svgSelector - The CSS selector for the SVG element to attach the scatter plot to.
   */
  constructor(svgSelector) {
    // Store the SVG selector for future use
    this.svgSelector = svgSelector;

    // Define the margins, width, and height of the plot
    const margin = { top: 20, right: 20, bottom: 50, left: 100 };
    const width = 750;
    const height = 470;

    // Select the SVG element and set its width and height
    this.svg = d3
      .select(svgSelector)
      .attr('width', width)
      .attr('height', height + margin.top + margin.bottom);

    // Create the plot area within the SVG
    this.plot = this.svg
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Initialize the x and y scales
    this.scaleX = d3.scaleLinear().range([20, 550]);
    this.scaleY = d3.scaleLinear().range([height, 0]);

    // Create the x-axis and position it at the bottom of the plot
    this.xAxis = this.plot
      .append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(this.scaleX));

    // Remove the line (domain) of the x-axis
    this.xAxis.select('.domain').attr('stroke', 'none');

    // Create the y-axis
    this.yAxis = this.plot.append('g').call(d3.axisLeft(this.scaleY));

    // Remove the line (domain) of the y-axis
    this.yAxis.select('.domain').attr('stroke', 'none');

    // Add a label to the x-axis
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

    // Add a label to the y-axis
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


  /**
   * This method updates the scales and axes of the scatter plot based on the provided data.
   *
   * @param {Array<Array<number>>} data - An array of arrays where each sub-array represents a data point in the format [x, y].
   */
  updateScales(data) {
    // Create a new scale for the x-axis using D3's scalePoint function
    this.scaleX = d3
      .scalePoint()                  // scalePoint is used for ordinal or categorical data
      .domain(data.map((d) => d[0])) // domain is set to the x-values of the data points
      .range([0, 550])               // range is set to span the width of the plot (550 units in this case)
      .padding(0.5);                 // padding is used to separate the points

    // Create a new scale for the y-axis using D3's scaleLinear function
    this.scaleY.domain(d3.extent(data, (d) => d[1])).nice(); // domain is set to the min and max y-values of the data points, and nice() rounds the domain to a nice round number

    // Update the x-axis with the new scale
    this.xAxis.call(d3.axisBottom(this.scaleX)); // axisBottom creates an axis with the ticks below the line

    // Update the y-axis with the new scale
    this.yAxis.call(d3.axisLeft(this.scaleY)); // axisLeft creates an axis with the ticks to the left of the line
  }


  /**
   * This method renders the scatter plot with the provided data.
   *
   * @param {Array<Array<number>>} data - An array of arrays where each sub-array represents a data point in the format [x, y].
   */
  render(data) {
    // Update the scales of the plot based on the provided data
    this.updateScales(data);

    // Adds gridlines to the y-axis
    this.yAxis
      .selectAll('.tick')              // Select all ticks on the y-axis
      .append('line')                  // Append a line to each tick
      .classed('grid-line', true)      // Add the class 'grid-line' to each line
      .attr('stroke', 'lightgrey')     // Set the stroke color of the line to light grey
      .attr('stroke-dasharray', '3,3') // Set the stroke pattern to dashed with a pattern of 3
      .attr('x1', 0)                   // Set the starting x-coordinate of the line to 0
      .attr('x2', 550)                 // Set the ending x-coordinate of the line to 550
      .attr('y1', 0)                   // Set the starting y-coordinate of the line to 0
      .attr('y2', 0);                  // Set the ending y-coordinate of the line to 0

    // Render the scatter plot
    this.plot
      .selectAll('.scatter') // Select all elements with the class 'scatter'
      .data(data) // Bind the provided data to the selected elements
      .join(
        (enter) =>
          enter
            .append('circle')                     // Append a circle to each new data point
            .attr('class', 'scatter')             // Add the 'scatter' class
            .attr('cx', (d) => this.scaleX(d[0])) // Set the x-coordinate to the scaled x-value of the data point
            .attr('cy', (d) => this.scaleY(d[1])) // Set the y-coordinate to the scaled y-value of the data point
            .attr('r', 0)                         // Set initial radius of the circle to 0
            .attr('fill', '#6200EE')              // Set fill color of the circle to #6200EE
            .transition()                         // Start a transition
            .duration(800)                        // Set duration of the transition to 800ms
            .attr('r', 6),                        // Set the final radius of the circle to 6
        (update) => update,
        (exit) => exit.remove() // For elements that no longer have a corresponding data point, remove them
      );

  }

  //   setLabels(labelX, labelY) {
  //     this.labelX.text(labelX);
  //     this.labelY.text(labelY);
  //   }
}
