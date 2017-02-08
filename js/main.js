/**
 * Main Interactions
 */

 document.addEventListener('DOMContentLoaded', function(e) {

	var canvas = document.getElementById('canvas'),
		svg = d3.select(canvas).append('svg'),
		inpVariable1 = document.getElementById('variable-1')
		inpVariable2 = document.getElementById('variable-2');



	function redraw() {
		svg
			.attrs({
				width: canvas.clientWidth,
				height: 300
			})
			.selectAll('rect').remove();
		svg.append('rect').attrs({
				x: 30,
				y: 30,
				width: 30,
				height: 30,
				color: 'red'
			});
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

	// Initialize
	window.addEventListener('resize', debounce(redraw, 500));
	redraw();

});