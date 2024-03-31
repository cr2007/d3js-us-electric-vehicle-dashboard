'use strict';

import BarChart from './barChart.js';
import PieChart from './pieChart.js';
import StackedBarChart from './stackedBarChart.js';
import LineChart from './lineChart.js';
import GroupedChart from './groupedChart.js';


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
const groupedChart = new GroupedChart('#grouped-chart');


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
        stackedBarChart.renderStackedBarChart(processDataForStackedBarChart(data));
        lineChart.renderLineChart(processDataForLineChart(data));

        // Otherwise, filter the data based on the search input
      } else {
        const modelCounts = barChart.filterCarModel(data, searchInput);

        barChart.renderBarChart(modelCounts, true);
        pieChart.renderPieChart(data, searchInput);
        lineChart.renderLineChart(processDataForLineChart(data), searchInput);
        stackedBarChart.renderStackedBarChart(processDataForStackedBarChart(data, searchInput));

      }
    });
  }
};

document.querySelector('.search input').addEventListener('keydown', handleSearch);

const processDataForStackedBarChart = (data, searchTerm) => {

  const filteredData = searchTerm ? data.filter(d => d.Make.toLowerCase().includes(searchTerm.toLowerCase())) : data;

  const rolledUpData = d3.rollups(
    filteredData,
    (v) => v.length,
    (d) => d['Model Year'],
    (d) => d['Electric Vehicle Type']
  );

  const structuredData = rolledUpData.map(([year, types]) => {
    const entriesForYear = { year, 'Battery Electric Vehicle (BEV)': 0, 'Plug-in Hybrid Electric Vehicle (PHEV)': 0 };
    types.forEach(([type, count]) => {
      entriesForYear[type] = count;
    });

    return entriesForYear;
  });

  structuredData.sort((a, b) => d3.ascending(a.year, b.year));

  return structuredData;

};

const processDataForgrouprdBarChart = (data) => {
  const rolledUpData = d3.rollups(
    data,
    (v) => v.length,
    (d) => d['Model Year'],
    (d) => d['Clean Alternative Fuel Vehicle (CAFV) Eligibility']
  );

  const structuredDataArray = rolledUpData.map(([year, types]) => {
    const groups = types.map(([type, count]) => ({
      grp: type,
      count
    }));

    const ttl = groups.reduce((sum, group) => sum + group.count, 0);

    return { year, groups, ttl };
  });

  structuredDataArray.sort((a, b) => b.ttl - a.ttl);

  const adaptedStructure = structuredDataArray.map(({ year: yr, groups }) => ({
    yr,
    groups: groups.map(({ grp, count }) => ({ grp, count }))
  }));

  console.log("THIS IS SPARTA:", adaptedStructure);
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
  const processedGroupedData = processDataForgrouprdBarChart(data);


  barChart.renderBarChart(data);
  pieChart.renderPieChart(data);
  stackedBarChart.renderStackedBarChart(processedStackedData);
  groupedChart.renderGroupedBarChart(processedGroupedData);


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