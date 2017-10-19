

import d3 from 'd3';
const spData = require('./data/sp-500.json');

var createQueue = require('d3-queue');

export const doChart = (target) => {

console.log(createQueue)

  buildChart();
};





//https://bl.ocks.org/veltman/1071413ad6b5b542a1a3
const buildChart = () => {
		
	var margin = {top: 20, right: 5, bottom: 30, left: 60},
		outerWidth = 400,
		outerHeight = 320,
		width = outerWidth - margin.left - margin.right,
		height = outerHeight - margin.top - margin.bottom,
		frames = 4,//40,
		duration = 2000;

	// Standard scales and axes
	var x = d3.scaleTime()
		.range([0, width]);

	var y = d3.scaleLinear()
		.range([height,0]);

	var xAxis = d3.axisBottom()
		.scale(x)
		.tickSize(-height);

	var yAxis = d3.axisLeft()
		.scale(y)
		.tickSize(-width);

	var line = d3.line()
			.x(function(d){ return x(d.date); })
			.y(function(d){ return y(d.close); });

	// SVG
	var outer = d3.select(".svg").append("svg")
				.attr("width",outerWidth)
				.attr("height",outerHeight);

	// Append stylesheet
	//append the style to the SVG directly (so it's picked up by the gif generator)
	outer.append(function(){ return document.getElementById("chart-style"); });

	// Explicit background color, won't inherit page background PR: NOT SURE WHY THIS IS HERE
	outer.append("rect")
		.attr("width",outerWidth)
		.attr("height",outerHeight);

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

	var path = svg.append("path")
		.attr("class","price")
		.attr("d",line(spData));

	//AT THIS POINT, THIS IS JUST AN SVG CHART.


	//NOW GETTING INTO THE GIF BIT

	var totalLength = path.node().getTotalLength();
	console.log(totalLength)

	var gif = new GIF({
		workers: 3,
		workerScript: 'js/gif.worker.js',
		quality: 1,
		repeat: 0	//-1 = never, 0=infinite
	});

	gif.on("progress",function(p){
		// drawFrame(p * duration);
		d3.select(".gif").text(d3.format("%")(p) + " rendered");
	});

	gif.on("finished",function(blob){
		d3.select(".gif")
			.text("")
			.append("img")
			.attr("src",URL.createObjectURL(blob));

		// d3.timer(drawFrame);	
	});

	// Sequential queue to ensure frames are added in order
	// Probably not necessary but onload behavior is a little unpredictable
	// var q = createQueue.queue(1);

	// Queue up frames to add to gif stack
	d3.range(frames).forEach(function(f){
		addFrame(f * duration / (frames - 1))
		// q.defer(addFrame,f * duration / (frames - 1));
	});

	setTimeout(function(){
		gif.render();
	}, 2000)

		// gif.render();

	// // Once all frames are added
	// q.awaitAll(function(){
	// 	// Show SVG as progress bar
	// 	outer.style("display","block");

	// 	// Start web workers
	// 	gif.render();
	// });


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


console.log("on image " + t, url)


	    // Onload, callback to move on to next frame
	    img.onload = function(){
	 
	    	document.getElementById('something').appendChild(img)


			gif.addFrame(img, {
				delay: duration / frames,
				// copy: true
				copy: false
			});
	      // cb(null,t);
	    };

	    img.src = url;

	  }

	  function drawFrame(t) {

	  	//this is taking the orginal SVG and "clipping" the path in <frames> parts.  It builds part1 (the very start of the line), then adds part2 etc.

	    // Need to catch 0% and 100%
	    // Surely a smarter way to do this
	    if (t > duration) {
	      t = t % duration;
	    }

	    var length = totalLength * t / duration;

	    path.attr("stroke-dasharray",length + " " + totalLength);
	  }




















}