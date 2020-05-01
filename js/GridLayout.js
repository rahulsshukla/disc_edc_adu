
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

var graph = new joint.dia.Graph;

var paper = new joint.dia.Paper({
    el: document.getElementById('ADU-layout'),
    model: graph,
    width: 600,
    height: 400,
    gridSize: 1,
    gridSize: 20,
    drawGrid: true,
    background: {
        color: '#d6ffe3'
    }
});



//function that generates structs on layout
const generateStructs = (height, width) => {
    graph.addCell(
        new joint.shapes.standard.Rectangle({ size: { width: width, height: height }}).attr({body: {fill: '#98b5a1'}}),
    );
};

//call struct function
generateStructs(house_length, house_width)
  
  // Layout the entire graph
  joint.layout.GridLayout.layout(graph, {
    columns: 2,
    columnWidth: 100,
    rowHeight: 70
  });
  
  // Layout the circles with minimal resulting `y` coordinate equals 100.
  var circles = graph.getElements().filter(function(el) {
      return el instanceof joint.shapes.basic.Circle;
  });
  joint.layout.GridLayout.layout(circles, {
      columns: 2,
      marginY: 100
  });