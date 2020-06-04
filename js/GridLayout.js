// Temporary globals

/*const style = window.getComputedStyle(document.querySelector('ADU-layout'))
alert(style)
margin_left = style.margin_left
margin_top = style.margin_top*/

margin_left = 0.2
margin_top = 0.2

length_lot = 600
width_lot = 300
d_house_front_to_lot_front = 80
d_house_back_to_lot_back = 350
d_left_of_house = 40
d_right_of_house = 90
area_house = 43245
area_lot = 180045
d_wire_to_lot_back = 0 // 5ft with scaler
zone = 1

window_width = window.innerWidth*(1-margin_left)
window_height = window.innerHeight*(1-margin_top)
px_per_foot = 1
feet_per_px = 1

adu_initial_width = 100
adu_initial_height = 200
adu_dragged = false
button_locked_into_place = false

DIAMETER = 15 // px diameter of adu size button

// Dimensions: Variable units are feet-based, besides window width/height and px converter vars


function parse_query(){
    var url_string = (window.location.href).toLowerCase()
    var url = new URL(url_string)

    d_house_front_to_lot_front = Number(url.searchParams.get("user_front_lot"))
    d_right_of_house = Number(url.searchParams.get("user_right_lot")) //change this once form takes more inputs
    d_left_of_house = Number(url.searchParams.get("user_left_lot")) // ^
    area_house = Number(url.searchParams.get("user_house"))
    zone =  parseInt(url.searchParams.get("user_zone")[1]) // e.g. convert from "R1" to 1
    d_wire_to_lot_back =  parseInt(url.searchParams.get("user_tele"))
    house_length =  parseInt(url.searchParams.get("house_length"))
    house_width =  parseInt(url.searchParams.get("house_width"))
    d_house_back_to_lot_back = parseInt(url.searchParams.get("user_back_lot"))
    direction = url.searchParams.get("direction")
    console.log(direction)
    length_lot = d_house_front_to_lot_front + house_length + d_house_back_to_lot_back
    width_lot = house_width + d_right_of_house + d_left_of_house
    area_lot = length_lot * width_lot

    px_per_foot = find_rect_fit_ratio(window_width, window_height, length_lot, width_lot)
    feet_per_px = 1/px_per_foot

    adu_initial_width = 0.25*d_house_back_to_lot_back
    adu_initial_height = 0.4*width_lot
    adu_initial_width *= px_per_foot
    adu_initial_height *= px_per_foot

    area_house_in_ft = area_house
    length_lot *= px_per_foot
    width_lot *= px_per_foot
    d_house_front_to_lot_front *= px_per_foot
    d_house_back_to_lot_back *= px_per_foot
    d_left_of_house *= px_per_foot
    d_right_of_house *= px_per_foot
    area_house *= px_per_foot
    area_house *= px_per_foot
    area_lot *= px_per_foot
    area_lot *= px_per_foot
    // if input isnt a number
    if (isNaN(d_wire_to_lot_back)) {
      d_wire_to_lot_back = 10
    }
    d_wire_to_lot_back *= px_per_foot // 5ft with scaler
}


function set_compass(){
  var comp = document.getElementById('compass')
  if(direction == 'n'){

    comp.className = 'compass2'
  }
  else if(direction == 'e'){

    comp.className = 'compass1'
  }
  else if(direction == 's'){

    comp.className = 'compass4'
  }

  else{
    comp.className = 'compass3'
  }
}

// finds scale factor for small rectangle inside big rectangle (note "small" rectangle is ok to be larger in size)
// To clarify, "small rectangle" really means "desired inner rectangle"
// Small width and height are x-span and y-span on screen
const find_rect_fit_ratio = (big_width, big_height, small_width, small_height) => {
  var big_verticality = big_height / big_width
  var small_verticality = small_height / small_width

  var corresponding_lot_dim = 1
  var corresponding_window_dim = 1

  if(big_verticality > small_verticality) {
    //alert("taller window")
    // Window is taller-shaped than lot; lot expands undil sides touch window
    corresponding_lot_dim = small_width
    corresponding_window_dim = big_width
  }
  else {
    //alert("wider or equal window")
    // Window is either wider-shaped than lot or have same shape; lot expands undil top & bottom touch window
    corresponding_lot_dim = small_height
    corresponding_window_dim = big_height
  }

  /*
  // Setting vars for scaling to fit window
  var larger_window_dim = "width"
  var larger_window_dim_mag = big_width
  if(big_height > big_width) {
    larger_window_dim = "height"
    larger_window_dim_mag = big_height
  }
  var corresponding_lot_dim = small_width //length of lot is horizontal onscreen
  if(larger_window_dim == "height") {
    corresponding_lot_dim = small_height // width of the lot is actually vertical on screen
  }*/

  var ratio = corresponding_window_dim / corresponding_lot_dim
  //alert("Big dims: (" + big_width+","+big_height+"); Small dims: (" + small_width+","+small_height+"); Ratio: "+ratio)
  return ratio // what factor to scale lot by visually to fit screen

}

