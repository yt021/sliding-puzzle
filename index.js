var numberSequence = [];
var started = false;
var minutes = 0;
var seconds = 0;
var interval;

$(".btn").click(function () {
  $("#blocker").toggleClass("disabled");
  $(".btn").text("Reset");
  if (!started) {
    generateNumberSequence();
    for (var i = 0; i <= 15; i++) {
      $("#i" + (i + 1)).attr("class", "item " + "p" + numberSequence[i]);
    }
    started = true;
    updateTimer();
    startTimer();
  } else {
    startOver();
  }
});

function startOver() {
  numberSequence = [];
  started = false;
  clearInterval(interval);
  minutes=0;
  seconds=0;
  $("#timer").text("00:00");
  $(".btn").text("Start");
  for (var i = 1; i <= 16; i++) {
    $("#i" + i).attr("class", "item " + "p" + i);
  }
}

function move(input, i) {
  $(input).attr("class", "item " + "p" + i);
}

function generateNumberSequence() {
  while (numberSequence.length < 16) {
    var num = Math.floor(Math.random() * 16) + 1;
    if (!numberSequence.includes(num)) {
      numberSequence.push(num);
    }
  }
  console.log(numberSequence);
}

function updateTimer() {
  var displayMinutes = minutes < 10 ? "0" + minutes : minutes;
  var displaySeconds = seconds < 10 ? "0" + seconds : seconds;
  $("#timer").text(displayMinutes + ":" + displaySeconds);
}
function startTimer() {
  interval = setInterval(function () {
    seconds++;
    if (seconds === 60) {
      seconds = 0;
      minutes++;
    }
    updateTimer();
  }, 1000);
}
