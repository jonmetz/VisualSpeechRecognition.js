function getDictionary(firebase, cback, localStorage) {
  var calibrationMatrices = firebase.child("calibrationMatrices");
  calibrationMatrices.on("value", function(snapshot) {
    var value = snapshot.val();
    var dictionary = Object.keys(value);
    console.log('displaying current dictionary');
    cback(dictionary);
    localStorage.setItem("dictionary", dictionary);
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

function displayOldDict() {
  var oldDict = localStorage.dictionary.split(",");
  if (oldDict) {
    displayDictionary(oldDict);
    console.log("displaying old dictionary from localStorage temporarily");
  }
}
function doOnLoad() {
  displayOldDict();
  var dictionary = getDictionary(firebase, displayDictionary, localStorage);
}
