/**
 * Class representing a Map visualization.
 */
export default class Map {

    width; height;

    svg; mapGroup; pointGroup;
    projection; pathGen;

    zoom;

    regions;
    data;

    /**
     * Create a Map visualization.
     * @param {string} container - The DOM element to append the SVG to.
     * @param {number} width - The width of the SVG.
     * @param {number} height - The height of the SVG.
     */
    constructor(container, width, height) {
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


    /**
     * Sets the zoom behavior for the map.
     * @private
     */
    #setZoom() {
        // Initialize the zoom behavior with D3's zoom function
        this.zoom = d3.zoom()
            // Set the extent of the zoom, which is the area that can be zoomed
            .extent([[0,0], [this.width,this.height]])
            // Set the translate extent, which is the area that can be panned
            .translateExtent([[0,0], [this.width,this.height]])
            // Set the scale extent, which is the range of scales that can be applied
            .scaleExtent([1,8])
            // Set the zoom event handler
            .on('zoom', ({transform})=>{
                // Apply the zoom transform to the map group
                this.mapGroup.attr('transform', transform);
                // Apply the zoom transform to the point group
                this.pointGroup.attr('transform', transform);
            })

        // Call the zoom behavior on the SVG to enable zooming
        this.svg.call(this.zoom)
    }


    /**
     * Renders the base map.
     * Sets the projection and path generator, filters the regions to include only USA, and appends paths for the regions to the map group.
     *
     * @private
     * @param {function} projection - The D3 projection to use for the map.
     */
    #renderMap(projection) {
        // Set the projection with the provided D3 projection function
        // Fit the projection to the size of the SVG and clip it to the extent of the SVG
        this.projection = projection()
            .fitSize([this.width,this.height], this.regions)
            .clipExtent([[0,0], [this.width,this.height]]);

        // Set the path generator with D3's geoPath function
        // Set the point radius to 4 and the projection to the previously set projection
        this.pathGen = d3.geoPath()
            .pointRadius(4)
            .projection(this.projection);

        // Filter the regions to include only USA
        let usaRegions = this.regions.features.filter(feature => feature.properties.name === 'United States of America');

        // Select all paths with the class "regions" in the map group, bind the USA regions data to them, join them, and set their attributes
        this.mapGroup.selectAll('path.regions')
            .data(usaRegions)
            .join('path')
            .classed('regions', true)
            .attr('d', this.pathGen);
    }


    /**
     * Renders points on the map.
     * Binds the data to circles, joins them, sets their class, and sets their attributes.
     *
     * @private
     */
    #renderPoints() {
        // Select all circles with the class "point" in the point group
        // Bind the data to them
        this.pointGroup.selectAll('circle.point')
            .data(this.data)
            .join('circle')         // Join the data with the selection
            .classed('point', true) // Set the class of the circles to "point"
            // Set the x-coordinate of the circles based on the first element of the data array and the projection
            .attr('cx', d => this.projection([d[0],d[1]])[0])
            // Set the y-coordinate of the circles based on the second element of the data array and the projection
            .attr('cy', d => this.projection([d[0],d[1]])[1])
            .attr('r', d => 1)     // Set the radius of the circles to 1
            .attr('opacity', 0.5); // Set the opacity of the circles to 0.5
    }


    /**
     * Renders a base (background) map.
     * Sets the regions property, calls the private renderMap method, and returns the Map object for method chaining.
     *
     * @param {Array} regions - The GeoJSON features to render as the base map. Defaults to an empty array.
     * @param {function} projection - The D3 projection to use for the map. Defaults to d3.geoEqualEarth.
     * @returns {Map} The Map object.
     */
    baseMap(regions=[], projection=d3.geoEqualEarth) {
        this.regions = regions;      // Set the regions property with the provided regions
        this.#renderMap(projection); // Call the private renderMap method with the provided projection
        return this;                 // Return the Map object for method chaining
    }


    /**
     * Renders points on the map.
     * Sets the data property, calls the private renderPoints method, and returns the Map object for method chaining.
     *
     * @param {Array} dataset - The data to render as points. Should be in the format [[lat,lon,val],...].
     * @returns {Map} The Map object.
     */
    renderPoints(dataset) {
        // Set the data property with the provided dataset
        this.data = dataset;
        // Call the private renderPoints method
        this.#renderPoints();
        // Return the Map object for method chaining
        return this;
    }
}