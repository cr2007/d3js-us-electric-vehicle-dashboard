export default class LineChart {
  constructor(svgSelector) {
    this.svgSelector = svgSelector;
  }

  renderLineChart(data, searchedMake) {
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 350 - margin.top - margin.bottom;

    let filteredData;

    if (searchedMake !== undefined) {
      filteredData = data.filter((d) =>
        d.make.toLowerCase().includes(searchedMake.toLowerCase())
      );
    } else {
      filteredData = data;
    }

    const allYears = Array.from(
      new Set(filteredData.flatMap((d) => d.values.map((v) => v.year)))
    ).sort();

    // console.log('allYears:', allYears);

    const xScale = d3.scaleBand().range([0, width]).domain(allYears).padding(1);

    const yScale = d3
      .scaleLinear()
      .range([height, 0])
      .domain([
        0,
        d3.max(filteredData, (d) => d3.max(d.values, (v) => v.count)),
      ]);

    const colorMapping = {
      TESLA: '#e41a1c',
      BMW: '#377eb8',
      VOLVO: '#4daf4a',
      KIA: '#984ea3',
      SUBARU: '#ff7f00',
      PORSCHE: '#ffff33',
      CHRYSLER: '#a65628',
      MINI: '#f781bf',
      FISKER: '#999999',
      'WHEEGO ELECTRIC CARS': '#a6cee3',
      CADILLAC: '#1f78b4',
    };

    // Color scale using the mapping
    const colorScale = (make) => colorMapping[make] || '#333';

    // Clear any existing SVG
    d3.select(this.svgSelector).selectAll('*').remove();

    // Append the SVG object to the body of the page
    const svg = d3
      .select(this.svgSelector)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add gridlines
    // const gridlines = d3
    //   .axisLeft(yScale)
    //   .tickSize(-width)
    //   .tickFormat('')
    //   .ticks(10);
    // const gridGroup = svg.append('g').attr('class', 'grid').call(gridlines);
    // gridGroup
    //   .selectAll('.tick')
    //   .attr('stroke-opacity', 0.1)
    //   .attr('stroke-dasharray', '2,2');
    // svg.select('.grid .domain').remove();

    // For the line
    const line = d3
      .line()
      .x((d) => xScale(d.year) + xScale.bandwidth() / 2)
      .y((d) => yScale(d.count));

    // Bind data and create one path per make
    filteredData.forEach((makeData) => {
      // Generate the line path
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

    const xAxisGroup = svg
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .attr('y', margin.bottom - 50)
      .call(d3.axisBottom(xScale));

    xAxisGroup.select('.domain').attr('display', 'none');
    // xAxisGroup.selectAll('.tick line').attr('display', 'none');

    // Add the Y Axis with label
    const yAxisGrp = svg.append('g').call(d3.axisLeft(yScale));

    // Add a tooltip
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
      .style('font', '12px sans-serif')
      .style('background', 'lightsteelblue')
      .style('border', '0px')
      .style('border-radius', '8px')
      .style('pointer-events', 'none');

    // Tooltip mouseout event handler
    const mouseout = () => {
      tooltip.transition().duration(500).style('opacity', 0);
    };

    yAxisGrp.select('.domain').attr('display', 'none');

    // Bind data and create one circle per data point
    filteredData.forEach((makeData) => {
      svg
        .selectAll(`.dot-${makeData.make}`)
        .data(makeData.values.map((d) => ({ ...d, make: makeData.make })))
        .enter()
        .append('circle')
        .attr('r', 4)
        .attr('cx', (d) => xScale(d.year) + xScale.bandwidth() / 2)
        .attr('cy', (d) => yScale(d.count))
        .attr('fill', (d) => colorScale(makeData.make)) // For the circles
        .on('mouseover', (event, d) => {
          tooltip
            .transition()
            .duration(200)
            .style('opacity', 0.9)
            .style('background-color', colorScale(d.make));
          tooltip
            .html(`${d.make}<br/>${d.year}: ${d.count}`)
            .style('left', event.pageX + 'px')
            .style('top', event.pageY - 28 + 'px');
        })
        .on('mouseout', mouseout);
    });
  }
}
