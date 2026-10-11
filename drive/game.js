// Drive the Portfolio — a small 3D island you explore by car.
import * as THREE from "three";
import { ZONES, TOKENS, SKILL_CRATES } from "./content.js";

/* =========================================================================
   Helpers
   ========================================================================= */
const $ = (id) => document.getElementById(id);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const damp = (a, b, lambda, dt) => a + (b - a) * (1 - Math.exp(-lambda * dt));
const angleDiff = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));
const TAU = Math.PI * 2;
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
// Rotate a point around the Y axis exactly the way three.js does for rotation.y.
function rotY(x, z, a) {
  const c = Math.cos(a), s = Math.sin(a);
  return [x * c + z * s, -x * s + z * c];
}
const isTouch = window.matchMedia("(hover: none)").matches || "ontouchstart" in window;
const isSmall = () => window.innerWidth <= 700;
const FONT = '"Inter", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif';

function fail() {
  $("fail").hidden = false;
  $("intro").classList.add("gone");
}

/* =========================================================================
   Renderer, scene, camera, lights
   ========================================================================= */
const canvas = $("scene");
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
} catch (e) {
  fail();
  throw e;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio, isTouch ? 1.75 : 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xdfe6ee, 140, 320);
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.5, 700);
camera.position.set(0, 90, 120);

const hemi = new THREE.HemisphereLight(0xffffff, 0xb7c4a8, 1.6);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff4e5, 2.6);
sun.castShadow = true;
sun.shadow.mapSize.set(isTouch ? 1024 : 2048, isTouch ? 1024 : 2048);
Object.assign(sun.shadow.camera, { left: -48, right: 48, top: 48, bottom: -48, near: 1, far: 160 });
sun.shadow.bias = -0.0006;
sun.shadow.normalBias = 0.02;
scene.add(sun, sun.target);

/* =========================================================================
   Materials, theme palettes, canvas textures
   ========================================================================= */
const matCache = new Map();
function mat(color, opts = {}) {
  const key = color + JSON.stringify(opts);
  if (!matCache.has(key)) matCache.set(key, new THREE.MeshStandardMaterial({ color, roughness: 0.75, metalness: 0.05, ...opts }));
  return matCache.get(key);
}
// Materials that should glow more at night: [material, dayIntensity, nightIntensity]
const glows = [];
function glow(m, day, night) { glows.push([m, day, night]); m.emissiveIntensity = day; return m; }

function canvasTex(w, h, draw) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return t;
}
function roundRect(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}
function fitFont(g, text, weight, size, maxW) {
  let s = size;
  do { g.font = `${weight} ${s}px ${FONT}`; s -= 2; } while (g.measureText(text).width > maxW && s > 10);
}

const DAY = {
  sky: 0xdfe6ee, fogNear: 140, fogFar: 320, grass: 0xcadbbd, plaza: 0xf4f4f2, road: 0x3b4048, dash: 0xffffff,
  side: 0xcdb98f, water: 0x9fc9e6, hemiSky: 0xffffff, hemiGround: 0xb7c4a8, hemiI: 1.6, sunI: 2.6, sunC: 0xfff4e5,
  text: 0x1d1d1f, label: 0xffffff, leaf: 1, headlights: false,
};
const NIGHT = {
  sky: 0x0b0d12, fogNear: 120, fogFar: 300, grass: 0x2a3d30, plaza: 0x3a3e46, road: 0x1d2026, dash: 0xb0b6be,
  side: 0x3a3226, water: 0x0d1828, hemiSky: 0x8a9be0, hemiGround: 0x1a2028, hemiI: 1.25, sunI: 0.9, sunC: 0xb4c6ff,
  text: 0xf5f5f7, label: 0xc7ccd4, leaf: 0.42, headlights: true,
};

/* =========================================================================
   World layout
   ========================================================================= */
const ISLAND_R = 140;
const DRIVE_R = 127;
const RING_R = 50;
const PLAZA_R = 24;
const TRIGGER_R = 70;
const BUILD_R = 87;
const N = ZONES.length;
const zoneAngle = (i) => (i / N) * TAU;
const polar = (a, r) => [Math.sin(a) * r, -Math.cos(a) * r]; // a = 0 points north (-z)

const world = new THREE.Group();
scene.add(world);
const colliders = []; // {type:'box', x, z, hw, hd, rot} | {type:'circle', x, z, r}
const themed = {}; // materials recoloured by the day/night toggle

function add(parent, geo, material, x = 0, y = 0, z = 0, { cast = true, receive = true } = {}) {
  const m = new THREE.Mesh(geo, material);
  m.position.set(x, y, z);
  m.castShadow = cast;
  m.receiveShadow = receive;
  parent.add(m);
  return m;
}
const flat = (geo) => { geo.rotateX(-Math.PI / 2); return geo; };

function buildGround() {
  themed.water = new THREE.MeshBasicMaterial({ color: DAY.water });
  add(world, flat(new THREE.PlaneGeometry(2400, 2400)), themed.water, 0, -3.2, 0, { cast: false, receive: false });

  themed.side = mat(DAY.side, { roughness: 1 });
  add(world, new THREE.CylinderGeometry(ISLAND_R, ISLAND_R - 10, 8, 96), themed.side, 0, -4.02, 0, { cast: false });

  themed.grass = new THREE.MeshStandardMaterial({ color: DAY.grass, roughness: 1 });
  add(world, flat(new THREE.CircleGeometry(ISLAND_R, 96)), themed.grass, 0, 0, 0, { cast: false });

  themed.plaza = new THREE.MeshStandardMaterial({ color: DAY.plaza, roughness: 0.9 });
  add(world, flat(new THREE.CircleGeometry(PLAZA_R, 64)), themed.plaza, 0, 0.02, 0, { cast: false });

  themed.road = new THREE.MeshStandardMaterial({ color: DAY.road, roughness: 0.95 });
  add(world, flat(new THREE.RingGeometry(RING_R - 5, RING_R + 5, 128)), themed.road, 0, 0.03, 0, { cast: false });

  // Spokes from the plaza out to every landmark
  for (let i = 0; i < N; i++) {
    const a = zoneAngle(i);
    const len = TRIGGER_R + 4 - (PLAZA_R - 2);
    const mid = (TRIGGER_R + 4 + PLAZA_R - 2) / 2;
    const [x, z] = polar(a, mid);
    const spoke = add(world, flat(new THREE.PlaneGeometry(8, len)), themed.road, x, 0.03, z, { cast: false });
    spoke.rotation.y = -a;
  }

  // Lane dashes
  themed.dash = new THREE.MeshBasicMaterial({ color: DAY.dash });
  const dashes = new THREE.InstancedMesh(flat(new THREE.PlaneGeometry(0.35, 2.4)), themed.dash, 72);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(1, 1, 1);
  for (let i = 0; i < 72; i++) {
    const a = (i / 72) * TAU;
    const [x, z] = polar(a, RING_R);
    q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -a + Math.PI / 2);
    m4.compose(new THREE.Vector3(x, 0.05, z), q, s);
    dashes.setMatrixAt(i, m4);
  }
  world.add(dashes);
}

// Big name painted on the plaza, plus road markings that name each spoke.
function buildGroundText() {
  const nameTex = canvasTex(2048, 680, (g, w, h) => {
    g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle";
    fitFont(g, "ROHITHRAJ BASKARAN", 800, 210, w - 80);
    g.fillText("ROHITHRAJ BASKARAN", w / 2, 250);
    fitFont(g, "SOFTWARE ENGINEER  ·  AI  ·  FULL-STACK  ·  GRC", 600, 74, w - 200);
    g.globalAlpha = 0.7;
    g.fillText("SOFTWARE ENGINEER  ·  AI  ·  FULL-STACK  ·  GRC", w / 2, 470);
  });
  themed.nameMat = new THREE.MeshBasicMaterial({ map: nameTex, transparent: true, color: DAY.text, depthWrite: false });
  add(world, flat(new THREE.PlaneGeometry(40, 13.3)), themed.nameMat, 0, 0.06, -6, { cast: false, receive: false });

  const hintTex = canvasTex(2048, 200, (g, w, h) => {
    g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle";
    const t = isTouch ? "STEER WITH THE JOYSTICK  ·  FOLLOW THE ROADS" : "W A S D  OR  ARROW KEYS  ·  SPACE TO DRIFT  ·  SHIFT TO BOOST";
    fitFont(g, t, 700, 80, w - 60);
    g.globalAlpha = 0.55;
    g.fillText(t, w / 2, h / 2);
  });
  themed.hintMat = new THREE.MeshBasicMaterial({ map: hintTex, transparent: true, color: DAY.text, depthWrite: false });
  add(world, flat(new THREE.PlaneGeometry(30, 2.9)), themed.hintMat, 0, 0.06, 4, { cast: false, receive: false });

  themed.labelMats = [];
  ZONES.forEach((zone, i) => {
    const a = zoneAngle(i);
    const tex = canvasTex(1024, 220, (g, w, h) => {
      g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle";
      fitFont(g, zone.title.toUpperCase(), 800, 120, w - 40);
      g.fillText(zone.title.toUpperCase(), w / 2, h / 2);
    });
    const m = new THREE.MeshBasicMaterial({ map: tex, transparent: true, color: DAY.label, depthWrite: false, opacity: 0.85 });
    themed.labelMats.push(m);
    const [x, z] = polar(a, 33);
    const p = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.215).rotateX(-Math.PI / 2), m);
    p.scale.set(7, 1, 7);
    p.position.set(x, 0.06, z);
    p.rotation.y = -a;
    world.add(p);
  });
}

/* =========================================================================
   Landmarks (one per zone), each built from simple primitives
   ========================================================================= */
const animated = []; // objects with an update(t, dt) function

