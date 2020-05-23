// Temporary globals

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
var lot_graph = new joint.dia.Graph;

// Initialize Paper
const render_lot = (length_lot, width_lot) => {
  var paper = new joint.dia.Paper({
      el: document.getElementById('ADU-layout'),
      model: lot_graph,
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
const render_rectangle = (graph, height, width, x, y) => {
    var rect = new joint.shapes.standard.Rectangle({ size: { width: width, height: height }}).attr({body: {fill: "white"}});
    rect.position(x,y);
    graph.addCell(rect);
    return rect;
};

// generates circle onto graph
const render_circle = (graph, diameter, x, y) => {
  var circle = new joint.shapes.standard.Circle();
  circle.resize(diameter, diameter)
  circle.position(x,y);
  graph.addCell(circle);
  return circle;
}

// MODEL returns house properties from physical inputs
const properties_house = (d_house_front_to_lot_front, d_right_of_house, length_lot, width_lot, d_house_back_to_lot_back, d_left_of_house) => {
  // returns the height, width, x, and y of house rectangle
  x = d_house_back_to_lot_back;
  y = d_left_of_house;
  height = width_lot - d_left_of_house - d_right_of_house;
  width = length_lot- d_house_back_to_lot_back - d_house_front_to_lot_front;
  return [height, width, x, y];
}

// MODEL returns ADU boundaries free space from physical inputs
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
  max_area = Math.min(area_lot * lot_coverage - area_house, d_house_back_to_lot_back * width_lot * 2/5);
  return max_area;
}

// renders house rectangle
const render_house = (d_house_front_to_lot_front, d_right_of_house, length_lot, width_lot, d_house_back_to_lot_back, d_left_of_house) => {
  house_properties = properties_house(d_house_front_to_lot_front, d_right_of_house, length_lot, width_lot, d_house_back_to_lot_back, d_left_of_house);
  render_rectangle(lot_graph, house_properties[0], house_properties[1], house_properties[2], house_properties[3]);
}

// New graph for adu graph
var adu_graph = new joint.dia.Graph;

const render_box_paper = (length_lot, d_house_back_to_lot_back, d_wire_to_lot_back, width_lot) => {
  boundaries = boundaries_free_space(length_lot, d_house_back_to_lot_back, d_wire_to_lot_back, width_lot);
  var box_paper = new joint.dia.Paper({
        el: document.getElementById('ADU-box'),
        model: adu_graph,
        width: boundaries[1]-boundaries[0],
        height: boundaries[3]-boundaries[2],
        gridSize: 1,
        gridSize: 1,
        drawGrid: false,
        background: {
            color: "darkgreen"
        },
        restrictTranslate: true
    });
  adu_box_elem = document.getElementById('ADU-box');
  adu_box_elem.style.top = boundaries[2].toString() + "px";
  adu_box_elem.style.left = boundaries[0].toString() + "px";
}

// MODEL checks if the size of adu is larger exceeds zone restrictions
const adu_size_check = (adu_width, adu_height, area_lot, area_house, d_house_back_to_lot_back, width_lot, zone) => {
  max_area = max_area_of_adu(area_lot, area_house, d_house_back_to_lot_back, width_lot, zone);
  if (adu_width * adu_height > max_area) {
    return true;
  }
  else {
    return false;
  }
}

// MODEL gets button position based on size and position of adu so its bottom right
const get_button_position = (adu_element, diameter) => {
  console.log('get_button_position triggered')
  adu_element_position = adu_element.get('position');
  adu_element_size = adu_element.get('size');
  size_button_x = adu_element_position.x + adu_element_size.width;
  size_button_y = adu_element_position.y + adu_element_size.height;
  size_button_x -= diameter / 2
  size_button_y -= diameter / 2
  return [size_button_x, size_button_y]
}

// renders size dragging button attached to the adu rectangle
const render_size_button = (adu_element) => {
  DIAMETER = 15
  size_button_position = get_button_position(adu_element, DIAMETER)
  size_button_element = render_circle(adu_graph, DIAMETER, size_button_position[0], size_button_position[1])
  //size_button_element.on('change:position', update_adu_element(size_button_element))
  size_button_element.on('change:position', function(size_button_element, position) {
    console.log('size_button_element position changed');
    update_adu_element(adu_element, size_button_element);
  });
  return size_button_element
}

// updates size button when box moves and when oversized
const update_size_button = (adu_element, size_button_element) => {
  console.log('update_size_button triggered')
  //size_button_size = size_button_element.get('size')
  //console.log(size_button_size)
  //size_button_position = get_button_position(adu_element, size_button_size.width)
  size_button_position = get_button_position(adu_element, 15)
  size_button_element.position(size_button_position[0], size_button_position[1])
}

// updates adu element when the size button is moved
const update_adu_element = (adu_element, size_button_element) => {
  console.log('change position event update_adu_element triggered')
  adu_element_position = adu_element.get('position');
  size_button_element_position = size_button_element.get('position')
  new_adu_width = size_button_element_position.x - adu_element_position.x + DIAMETER / 2
  new_adu_height = size_button_element_position.y - adu_element_position.y + DIAMETER / 2
  if (adu_size_check(new_adu_width, new_adu_height, area_lot, area_house, d_house_back_to_lot_back, width_lot, zone)) {
    
    console.log('oversize')
    // freeze size_button
    update_size_button(adu_element, size_button_element)
  }
  else {
    adu_element.resize(new_adu_width, new_adu_height)
  }
}

// renders adu in box_paper
const render_adu = (init_width, init_height) => {
  if (adu_size_check(init_width, init_height, area_lot, area_house, d_house_back_to_lot_back, width_lot, zone)) {
    console.log('oversize')
    // write something that initializes smaller models
    return render_adu(init_width/2, init_height/2)
  }
  else {
    INIT_X = 10
    INIT_Y = 20
    adu_element = render_rectangle(adu_graph, init_height, init_width, INIT_X, INIT_Y)
    //adu_element.on('change:position', function(adu_element, size_button_element) {
      //console.log('adu changed position');
      //update_size_button(adu_element, size_button_element);
    //});
    return adu_element
  }
}


// renders intial fixed stuff
render_lot(length_lot, width_lot);
render_house(d_house_front_to_lot_front, d_right_of_house, length_lot, width_lot, d_house_back_to_lot_back, d_left_of_house);
render_box_paper(length_lot, d_house_back_to_lot_back, d_wire_to_lot_back, width_lot);
adu_element = render_adu(100, 200);
size_check_results = adu_size_check(100, 200, area_lot, area_house, d_house_back_to_lot_back, width_lot, zone)
size_button_element = render_size_button(adu_element)
update_size_button(adu_element, size_button_element)
adu_element.on('change:position', function(adu_element, size_button_element) {
  console.log('adu changed position');
  update_size_button(adu_element, size_button_element);
});
console.log(size_check_results)
