// import * as d3 from 'd3';

export default class GeoMap {
    constructor(svgSelector) {
        this.svgSelector = svgSelector;
    }

    renderMap() {
        const svg = d3.select(this.svgSelector),
            width = +svg.attr("width"),
            height = +svg.attr("height");

        const projection = d3.geoMercator()
            .center([2, 47])
            .scale(1020)
            .translate([width / 2, height / 2]);

        const markers = [
            { long: -120.011515, lat: 42.149 },
            { long: 7.26, lat: 43.71 },
            { long: 2.349, lat: 48.864 },
            { long: -1.397, lat: 43.664 },
            { long: 3.075, lat: 50.640 },
            { long: -3.83, lat: 58 },
        ];

        d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then((data) => {
            data.features = data.features.filter(d => d.properties.name == "France");

            svg.append("g")
                .selectAll("path")
                .data(data.features)
                .join("path")
                .attr("fill", "#b8b8b8")
                .attr("d", d3.geoPath()
                    .projection(projection)
                )
                .style("stroke", "black")
                .style("opacity", .3);

            svg
                .selectAll("myCircles")
                .data(markers)
                .join("circle")
                .attr("cx", d => projection([d.long, d.lat])[0])
                .attr("cy", d => projection([d.long, d.lat])[1])
                .attr("r", 14)
                .style("fill", "69b3a2")
                .attr("stroke", "#69b3a2")
                .attr("stroke-width", 3)
                .attr("fill-opacity", .4);
        });
    }
}