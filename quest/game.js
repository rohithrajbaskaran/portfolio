// Rohith's Quest — a side-scrolling platformer portfolio. All art is drawn in code.
import { ZONES, TOKENS, SKILL_CRATES } from "../drive/content.js";

/* =========================================================================
   Helpers
   ========================================================================= */
const $ = (id) => document.getElementById(id);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const FONT = '"Inter", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif';
const PIX = '"Press Start 2P", ui-monospace, monospace';
const isTouch = window.matchMedia("(hover: none)").matches || "ontouchstart" in window;
function rgb(hex) { const n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function mix(a, b, t) { const A = rgb(a), B = rgb(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], t))).join(",")})`; }
function mulberry32(seed) {
  return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// Section content is shared with the driving game; a few labels fit a platformer better.
const Z = Object.fromEntries(ZONES.map((z) => [z.id, { ...z }]));
Z.skills.title = "Skill Bricks";
Z.skills.sub = "Bump them from below";
Z.skills.html = Z.skills.html.replace("Smash the crates.", "Break the bricks.");
Z.archive.title = "More Repos";
Z.writing.title = "The Library";

/* =========================================================================
   Characters (original designs)
   ========================================================================= */
const CHARS = [
  { id: "bo", name: "Bo", role: "Cheeky kid", color: "#e8322f", perk: "Super-high jump", w: 12, h: 21, speed: 118, jump: 505, ability: null, stats: [55, 100, 45] },
  { id: "kai", name: "Kai", role: "Spiky-haired fighter", color: "#f27d1a", perk: "Air dash · Shift / B", w: 12, h: 23, speed: 150, jump: 450, ability: "dash", stats: [100, 70, 90] },
  { id: "zap", name: "Zap", role: "Electric critter", color: "#d9a900", perk: "Double jump", w: 13, h: 16, speed: 132, jump: 425, ability: "double", stats: [80, 85, 85] },
  { id: "blossom", name: "Princess Blossom", role: "Royal floater", color: "#ff5fa8", perk: "Float · hold jump", w: 12, h: 25, speed: 120, jump: 460, ability: "float", stats: [60, 75, 100] },
];

const SKIN = "#ffd2a8";
// Draw a character into a low-res canvas. (x, y) is the top-left of its hitbox.
function drawChar(g, c, x, y, facing, pose, frame, t = 0) {
  const SW = c.id === "zap" ? 18 : 16;
  const SH = { bo: 22, kai: 24, zap: 17, blossom: 26 }[c.id];
  const ox = Math.round(x + c.w / 2 - SW / 2), oy = Math.round(y + c.h - SH);
  const R = (rx, ry, rw, rh, col) => { g.fillStyle = col; g.fillRect(ox + (facing > 0 ? rx : SW - rx - rw), oy + ry, rw, rh); };
  const run = pose === "run", air = pose === "jump" || pose === "fall";
  const step = run ? (frame % 2 === 0 ? 1 : -1) : 0;
  const la = step, lb = -step;
  const armsUp = air;

  if (c.id === "bo") {
    const HAIR = "#1b1b1b";
    R(3, 0, 10, 2, HAIR); R(2, 1, 12, 3, HAIR);
    R(2, 3, 12, 7, SKIN); R(3, 10, 10, 1, SKIN); R(2, 3, 2, 2, HAIR);
    R(5, 4, 3, 2, "#111"); R(10, 4, 3, 2, "#111");
    R(6, 7, 1, 2, "#111"); R(11, 7, 1, 2, "#111");
    R(3, 8, 2, 1, "#ff9aa2"); R(12, 8, 2, 1, "#ff9aa2");
    R(8, 9, 3, 1, "#b3261e");
    R(3, 11, 10, 5, "#e8322f"); R(3, 11, 10, 1, "#ff5b54");
    if (armsUp) { R(1, 8, 2, 4, SKIN); R(13, 8, 2, 4, SKIN); } else { R(1, 12 + (run ? step : 0), 2, 3, SKIN); R(13, 12 - (run ? step : 0), 2, 3, SKIN); }
    R(3, 16, 10, 3, "#f5c518");
    if (air) { R(4, 18, 3, 2, SKIN); R(9, 19, 3, 2, SKIN); R(4, 20, 3, 1, "#fff"); R(9, 21, 3, 1, "#fff"); }
    else { R(4 + la, 19, 3, 2, SKIN); R(9 + lb, 19, 3, 2, SKIN); R(4 + la, 21, 3, 1, "#fff"); R(9 + lb, 21, 3, 1, "#fff"); }
  } else if (c.id === "kai") {
    const HAIR = "#141414", OR = "#f27d1a", ORD = "#c85f0c", BL = "#2a4fb8";
    R(2, 1, 3, 2, HAIR); R(5, 0, 2, 3, HAIR); R(8, 0, 3, 2, HAIR); R(11, 1, 3, 2, HAIR); R(13, 3, 3, 2, HAIR); R(0, 3, 3, 2, HAIR); R(1, 5, 2, 2, HAIR);
    R(3, 2, 11, 4, HAIR);
    R(4, 5, 9, 5, SKIN); R(4, 5, 2, 1, HAIR); R(9, 5, 3, 1, HAIR);
    R(7, 6, 2, 1, HAIR); R(10, 6, 2, 1, HAIR); R(8, 7, 1, 1, "#111"); R(11, 7, 1, 1, "#111");
    R(9, 9, 2, 1, "#a33");
    R(6, 10, 4, 1, SKIN);
    R(3, 11, 10, 5, OR); R(6, 11, 4, 2, BL); R(7, 13, 2, 1, BL); R(3, 11, 1, 5, ORD);
    if (armsUp) { R(1, 7, 2, 4, SKIN); R(13, 7, 2, 4, SKIN); R(1, 11, 2, 1, BL); R(13, 11, 2, 1, BL); }
    else { R(1, 11, 2, 4, SKIN); R(13, 11, 2, 4, SKIN); R(1, 14, 2, 1, BL); R(13, 14, 2, 1, BL); }
    R(3, 16, 10, 1, BL);
    if (air) { R(3, 17, 4, 3, OR); R(9, 17, 4, 4, OR); R(3, 20, 4, 3, BL); R(9, 21, 4, 3, BL); }
    else { R(3 + la, 17, 4, 4, OR); R(9 + lb, 17, 4, 4, OR); R(3 + la, 21, 4, 3, BL); R(9 + lb, 21, 4, 3, BL); R(3 + la, 21, 4, 1, "#d33"); R(9 + lb, 21, 4, 1, "#d33"); }
  } else if (c.id === "zap") {
    const Y = "#ffd51c", YD = "#e0b000", B = "#111", BR = "#8a5a1f";
    const wag = Math.round(Math.sin(t * 10)) ;
    R(1, 3 + wag, 3, 3, Y); R(0, 6, 3, 2, Y); R(2, 8, 3, 2, Y); R(3, 10, 2, 2, BR);
    R(5, 0, 2, 5, Y); R(5, 0, 2, 2, B); R(14, 0, 2, 5, Y); R(14, 0, 2, 2, B);
    R(5, 4, 11, 6, Y); R(6, 3, 9, 1, Y);
    R(9, 6, 1, 2, B); R(14, 6, 1, 2, B); R(9, 6, 1, 1, "#fff");
    R(6, 8, 2, 2, "#ff4b3e"); R(15, 8, 2, 1, "#ff4b3e");
    R(12, 8, 1, 1, B);
    R(6, 10, 10, 5, Y); R(6, 11, 3, 1, BR); R(6, 13, 2, 1, BR);
    if (armsUp) { R(9, 8, 2, 3, YD); R(14, 9, 2, 3, YD); } else { R(9, 11, 2, 2, YD); R(13, 11, 2, 2, YD); }
    if (air) { R(6, 14, 3, 2, YD); R(12, 15, 3, 2, YD); } else { R(6 + la, 15, 3, 2, YD); R(12 + lb, 15, 3, 2, YD); }
  } else {
    const G = "#f6c343", HAIR = "#ffd56b", HD = "#e9b949", PK = "#ff8fc8", PD = "#ff5fa8";
    R(5, 0, 1, 1, G); R(7, 0, 2, 1, G); R(10, 0, 1, 1, G); R(5, 1, 6, 2, G); R(7, 1, 2, 1, "#3aa0ff");
    R(3, 3, 10, 3, HAIR); R(2, 5, 2, 11, HAIR); R(12, 5, 2, 11, HAIR); R(2, 14, 2, 2, HD); R(12, 14, 2, 2, HD);
    R(4, 5, 8, 6, SKIN); R(4, 5, 8, 1, HAIR); R(4, 6, 2, 1, HAIR);
    R(7, 7, 1, 2, "#2a62c9"); R(10, 7, 1, 2, "#2a62c9"); R(6, 9, 1, 1, "#ffb3c7"); R(11, 9, 1, 1, "#ffb3c7");
    R(8, 10, 2, 1, "#e0457b");
    R(4, 11, 8, 4, PK); R(7, 11, 2, 2, "#3aa0ff");
    R(2, 11, 2, 2, "#ffc2e0"); R(12, 11, 2, 2, "#ffc2e0");
    if (armsUp) { R(1, 8, 2, 3, "#fff"); R(13, 8, 2, 3, "#fff"); } else { R(2, 13, 2, 3, "#fff"); R(12, 13, 2, 3, "#fff"); }
    const sway = run ? step : 0, puff = pose === "fall" ? 1 : 0;
    R(3, 15, 10, 3, PK); R(2 + sway, 18, 12, 3, PK); R(1 + sway - puff, 21, 14 + puff * 2, 4, PD); R(1 + sway - puff, 25, 14 + puff * 2, 1, "#e04d93");
    R(4, 16, 1, 9, "rgba(255,255,255,0.25)");
  }
}

/* =========================================================================
   Level
   ========================================================================= */
const T = 16, H = 15, GY = 13, VIEW_H = H * T;
const EMPTY = 0, GROUND = 1, BRICK = 2, QB = 3, USED = 4, STONE = 5, PIPE = 6;
const SOLID = [false, true, true, true, true, true, true];
const W = 268;
const map = Array.from({ length: H }, () => new Uint8Array(W));
const blocks = new Map();
const pipes = [], coins = [], stats = [], enemies = [], sections = [], labels = [], hints = [], decor = [];
const zonePos = {};
const key = (x, y) => x + "," + y;

const ground = (a, b) => { for (let x = a; x < b; x++) for (let y = GY; y < H; y++) map[y][x] = GROUND; };
const hole = (a, b) => { for (let x = a; x < b; x++) for (let y = GY; y < H; y++) map[y][x] = EMPTY; };
const column = (x, h) => { for (let i = 0; i < h; i++) map[GY - 1 - i][x] = STONE; };
const row = (a, b, y, type = STONE) => { for (let x = a; x < b; x++) map[y][x] = type; };
const brick = (x, y) => { map[y][x] = BRICK; };
const coinBlock = (x, y) => { map[y][x] = QB; blocks.set(key(x, y), { kind: "coin" }); };
const skill = (x, y, label) => { map[y][x] = BRICK; blocks.set(key(x, y), { kind: "skill", label }); };
const coin = (x, y) => coins.push({ x: x * T + 4, y: y * T + 2, taken: false });
const coinRow = (a, b, y) => { for (let x = a; x < b; x++) coin(x, y); };
const enemy = (x) => enemies.push({ x: x * T, y: GY * T - 11, w: 14, h: 11, vx: -26, vy: 0, alive: true, dead: 0, home: x * T, onGround: false });
const stat = (x, y, i) => stats.push({ x: x * T, y: y * T, i, taken: false });
const hint = (x, y, text) => hints.push({ x: x * T, y: y * T, text });
function info(x, y, id) {
  map[y][x] = QB;
  blocks.set(key(x, y), { kind: "info", zone: id });
  zonePos[id] = { x: (x - 1.2) * T, y: GY * T };
  labels.push({ x: x * T + 8, y: y * T - 5, text: Z[id].title, color: Z[id].color });
}
function pipe(x, h, id) {
  for (let i = 0; i < h; i++) { map[GY - 1 - i][x] = PIPE; map[GY - 1 - i][x + 1] = PIPE; }
  pipes.push({ x, h, zone: id, color: Z[id].color });
  zonePos[id] = { x: x * T + 10, y: (GY - h) * T, pipe: true };
  labels.push({ x: x * T + 16, y: (GY - h) * T - 8, text: Z[id].title, color: Z[id].color, pipe: true });
}
function section(x, num, id) { sections.push({ x, num, title: { 1: "About", 2: "Experience", 3: "Projects", 4: "Skills", 5: "Writing", 6: "Contact" }[num], zone: id }); }

const FLAG_X = 246, CASTLE_X = 252;
(function buildLevel() {
  ground(0, W);
  hint(9, 8, isTouch ? "Tap ◀ ▶ to move, A to jump" : "← → to move  ·  Space to jump");
  coinRow(15, 19, 8);
  enemy(25);

  section(30, 1, "about");
  hint(32, 6.5, "Hit ? blocks from below");
  brick(34, 9); info(35, 9, "about"); coinBlock(36, 9); brick(37, 9);
  column(42, 1); column(43, 2); column(44, 3); hole(45, 47); column(47, 3); column(48, 2); column(49, 1);
  stat(45.5, 7.5, 0);
  enemy(54);

  section(58, 2, "plutus");
  info(63, 9, "plutus");
  coinRow(66, 69, 6);
  stat(68, 8, 1);
  enemy(71);
  row(74, 80, 11);
  info(77, 7, "eatme");
  hole(83, 85);
  coinRow(82, 86, 9);
  enemy(90);

  section(94, 3, "itgc");
  hint(96, 7, isTouch ? "Stand on a pipe and tap ▼" : "Stand on a pipe and press ↓");
  pipe(101, 2, "itgc");
  enemy(108);
  pipe(113, 3, "rag");
  stat(113.5, 6.5, 2);
  coinRow(118, 121, 8);
  pipe(125, 3, "autofill");
  enemy(131);
  coinBlock(134, 9); brick(135, 9); coinBlock(136, 9);
  pipe(141, 2, "finbud");
  enemy(147);
  pipe(153, 3, "archive");

  section(160, 4, "skills");
  info(164, 9, "skills");
  for (let i = 0; i < 10; i++) skill(168 + i, 9, SKILL_CRATES[i]);
  enemy(176);
  column(181, 1);
  row(183, 194, 10);
  for (let i = 0; i < 10; i++) skill(184 + i, 6, SKILL_CRATES[10 + i]);
  enemy(190);

  section(199, 5, "writing");
  info(205, 9, "writing");
  column(211, 1); column(212, 2);
  stat(212, 8.5, 3);
  coinRow(215, 219, 8);
  enemy(221);

  section(225, 6, "contact");
  hint(226, 6.5, "Reach the flag to say hello");
  for (let i = 0; i < 8; i++) column(231 + i, i + 1);
  zonePos.contact = { x: (FLAG_X - 4) * T, y: GY * T };

  // Decorations
  const rnd = mulberry32(3);
  for (let x = 2; x < W - 4; x += 3 + Math.floor(rnd() * 5)) {
    if (map[GY][x] !== GROUND || map[GY - 1][x] || map[GY - 1][x + 1] || x > CASTLE_X - 3 && x < CASTLE_X + 10) continue;
    decor.push({ type: rnd() < 0.65 ? "bush" : "flower", x: x * T, s: 1 + Math.floor(rnd() * 2), c: rnd() });
  }
})();
const LEVEL_W = W * T;

/* =========================================================================
   Canvas & layout
   ========================================================================= */
if (!CanvasRenderingContext2D.prototype.roundRect) CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h) { this.rect(x, y, w, h); };
const main = $("game"), mctx = main.getContext("2d");
const lo = document.createElement("canvas"), g = lo.getContext("2d");
let scale = 3, viewW = 400, gameTop = 0, gameH = 720, dpr = 1;
function layout() {
  const w = window.innerWidth, h = window.innerHeight;
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  main.width = Math.round(w * dpr); main.height = Math.round(h * dpr);
  const portrait = h > w * 1.05;
  if (portrait) {
    // Fill the space between the HUD and the touch pad.
    const top = 112, bottom = isTouch ? 200 : 24, avail = h - top - bottom;
    scale = Math.max(1, Math.min(avail / VIEW_H, w / 200));
    gameH = VIEW_H * scale;
    gameTop = top + Math.max(0, (avail - gameH) / 2);
  } else {
    scale = Math.max(1, h / VIEW_H);
    gameH = VIEW_H * scale;
    gameTop = (h - gameH) / 2;
  }
  viewW = Math.ceil(w / scale);
  lo.width = viewW; lo.height = VIEW_H;
  g.imageSmoothingEnabled = false;
}
window.addEventListener("resize", layout);
layout();

/* =========================================================================
   State
   ========================================================================= */
let char = CHARS[1];
try { const s = localStorage.getItem("quest-char"); if (s) char = CHARS.find((c) => c.id === s) || char; } catch (e) { /* storage unavailable */ }
const p = { x: 3 * T, y: GY * T - char.h, w: char.w, h: char.h, vx: 0, vy: 0, facing: 1, onGround: false, coyote: 0, buffer: 0, airJumps: 0, dash: 0, dashCd: 0, invuln: 0, state: "play", t: 0, anim: 0 };
let camX = 0, started = false, paused = true, elapsed = 0;
let hearts = 3, coinCount = 0, checkpoint = 3, bugsFixed = 0, skillsBroken = 0;
const discovered = new Set();
let statsTaken = 0, finale = 0;
const particles = [], texts = [], sparks = [];

/* =========================================================================
   Input
   ========================================================================= */
const held = new Set(), pressedNow = new Set();
const KEYMAP = { ArrowLeft: "left", KeyA: "left", ArrowRight: "right", KeyD: "right", Space: "jump", ArrowUp: "jump", KeyW: "jump", KeyZ: "jump", ArrowDown: "down", KeyS: "down", ShiftLeft: "ability", ShiftRight: "ability", KeyX: "ability" };
function press(k) { if (!held.has(k)) pressedNow.add(k); held.add(k); }
window.addEventListener("keydown", (e) => {
  if (!$("select").hidden) return selectKeys(e);
  if (!$("modal").hidden) {
    const tag = e.target.tagName;
    if (e.code === "Escape" || (e.code === "Enter" && tag !== "A" && tag !== "BUTTON")) { e.preventDefault(); closePanel(); }
    return;
  }
  if (!$("levels").hidden) { if (e.code === "Escape" || e.code === "KeyL") closeLevels(); return; }
  if (e.code === "KeyL" || e.code === "Escape") { openLevels(); return; }
  const k = KEYMAP[e.code];
  if (k) { e.preventDefault(); if (!e.repeat) press(k); }
});
window.addEventListener("keyup", (e) => { const k = KEYMAP[e.code]; if (k) held.delete(k); });
window.addEventListener("blur", () => held.clear());
document.querySelectorAll(".pb").forEach((b) => {
  const k = b.dataset.key;
  b.addEventListener("pointerdown", (e) => { e.preventDefault(); b.setPointerCapture(e.pointerId); press(k); b.classList.add("on"); });
  const up = () => { held.delete(k); b.classList.remove("on"); };
  b.addEventListener("pointerup", up); b.addEventListener("pointercancel", up); b.addEventListener("lostpointercapture", up);
});

/* =========================================================================
   Audio (off by default) — tiny square-wave bleeps
   ========================================================================= */
const audio = { ctx: null, on: false };
function tone(freq, dur, type = "square", vol = 0.06, slide = 0, delay = 0) {
  if (!audio.on || !audio.ctx) return;
  const c = audio.ctx, now = c.currentTime + delay;
  const o = c.createOscillator(), gn = c.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, now);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), now + dur);
  gn.gain.setValueAtTime(vol, now); gn.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  o.connect(gn).connect(c.destination); o.start(now); o.stop(now + dur + 0.02);
}
const sfx = {
  jump: () => tone(320, 0.16, "square", 0.05, 380),
  jump2: () => tone(520, 0.14, "square", 0.05, 500),
  coin: () => { tone(988, 0.07, "square", 0.05); tone(1319, 0.22, "square", 0.05, 0, 0.07); },
  bump: () => tone(140, 0.09, "triangle", 0.12, -60),
  brk: () => tone(90, 0.18, "sawtooth", 0.06, -40),
  stomp: () => tone(260, 0.1, "square", 0.06, -180),
  hurt: () => tone(400, 0.35, "sawtooth", 0.05, -300),
  pipe: () => { for (let i = 0; i < 3; i++) tone(300 - i * 70, 0.1, "square", 0.05, 0, i * 0.1); },
  dash: () => tone(700, 0.12, "sawtooth", 0.04, -500),
  power: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.12, "square", 0.05, 0, i * 0.08)),
  fanfare: () => [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, 0.18, "square", 0.05, 0, i * 0.14)),
};
$("btn-sound").addEventListener("click", () => {
  if (!audio.ctx) { const C = window.AudioContext || window.webkitAudioContext; if (C) audio.ctx = new C(); }
  audio.on = !audio.on;
  if (audio.ctx && audio.ctx.state === "suspended") audio.ctx.resume();
  $("btn-sound").classList.toggle("sound-on", audio.on);
  $("btn-sound").setAttribute("aria-pressed", String(audio.on));
  $("btn-sound").setAttribute("aria-label", audio.on ? "Turn sound off" : "Turn sound on");
  $("btn-sound").blur();
  if (audio.on) sfx.coin();
});

/* =========================================================================
   Physics
   ========================================================================= */
const GRAV = 1500;
function solidAt(tx, ty) {
  if (tx < 0 || tx >= W) return true;
  if (ty < 0 || ty >= H) return false;
  return SOLID[map[ty][tx]];
}
function moveX(e, dx) {
  e.x += dx;
  const top = Math.floor(e.y / T), bot = Math.floor((e.y + e.h - 0.01) / T);
  if (dx > 0) {
    const tx = Math.floor((e.x + e.w - 0.01) / T);
    for (let ty = top; ty <= bot; ty++) if (solidAt(tx, ty)) { e.x = tx * T - e.w; e.vx = 0; return true; }
  } else if (dx < 0) {
    const tx = Math.floor(e.x / T);
    for (let ty = top; ty <= bot; ty++) if (solidAt(tx, ty)) { e.x = (tx + 1) * T; e.vx = 0; return true; }
  }
  return false;
}
function moveY(e, dy) {
  e.y += dy;
  e.onGround = false;
  const l = Math.floor(e.x / T), r = Math.floor((e.x + e.w - 0.01) / T);
  if (dy > 0) {
    const ty = Math.floor((e.y + e.h - 0.01) / T);
    for (let tx = l; tx <= r; tx++) if (solidAt(tx, ty)) { e.y = ty * T - e.h; e.vy = 0; e.onGround = true; return null; }
  } else if (dy < 0) {
    const ty = Math.floor(e.y / T);
    const hits = [];
    for (let tx = l; tx <= r; tx++) if (solidAt(tx, ty)) hits.push(tx);
    if (hits.length) {
      e.y = (ty + 1) * T; e.vy = 0;
      const cx = Math.floor((e.x + e.w / 2) / T);
      return { tx: hits.includes(cx) ? cx : hits[0], ty };
    }
  }
  return null;
}
function standY(px) {
  const tx = clamp(Math.floor(px / T), 0, W - 1);
  for (let ty = 0; ty < H; ty++) if (SOLID[map[ty][tx]]) return ty * T;
  return GY * T;
}

/* =========================================================================
   Gameplay events
   ========================================================================= */
function floatText(x, y, text, color = "#fff", size = 7, life = 1.1) { texts.push({ x, y, text, color, size, life, max: life }); }
function addCoins(n, x, y) {
  coinCount += n;
  $("coins").textContent = coinCount;
  bumpChip("coins");
  sfx.coin();
  if (x !== undefined) particles.push({ kind: "coinpop", x, y, vy: -260, life: 0.5 });
}
function bump(tx, ty) {
  const k = key(tx, ty), b = blocks.get(k), type = map[ty][tx];
  if (b) b.anim = 0.2;
  // knock enemies standing on the bumped tile
  enemies.forEach((e) => { if (e.alive && Math.abs(e.x + e.w / 2 - (tx * T + 8)) < 13 && Math.abs(e.y + e.h - ty * T) < 3) killEnemy(e, true); });
  if (!b) { if (type === BRICK) sfx.bump(); if (type === BRICK) blocks.set(k, { kind: "plain", anim: 0.2 }); return; }
  if (b.kind === "coin") {
    if (type === QB) { map[ty][tx] = USED; addCoins(1, tx * T + 4, ty * T - 12); } else sfx.bump();
  } else if (b.kind === "info") {
    if (type === QB) { map[ty][tx] = USED; addCoins(1, tx * T + 4, ty * T - 12); sfx.power(); }
    else sfx.bump();
    setTimeout(() => openZone(b.zone), 320);
  } else if (b.kind === "skill") {
    map[ty][tx] = EMPTY;
    blocks.delete(k);
    sfx.brk();
    for (let i = 0; i < 4; i++) particles.push({ kind: "debris", x: tx * T + 4 + (i % 2) * 8, y: ty * T + 4 + Math.floor(i / 2) * 6, vx: (i % 2 ? 1 : -1) * (60 + Math.random() * 40), vy: -200 - Math.random() * 120 + Math.floor(i / 2) * 60, life: 1.2 });
    floatText(tx * T + 8, ty * T - 4, b.label, "#fff", 7, 1.6);
    coinCount += 1; $("coins").textContent = coinCount;
    skillsBroken++;
    if (skillsBroken === 1) { discover("skills"); toast("🧱", "#d0632e", "Skill unlocked!", "Each brick hides a skill. Break them all."); }
    if (skillsBroken === SKILL_CRATES.length) { toast("🏆", "#f6b93b", "Full stack unlocked", "Every skill brick broken. That's the whole toolkit."); fireworks(tx * T, 60, 3); }
  } else if (b.kind === "plain") sfx.bump();
}
function killEnemy(e, byBump) {
  e.alive = false; e.dead = 0.5; e.flip = byBump;
  e.vy = byBump ? -250 : 0;
  bugsFixed++;
  coinCount += 1; $("coins").textContent = coinCount;
  floatText(e.x + 7, e.y - 4, bugsFixed === 1 ? "Bug fixed!" : ["Bug fixed!", "Patched!", "Resolved!", "Closed ✓", "Shipped!"][bugsFixed % 5], "#ffd23f", 7);
  sfx.stomp();
  if (bugsFixed === 1) toast("🐞", "#3a9b5c", "First bug squashed", "Stomp bugs from above. Side hits cost a heart.");
}
function hurt(fromX) {
  if (p.invuln > 0 || p.state !== "play") return;
  hearts--;
  renderHearts();
  sfx.hurt();
  if (hearts <= 0) { respawn(true); return; }
  p.invuln = 1.4;
  p.vx = Math.sign(p.x - fromX || -p.facing) * 170;
  p.vy = -260;
}
function respawn(outOfHearts) {
  hearts = 3; renderHearts();
  p.x = checkpoint * T; p.y = standY(p.x + p.w / 2) - p.h; p.vx = p.vy = 0; p.invuln = 1.5; p.state = "play";
  toast("💫", "#ff375f", outOfHearts ? "Back to the checkpoint" : "Watch your step!", "Hearts refilled. No game overs here.");
}
function discover(id) {
  if (discovered.has(id)) return;
  discovered.add(id);
  $("zones").textContent = `${discovered.size}/${ZONES.length}`;
  bumpChip("zones");
  renderLevels();
  if (discovered.size === ZONES.length) {
    setTimeout(() => { toast("👑", "#f6b93b", "100% complete!", "Every section discovered. Thanks for playing!", 6000); fireworks(p.x, 50, 6); sfx.fanfare(); }, 600);
  }
}
function fireworks(x, y, n = 4) {
  const colors = ["#ff375f", "#ffd23f", "#30d158", "#0a84ff", "#bf5af2", "#ff9f0a", "#ffffff"];
  for (let k = 0; k < n; k++) {
    setTimeout(() => {
      const cx = x + (Math.random() - 0.5) * 220, cy = y + (Math.random() - 0.5) * 50, col = colors[Math.floor(Math.random() * colors.length)];
      for (let i = 0; i < 26; i++) {
        const a = (i / 26) * Math.PI * 2, sp = 60 + Math.random() * 50;
        sparks.push({ x: cx, y: cy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1.2 + Math.random() * 0.4, col });
      }
      tone(200 + Math.random() * 200, 0.3, "triangle", 0.04, -150);
    }, k * 380);
  }
}

/* =========================================================================
   Update
   ========================================================================= */
function updatePlayer(dt) {
  const c = char;
  p.t += dt;
  p.invuln = Math.max(0, p.invuln - dt);
  p.dashCd = Math.max(0, p.dashCd - dt);

  if (p.state === "pipe") {
    p.pt += dt; p.y += 46 * dt;
    if (p.pt > 0.6 && !p.opened) { p.opened = true; openZone(p.pipe.zone, () => { p.y = (GY - p.pipe.h) * T - p.h; p.vy = -280; p.state = "play"; }); }
    return;
  }
  if (p.state === "flag") {
    const ground = standY(p.x + p.w / 2) - p.h;
    p.y = Math.min(ground, p.y + 110 * dt);
    flagDrop = Math.min(1, flagDrop + dt * 0.9);
    if (p.y >= ground && flagDrop >= 1) { p.state = "walk"; p.facing = 1; p.x += 6; }
    return;
  }
  if (p.state === "walk") {
    p.vx = 70; p.anim += dt;
    moveX(p, p.vx * dt); p.vy += GRAV * dt; moveY(p, p.vy * dt);
    if (p.x > (CASTLE_X + 4) * T) {
      p.state = "castle"; finale = 1; sfx.fanfare(); fireworks((CASTLE_X + 4) * T, 50, 7);
      setTimeout(() => { toast("🏰", "#f6b93b", "Quest complete!", "You made it to the end. Let's talk!", 5000); openZone("contact", () => { p.state = "play"; p.x = (CASTLE_X + 1) * T; p.facing = -1; }); }, 1500);
    }
    return;
  }
  if (p.state === "castle") return;

  // Horizontal
  const dir = (held.has("right") ? 1 : 0) - (held.has("left") ? 1 : 0);
  if (p.dash > 0) { p.dash -= dt; p.vy = 0; p.vx = p.facing * 360; if (Math.random() < 0.6) particles.push({ kind: "ghost", x: p.x, y: p.y, facing: p.facing, life: 0.25 }); }
  else {
    const accel = p.onGround ? 1100 : 750;
    if (dir) { p.vx += dir * accel * dt; p.facing = dir; }
    else { const fr = (p.onGround ? 1300 : 320) * dt; p.vx = Math.abs(p.vx) <= fr ? 0 : p.vx - Math.sign(p.vx) * fr; }
    if (p.invuln < 1.2) p.vx = clamp(p.vx, -c.speed, c.speed);
  }

  // Jump with coyote time and input buffering
  if (pressedNow.has("jump")) p.buffer = 0.12;
  p.buffer -= dt; p.coyote -= dt;
  if (p.onGround) { p.coyote = 0.09; p.airJumps = c.ability === "double" ? 1 : 0; }
  if (p.buffer > 0) {
    if (p.coyote > 0) { p.vy = -c.jump; p.buffer = 0; p.coyote = 0; sfx.jump(); dust(p.x + p.w / 2, p.y + p.h); }
    else if (p.airJumps > 0) {
      p.airJumps--; p.vy = -c.jump * 0.88; p.buffer = 0; sfx.jump2();
      for (let i = 0; i < 8; i++) particles.push({ kind: "spark", x: p.x + p.w / 2, y: p.y + p.h, vx: (Math.random() - 0.5) * 120, vy: Math.random() * 40, life: 0.4, col: "#ffd51c" });
    }
  }
  if (!held.has("jump") && p.vy < -170) p.vy = -170;

  if (pressedNow.has("ability") && c.ability === "dash" && p.dashCd <= 0 && p.dash <= 0) { p.dash = 0.17; p.dashCd = 0.55; sfx.dash(); }

  if (p.dash <= 0) {
    p.vy += GRAV * dt;
    const floating = c.ability === "float" && held.has("jump") && p.vy > 0;
    p.vy = Math.min(p.vy, floating ? 62 : 560);
    if (floating && Math.random() < 0.3) particles.push({ kind: "spark", x: p.x + p.w / 2 + (Math.random() - 0.5) * 12, y: p.y + p.h, vx: 0, vy: 20, life: 0.5, col: "#ffc2e0" });
  }

  // Integrate in small steps so nothing tunnels through tiles
  const wasGround = p.onGround;
  const steps = Math.ceil(Math.max(Math.abs(p.vx), Math.abs(p.vy)) * dt / 6) || 1;
  for (let i = 0; i < steps; i++) {
    moveX(p, (p.vx * dt) / steps);
    const hit = moveY(p, (p.vy * dt) / steps);
    if (hit) { bump(hit.tx, hit.ty); break; }
  }
  if (!wasGround && p.onGround) dust(p.x + p.w / 2, p.y + p.h);
  p.x = clamp(p.x, 0, LEVEL_W - p.w);
  p.anim += Math.abs(p.vx) * dt * 0.09;

  // Pipes
  if (pressedNow.has("down") && p.onGround) {
    const pp = pipes.find((q) => p.x + p.w / 2 > q.x * T + 3 && p.x + p.w / 2 < q.x * T + 29 && Math.abs(p.y + p.h - (GY - q.h) * T) < 2);
    if (pp) { p.state = "pipe"; p.pipe = pp; p.pt = 0; p.opened = false; p.vx = 0; p.x = pp.x * T + 16 - p.w / 2; sfx.pipe(); return; }
  }

  // Coins and stat coins
  for (const cn of coins) {
    if (!cn.taken && p.x < cn.x + 8 && p.x + p.w > cn.x && p.y < cn.y + 12 && p.y + p.h > cn.y) { cn.taken = true; addCoins(1); particles.push({ kind: "spark", x: cn.x + 4, y: cn.y + 6, vx: 0, vy: -30, life: 0.3, col: "#fff3b0" }); }
  }
  for (const s of stats) {
    if (!s.taken && p.x < s.x + 14 && p.x + p.w > s.x - 2 && p.y < s.y + 16 && p.y + p.h > s.y) {
      s.taken = true; statsTaken++;
      const tk = TOKENS[s.i];
      $("stats").textContent = `${statsTaken}/${TOKENS.length}`;
      bumpChip("stats");
      sfx.power();
      fireworks(s.x, s.y, 1);
      floatText(s.x + 6, s.y - 6, tk.value, "#ffd23f", 10, 1.6);
      toast("⭐", tk.color, `Impact stat: ${tk.value}`, tk.label);
      if (statsTaken === TOKENS.length) setTimeout(() => toast("🌟", "#f6b93b", "All impact stats collected", "20%+ faster search · 60% less ETL effort · 92% coverage · 25% fewer defects", 5000), 2200);
    }
  }

  // Enemies
  for (const e of enemies) {
    if (!e.alive) continue;
    if (p.x < e.x + e.w && p.x + p.w > e.x && p.y < e.y + e.h && p.y + p.h > e.y) {
      if (p.dash > 0) killEnemy(e, true);
      else if (p.vy > 40 && p.y + p.h - e.y < 9) { killEnemy(e, false); p.vy = held.has("jump") ? -430 : -300; p.airJumps = char.ability === "double" ? 1 : 0; }
      else hurt(e.x);
    }
  }

  // Checkpoints, pits, flag
  for (const s of sections) if (p.x > s.x * T && checkpoint < s.x + 1) checkpoint = s.x + 1;
  if (p.y > VIEW_H + 30) {
    hearts--; renderHearts(); sfx.hurt();
    if (hearts <= 0) respawn(true);
    else { p.x = checkpoint * T; p.y = standY(p.x + p.w / 2) - p.h; p.vx = p.vy = 0; p.invuln = 1.2; toast("💫", "#ff375f", "Watch your step!", `${hearts} heart${hearts === 1 ? "" : "s"} left. Back at the checkpoint.`); }
  }
  if (p.x + p.w >= FLAG_X * T + 6 && p.state === "play" && !finale) {
    p.state = "flag"; p.vx = 0; p.vy = 0; p.x = FLAG_X * T + 7 - p.w; p.facing = 1; sfx.pipe();
    discover("contact");
  }
}
let flagDrop = 0;
function dust(x, y) { for (let i = 0; i < 4; i++) particles.push({ kind: "dust", x, y: y - 2, vx: (Math.random() - 0.5) * 70, vy: -Math.random() * 30, life: 0.35 }); }

function updateEnemies(dt) {
  for (const e of enemies) {
    if (!e.alive) {
      if (e.dead > 0) { e.dead -= dt; if (e.flip) { e.vy += GRAV * dt; e.y += e.vy * dt; } }
      continue;
    }
    if (Math.abs(e.x - (camX + viewW / 2)) > viewW + 80) continue; // sleep off-screen
    e.vy += GRAV * dt;
    if (moveX(e, e.vx * dt)) e.vx = -e.vx || 26;
    moveY(e, Math.min(e.vy, 500) * dt);
    if (e.onGround) {
      const ahead = e.vx < 0 ? e.x - 1 : e.x + e.w + 1;
      if (!solidAt(Math.floor(ahead / T), Math.floor((e.y + e.h + 2) / T))) e.vx = -e.vx;
    }
    if (e.y > VIEW_H + 40) e.alive = false;
  }
}

function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const q = particles[i];
    q.life -= dt;
    if (q.kind === "debris" || q.kind === "coinpop") { q.vy += GRAV * 0.9 * dt; q.x += (q.vx || 0) * dt; q.y += q.vy * dt; }
    else if (q.kind === "dust" || q.kind === "spark") { q.x += q.vx * dt; q.y += q.vy * dt; }
    if (q.life <= 0) particles.splice(i, 1);
  }
  for (let i = texts.length - 1; i >= 0; i--) { const t = texts[i]; t.life -= dt; t.y -= 22 * dt; if (t.life <= 0) texts.splice(i, 1); }
  for (let i = sparks.length - 1; i >= 0; i--) { const s = sparks[i]; s.life -= dt; s.vy += 60 * dt; s.vx *= 1 - dt; s.x += s.vx * dt; s.y += s.vy * dt; if (s.life <= 0) sparks.splice(i, 1); }
  for (const b of blocks.values()) if (b.anim > 0) b.anim -= dt;
  if (finale && Math.random() < dt * 1.4) fireworks((CASTLE_X + 4) * T, 50, 1);
}

function updateCamera(dt) {
  const target = p.x + p.w / 2 - viewW * 0.42 + p.facing * 18;
  camX = damp(camX, target, 6, dt);
  camX = clamp(camX, 0, Math.max(0, LEVEL_W - viewW));
}

/* =========================================================================
   Rendering
   ========================================================================= */
const SKY = [
  [0, "#58a8ff", "#d4ecff"],
  [0.45, "#3d8bff", "#c3e4ff"],
  [0.72, "#6b5bd6", "#ffb27a"],
  [0.9, "#1a1f55", "#5a4a8c"],
  [1, "#0b1236", "#2a2f5a"],
];
function skyAt(t) {
  for (let i = 0; i < SKY.length - 1; i++) {
    const [a, at, ab] = SKY[i], [b, bt, bb] = SKY[i + 1];
    if (t <= b) { const k = (t - a) / (b - a); return [mix(at, bt, k), mix(ab, bb, k)]; }
  }
  return [SKY[4][1], SKY[4][2]];
}
const clouds = Array.from({ length: 14 }, (_, i) => ({ x: i * 140 + (i % 3) * 37, y: 14 + ((i * 37) % 60), s: 1 + (i % 3) }));
const starsBg = Array.from({ length: 70 }, (_, i) => ({ x: (i * 97) % 600, y: (i * 53) % 150, b: (i % 5) / 5 }));

function drawBackground(prog, night) {
  const [top, bot] = skyAt(prog);
  const gr = g.createLinearGradient(0, 0, 0, VIEW_H);
  gr.addColorStop(0, top); gr.addColorStop(1, bot);
  g.fillStyle = gr; g.fillRect(0, 0, viewW, VIEW_H);
  if (night > 0.05) {
    for (const s of starsBg) {
      g.globalAlpha = night * (0.5 + 0.5 * Math.sin(elapsed * 2 + s.x)) * (0.5 + s.b);
      g.fillStyle = "#fff"; g.fillRect(Math.floor((s.x - camX * 0.05) % viewW + viewW) % viewW, s.y, 1, 1);
    }
    g.globalAlpha = 1;
  }
  // Sun travels across the sky, then the moon rises.
  const sunX = viewW * (0.15 + prog * 0.7), sunY = 30 + Math.pow(Math.max(0, prog - 0.4), 2) * 360;
  if (sunY < VIEW_H) { g.fillStyle = prog > 0.65 ? "#ffcf7a" : "#fff6c9"; circle(sunX, sunY, 12); g.globalAlpha = 0.25; circle(sunX, sunY, 18); g.globalAlpha = 1; }
  if (night > 0.2) { g.globalAlpha = night; g.fillStyle = "#f4f1de"; circle(viewW * 0.8, 34, 9); g.fillStyle = skyAt(prog)[0]; circle(viewW * 0.8 + 4, 31, 8); g.globalAlpha = 1; }

  // Far mountains
  g.fillStyle = mix("#a9c9f0", "#2a2f5a", night * 0.8);
  g.beginPath(); g.moveTo(0, VIEW_H);
  for (let x = 0; x <= viewW + 4; x += 4) { const wx = x + camX * 0.12; g.lineTo(x, 130 + Math.sin(wx * 0.013) * 22 + Math.sin(wx * 0.031) * 9); }
  g.lineTo(viewW, VIEW_H); g.fill();

  // Toronto skyline with a CN Tower silhouette
  const sk = mix("#8fb3e0", "#1d2250", Math.max(night, prog > 0.6 ? 0.4 : 0));
  g.fillStyle = sk;
  for (let k = 0; k < 3; k++) {
    const bx = Math.round(260 + k * 900 - camX * 0.2);
    if (bx < -200 || bx > viewW + 40) continue;
    const hs = [26, 40, 18, 52, 34, 22, 46, 30, 16, 38];
    hs.forEach((h, i) => g.fillRect(bx + i * 12, 170 - h, 11, h + 20));
    g.fillRect(bx + 62, 70, 2, 100); g.fillRect(bx + 59, 108, 8, 5); g.fillRect(bx + 60, 113, 6, 4); g.fillRect(bx + 61, 92, 4, 3);
    if (night > 0.3) { g.fillStyle = "#ffd98a"; for (let i = 0; i < 18; i++) g.fillRect(bx + 3 + (i * 7) % 118, 150 - ((i * 13) % 30), 1, 1); g.fillStyle = sk; }
  }

  // Clouds
  for (const c of clouds) {
    const x = ((c.x - camX * 0.25) % 2000 + 2000) % 2000 - 100;
    if (x > viewW + 40) continue;
    g.fillStyle = night > 0.5 ? "rgba(200,205,240,0.25)" : "rgba(255,255,255,0.92)";
    const s = c.s;
    g.fillRect(x, c.y + 4, 22 * s, 6 * s); g.fillRect(x + 4 * s, c.y, 12 * s, 6 * s); g.fillRect(x + 10 * s, c.y - 2 * s, 8 * s, 6 * s);
  }

  // Rolling hills
  g.fillStyle = mix("#8fd694", "#1f3b33", night * 0.85);
  g.beginPath(); g.moveTo(0, VIEW_H);
  for (let x = 0; x <= viewW + 4; x += 3) { const wx = x + camX * 0.4; g.lineTo(x, 176 + Math.sin(wx * 0.02) * 14 + Math.sin(wx * 0.007) * 10); }
  g.lineTo(viewW, VIEW_H); g.fill();
}
function circle(x, y, r) { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }

const QGLYPH = [".###.", "#...#", "....#", "..##.", "..#..", ".....", "..#.."];
const IGLYPH = ["..#..", ".....", ".##..", "..#..", "..#..", "..#..", ".###."];
function glyph(rows, x, y, col) { g.fillStyle = col; rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) if (r[i] === "#") g.fillRect(x + i, y + j, 1, 1); }); }

function drawTile(type, tx, ty) {
  const x = tx * T, b = blocks.get(key(tx, ty));
  const y = ty * T - (b && b.anim > 0 ? Math.round(Math.sin((b.anim / 0.2) * Math.PI) * 4) : 0);
  if (type === GROUND) {
    g.fillStyle = "#c8844b"; g.fillRect(x, y, T, T);
    g.fillStyle = "#a86a37"; g.fillRect(x + 3, y + 9, 2, 2); g.fillRect(x + 11, y + 13, 2, 1); g.fillRect(x + 8, y + 5, 1, 1);
    if (ty === 0 || map[ty - 1][tx] !== GROUND) {
      g.fillStyle = "#5cc85a"; g.fillRect(x, y, T, 4);
      g.fillStyle = "#3fa34d"; g.fillRect(x, y + 4, T, 1); g.fillRect(x + 2, y + 5, 2, 1); g.fillRect(x + 9, y + 5, 3, 1);
      g.fillStyle = "#8ee07f"; g.fillRect(x + 1, y, 3, 1); g.fillRect(x + 8, y, 4, 1);
    }
  } else if (type === BRICK) {
    const skillB = b && b.kind === "skill";
    g.fillStyle = skillB ? "#d8743a" : "#d0632e"; g.fillRect(x, y, T, T);
    g.fillStyle = "#7a3415";
    g.fillRect(x, y + 7, T, 1); g.fillRect(x, y + 15, T, 1); g.fillRect(x + 7, y, 1, 7); g.fillRect(x + 3, y + 8, 1, 7); g.fillRect(x + 11, y + 8, 1, 7);
    g.fillStyle = "#ef8a52"; g.fillRect(x, y, 7, 1); g.fillRect(x + 8, y, 8, 1);
    if (skillB) { g.fillStyle = "rgba(255,240,200,0.9)"; g.fillRect(x + 6, y + 3, 4, 1); g.fillRect(x + 5, y + 4, 6, 1); }
  } else if (type === QB) {
    const sh = 0.5 + 0.5 * Math.sin(elapsed * 4 + tx);
    g.fillStyle = mix("#f6b93b", "#ffd36b", sh * 0.6); g.fillRect(x, y, T, T);
    g.fillStyle = "#c47f12"; g.fillRect(x, y + 15, T, 1); g.fillRect(x + 15, y, 1, T);
    g.fillStyle = "#ffe29a"; g.fillRect(x, y, 15, 1); g.fillRect(x, y, 1, 15);
    g.fillStyle = "#8a5408"; [[2, 2], [13, 2], [2, 13], [13, 13]].forEach(([a, c]) => g.fillRect(x + a, y + c, 1, 1));
    glyph(QGLYPH, x + 6, y + 5, "#8a5408"); glyph(QGLYPH, x + 5, y + 4, "#fff");
  } else if (type === USED) {
    g.fillStyle = "#a5703d"; g.fillRect(x, y, T, T);
    g.fillStyle = "#6e4520"; g.fillRect(x, y + 15, T, 1); g.fillRect(x + 15, y, 1, T);
    g.fillStyle = "#c08b55"; g.fillRect(x, y, 15, 1); g.fillRect(x, y, 1, 15);
    g.fillStyle = "#6e4520"; [[2, 2], [13, 2], [2, 13], [13, 13]].forEach(([a, c]) => g.fillRect(x + a, y + c, 1, 1));
    if (b && b.kind === "info") glyph(IGLYPH, x + 5, y + 4, "#fff");
  } else if (type === STONE) {
    g.fillStyle = "#9aa3ad"; g.fillRect(x, y, T, T);
    g.fillStyle = "#c4ccd4"; g.fillRect(x, y, T, 2); g.fillRect(x, y, 2, T);
    g.fillStyle = "#6b737c"; g.fillRect(x, y + 14, T, 2); g.fillRect(x + 14, y, 2, T);
    g.fillStyle = "#8a929b"; g.fillRect(x + 5, y + 5, 6, 6);
  }
}

function drawPipe(pp) {
  const x = pp.x * T, top = (GY - pp.h) * T, c = pp.color;
  const light = mix(c, "#ffffff", 0.45), dark = mix(c, "#000000", 0.35);
  g.fillStyle = "#111"; g.fillRect(x + 1, top + 12, 30, pp.h * T - 12);
  g.fillStyle = c; g.fillRect(x + 2, top + 12, 28, pp.h * T - 12);
  g.fillStyle = light; g.fillRect(x + 5, top + 12, 3, pp.h * T - 12);
  g.fillStyle = dark; g.fillRect(x + 23, top + 12, 5, pp.h * T - 12);
  g.fillStyle = "#111"; g.fillRect(x - 1, top, 34, 14);
  g.fillStyle = c; g.fillRect(x, top + 1, 32, 12);
  g.fillStyle = light; g.fillRect(x + 3, top + 1, 4, 12);
  g.fillStyle = dark; g.fillRect(x + 25, top + 1, 6, 12);
  g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(x + 2, top + 14, 28, 2);
}

function drawBug(e) {
  const x = Math.round(e.x) - 1, y = Math.round(e.y) - 1, f = e.vx > 0 ? 1 : -1;
  const R = (rx, ry, rw, rh, col) => { g.fillStyle = col; g.fillRect(x + (f > 0 ? rx : 16 - rx - rw), y + ry, rw, rh); };
  if (!e.alive && !e.flip) { R(1, 9, 14, 3, "#3a9b5c"); R(3, 8, 10, 1, "#24693c"); return; }
  if (e.flip) g.save(), g.translate(0, y * 2 + 12), g.scale(1, -1);
  const a = Math.floor(elapsed * 8) % 2;
  R(3 + a, 9, 2, 3, "#24412f"); R(7 - a, 9, 2, 3, "#24412f"); R(10 + a, 9, 2, 3, "#24412f");
  R(1, 3, 12, 7, "#3a9b5c"); R(2, 2, 10, 1, "#3a9b5c"); R(3, 3, 3, 1, "#7fd39a"); R(7, 2, 1, 8, "#24693c");
  R(3, 6, 2, 2, "#ff375f"); R(9, 5, 2, 2, "#ff375f");
  R(12, 4, 4, 5, "#24412f"); R(14, 5, 1, 1, "#fff"); R(14, 1, 1, 3, "#24412f"); R(15, 0, 1, 1, "#24412f");
  if (e.flip) g.restore();
}

function drawCoin(x, y) {
  const w = Math.max(2, Math.round(Math.abs(Math.cos(elapsed * 4 + x * 0.05)) * 8));
  const cx = Math.round(x + 4 - w / 2);
  g.fillStyle = "#c98c00"; g.fillRect(cx, y + 1, w, 10); g.fillRect(cx + 1, y, Math.max(0, w - 2), 12);
  g.fillStyle = "#ffd23f"; g.fillRect(cx + 1, y + 1, Math.max(1, w - 2), 10);
  if (w > 4) { g.fillStyle = "#fff3b0"; g.fillRect(cx + 2, y + 2, 1, 6); }
}

function drawCastle() {
  const x = CASTLE_X * T, gy = GY * T;
  const stone = "#b9a58e", dark = "#8c7a66", light = "#d6c5ae";
  g.fillStyle = stone; g.fillRect(x, gy - 80, 144, 80);
  g.fillRect(x + 32, gy - 128, 80, 48);
  for (let i = 0; i < 9; i++) if (i % 2 === 0) g.fillRect(x + i * 16, gy - 88, 16, 8);
  for (let i = 0; i < 5; i++) if (i % 2 === 0) g.fillRect(x + 32 + i * 16, gy - 136, 16, 8);
  g.fillStyle = dark;
  for (let r = 0; r < 10; r++) for (let c = 0; c < 9; c++) g.fillRect(x + c * 16 + (r % 2) * 8, gy - 80 + r * 8, 1, 8);
  for (let r = 0; r < 10; r++) g.fillRect(x, gy - 80 + r * 8, 144, 1);
  g.fillStyle = light; g.fillRect(x, gy - 80, 144, 1);
  g.fillStyle = "#3a2a1c"; g.fillRect(x + 60, gy - 36, 24, 36); g.beginPath(); g.arc(x + 72, gy - 36, 12, Math.PI, 0); g.fill();
  const lit = finale ? "#ffd98a" : skyNight > 0.4 ? "#ffcf6a" : "#3a2a1c";
  g.fillStyle = lit; g.fillRect(x + 48, gy - 116, 10, 16); g.fillRect(x + 86, gy - 116, 10, 16); g.fillRect(x + 20, gy - 60, 10, 14); g.fillRect(x + 114, gy - 60, 10, 14);
  g.fillStyle = "#555"; g.fillRect(x + 71, gy - 160, 2, 24);
  g.fillStyle = "#ff375f"; g.fillRect(x + 73, gy - 160 + (finale ? 0 : 16), 14, 9);
}
function drawFlag() {
  const x = FLAG_X * T + 7, top = 3 * T, bottom = (GY - 1) * T;
  g.fillStyle = "#9aa3ad"; g.fillRect(x - 5, bottom, 12, T); g.fillStyle = "#6b737c"; g.fillRect(x - 5, bottom + 14, 12, 2);
  g.fillStyle = "#e5e5ea"; g.fillRect(x, top, 2, bottom - top);
  g.fillStyle = "#30d158"; circle(x + 1, top - 2, 4);
  const fy = top + 4 + flagDrop * (bottom - top - 22);
  g.fillStyle = "#ff375f"; g.beginPath(); g.moveTo(x, fy); g.lineTo(x - 18, fy + 7); g.lineTo(x, fy + 14); g.fill();
  g.fillStyle = "#fff"; g.fillRect(x - 8, fy + 6, 3, 3);
}

let skyNight = 0;
function render() {
  const w = window.innerWidth, h = window.innerHeight;
  const prog = clamp(camX / Math.max(1, LEVEL_W - viewW), 0, 1);
  skyNight = smooth(0.78, 1, prog);
  const night = skyNight;
  g.setTransform(1, 0, 0, 1, 0, 0);
  drawBackground(prog, night);

  const cx = Math.round(camX);
  g.setTransform(1, 0, 0, 1, -cx, 0);
  const x0 = Math.max(0, Math.floor(cx / T) - 1), x1 = Math.min(W, Math.ceil((cx + viewW) / T) + 1);

  // Decorations behind tiles
  for (const d of decor) {
    if (d.x < cx - 40 || d.x > cx + viewW + 10) continue;
    const y = GY * T;
    if (d.type === "bush") {
      g.fillStyle = mix("#4fb35a", "#1d3b2c", night * 0.7);
      g.fillRect(d.x, y - 8, 14 * d.s, 8); g.fillRect(d.x + 3, y - 12, 8 * d.s, 4);
      g.fillStyle = mix("#7fd88a", "#2b4f3d", night * 0.7); g.fillRect(d.x + 4, y - 11, 3, 2);
    } else {
      g.fillStyle = "#3fa34d"; g.fillRect(d.x + 3, y - 6, 1, 6);
      g.fillStyle = ["#ff5fa8", "#ffd23f", "#ffffff"][Math.floor(d.c * 3)]; g.fillRect(d.x + 1, y - 9, 5, 3); g.fillRect(d.x + 2, y - 10, 3, 5);
    }
  }
  // Section signposts
  for (const s of sections) {
    const x = s.x * T + 2, y = GY * T;
    g.fillStyle = "#7a4e26"; g.fillRect(x + 6, y - 20, 3, 20);
    g.fillStyle = "#a8743f"; g.fillRect(x, y - 30, 16, 12);
    g.fillStyle = "#7a4e26"; g.fillRect(x, y - 19, 16, 1); g.fillRect(x + 15, y - 30, 1, 12);
  }
  if (x1 > CASTLE_X - 2) drawCastle();
  if (x1 > FLAG_X - 1 && x0 < FLAG_X + 2) drawFlag();

  for (let ty = 0; ty < H; ty++) for (let tx = x0; tx < x1; tx++) { const t = map[ty][tx]; if (t && t !== PIPE) drawTile(t, tx, ty); }

  for (const cn of coins) if (!cn.taken && cn.x > cx - 16 && cn.x < cx + viewW) drawCoin(cn.x, cn.y);
  for (const s of stats) {
    if (s.taken || s.x < cx - 20 || s.x > cx + viewW + 20) continue;
    const y = s.y + Math.sin(elapsed * 3 + s.i) * 2;
    g.globalAlpha = 0.3 + 0.2 * Math.sin(elapsed * 5); g.fillStyle = "#fff3b0"; circle(s.x + 6, y + 7, 11); g.globalAlpha = 1;
    g.fillStyle = "#c98c00"; circle(s.x + 6, y + 7, 8);
    g.fillStyle = "#ffd23f"; circle(s.x + 6, y + 7, 7);
    g.fillStyle = "#fff"; g.fillRect(s.x + 5, y + 3, 2, 8); g.fillRect(s.x + 2, y + 6, 8, 2); g.fillRect(s.x + 4, y + 5, 4, 4);
  }

  const inPipe = p.state === "pipe";
  if (inPipe) drawPlayer();
  for (const pp of pipes) if (pp.x * T < cx + viewW && pp.x * T + 32 > cx) drawPipe(pp);
  for (const e of enemies) if ((e.alive || e.dead > 0) && e.x > cx - 20 && e.x < cx + viewW + 20) drawBug(e);
  for (const q of particles) {
    if (q.kind === "debris") { g.fillStyle = "#d0632e"; g.fillRect(Math.round(q.x), Math.round(q.y), 4, 4); g.fillStyle = "#7a3415"; g.fillRect(Math.round(q.x) + 3, Math.round(q.y) + 3, 1, 1); }
    else if (q.kind === "coinpop") drawCoin(q.x, Math.round(q.y));
    else if (q.kind === "dust") { g.globalAlpha = q.life / 0.35; g.fillStyle = "#fff"; g.fillRect(Math.round(q.x), Math.round(q.y), 2, 2); g.globalAlpha = 1; }
    else if (q.kind === "spark") { g.fillStyle = q.col; g.fillRect(Math.round(q.x), Math.round(q.y), 1, 1); }
    else if (q.kind === "ghost") { g.globalAlpha = q.life * 2; drawChar(g, char, q.x, q.y, q.facing, "run", 0, elapsed); g.globalAlpha = 1; }
  }
  if (!inPipe && p.state !== "castle") drawPlayer();
  for (const s of sparks) { g.globalAlpha = clamp(s.life, 0, 1); g.fillStyle = s.col; g.fillRect(Math.round(s.x), Math.round(s.y), 2, 2); }
  g.globalAlpha = 1;

  // Dusk tint over the world
  if (night > 0) { g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = `rgba(12,16,48,${night * 0.28})`; g.fillRect(0, 0, viewW, VIEW_H); }

  // Blit to screen
  mctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  mctx.imageSmoothingEnabled = false;
  const [skyTop] = skyAt(prog);
  mctx.fillStyle = skyTop; mctx.fillRect(0, 0, w, gameTop + 1);
  mctx.fillStyle = "#8a552c"; mctx.fillRect(0, gameTop + gameH - 1, w, h - gameTop - gameH + 1);
  mctx.drawImage(lo, 0, 0, viewW, VIEW_H, 0, gameTop, viewW * scale, VIEW_H * scale);
  drawOverlayText(night);
}

// Crisp text drawn at screen resolution on top of the pixel art.
function S(wx, wy) { return [(wx - camX) * scale, gameTop + wy * scale]; }
function pill(text, sx, sy, size, color, bg = "rgba(255,255,255,0.92)", fg = "#1d1d1f") {
  mctx.font = `700 ${size}px ${FONT}`;
  const tw = mctx.measureText(text).width, padX = size * 0.7, hh = size * 1.8;
  mctx.fillStyle = bg;
  mctx.beginPath(); mctx.roundRect(sx - tw / 2 - padX, sy - hh / 2, tw + padX * 2, hh, hh / 2); mctx.fill();
  if (color) { mctx.fillStyle = color; mctx.beginPath(); mctx.arc(sx - tw / 2 - padX * 0.15, sy, size * 0.28, 0, Math.PI * 2); mctx.fill(); }
  mctx.fillStyle = fg; mctx.textAlign = "center"; mctx.textBaseline = "middle";
  mctx.fillText(text, sx + (color ? size * 0.25 : 0), sy + 0.5);
}
function drawOverlayText(night) {
  const vis = (wx, pad = 200) => wx > camX - pad && wx < camX + viewW + pad;
  const u = scale;
  mctx.textAlign = "center"; mctx.textBaseline = "middle";

  // Title over the start
  const titleX = Math.min(14 * T, viewW / 2);
  if (vis(titleX, 400)) {
    const [sx, sy] = S(titleX, 52);
    mctx.font = `${Math.round(10 * u)}px ${PIX}`;
    mctx.fillStyle = "#1d1d1f"; mctx.fillText("ROHITHRAJ", sx + u, sy + u); mctx.fillText("BASKARAN", sx + u, sy + 14 * u + u);
    mctx.fillStyle = "#fff"; mctx.fillText("ROHITHRAJ", sx, sy); mctx.fillText("BASKARAN", sx, sy + 14 * u);
    mctx.font = `700 ${Math.max(11, Math.round(5.2 * u))}px ${FONT}`;
    mctx.fillStyle = "rgba(29,29,31,0.75)";
    mctx.fillText("Software engineer · AI · Full-stack · GRC · Toronto", sx, sy + 28 * u);
  }
  // World headings
  for (const s of sections) {
    const wx = s.x * T + 64;
    if (!vis(wx, 260)) continue;
    const [sx, sy] = S(wx, 34);
    mctx.font = `${Math.round(4.2 * u)}px ${PIX}`;
    mctx.fillStyle = night > 0.4 ? "rgba(255,255,255,0.7)" : "rgba(29,29,31,0.55)";
    mctx.fillText(`WORLD ${s.num}`, sx, sy - 9 * u);
    mctx.font = `900 ${Math.round(14 * u)}px ${FONT}`;
    mctx.fillStyle = "rgba(0,0,0,0.25)"; mctx.fillText(s.title, sx + u, sy + u);
    mctx.fillStyle = "#fff"; mctx.fillText(s.title, sx, sy);
    const [px, py] = S(s.x * T + 10, GY * T - 24);
    mctx.font = `${Math.round(4.5 * u)}px ${PIX}`; mctx.fillStyle = "#fff"; mctx.fillText(String(s.num), px, py);
  }
  for (const h of hints) { if (!vis(h.x)) continue; const [sx, sy] = S(h.x, h.y); pill(h.text, sx, sy, Math.max(11, 5 * u), null, "rgba(255,255,255,0.85)"); }
  for (const l of labels) {
    if (!vis(l.x)) continue;
    const [sx, sy] = S(l.x, l.y + Math.sin(elapsed * 2 + l.x) * 1);
    pill(l.text, sx, sy, Math.max(10, 4.6 * u), l.color);
  }
  // Down arrow when standing on a pipe
  if (p.state === "play" && p.onGround) {
    const pp = pipes.find((q) => p.x + p.w / 2 > q.x * T + 3 && p.x + p.w / 2 < q.x * T + 29 && Math.abs(p.y + p.h - (GY - q.h) * T) < 2);
    if (pp) { const [sx, sy] = S(p.x + p.w / 2, p.y - 12 + Math.sin(elapsed * 8) * 2); pill(isTouch ? "▼ dive in" : "↓ dive in", sx, sy, Math.max(11, 5 * u), pp.color); }
  }
  for (const s of stats) { if (s.taken || !vis(s.x)) continue; const [sx, sy] = S(s.x + 6, s.y - 8); pill(TOKENS[s.i].value, sx, sy, Math.max(10, 4.4 * u), "#ffd23f", "rgba(29,29,31,0.85)", "#fff"); }
  for (const t of texts) {
    const [sx, sy] = S(t.x, t.y);
    mctx.globalAlpha = clamp(t.life / t.max * 2, 0, 1);
    mctx.font = `800 ${Math.round(t.size * u * 0.75)}px ${FONT}`;
    mctx.lineWidth = Math.max(2, u); mctx.strokeStyle = "rgba(0,0,0,0.55)"; mctx.strokeText(t.text, sx, sy);
    mctx.fillStyle = t.color; mctx.fillText(t.text, sx, sy);
  }
  mctx.globalAlpha = 1;
}

function drawPlayer() {
  if (p.invuln > 0 && Math.floor(p.invuln * 14) % 2 === 0 && p.state === "play") return;
  let pose = "idle";
  if (p.state === "flag") pose = "jump";
  else if (!p.onGround) pose = p.vy < 0 ? "jump" : "fall";
  else if (Math.abs(p.vx) > 8 || p.state === "walk") pose = "run";
  if (p.state === "pipe") {
    g.save(); g.beginPath(); g.rect(p.pipe.x * T - 4, 0, 40, (GY - p.pipe.h) * T); g.clip();
    drawChar(g, char, p.x, p.y, p.facing, "idle", 0, elapsed); g.restore(); return;
  }
  const bob = pose === "idle" ? Math.round(Math.sin(elapsed * 3)) * 0 : 0;
  drawChar(g, char, p.x, p.y + bob, p.facing, pose, Math.floor(p.anim) % 4, elapsed);
}

/* =========================================================================
   UI: HUD, panel, levels, toast, character select
   ========================================================================= */
function renderHearts() { $("hearts").textContent = "♥".repeat(Math.max(0, hearts)) + "♡".repeat(Math.max(0, 3 - hearts)); bumpChip("hearts"); }
function bumpChip(id) { const el = $(id).closest(".chip-hud"); if (!el) return; el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); }

let onPanelClose = null, lastFocus = null;
function openZone(id, after) {
  const z = Z[id];
  if (!z) return;
  discover(id);
  paused = true;
  held.clear();
  onPanelClose = after || null;
  lastFocus = document.activeElement;
  $("panel-body").innerHTML = z.html;
  const h2 = $("panel-body").querySelector("h2");
  if (h2) h2.id = "panel-title";
  $("panel").style.setProperty("--zone", z.color);
  $("modal").hidden = false;
  $("panel-body").scrollTop = 0;
  setTimeout(() => $("panel-continue").focus(), 50);
  history.replaceState(null, "", "#" + id);
}
function closePanel() {
  $("modal").hidden = true;
  paused = false;
  held.clear();
  history.replaceState(null, "", location.pathname + location.search);
  const cb = onPanelClose; onPanelClose = null;
  if (cb) cb();
  main.focus();
}
$("panel-close").addEventListener("click", closePanel);
$("panel-continue").addEventListener("click", closePanel);
$("modal").addEventListener("click", (e) => {
  if (e.target === $("modal")) closePanel();
  const btn = e.target.closest("[data-copy]");
  if (btn) {
    const text = btn.getAttribute("data-copy");
    const ok = () => toast("✉️", "#0a84ff", "Email copied", text);
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(ok, () => toast("✉️", "#0a84ff", "Email", text)); else toast("✉️", "#0a84ff", "Email", text);
  }
});

const LEVEL_ORDER = ["about", "plutus", "eatme", "itgc", "rag", "autofill", "finbud", "archive", "skills", "writing", "contact"];
function renderLevels() {
  const list = $("levels-list");
  list.innerHTML = "";
  LEVEL_ORDER.forEach((id, i) => {
    const z = Z[id];
    const li = document.createElement("li");
    const b = document.createElement("button");
    b.type = "button";
    b.innerHTML = `<span class="n" style="background:${z.color}">${discovered.has(id) ? "★" : i + 1}</span><span><b></b><small></small></span>`;
    b.querySelector("b").textContent = z.title;
    b.querySelector("small").textContent = z.sub;
    b.addEventListener("click", () => warp(id));
    li.appendChild(b); list.appendChild(li);
  });
}
function openLevels() { if (!started) return; paused = true; held.clear(); renderLevels(); $("levels").hidden = false; const f = $("levels-list").querySelector("button"); if (f) f.focus(); }
function closeLevels() { $("levels").hidden = true; paused = false; main.focus(); }
$("btn-levels").addEventListener("click", () => { $("btn-levels").blur(); openLevels(); });
$("levels-close").addEventListener("click", closeLevels);
$("levels").addEventListener("click", (e) => { if (e.target === $("levels")) closeLevels(); });

function warp(id) {
  const pos = zonePos[id];
  if (!pos) return;
  $("levels").hidden = true;
  p.state = "play"; p.vx = p.vy = 0; p.invuln = 0.5;
  p.x = pos.x; p.y = (pos.pipe ? pos.y : standY(pos.x + p.w / 2)) - p.h;
  for (const s of sections) if (p.x >= s.x * T - 2) checkpoint = Math.max(checkpoint, s.x + 1);
  camX = clamp(p.x - viewW * 0.42, 0, LEVEL_W - viewW);
  openZone(id);
}

let toastTimer;
function toast(icon, color, title, sub, ms = 3400) {
  const el = $("toast");
  el.innerHTML = `<span class="ti" style="background:${color}"></span><div><b class="tt"></b><span class="ts"></span></div>`;
  el.querySelector(".ti").textContent = icon;
  el.querySelector(".tt").textContent = title;
  el.querySelector(".ts").textContent = sub;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), ms);
}

// Character select
let pick = CHARS.indexOf(char);
const previews = [];
function buildRoster() {
  const roster = $("roster");
  CHARS.forEach((c, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "hero-card";
    b.setAttribute("role", "radio");
    b.style.setProperty("--c", c.color);
    b.innerHTML = `<div class="hero-stage"><canvas width="24" height="30" aria-hidden="true"></canvas></div><b></b><span class="role"></span><span class="perk"></span>
      <div class="bars"><div>Speed<i style="--v:${c.stats[0]}%"></i></div><div>Jump<i style="--v:${c.stats[1]}%"></i></div><div>Special<i style="--v:${c.stats[2]}%"></i></div></div>`;
    b.querySelector("b").textContent = c.name;
    b.querySelector(".role").textContent = c.role;
    b.querySelector(".perk").textContent = c.perk;
    b.addEventListener("click", () => setPick(i));
    b.addEventListener("dblclick", () => { setPick(i); startGame(); });
    roster.appendChild(b);
    const cv = b.querySelector("canvas");
    previews.push({ ctx: cv.getContext("2d"), c, el: b });
  });
  setPick(pick);
}
function setPick(i) {
  pick = (i + CHARS.length) % CHARS.length;
  previews.forEach((pv, j) => { pv.el.setAttribute("aria-checked", String(j === pick)); pv.el.tabIndex = j === pick ? 0 : -1; });
}
function selectKeys(e) {
  if (e.code === "ArrowLeft") { setPick(pick - 1); previews[pick].el.focus(); e.preventDefault(); }
  else if (e.code === "ArrowRight") { setPick(pick + 1); previews[pick].el.focus(); e.preventDefault(); }
  else if (e.code === "Enter" && !(e.target.tagName === "A")) { e.preventDefault(); startGame(); }
}
function drawPreviews() {
  previews.forEach((pv, j) => {
    const { ctx, c } = pv;
    ctx.clearRect(0, 0, 24, 30);
    ctx.imageSmoothingEnabled = false;
    const sel = j === pick;
    const hop = sel ? Math.max(0, Math.sin(elapsed * 6)) * 3 : 0;
    drawChar(ctx, c, 12 - c.w / 2, 29 - c.h - hop, 1, sel ? (hop > 0.5 ? "jump" : "run") : "idle", Math.floor(elapsed * 8) % 4, elapsed);
  });
}
function drawFace() {
  const fc = $("hud-face").getContext("2d");
  fc.clearRect(0, 0, 20, 20);
  fc.imageSmoothingEnabled = false;
  drawChar(fc, char, 10 - char.w / 2, 19 - char.h + (char.id === "zap" ? 0 : Math.round(char.h * 0.35)), 1, "idle", 0, elapsed);
}

function startGame() {
  const prev = char;
  char = CHARS[pick];
  try { localStorage.setItem("quest-char", char.id); } catch (e) { /* storage unavailable */ }
  // keep the player's feet where they were when swapping characters
  const feet = p.y + p.h;
  p.w = char.w; p.h = char.h; p.y = feet - p.h;
  if (prev !== char && started) toast("🔁", char.color, `Now playing as ${char.name}`, char.perk);
  $("hud-name").textContent = char.name;
  drawFace();
  $("pb-ability").hidden = char.ability !== "dash";
  $("select").hidden = true;
  $("hud").hidden = false;
  $("pad").hidden = !isTouch;
  paused = false;
  main.setAttribute("tabindex", "-1");
  main.focus();
  if (!started) {
    started = true;
    setTimeout(() => toast("🎮", char.color, `Let's go, ${char.name}!`, isTouch ? "Hit ? blocks and dive down pipes. Tap 🗺️ to warp anywhere." : "Hit ? blocks and dive down pipes. Press L to warp anywhere."), 500);
  }
}
$("play").addEventListener("click", startGame);
$("btn-char").addEventListener("click", () => { $("btn-char").blur(); paused = true; held.clear(); $("select").hidden = false; setPick(CHARS.indexOf(char)); $("play").firstChild.textContent = "Back to the game "; previews[pick].el.focus(); });

