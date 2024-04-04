export default class Map{

    width; height;

    svg; mapGroup; pointGroup;
    projection; pathGen;

    zoom;

    regions;
    data;

    // constructor
    constructor(container, width, height){
        this.width = width;
        this.height = height;

        d3.select(this.svgSelector).selectAll('*').remove();

        // setting up selections
        this.svg = d3.select(container).append('svg')
            .classed('vis map', true)
            .attr('width', width)
            .attr('height', height);
        this.mapGroup = this.svg.append('g')
            .classed('map', true);
        this.pointGroup = this.svg.append('g')
            .classed('points', true);

        // setting the zoom
        this.#setZoom();
    }

    // function to set the zoom behaviour
    #setZoom(){
        this.zoom = d3.zoom()
            .extent([[0,0], [this.width,this.height]])
            .translateExtent([[0,0], [this.width,this.height]])
            .scaleExtent([1,8])
            .on('zoom', ({transform})=>{
                // applies transform and call render map to update zoom scales
                this.mapGroup.attr('transform', transform);
                this.pointGroup.attr('transform', transform);
            })
        this.svg.call(this.zoom)
    }

    // function to render the base map
    #renderMap(projection){
        this.projection = projection()
            .fitSize([this.width,this.height], this.regions)
            .clipExtent([[0,0], [this.width,this.height]]);
        this.pathGen = d3.geoPath()
            .pointRadius(4)
            .projection(this.projection);

        // Filter the regions to include only USA
        let usaRegions = this.regions.features.filter(feature => feature.properties.name === 'United States of America');

        this.mapGroup.selectAll('path.regions')
            .data(usaRegions)
            .join('path')
            .classed('regions', true)
            .attr('d', this.pathGen);
    }

    #renderPoints() {
        this.pointGroup.selectAll('circle.point')
            .data(this.data)
            .join('circle')
            .classed('point', true)
            .attr('cx', d => this.projection([d[0],d[1]])[0])
            .attr('cy', d => this.projection([d[0],d[1]])[1])
            .attr('r', d => 1)
            .attr('opacity', 0.5);
    }

    // Renders a base (background) map
    baseMap(regions=[], projection=d3.geoEqualEarth){
        this.regions = regions;
        this.#renderMap(projection);
        return this;
    }

    // Renders points on the map
    // dataset should be in format [[lat,lon,val],...]
    renderPoints(dataset){
        this.data = dataset;
        this.#renderPoints();
        return this;
    }
}