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
		gWrap, gDataArcs, gLabelArcs, gLabels,
		labelArcPrefix = 'labelArc',
		dimensionColor1 = '#1F77B4',
		dimensionColor2 = '#E377C2',
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
		gDataArcs = gWrap.append('g').selectAll('path').data(data);
		gLabelArcs = gWrap.append('g').selectAll('path').data(data);
		gLabels = gWrap.append('g').selectAll('text').data(data);
	}

	// Draws the diagram
	function redraw() {
		var width = canvas.clientWidth,
			radius = width / 2,
			maxRadius = radius - 32,
			dimension1 = dimensionSelect1.value,
			dimension2 = dimensionSelect2.value;
		console.log('Redraw:', dimension1, dimension2);
		// Resize
		svg.attrs({
			width: width,
			height: width
		});
		gWrap.attr('transform', 'translate(' + radius + ', ' + radius +')');
		// Data arcs
		gDataArcs
			.enter()
				.append('path')
			.merge(gDataArcs)
				.attrs({
					d: function(d, i) {
						var r = Math.PI / 12;
						return arc({
							innerRadius: 30,
							outerRadius: 200 + i * 6,
							startAngle: i * r,
							endAngle: i * r + r
						});
					},
					fill: dimensionColor1
				})
			.exit().remove();
		// Label arcs
		gLabelArcs
			.enter()
				.append('path')
			.merge(gLabelArcs)
				.attrs({
					id: function(d, i) {
						return labelArcPrefix + i;
					},
					d: function(d, i) {
						var r = Math.PI / 12;
						return arc({
							innerRadius: 0,
							outerRadius: maxRadius,
							startAngle: i * r,
							endAngle: i * r + r
						});
					},
					fill: 'none'
				})
			.exit().remove();
		// Labels
		gLabels
			.enter(gLabels)
				.append('text')
			.merge(gLabels)
				.attr('dy', -4)
				.append('textPath')
					.attrs({
						href: function(d, i) {
							return '#' + labelArcPrefix + i;
						}
					})
					.text(function(d, i) {
						return d.month + ' ' + d.year;
					})
			.exit().remove();
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