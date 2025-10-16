// === Singing Monster (Final VS Code version) ===
// monster_idle.gif and monster_sing.gif must be in the same folder as this file

let mic;
let micStarted = false;
let micLevel = 0;
let threshold = 0.25; // adjust this to change how loud you need to be

let monsterIdle, monsterSing;

function preload() {
  // load both GIFs directly from the same directory
  monsterIdle = createImg('monster_idle.gif');
  monsterSing = createImg('monster_sing.gif');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);
  textAlign(CENTER, CENTER);
  textSize(24);
  fill(255);
  text('Tap to enable microphone 🎤', width / 2, height / 2);

  // style both GIFs to fill the screen
  monsterIdle.position(0, 0);
  monsterIdle.size(windowWidth, windowHeight);
  monsterIdle.style('object-fit', 'contain');
  monsterIdle.hide();

  monsterSing.position(0, 0);
  monsterSing.size(windowWidth, windowHeight);
  monsterSing.style('object-fit', 'contain');
  monsterSing.hide();

  console.log("Setup complete. Tap screen to start mic.");
}

function draw() {
  // wait until mic is active
  if (!micStarted) return;

  background(0);

  // get mic input level (0–1 range)
  micLevel = mic.getLevel() * 3; // boost sensitivity
  micLevel = constrain(micLevel, 0, 1);

  // show one of the two GIFs based on loudness
  if (micLevel > threshold) {
    monsterIdle.hide();
    monsterSing.show();
  } else {
    monsterSing.hide();
    monsterIdle.show();
  }

  // optional blue bar at the bottom showing input strength
  noStroke();
  fill(0, 150, 255);
  rect(0, height - 30, width * micLevel, 15);
}

// user gesture triggers mic start
function touchStarted() {
  startMic();
  return false;
}
function mousePressed() {
  startMic();
}

function startMic() {
  if (micStarted) return;

  try {
    userStartAudio(); // p5 function that resumes AudioContext
    mic = new p5.AudioIn();
    mic.start(
      () => {
        micStarted = true;
        console.log("✅ Microphone started successfully.");
      },
      (err) => {
        console.error("❌ Microphone error:", err);
      }
    );
  } catch (e) {
    console.error("Mic start failed:", e);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  monsterIdle.size(windowWidth, windowHeight);
  monsterSing.size(windowWidth, windowHeight);
}