function windowTex(base, lit, cols, rows, emissiveOnly) {
  return canvasTex(256, 512, (g, w, h) => {
    g.fillStyle = emissiveOnly ? "#000" : base;
    g.fillRect(0, 0, w, h);
    const rnd = mulberry32(cols * 31 + rows);
    const cw = w / cols, rh = h / rows;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const on = rnd() > 0.35;
      g.fillStyle = emissiveOnly ? (on ? lit : "#000") : (on ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.35)");
      g.fillRect(c * cw + cw * 0.18, r * rh + rh * 0.2, cw * 0.64, rh * 0.55);
    }
  });
}

const B = {
  house(c) {
    const g = new THREE.Group();
    add(g, new THREE.BoxGeometry(12, 5.5, 9), mat(0xffffff), 0, 2.75, 0);
    const tri = new THREE.Shape();
    tri.moveTo(-6.8, 0); tri.lineTo(6.8, 0); tri.lineTo(0, 4.2); tri.closePath();
    const roofGeo = new THREE.ExtrudeGeometry(tri, { depth: 10, bevelEnabled: false });
    roofGeo.translate(0, 0, -5);
    add(g, roofGeo, mat(c), 0, 5.5, 0);
    add(g, new THREE.BoxGeometry(1.2, 2.6, 1.2), mat(0xd9dce1), 3.5, 8, -1.5);
    add(g, new THREE.BoxGeometry(2, 3.4, 0.2), mat(0x2c2c2e), 0, 1.7, 4.55);
    const win = glow(mat(0xbfe3ff, { emissive: 0xffd27a }), 0, 1.4);
    [-3.8, 3.8].forEach((x) => add(g, new THREE.BoxGeometry(2.4, 1.8, 0.15), win, x, 3, 4.55, { cast: false }));
    return { g, col: [["box", 0, 0, 6.3, 4.8]], signY: 14 };
  },
  tower(c) {
    const g = new THREE.Group();
    const m = new THREE.MeshStandardMaterial({
      map: windowTex("#7d86c9", "#ffd98a", 5, 12), emissive: 0xffffff,
      emissiveMap: windowTex("", "#ffd98a", 5, 12, true), roughness: 0.35, metalness: 0.3,
    });
    glow(m, 0, 1.1);
    add(g, new THREE.BoxGeometry(10, 24, 10), m, 0, 12, 0);
    add(g, new THREE.BoxGeometry(10.8, 1.2, 10.8), mat(c), 0, 24.6, 0);
    add(g, new THREE.BoxGeometry(11, 1.2, 11), mat(c), 0, 0.6, 0);
    add(g, new THREE.CylinderGeometry(0.15, 0.15, 5, 8), mat(0x8e8e93), 0, 27.5, 0);
    const beacon = add(g, new THREE.SphereGeometry(0.45, 12, 8), glow(mat(0xff453a, { emissive: 0xff453a }), 0.8, 2.5), 0, 30.2, 0, { cast: false });
    animated.push({ update: (t) => { beacon.material.emissiveIntensity = (Math.sin(t * 4) > 0 ? 1 : 0.2) * (body.classList.contains("night") ? 2.5 : 0.9); } });
    return { g, col: [["box", 0, 0, 5.5, 5.5]], signY: 33 };
  },
  shop(c) {
    const g = new THREE.Group();
    add(g, new THREE.BoxGeometry(12, 6, 9), mat(0xf4ede4), 0, 3, 0);
    add(g, new THREE.BoxGeometry(12.4, 0.5, 9.4), mat(0xe2d8cb), 0, 6.25, 0);
    const stripes = canvasTex(512, 64, (x, w, h) => {
      for (let i = 0; i < 16; i++) { x.fillStyle = i % 2 ? "#ffffff" : c; x.fillRect((i * w) / 16, 0, w / 16, h); }
    });
    const awning = add(g, new THREE.BoxGeometry(12.6, 0.25, 3.2), new THREE.MeshStandardMaterial({ map: stripes }), 0, 5.2, 5.6);
    awning.rotation.x = 0.32;
    const win = glow(mat(0xcfe8ff, { emissive: 0xffd27a }), 0.05, 1.4);
    add(g, new THREE.BoxGeometry(8, 2.8, 0.15), win, -1, 2.4, 4.55, { cast: false });
    add(g, new THREE.BoxGeometry(1.8, 3.4, 0.15), mat(0x2c2c2e), 4.4, 1.7, 4.55);
    return { g, col: [["box", 0, 0, 6.3, 4.8]], signY: 12 };
  },
  servers(c) {
    const g = new THREE.Group();
    add(g, new THREE.BoxGeometry(13, 0.5, 9), mat(0x2c2c2e), 0, 0.25, 0);
    const led = canvasTex(128, 512, (x, w, h) => {
      x.fillStyle = "#050607"; x.fillRect(0, 0, w, h);
      for (let i = 0; i < 18; i++) {
        x.fillStyle = i % 5 === 0 ? "#64d2ff" : "#30d158";
        x.fillRect(14, 18 + i * 27, i % 3 === 0 ? 60 : 90, 6);
        x.fillStyle = "#30d158"; x.beginPath(); x.arc(110, 21 + i * 27, 4, 0, TAU); x.fill();
      }
    });
    const ledMat = glow(new THREE.MeshStandardMaterial({ map: led, emissive: 0xffffff, emissiveMap: led }), 0.7, 1.6);
    for (let i = 0; i < 4; i++) {
      const x = -4.5 + i * 3;
      add(g, new THREE.BoxGeometry(2.3, 6, 2.6), mat(0x1c1c1e, { roughness: 0.4 }), x, 3.5, -1);
      add(g, new THREE.PlaneGeometry(1.9, 5.4), ledMat, x, 3.5, 0.31, { cast: false });
    }
    // Floating shield with a check mark
    const s = new THREE.Shape();
    s.moveTo(0, 1.6); s.lineTo(1.4, 1.05); s.lineTo(1.4, 0); s.quadraticCurveTo(1.3, -1.2, 0, -1.8);
    s.quadraticCurveTo(-1.3, -1.2, -1.4, 0); s.lineTo(-1.4, 1.05); s.closePath();
    const shieldGeo = new THREE.ExtrudeGeometry(s, { depth: 0.5, bevelEnabled: true, bevelSize: 0.12, bevelThickness: 0.12, bevelSegments: 2 });
    shieldGeo.center();
    const shield = new THREE.Group();
    add(shield, shieldGeo, glow(mat(c, { emissive: c }), 0.25, 0.9));
    const tick = mat(0xffffff);
    const t1 = add(shield, new THREE.BoxGeometry(0.35, 1.0, 0.3), tick, -0.35, -0.1, 0.4);
    t1.rotation.z = 0.75;
    const t2 = add(shield, new THREE.BoxGeometry(0.35, 1.8, 0.3), tick, 0.35, 0.15, 0.4);
    t2.rotation.z = -0.6;
    shield.scale.setScalar(1.6);
    shield.position.set(0, 10, 0);
    g.add(shield);
    animated.push({ update: (t) => { shield.rotation.y = t * 0.9; shield.position.y = 10 + Math.sin(t * 1.6) * 0.4; } });
    return { g, col: [["box", 0, 0, 6.5, 4.5]], signY: 15 };
  },
  database(c) {
    const g = new THREE.Group();
    const body = mat(c, { roughness: 0.5 });
    const rim = mat(0xffffff);
    for (let i = 0; i < 3; i++) {
      add(g, new THREE.CylinderGeometry(4.2, 4.2, 2.2, 40), body, 0, 1.1 + i * 2.6, 0);
      add(g, new THREE.CylinderGeometry(4.25, 4.25, 0.35, 40), rim, 0, 2.38 + i * 2.6, 0);
    }
    const lens = new THREE.Group();
    add(lens, new THREE.TorusGeometry(1.5, 0.32, 12, 40), mat(0x1d1d1f));
    add(lens, new THREE.CircleGeometry(1.45, 32), glow(mat(0xffffff, { emissive: 0xbfefff, transparent: true, opacity: 0.6 }), 0.3, 1));
    const handle = add(lens, new THREE.CylinderGeometry(0.28, 0.28, 2.4, 10), mat(0x1d1d1f), 1.6, -1.6, 0);
    handle.rotation.z = Math.PI / 4;
    lens.position.set(5.5, 6, 2);
    g.add(lens);
    animated.push({ update: (t) => { lens.position.x = 5.5 + Math.sin(t * 0.8) * 1.2; lens.position.y = 6 + Math.cos(t * 1.1) * 0.6; lens.rotation.y = Math.sin(t * 0.7) * 0.5; } });
    return { g, col: [["circle", 0, 0, 4.6]], signY: 13 };
  },
  monitor(c) {
    const g = new THREE.Group();
    add(g, new THREE.BoxGeometry(15, 9, 0.8), mat(0x1d1d1f, { roughness: 0.35 }), 0, 7, 0);
    const screen = canvasTex(1024, 600, (x, w, h) => {
      x.fillStyle = "#f5f5f7"; x.fillRect(0, 0, w, h);
      x.fillStyle = "#e5e5ea"; x.fillRect(0, 0, w, 58);
      ["#ff5f57", "#febc2e", "#28c840"].forEach((col, i) => { x.fillStyle = col; x.beginPath(); x.arc(34 + i * 30, 29, 9, 0, TAU); x.fill(); });
      x.fillStyle = "#fff"; roundRect(x, 150, 14, 560, 30, 15); x.fill();
      x.fillStyle = "#8e8e93"; x.font = `500 18px ${FONT}`; x.fillText("careers.example.com/apply", 172, 35);
      const rows = [["Full name", "Rohithraj Baskaran"], ["Most recent employer", "Plutus Consultancy"], ["Job title", "Software Engineer"], ["Location", "Toronto, ON"]];
      rows.forEach(([lbl, val], i) => {
        const y = 100 + i * 108;
        x.fillStyle = "#6e6e73"; x.font = `600 20px ${FONT}`; x.fillText(lbl, 60, y);
        x.fillStyle = "#fff"; x.strokeStyle = "#d1d1d6"; x.lineWidth = 2; roundRect(x, 60, y + 12, 780, 54, 12); x.fill(); x.stroke();
        x.fillStyle = "#1d1d1f"; x.font = `500 24px ${FONT}`; x.fillText(val, 80, y + 48);
        x.fillStyle = "#30d158"; x.font = `800 30px ${FONT}`; x.fillText("✓", 800, y + 50);
      });
      x.fillStyle = c; roundRect(x, 870, 500, 120, 56, 28); x.fill();
      x.fillStyle = "#fff"; x.font = `700 22px ${FONT}`; x.fillText("Autofill", 888, 535);
    });
    add(g, new THREE.PlaneGeometry(14.2, 8.2), glow(new THREE.MeshStandardMaterial({ map: screen, emissive: 0xffffff, emissiveMap: screen }), 0.35, 0.95), 0, 7, 0.41, { cast: false });
    add(g, new THREE.BoxGeometry(1.4, 2.8, 0.8), mat(0xc7c7cc), 0, 1.6, -0.2);
    add(g, new THREE.BoxGeometry(6, 0.4, 3.6), mat(0xc7c7cc), 0, 0.2, 0);
    const puzzle = add(g, new THREE.BoxGeometry(2.4, 2.4, 0.6), mat(c), 8.6, 9.6, 0.6);
    animated.push({ update: (t) => { puzzle.rotation.y = t * 1.2; puzzle.position.y = 9.6 + Math.sin(t * 2) * 0.35; } });
    return { g, col: [["box", 0, 0, 7.6, 1.9]], signY: 15 };
  },
  chart(c) {
    const g = new THREE.Group();
    add(g, new THREE.BoxGeometry(13, 0.5, 7), mat(0xffffff), 0, 0.25, 0);
    const shades = [0xd9b8f2, 0xc98ff0, c, 0x8944ab];
    [3, 5, 4, 7.5].forEach((hgt, i) => add(g, new THREE.BoxGeometry(2.2, hgt, 2.2), mat(shades[i]), -4.5 + i * 3, 0.5 + hgt / 2, 1));
    const donut = add(g, new THREE.TorusGeometry(2, 0.75, 16, 48), mat(c), 0, 10.5, -1.5);
    const coin = mat(0xffd60a, { metalness: 0.6, roughness: 0.3 });
    for (let i = 0; i < 6; i++) add(g, new THREE.CylinderGeometry(1, 1, 0.3, 24), coin, 5.2, 0.65 + i * 0.32, -2.2);
    animated.push({ update: (t) => { donut.rotation.y = t * 0.8; } });
    return { g, col: [["box", 0, 0, 6.6, 3.6]], signY: 15 };
  },
  garage() {
    const g = new THREE.Group();
    add(g, new THREE.BoxGeometry(14, 7, 10), mat(0xdcdfe4), 0, 3.5, 0);
    add(g, new THREE.BoxGeometry(14.6, 0.6, 10.6), mat(0x8e8e93), 0, 7.3, 0);
    const door = canvasTex(256, 256, (x, w, h) => {
      x.fillStyle = "#b8bcc4"; x.fillRect(0, 0, w, h);
      x.fillStyle = "#a1a5ad"; for (let i = 0; i < 10; i++) x.fillRect(0, i * 26 + 20, w, 5);
    });
    add(g, new THREE.PlaneGeometry(9, 5.4), new THREE.MeshStandardMaterial({ map: door }), 0, 2.7, 5.02, { cast: false });
    const code = canvasTex(512, 160, (x, w, h) => {
      x.fillStyle = "#1d1d1f"; roundRect(x, 0, 0, w, h, 30); x.fill();
      x.fillStyle = "#fff"; x.font = `800 96px ${FONT}`; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText("</>", w / 2, h / 2 + 4);
    });
    add(g, new THREE.PlaneGeometry(4.8, 1.5), new THREE.MeshBasicMaterial({ map: code }), 0, 6.2, 5.03, { cast: false });
    return { g, col: [["box", 0, 0, 7.1, 5.1]], signY: 13 };
  },
  book(c) {
    const g = new THREE.Group();
    add(g, new THREE.BoxGeometry(10, 1.6, 5.5), mat(0xffffff), 0, 0.8, 0);
    const page = (title) => canvasTex(512, 680, (x, w, h) => {
      x.fillStyle = "#fffdf7"; x.fillRect(0, 0, w, h);
      x.fillStyle = "#1d1d1f";
      if (title) {
        x.font = `800 52px ${FONT}`;
        ["What GRC", "Actually Is"].forEach((l, i) => x.fillText(l, 40, 100 + i * 62));
        x.fillStyle = c; x.fillRect(40, 250, 120, 10);
      }
      x.fillStyle = "#c7c7cc";
      for (let i = 0; i < (title ? 9 : 15); i++) x.fillRect(40, (title ? 300 : 70) + i * 38, w - 80 - (i % 4) * 40, 12);
    });
    const book = new THREE.Group();
    const cover = mat(c);
    [[-2.85, 0.1, page(true)], [2.85, -0.1, page(false)]].forEach(([x, rz, tex]) => {
      const white = mat(0xfffdf7);
      const p = add(book, new THREE.BoxGeometry(5.4, 0.35, 7.2), [white, white, new THREE.MeshStandardMaterial({ map: tex }), white, white, white], x, 0.3, 0);
      p.rotation.z = rz;
      const cv = add(book, new THREE.BoxGeometry(5.7, 0.2, 7.5), cover, x, 0.05, 0);
      cv.rotation.z = rz;
    });
    book.rotation.x = 0.65;
    book.position.set(0, 2.6, 0.6);
    g.add(book);
    return { g, col: [["box", 0, 0, 5.3, 2.9]], signY: 11 };
  },
  crates() {
    return { g: new THREE.Group(), col: [], signY: 14 };
  },
  mailbox(c) {
    const g = new THREE.Group();
    add(g, new THREE.CylinderGeometry(0.35, 0.35, 3.2, 12), mat(0x8e8e93), 0, 1.6, 0);
    const red = mat(c, { roughness: 0.45 });
    add(g, new THREE.BoxGeometry(3, 2, 5), red, 0, 4.2, 0);
    const top = new THREE.CylinderGeometry(1.5, 1.5, 5, 28, 1, false, Math.PI / 2, Math.PI);
    top.rotateX(Math.PI / 2);
    add(g, top, red, 0, 5.2, 0);
    add(g, new THREE.BoxGeometry(2.9, 3.2, 0.1), mat(0x1d1d1f), 0, 4.6, 2.52);
    const flag = new THREE.Group();
    add(flag, new THREE.BoxGeometry(0.15, 2.4, 0.15), mat(0xffffff), 0, 1.2, 0);
    add(flag, new THREE.BoxGeometry(0.12, 0.9, 1.4), mat(0xffd60a), 0, 2, 0.7);
    flag.position.set(1.6, 3.7, -0.5);
    g.add(flag);
    const env = new THREE.Group();
    add(env, new THREE.BoxGeometry(3, 2, 0.12), mat(0xffffff), 0, 0, 0);
    const f1 = add(env, new THREE.BoxGeometry(1.9, 0.1, 0.14), mat(c), -0.75, 0.45, 0.02); f1.rotation.z = -0.5;
    const f2 = add(env, new THREE.BoxGeometry(1.9, 0.1, 0.14), mat(c), 0.75, 0.45, 0.02); f2.rotation.z = 0.5;
    env.position.set(0, 9.5, 0);
    g.add(env);
    animated.push({ update: (t) => { env.rotation.y = Math.sin(t * 1.2) * 0.6; env.position.y = 9.5 + Math.sin(t * 2) * 0.5; flag.rotation.x = Math.sin(t * 3) * 0.15; } });
    return { g, col: [["box", 0, 0, 1.7, 2.7]], signY: 13.5 };
  },
};

