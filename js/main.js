/**
 * Main Interactions
 */

 document.addEventListener('DOMContentLoaded', function(e) {

	var canvas = document.getElementById('canvas'),
		svg = d3.select(canvas).append('svg'),
		data = null,
		dimensions = [ 'army', 'disease', 'wounds', 'other', 'diseaseRate', 'woundsRate', 'otherRate' ],
		dimensionColor1 = '#ccff88',
		dimensionColor2 = '#99abcd',
		dimensionSelect1 = document.getElementById('dimension-1-select'),
		dimensionSelect2 = document.getElementById('dimension-2-select');

	// Fill a select box with available dimensions
	function populateDimensions(selectEle) {
		var i, option;
		for (var i in dimensions) {
			option = document.createElement('option');
			option.textContent = dimensions[i];
			selectEle.append(option);
		}
	}

	// Setup legends
	document.getElementById('dimension-1-color').style.backgroundColor = dimensionColor1;
	document.getElementById('dimension-2-color').style.backgroundColor = dimensionColor2;
	populateDimensions(dimensionSelect1);
	populateDimensions(dimensionSelect2);

	// Parse data
	d3.csv('Nightingale.csv')
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
			redraw();
			window.addEventListener('resize', debounce(redraw, 500));
		});

	// Draws the diagram
	function redraw() {
		var width = canvas.clientWidth,
			center = width / 2,
			arc = d3.arc();
		svg
			.attrs({
				width: width,
				height: width
			})
			.selectAll('path')
				.data(data)
				.enter()
				.append('path');
		svg.selectAll('text')
			.data(data)
			.enter()
			.append('text');
		svg.selectAll('path').attrs({
			id: function(d, i) {
				return 'a' + i;
			},
			d: function(d, i) {
				var pos = i,
					r = Math.PI / 12;
				return arc({
					innerRadius: 0,
					outerRadius: i * 10,
					startAngle: pos * r,
					endAngle: pos * r + r
				});
			},
			transform: 'translate(' + center + ', ' + center + ')'
		});
		svg
			.selectAll('text')
			.append('textPath').attrs({
				href: function(d, i) {
					return '#a' + i
				}
			}).text('hello');

	}

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

});