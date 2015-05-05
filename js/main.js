// Set the dimensions of the canvas / graph
var margin = {top: 0, right: 0, bottom: 0, left: 0},
  width = 320 - margin.left - margin.right,
  height = 320 - margin.top - margin.bottom,
  bkg_color = '#1d1d1d', font_color = '#7D7D7D',
  stroke_width = 3, meetings_radius = 120, time_radius = 95,
  steps = 2, pi = Math.PI, font_size = 82;

var time_list = {
  now: new Date(),
  data: [
    {id: 'mins', radius: 13, bkg_radius: 680, fill: bkg_color, stroke: '#E33C74', stroke_width: stroke_width},
    {id: 'hrs', radius: 9, bkg_radius: 140, fill: bkg_color, stroke: '#8F36C6',   stroke_width: stroke_width},
    {id: 'secs', radius: 5, bkg_radius: 90, fill: bkg_color, stroke: '#841B69',  stroke_width: 0},
  ],
};

var meeting_list = {
  radius: 6,
  color: '#4f4f4f',
  ring: 360,
  data: [
    {start_time: (new Date(2015, 3, 29, 9)).getTime(), end_time: (new Date(2015, 3, 29, 11, 30)).getTime()},
    {start_time: (new Date(2015, 3, 29, 13)).getTime(), end_time: (new Date(2015, 3, 29, 14)).getTime()},
    {start_time: (new Date(2015, 3, 29, 15)).getTime(), end_time: (new Date(2015, 3, 29, 15, 30)).getTime()},
  ],
};

// // Define the div for the tooltip
// var tooltip = d3.select("#timely").append("div")
//   .attr("class", "tooltip")
//   .style("opacity", 0);

var formatSecond = d3.time.format("%S"),
    formatMinute = d3.time.format("%M"),
    formatHour = d3.time.format("%H"),
    formatDay = d3.time.format("%a"),
    formatDate = d3.time.format("%d"),
    formatMonth = d3.time.format("%b");

// var color = d3.scale.linear()
//   .domain([0,90,180,270,315,360])
//   .range([
//     "hsl(297, 48%, 47%)",
//     "hsl(339, 75%, 55%)",
//     "hsl(317, 61%, 32%)",
//     "hsl(299, 51%, 36%)",
//     "hsl(276, 59%, 53%)",
//     "hsl(297, 48%, 47%)"]);
//
// var arc_data = d3.range(180).map(function(d, i) {
//   i *= steps;
//   return {
//     radius: time_radius,
//     start_ang: i * (pi / 180),
//     end_ang: (i+3) * (pi / 180),
//     fill: color(i)
//   };
// });

var meeting_arc = d3.svg.arc()
  .innerRadius(meetings_radius - (stroke_width/2))
  .outerRadius(meetings_radius + stroke_width + (stroke_width/2))
  .startAngle(function(d) { return degrees_to_radians(d.start_ang); })
  .endAngle(function(d) { return degrees_to_radians(d.end_ang); });

var meeting_point_arc = d3.svg.arc()
  .startAngle(0)
  .endAngle(function(d){ return degrees_to_radians(d.ring_ang); })
  .innerRadius(meeting_list.radius)
  .outerRadius(meeting_list.radius + stroke_width);

// var meeting_ring_arc = d3.svg.arc()
//   .innerRadius(meetings_radius)
//   .outerRadius(meetings_radius + stroke_width)
//   .startAngle(0)
//   .endAngle(360 * (pi/180));

var time_arc = d3.svg.arc()
  .innerRadius(time_radius)
  .outerRadius(time_radius + stroke_width)
  .startAngle(function(d) { return d.start_ang; })
  .endAngle(function(d) { return d.end_ang; });

var lineFunction = d3.svg.line()
  .x(function(d) { return d.x; })
  .y(function(d) { return d.y; })
  .interpolate("linear");

