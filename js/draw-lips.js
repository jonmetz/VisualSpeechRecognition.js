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
    point(points[i][0], points[i][1]);
}

function displayPoints(currPos) {
  var lipPoints = currPos.slice(44, 62);
  var noseX = currPos[62][0];
  var noseY = currPos[62][1];
  var positionString = "";
  for(var i = 0; i < lipPoints.length; i++)
  {
    var transX = lipPoints[i][0] - noseX;
    var transY = lipPoints[i][1] - noseY;
    positionString += "Feature point " + i + ptToString(transX, transY);
  }
  document.getElementById('positions').innerHTML = positionString;
}

function getMouthDistances(currPos) {
  var THRESHOLD = 11;

  var distString = "";
  var xDiff = currPos[60][0] - currPos[57][0];
  var yDiff = currPos[60][1] - currPos[57][1];
  var xDiffSq = Math.pow(xDiff,2);
  var yDiffSq = Math.pow(yDiff,2);

  distString += "Difference: " + ptToString(xDiff, yDiff);
  distString += "Squared: " + ptToString(xDiffSq, yDiffSq);

  if(Math.abs(yDiffSq) > THRESHOLD)
    distString += "Speaking!<br/>";

  document.getElementById('mouthDist').innerHTML = distString;
}

function ptToString(x, y)
{
  return "[" + x.toFixed(2) + ", " + y.toFixed(2) + "]<br/>";
}

//add lip points per frame by doing slice and putting into an array, then into deque
// function addPoints(deque, currPos)
// {
//   var lipPoints = currPos.slice(44, 62);
//   deque.push([lipPoints]);
// }