/* =========================================================================
   Main loop
   ========================================================================= */
let last = performance.now();
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min((now - last) / 1000, 1 / 30);
  last = now;
  elapsed += dt;
  if (!$("select").hidden) drawPreviews();
  if (started && !paused) {
    updatePlayer(dt);
    updateEnemies(dt);
    updateParticles(dt);
  } else if (!started) {
    camX = (Math.sin(elapsed * 0.15) * 0.5 + 0.5) * 600; // gentle attract-mode pan
  }
  if (started) updateCamera(dt);
  pressedNow.clear();
  render();
}

async function boot() {
  if (document.fonts) {
    await Promise.race([
      Promise.all([`10px ${PIX}`, `900 20px Inter`, `700 12px Inter`].map((f) => document.fonts.load(f))),
      new Promise((r) => setTimeout(r, 1500)),
    ]).catch(() => {});
  }
  buildRoster();
  if (isTouch) document.querySelectorAll("#play kbd, .select-keys").forEach((el) => el.remove());
  renderLevels();
  renderHearts();
  $("zones").textContent = `0/${ZONES.length}`;
  $("stats").textContent = `0/${TOKENS.length}`;
  requestAnimationFrame((t) => { last = t; frame(t); });
  const deep = location.hash.slice(1);
  if (deep && zonePos[deep]) { startGame(); warp(deep); }
  else previews[pick].el.focus();
  window.addEventListener("hashchange", () => {
    const id = location.hash.slice(1);
    if (!zonePos[id] || !$("modal").hidden) return;
    if (!started) startGame();
    warp(id);
  });
}
boot();
