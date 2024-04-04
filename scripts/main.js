'use strict';

import BarChart from './barChart.js';
import PieChart from './pieChart.js';
import StackedBarChart from './stackedBarChart.js';
import LineChart from './lineChart.js';
import GroupedChart from './groupedChart.js';
import ScatterPlot from './scatterPlot.js';

import { populateDropdownContent } from './helper.js';

console.log(`D3 loaded, version ${d3.version}`);

/**
 * Asynchronously loads data from a CSV file using D3's csv function.
 * Logs the loaded data to the console.
 *
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of objects representing the loaded data.
 * Each object corresponds to a row in the CSV file, and its properties correspond to the columns.
 * @throws {Error} If there is an error loading the data, the function will log the error to the console and re-throw it.
 */
const loadData = async () => {
  try {
    // Use D3's csv function to load the data from the CSV file
    // This function returns a promise that resolves to an array of objects
    let data = await d3.csv(
      'data/Electric_Vehicle_Population_Data_Cleaned.csv'
    );

    // Log the loaded data to the console
    console.log('Data loaded:', data);

    return data; // Return the loaded data
  } catch (error) {
    // If there is an error loading the data, log the error to the console
    console.error('Error loading data:', error);

    // Re-throw the error so it can be caught and handled by the caller
    throw error;
  }
};

// Charts
const barChart = new BarChart('#bar-chart');
const pieChart = new PieChart('#pie-chart');
const stackedBarChart = new StackedBarChart('#stacked-bar-chart');
const lineChart = new LineChart('#line-chart');
const groupedChart = new GroupedChart('#grouped-chart');
const scatterPlot = new ScatterPlot('#scatter-plot');

/**
 * Handles the search functionality.
 * When the "Enter" key is pressed, the function loads the data, filters it based on the search input, and renders the charts.
 *
 * @param {KeyboardEvent} event - The event object. The function checks the keyCode property to determine if the "Enter" key was pressed.
 */
const handleSearch = (event) => {
  // Check if the "Enter" key was pressed
  if (event.keyCode === 13) {
    // Get the value of the search input and trim any leading or trailing whitespace
    const searchInput = document.querySelector('.search input').value.trim();

    // Load the data
    loadData().then((data) => {
      // If the search input is empty, render the charts with the unfiltered data
      if (searchInput === '' || searchInput.length === 0) {
        barChart.renderBarChart(data, false);
        pieChart.renderPieChart(data);
        stackedBarChart.renderStackedBarChart(
          processDataForStackedBarChart(data)
        );
        lineChart.renderLineChart(processDataForLineChart(data));
        groupedChart.renderGroupedBarChart(processDataForgroupedBarChart(data));
        scatterPlot.render(processScatterData(data));

      // If the search input is not empty, filter the data based on the search input and render the charts with the filtered data
      } else {
        // Filter the data based on the search input
        const modelCounts = barChart.filterCarModel(data, searchInput);

        // Render the charts with the filtered data
        barChart.renderBarChart(modelCounts, true);
        pieChart.renderPieChart(data, searchInput);
        lineChart.renderLineChart(processDataForLineChart(data), searchInput);
        stackedBarChart.renderStackedBarChart(
          processDataForStackedBarChart(data, searchInput)
        );
        groupedChart.renderGroupedBarChart(
          processDataForgroupedBarChart(data, searchInput)
        );
        scatterPlot.render(processScatterData(data, searchInput));
      }
    });
  }
};

/**
 * Adds a 'keydown' event listener to the search input field.
 * When a key is pressed down in the search input field, the `handleSearch` function is called.
 */
document
  .querySelector('.search input') // Select the search input field
  .addEventListener('keydown', handleSearch); // Add a 'keydown' event listener that calls the `handleSearch` function