// Initialize part of lot (paper) w/ house on it
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
          color: "#70A978"
      },
      restrictTranslate: true,
      interactive: false
  });
}

//function that generates rectangle onto graph
// input is FEET
const render_rectangle = (graph, height, width, x, y) => {
    var rect = new joint.shapes.standard.Rectangle({ size: {
      width: width, height: height }}).attr({body:
        {fill: "#D8D8D8",
          stroke: '#D8D8D8'}});
    rect.position(x,y);
    graph.addCell(rect);
    return rect;
};

// generates circle onto graph
const render_circle = (graph, diameter, x, y) => {
  var circle = new joint.shapes.standard.Circle();
  circle.attr({
    body: {
      fill:'white',
      stroke: '#2176AE'
    }
  })
  circle.resize(diameter, diameter)
  circle.position(x,y);
  graph.addCell(circle);
  return circle;
}

// MODEL returns house properties from physical inputs
const properties_house = (d_house_front_to_lot_front,
  d_right_of_house, length_lot, width_lot, d_house_back_to_lot_back, d_left_of_house) => {
  // returns the height, width, x, and y of house rectangle
  x = d_house_back_to_lot_back;
  y = d_left_of_house;
  height = width_lot - d_left_of_house - d_right_of_house;
  width = length_lot- d_house_back_to_lot_back - d_house_front_to_lot_front;
  return [height, width, x, y];
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
const max_area_of_adu = (area_lot, area_house, d_house_back_to_lot_back, width_lot, zone, d_wire_to_lot_back) => {
  lot_coverage = zone_lot_coverage(zone)
  lot_max_area = area_lot * lot_coverage - area_house
  back_max_area = (d_house_back_to_lot_back) * (width_lot) * 2/5
  max_area = Math.min(lot_max_area, back_max_area);
  console.log('house area: ' + area_house*feet_per_px*feet_per_px)
  console.log('max lot area: ' + lot_max_area*feet_per_px*feet_per_px)
  console.log('max back area: ' + back_max_area*feet_per_px*feet_per_px)
  console.log('max area: ' + max_area*feet_per_px*feet_per_px)
  return max_area;
}

// renders house rectangle
const render_house = (d_house_front_to_lot_front, d_right_of_house, length_lot, width_lot, d_house_back_to_lot_back, d_left_of_house) => {
  house_properties = properties_house(d_house_front_to_lot_front, d_right_of_house, length_lot, width_lot, d_house_back_to_lot_back,
    d_left_of_house);
  text = 'House Area: '.concat(area_house_in_ft.toString(), ' sq.ft.')
  house_element = render_rectangle(lot_graph, house_properties[0], house_properties[1], house_properties[2], house_properties[3]);
  house_element.attr({label: {
    text: text
  }})
}

const render_box_paper = (length_lot, d_house_back_to_lot_back, d_wire_to_lot_back, width_lot) => {
  boundaries = boundaries_free_space(length_lot, d_house_back_to_lot_back, d_wire_to_lot_back, width_lot);
  var box_paper = new joint.dia.Paper({
        el: document.getElementById('ADU-box'),
        model: adu_graph,
        width: (boundaries[1]-boundaries[0]),
        height: (boundaries[3]-boundaries[2]),
        gridSize: 1,
        gridSize: 1,
        drawGrid: false,
        background: {
            color: "#548759"
        },
        restrictTranslate: true
    });
  adu_box_elem = document.getElementById('ADU-box');
  adu_box_elem.style.top = boundaries[2].toString() + "px";
  adu_box_elem.style.left = boundaries[0].toString() + "px";
}

// MODEL checks if the size of adu is larger exceeds zone restrictions
const adu_size_check = (adu_width, adu_height, area_lot, area_house, d_house_back_to_lot_back, width_lot, zone, d_wire_to_lot_back) => {
  max_area = max_area_of_adu(area_lot, area_house, d_house_back_to_lot_back, width_lot, zone, d_wire_to_lot_back);
  if (adu_width * adu_height > max_area) {
    return true;
  }
  else {
    return false;
  }
}

// MODEL gets button position based on size and position of adu so its bottom right
// takes diameter in PIXEL COORDS, returns IN FOOT COORDINATES
const get_button_position = (adu_element, diameter) => {
  adu_element_position = adu_element.get('position');
  adu_element_size = adu_element.get('size');
  size_button_x = adu_element_position.x + adu_element_size.width;
  size_button_y = adu_element_position.y + adu_element_size.height;
  size_button_x -= diameter / 2
  size_button_y -= diameter / 2
  return [size_button_x, size_button_y]
}

// updates size button when box moves
const update_button_position = (adu_element, size_button_element) => {
  size_button_size = size_button_element.get('size')
  //console.log(size_button_size)
  size_button_position = get_button_position(adu_element, size_button_size.width)
  button_locked_into_place = true
  console.log(size_button_position)
  size_button_element.position(size_button_position[0], size_button_position[1])
  button_locked_into_place = false
  console.log("end update button pos")

  adu_dragged = false
}

// updates adu element when the size button is moved
const update_adu_element = (adu_element, size_button_element) => {
  //console.log('change position event update_adu_element triggered')
  adu_element_position = adu_element.get('position');
  size_button_element_position = size_button_element.get('position')
  console.log("UPDATE ADU ELEMENT - BUTTON POS: "+size_button_element_position)
  new_adu_width = size_button_element_position.x - adu_element_position.x + DIAMETER / 2
  new_adu_height = size_button_element_position.y - adu_element_position.y + DIAMETER / 2

  if (!button_locked_into_place && (new_adu_height<=0 || new_adu_width<=0 ||
    adu_size_check(new_adu_width, new_adu_height, area_lot, area_house,
    d_house_back_to_lot_back, width_lot, zone, d_wire_to_lot_back))) {

    console.log('oversize or undersize')
    // freeze size_button

      console.log("locking button")
      update_button_position(adu_element, size_button_element)

  }
  else if (!button_locked_into_place) {
    console.log("resize: ("+new_adu_width+", "+new_adu_height+")")
    adu_element.resize(new_adu_width, new_adu_height)
  }
}

// renders size dragging button attached to the adu rectangle
const render_size_button = (adu_element) => {
  size_button_position = get_button_position(adu_element, DIAMETER)
  size_button_element = render_circle(adu_graph, DIAMETER, size_button_position[0], size_button_position[1])
  //size_button_element.on('change:position', update_adu_element(size_button_element))
  size_button_element.on('change:position', function(size_button_element) {
    console.log("button moved")
    if(!adu_dragged) {
      console.log("update adu element")
      update_adu_element(adu_element, size_button_element);
      update_adu_label(adu_element)
      update_table(adu_element)
    }
    else {
      console.log("but was dragging, so don't adjust adu size")
    }
  });
  return size_button_element
}

// MODEL returns ADU boundaries free space from physical inputs
const boundaries_free_space = (length_lot, d_house_back_to_lot_back, d_wire_to_lot_back, width_lot) => {
  // returns the x_lower, x_upper, y_lower, y_higher boundaries of adu box
  x_lower = Math.max(3*px_per_foot, 10*px_per_foot - d_wire_to_lot_back);  // size of 10ft with scaler
  x_upper = d_house_back_to_lot_back - 10*px_per_foot;  // size of 10ft with scaler
  y_lower = 3 * px_per_foot;
  y_upper = width_lot - 3 * px_per_foot;
  return [x_lower, x_upper, y_lower, y_upper];
}

const drag_adu = (adu_element, size_button_element) => {
  adu_dragged = true
  update_button_position(adu_element, size_button_element);
}

// MODEL calculated ADU area
const get_adu_area = (adu_element) => {
  adu_element_size = adu_element.get('size');
  return Math.round(adu_element_size.height*feet_per_px * adu_element_size.width* feet_per_px);
}

// RENDER updates adu area label
const update_adu_label = (adu_element) => {
  adu_area = get_adu_area(adu_element)
  text = 'ADU Area: '.concat(adu_area.toString(), ' sq.ft.')
  adu_element.attr({label: {
      text: text
    }})
}

// renders adu in box_paper
// input is in FEET
const render_adu = (init_width, init_height) => {
  if (adu_size_check(init_width, init_height, area_lot, area_house, d_house_back_to_lot_back, width_lot, zone, d_wire_to_lot_back)) {
    //console.log('oversize')
    // write something that initializes smaller models
    return render_adu(init_width/2, init_height/2)
  }
  else {
    INIT_X = 10
    INIT_Y = 20
    adu_element = render_rectangle(adu_graph, init_height, init_width, INIT_X, INIT_Y)
    adu_element.on('change:position', function(adu_element) {
      //console.log('adu changed position');
      drag_adu(adu_element, size_button_element)
    });
    update_adu_label(adu_element)
    return adu_element
  }
}






// getting modal element
var modal = document.getElementById("floorPlanModal");
// getting the floor plan
var img1 = document.getElementById("floorPlan1");
var img2 = document.getElementById("floorPlan2");
// current floorPlan modal
var modalImg = document.getElementById("currentFP");
// getting the label
var labelText = document.getElementById("label");
// on click display the modal and the image with the alt as the label
img1.onclick = function(){
  modal.style.display = "inline";
  labelText.innerHTML = this.alt;
  modalImg.src = this.src;

}

img2.onclick = function(){
  modal.style.display = "inline";
  labelText.innerHTML = this.alt;
  modalImg.src = this.src;

}

// exit button/ the X
var exit = document.getElementsByClassName("closeButton")[0];
joint.dia.Element.define
// close modal on click
exit.onclick = function() {
  modal.style.display = "none";
}


// get list of table elements from inputs/adu element
const get_table_elements = (area_lot, lot_coverage, area_house, d_house_back_to_lot_back, width_lot, zone, d_wire_to_lot_back, adu_element) => {
  area_lot *= feet_per_px
  area_lot *= feet_per_px
  lot_coverage *= 100
  area_house *= feet_per_px
  area_house *= feet_per_px
  area_house = Math.round(area_house)
  lot_max_area = area_lot * lot_coverage - area_house

  back_area = d_house_back_to_lot_back * width_lot
  back_area *= feet_per_px
  back_area *= feet_per_px
  max_back_area = back_area * 2/5
  max_back_area = Math.round(max_back_area)
  console.log(max_back_area)

  adu_element_size = adu_element.get('size');
  adu_length = adu_element_size.width * feet_per_px
  adu_length = Math.round(adu_length)
  adu_width = adu_element_size.height * feet_per_px
  adu_width = Math.round(adu_width)
  adu_area = Math.round(adu_element_size.height*feet_per_px * adu_element_size.width* feet_per_px)
  max_adu_area = max_area_of_adu(area_lot, area_house, d_house_back_to_lot_back, width_lot, zone, d_wire_to_lot_back)
  max_adu_area = Math.round(max_adu_area)

  console.log(max_back_area)
  return [area_lot, lot_coverage, area_house, lot_max_area, back_area, max_back_area, adu_length, adu_width, adu_area, max_adu_area]
}

const render_table = (area_lot, lot_coverage, area_house, d_house_back_to_lot_back, width_lot, zone, d_wire_to_lot_back, adu_element) => {
  table_elements = get_table_elements(area_lot, lot_coverage, area_house, d_house_back_to_lot_back, width_lot, zone, d_wire_to_lot_back, adu_element)
  document.getElementById('lot-area').innerHTML = table_elements[0]
  document.getElementById('lot-coverage').innerHTML = table_elements[1]
  document.getElementById('house-area').innerHTML = table_elements[2]
  document.getElementById('max-adu-area-lot').innerHTML = table_elements[3]

  document.getElementById('backlot-area').innerHTML = table_elements[4]
  document.getElementById('max-adu-area-backlot').innerHTML = table_elements[5]

  document.getElementById('adu-length').innerHTML = table_elements[6]
  document.getElementById('adu-width').innerHTML = table_elements[7]
  document.getElementById('adu-area').innerHTML = table_elements[8]
  document.getElementById('max-adu-area').innerHTML = table_elements[9]
}

const update_table = (adu_element) => {
  adu_element_size = adu_element.get('size');
  adu_length = Math.round(adu_element_size.width * feet_per_px)
  adu_width = Math.round(adu_element_size.height * feet_per_px)
  adu_area = Math.round(adu_element_size.height*feet_per_px * adu_element_size.width* feet_per_px);
  document.getElementById('adu-length').innerHTML = adu_length
  document.getElementById('adu-width').innerHTML = adu_width
  document.getElementById('adu-area').innerHTML = adu_area
}

parse_query()
set_compass()
// Initialize graph
var lot_graph = new joint.dia.Graph;
// New graph for adu graph
var adu_graph = new joint.dia.Graph;

// renders intial fixed stuff
render_lot(length_lot, width_lot);
render_house(d_house_front_to_lot_front, d_right_of_house, length_lot, width_lot, d_house_back_to_lot_back, d_left_of_house);
render_box_paper(length_lot, d_house_back_to_lot_back, d_wire_to_lot_back, width_lot);
adu_element = render_adu(adu_initial_width, adu_initial_height);
//size_check_results = adu_size_check(adu_initial_width, adu_initial_height, area_lot, area_house, d_house_back_to_lot_back, width_lot, zone, d_wire_to_lot_back)
size_button_element = render_size_button(adu_element)
//console.log(size_check_results)
render_table(area_lot, lot_coverage, area_house, d_house_back_to_lot_back, width_lot, zone, d_wire_to_lot_back, adu_element)

