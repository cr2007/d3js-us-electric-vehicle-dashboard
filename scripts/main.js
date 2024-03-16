'use strict';

import BarChart from './barChart.js';
import PieChart from './pieChart.js';
import StackedBarChart from './stackedBarChart.js';

console.log(`D3 loaded, version ${d3.version}`);

// Loading data
const loadData = async () => {
  try {
    let data = await d3.csv(
      'data/Electric_Vehicle_Population_Data_Cleaned.csv'
    );

    console.log('Data loaded:', data);

    return data;
  } catch (error) {
    console.error('Error loading data:', error);
    throw error;
  }
};

// Charts
const barChart = new BarChart('#bar-chart');
const pieChart = new PieChart('#pie-chart');
const stackedBarChart = new StackedBarChart('#stacked-bar-chart');

// Helper function to filter data based on the car manufacturer ("Make" column)
const filterCarMake = (data, make) => {
  const filteredData = data.filter((d) =>
    d.Make.toLowerCase().includes(make.toLowerCase())
  );

  // Storing each car model to the set
  const modelSet = new Set();
  filteredData.forEach((d) => modelSet.add(d.Model));

  // Getting the total count of each car model
  const modelCounts = Array.from(modelSet).map((model) => ({
    model,
    count: filteredData.filter((d) => d.Model === model).length,
  }));

  return modelCounts;
};

const handleSearch = (event) => {
  // Search via "Enter"
  if (event.keyCode === 13) {
    const searchInput = document.querySelector('.search input').value.trim();

    loadData().then((data) => {
      // If search input is empty, render bar chart with car makes only
      if (searchInput === '' || searchInput.length === 0) {
        barChart.renderBarChart(data);
        pieChart.renderPieChart(data);
        // Otherwise, filter the data based on the search input
      } else {
        const filteredData = filterCarMake(data, searchInput);
        barChart.renderBarChart(filteredData, true);
        pieChart.renderPieChart(data, searchInput);
      }
    });
  }
};

const processDataForStackedBarChart = (data) => {
  
  // Assuming 'data' is your dataset after loading the CSV
 const rolledUpData = d3.rollups(
   data,
   v => v.length, // This is the reducing function, counting the number of entries
   d => d['Model Year'], // First level of rollup: group by 'Model Year'
   d => d['Electric Vehicle Type'] // Second level of rollup: group by 'Electric Vehicle Type'
 );
 
 // To structure the data for a stacked bar chart, we'll map it into an array of objects
 const structuredData = rolledUpData.map(([year, types]) => {
   const entriesForYear = { year };
   types.forEach(([type, count]) => {
     entriesForYear[type] = count;
   });
   return entriesForYear;
 });

  structuredData.sort((a, b) => d3.ascending(a.year, b.year));

  console.log(structuredData);

  return structuredData;
 
 };

// Event listener to search input
document
  .querySelector('.search input')
  .addEventListener('keydown', handleSearch);

// Loading the defaulted data
loadData().then((data) => {
  const processedStackedData = processDataForStackedBarChart(data);

  barChart.renderBarChart(data);
  pieChart.renderPieChart(data);
  stackedBarChart.renderStackedBarChart(processedStackedData);

});