function signTextures(zone) {
  const make = (night) => canvasTex(768, 200, (g, w, h) => {
    roundRect(g, 6, 6, w - 12, h - 12, 46);
    g.fillStyle = night ? "rgba(28,28,32,0.94)" : "rgba(255,255,255,0.95)";
    g.fill();
    g.fillStyle = zone.color; g.beginPath(); g.arc(86, h / 2, 28, 0, TAU); g.fill();
    g.fillStyle = night ? "#f5f5f7" : "#1d1d1f";
    fitFont(g, zone.title, 800, 64, w - 180);
    g.textBaseline = "alphabetic";
    g.fillText(zone.title, 140, 98);
    g.fillStyle = night ? "#a1a1a6" : "#6e6e73";
    fitFont(g, zone.sub, 600, 34, w - 180);
    g.fillText(zone.sub, 140, 148);
  });
  return [make(false), make(true)];
}

const zoneState = []; // per zone: { trigger:[x,z], ring, disc, sign, textures }
function buildZones() {
  ZONES.forEach((zone, i) => {
    const a = zoneAngle(i);
    const built = B[zone.building](zone.color);
    const [bx, bz] = polar(a, BUILD_R);
    built.g.position.set(bx, 0, bz);
    built.g.rotation.y = -a; // front (+z) faces the plaza
    world.add(built.g);
    const rot = built.g.rotation.y;
    built.col.forEach(([type, ox, oz, p1, p2]) => {
      const [dx, dz] = rotY(ox, oz, rot);
      if (type === "box") colliders.push({ type, x: bx + dx, z: bz + dz, hw: p1, hd: p2, rot });
      else colliders.push({ type, x: bx + dx, z: bz + dz, r: p1 });
    });

    const textures = signTextures(zone);
    const sign = new THREE.Sprite(new THREE.SpriteMaterial({ map: textures[0], depthWrite: false }));
    sign.scale.set(15.4, 4, 1);
    sign.position.set(bx, built.signY, bz);
    world.add(sign);

    const [tx, tz] = polar(a, TRIGGER_R);
    const ringMat = new THREE.MeshBasicMaterial({ color: zone.color, transparent: true, opacity: 0.9, depthWrite: false });
    const ring = add(world, flat(new THREE.RingGeometry(6.3, 7, 64)), ringMat, tx, 0.07, tz, { cast: false, receive: false });
    const discMat = new THREE.MeshBasicMaterial({ color: zone.color, transparent: true, opacity: 0.16, depthWrite: false });
    const disc = add(world, flat(new THREE.CircleGeometry(6.3, 64)), discMat, tx, 0.065, tz, { cast: false, receive: false });
    zoneState.push({ zone, angle: a, trigger: [tx, tz], ring, disc, sign, textures });
  });
}