function calc_x_y(ang, radius){
  var real_angle = degrees_to_radians(ang-90);
  return {
    x: Math.cos(real_angle)*(radius+(stroke_width/2)),
    y: Math.sin(real_angle)*(radius+(stroke_width/2)),
  };
}

function time_scale(scale, value){
  var d3_scale = d3.scale.linear()
    .domain([0,scale])
    .range([0,360]);
  var ang = d3_scale(value);
  return ang;
}

function degrees_to_radians(degrees) {
  return degrees * (pi/180);
}

function get_time_angles(time_obj){
  var millisecs = time_obj.getMilliseconds(),
    secs = time_obj.getSeconds() + (millisecs/1000),
    mins = time_obj.getMinutes() + ((secs > 0) ? secs/60 : 0),
    hrs = time_obj.getHours() + ((mins > 0) ? mins/60 : 0),
    tot = 0;

  if(hrs > 12){
    hrs = Math.abs(hrs - 12);
  }

  tot = hrs;

  var time_ang = {
    'hrs': time_scale(12, hrs),
    'mins': time_scale(60, mins),
    'secs': time_scale(60, secs),
    'tot': time_scale(12, tot),
  };

  return time_ang;
}

function meeting_arc_tween(d) {
  var inter = null;
  if(d.open === true){
    inter = d3.interpolateNumber(d.start_ang, d.org_end_ang);
  } else {
    inter = d3.interpolateNumber(d.org_end_ang, d.start_ang);
  }
  return function(t) { d.end_ang = inter(t); return meeting_arc(d); };
}

function meeting_point_arc_tween(d) {
  var inter = null;
  if(d.open === true){
    inter = d3.interpolateNumber(360, 0);
  } else {
    inter = d3.interpolateNumber(0, 360);
  }
  return function(t) { d.ring_ang = inter(t); return meeting_point_arc(d); };
}

function meetings_data(){
  meeting_list.data.forEach(function(item, i){
    var start_time = new Date(item.start_time),
      start_time_ang = get_time_angles(start_time),
      end_time = new Date(item.end_time),
      end_time_ang = get_time_angles(end_time),
      start_x_y = calc_x_y(start_time_ang.tot, meetings_radius),
      end_x_y = calc_x_y(end_time_ang.tot, meetings_radius);

    meeting_list.data[i].ring_ang = meeting_list.ring;
    meeting_list.data[i].open = false;
    meeting_list.data[i].start_ang = start_time_ang.tot;
    meeting_list.data[i].start_x = start_x_y.x;
    meeting_list.data[i].start_y = start_x_y.y;
    // meeting_list.data[i].end_ang = end_time_ang.tot;
    meeting_list.data[i].end_ang = start_time_ang.tot;
    meeting_list.data[i].org_end_ang = end_time_ang.tot;
    meeting_list.data[i].end_x = end_x_y.x;
    meeting_list.data[i].end_y = end_x_y.y;

  }.bind(this));
}

// var prev_time_data = [];
function time_data(){
  var now = new Date(),
    time_ang = get_time_angles(now);

  time_list.data.forEach(function(item, i){
    var ang = time_ang[item.id],
      x_y = calc_x_y(ang, time_radius);

    time_list.data[i].ang_prev = time_list.data[i].ang || 0;
    time_list.data[i].ang = ang;
    time_list.data[i].x = x_y.x;
    time_list.data[i].y = x_y.y;

  }.bind(this));
}

// get the initial time and meetings data set
time_data();
meetings_data();

//------------------------------------------------
// Add the main svg
//------------------------------------------------

// Adds the svg canvas
var svg = d3.select("#timely")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("background-color", bkg_color)
  .append("g")
    //.attr("transform","translate(" + margin.left + "," + margin.top + ")");
    .attr("transform","translate(" + (width/2) + "," +(height/2) + ")");

//------------------------------------------------
// Add the definitions
//------------------------------------------------

