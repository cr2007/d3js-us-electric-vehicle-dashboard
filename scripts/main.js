'use strict';

import BarChart from './barChart.js';
import PieChart from './pieChart.js';
import StackedBarChart from './stackedBarChart.js';
import LineChart from './lineChart.js';

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
barChart.dropdownId = 'bc-dropdown';

const pieChart = new PieChart('#pie-chart');
const stackedBarChart = new StackedBarChart('#stacked-bar-chart');
const lineChart = new LineChart('#line-chart');

const handleSearch = (event) => {
  // Search via "Enter"
  if (event.keyCode === 13) {
    const searchInput = document.querySelector('.search input').value.trim();

    loadData().then((data) => {
      // If search input is empty, render bar chart with the car makes only
      if (searchInput === '' || searchInput.length === 0) {
        barChart.populateDropdownWithCheckboxes(
          data,
          'Make',
          barChart.dropdownId
        );
        barChart.renderBarChart(data, false);
        pieChart.renderPieChart(data);
        stackedBarChart.renderStackedBarChart(
          processDataForStackedBarChart(data)
        );
        lineChart.renderLineChart(processDataForLineChart(data));

        // Otherwise, filter the data based on the search input
      } else {
        const modelCounts = barChart.filterCarModel(data, searchInput);

        barChart.renderBarChart(modelCounts, true);
        pieChart.renderPieChart(data, searchInput);

        lineChart.renderLineChart(processDataForLineChart(data), searchInput);
      }
    });
  }
};

const processDataForStackedBarChart = (data) => {
  const rolledUpData = d3.rollups(
    data,
    (v) => v.length,
    (d) => d['Model Year'],
    (d) => d['Electric Vehicle Type']
  );

  // Structuring the data for the stacked bar chart
  const structuredData = rolledUpData.map(([year, types]) => {
    const entriesForYear = { year };
    types.forEach(([type, count]) => {
      entriesForYear[type] = count;
    });

    return entriesForYear;
  });

  structuredData.sort((a, b) => d3.ascending(a.year, b.year));

  // console.log('structured bar chart data', structuredData);

  return structuredData;
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

  barChart.renderBarChart(data);
  pieChart.renderPieChart(data);
  stackedBarChart.renderStackedBarChart(processedStackedData);

  lineChart.populateDropdown(data);
  lineChart.renderLineChart(processedLineData);

  barChart.populateDropdownWithCheckboxes(data, 'Make', barChart.dropdownId);
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
