export default class LineChart {
  constructor(svgSelector) {
    this.svgSelector = svgSelector;
  }

  populateDropdown(data) {
    const makes = Array.from(new Set(data.map((d) => d.Make)));
    const dropdown = d3.select('#lc-dropdown-content');

    makes.forEach((make) => {
      const label = dropdown.append('label');

      label
        .append('input')
        .attr('type', 'checkbox')
        .attr('checked', true)
        .attr('value', make)
        .on('change', () => this.updateChart(data));

      label.append('span').text(make);
    });
  }

  getCheckedMakes() {
    return d3
      .selectAll("#lc-dropdown-content input[type='checkbox']:checked")
      .nodes()
      .map((el) => el.value);
  }

  transformData(filteredData) {
    const groupedByMake = d3.groups(filteredData, (d) => d.Make);

    const transformedData = groupedByMake.map(([make, entries]) => {
      const countsByYear = d3
        .rollups(
          entries,
          (v) => v.length,
          (d) => d['Model Year']
        )
        .map(([year, count]) => ({ year, count }))
        .sort((a, b) => d3.ascending(a.year, b.year));

      return { make, values: countsByYear };
    });

    return transformedData;
  }

  updateChart(originalData) {
    const checkedMakes = this.getCheckedMakes();

    const filteredData = originalData.filter((d) =>
      checkedMakes.includes(d.Make)
    );

    const transformedData = this.transformData(filteredData);

    this.renderLineChart(transformedData, undefined);
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

    const xScale = d3.scaleBand().range([0, width]).domain(allYears).padding(1);

    const yScale = d3
      .scaleLinear()
      .range([height, 0])
      .domain([
        0,
        d3.max(filteredData, (d) => d3.max(d.values, (v) => v.count)),
      ]);

    const makeColors = {};

    const colorScale = (make) => {
      if (!makeColors[make]) {
        makeColors[make] = getRandomColor();
      }

      return makeColors[make];
    };

    function getRandomColor() {
      const letters = '0123456789ABCDEF';

      let color = '#';

      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }

      return color;
    }

    const generateLegend = () => {
      const legendContainer = d3.select('.legend-line');

      legendContainer.selectAll('.legend-row-line').remove();

      let legendRow = legendContainer
        .append('div')
        .attr('class', 'legend-row-line');

      let count = 0;

      Object.keys(makeColors).forEach((make) => {
        if (count >= 5) {
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

    d3.select(this.svgSelector).selectAll('*').remove();

    const svg = d3
      .select(this.svgSelector)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const gridlines = d3
      .axisLeft(yScale)
      .tickSize(-width)
      .tickFormat('')
      .ticks(10);

    const gridGroup = svg.append('g').attr('class', 'grid').call(gridlines);

    gridGroup
      .selectAll('.tick')
      .attr('stroke-opacity', 0.1)
      .attr('stroke-dasharray', '2,2');

    svg.select('.grid .domain').remove();

    const line = d3
      .line()
      .x((d) => xScale(d.year) + xScale.bandwidth() / 2)
      .y((d) => yScale(d.count));

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

    const xAxisGroup = svg
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .attr('y', margin.bottom - 50)
      .call(d3.axisBottom(xScale));

    xAxisGroup.select('.domain').attr('display', 'none');

    const yAxisGrp = svg.append('g').call(d3.axisLeft(yScale));

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

    const mouseout = () => {
      tooltip.transition().duration(500).style('opacity', 0);
    };

    yAxisGrp.select('.domain').attr('display', 'none');

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
          tooltip
            .transition()
            .duration(200)
            .style('opacity', 0.9)
            .style('background-color', colorScale(d.make));
          tooltip
            .html(`${d.make}<br/>${d.year} : ${d.count} cars`)
            .style('left', event.pageX + 'px')
            .style('top', event.pageY - 28 + 'px');
        })
        .on('mouseout', mouseout);
    });

    generateLegend();
  }
}
