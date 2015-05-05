// Adds the svg canvas
var svg = d3.select("#overlap")
  .append("svg")
    .attr("width", 320)
    .attr("height", 320)
    .style("background-color", "#1d1d1d")
  .append("g")
    .attr("transform","translate(" + (width/2) + "," +(height/2) + ")");

var cicles = [
  {bkg_radius: 280, fill: "#D8316D", offset: "90%", x: -10.034732473694785, y: 95.47410195535423},
  {bkg_radius: 140, fill: "#8F36C6", offset: "40%", x: 94.31784155091805, y: -17.892589672149704},
  {bkg_radius: 120, fill: "#841B69", offset: "40%", x: -74.71134225849801, y: 60.284453534336436},
];


// add the gradient
var defs = svg.append("defs");
var grads = defs.selectAll("radialGradient")
    .data(cicles)
  .enter().append("radialGradient")
    .attr("gradientUnits", "userSpaceOnUse")
    .attr("cx", function(d){ return d.x; })
    .attr("cy", function(d){ return d.y; })
    .attr("r", function(d){ return d.bkg_radius*0.8; })
    .attr("id", function(d, i) { return "grad" + i; });
grads.append("stop")
  .attr("offset", "10%")
  .style("stop-color", function(d, i) { return d.fill; });
grads.append("stop")
  .attr("offset", function(d, i) { return d.offset; })
  .style("stop-color", function(d, i) { return d.fill; })
  .style("stop-opacity", "0.75");
grads.append("stop")
  .attr("offset", "100%")
  .style("stop-color", function(d, i) { return d.fill; })
  .style("stop-opacity", "0");

var mask = defs.append("mask")
  .attr("id", "hole");

mask.append("rect")
  .attr("width", "100%")
  .attr("height", "100%")
  .attr("fill", "white");

mask.append("circle")
  .attr("r", 97)
  .attr("cx", (width/2))
  .attr("cy", (height/2));

var mask_middle = defs.append("mask")
  .attr("id", "hole-middle");

mask_middle.append("circle")
  .attr("r", 95)
  .attr("cx", 0)
  .attr("cy", 0)
  .attr("fill", "white");

svg.append("g").selectAll("circle")
  .data(cicles)
  .enter().append("circle")
    .attr("r", function(d){ return d.bkg_radius; })
    .attr("cx", function(d){ return d.x; })
    .attr("cy", function(d){ return d.y; })
    .attr("fill", function(d,i){ return "url(#grad"+i+")"; });

// var cover = svg.append("g");
//
// var cover_middle = cover.append("g").attr("mask", "url(#hole-middle)");
//
// cover_middle.append("circle")
//   .attr("r", 95)
//   .attr("cx", 0)
//   .attr("cy", 0)
//   .attr("fill", "#1d1d1d");
//
// cover_middle.append("circle")
//   .attr("r", 95)
//   .attr("cx", 0)
//   .attr("cy", 70)
//   .attr("fill", "#2c2c2c");
//
// cover.append("rect")
//   .attr("width", "100%")
//   .attr("height", "100%")
//   .attr("fill", "#1d1d1d")
//   .attr("mask", "url(#hole)")
//   .attr("transform","translate(" + -(width/2) + "," + -(height/2) + ")");
//
// // svg.append("path")
// //   .attr("d", lineFunction([{x: -(width/2), y: -110},{x: width, y:-110}]))
// //   .attr("stroke", "blue")
// //   .attr("stroke-width", 1)
// //   .attr("fill", "none");
