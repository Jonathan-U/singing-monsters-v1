// Singing Monster — white page, GIF under transparent canvas,
// colorful notes across bottom + bottom voice meter

let mic, micStarted = false;
let lvl = 0, smoothLvl = 0;
let threshold = 0.22;

let idleEl, singEl;

// ===== Notes config =====
const NOTE_CHARS = ["♪","♫","♬","♩","♭","♮"];
const COLORS = [
  "#ff4d6d", "#ef476f", "#ff9f1c", "#ffd166",
  "#2ec4b6", "#06d6a0", "#118ab2", "#8338ec"
];
const NOTE_SIZE_MIN = 28;
const NOTE_SIZE_MAX = 64;
const EMIT_GAIN = 28;     // louder -> more notes
const MAX_NOTES = 450;
// ========================

let notes = [];

function preload() {
  idleEl = createImg('monster_idle.gif');
  singEl = createImg('monster_sing.gif');
}

function setup() {
  // transparent canvas on top (page is white via CSS)
  const c = createCanvas(windowWidth, windowHeight);
  c.position(0, 0);
  c.style('z-index', '5');
  c.style('pointer-events', 'none');

  // center GIFs beneath the canvas
  [idleEl, singEl].forEach(el => {
    el.position(0, 0);
    el.size(windowWidth, windowHeight);
    el.style('object-fit', 'contain');
    el.style('object-position', 'center center');
    el.style('z-index', '1');
    el.hide();
  });
  idleEl.show(); // show idle immediately

  // iOS resume
  window.addEventListener('touchstart', () => {
    try { getAudioContext().resume(); } catch(e){}
  }, {passive:true});
}

function draw() {
  clear(); // keep canvas transparent so GIFs show through

  if (!micStarted) return;

  // mic level -> smoothed
  lvl = constrain(mic.getLevel() * 3, 0, 1);
  smoothLvl = lerp(smoothLvl, lvl, 0.2);

  // swap GIFs + emit notes when loud
  if (smoothLvl > threshold) {
    idleEl.hide(); singEl.show();
    emitNotes(smoothLvl);
  } else {
    singEl.hide(); idleEl.show();
  }

  // draw particles and the meter
  updateAndDrawNotes();
  drawBottomMeter(smoothLvl);
}

// ----- notes -----
function emitNotes(level){
  // how many per frame (rises with loudness)
  const power = (level - threshold) / (1 - threshold); // 0..1
  const toSpawn = max(0, floor(EMIT_GAIN * pow(power, 1.2)));

  for (let i = 0; i < toSpawn && notes.length < MAX_NOTES; i++){
    const x = random(width);      // anywhere along bottom edge
    const y = height - 8;

    const size = random(
      lerp(NOTE_SIZE_MIN, NOTE_SIZE_MAX, power * 0.6),
      lerp(NOTE_SIZE_MIN + 8, NOTE_SIZE_MAX, 0.9)
    );
    const vy = -random(1.8, 3.2) * (0.7 + power);
    const vx = random(-1.2, 1.2);

    const col = color(random(COLORS)); // vivid palette

    notes.push({
      x, y, vx, vy,
      a: 255,
      rot: random(-20, 20),
      size,
      char: random(NOTE_CHARS),
      col
    });
  }
}

function updateAndDrawNotes(){
  noStroke();
  textAlign(CENTER, CENTER);

  for (let i = notes.length - 1; i >= 0; i--){
    const n = notes[i];
    n.x += n.vx;
    n.y += n.vy;
    n.a -= 3; // fade

    push();
    translate(n.x, n.y);
    rotate(radians(n.rot));
    // use palette color with alpha so they are NOT white
    fill(red(n.col), green(n.col), blue(n.col), n.a);
    textSize(n.size);
    text(n.char, 0, 0);
    pop();

    if (n.a <= 0 || n.y < -40) notes.splice(i, 1);
  }
}

// ----- bottom voice meter -----
function drawBottomMeter(level){
  const h = 18;                 // bar height
  const pad = 14;               // page padding
  const x = pad;
  const y = height - h - pad;
  const w = width - pad*2;

  // track
  noStroke();
  fill(235);
  rect(x, y, w, h, 9);

  // filled amount
  const fillW = w * level;
  // gradient-ish color by mixing two palette hues
  const leftC  = color("#118ab2"); // blue
  const rightC = color("#ff9f1c"); // orange
  const cMix = lerpColor(leftC, rightC, level);
  fill(cMix);
  rect(x, y, fillW, h, 9);

  // faint label
  fill(90);
  textAlign(RIGHT, BOTTOM);
  textSize(12);
  text(`${(level*100)|0}%`, width - pad, y - 4);
}

// ----- mic start -----
function touchStarted(){ startMic(); return false; }
function mousePressed(){ startMic(); }
function startMic(){
  if (micStarted) return;
  try{
    userStartAudio();
    mic = new p5.AudioIn();
    mic.start(() => { micStarted = true; }, err => console.error(err));
  }catch(e){ console.error(e); }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
  [idleEl, singEl].forEach(el => el && el.size(windowWidth, windowHeight));
}
