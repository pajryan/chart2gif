

import d3 from 'd3';
var spData = require('./data/sp-500.json');

var createQueue = require('d3-queue');


var path;
var outer;
var margin = {top: 20, right: 20, bottom: 20, left: 20},
	outerWidth = 300,
	outerHeight = 250,
	width = outerWidth - margin.left - margin.right,
	height = outerHeight - margin.top - margin.bottom,
	frames = 4,//40,
	duration = 2000;



export const init = (target) => {
	document.getElementById('dataEdit').value=JSON.stringify(spData);
  	// buildChart();
};



export const buildGif = () => {

	var doDownload = document.getElementById('in_doDownload').checked;


	//get the frame count and duration from the UI (and validate)
	var inFrames = document.getElementById('in_frames').value;
	var inDuration = document.getElementById('in_duration').value;
	if(isInt(inFrames)){
		frames = inFrames;
	}else{
		document.getElementById('in_frames').value = frames;
	}

	if(isInt(inDuration)){
		duration = inDuration;
	}else{
		document.getElementById('in_duration').value = duration;
	}

	//clear any existing images
	document.getElementById('imgHolder').innerHTML = '';

	var totalLength = path.node().getTotalLength();
	console.log('total path length: ', totalLength)

	var gif = new GIF({
		workers: 3,
		workerScript: 'js/gif.worker.js',
		quality: 1,
		repeat: 0	//-1 = never, 0=infinite
	});

	gif.on("progress",function(p){
		// drawFrame(p * duration);
		d3.select(".gif").text(d3.format("%")(p).split('.')[0] + "% rendered");
	});

	gif.on("finished",function(blob){
		d3.select(".gif")
			.text("")
			.append("img")
			.attr("src",URL.createObjectURL(blob));

		if(doDownload){
			downloadFile('chartGif', blob)
		}
	
	});

	
	//kick off the iterative loop.  
	var cnt=0;
	looper();

	function looper(){
		//want to wait until one is done before kicking off the next, otherwise the images can get out of order in the gif
		if(cnt==(frames)){
			gif.render();
			return;
		}else{
			addFrame(cnt * duration / (frames - 1), looper);
			cnt++;
		}
	}


	// Add a frame for time t
	function addFrame(t,cb) {
		// Update SVG
		drawFrame(t);

		// Create a blob URL from SVG
		// including "charset=utf-8" in the blob type breaks in Safari
		var img = new Image(),
		    serialized = new XMLSerializer().serializeToString(outer.node()),
		    svg = new Blob([serialized], {type: "image/svg+xml"}),
		    url = URL.createObjectURL(svg);

		// Onload, callback to move on to next frame
		img.onload = function(){
			gif.addFrame(img, {
				delay: duration / frames,
				copy: true
				// copy: false
			});

			//put the img in the ui
			img.width=100; img.height=100;
			document.getElementById('imgHolder').appendChild(img)
			cb();	//callback
		};

		img.src = url;

	}

	function drawFrame(t) {
		//this is taking the orginal SVG and "clipping" the path in <frames> parts.  It builds part1 (the very start of the line), then adds part2 etc.
		if (t > duration) {
		  t = t % duration;
		}
		var length = totalLength * t / duration;
		path.attr("stroke-dasharray",length + " " + totalLength);
	}

	function isInt(value) {
		if (isNaN(value)) {
			return false;
		}
		var x = parseFloat(value);
		return (x | 0) === x;
	}


	function downloadFile(filename, blob) {
		var a = document.createElement('a');
		a.style = "display: none";  
		var url = URL.createObjectURL(blob)
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		window.URL.revokeObjectURL(url);    
	}




}

export const updatePath = () => {
	path = svg.append("path")
		.attr("class","price")
		.attr("d",line(JSON.parse(document.getElementById('dataEdit').value)));
}


//https://bl.ocks.org/veltman/1071413ad6b5b542a1a3
export const buildChart = () => {

	//get the data out of the textarea
	spData = JSON.parse(document.getElementById('dataEdit').value)
	//clear out anything pre-existing
	var holder = document.getElementById('svgHolder');
	if(holder.childNodes.length>0){
		holder.removeChild(holder.childNodes[0]);
		outer = null;

	}

	// Standard scales and axes
	var x = d3.scaleTime()
		.range([0, width]);

	var y = d3.scaleLinear()
		.range([height,0]);

	var xAxis = d3.axisBottom()
		.scale(x)
		.ticks(5)
		// .tickFormat(d3.timeFormat("%Y"))
		.tickSize(-height);

	var yAxis = d3.axisLeft()
		.scale(y)
		.tickSize(-width);

	var line = d3.line()
			.x(function(d){ return x(d.date); })
			.y(function(d){ return y(d.close); })

	// SVG
	outer = d3.select(".svg").append("svg")
				.attr("width",outerWidth)
				.attr("height",outerHeight);

	// Append stylesheet
	//append the style to the SVG directly (so it's picked up by the gif generator)
	// outer.append(function(){ return document.getElementById("chart-style"); });

	// Explicit background color, won't inherit page background PR: NOT SURE WHY THIS IS HERE
	outer.append("rect")
		.attr("width",outerWidth)
		.attr("height",outerHeight)
		.attr("stroke", "none")
		.attr("fill", "#ffffff");

	// Margin convention
	var svg = outer.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	spData.forEach(function(d){
		d.date = new Date(d.date);
		d.close = +d.close;
	});

	x.domain(d3.extent(spData,function(d){ return d.date; }));
	y.domain(d3.extent(spData,function(d){ return d.close; }));

	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis);

	svg.append("g")
		.attr("class", "y axis")
		.call(yAxis);

	path = svg.append("path")
		.attr("d",line(spData))
		.attr("fill", "none")
		.attr("stroke", "#008edc");



	outer.selectAll('line').attr('stroke', '#f7f7f7');
	outer.selectAll('path.domain').attr('stroke', '#cccccc');




}