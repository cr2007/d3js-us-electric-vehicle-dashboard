export default class PieChart {
  constructor(svgSelector) {
    this.svgSelector = svgSelector;
  }

  createPieChart(data) {
    // Dimensions
    const width = 600;
    const height = 400;
    const radius = Math.min(width, height) / 2;

    // Reset the chart every time a search is being made
    d3.select('#pie-chart').selectAll('*').remove();

    // Assigning the colors to both types
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

    // Assigning the dimensions to the chart
    const svg = d3
      .select('#pie-chart')
      .attr('width', width)
      .attr('height', height);

    // Adding the values
    const pie = d3
      .pie()
      .value((d) => d.value)
      .sort(null);

    // Setting up the slices
    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    const arcs = svg
      .selectAll('.arc')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'arc')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    // Adding animations
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

    // Showcasing the percentages in the chart
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

    arcs.exit().remove();
  }

  renderPieChart(data, searchedMake) {
    let filteredData;

    // Checking if a car make is being searched
    if (searchedMake !== undefined) {
      filteredData = data.filter((d) =>
        d.Make.toLowerCase().includes(searchedMake.toLowerCase())
      );
    } else {
      filteredData = data;
    }

    // Extracting the Electric Vehicle Types from the data
    const types = Array.from(
      new Set(filteredData.map((d) => d['Electric Vehicle Type']))
    );

    // Calculating the counts for each Electric Vehicle Type
    const typeCounts = types.map((type) => ({
      type,
      count: filteredData.filter((d) => d['Electric Vehicle Type'] === type)
        .length,
    }));

    // Summing up the counts based on the type
    const total = typeCounts.reduce((acc, curr) => acc + curr.count, 0);

    // Calculating the percentages for each type
    const percentages = typeCounts.map((type) => ({
      type: type.type,
      value: (type.count / total) * 100,
    }));

    this.createPieChart(percentages);
  }
}