/* ---------- Trees, rocks, lamps ---------- */
function nearSpoke(x, z, pad) {
  for (let i = 0; i < N; i++) {
    const a = zoneAngle(i);
    const ux = Math.sin(a), uz = -Math.cos(a);
    const t = x * ux + z * uz;
    if (t < PLAZA_R - 4 || t > BUILD_R + 12) continue;
    const px = x - ux * t, pz = z - uz * t;
    const limit = t > TRIGGER_R - 4 ? 13 : pad; // keep landmarks clear
    if (Math.hypot(px, pz) < limit) return true;
  }
  return false;
}
function buildNature() {
  const rnd = mulberry32(7);
  const spots = [];
  let guard = 0;
  while (spots.length < 150 && guard++ < 6000) {
    const a = rnd() * TAU, r = Math.sqrt(rnd()) * (DRIVE_R + 6);
    const x = Math.sin(a) * r, z = -Math.cos(a) * r;
    if (r < PLAZA_R + 3 || Math.abs(r - RING_R) < 8.5 || nearSpoke(x, z, 7.5)) continue;
    if (spots.some((s) => Math.hypot(s[0] - x, s[1] - z) < 4.2)) continue;
    spots.push([x, z, 0.75 + rnd() * 0.6, rnd()]);
  }
  const cones = spots.filter((s) => s[3] < 0.6), rounds = spots.filter((s) => s[3] >= 0.6);
  themed.leaf = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, flatShading: true });
  const trunkMat = mat(0x8b6b4a);
  const trunks = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.28, 0.4, 2.2, 6), trunkMat, spots.length);
  const coneMesh = new THREE.InstancedMesh(new THREE.ConeGeometry(1.9, 4.8, 7), themed.leaf, cones.length);
  const roundMesh = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(2.1, 0), themed.leaf, rounds.length);
  [trunks, coneMesh, roundMesh].forEach((m) => { m.castShadow = true; m.receiveShadow = true; world.add(m); });
  const greens = [0x6fbf73, 0x5aa86a, 0x82c785, 0x4e9a6b, 0x9ccc7a].map((c) => new THREE.Color(c));
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0);
  spots.forEach((s, i) => {
    const sc = s[2];
    q.setFromAxisAngle(up, s[3] * 10);
    m4.compose(new THREE.Vector3(s[0], 1.1 * sc, s[1]), q, new THREE.Vector3(sc, sc, sc));
    trunks.setMatrixAt(i, m4);
    colliders.push({ type: "circle", x: s[0], z: s[1], r: 0.9 * sc, tree: true });
  });
  cones.forEach((s, i) => {
    const sc = s[2];
    q.setFromAxisAngle(up, s[3] * 10);
    m4.compose(new THREE.Vector3(s[0], (2.2 + 2.4) * sc, s[1]), q, new THREE.Vector3(sc, sc, sc));
    coneMesh.setMatrixAt(i, m4);
    coneMesh.setColorAt(i, greens[i % greens.length]);
  });
  rounds.forEach((s, i) => {
    const sc = s[2];
    q.setFromAxisAngle(up, s[3] * 10);
    m4.compose(new THREE.Vector3(s[0], (2.2 + 1.6) * sc, s[1]), q, new THREE.Vector3(sc, sc * 1.05, sc));
    roundMesh.setMatrixAt(i, m4);
    roundMesh.setColorAt(i, greens[(i + 2) % greens.length]);
  });

  // Rocks along the shoreline
  const rockMat = mat(0xb9b4aa, { flatShading: true });
  for (let i = 0; i < 26; i++) {
    const a = rnd() * TAU, r = ISLAND_R - 3 - rnd() * 4;
    const x = Math.sin(a) * r, z = -Math.cos(a) * r;
    const sc = 0.8 + rnd() * 1.6;
    const rock = add(world, new THREE.DodecahedronGeometry(sc, 0), rockMat, x, sc * 0.4, z);
    rock.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3);
  }

  // Street lamps between the spokes
  const pole = mat(0x3a3a3c);
  const bulb = glow(mat(0xfff2d6, { emissive: 0xffd27a }), 0.1, 2.4);
  for (let i = 0; i < N; i++) {
    const a = zoneAngle(i) + Math.PI / N;
    const [x, z] = polar(a, RING_R + 7.5);
    add(world, new THREE.CylinderGeometry(0.15, 0.2, 5.4, 8), pole, x, 2.7, z);
    add(world, new THREE.SphereGeometry(0.55, 14, 10), bulb, x, 5.6, z, { cast: false });
    colliders.push({ type: "circle", x, z, r: 0.5 });
  }
}

/* =========================================================================
   Collectible impact tokens
   ========================================================================= */
const tokens = [];
function buildTokens() {
  const slots = [0, 3, 6, 8];
  TOKENS.forEach((tk, i) => {
    const a = zoneAngle(slots[i]) + Math.PI / N;
    const [x, z] = polar(a, RING_R);
    const grp = new THREE.Group();
    const face = canvasTex(256, 256, (g, w, h) => {
      g.fillStyle = tk.color; g.fillRect(0, 0, w, h);
      g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle";
      fitFont(g, tk.value, 800, 92, w - 30);
      g.fillText(tk.value, w / 2, h / 2 + 4);
    });
    const side = glow(mat(tk.color, { emissive: tk.color, metalness: 0.3, roughness: 0.35 }), 0.25, 0.8);
    const faceMat = glow(new THREE.MeshStandardMaterial({ map: face, emissive: 0xffffff, emissiveMap: face, roughness: 0.35 }), 0.2, 0.75);
    const coin = add(grp, new THREE.CylinderGeometry(1.7, 1.7, 0.4, 40), [side, faceMat, faceMat], 0, 0, 0);
    coin.rotation.x = Math.PI / 2;
    const halo = add(grp, flat(new THREE.RingGeometry(2.2, 2.6, 40)), new THREE.MeshBasicMaterial({ color: tk.color, transparent: true, opacity: 0.5, depthWrite: false }), 0, -2.2, 0, { cast: false, receive: false });
    grp.position.set(x, 2.6, z);
    world.add(grp);
    tokens.push({ ...tk, grp, coin, halo, x, z, taken: false, phase: i });
  });
}

/* =========================================================================
   Skill crates (knock them over)
   ========================================================================= */
const crates = [];
function buildCrates() {
  const idx = ZONES.findIndex((z) => z.building === "crates");
  if (idx < 0) return;
  const a = zoneAngle(idx);
  const [cx, cz] = polar(a, BUILD_R - 4);
  const rot = -a;
  const rows = [6, 5, 4, 3, 2];
  const geo = new THREE.BoxGeometry(2, 2, 2);
  let n = 0;
  rows.forEach((count, r) => {
    for (let i = 0; i < count; i++) {
      const label = SKILL_CRATES[n++ % SKILL_CRATES.length];
      const tex = canvasTex(256, 256, (g, w, h) => {
        g.fillStyle = "#d9a066"; g.fillRect(0, 0, w, h);
        g.strokeStyle = "#b07a45"; g.lineWidth = 14; g.strokeRect(7, 7, w - 14, h - 14);
        g.fillStyle = "rgba(0,0,0,0.08)"; for (let k = 0; k < 4; k++) g.fillRect(14, 50 + k * 50, w - 28, 4);
        g.fillStyle = "#fffaf2"; roundRect(g, 22, 88, w - 44, 80, 16); g.fill();
        g.fillStyle = "#1d1d1f"; g.textAlign = "center"; g.textBaseline = "middle";
        fitFont(g, label, 800, 44, w - 64);
        g.fillText(label, w / 2, 130);
      });
      const mesh = add(world, geo, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85 }));
      const lx = (i - (count - 1) / 2) * 2.06;
      const [dx, dz] = rotY(lx, 0, rot);
      mesh.position.set(cx + dx, 1 + r * 2.02, cz + dz);
      mesh.rotation.y = rot;
      crates.push({ mesh, row: r, i, active: false, vel: new THREE.Vector3(), spin: new THREE.Vector3() });
    }
  });
}
function crateAt(r, i) { return crates.find((c) => c.row === r && c.i === i); }

/* =========================================================================
   The car
   ========================================================================= */
