var firebase = new Firebase("https://lips.firebaseio.com/");

var makeSaveCalibrationMatrix = function(name, matrix) {
  var invoked = false;
  var saveCalibrationMatrix = function() {
    if (invoked) {
      console.log("saveCalibrationMatrix may only be invoked once");
      return;
    }
    else {
      var ref = firebase.child("calibrationMatrix");
      ref.set({
        "matrix": matrix,
        "name": name
      });
      return true;
    }
  }
};

var askSaveCalibrationMatrix = function(word, matrix) {
  var saved;
  var QUESTION_TEXT = "Save calibration matrix for word: " + word;
  var saveCalMat = makeSaveCalibrationMatrix(name, matrix);
  var userAnswer = prompt(QUESTION_TEXT);

  if (userAnswer) {
    saveCalMat();
    saved = true;
  }
  else {
    saved = false;
  }
  return saved;
}