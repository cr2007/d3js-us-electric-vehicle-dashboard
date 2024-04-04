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

// Used for displaying the dropdown content
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

// Applying all Car Makes as checked by default
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