// add the gradient
var defs = svg.append("defs");
var bkg_grads = defs.selectAll("radialGradient")
    .data(time_list.data)
  .enter().append("radialGradient")
    .attr("gradientUnits", "userSpaceOnUse")
    .attr("cx", function(d){ return d.x; })
    .attr("cy", function(d){ return d.y; })
    .attr("r", function(d){ return d.bkg_radius*0.8; })
    .attr("id", function(d, i) { return "grad" + i; });
bkg_grads.append("stop")
  .attr("offset", "10%")
  .style("stop-color", function(d, i) { return d.stroke; });
bkg_grads.append("stop")
  .attr("offset", "40%")
  .style("stop-color", function(d, i) { return d.stroke; })
  .style("stop-opacity", "0.75");
bkg_grads.append("stop")
  .attr("offset", "100%")
  .style("stop-color", function(d, i) { return d.stroke; })
  .style("stop-opacity", "0");

var mask = defs.append("mask")
  .attr("id", "hole");

var mask_inner = defs.append("mask")
  .attr("id", "mask-inner");

var mask_inner_ring = defs.append("mask")
  .attr("id", "mask-inner-ring");

mask.append("rect")
  .attr("width", "100%")
  .attr("height", "100%")
  .attr("fill", "white");

mask.append("circle")
  .attr("r", time_radius+stroke_width)
  .attr("cx", (width/2))
  .attr("cy", (height/2));

mask.append("circle")
  .attr("r", meetings_radius + (stroke_width/2))
  .attr("fill", "transparent")
  .attr("stroke", "black")
  .attr("stroke-width", stroke_width)
  .attr("cx", (width/2))
  .attr("cy", (height/2));

var mask_middle = defs.append("mask")
  .attr("id", "hole-middle");

mask_middle.append("circle")
  .attr("r", time_radius)
  .attr("cx", 0)
  .attr("cy", 0)
  .attr("fill", "white");

mask_inner.append("rect")
  .attr("width", "100%")
  .attr("height", "100%")
  .attr("fill", "white")
  .attr("transform","translate(" + -(width/2) + "," + -(height/2) + ")");

mask_inner_ring.append("rect")
  .attr("width", "100%")
  .attr("height", "100%")
  .attr("fill", "black")
  .attr("transform","translate(" + -(width/2) + "," + -(height/2) + ")");

mask_inner_ring.append("circle")
  .attr("r", time_radius)
  .attr("cx", 0)
  .attr("cy", 0)
  .attr("fill", "transparent")
  .attr("stroke", "white")
  .attr("stroke-width", stroke_width*12);

time_list.data.forEach(function(d){
  mask.append("circle")
    .attr("id", "hole-outer-" + d.id)
    .attr("class", "hole-outer")
    .attr("r", d.radius)
    .attr("cx", 0)
    .attr("cy", -(time_radius+(stroke_width/2)))
    .attr("fill", "black")
    .attr("transform","translate(" + (width/2) + "," + (height/2) + ") rotate(" + d.ang + ")");
  if(d.id != 'secs'){
    mask.append("circle")
      .attr("id", "hole-fill-" + d.id)
      .attr("class", "hole-outer")
      .attr("r", d.radius-d.stroke_width)
      .attr("cx", 0)
      .attr("cy", -(time_radius+(stroke_width/2)))
      .attr("fill", "white")
      .attr("transform","translate(" + (width/2) + "," + (height/2) + ") rotate(" + d.ang + ")");
  }
  mask_middle.append("circle")
    .attr("id", "hole-inner-" + d.id)
    .attr("class", "hole-inner")
    .attr("r", d.radius)
    .attr("cx", 0)
    .attr("cy", -(time_radius+(stroke_width/2)))
    .attr("fill", "black")
    .attr("transform","rotate(" + d.ang + ")");
}.bind(this));

