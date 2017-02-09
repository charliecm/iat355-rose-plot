/**
 * Main Interactions
 */

 document.addEventListener('DOMContentLoaded', function(e) {

	// Data
	var data,
		dataURL = 'Nightingale.csv',
		dimensions = [ 'army', 'disease', 'wounds', 'other', 'diseaseRate', 'woundsRate', 'otherRate' ];

	// UI
	var canvas = document.getElementById('canvas'),
		svg = d3.select(canvas).append('svg'),
		arc = d3.arc(),
		gWrap,
		gArcLines, gDataArcs1, gDataArcs2, gLabelArcs,
		gDates, gValues1, gValues2,
		labelArcPrefix = 'labelArc',
		lineColor = '#EEE',
		dimensionColor1 = '#1F77B4',
		dimensionColor2 = '#D62728',
		dimensionSelect1 = document.getElementById('dimension-1-select'),
		dimensionSelect2 = document.getElementById('dimension-2-select');

	// https://github.com/jashkenas/underscore/blob/master/underscore.js#L880
	function debounce(func, wait, immediate) {
		var timeout, args, context, timestamp, result;
		var _now = Date.now || function() {
			return new Date().getTime();
		};
		var later = function() {
			var last = _now() - timestamp;
			if (last < wait && last >= 0) {
				timeout = setTimeout(later, wait - last);
			} else {
				timeout = null;
				if (!immediate) {
					result = func.apply(context, args);
					if (!timeout) context = args = null;
				}
			}
		};
		return function() {
			context = this;
			args = arguments;
			timestamp = _now();
			var callNow = immediate && !timeout;
			if (!timeout) timeout = setTimeout(later, wait);
			if (callNow) {
				result = func.apply(context, args);
				context = args = null;
			}
			return result;
		};
	};

	// Fill a select box with available dimensions
	function populateDimensions(selectEle) {
		var i, option;
		for (var i in dimensions) {
			option = document.createElement('option');
			option.textContent = dimensions[i];
			selectEle.append(option);
		}
	}

	// Setup legends UI
	function setupLegends() {
		document.getElementById('dimension-1-color').style.backgroundColor = dimensionColor1;
		document.getElementById('dimension-2-color').style.backgroundColor = dimensionColor2;
		populateDimensions(dimensionSelect1);
		populateDimensions(dimensionSelect2);
		dimensionSelect1.addEventListener('change', redraw);
		dimensionSelect2.addEventListener('change', redraw);
		dimensionSelect1.value = 'disease';
		dimensionSelect2.value = 'wounds';
	}

	// Setup diagram canvas
	function setupDiagram() {
		gWrap = svg.append('g');
		gArcLines = gWrap.append('g');
		gDataArcs1 = gWrap.append('g');
		gDataArcs2 = gWrap.append('g');
		gLabelArcs = gWrap.append('g');
		gDates = gWrap.append('g');
		gValues1 = gWrap.append('g');
		gValues2 = gWrap.append('g');
	}

	// Draws the diagram
	function redraw() {
		var width = canvas.clientWidth,
			radius = width / 2,
			radiusMax = radius - 54,
			segmentAngle = Math.PI / 12,
			dimension1 = dimensionSelect1.value,
			dimension2 = dimensionSelect2.value,
			max = d3.max(data, function(d) {
				return Math.max(d[dimension1], d[dimension2]);
			}),
			scale = d3.scaleLinear().domain([0, max]).range([0, radiusMax]),
			prevYear;
		// Resize
		svg.attrs({
			width: width,
			height: width
		});
		gWrap.attr('transform', 'translate(' + radius + ', ' + radius +')');
		// Arc lines
		gArcLines.selectAll('line')
			.data(data)
			.enter()
				.append('line')
			.merge(gArcLines.selectAll('line'))
				.attrs({
					x1: 0,
					y1: 0,
					x2: function(d, i) {
						return Math.cos(i * segmentAngle - Math.PI/2) * radiusMax;
					},
					y2: function(d, i) {
						return Math.sin(i * segmentAngle - Math.PI/2) * radiusMax;
					},
					stroke: lineColor
				})
			.exit().remove();
		// Data arcs (dimension 1)
		gDataArcs1.selectAll('path')
			.data(data)
			.enter()
				.append('path')
			.merge(gDataArcs1.selectAll('path'))
				.attrs({
					d: function(d, i) {
						var d1 = d[dimension1],
							d2 = d[dimension2],
							isLarger = d1 > d2;
						return arc({
							innerRadius: scale(isLarger ? d2 : 0),
							outerRadius: scale(d1),
							startAngle: i * segmentAngle,
							endAngle: i * segmentAngle + segmentAngle
						});
					},
					fill: dimensionColor1
				})
			.exit().remove();
		// Data arcs (dimension 2)
		gDataArcs2.selectAll('path')
			.data(data)
			.enter()
				.append('path')
			.merge(gDataArcs2.selectAll('path'))
				.attrs({
					d: function(d, i) {
						var d1 = d[dimension1],
							d2 = d[dimension2],
							isLarger = d2 > d3;
						return arc({
							innerRadius: scale(isLarger ? d1 : 0),
							outerRadius: scale(d2),
							startAngle: i * segmentAngle,
							endAngle: i * segmentAngle + segmentAngle
						});
					},
					fill: dimensionColor2
				})
			.exit().remove();
		// Label arcs
		gLabelArcs.selectAll('path')
			.data(data)
			.enter()
				.append('path')
			.merge(gLabelArcs.selectAll('path'))
				.attrs({
					id: function(d, i) {
						return labelArcPrefix + i;
					},
					d: function(d, i) {
						return arc({
							innerRadius: 0,
							outerRadius: radiusMax,
							startAngle: i * segmentAngle,
							endAngle: i * segmentAngle + segmentAngle
						});
					},
					fill: 'none'
				})
			.exit().remove();
		// Dates
		gDates.selectAll('textPath').remove();
		gDates.selectAll('text')
			.data(data)
			.enter()
				.append('text')
			.merge(gDates.selectAll('text'))
				.attr('dy', -38)
				.append('textPath')
					.attrs({
						class: 'diagram__date',
						href: function(d, i) {
							return '#' + labelArcPrefix + i;
						}
					})
					.text(function(d, i) {
						var label = d.month;
						if (d.year != prevYear) {
							prevYear = d.year;
							label += ' ' + d.year;
						}
						return label;
					})
			.exit().remove();
		// Dimension 1 values
		gValues1.selectAll('textPath').remove();
		gValues1.selectAll('text')
			.data(data)
			.enter()
				.append('text')
			.merge(gValues1.selectAll('text'))
				.attr('dy', -22)
				.append('textPath')
					.attrs({
						class: 'diagram__value',
						fill: dimensionColor1,
						href: function(d, i) {
							return '#' + labelArcPrefix + i;
						}
					})
					.attr('class', 'diagram__value')
					.text(function(d, i) {
						return d[dimension1];
					})
			.exit().remove();
		// Dimension 2 values
		gValues2.selectAll('textPath').remove();
		gValues2.selectAll('text')
			.data(data)
			.enter()
				.append('text')
			.merge(gValues2.selectAll('text'))
				.attr('dy', -6)
				.append('textPath')
					.attrs({
						class: 'diagram__value',
						fill: dimensionColor2,
						href: function(d, i) {
							return '#' + labelArcPrefix + i;
						}
					})
					.text(function(d, i) {
						return d[dimension2];
					})
			.exit().remove();
		console.log('Redraw:', dimension1, dimension2);
	}

	// Fetches and parses the data
	function fetch() {
		d3.csv(dataURL)
			.row(function(d, i) {
				return {
					month: d['Month'],
					year: d['Year'],
					army: d['Army'],
					disease: d['Disease'],
					wounds: d['Wounds'],
					other: d['Other'],
					diseaseRate: d['Disease.rate'],
					woundsRate: d['Wounds.rate'],
					otherRate: d['Other.rate'],
				}
			})
			.get(function(d) {
				// Initialize diagram
				data = d;
				setupLegends();
				setupDiagram();
				redraw();
				window.addEventListener('resize', debounce(redraw, 500));
			});
	}

	// Get the ball rolling...
	fetch();

});