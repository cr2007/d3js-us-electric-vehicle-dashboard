import { getCheckedCarMakes, axisLabel } from './helper.js';

export default class LineChart {
  /**
   * Create a LineChart.
   * @param {string} svgSelector - The selector for the SVG element.
   */
  constructor(svgSelector) {
    // Store the SVG selector for later use
    this.svgSelector = svgSelector;
  }

  /**
   * Transform the data into a format suitable for the line chart.
   * @param {Array} filteredData - The data to transform.
   * @return {Array} The transformed data.
   */
  transformData(filteredData) {
    // Group the data by car make
    const groupedByMake = d3.groups(filteredData, (d) => d.Make);

    // Transform the grouped data into a format suitable for the line chart
    const transformedData = groupedByMake.map(([make, entries]) => {
      // Count the number of entries for each year
      const countsByYear = d3
        .rollups(
          entries,
          (v) => v.length, // Count the number of entries
          (d) => d['Model Year'] // Group by model year
        )
        .map(([year, count]) => ({ year, count })) // Transform the data into an object
        .sort((a, b) => d3.ascending(a.year, b.year)); // Sort the data by year

      // Return the transformed data for this car make
      return { make, values: countsByYear };
    });

    // Return the transformed data
    return transformedData;
  }

  /**
   * Update the chart with new data.
   * @param {Array} originalData - The original data.
   */
  updateChart(originalData) {
    // Get the checked car makes from the dropdown
    const checkedMakes = getCheckedCarMakes(
      originalData,
      'lc-dropdown-content'
    );

    // Filter the original data to include only the checked car makes
    const filteredData = originalData.filter((d) =>
      checkedMakes.includes(d.Make)
    );

    // Transform the filtered data into a format suitable for the line chart
    const transformedData = this.transformData(filteredData);

    // Render the line chart with the transformed data
    this.renderLineChart(transformedData, undefined);
  }

