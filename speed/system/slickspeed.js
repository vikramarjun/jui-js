//base test functions

function forEach(iterable, fn, bind){
	for (var i = 0, j = iterable.length; i < j; i++) fn.call(bind, iterable[i], i, iterable);
};

//test start

window.onload = function load(){
	
	var frameworks = {};
	
	forEach(document.getElementsByTagName('iframe'), function(iframe){
		frameworks[iframe.name] = {
			'test': window.frames[iframe.name].test,
			'selectors': []
		};
	});
	
	var tbody = document.getElementById('tbody');
	var tfoot = document.getElementById('tfoot');
	var lastrow = tfoot.getElementsByTagName('tr')[0];
	
	var controls = document.getElementById('controls');
	
	var links = controls.getElementsByTagName('a');
	
	var start = links[1];
	var stop = links[0];
	
	start.onclick = function(){
		testRunner();
		return false;
	};
	
	stop.onclick = function(){
		clearTimeout(timer);
		timer = null;
		return false;
	};
	
	var score = [];
	var scores = {};
	
	var frxi = 0;
	for (var name in frameworks){
		var framework = frameworks[name];
		forEach(window.selectors, function(selector){
			framework.selectors.push(selector);
		});
		scores[name] = lastrow.getElementsByTagName('td')[frxi];
		score[name] = 0;
		frxi++;
	}
	
	var tests = [];

	forEach(window.selectors, function(selector, i){
		var frxi = 0;
		var row = tbody.getElementsByTagName('tr')[i];
		for (var name in frameworks){
			var framework = frameworks[name];
			var cell = row.getElementsByTagName('td')[frxi];
			tests.push({
				'execute': framework.test,
				'selector': framework.selectors[i],
				'name': name,
				'row': row,
				'cell' : cell
			});
			frxi++;
		}
	});
	
	var timer = null;
	
	var testRunner = function(){
		var test = tests.shift();
		if (!test) return;
		var results = test.execute(test.selector);
		function handleResults(){
			var ops = results && results.ops || 0;
			test.cell.className = 'test';
			test.cell.innerHTML = '<b>'+Math.round(ops * 10)/10 + ' ops/ms</b><b>' + results.found + ' found</b>';
			test.cell.speed = results.ops || 0;
			if (results.error){
				test.cell.innerHTML = ops + ' ops/s | <span class="exception" title="' + results.error + '">error returned</a>';
				test.cell.className += ' exception';
				test.cell.found = 0;
				test.cell.error = true;
			} else {
				test.cell.found = results.found;
				test.cell.error = false;
			}
			
			score[test.name] += test.cell.speed;
			scores[test.name].innerHTML =  '&nbsp;' + Math.round(score[test.name]) + '&nbsp;';
			
			if (test.cell == test.row.lastChild) colourRow(test.row);
		};
		// setTimeout(handleResults,100);
		handleResults();
		timer = setTimeout(testRunner,0);
	};
	
	var colourRow = function(row){
		
		var cells = [];
		
		var tds = row.getElementsByTagName('td');
		forEach(tds, function(td){
			cells.push(td);
		});
		
		var speeds = [], sum = 0, length = 0;

		forEach(cells, function(cell, i){
			if (!cell.error) {
				sum += cell.speed;
				length++;
				speeds[i] = cell.speed;
			}
			//error, so we exclude it from colouring
			else speeds[i] = 99999999999999999999999;
			
		});
		
		var avg = sum / length;
		
		var min = Math.min.apply(this, speeds);
		var max = Math.max.apply(this, speeds);
		
		var found = [];
		var mismatch = false;
		forEach(cells, function(cell, i){
			found.push(cell.found);
			if (!mismatch){
				forEach(found, function(n){
					if (cell.found && n && cell.found != n){
						mismatch = true;
						return;
					}
				});
			}
			cell.title = cell.firstChild.innerHTML;
			cell.firstChild.innerHTML = (Math.round(cell.speed / avg * 10) / 10) + 'x'
			if (cell.found && cell.speed == max) cell.className += ' good';
			else if (!cell.found) cell.className += ' zero';
			else if (cell.speed == min) cell.className += ' bad';
			else cell.className += ' normal';
		});
		
		if (mismatch){
			forEach(cells, function(cell, i){
				if (cell.found) cell.className += ' mismatch';
			});
		}
		
	};
	

};
