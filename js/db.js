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
  return saveCalibrationMatrix;

};