const car = {
  x: 0, z: 14, h: Math.PI, vx: 0, vz: 0, fs: 0, steer: 0, lat: 0,
  group: new THREE.Group(), body: new THREE.Group(), wheels: [], pivots: [], lights: [],
};
function buildCar() {
  const paint = mat(0x0a84ff, { roughness: 0.3, metalness: 0.35 });
  const white = mat(0xf5f5f7, { roughness: 0.4 });
  const glass = mat(0x1b2633, { roughness: 0.1, metalness: 0.5 });
  const dark = mat(0x1d1d1f);
  const b = car.body;
  add(b, new THREE.BoxGeometry(2.3, 0.75, 4.4), paint, 0, 0.85, 0);
  add(b, new THREE.BoxGeometry(2.0, 0.75, 2.2), glass, 0, 1.55, -0.3);
  add(b, new THREE.BoxGeometry(2.04, 0.12, 2.0), white, 0, 1.96, -0.3);
  add(b, new THREE.BoxGeometry(2.36, 0.3, 0.3), dark, 0, 0.55, 2.2);
  add(b, new THREE.BoxGeometry(2.36, 0.3, 0.3), dark, 0, 0.55, -2.2);
  add(b, new THREE.BoxGeometry(2.3, 0.08, 0.5), white, 0, 1.26, 1.9);
  // racing stripe
  add(b, new THREE.BoxGeometry(0.45, 0.02, 4.42), white, 0, 1.235, 0, { cast: false });
  const head = glow(mat(0xffffff, { emissive: 0xfff6d8 }), 0.4, 3);
  const tail = glow(mat(0xff3b30, { emissive: 0xff3b30 }), 0.4, 2);
  [-0.75, 0.75].forEach((x) => {
    add(b, new THREE.BoxGeometry(0.5, 0.22, 0.08), head, x, 0.92, 2.22, { cast: false });
    add(b, new THREE.BoxGeometry(0.5, 0.2, 0.08), tail, x, 0.92, -2.22, { cast: false });
  });
  car.tailMat = tail;
  car.group.add(b);

  const tire = mat(0x1c1c1e, { roughness: 0.9 });
  const hub = mat(0xc7c7cc, { metalness: 0.6, roughness: 0.3 });
  const tireGeo = new THREE.CylinderGeometry(0.52, 0.52, 0.46, 18).rotateZ(Math.PI / 2);
  const hubGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.48, 10).rotateZ(Math.PI / 2);
  [[-1.18, 1.35, true], [1.18, 1.35, true], [-1.18, -1.4, false], [1.18, -1.4, false]].forEach(([x, z, front]) => {
    const pivot = new THREE.Group();
    pivot.position.set(x, 0.52, z);
    const wheel = new THREE.Group();
    add(wheel, tireGeo, tire);
    add(wheel, hubGeo, hub, 0, 0, 0, { cast: false });
    pivot.add(wheel);
    car.group.add(pivot);
    car.wheels.push(wheel);
    if (front) car.pivots.push(pivot);
  });

  // Headlights (night only)
  [-0.75, 0.75].forEach((x) => {
    const sl = new THREE.SpotLight(0xfff1d0, 0, 46, 0.5, 0.55, 0);
    sl.position.set(x, 1, 2.2);
    sl.target.position.set(x * 2, 0, 16);
    car.group.add(sl, sl.target);
    car.lights.push(sl);
  });

  // Soft blob shadow helps the car read on dark ground
  const blob = canvasTex(128, 128, (g, w, h) => {
    const gr = g.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w / 2);
    gr.addColorStop(0, "rgba(0,0,0,0.35)"); gr.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  });
  add(car.group, flat(new THREE.PlaneGeometry(4, 6)), new THREE.MeshBasicMaterial({ map: blob, transparent: true, depthWrite: false }), 0, 0.08, 0, { cast: false, receive: false });

  scene.add(car.group);
}

/* =========================================================================
   Effects: skid marks, smoke, confetti
   ========================================================================= */
const SKIDS = 700;
let skidMesh, skidIdx = 0, skidTimer = 0;
const smoke = [];
const confetti = [];
function buildFx() {
  skidMesh = new THREE.InstancedMesh(
    flat(new THREE.PlaneGeometry(0.42, 0.9)),
    new THREE.MeshBasicMaterial({ color: 0x111111, transparent: true, opacity: 0.28, depthWrite: false }),
    SKIDS,
  );
  skidMesh.count = 0;
  skidMesh.frustumCulled = false;
  world.add(skidMesh);

  const smokeGeo = new THREE.IcosahedronGeometry(0.6, 0);
  for (let i = 0; i < 46; i++) {
    const m = new THREE.Mesh(smokeGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false }));
    m.visible = false;
    world.add(m);
    smoke.push({ m, life: 0, vel: new THREE.Vector3() });
  }
  const cg = new THREE.PlaneGeometry(0.35, 0.6);
  const colors = [0x0a84ff, 0xbf5af2, 0xff9f0a, 0x30d158, 0xff375f, 0xffd60a];
  for (let i = 0; i < 160; i++) {
    const m = new THREE.Mesh(cg, new THREE.MeshBasicMaterial({ color: colors[i % colors.length], side: THREE.DoubleSide }));
    m.visible = false;
    world.add(m);
    confetti.push({ m, life: 0, vel: new THREE.Vector3(), spin: new THREE.Vector3() });
  }
}
const _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _one = new THREE.Vector3(1, 1, 1), _up = new THREE.Vector3(0, 1, 0);
function addSkid(x, z, h) {
  _q.setFromAxisAngle(_up, h);
  _m4.compose(new THREE.Vector3(x, 0.045, z), _q, _one);
  skidMesh.setMatrixAt(skidIdx, _m4);
  skidIdx = (skidIdx + 1) % SKIDS;
  skidMesh.count = Math.min(skidMesh.count + 1, SKIDS);
  skidMesh.instanceMatrix.needsUpdate = true;
}
function puff(x, z, strength = 1) {
  const p = smoke.find((s) => s.life <= 0);
  if (!p) return;
  p.life = 1;
  p.m.visible = true;
  p.m.position.set(x, 0.5, z);
  p.m.scale.setScalar(0.5 * strength);
  p.vel.set((Math.random() - 0.5) * 1.5, 1.2 + Math.random(), (Math.random() - 0.5) * 1.5);
}
function burst(x, z, count = 70) {
  let n = 0;
  for (const c of confetti) {
    if (c.life > 0) continue;
    c.life = 2.6 + Math.random();
    c.m.visible = true;
    c.m.position.set(x + (Math.random() - 0.5) * 2, 2, z + (Math.random() - 0.5) * 2);
    const a = Math.random() * TAU, sp = 4 + Math.random() * 8;
    c.vel.set(Math.cos(a) * sp, 12 + Math.random() * 10, Math.sin(a) * sp);
    c.spin.set(Math.random() * 10, Math.random() * 10, Math.random() * 10);
    if (++n >= count) break;
  }
}

/* =========================================================================
   Input
   ========================================================================= */
const keys = new Set();
const joy = { x: 0, y: 0, mag: 0 };
let touchBoost = false;
const ctrlKeys = ["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space", "ShiftLeft", "ShiftRight"];

window.addEventListener("keydown", (e) => {
  const inUi = e.target.closest && e.target.closest(".panel, .map, .intro, .hud-top");
  if (e.code === "Escape") { if (!$("map").hidden) closeMap(); else if (panelZone) closePanel(true); return; }
  if (!started) {
    if ((e.code === "Enter" || e.code === "Space") && !inUi && !$("start").disabled) start();
    return;
  }
  if (inUi && (e.code === "Space" || e.code === "Enter")) return;
  if (e.code === "KeyM") { $("map").hidden ? openMap() : closeMap(); return; }
  if (!$("map").hidden) return;
  if (e.code === "KeyR") respawn();
  if (e.code === "KeyN") toggleTime();
  if (ctrlKeys.includes(e.code)) { keys.add(e.code); e.preventDefault(); }
});
window.addEventListener("keyup", (e) => keys.delete(e.code));
window.addEventListener("blur", () => keys.clear());

function setupTouch() {
  if (!isTouch) return;
  const stick = $("stick"), knob = $("knob");
  let id = null;
  const move = (e) => {
    const r = stick.getBoundingClientRect();
    let dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
    const max = r.width / 2 - 10, len = Math.hypot(dx, dy);
    if (len > max) { dx = (dx / len) * max; dy = (dy / len) * max; }
    knob.style.transform = `translate(${dx}px, ${dy}px)`;
    joy.x = dx / max; joy.y = dy / max; joy.mag = Math.min(len / max, 1);
  };
  stick.addEventListener("pointerdown", (e) => { id = e.pointerId; stick.setPointerCapture(id); move(e); });
  stick.addEventListener("pointermove", (e) => { if (e.pointerId === id) move(e); });
  const end = (e) => { if (e.pointerId !== id) return; id = null; joy.x = joy.y = joy.mag = 0; knob.style.transform = ""; };
  stick.addEventListener("pointerup", end);
  stick.addEventListener("pointercancel", end);
  const boost = $("boost");
  boost.addEventListener("pointerdown", (e) => { e.preventDefault(); touchBoost = true; boost.classList.add("on"); });
  ["pointerup", "pointercancel", "pointerleave"].forEach((ev) => boost.addEventListener(ev, () => { touchBoost = false; boost.classList.remove("on"); }));
}

/* =========================================================================
   Car physics and collisions
   ========================================================================= */
let shake = 0;
let travelled = 0;
const CAR_R = 1.7;

function collide() {
  for (const c of colliders) {
    let nx, nz, pen;
    if (c.type === "circle") {
      const dx = car.x - c.x, dz = car.z - c.z;
      const d = Math.hypot(dx, dz), min = c.r + CAR_R;
      if (d >= min || d < 1e-5) continue;
      nx = dx / d; nz = dz / d; pen = min - d;
    } else {
      const dx = car.x - c.x, dz = car.z - c.z;
      if (Math.abs(dx) > c.hw + c.hd + CAR_R || Math.abs(dz) > c.hw + c.hd + CAR_R) continue;
      const [lx, lz] = rotY(dx, dz, -c.rot);
      const qx = clamp(lx, -c.hw, c.hw), qz = clamp(lz, -c.hd, c.hd);
      let ex = lx - qx, ez = lz - qz;
      let d = Math.hypot(ex, ez);
      if (d >= CAR_R) continue;
      if (d < 1e-5) { // centre inside the box: push out along the shallowest axis
        const ox = c.hw - Math.abs(lx), oz = c.hd - Math.abs(lz);
        if (ox < oz) { ex = Math.sign(lx) || 1; ez = 0; pen = ox + CAR_R; } else { ex = 0; ez = Math.sign(lz) || 1; pen = oz + CAR_R; }
        d = 1;
      } else pen = CAR_R - d;
      [nx, nz] = rotY(ex / d, ez / d, c.rot);
    }
    car.x += nx * pen; car.z += nz * pen;
    const vn = car.vx * nx + car.vz * nz;
    if (vn < 0) {
      car.vx -= nx * vn * 1.35; car.vz -= nz * vn * 1.35;
      if (-vn > 9) { shake = Math.min(1, -vn / 30); thump(-vn); }
    }
  }
  const r = Math.hypot(car.x, car.z);
  if (r > DRIVE_R) {
    const nx = car.x / r, nz = car.z / r;
    car.x = nx * DRIVE_R; car.z = nz * DRIVE_R;
    const vn = car.vx * nx + car.vz * nz;
    if (vn > 0) { car.vx -= nx * vn * 1.4; car.vz -= nz * vn * 1.4; }
  }
}

