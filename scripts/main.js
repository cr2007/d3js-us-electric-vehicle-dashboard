'use strict';

import BarChart from './barChart.js';
import PieChart from './pieChart.js';

console.log(`D3 loaded, version ${d3.version}`);

// Loading data
const loadData = async () => {
  try {
    let data = await d3.csv(
      'data/Electric_Vehicle_Population_Data_Cleaned.csv'
    );

    return data;
  } catch (error) {
    console.error('Error loading data:', error);
    throw error;
  }
};

// Charts
const barChart = new BarChart('#bar-chart');
const pieChart = new PieChart('#pie-chart');

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

// Event listener to search input
document
  .querySelector('.search input')
  .addEventListener('keydown', handleSearch);

// Loading the defaulted data
loadData().then((data) => {
  barChart.renderBarChart(data);
  pieChart.renderPieChart(data);
});
