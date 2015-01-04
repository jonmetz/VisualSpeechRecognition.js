var firebase = new Firebase("https://lips.firebaseio.com/");

var makeSaveCalibrationMatrix = function(word, matrix) {
  var invoked = false;
  // console.log(name);
  var saveCalibrationMatrix = function() {
    if (invoked) {
      console.log("saveCalibrationMatrix may only be invoked once");
    }
    else {
      var calibrationMatricesRef = firebase.child("calibrationMatrices");
      var wordRef = calibrationMatricesRef.child(word);
      wordRef.set(matrix);
      invoked = true;
    }
    return invoked;
  };
  return saveCalibrationMatrix;
};

var askSaveCalibrationMatrix = function(word, matrix) {
  var saved;
  var QUESTION_TEXT = "Save calibration matrix for word: " + word;
  var saveCalMat = makeSaveCalibrationMatrix(word, matrix);
  var userAnswer = confirm(QUESTION_TEXT);

  if (userAnswer) {
    saveCalMat();
    saved = true;
  }
  else {
    saved = false;
  }
  return saved;
}