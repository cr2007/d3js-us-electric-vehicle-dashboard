export default class GroupedBarChart {
  constructor(svgSelector) {
      this.svgSelector = svgSelector;
  }

  renderGroupedBarChart(data) {
      // Assume keys are the unique grp values in your dataset
      const keys = data.reduce((acc, d) => {
          d.groups.forEach(g => {
              if (acc.indexOf(g.grp) === -1) {
                  acc.push(g.grp);
              }
          });
          return acc;
      }, []);

      // Dimensions and margins
      const margin = { top: 20, right: 20, bottom: 40, left: 80 };
      const width = 700 - margin.left - margin.right;
      const height = 550 - margin.top - margin.bottom;

      // Scales - adapted for the new data structure
      const yScale = d3.scaleBand()
                       .rangeRound([0, height])
                       .paddingInner(0.1)
                       .domain(data.map(d => d.yr));

      const xScale = d3.scaleLinear()
                       .rangeRound([0, width])
                       .domain([0, d3.max(data, d => d3.max(d.groups.map(g => g.count)))]).nice();

      const colorScale = d3.scaleOrdinal()
                           .domain(keys)
                           .range(['#f5a067', '#5E3FBE']);


      d3.select(this.svgSelector).selectAll("*").remove();

      // Append SVG to the body
      const svg = d3.select(this.svgSelector)
                    .attr('width', width + margin.left + margin.right)
                    .attr('height', height + margin.top + margin.bottom)
                    .append('g')
                    .attr('transform', `translate(${margin.left},${margin.top})`);

      // Axis
      const yAxis = d3.axisLeft(yScale);
      const xAxis = d3.axisBottom(xScale);

      svg.append('g').call(yAxis);
      svg.append('g').attr('transform', `translate(0,${height})`).call(xAxis);

      const barGroups = svg.selectAll('.bar-group')
          .data(data)
          .enter()
          .append('g')
          .attr('class', 'bar-group')
          .attr('transform', d => `translate(0,${yScale(d.yr)})`);

      const barWidth = yScale.bandwidth() / keys.length;

      data.forEach(d => {
          const group = svg.selectAll(`.bar-group-${d.yr}`)
              .data(d.groups)
              .enter()
              .append('rect')
              .attr('x', (g) => xScale(0))
              .attr('y', (g) => yScale(d.yr) + keys.indexOf(g.grp) * barWidth)
              .attr('width', (g) => xScale(g.count))
              .attr('height', barWidth)
              .attr('fill', (g) => colorScale(g.grp));
      });

      const tooltip = d3.select("body").append("div")
                        .attr("class", "tooltip")
                        .style("opacity", 0);

      svg.selectAll('rect')
         .on("mouseover", function(event, d) {
             tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
             tooltip.html(`...`)
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px");
         })
         .on("mouseout", function() {
             tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
         });
  }
}
