'use strict';

import BarChart from './barChart.js';
import PieChart from './pieChart.js';
import StackedBarChart from './stackedBarChart.js';
import LineChart from './LineChart.js';
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

// Search functionality
const handleSearch = (event) => {
  // Search via "Enter"
  if (event.keyCode === 13) {
    const searchInput = document.querySelector('.search input').value.trim();

    loadData().then((data) => {
      // If search input is empty, render bar chart with the car makes only
      if (searchInput === '' || searchInput.length === 0) {
        barChart.renderBarChart(data, false);
        pieChart.renderPieChart(data);
        stackedBarChart.renderStackedBarChart(
          processDataForStackedBarChart(data)
        );
        lineChart.renderLineChart(processDataForLineChart(data));
        groupedChart.renderGroupedBarChart(processDataForgroupedBarChart(data));
        scatterPlot.render(processScatterData(data));

        // Otherwise, filter the data based on the search input
      } else {
        const modelCounts = barChart.filterCarModel(data, searchInput);

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

document
  .querySelector('.search input')
  .addEventListener('keydown', handleSearch);

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

const processDataForgroupedBarChart = (data, searchTerm) => {
  const filteredData = searchTerm
    ? data.filter((d) =>
        d.Make.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : data;

  const rolledUpData = d3.rollups(
    filteredData,
    (v) => v.length,
    (d) => d['Model Year'],
    (d) => d['Clean Alternative Fuel Vehicle (CAFV) Eligibility']
  );

  const structuredDataArray = rolledUpData.map(([year, types]) => {
    const groups = types.map(([type, count]) => ({
      grp: type,
      count,
    }));

    const ttl = groups.reduce((sum, group) => sum + group.count, 0);

    return { year, groups, ttl };
  });

  // Sort by year in ascending order
  structuredDataArray.sort((a, b) => b.year - a.year);

  const adaptedStructure = structuredDataArray.map(({ year: yr, groups }) => ({
    yr,
    groups: groups.map(({ grp, count }) => ({ grp, count })),
  }));

  console.log('THIS IS SPARTA:', adaptedStructure);
  return adaptedStructure;
};

const processDataForLineChart = (data) => {
  const makes = Array.from(new Set(data.map((d) => d.Make)));

  const years = Array.from(new Set(data.map((d) => d['Model Year']))).sort(
    d3.ascending
  );

  const structuredData = makes.map((make) => {
    const values = years.map((year) => {
      const count = data.filter(
        (d) => d.Make === make && d['Model Year'] === year
      ).length;
      return { year, count };
    });
    return { make, values };
  });

  return structuredData;
};

// Event listener to search input
document
  .querySelector('.search input')
  .addEventListener('keydown', handleSearch);

// Loading the defaulted data
loadData().then((data) => {
  const processedStackedData = processDataForStackedBarChart(data);
  const processedLineData = processDataForLineChart(data);
  const processedGroupedData = processDataForgroupedBarChart(data);
  const processedScatterData = processScatterData(data);

  barChart.renderBarChart(data);
  pieChart.renderPieChart(data);
  stackedBarChart.renderStackedBarChart(processedStackedData);
  groupedChart.renderGroupedBarChart(processedGroupedData);
  scatterPlot.render(processedScatterData);
  lineChart.renderLineChart(processedLineData);

  populateDropdownContent({
    data,
    columnName: 'Make',
    dropdownId: 'lc-dropdown-content',
    dropdownContent: 'line-chart-dropdown-content',
    onChange: () => lineChart.updateChart(data),
  });

  populateDropdownContent({
    data,
    columnName: 'Make',
    dropdownId: 'bc-dropdown-content',
    dropdownContent: 'bar-chart-dropdown-content',
    onChange: () => barChart.renderBarChart(data, false),
  });
});

document
  .querySelector('.bar-chart-dropdown-btn')
  .addEventListener('click', (event) => {
    event.currentTarget.parentElement.classList.toggle('active');
  });

document
  .querySelector('.line-chart-dropdown-btn')
  .addEventListener('click', () => {
    document.getElementById('lc-dropdown-content').classList.toggle('show');
  });
