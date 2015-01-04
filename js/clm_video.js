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
	startbutton.value = "start";
	startbutton.disabled = null;
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

function startVideo() {
	// start video
	vid.play();
	// start tracking
	ctrack.start(vid);
	// start loop to draw face
	drawLoop();
}

var calibratedInstances = [];
var paths = []; //paths[frame number][point][x or y]
var closedTimer = 0;
var spokenTimer = 0;
var prevIsOpen = false;
var CLOSED_LIMIT = 25*1; //1 second worth of frames
var SPOKEN_LIMIT = 25*.6;
var MIN_PATHS_LENGTH = 25;
function drawLoop() {
  requestAnimFrame(drawLoop);
	overlayCC.clearRect(0, 0, 400, 300);
	// //psrElement.innerHTML = "score :" + ctrack.getScore().toFixed(4);
	// if (ctrack.getCurrentPosition()) {
	// 	ctrack.draw(overlay);
	// }
  var currPos = ctrack.getCurrentPosition()
	if (currPos) {
		drawLips(overlay, currPos);
		displayPoints(currPos);

		if(paths.length < MIN_PATHS_LENGTH || spokenTimer > 0) //fill to 25 or currently speaking
			addPoints(paths, currPos);
		else //more than 25 frames
		{
			while(paths.length >= MIN_PATHS_LENGTH)
				paths.shift() //get rid of oldest by removing from front
			addPoints(paths, currPos); //insert newest frame
		}
		document.getElementById('message').innerHTML = paths.length;

		var isOpen = getMouthDistances(currPos);

		if(isOpen) //currently speaking, increment
		{
			spokenTimer++;
			if(prevIsOpen == false) //went from closed to open
				spokenTimer += closedTimer; //b/c closed interval counts as speaking

			closedTimer = 0;
		}
		if(prevIsOpen == true && isOpen == false) //goes from open to closed
		{
			//increment both timers
			spokenTimer++; //could possibly still be speaking, increment
			closedTimer++; //mouth is closed, so increment
		}
		else if(isOpen == false && closedTimer > 0) //mouth is closed and closedTimer has begun
		{
			if(closedTimer < CLOSED_LIMIT)
				closedTimer++;
			else //reached threshold of closedTimer, assume mouth is closed indefinitely now
			{
				if(spokenTimer > SPOKEN_LIMIT)
				{
					var pathStr = document.getElementById('paths');
					pathStr.innerHTML = "";
					for(var i = 0; i < paths[0].length; i++) //first frame, 18 points
					{
						pathStr.innerHTML += "Point " + i + ": " + ptToString(paths[0][i][0], paths[0][i][1]);
					}
					// firebase.push({
					// 	"word": paths
					// });

					// alert("Word has been spoken! Duration: " + spokenTimer + " frames");
					var pathsCopy = [];
					while(paths.length > 0)
						pathsCopy.push(paths.shift());

					var calibrateModeOn = false;
					if(calibrateModeOn) //calibration mode
					{
						var inputWord = prompt("What word spoken?");
						askSaveCalibrationMatrix(inputWord, pathsCopy);
					}
					else //testing mode
					{
						getBestWord(pathsCopy);
					}
				}
				closedTimer = spokenTimer = 0;
			}

		}

		prevIsOpen = isOpen;
		document.getElementById('spokenTimer').innerHTML = spokenTimer + "<br/>";
		document.getElementById('closedTimer').innerHTML = closedTimer + "<br/>";
	}
}

// update stats on every iteration
document.addEventListener('clmtrackrIteration', function(event) {
	stats.update();
}, false);
