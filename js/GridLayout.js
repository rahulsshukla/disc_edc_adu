
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


graph.addCells([
    new joint.shapes.standard.Rectangle({ size: { width: 80, height: 50 }}).attr({body: {fill: '#98b5a1'}}),
    new joint.shapes.basic.Rect({ size: { width: 50, height: 50 }}),
    new joint.shapes.basic.Circle({ size: { width: 80, height: 50 }}),
    new joint.shapes.basic.Circle({ size: { width: 50, height: 50 }})
  ]);
  
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