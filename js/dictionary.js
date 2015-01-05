function getDictionary(firebase, cback) {
  var calibrationMatrices = firebase.child("calibrationMatrices");
  calibrationMatrices.on("value", function(snapshot) {
    var value = snapshot.val();
    var dictionary = Object.keys(value);
    cback(dictionary);
  }, function(err) {
       console.log(err);
     });
}

function displayDictionary(dictionary) {
  var ID = "dictionary";
  var dictElem = document.getElementById(ID);
  var html = "";
  for (var wordInd in dictionary) {
    html += (parseInt(wordInd) + 1) + ". " + dictionary[wordInd] + "<br>";
  }
  dictElem.innerHTML = html;
}
var dictionary = getDictionary(firebase, displayDictionary);