function updateCar(dt) {
  let throttle = 0, steer = 0;
  const hand = keys.has("Space");
  const boost = keys.has("ShiftLeft") || keys.has("ShiftRight") || touchBoost;
  if (keys.has("KeyW") || keys.has("ArrowUp")) throttle += 1;
  if (keys.has("KeyS") || keys.has("ArrowDown")) throttle -= 1;
  if (keys.has("KeyA") || keys.has("ArrowLeft")) steer += 1;
  if (keys.has("KeyD") || keys.has("ArrowRight")) steer -= 1;
  if (joy.mag > 0.15) {
    // Joystick points where you want to go on screen; the car turns toward it.
    const want = Math.atan2(joy.x, joy.y);
    const diff = angleDiff(want, car.h);
    steer = clamp(diff * 2.2, -1, 1);
    throttle = joy.mag * (Math.abs(diff) > 2.4 && car.fs < 3 ? 0.5 : 1);
  }
  if (!$("map").hidden) { throttle = 0; steer = 0; }

  const fx = Math.sin(car.h), fz = Math.cos(car.h);
  let fs = car.vx * fx + car.vz * fz;
  let lx = car.vx - fx * fs, lz = car.vz - fz * fs;
  const maxF = boost ? 46 : 30;

  if (throttle > 0) { if (fs < maxF) fs += throttle * (boost ? 36 : 24) * dt; }
  else if (throttle < 0) { fs += fs > 0.5 ? throttle * 42 * dt : (fs > -12 ? throttle * 16 * dt : 0); }
  fs -= fs * (throttle === 0 ? 1.0 : 0.25) * dt;
  if (hand) fs -= fs * 1.1 * dt;
  if (fs > maxF) fs = damp(fs, maxF, 3, dt);

  const grip = hand ? 1.4 : 9;
  const k = Math.exp(-grip * dt);
  lx *= k; lz *= k;

  car.steer = damp(car.steer, steer, 10, dt);
  const turn = car.steer * 2.5 * clamp(fs / 9, -1, 1) * (hand ? 1.4 : 1);
  car.h += turn * dt;

  car.vx = fx * fs + lx; car.vz = fz * fs + lz;
  car.fs = fs;
  car.lat = Math.hypot(lx, lz);
  const px = car.x, pz = car.z;
  car.x += car.vx * dt; car.z += car.vz * dt;
  collide();
  travelled += Math.hypot(car.x - px, car.z - pz);

  // Visuals
  car.group.position.set(car.x, 0, car.z);
  car.group.rotation.y = car.h;
  car.wheels.forEach((w) => (w.rotation.x += (fs * dt) / 0.52));
  car.pivots.forEach((p) => (p.rotation.y = car.steer * 0.45));
  car.body.rotation.z = damp(car.body.rotation.z, -turn * clamp(fs / 30, -1, 1) * 0.09, 8, dt);
  car.body.rotation.x = damp(car.body.rotation.x, -throttle * 0.03 + (throttle < 0 && fs > 2 ? 0.05 : 0), 6, dt);
  car.tailMat.emissiveIntensity = throttle < 0 && fs > 0.5 ? 4 : body.classList.contains("night") ? 2 : 0.4;

  // Skids and smoke
  const drifting = car.lat > 4 || (hand && Math.abs(fs) > 7);
  skidTimer -= dt;
  if ((drifting || (boost && throttle > 0 && fs < 14)) && skidTimer <= 0) {
    skidTimer = 0.025;
    [-1.18, 1.18].forEach((ox) => {
      const [dx, dz] = rotY(ox, -1.4, car.h);
      addSkid(car.x + dx, car.z + dz, car.h);
      if (Math.random() < 0.5) puff(car.x + dx, car.z + dz, drifting ? 1.3 : 1);
    });
  }
  if (boost && throttle > 0 && Math.random() < 0.35) {
    const [dx, dz] = rotY(0, -2.4, car.h);
    puff(car.x + dx, car.z + dz, 0.7);
  }

  if (travelled > 40 && !$("hint").classList.contains("fade")) $("hint").classList.add("fade");
  updateAudio(throttle, boost);
}

function respawn() {
  Object.assign(car, { x: 0, z: 14, h: Math.PI, vx: 0, vz: 0, fs: 0 });
}

/* =========================================================================
   Crates, tokens, zones
   ========================================================================= */
let cratesDone = false;
function updateCrates(dt) {
  for (const c of crates) {
    const p = c.mesh.position;
    if (started) {
      const dx = p.x - car.x, dz = p.z - car.z, d = Math.hypot(dx, dz);
      if (d < 2.7 && p.y < 3.4) {
        const sp = Math.hypot(car.vx, car.vz);
        if (sp > 1.5 || !c.active) {
          c.active = true;
          const nx = dx / (d || 1), nz = dz / (d || 1);
          c.vel.set(nx * (sp * 0.7 + 3) + car.vx * 0.45, 4 + sp * 0.3, nz * (sp * 0.7 + 3) + car.vz * 0.45);
          c.spin.set((Math.random() - 0.5) * 9, (Math.random() - 0.5) * 9, (Math.random() - 0.5) * 9);
          car.vx *= 0.9; car.vz *= 0.9;
          if (sp > 8) knock();
        }
      }
    }
    if (!c.active && c.row > 0) {
      const a = crateAt(c.row - 1, c.i), b = crateAt(c.row - 1, c.i + 1);
      if ((a && a.active) || (b && b.active)) {
        c.active = true;
        c.vel.set((Math.random() - 0.5) * 2, 0, (Math.random() - 0.5) * 2);
        c.spin.set((Math.random() - 0.5) * 3, 0, (Math.random() - 0.5) * 3);
      }
    }
    if (!c.active) continue;
    c.vel.y -= 32 * dt;
    p.addScaledVector(c.vel, dt);
    c.mesh.rotation.x += c.spin.x * dt; c.mesh.rotation.y += c.spin.y * dt; c.mesh.rotation.z += c.spin.z * dt;
    if (p.y < 1) {
      p.y = 1;
      c.vel.y = Math.abs(c.vel.y) > 3 ? -c.vel.y * 0.3 : 0;
      c.vel.x *= 0.82; c.vel.z *= 0.82;
      c.spin.multiplyScalar(0.7);
      if (c.vel.y === 0 && Math.hypot(c.vel.x, c.vel.z) < 0.4) {
        c.vel.set(0, 0, 0);
        c.spin.set(0, 0, 0);
        // settle flat on the nearest face
        c.mesh.rotation.x = damp(c.mesh.rotation.x, Math.round(c.mesh.rotation.x / (Math.PI / 2)) * (Math.PI / 2), 6, dt);
        c.mesh.rotation.z = damp(c.mesh.rotation.z, Math.round(c.mesh.rotation.z / (Math.PI / 2)) * (Math.PI / 2), 6, dt);
      }
    }
    const r = Math.hypot(p.x, p.z);
    if (r > DRIVE_R + 4) { p.x *= (DRIVE_R + 4) / r; p.z *= (DRIVE_R + 4) / r; c.vel.x *= -0.4; c.vel.z *= -0.4; }
  }
  if (!cratesDone && crates.length && crates.every((c) => c.active)) {
    cratesDone = true;
    toast("💥", "#ff9f0a", "Demolition expert", "Every skill crate knocked loose. Nothing stays boxed in.");
    burst(car.x, car.z, 60);
  }
}

let tokensTaken = 0;
function updateTokens(t, dt) {
  for (const tk of tokens) {
    if (tk.taken) {
      if (tk.grp.visible) {
        tk.grp.scale.multiplyScalar(1 - dt * 6);
        tk.grp.position.y += dt * 8;
        if (tk.grp.scale.x < 0.05) tk.grp.visible = false;
      }
      continue;
    }
    tk.coin.rotation.z = t * 2 + tk.phase;
    tk.grp.position.y = 2.6 + Math.sin(t * 2.2 + tk.phase) * 0.35;
    tk.halo.scale.setScalar(1 + Math.sin(t * 3 + tk.phase) * 0.08);
    if (started && Math.hypot(car.x - tk.x, car.z - tk.z) < 3.6) {
      tk.taken = true;
      tokensTaken++;
      $("tokens-count").textContent = `${tokensTaken}/${tokens.length}`;
      bump("tokens-count");
      chime([660, 990]);
      burst(tk.x, tk.z, 30);
      toast(tk.value, tk.color, `Impact collected: ${tk.value}`, tk.label);
      if (tokensTaken === tokens.length) {
        setTimeout(() => toast("★", "#ffd60a", "All impact stats collected", "20%+ faster search, 60% less ETL effort, 92% coverage, 25% fewer defects."), 2600);
      }
    }
  }
}

const discovered = new Set();
let currentZone = null, panelZone = null, suppressed = null;
function updateZones(t) {
  let inside = null;
  for (const zs of zoneState) {
    const d = Math.hypot(car.x - zs.trigger[0], car.z - zs.trigger[1]);
    const limit = currentZone === zs.zone.id ? 10 : 7.2;
    if (d < limit) inside = zs;
    const pulse = 1 + Math.sin(t * 3 + zs.angle * 3) * 0.04;
    zs.ring.scale.set(pulse, 1, pulse);
    zs.disc.material.opacity = currentZone === zs.zone.id ? 0.32 : discovered.has(zs.zone.id) ? 0.07 : 0.16;
  }
  if (!started) return;
  const id = inside ? inside.zone.id : null;
  if (id === currentZone) return;
  currentZone = id;
  if (!inside) {
    suppressed = null;
    if (panelZone) closePanel(false);
    return;
  }
  discover(inside.zone);
  if (suppressed !== id) openPanel(inside.zone, true);
}

