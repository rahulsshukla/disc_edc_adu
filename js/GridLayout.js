// Temporary globals
/*
length_lot = 600
width_lot = 300
d_right_of_house = 60
d_house_back_to_lot_back = 350
area_lot = 180045
area_house = 43245

d_left_of_house = 40

d_wire_to_lot_back = 5 // 5ft with scaler
zone = 1
d_house_front_to_lot_front = 80
*/

/*

VARS UPDATED: zone, tele, lot front, *lot side (replaced left of house, but not right... hmm),

*/

function parse_query(){
    var url_string = (window.location.href).toLowerCase()
    var url = new URL(url_string)
    this.console.log(url)
    window.user_front_lot = Number(url.searchParams.get("user_front_lot"))
    window.user_side_lot_l = Number(url.searchParams.get("user_side_lot")) //change this once form takes more inputs
    window.user_side_lot_r = Number(url.searchParams.get("user_side_lot")) // ^
    window.user_house_area = Number(url.searchParams.get("user_house"))
    window.user_zone =  parseInt(url.searchParams.get("user_zone")[1]) // e.g. convert from "R1" to 1
    window.user_tele =  parseInt(url.searchParams.get("user_tele"))
    window.house_length =  parseInt(url.searchParams.get("house_length"))
    window.house_width =  parseInt(url.searchParams.get("house_width"))
    window.length_lot = window.user_front_lot + window.house_length + window.user_front_lot// CHANGE LATER
    alert("original length lot: "+window.length_lot)
    window.user_back_lot = window.length_lot - window.house_length - window.user_front_lot
    window.width_lot = window.house_width+window.user_side_lot_l+window.user_side_lot_r
    alert("original back lot: "+window.user_back_lot)
    alert("user_front_lot: "+window.user_front_lot+
        "\nuser_side_lot_l: "+ window.user_side_lot_l+
        "\nuser_side_lot_r: "+ window.user_side_lot_r+
        "\nuser_house_area: "+ window.user_house_area+
        "\nuser_zone: "+ window.user_zone+
        "\nuser_tele: "+ window.user_tele)
}

// Initialize Paper
const render_lot = (length_lot, width_lot) => {
  var paper = new joint.dia.Paper({
      el: document.getElementById('ADU-layout'),
      model: graph,
      width: length_lot,
      height: width_lot,
      gridSize: 1,
      gridSize: 1,
      drawGrid: false,
      background: {
          color: "green"
      },
      restrictTranslate: true,
      interactive: false
  });
}

//function that generates rectangle onto graph
const render_rectangle = (height, width, x, y) => {
    alert("render rectangle: "+String(height) + "; "+String(width)+"; "+x+"; "+y) //width & x are NaN
    var rect = new joint.shapes.standard.Rectangle({ size: { width: width, height: height }}).attr({body: {fill: "white"}});
    rect.position(x,y)
    graph.addCell(rect);
};

// MODEL returns house properties from physical inputs
const properties_house = (d_front, d_right_of_house, length_lot, width_lot, d_house_back_to_lot_back, d_left_of_house) => {
  // returns the height, width, x, and y of house rectangle
  alert("PROPERTIES HOUSE: "+d_front+"; "+d_right_of_house+"; "+length_lot+"; "+width_lot+"; "+d_house_back_to_lot_back+"; "+d_left_of_house)
  var x = d_house_back_to_lot_back;
  var y = d_left_of_house; // LEFT OF HOUSE MATTERS
  var height = width_lot - d_left_of_house - d_right_of_house;
  var width = length_lot - d_house_back_to_lot_back - d_front;
  if(width < 0 || height < 0) {
    alert("var<0")
  }
  return [height, width, x, y];
}

// MODEL boundaries free space from physical inputs
const boundaries_free_space = (length_lot, d_house_back_to_lot_back, user_tele, width_lot) => {
  // returns the x_lower, x_upper, y_lower, y_higher boundaries of adu box
  var x_lower = 10 - user_tele;  // size of 10ft with scaler
  var x_upper = d_house_back_to_lot_back - 10;  // size of 10ft with scaler
  var y_lower = 0;
  var y_upper = width_lot;

  if(x_lower == NaN || y_lower==NaN || x_upper==NaN || y_upper==NaN) {
    alert("NAN IN BOUNDARIES");
  }

  return [x_lower, x_upper, y_lower, y_upper];
}

// MODEL computes lot coverage for zone
const zone_lot_coverage = (zone) => {
  if (zone == 1) {
    lot_coverage = .3;
  }
  else if (zone == 2 || zone == 4) {
    lot_coverage = .4;
  }
  else if (zone == 3 || zone == 5) {
    lot_coverage = .45;
  }
  else if (zone == 6) {
    lot_coverage = .5;
  }
  else {
    var e = new Error('invalid zone type');
    throw e;
  }
  return lot_coverage;
}

// MODEL computes max area of adu
const max_area_of_adu = (area_lot, area_house, d_house_back_to_lot_back, width_lot, zone) => {
  lot_coverage = zone_lot_coverage(zone)
  max_area_of_adu = Math.min(area_lot * lot_coverage - area_house, d_house_back_to_lot_back * width_lot * 2/5);
  return max_area_of_adu;
}

// renders house rectangle
const render_house = (d_front, d_right_of_house, length_lot, width_lot, d_house_back_to_lot_back, d_left) => {
  var house_properties = properties_house(d_front, d_right_of_house, length_lot, width_lot, d_house_back_to_lot_back, d_left);
  render_rectangle(house_properties[0], house_properties[1], house_properties[2], house_properties[3]);
}

// TEMPORARY TESTER
const render_box = (length_lot, d_house_back_to_lot_back, user_tele, width_lot) => {
  var boundaries = boundaries_free_space(length_lot, d_house_back_to_lot_back, user_tele, width_lot);
  //render_rectangle(y_upper-y_lower, x_upper-x_lower, x_lower, y_lower)
  render_rectangle(boundaries[3]-boundaries[2], boundaries[1]-boundaries[0], boundaries[0], boundaries[2])
}

const render_box_paper = (length_lot, d_house_back_to_lot_back, user_tele, width_lot) => {
  var boundaries = boundaries_free_space(length_lot, d_house_back_to_lot_back, user_tele, width_lot);

  for (var i in boundaries) {
    alert(i)
  }

  var box_paper = new joint.dia.Paper({
        el: document.getElementById('ADU-box'),
        model: graph,
        width: boundaries[1]-boundaries[0],
        height: boundaries[3]-boundaries[2],
        gridSize: 1,
        gridSize: 1,
        drawGrid: false,
        background: {
            color: "blue"
        },
        restrictTranslate: true
    });
}

// FUNCTION CALLS BELOW

parse_query()
console.log("l: ",house_length, "w: ", house_width)

// Initialize graph
var graph = new joint.dia.Graph;

// renders intial fixed stuff
render_lot(window.length_lot, window.width_lot); // Both probs??
alert("USER BACK LOT: "+window.user_back_lot)
render_house(window.user_front_lot, window.user_side_lot_r, window.length_lot, window.width_lot,
   window.user_back_lot, window.user_side_lot_l);
// below is temp, actually set constraints
//render_box(window.house_length, window.user_back_lot, window.user_tele, window.house_width); // ONE PROB
//render_box_paper(window.house_length, window.user_back_lot, window.user_tele, window.house_width)
//render_rectangle(100,200, 10, 20)

// NOT IN USE resizes and repositions passed in Cell
const setPosition = (element,x,y) => {
  element.position(x,y)
};
const setHeight = (element,width,height) => {
  element.resize(width, height);
};
