var vid = document.getElementById('videoel');
var overlay = document.getElementById('overlay');
var overlayCC = overlay.getContext('2d');

var ctrack = new clm.tracker({useWebGL : true});
ctrack.init(pModel);

stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.top = '0px';
document.getElementById('container').appendChild( stats.domElement );

function enablestart() {
  var startbutton = document.getElementById('startbutton');
  startbutton.value = "my mouth is closed";
  startbutton.disabled = null;
  // start tracking
  ctrack.start(vid);
  // start loop to draw face
  drawLoop();
}

function setThreshold() {
  var currPos = ctrack.getCurrentPosition()
  var yDiff = currPos[60][1] - currPos[57][1];
  var yDiffSq = Math.pow(yDiff,2);
  // global var THRESHOLD to tell if mouth closed
  THRESHOLD = Math.abs(yDiffSq);

  var startbutton = document.getElementById('startbutton');
  startbutton.value = 'recording...';
  startbutton.disabled = true;
  startRec();
}

function drawLoop() {
  requestAnimFrame(drawLoop);
  overlayCC.clearRect(0, 0, 400, 300);

  var currPos = ctrack.getCurrentPosition()
  if (currPos) {
    drawLips(overlay, currPos);
    displayPoints(currPos);
  }
}

var insertAltVideo = function(video) {
  if (supports_video()) {
    if (supports_ogg_theora_video()) {
      video.src = "./media/cap12_edit.ogv";
    } else if (supports_h264_baseline_video()) {
      video.src = "./media/cap12_edit.mp4";
    } else {
      return false;
    }
    //video.play();
    return true;
  } else return false;
}
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
window.URL = window.URL || window.webkitURL || window.msURL || window.mozURL;

// check for camerasupport
if (navigator.getUserMedia) {
  // set up stream
  var videoSelector = {video : true};
  if (window.navigator.appVersion.match(/Chrome\/(.*?) /)) {
    var chromeVersion = parseInt(window.navigator.appVersion.match(/Chrome\/(\d+)\./)[1], 10);
    if (chromeVersion < 20) {
      videoSelector = "video";
    }
  };

  navigator.getUserMedia(videoSelector, function( stream ) {
    if (vid.mozCaptureStream) {
      vid.mozSrcObject = stream;
    } else {
      vid.src = (window.URL && window.URL.createObjectURL(stream)) || stream;
    }
    vid.play();
  }, function() {
       insertAltVideo(vid);
       document.getElementById('gum').className = "hide";
       document.getElementById('nogum').className = "nohide";
       alert("There was some problem trying to fetch video from your webcam, using a fallback video instead.");
     });
} else {
  insertAltVideo(vid);
  document.getElementById('gum').className = "hide";
  document.getElementById('nogum').className = "nohide";
  alert("Your browser does not seem to support getUserMedia, using a fallback video instead.");
}

vid.addEventListener('canplay', enablestart, false);

var noseLength;
function startRec() {
  //load nose length first
  firebase.child("noseLength").on("value", function(snapshot) {
    noseLength = snapshot.val();

    // start video
    vid.play();
    // start tracking
    // ctrack.start(vid);
    // start loop to draw face
    calcLoop();
  });
}

var calibrateModeOn = false; //determine if calibrating or testing
var calibratedInstances = [];
var scale = 1;
var paths = []; //paths[frame number][point][x or y]
var closedTimer = 0;
var spokenTimer = 0;
var prevIsOpen = false;
var CLOSED_LIMIT = 25*1; //1 "second" worth of frames
var SPOKEN_LIMIT = 25*.6;
var MIN_PATHS_LENGTH = 25;

function calcLoop() {
  requestAnimFrame(calcLoop);
  overlayCC.clearRect(0, 0, 400, 300);

  var currPos = ctrack.getCurrentPosition()


  if (currPos) {
    drawLips(overlay, currPos);
    displayPoints(currPos);

	if(calibrateModeOn)
		scale = 1;
	else
		scale = noseLength / Math.abs(currPos[33][1] - currPos[62][1]);

    if(paths.length < MIN_PATHS_LENGTH || spokenTimer > 0) //fill to 25 or currently speaking
      addPoints(paths, currPos);
    else { //more than 25 frames
      while(paths.length >= MIN_PATHS_LENGTH)
        paths.shift() //get rid of oldest by removing from front
      addPoints(paths, currPos); //insert newest frame
    }
    document.getElementById('message').innerHTML = paths.length;

    var isOpen = getMouthDistances(currPos);

    if(isOpen) { //currently speaking, increment
      spokenTimer++;
      if(prevIsOpen == false) //went from closed to open
        spokenTimer += closedTimer; //b/c closed interval counts as speaking

      closedTimer = 0;
    }
    if(prevIsOpen == true && isOpen == false) { //goes from open to closed
      //increment both timers
      spokenTimer++; //could possibly still be speaking, increment
      closedTimer++; //mouth is closed, so increment
    } else if(isOpen == false && closedTimer > 0) { //mouth is closed and closedTimer has begun
      if(closedTimer < CLOSED_LIMIT)
        closedTimer++;
      else { //reached threshold of closedTimer, assume mouth is closed indefinitely now
        //code executes when user finishes speaking!
        if(spokenTimer > SPOKEN_LIMIT) {
          // var pathStr = document.getElementById('paths');
          // pathStr.innerHTML = "";
          // for(var i = 0; i < paths[0].length; i++) { //first frame, 18 points
          //   pathStr.innerHTML += "Point " + i + ": " + ptToString(paths[0][i][0], paths[0][i][1]);
          // }

          //deep copy of paths
          var pathsCopy = [];
          while(paths.length > 0)
            pathsCopy.push(paths.shift());

          if(calibrateModeOn) { //calibration mode
          	spokenTimer = 0;
            var inputWord = prompt("What word spoken?");
            askSaveCalibrationMatrix(inputWord, pathsCopy);
            recordNoseLength(currPos); //assumes user's head is in a good position
          } else { //testing mode
            getBestWord(pathsCopy);
          }

          paths = [];
        }
        closedTimer = spokenTimer = 0;
      }
    }


}

// update stats on every iteration
document.addEventListener('clmtrackrIteration', function(event) {
  stats.update();
}, false);