function discover(zone) {
  if (discovered.has(zone.id)) return;
  discovered.add(zone.id);
  $("zones-count").textContent = `${discovered.size}/${ZONES.length}`;
  bump("zones-count");
  chime([523, 784]);
  renderMapList();
  if (discovered.size === ZONES.length) {
    burst(car.x, car.z, 160);
    chime([523, 659, 784, 1047]);
    setTimeout(() => toast("🏁", "#30d158", "Grand tour complete!", "You've seen it all. Thanks for driving by. Let's talk!", 6000), 400);
  } else if (discovered.size === 1) {
    toast("📍", zone.color, `Discovered: ${zone.title}`, `${ZONES.length - 1} more landmarks to find. Check the minimap.`);
  }
}

/* =========================================================================
   Camera
   ========================================================================= */
const camPos = new THREE.Vector3(0, 90, 120);
const camLook = new THREE.Vector3();
const focus = new THREE.Vector3(0, 1, 14); // x/z = point to frame, y = zoom factor
let viewX = 0, viewY = 0;
function updateCamera(t, dt) {
  const w = window.innerWidth, h = window.innerHeight;
  if (!started) {
    const a = t * 0.06;
    camPos.set(Math.sin(a) * 130, 85, Math.cos(a) * 130);
    camera.position.copy(camPos);
    camera.lookAt(0, 0, 0);
  } else {
    const portrait = h > w;
    const sp = Math.hypot(car.vx, car.vz);
    // Inside a zone, frame both the car and its landmark.
    const zs = currentZone && zoneState.find((z) => z.zone.id === currentZone);
    let fx = car.x, fz = car.z, frame = 1;
    if (zs) {
      const [bx, bz] = polar(zs.angle, BUILD_R);
      fx = car.x + (bx - car.x) * 0.5; fz = car.z + (bz - car.z) * 0.5; frame = 1.22;
    }
    focus.x = damp(focus.x, fx, 2.5, dt); focus.z = damp(focus.z, fz, 2.5, dt);
    focus.y = damp(focus.y, frame, 2.5, dt);
    const zoom = (portrait ? 1.4 : 1) * focus.y * (1 + clamp(sp / 46, 0, 1) * 0.16);
    const target = new THREE.Vector3(focus.x, 0, focus.z).add(new THREE.Vector3(0, 31, 28).multiplyScalar(zoom));
    camPos.x = damp(camPos.x, target.x, 3.2, dt);
    camPos.y = damp(camPos.y, target.y, 2.4, dt);
    camPos.z = damp(camPos.z, target.z, 3.2, dt);
    camLook.x = damp(camLook.x, focus.x + car.vx * 0.18, 4, dt);
    camLook.z = damp(camLook.z, focus.z + car.vz * 0.18, 4, dt);
    camera.position.copy(camPos);
    if (shake > 0) {
      camera.position.x += (Math.random() - 0.5) * shake * 1.2;
      camera.position.y += (Math.random() - 0.5) * shake * 1.2;
      shake = Math.max(0, shake - dt * 2.5);
    }
    camera.lookAt(camLook.x, 0.5, camLook.z);
  }
  // Keep the car visible beside (desktop) or above (phone) the open panel.
  const open = $("panel").classList.contains("open");
  const peek = $("panel").classList.contains("peek");
  const wantX = open && !isSmall() ? Math.min(220, w * 0.2) : 0;
  const wantY = open && isSmall() ? (peek ? 70 : h * 0.26) : 0;
  viewX = damp(viewX, wantX, 5, dt);
  viewY = damp(viewY, wantY, 5, dt);
  if (Math.abs(viewX) > 0.5 || Math.abs(viewY) > 0.5) camera.setViewOffset(w, h, viewX, viewY, w, h);
  else camera.clearViewOffset();

  sun.position.set(car.x + 34, 64, car.z + 26);
  sun.target.position.set(car.x, 0, car.z);
}

/* =========================================================================
   Minimap
   ========================================================================= */
const mm = $("minimap"), mmx = mm.getContext("2d");
function drawMinimap() {
  const S = mm.width, c = S / 2, sc = (S / 2 - 8) / ISLAND_R;
  const night = body.classList.contains("night");
  mmx.clearRect(0, 0, S, S);
  mmx.save();
  mmx.beginPath(); mmx.arc(c, c, S / 2 - 2, 0, TAU); mmx.clip();
  mmx.fillStyle = night ? "rgba(40,60,46,0.9)" : "rgba(202,219,189,0.95)";
  mmx.beginPath(); mmx.arc(c, c, ISLAND_R * sc, 0, TAU); mmx.fill();
  mmx.strokeStyle = night ? "#3a3f47" : "#4a5059";
  mmx.lineWidth = 10 * sc; mmx.beginPath(); mmx.arc(c, c, RING_R * sc, 0, TAU); mmx.stroke();
  mmx.lineWidth = 8 * sc;
  zoneState.forEach((zs) => {
    const [x1, z1] = polar(zs.angle, PLAZA_R - 2), [x2, z2] = zs.trigger;
    mmx.beginPath(); mmx.moveTo(c + x1 * sc, c + z1 * sc); mmx.lineTo(c + x2 * sc, c + z2 * sc); mmx.stroke();
  });
  mmx.fillStyle = night ? "#2a2d33" : "#f4f4f2";
  mmx.beginPath(); mmx.arc(c, c, PLAZA_R * sc, 0, TAU); mmx.fill();
  zoneState.forEach((zs) => {
    const [x, z] = polar(zs.angle, BUILD_R - 4);
    const seen = discovered.has(zs.zone.id);
    mmx.fillStyle = zs.zone.color;
    mmx.globalAlpha = seen ? 0.55 : 1;
    mmx.beginPath(); mmx.arc(c + x * sc, c + z * sc, 13, 0, TAU); mmx.fill();
    mmx.globalAlpha = 1;
    if (seen) { mmx.fillStyle = "#fff"; mmx.font = `800 16px ${FONT}`; mmx.textAlign = "center"; mmx.textBaseline = "middle"; mmx.fillText("✓", c + x * sc, c + z * sc + 1); }
  });
  tokens.forEach((tk) => {
    if (tk.taken) return;
    mmx.fillStyle = "#ffd60a"; mmx.strokeStyle = "#1d1d1f"; mmx.lineWidth = 2;
    mmx.beginPath(); mmx.arc(c + tk.x * sc, c + tk.z * sc, 7, 0, TAU); mmx.fill(); mmx.stroke();
  });
  mmx.save();
  mmx.translate(c + car.x * sc, c + car.z * sc);
  mmx.rotate(-car.h + Math.PI);
  mmx.fillStyle = "#0a84ff"; mmx.strokeStyle = "#fff"; mmx.lineWidth = 3;
  mmx.beginPath(); mmx.moveTo(0, -16); mmx.lineTo(11, 12); mmx.lineTo(0, 6); mmx.lineTo(-11, 12); mmx.closePath();
  mmx.fill(); mmx.stroke();
  mmx.restore();
  mmx.restore();
}

/* =========================================================================
   UI: panel, map, toast, theme
   ========================================================================= */
const body = document.body;
const panel = $("panel"), panelBody = $("panel-body");

function openPanel(zone, auto) {
  panelBody.innerHTML = zone.html;
  panelBody.scrollTop = 0;
  panel.style.setProperty("--zone", zone.color);
  panel.classList.add("open");
  panel.classList.toggle("peek", auto && isSmall());
  panelZone = zone.id;
  history.replaceState(null, "", "#" + zone.id);
}
function closePanel(manual) {
  panel.classList.remove("open", "peek");
  if (manual) suppressed = panelZone;
  panelZone = null;
  history.replaceState(null, "", location.pathname + location.search);
}
$("panel-close").addEventListener("click", (e) => { e.stopPropagation(); closePanel(true); });
panel.addEventListener("click", (e) => {
  if (panel.classList.contains("peek")) { panel.classList.remove("peek"); e.preventDefault(); return; }
  const btn = e.target.closest("[data-copy]");
  if (btn) copy(btn.getAttribute("data-copy"));
});
function copy(text) {
  const ok = () => toast("✉️", "#0a84ff", "Email copied", text);
  if (navigator.clipboard) navigator.clipboard.writeText(text).then(ok, () => toast("✉️", "#0a84ff", "Email", text));
  else toast("✉️", "#0a84ff", "Email", text);
}

function renderMapList() {
  const list = $("map-list");
  list.innerHTML = "";
  ZONES.forEach((zone, i) => {
    const li = document.createElement("li");
    const b = document.createElement("button");
    b.type = "button";
    const seen = discovered.has(zone.id);
    b.innerHTML = `<span class="sw" style="background:${zone.color}">${seen ? "✓" : i + 1}</span><span><b></b><small></small></span>`;
    b.querySelector("b").textContent = zone.title;
    b.querySelector("small").textContent = zone.sub;
    b.addEventListener("click", () => travel(i));
    li.appendChild(b);
    list.appendChild(li);
  });
}
let lastFocus = null;
function openMap() {
  lastFocus = document.activeElement;
  renderMapList();
  $("map").hidden = false;
  keys.clear();
  const first = $("map-list").querySelector("button");
  if (first) first.focus();
}
function closeMap() {
  $("map").hidden = true;
  if (lastFocus && lastFocus.focus) lastFocus.focus();
}
$("btn-map").addEventListener("click", () => { $("btn-map").blur(); openMap(); });
$("map-close").addEventListener("click", closeMap);
$("map").addEventListener("click", (e) => { if (e.target === $("map")) closeMap(); });

