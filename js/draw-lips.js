function drawLips(canvas, currPos) {
	var cc = canvas.getContext('2d');
	cc.fillStyle = "rgb(200,200,200)";
	cc.strokeStyle = "rgb(255,0,0)";
  var lipPoints = currPos.slice(44, 62);
  drawPoints(cc, lipPoints);


}

function drawPoints(cc, points) {

  //  Keep in mind that we are drawing to South-East direction, and if this is the edge, there can be a problem. But you can also draw in any other direction.
  // https://stackoverflow.com/questions/7812514/drawing-a-dot-on-html5-canvas

  function point(x, y){
  cc.beginPath();
  cc.moveTo(x, y);
  cc.lineTo(x+1, y+1);
  cc.stroke();
  }
  for (var i = 0; i < points.length; i++)
    point(points[i][0], points[i][1])
}