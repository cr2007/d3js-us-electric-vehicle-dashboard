// Mouse hover functions to be used for each chart
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

// Used to display the dropdown content
export const populateDropdownContent = ({
  data,
  columnName,
  dropdownId,
  dropdownContent,
  onChange,
}) => {
  const dropdown = d3.select(`#${dropdownId}`).select(`.${dropdownContent}`);

  dropdown.selectAll('*').remove();

  const colValues = [...new Set(data.map((d) => d[columnName]))];

  colValues.map((val) => {
    const label = dropdown.append('label');

    label
      .append('input')
      .attr('type', 'checkbox')
      .attr('checked', true)
      .attr('value', val)
      .on('change', onChange);

    label.append('span').text(val);
  });
};

// Used for applying all Car Makes as checked by default
export const getCheckedCarMakes = (data, dropdownId) => {
  let makes = d3
    .selectAll(`#${dropdownId} input[type='checkbox']:checked`)
    .nodes()
    .map((el) => el.value);

  if (makes.length === 0) {
    makes = [...new Set(data.map((d) => d.Make))];
  }

  return makes;
};