const processDataForStackedBarChart = (data, searchTerm) => {
  const filteredData = searchTerm
    ? data.filter((d) =>
        d.Make.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : data;

  const rolledUpData = d3.rollups(
    filteredData,
    (v) => v.length,
    (d) => d['Model Year'],
    (d) => d['Electric Vehicle Type']
  );

  const structuredData = rolledUpData.map(([year, types]) => {
    const entriesForYear = {
      year,
      'Battery Electric Vehicle (BEV)': 0,
      'Plug-in Hybrid Electric Vehicle (PHEV)': 0,
    };
    types.forEach(([type, count]) => {
      entriesForYear[type] = count;
    });

    return entriesForYear;
  });

  structuredData.sort((a, b) => d3.ascending(a.year, b.year));

  return structuredData;
};


/**
 * Processes the provided data to structure it for a scatter plot.
 * Filters the data based on a search term, extracts unique years and electric ranges,
 * and calculates the average electric range for each year.
 *
 * @param {Array<Object>} data - The data to process. Each object should have a "Make", "Model Year", and "Electric Range" property.
 * @param {string} searchTerm - The term to filter the data by. Only objects where the "Make" includes the search term will be included.
 * @returns {Array<Array<number>>} An array of arrays where each sub-array represents a data point in the format [year, averageElectricRange].
 */
const processScatterData = (data, searchTerm) => {
  // Filter the data based on the search term, if provided
  const filteredData = searchTerm
    ? data.filter((d) =>
        d.Make.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : data;

  // Extract the unique "Model Year" values from the filtered data and sort them in ascending order
  const years = Array.from(
    new Set(filteredData.map((d) => d['Model Year']))
  ).sort(d3.ascending);

  // Extract the unique "Electric Range" values from the filtered data and sort them in ascending order
  const range = Array.from(
    new Set(filteredData.map((d) => d['Electric Range']))
  ).sort(d3.ascending);

  // For each unique year, calculate the average "Electric Range" for that year
  const structuredData = years.map((year) => {
    // Filter the data to get the objects for the current year
    const yearData = filteredData.filter((d) => d['Model Year'] === year);

    // Calculate the sum of the "Electric Range" values for the current year
    const sum = yearData.reduce(
      (acc, curr) => acc + parseInt(curr['Electric Range']),
      0
    );

    // Calculate the average "Electric Range" for the current year
    const average = sum / yearData.length;

    // Return the year and the average as a data point
    return [year, average];
  });

  // Return the structured data
  return structuredData;
};


/**
 * Processes the provided data to structure it for a grouped bar chart.
 *
 * Filters the data based on a search term, groups the data by year and CAFV eligibility,
 * and calculates the count of each group.
 *
 * @param {Array<Object>} data - The data to process. Each object should have a "Make", "Model Year", and "Clean Alternative Fuel Vehicle (CAFV) Eligibility" property.
 * @param {string} searchTerm - The term to filter the data by. Only objects where the "Make" includes the search term will be included.
 * @returns {Array<Object>} An array of objects where each object represents a year and contains an array of groups with their counts.
 */
const processDataForgroupedBarChart = (data, searchTerm) => {
  // Filter the data based on the search term, if provided
  const filteredData = searchTerm
    ? data.filter((d) =>
        d.Make.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : data;

  // Group the data by "Model Year" and "CAFV Eligibility", and calculate the count of each group
  const rolledUpData = d3.rollups(
    filteredData,
    (v) => v.length,
    (d) => d['Model Year'],
    (d) => d['Clean Alternative Fuel Vehicle (CAFV) Eligibility']
  );

  /**
   * Transforms the rolled up data into a structured data array.
   * Each element of the array represents a year, with an array of groups (types) and their counts, and the total count for the year.
   *
   * @param {Array} rolledUpData - The rolled up data to transform. Each element is an array where the first element is the year and the second element is an array of type-count pairs.
   * @return {Array} The structured data array.
   */
  const structuredDataArray = rolledUpData.map(([year, types]) => {
    // Map each type-count pair to an object with 'grp' as the type and 'count' as the count
    const groups = types.map(([type, count]) => ({
      grp: type,
      count,
    }));

    // Calculate the total count for the current year
    const ttl = groups.reduce((sum, group) => sum + group.count, 0);

    // Return an object representing the year, groups, and total count for the year
    return { year, groups, ttl };
  });

  // Sort the data by year in ascending order
  structuredDataArray.sort((a, b) => b.year - a.year);

  // Adapt the structure of the data to match the expected input format of the grouped bar chart
  const adaptedStructure = structuredDataArray.map(({ year: yr, groups }) => ({
    yr,
    groups: groups.map(({ grp, count }) => ({ grp, count })),
  }));

  // Log the processed data to the console
  console.log('THIS IS SPARTA:', adaptedStructure);

  // Return the processed data
  return adaptedStructure;
};


/**
 * Processes the provided data to structure it for a line chart.
 * Extracts unique makes and years, and calculates the count of each make for each year.
 *
 * @param {Array<Object>} data - The data to process. Each object should have a "Make" and "Model Year" property.
 * @returns {Array<Object>} An array of objects where each object represents a make and contains an array of values with the year and count.
 */
const processDataForLineChart = (data) => {
  // Extract the unique "Make" values from the data
  const makes = Array.from(new Set(data.map((d) => d.Make)));

  // Extract the unique "Model Year" values from the data and sort them in ascending order
  const years = Array.from(new Set(data.map((d) => d['Model Year']))).sort(
    d3.ascending
  );

  // For each unique make, calculate the count of that make for each year
  const structuredData = makes.map((make) => {
    const values = years.map((year) => {
      // Filter the data to get the objects for the current make and year
      const count = data.filter(
        (d) => d.Make === make && d['Model Year'] === year
      ).length;

      // Return the year and the count as a value
      return { year, count };
    });

    // Return the make and the values as a data point
    return { make, values };
  });

  // Return the structured data
  return structuredData;
};


// Event listener to search input
document
  .querySelector('.search input')
  .addEventListener('keydown', handleSearch);


/**
 * Loads the data and processes it for various charts. Then, renders the charts and populates the dropdown content.
 *
 * @returns {Promise} A promise that resolves when the data is loaded and the charts are rendered.
 */
loadData().then((data) => {
  // Process the data for the stacked bar chart
  const processedStackedData = processDataForStackedBarChart(data);
  // Process the data for the line chart
  const processedLineData = processDataForLineChart(data);
  // Process the data for the grouped bar chart
  const processedGroupedData = processDataForgroupedBarChart(data);
  // Process the data for the scatter plot
  const processedScatterData = processScatterData(data);

  // Render the bar chart with the original data
  barChart.renderBarChart(data);
  // Render the pie chart with the original data
  pieChart.renderPieChart(data);
  // Render the stacked bar chart with the processed data
  stackedBarChart.renderStackedBarChart(processedStackedData);
  // Render the grouped bar chart with the processed data
  groupedChart.renderGroupedBarChart(processedGroupedData);
  // Render the scatter plot with the processed data
  scatterPlot.render(processedScatterData);
  // Render the line chart with the processed data
  lineChart.renderLineChart(processedLineData);

  // Populate the dropdown content for the line chart
  populateDropdownContent({
    data,
    columnName: 'Make',
    dropdownId: 'lc-dropdown-content',
    dropdownContent: 'line-chart-dropdown-content',
    // Update the line chart when the dropdown selection changes
    onChange: () => lineChart.updateChart(data),
  });

  // Populate the dropdown content for the bar chart
  populateDropdownContent({
    data,
    columnName: 'Make',
    dropdownId: 'bc-dropdown-content',
    dropdownContent: 'bar-chart-dropdown-content',
    // Render the bar chart when the dropdown selection changes
    onChange: () => barChart.renderBarChart(data, false),
  });
});


// Add an event listener to the button that toggles the bar chart dropdown
document
  .querySelector('.bar-chart-dropdown-btn') // Select the button
  .addEventListener('click', (event) => { // Add a click event listener
    // Toggle the 'active' class on the parent element of the button
    // This will show or hide the dropdown content when the button is clicked
    event.currentTarget.parentElement.classList.toggle('active');
  });

// Add an event listener to the button that toggles the line chart dropdown
document
  .querySelector('.line-chart-dropdown-btn') // Select the button
  .addEventListener('click', () => { // Add a click event listener
    // Toggle the 'show' class on the dropdown content
    // This will show or hide the dropdown content when the button is clicked
    document.getElementById('lc-dropdown-content').classList.toggle('show');
  });
