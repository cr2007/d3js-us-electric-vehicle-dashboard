# F20DV Group Project

## Course: Data Visualisation and Analytics ([F20DV](https://curriculum.hw.ac.uk/coursedetails/F20DV?termcode=202324))

## Interactive Visualization Dashboard

<div align="center">
  <!-- HTML -->
  <img alt="HTML" title="HyperText Markup Language" src="https://img.shields.io/badge/HTML-informational?style=flat-sqaure&logo=html5&logoColor=white&color=E34F26">
  <!-- CSS -->
  <img alt="CSS" title="Cascading Style Sheets" src="https://img.shields.io/badge/CSS-informational?style=flat-sqaure&logo=css3&logoColor=white&color=1572B6">
  <!-- JavaScript -->
  <img alt="JavaScript" title="JavaScript" src="https://img.shields.io/badge/JavaScript-informational?style=flat-sqaure&logo=javascript&logoColor=black&color=F7DF1E">
  <!-- D3.js -->
  <a href="https://d3js.org/">
    <img alt="D3.js" title="JavaScript library for data visualization" src="https://img.shields.io/badge/D3.js-informational?style=flat-sqaure&logo=d3.js&logoColor=white&color=F9A03C">
  </a>
</div>

---

### Group 10

Team Members:
- Abdul Rehman - @ar225
- Ahmed ElZubair - @ae87
- Chandrashekhar Ramaprasad  @cr2007
- Tamir Forawi - @tf2008

---

## Index


---

## Introduction

As part of our university coursework, we were tasked with designing and developing an interactive visualization application for the dataset of our choice, using HTML, CSS, JavaScript, and the [D3.js](https://d3js.org/) library.

The dataset we chose for this project is the [Electric Vehicles Population Dataset](https://www.kaggle.com/datasets/yashusinghal/electric-vehicle-population-dataset), a publicly available Kaggle dataset that contains information about electric vehicles (EVs) in the United States of America (USA).<br>
It includes data such as the Make, Model, State, Electric Vehicle Type, and the Electric Range of the vehicles.

## Architecture

The application is a data visualization dashboard for electric vehicle data. It uses [D3.js](https://d3js.org/) for creating various types of charts and vanilla JavaScript for data processing and event handling.<br>
The application is styled using CSS and the layout is created using HTML.

### Directory Structure

The project is structured as follows:

- [`data/`](./data/): Constains the [CSV data file](./data/Electric_Vehicle_Population_Data_Cleaned.csv) used for generating the charts.
- [`lib/`](./lib/): Contains the D3.js library file [`d3.v7.min.js`](./lib/d3/d3.v7.min.js)
- [`scripts/`](scripts/): Constains JavaScript file s for each type of chart, connected by the main script file:
  - [`main.js`](./scripts/main.js): Handles data loading, processing, and event handling
  - [`barChart.js`](./scripts/barChart.js): Implements the Bar Chart
  - [`pieChart.js`](./scripts/pieChart.js): Implements the Pie Chart
  - [`stackedBarChart.js`](./scripts/stackedBarChart.js): Implements the Stacked Bar Chart
- [`styles/`](./styles/): Contains CSS files for each type of chart and the [main CSS file](./styles/main.css):
  - [`main.css`](./styles/main.css): Contains the main style and imports other CSS files
- [`index.html`](./index.html): The main HTML file that includes the D3.js library, the main CSS file and placeholders for the charts

---

### Data Processing

The CSV data is loaded and processed in `main.js` via the `d3.csv()` function.

The data processing functions transform the raw data into a format suitable for each type of chart.<br>
The processed data is then passed to the corresponding chart's render function.

### Event Handling

The event handling is also done in the [`main.js`](./scripts/main.js) file.

For example, it includes an event listener for the search input field.<br>
When the user types in the search input field, the data is filtered based on the search query and the charts are updated accordingly.

### Charts

Each chart is implemented as a class in its own JavaScript file.

The classes include a `render` function that takes the processed data and generates the chart.