function travel(i) {
  const zs = zoneState[i];
  const [x, z] = polar(zs.angle, TRIGGER_R - 1);
  Object.assign(car, { x, z, h: Math.PI - zs.angle, vx: 0, vz: 0, fs: 0 });
  const zf = window.innerHeight > window.innerWidth ? 1.4 : 1;
  camPos.set(x, 31 * zf, z + 28 * zf);
  const [bx, bz] = polar(zs.angle, BUILD_R);
  focus.set((x + bx) / 2, 1.22, (z + bz) / 2);
  camPos.set(focus.x, 31 * zf * 1.22, focus.z + 28 * zf * 1.22);
  camLook.set(focus.x, 0, focus.z);
  closeMap();
  canvas.focus();
  currentZone = zs.zone.id;
  suppressed = null;
  discover(zs.zone);
  openPanel(zs.zone, false);
}

let toastTimer;
function toast(icon, color, title, sub, ms = 3600) {
  const el = $("toast");
  el.innerHTML = `<span class="ti" style="background:${color}"></span><div><b class="tt"></b><span class="ts"></span></div>`;
  el.querySelector(".ti").textContent = icon;
  el.querySelector(".tt").textContent = title;
  el.querySelector(".ts").textContent = sub;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), ms);
}
function bump(id) {
  const pill = $(id).parentElement;
  pill.classList.remove("bump");
  void pill.offsetWidth;
  pill.classList.add("bump");
}

function applyTheme(night) {
  const P = night ? NIGHT : DAY;
  body.classList.toggle("night", night);
  scene.background = new THREE.Color(P.sky);
  scene.fog.color.set(P.sky); scene.fog.near = P.fogNear; scene.fog.far = P.fogFar;
  hemi.color.set(P.hemiSky); hemi.groundColor.set(P.hemiGround); hemi.intensity = P.hemiI;
  sun.color.set(P.sunC); sun.intensity = P.sunI;
  themed.grass.color.set(P.grass); themed.plaza.color.set(P.plaza); themed.road.color.set(P.road);
  themed.dash.color.set(P.dash); themed.side.color.set(P.side); themed.water.color.set(P.water);
  themed.nameMat.color.set(P.text); themed.hintMat.color.set(P.text);
  themed.labelMats.forEach((m) => m.color.set(P.label));
  themed.leaf.color.setScalar(P.leaf);
  glows.forEach(([m, d, n]) => (m.emissiveIntensity = night ? n : d));
  car.lights.forEach((l) => (l.intensity = P.headlights ? 5 : 0));
  zoneState.forEach((zs) => { zs.sign.material.map = zs.textures[night ? 1 : 0]; zs.sign.material.needsUpdate = true; });
  document.querySelector('meta[name="theme-color"]').setAttribute("content", night ? "#0b0d12" : "#dfe6ee");
}
function toggleTime() {
  const night = !body.classList.contains("night");
  applyTheme(night);
  try { localStorage.setItem("drive-time", night ? "night" : "day"); } catch (e) { /* storage unavailable */ }
}
$("btn-time").addEventListener("click", () => { $("btn-time").blur(); toggleTime(); });

/* =========================================================================
   Audio (off by default)
   ========================================================================= */
const audio = { ctx: null, on: false };
function initAudio() {
  if (audio.ctx) return;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return;
  const ctx = new Ctx();
  const osc = ctx.createOscillator(), osc2 = ctx.createOscillator();
  osc.type = "sawtooth"; osc2.type = "square";
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass"; filter.frequency.value = 380;
  const gain = ctx.createGain();
  gain.gain.value = 0;
  osc.connect(filter); osc2.connect(filter); filter.connect(gain).connect(ctx.destination);
  osc.start(); osc2.start();
  Object.assign(audio, { ctx, osc, osc2, filter, gain });
}
function updateAudio(throttle, boost) {
  if (!audio.ctx) return;
  const now = audio.ctx.currentTime;
  const sp = Math.abs(car.fs);
  const f = 38 + sp * 2.6 + (throttle > 0 ? 8 : 0) + (boost ? 10 : 0);
  audio.osc.frequency.setTargetAtTime(f, now, 0.06);
  audio.osc2.frequency.setTargetAtTime(f * 0.5, now, 0.06);
  audio.filter.frequency.setTargetAtTime(300 + sp * 22, now, 0.1);
  audio.gain.gain.setTargetAtTime(audio.on ? 0.022 + Math.abs(throttle) * 0.012 : 0, now, 0.1);
}
function chime(freqs) {
  if (!audio.ctx || !audio.on) return;
  const now = audio.ctx.currentTime;
  freqs.forEach((f, i) => {
    const o = audio.ctx.createOscillator(), g = audio.ctx.createGain();
    o.type = "sine"; o.frequency.value = f;
    g.gain.setValueAtTime(0, now + i * 0.09);
    g.gain.linearRampToValueAtTime(0.12, now + i * 0.09 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.09 + 0.5);
    o.connect(g).connect(audio.ctx.destination);
    o.start(now + i * 0.09); o.stop(now + i * 0.09 + 0.55);
  });
}
function thump(strength) {
  if (!audio.ctx || !audio.on) return;
  const now = audio.ctx.currentTime;
  const o = audio.ctx.createOscillator(), g = audio.ctx.createGain();
  o.type = "triangle"; o.frequency.setValueAtTime(120, now); o.frequency.exponentialRampToValueAtTime(40, now + 0.2);
  g.gain.setValueAtTime(Math.min(0.25, strength / 80), now); g.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
  o.connect(g).connect(audio.ctx.destination); o.start(now); o.stop(now + 0.3);
}
const knock = () => thump(14);
$("btn-sound").addEventListener("click", () => {
  initAudio();
  audio.on = !audio.on;
  if (audio.ctx && audio.ctx.state === "suspended") audio.ctx.resume();
  $("btn-sound").classList.toggle("sound-on", audio.on);
  $("btn-sound").setAttribute("aria-pressed", String(audio.on));
  $("btn-sound").setAttribute("aria-label", audio.on ? "Turn engine sound off" : "Turn engine sound on");
  $("btn-sound").blur();
});

/* =========================================================================
   Boot
   ========================================================================= */
let started = false;
function start() {
  if (started) return;
  started = true;
  $("intro").classList.add("gone");
  $("hud").hidden = false;
  mm.hidden = false;
  $("hint").hidden = isTouch;
  $("touch").hidden = !isTouch;
  camPos.copy(camera.position);
  camLook.set(0, 0, 0);
  focus.set(car.x, 1, car.z);
  canvas.setAttribute("tabindex", "-1");
  canvas.focus();
  setTimeout(() => toast("🚗", "#0a84ff", "Welcome aboard", isTouch ? "Steer with the joystick. Drive into a glowing ring to open a section." : "Drive into a glowing ring to open a section. Press M for the map."), 700);
}
$("start").addEventListener("click", start);

function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener("resize", resize);

const clock = new THREE.Clock();
let elapsed = 0;
function frame() {
  requestAnimationFrame(frame);
  const dt = Math.min(clock.getDelta(), 0.05);
  elapsed += dt;
  if (started) updateCar(dt);
  else { car.group.position.set(car.x, 0, car.z); car.group.rotation.y = car.h; }
  updateCrates(dt);
  updateTokens(elapsed, dt);
  updateZones(elapsed);
  animated.forEach((a) => a.update(elapsed, dt));

  for (const p of smoke) {
    if (p.life <= 0) continue;
    p.life -= dt * 1.2;
    p.m.position.addScaledVector(p.vel, dt);
    p.m.scale.multiplyScalar(1 + dt * 1.6);
    p.m.material.opacity = Math.max(0, p.life) * (body.classList.contains("night") ? 0.18 : 0.45);
    if (p.life <= 0) p.m.visible = false;
  }
  for (const c of confetti) {
    if (c.life <= 0) continue;
    c.life -= dt;
    c.vel.y -= 22 * dt;
    c.vel.multiplyScalar(1 - dt * 0.8);
    c.m.position.addScaledVector(c.vel, dt);
    c.m.rotation.x += c.spin.x * dt; c.m.rotation.y += c.spin.y * dt; c.m.rotation.z += c.spin.z * dt;
    if (c.m.position.y < 0.1) { c.m.position.y = 0.1; c.vel.set(0, 0, 0); c.spin.set(0, 0, 0); }
    if (c.life <= 0) c.m.visible = false;
  }

  updateCamera(elapsed, dt);
  if (started) drawMinimap();
  renderer.render(scene, camera);
}

async function boot() {
  // Make sure Inter is ready before painting text onto canvases.
  if (document.fonts) {
    await Promise.race([
      Promise.all(["800 64px Inter", "700 40px Inter", "600 30px Inter", "500 20px Inter"].map((f) => document.fonts.load(f))),
      new Promise((r) => setTimeout(r, 1800)),
    ]).catch(() => {});
  }
  buildGround();
  buildGroundText();
  buildZones();
  buildNature();
  buildTokens();
  buildCrates();
  buildCar();
  buildFx();
  setupTouch();
  renderMapList();
  $("zones-count").textContent = `0/${ZONES.length}`;
  $("tokens-count").textContent = `0/${TOKENS.length}`;

  let night = window.matchMedia("(prefers-color-scheme: dark)").matches;
  try { const s = localStorage.getItem("drive-time"); if (s) night = s === "night"; } catch (e) { /* storage unavailable */ }
  applyTheme(night);

  window.__driveReady = true;
  frame();
  const btn = $("start");
  btn.disabled = false;
  btn.classList.add("ready");
  btn.querySelector(".label").textContent = "Start driving";

  // Deep links: /drive/#itgc starts the game parked at that landmark.
  const deep = ZONES.findIndex((z) => "#" + z.id === location.hash);
  if (deep >= 0) { start(); travel(deep); }
}
boot().catch((e) => { console.error(e); fail(); });
