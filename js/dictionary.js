function log(msg) {
  console.log(msg);
}

function getDictionary(firebase, cback, localStorage) {
  function saveAndDisplayWords(snapshot) {
    var value = snapshot.val();
    console.log('displaying current dictionary');
    var wordList = calMatList2WordList(value);
    cback(wordList);
    localStorage.setItem("dictionary", wordList);
  }
  getWordsFromCalMatList(saveAndDisplayWords, log);
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
  var oldDictStr = localStorage.dictionary;
  if (oldDictStr) {
    var oldDict = oldDictStr.split(",");
    if (oldDict) {
      displayDictionary(oldDict);
      console.log("displaying old dictionary from localStorage temporarily");
    }
  }
}

function doOnLoad() {
  displayOldDict();
  getDictionary(firebase, displayDictionary, localStorage);
}
