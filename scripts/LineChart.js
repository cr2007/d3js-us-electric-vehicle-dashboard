export default class LineChart {
    constructor(svgSelector) {
      this.svgSelector = svgSelector;
    }

    renderLineChart(data) {

      const margin = { top: 20, right: 30, bottom: 50, left: 60 };
      const width = 600 - margin.left - margin.right;
      const height = 350 - margin.top - margin.bottom;

      const allYears = Array.from(new Set(data.flatMap(d => d.values.map(v => v.year)))).sort();

      console.log("allYears:",allYears);

      const xScale = d3.scaleBand()
          .range([0, width])
          .domain(allYears)
          .padding(1);

      const yScale = d3.scaleLinear()
          .range([height, 0])
          .domain([0, d3.max(data, d => d3.max(d.values, v => v.count))]);

      const colorMapping = {
          'TESLA': '#e41a1c',
          'BMW': '#377eb8',
          'VOLVO': '#4daf4a',
          'KIA': '#984ea3',
          'SUBARU': '#ff7f00',
          'PORSCHE': '#ffff33',
          'CHRYSLER': '#a65628',
          'MINI': '#f781bf',
          'FISKER': '#999999',
          'WHEEGO ELECTRIC CARS': '#a6cee3',
          'CADILLAC': '#1f78b4',
      };

      // Color scale using the mapping
      const colorScale = make => colorMapping[make] || '#333';

      // Clear any existing SVG
      d3.select(this.svgSelector).selectAll('*').remove();

      // Append the SVG object to the body of the page
      const svg = d3.select(this.svgSelector)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);


      // Add gridlines
      const gridlines = d3.axisLeft(yScale)
      .tickSize(-width)
      .tickFormat('')
      .ticks(10);
      const gridGroup = svg.append('g')
      .attr('class', 'grid')
      .call(gridlines);
      gridGroup.selectAll('.tick')
      .attr('stroke-opacity', 0.1)
      .attr('stroke-dasharray', '2,2');
      svg.select('.grid .domain').remove();


      // For the line
      const line = d3.line()
      .x(d => xScale(d.year) + xScale.bandwidth() / 2)
      .y(d => yScale(d.count));


      // Bind data and create one path per make
      data.forEach(makeData => {
          svg.append('path')
              .datum(makeData.values)
              .attr('class', 'line')
              .attr('fill', 'none')
              .attr('stroke', d => colorScale(makeData.make))
              .attr('stroke-width', 2)
              .attr('d', line);
      });


      // Add the X Axis with label
      svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale))
        .append('text')
        .attr('fill', '#000')
        .attr('x', width / 2)
        .attr('y', margin.bottom - 10)
        .attr('text-anchor', 'end')
        .attr('font-weight', 'bold');


      // Add the Y Axis with label
      svg.append('g')
        .call(d3.axisLeft(yScale))
        .append('text')
        .attr('fill', '#000')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left + 15)
        .attr('x', -height / 2)
        .attr('dy', '1em')
        .attr('text-anchor', 'middle')
        .attr('font-weight', 'bold');


      // Add a tooltip
      const tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0)
        .style('position', 'absolute')
        .style('text-align', 'center')
        .style('width', '120px')
        .style('height', '28px')
        .style('padding', '2px')
        .style('font', '12px sans-serif')
        .style('background', 'lightsteelblue')
        .style('border', '0px')
        .style('border-radius', '8px')
        .style('pointer-events', 'none');

      // Tooltip mouseout event handler
      const mouseout = () => {
        tooltip.transition()
          .duration(500)
          .style('opacity', 0);
      };

      // Bind data and create one circle per data point
      data.forEach(makeData => {
          svg.selectAll(`.dot-${makeData.make}`)
              .data(makeData.values.map(d => ({ ...d, make: makeData.make })))
              .enter().append('circle')
              .attr('r', 4)
              .attr('cx', d => xScale(d.year) + xScale.bandwidth() / 2)
              .attr('cy', d => yScale(d.count))
              .attr('fill', d => colorScale(makeData.make)) // For the circles
              .on('mouseover', (event, d) => {
                  tooltip.transition()
                      .duration(200)
                      .style('opacity', .9)
                      .style('background-color', colorScale(d.make));
                  tooltip.html(`${d.make}<br/>${d.year}: ${d.count}`)
                      .style('left', (event.pageX) + 'px')
                      .style('top', (event.pageY - 28) + 'px');
              })
              .on('mouseout', mouseout);
      });


    }
  }
