// StackedBarChart.js
export default class StackedBarChart {
    constructor(svgSelector) {
      this.svgSelector = svgSelector;
    }

    renderStackedBarChart(data) {
      // Correct keys based on your data structure
      const keys = ['Battery Electric Vehicle (BEV)', 'Plug-in Hybrid Electric Vehicle (PHEV)'];

      // Dimensions and margins
      const margin = { top: 20, right: 20, bottom: 40, left: 50 };
      const width = 500 - margin.left - margin.right;
      const height = 300 - margin.top - margin.bottom;

      // Scales
      const xScale = d3.scaleBand()
        .rangeRound([0, width])
        .padding(0.1)
        .domain(data.map(d => d.year));

      const yScale = d3.scaleLinear()
        .rangeRound([height, 0])
        .domain([0, d3.max(data, d => d[keys[0]] + d[keys[1]])]);

      const colorScale = d3.scaleOrdinal()
        .domain(keys)
        .range(['#f5a067', '#5E3FBE']); // Change these colors to match your desired scheme

      // Clear any existing SVG
      d3.select(this.svgSelector).selectAll('*').remove();

      // Append the SVG object to the body of the page
      const svg = d3.select(this.svgSelector)
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Stack the data
      const stackedData = d3.stack()
        .keys(keys)(data);

        const yAxis = d3.axisLeft(yScale);
        const yAxisGroup = svg.append('g')
        .call(yAxis);

        // Add gridlines by cloning the tick lines and extending them across the chart
        yAxisGroup.selectAll('.tick line')
        .clone()
        .attr('x2', width)
        .attr('stroke-opacity', 0.1) // Adjust the opacity as needed
        .attr('class', 'gridline')
        .lower();

      // Create the bars
      svg.append('g')
        .selectAll('g')
        .data(stackedData)
        .enter().append('g')
          .attr('fill', d => colorScale(d.key))
        .selectAll('rect')
        .data(d => d)
        .enter().append('rect')
          .attr('x', d => xScale(d.data.year))
          .attr('y', d => yScale(d[1]))
          .attr('height', d => yScale(d[0]) - yScale(d[1]))
          .attr('width', xScale.bandwidth());

      // Add the X Axis
      svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale));

      // Add the Y Axis
      svg.append('g')
        .call(d3.axisLeft(yScale));


      // Add a tooltip
      const tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);

      // Tooltip mouseover event handler
      const mouseover = (event, d) => {
        tooltip.transition().duration(200).style('opacity', 0.9);
        tooltip.html(`${d.key}<br/>${d.data.year}: ${d[1] - d[0]}`)
          .style('left', `${event.pageX}px`)
          .style('top', `${event.pageY - 28}px`);
      };

      // Tooltip mouseout event handler
      const mouseout = () => {
        tooltip.transition().duration(500).style('opacity', 0);
      };

      // Add event listeners for the tooltip
      svg.selectAll('rect')
        .on('mouseover', mouseover)
        .on('mouseout', mouseout);

      // Optionally, you can add zoom behavior here
      // ...

      // Add legend and filter functionality
      // You will need to implement this part
      // ...
    }
  }
