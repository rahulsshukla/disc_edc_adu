// Create your global variables below:
var tracklist = ["Cry Baby", "Dollhouse", "Sippy Cup", "Carousel", "Alphabet Boy", "Soap", "Training Wheels", "Pity Party", "Tag, you're it", "Milk and Cookies"];
var volLevels = [];
var vol_level = 3;
// ^^ global variable initialized to three (default vol) to keep
// track of vol level
var time = document.getElementById("player-time").value;
var timeloop;
// ^^ declare outside helper function to avoid resetting
var songindex = 0;
// ^^ declare globally to avoid resetting when init in next and prevSong


function init() {
  var vol_index = 6;
  var i;
  for (i = 0; i < vol_index; i++) {
    volLevels[i] = document.getElementById("vl" + i);
  }
  for (i = 0; i < 3; i++) {
    volLevels[i].style.background = "#9f5cc4";
  }
  // had to use for loop because if statement inside first for loop
  // wasn't working
}

function volUp() {
  if (vol_level < 6) {
    volLevels[vol_level].style.background = "#9f5cc4";
    vol_level++;
  }
}

function volDown() {
  if (vol_level > 0) {
    volLevels[vol_level-1].style.background = "white";
    vol_level--;
  }
  // var vol_tracker //same purpose as above
  // if (volume == min) {
    //then set lv0 color//
  // }
  // else {
  //  volLevels[i].//color to white//
  //}
}

function switchPlay() {
  if (document.getElementById("play_pause").innerHTML == "pause") {
    document.getElementById("play_pause").innerHTML = "play_arrow";
    clearInterval(timeloop);
  }
  else if (document.getElementById("play_pause").innerHTML == "play_arrow") {
    document.getElementById("play_pause").innerHTML = "pause";
    timeloop = setInterval(timeIncrement, 1000);
  }
}

// helper function for switchPlay //
function timeIncrement() {
  if (time < 180) {
    time++; //concatenates when using += 1 so use ++ instead
    document.getElementById("player-time").value = time;
    document.getElementById("time-elapsed").innerHTML = secondsToMs(time);
  }
  else if (time == 180) {
    nextSong();
  }
}

function nextSong() {
  if (songindex < 9) {
    songindex++;
    document.getElementById("player-song-name").innerHTML = tracklist[songindex];
  }
  else if (songindex == 9) {
    songindex = 0;
    document.getElementById("player-song-name").innerHTML = tracklist[songindex];
  }
  time = 0;
  document.getElementById("player-time").value = time;
  document.getElementById("time-elapsed").innerHTML = secondsToMs(time);
}

function prevSong() {
  if (songindex > 0) {
    songindex--;
    document.getElementById("player-song-name").innerHTML = tracklist[songindex];
  }
  else if (songindex == 0) {
    songindex = 9;
    document.getElementById("player-song-name").innerHTML = tracklist[songindex];
  }
  time = 0;
  document.getElementById("player-time").value = time;
  document.getElementById("time-elapsed").innerHTML = secondsToMs(time);
}

function secondsToMs(d) {
    d = Number(d);

    var min = Math.floor(d / 60);
    var sec = Math.floor(d % 60);

    return `0${min}`.slice(-1) + ":" + `00${sec}`.slice(-2);
}

init();