meeting_list.data.forEach(function(d, i){
  mask.append("circle")
    .attr("r", (meeting_list.radius+(stroke_width/2)))
    .attr("cx", d.start_x)
    .attr("cy", d.start_y)
    .attr("fill", "transparent")
    .attr("stroke", "black")
    .attr("stroke-width", stroke_width)
    .attr("transform","translate(" + (width/2) + "," + (height/2) + ")");
  mask.append("path")
    .data([d])
    .attr("id", "hole-meeting-" + i)
    .attr("d", meeting_arc)
    .attr("fill", "black")
    .attr("transform","translate(" + (width/2) + "," + (height/2) + ")");
  mask_inner.append("path")
    .data([d])
    .attr("id", "inner-meeting-" + i)
    .attr("d", meeting_arc)
    .attr("fill", "black");
  mask_inner.append("circle")
    .attr("r", (meeting_list.radius+(stroke_width/2)))
    .attr("cx", d.start_x)
    .attr("cy", d.start_y)
    .attr("fill", "black")
    .attr("stroke", "black")
    .attr("stroke-width", stroke_width);
}.bind(this));

//------------------------------------------------
// Add the background items
//------------------------------------------------

var bkg_panel = svg.append("g");

// bkg_panel.append("circle")
//   .attr("r", (width/2))
//   .attr("cx", 0)
//   .attr("cy", 0)
//   .attr("fill", "#E76159");

var bkg_cirles = bkg_panel.selectAll("circle.times")
  .data(time_list.data)
  .enter().append("circle")
    .attr("class", "times")
    // .attr("mask", "url(#mask-inner-ring)")
    .attr("r", function(d){ return d.bkg_radius; })
    .attr("cx", function(d){ return d.x; })
    .attr("cy", function(d){ return d.y; })
    .attr("fill", function(d,i){ return "url(#grad"+i+")"; });
    // .attr("fill", function(d,i){ return d.stroke; });

bkg_panel.append("circle")
  .attr("mask", "url(#mask-inner)")
  .attr("r", meetings_radius + (stroke_width/2))
  .attr("fill", "transparent")
  .attr("stroke", meeting_list.color)
  .attr("stroke-width", stroke_width);

var cover = svg.append("g");

var cover_middle = cover.append("g").attr("mask", "url(#hole-middle)");

cover_middle.append("circle")
  .attr("r", time_radius)
  .attr("cx", 0)
  .attr("cy", 0)
  .attr("fill", bkg_color);

var current_date_str = formatDate(time_list.now);
var current_date = cover_middle.append("text")
  .attr("class", "date")
  .text(current_date_str)
  .style("font-size", font_size)
  .attr("alignment-baseline", "middle")
  .attr("text-anchor", "middle")
  .attr("fill", font_color);

// cover_middle.append("circle")
//   .attr("r", 95)
//   .attr("cx", 0)
//   .attr("cy", 70)
//   .attr("fill", "#2c2c2c");

cover.append("rect")
  .attr("width", "100%")
  .attr("height", "100%")
  .attr("fill", bkg_color)
  .attr("mask", "url(#hole)")
  .attr("transform","translate(" + -(width/2) + "," + -(height/2) + ")");

//------------------------------------------------
// Add the time items
//------------------------------------------------

// var time_numbers = svg.append("g").selectAll("text")
//     .data([1,2,3,4,5,6,7,8,9,10,11,12])
//   .enter().append("text")
//     .text(function(d) { return d; })
//     .attr("class", "time-numbers")
//     .attr("transform",function(d){
//       var real_angle = degrees_to_radians(time_scale(12, d)-90);
//       var x = Math.cos(real_angle)*(time_radius+stroke_width+3);
//       var y = Math.sin(real_angle)*(time_radius+stroke_width+3);
//       return "translate(" + x + "," + y + ")";
//     });

//------------------------------------------------
// Add the meeting items
//------------------------------------------------

//*

// meetings ring
var meetings_group = svg.append("g");
// var meetings_ring = meetings_group.append("path")
//   .attr("d", meeting_ring_arc)
//   .style("fill", meeting_list.color);

