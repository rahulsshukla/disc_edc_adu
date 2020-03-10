// Initialize graph
var graph = new joint.dia.Graph;

// Initialize Paper
var paper = new joint.dia.Paper({
    el: document.getElementById('ADU-layout'),
    model: graph,
    width: 800,
    height: 500,
    gridSize: 1,
    gridSize: 1,
    drawGrid: false,
    background: {
        color: "green"
    }
});


//create height and width parameters based on input
var h = parseInt(document.getElementById('input').innerHTML);
var w = parseInt(document.getElementById('input').innerHTML);

//function that generates rectangle onto graph
const generateRectangle = (height, width, x, y) => {
    var rect = new joint.shapes.standard.Rectangle({ size: { width: width, height: height }}).attr({body: {fill: "white"}});
    rect.position(x,y)
    graph.addCell(rect);
};

//call function to generate rectangle on graph
generateRectangle(h, w, 100, 200)


// NOT IN USE resizes and repositions passed in Cell
const setPosition = (element,x,y) => {
  element.position(x,y)
};
const setHeight = (element,width,height) => {
  element.resize(width, height);
};

/*
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
*/