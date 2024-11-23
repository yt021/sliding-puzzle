var numberSequence = [];
var started = false;
var minutes = 0;
var seconds = 0;
var timerInterval;
var flashInterval;

$(".btn").click(function () {
  playRandomSound();
  $("#blocker").toggleClass("disabled");
  $(".btn").text("Reset");
  if (!started) {
    generateNumberSequence();
    for (var i = 0; i <= 15; i++) {
      $(`#i${i + 1}`).attr("class", `item p${numberSequence[i]}`);
    }
    started = true;
    updateTimer();
    startTimer();
    makeMovable();
    timerFlashing("#timer");
  } else {
    startOver();
  }
});

function startOver() {
  numberSequence = [];
  started = false;
  stopTimer();
  minutes = 0;
  seconds = 0;
  $(".yes").addClass("disabled");
  $(".yes2").addClass("disabled");
  $(".timer").removeClass("small-timer");
  stopWinFlashing(".yes");
  stopFlashing("#timer");
  $("#timer").text("00:00");
  $(".btn").text("Start");
  for (var i = 1; i <= 16; i++) {
    $(`#i${i}`).attr("class", `item p${i}`);
  }
}

function generateNumberSequence() {
  while (numberSequence.length < 16) {
    var num = Math.floor(Math.random() * 16) + 1;
    if (!numberSequence.includes(num)) {
      numberSequence.push(num);
    }
  }
}

function updateTimer() {
  var displayMinutes = minutes < 10 ? "0" + minutes : minutes;
  var displaySeconds = seconds < 10 ? "0" + seconds : seconds;
  $("#timer").text(displayMinutes + ":" + displaySeconds);
}

function startTimer() {
  timerInterval = setInterval(function () {
    seconds++;
    if (seconds === 60) {
      seconds = 0;
      minutes++;
    }
    updateTimer();
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function calculateMoves() {
  let availableMoves = [];
  let position = parseInt(findClassName(16).slice(1));
  let row = Math.floor((position - 1) / 4);
  let col = (position - 1) % 4;
  if (col > 0) {
    availableMoves.push(position - 1);
  }
  if (col < 3) {
    availableMoves.push(position + 1);
  }
  if (row > 0) {
    availableMoves.push(position - 4);
  }
  if (row < 3) {
    availableMoves.push(position + 4);
  }
  availableMoves = availableMoves.map((pos) => `p${pos}`);
  return availableMoves;
}

function move(tile1, tile2Class) {
  let tile1Class = findClassName(16);
  $(tile1).attr("class", `item ${tile1Class}`);
  $(`#i16`).attr("class", `item ${tile2Class}`);
  playRandomSound();
  makeMovable();
  if (checkSequence()) {
    stopTimer();
    $(".yes").removeClass("disabled");
    $(".yes2").removeClass("disabled");
    $(".timer").addClass("small-timer");
    winFlashing(".yes");
    playWinSounds();
  }
}

function makeMovable() {
  let movables = calculateMoves();
  $(".movable").off("click").removeClass("movable");
  movables.forEach(function (moveClass) {
    $(`.${moveClass}`)
      .addClass("movable")
      .click(function () {
        move(this, moveClass);
      });
  });
}

function findClassName(input) {
  let className = $(`#i${input}`)
    .attr("class")
    .split(" ")
    .find((c) => c.startsWith("p"));
  return className;
}

function checkSequence() {
  for (let i = 1; i <= 16; i++) {
    let classIndex = parseInt(findClassName(i).slice(1));
    if (i !== classIndex) {
      return false;
    }
  }
  return true;
}

function timerFlashing(selector) {
  flashInterval = setInterval(function () {
    $(selector).toggleClass("timer-flashing");
  }, 1000);
}

function stopFlashing(selector) {
  clearInterval(flashInterval);
  $(selector).removeClass("timer-flashing");
}

function winFlashing(selector) {
  let states = ["win-flashing1", "win-flashing2", "win-flashing3"];
  let currentState = 0;
  flashInterval = setInterval(function () {
    $(selector).removeClass(states.join(" "));
    $(selector).addClass(states[currentState]);
    currentState = (currentState + 1) % states.length;
  }, 333);
}

function stopWinFlashing(selector) {
  clearInterval(flashInterval);
  $(selector).removeClass("win-flashing1");
  $(selector).removeClass("win-flashing2");
}

function playRandomSound() {
  let soundIndex = Math.floor(Math.random() * 9) + 1;
  let audio = new Audio(`Assets/sounds/tiles/t${soundIndex}.wav`);
  audio.volume=0.5;
  audio.play();
}

function playWinSounds() {
  let audio1 = new Audio(`Assets/sounds/win/w1.mp3`);
  let audio2 = new Audio(`Assets/sounds/win/w2.mp3`);
  let audio3 = new Audio(`Assets/sounds/win/w3.mp3`);
  audio2.volume=0.4;
  audio1.play();
  audio2.play();
  audio1.onended = function () {
    audio3.play();
  };
}