var meetings = meetings_group.append("g").selectAll("g")
    .data(meeting_list.data)
  .enter().append("g")
    .style("cursor", "pointer")
    .on("click", function(d, i) {
      if(d.open === true){
        meeting_list.data[i].open = false;
        mask.select("#hole-meeting-" + i)
          .data([d])
          .transition()
            .attrTween("d", meeting_arc_tween)
            .each("end", function(){
              meetings.select("#ring-meeting-" + i)
                .transition()
                  .attrTween("d", meeting_point_arc_tween);
            }.bind(this));
        mask_inner.select("#inner-meeting-" + i)
          .data([d])
          .transition()
            .attrTween("d", meeting_arc_tween);
      } else {
        meeting_list.data[i].open = true;
        meetings.select("#ring-meeting-" + i)
          .transition()
            .attrTween("d", meeting_point_arc_tween)
            .each("end", function(){
              mask.select("#hole-meeting-" + i)
                .data([d])
                .transition()
                  .attrTween("d", meeting_arc_tween);
              mask_inner.select("#inner-meeting-" + i)
                .data([d])
                .transition()
                  .attrTween("d", meeting_arc_tween);
            }.bind(this));
      }
    });

// meetings.append("path")
//   .attr("id", function(d, i){ return 'meeting-' + i; })
//   .attr("d", function(d){ return meeting_arc(d); })
//   .attr("fill", "#1B6984");

meetings.append("path")
  .attr("id", function(d, i){ return "ring-meeting-" + i; })
  .attr("d", meeting_point_arc)
  .attr("fill", function(d){ return meeting_list.color; }.bind(this))
  .attr("transform",function(d){ return "translate(" + d.start_x + "," + d.start_y + ") rotate(" + (d.start_ang+90) + ")"; });

meetings.append("circle")
  .attr("fill", bkg_color)
  .attr("r", meeting_list.radius)
  .attr("transform",function(d){ return "translate(" + d.start_x + "," + d.start_y + ")"; });

// */

// svg.append("path")
//   .attr("d", lineFunction([{x: -(width/2), y: 0},{x: width, y:0}]))
//   .attr("stroke", "blue")
//   .attr("stroke-width", 1)
//   .attr("fill", "none");

// // Avoid shortest-path interpolation.
// function interpolate_hsl(a, b) {
//   var i = d3.interpolateString(a, b);
//   return function(t) {
//     return d3.hsl(i(t));
//   };
// }

d3.timer(tick);

function tick() {
  // generate the next time data set
  time_data();

  bkg_cirles
    .each(function(d) {
      this._x = d.x;
      this._y = d.y;
    })
    .data(time_list.data)
    .transition()
      .ease("linear")
      .attr("cx",function(d){
        return d.x;
      })
      .attr("cy",function(d){
        return d.y;
      });

  bkg_grads
    .each(function(d) {
      this._x = d.x;
      this._y = d.y;
    })
    .data(time_list.data)
    .transition()
      .ease("linear")
      .attr("cx",function(d){
        return d.x;
      })
      .attr("cy",function(d){
        return d.y;
      });

  current_date_str = formatDate(time_list.now);
  current_date.text(current_date_str);

  time_list.data.forEach(function(d){
    mask.select("#hole-outer-" + d.id)
      .transition()
        .ease("linear")
        .attr("transform", "translate(" + (width/2) + "," + (height/2) + ") rotate(" + d.ang + ")");
    if(d.id != 'secs'){
      mask.select("#hole-fill-" + d.id)
        .transition()
          .ease("linear")
          .attr("transform", "translate(" + (width/2) + "," + (height/2) + ") rotate(" + d.ang + ")");
    }
    mask_middle.select("#hole-inner-" + d.id)
      .transition()
        .ease("linear")
        .attr("transform", "rotate(" + d.ang + ")");
  }.bind(this));

}