  /**
   * Render the line chart.
   * @param {Array} data - The data to render.
   * @param {string} searchedMake - The car make to highlight.
   */
  renderLineChart(data, searchedMake) {
    // Define the margins, width, and height
    const margin = { top: 20, right: 30, bottom: 50, left: 80 };
    const width = 900 - margin.left - margin.right;
    const height = 450 - margin.top - margin.bottom;

    // Filter the data based on the searched car make
    let filteredData;

    if (searchedMake !== undefined) {
      filteredData = data.filter((d) =>
        d.make.toLowerCase().includes(searchedMake.toLowerCase())
      );
    } else {
      filteredData = data;
    }

    // Get all unique years from the data
    const allYears = Array.from(
      new Set(filteredData.flatMap((d) => d.values.map((v) => v.year)))
    ).sort();

    // Define the x-scale
    const xScale = d3
      .scaleBand()
      .range([-50, width])
      .domain(allYears)
      .padding(1);

    // Define the y-scale
    const yScale = d3
      .scaleLinear()
      .range([height, 0])
      .domain([
        0,
        d3.max(filteredData, (d) => d3.max(d.values, (v) => v.count)),
      ]);

    // Define the color scale
    const makeColors = {};
    const colorScale = (make) => {
      if (!makeColors[make]) {
        makeColors[make] = getRandomColor();
      }

      return makeColors[make];
    };

    // Define a function to generate a random color
    function getRandomColor() {
      const letters = '0123456789ABCDEF';
      let color = '#';
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    }

    // Define a function to generate the legend
    const generateLegend = () => {
      // ... existing code ...
      const legendContainer = d3.select('.legend-line').style('width', '900px');

      legendContainer.selectAll('.legend-row-line').remove();

      let legendRow = legendContainer
        .append('div')
        .attr('class', 'legend-row-line');

      let count = 0;

      Object.keys(makeColors).forEach((make) => {
        if (count >= 7) {
          legendRow = legendContainer
            .append('div')
            .attr('class', 'legend-row-line');
          count = 0;
        }

        const legendItem = legendRow
          .append('div')
          .attr('class', 'legend-item-line');

        legendItem
          .append('span')
          .attr('class', 'legend-dot-line')
          .style('color', makeColors[make])
          .html('&#11044;');

        legendItem.append('span').attr('class', 'legend-text-line').text(make);

        count++;
      });
    };

    // Remove all elements from the SVG
    d3.select(this.svgSelector).selectAll('*').remove();

    // Create the SVG element
    const svg = d3
      .select(this.svgSelector)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create the grid lines
    const gridlines = d3
      .axisLeft(yScale)
      .tickSize(-width)
      .tickFormat('')
      .ticks(10);

    // Add the grid lines to the SVG
    const gridGroup = svg.append('g').attr('class', 'grid').call(gridlines);

    // Style the grid lines
    gridGroup
      .selectAll('.tick')
      .attr('stroke-opacity', 0.1)
      .attr('stroke-dasharray', '2,2');

    // Remove the domain line of the grid
    svg.select('.grid .domain').remove();

    // Define the line generator
    const line = d3
      .line()
      .x((d) => xScale(d.year) + xScale.bandwidth() / 2)
      .y((d) => yScale(d.count));

    // Add the lines to the SVG
    filteredData.forEach((makeData) => {
      svg
        .append('path')
        .datum(makeData.values)
        .attr('class', 'line')
        .attr('fill', 'none')
        .attr('stroke', colorScale(makeData.make))
        .attr('stroke-width', 2)
        .attr('d', line(makeData.values))
        .each((_, i, nodes) => {
          const length = nodes[i].getTotalLength();
          d3.select(nodes[i]).attr('stroke-dasharray', length);
          d3.select(nodes[i]).attr('stroke-dashoffset', length);
        })
        .transition()
        .duration(800)
        .attr('stroke-dashoffset', 0);
    });

    // Add the x-axis to the SVG
    const xAxisGroup = svg
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .attr('y', margin.bottom - 50)
      .call(d3.axisBottom(xScale));

    // Remove the domain line of the x-axis
    xAxisGroup.select('.domain').attr('display', 'none');

    axisLabel({
      axisGroup: xAxisGroup,
      orientation: 'x',
      width,
      y: 40,
      text: 'Years',
    });

    // Add the y-axis to the SVG
    const yAxisGroup = svg.append('g').call(d3.axisLeft(yScale));

    const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('text-align', 'center')
      .style('width', '120px')
      .style('height', '28px')
      .style('padding', '2px')
      .style('font-size', '12px')
      .style('background', 'lightsteelblue')
      .style('border', '0px')
      .style('border-radius', '8px')
      .style('pointer-events', 'none');

    const mouseout = () => {
      tooltip.transition().duration(500).style('opacity', 0);
    };

    // Remove the domain line of the y-axis
    yAxisGroup.select('.domain').attr('display', 'none');

    // Adding the Y label
    axisLabel({
      axisGroup: yAxisGroup,
      orientation: 'y',
      height: height,
      y: -70,
      text: 'Number of Electric Vehicles Owned',
    });

    // Add the points to the SVG
    filteredData.forEach((makeData) => {
      svg
        .selectAll(`.dot-${makeData.make}`)
        .data(makeData.values.map((d) => ({ ...d, make: makeData.make })))
        .enter()
        .append('circle')
        .attr('r', 4)
        .attr('cx', (d) => xScale(d.year) + xScale.bandwidth() / 2)
        .attr('cy', (d) => yScale(d.count))
        .attr('fill', (d) => colorScale(makeData.make))
        .on('mouseover', (event, d) => {
          const scale = 0.85;
          tooltip
            .transition()
            .duration(200)
            .style('opacity', 0.9)
            .style('background-color', colorScale(d.make));
          tooltip
            .html(`${d.make}<br/>${d.year}: ${d.count} cars`)
            .style('left', event.pageX / scale + 'px')
            .style('top', event.pageY / scale - 28 + 'px');
        })
        .on('mouseout', mouseout);
    });


    // Generate the legend
    generateLegend();
  }
}
