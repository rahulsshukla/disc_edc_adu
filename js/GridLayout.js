// Temporary globals
/*
length_lot = 600
width_lot = 300
d_house_front_to_lot_front = 80
d_right_of_house = 90
d_house_back_to_lot_back = 350
d_left_of_house = 40
d_wire_to_lot_back = 0 // 5ft with scaler
zone = 1
area_lot = 180045
area_house = 43245
*/

function parse_query(){
    var url_string = (window.location.href).toLowerCase()
    var url = new URL(url_string)
    this.console.log(url)
    window.user_front_lot = url.searchParams.get("user_front_lot")
    window.user_side_lot = url.searchParams.get("user_side_lot")
    window.user_house = url.searchParams.get("user_house")
    window.user_zone =  url.searchParams.get("user_zone")
    window.user_tele =  url.searchParams.get("user_tele")
    window.house_length =  parseInt(url.searchParams.get("house_length"))
    window.house_width =  parseInt(url.searchParams.get("house_width"))
    console.log("user_front_lot: ", user_front_lot,
        "\nuser_side_lot: ", user_side_lot, 
        "\nuser_house: ", user_house,
        "\nuser_zone: ", user_zone,
        "\nuser_tele: ", user_tele)


}
parse_query()
console.log("l: ",house_length, "w: ", house_width)


// Initialize graph
var graph = new joint.dia.Graph;

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
    var rect = new joint.shapes.standard.Rectangle({ size: { width: width, height: height }}).attr({body: {fill: "white"}});
    rect.position(x,y)
    graph.addCell(rect);
};

// MODEL returns house properties from physical inputs
const properties_house = (d_house_front_to_lot_front, d_right_of_house, length_lot, width_lot, d_house_back_to_lot_back, d_left_of_house) => {
  // returns the height, width, x, and y of house rectangle
  x = d_house_back_to_lot_back;
  y = d_left_of_house;
  height = width_lot - d_left_of_house - d_right_of_house;
  width = length_lot- d_house_back_to_lot_back - d_house_front_to_lot_front;
  return [height, width, x, y];
}

// MODEL boundaries free space from physical inputs
const boundaries_free_space = (length_lot, d_house_back_to_lot_back, d_wire_to_lot_back, width_lot) => {
  // returns the x_lower, x_upper, y_lower, y_higher boundaries of adu box
  x_lower = 10 - d_wire_to_lot_back;  // size of 10ft with scaler
  x_upper = d_house_back_to_lot_back - 10;  // size of 10ft with scaler
  y_lower = 0;
  y_upper = width_lot;
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
const render_house = (d_house_front_to_lot_front, d_right_of_house, length_lot, width_lot, d_house_back_to_lot_back, d_left_of_house) => {
  house_properties = properties_house(d_house_front_to_lot_front, d_right_of_house, length_lot, width_lot, d_house_back_to_lot_back, d_left_of_house);
  render_rectangle(house_properties[0], house_properties[1], house_properties[2], house_properties[3]);
}

// TEMPORARY TESTER
const render_box = (length_lot, d_house_back_to_lot_back, d_wire_to_lot_back, width_lot) => {
  boundaries = boundaries_free_space(length_lot, d_house_back_to_lot_back, d_wire_to_lot_back, width_lot);
  //render_rectangle(y_upper-y_lower, x_upper-x_lower, x_lower, y_lower)
  render_rectangle(boundaries[3]-boundaries[2], boundaries[1]-boundaries[0], boundaries[0], boundaries[2])
}

const render_box_paper = (length_lot, d_house_back_to_lot_back, d_wire_to_lot_back, width_lot) => {
  boundaries = boundaries_free_space(length_lot, d_house_back_to_lot_back, d_wire_to_lot_back, width_lot);
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


// renders intial fixed stuff
render_lot(length_lot, width_lot);
render_house(d_house_front_to_lot_front, d_right_of_house, length_lot, width_lot, d_house_back_to_lot_back, d_left_of_house);
// below is temp, actually set constraints
render_box(length_lot, d_house_back_to_lot_back, d_wire_to_lot_back, width_lot);
render_box_paper(length_lot, d_house_back_to_lot_back, d_wire_to_lot_back, width_lot)
render_rectangle(100,200, 10, 20)

// NOT IN USE resizes and repositions passed in Cell
const setPosition = (element,x,y) => {
  element.position(x,y)
};
const setHeight = (element,width,height) => {
  element.resize(width, height);
};

 
