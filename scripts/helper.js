// Flexible implementation of axis labels to be easily modified on all charts
export const axisLabel = ({
  axisGroup,
  orientation,
  height,
  width,
  y,
  text,
  fontSize = '16px',
}) => {
  const label = axisGroup
    .append('text')
    .attr('class', 'axis-label')
    .style('font-size', fontSize)
    .style('font-weight', '500')
    .text(text);

  if (orientation === 'y') {
    label
      .attr('transform', 'rotate(-90)')
      .attr('y', y)
      .attr('x', -(height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle');
  } else {
    label
      .attr('x', width / 2)
      .attr('y', y)
      .style('text-anchor', 'middle');
  }
};

// Tooltip hover handlers to be used on all charts
export const mouseoverHandler =
  (tooltip, getContent, scale = 0.85) =>
  (event, d) => {
    tooltip.transition().duration(200).style('opacity', 0.9);
    const content = getContent(d);

    tooltip
      .html(content)
      .style('left', `${event.pageX / scale}px`)
      .style('top', `${event.pageY / scale - 50}px`);

    d3.select(event.currentTarget)
      .style('stroke', 'black')
      .style('stroke-width', '2')
      .style('opacity', 0.5);
  };

export const mouseoutHandler = (tooltip) => (event) => {
  tooltip.transition().duration(500).style('opacity', 0);

  d3.select(event.target)
    .style('stroke', 'none')
    .style('stroke-width', '0')
    .style('opacity', 1);
};

/**
 * Populates the content of a dropdown with checkboxes for each unique value in a specified column of the data.
 *
 * @param {Object} options - The options for populating the dropdown.
 * @param {Array} options.data - The data array, where each element is an object that includes a property with the name specified by options.columnName.
 * @param {string} options.columnName - The name of the column in the data to get the unique values from.
 * @param {string} options.dropdownId - The ID of the dropdown.
 * @param {string} options.dropdownContent - The class of the dropdown content.
 * @param {Function} options.onChange - The event handler for the 'change' event of the checkboxes.
 */
export const populateDropdownContent = ({
  data,
  columnName,
  dropdownId,
  dropdownContent,
  onChange,
}) => {
  // Select the dropdown content
  const dropdown = d3.select(`#${dropdownId}`).select(`.${dropdownContent}`);

  // Remove all existing children of the dropdown content
  dropdown.selectAll('*').remove();

  // Get the unique values in the specified column of the data
  const colValues = [...new Set(data.map((d) => d[columnName]))];

  // For each unique value, append a label with a checkbox and a span to the dropdown content
  colValues.map((val) => {
    // Append a label to the dropdown content
    const label = dropdown.append('label');

    // Append a checkbox to the label, set its type, checked state, value, and 'change' event handler
    label
      .append('input')
      .attr('type', 'checkbox')
      .attr('checked', true)
      .attr('value', val)
      .on('change', onChange);

    // Append a span to the label and set its text
    label.append('span').text(val);
  });
};


/**
 * Gets the car makes that are checked in a dropdown.
 *
 * If no car makes are checked, it returns all car makes from the data.
 *
 * @param {Array} data - The data array, where each element is an object that includes a 'Make' property.
 * @param {string} dropdownId - The ID of the dropdown.
 * @returns {Array} The array of checked car makes.
 */
export const getCheckedCarMakes = (data, dropdownId) => {
  // Select all checked checkboxes in the dropdown and get their values
  let makes = d3
    .selectAll(`#${dropdownId} input[type='checkbox']:checked`) // Select all checked checkboxes in the dropdown
    .nodes() // Get the nodes of the selection
    .map((el) => el.value); // Get the value of each node

  // If no checkboxes are checked, get all car makes from the data
  if (makes.length === 0) {
    makes = [...new Set(data.map((d) => d.Make))]; // Get all unique car makes from the data
  }

  // Return the array of car makes
  return makes;
};
