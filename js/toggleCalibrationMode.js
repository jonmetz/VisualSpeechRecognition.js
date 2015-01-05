function enableButton() {
  var button = document.getElementById('calibrationbutton');
  button.disabled = false;
}

function toggleCalibrationMode() {
  calibrateModeOn = !calibrateModeOn;
  console.log('calibration mode: ' + calibrateModeOn);
}

enableButton();