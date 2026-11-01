// House3D.jsx: interactive 3D house for the home page.
// The price class (0 to 3) colours the roof light strip, the path lights and one column of the gauge.
// Needs: npm i three
// Optional CSS variables (read from the parent element): --hh-stage (also the haze colour), --hh-ghost,
// and --hh-dusk: 1 for an evening look. Use hex or rgb() values.
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Sky } from 'three/examples/jsm/objects/Sky.js';

// One colour per class id: 0 cheaper, 1 reasonable, 2 over priced, 3 too over priced
const COLORS = ['#1f9d8a', '#3d63ff', '#f0a020', '#e5484d'];

/* ---- procedural PBR detail: small canvases become colour + bump maps, so no image files are needed */
const rnd = Math.random;
function makeTex(w, h, paint, rx = 1, ry = 1, srgb = true) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  paint(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx, ry);
  t.anisotropy = 8;
  if (srgb && THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const speck = (g, w, h, n, a, b, s) => {
  for (let i = 0; i < n; i++) {
    g.fillStyle = rnd() > 0.5 ? a : b;
    g.fillRect(rnd() * w, rnd() * h, 1 + rnd() * s, 1 + rnd() * s);
  }
};
const concretePaint = (base) => (g, w, h) => {
  g.fillStyle = base; g.fillRect(0, 0, w, h);
  speck(g, w, h, 9000, 'rgba(255,255,255,.07)', 'rgba(0,0,0,.07)', 3);
  g.fillStyle = 'rgba(0,0,0,.16)';
  for (let y = 0; y < h; y += h / 4) g.fillRect(0, y, w, 2); // formwork joints
  for (let x = w / 8; x < w; x += w / 4) for (let y = h / 8; y < h; y += h / 4) { g.beginPath(); g.arc(x, y, 3, 0, 6.3); g.fill(); } // tie holes
};
const seamPaint = (g, w, h) => {
  g.fillStyle = '#2a3139'; g.fillRect(0, 0, w, h);
  for (let x = 0; x < w; x += w / 8) { g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(x, 0, 3, h); g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(x + 3, 0, 2, h); }
  speck(g, w, h, 3000, 'rgba(255,255,255,.04)', 'rgba(0,0,0,.05)', 2);
};
const timberPaint = (g, w, h) => {
  g.fillStyle = '#a67c52'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(${rnd() > 0.5 ? '255,235,205' : '60,35,15'},${0.05 + rnd() * 0.14})`; g.fillRect(rnd() * w, 0, 1 + rnd() * 2, h); }
};
const deckPaint = (g, w, h) => {
  const n = 8, ph = h / n;
  for (let i = 0; i < n; i++) {
    g.fillStyle = `hsl(32, ${28 + rnd() * 8}%, ${48 + rnd() * 10}%)`; g.fillRect(0, i * ph, w, ph);
    for (let k = 0; k < 40; k++) { g.fillStyle = `rgba(60,35,15,${rnd() * 0.12})`; g.fillRect(0, i * ph + rnd() * ph, w, 1); }
    g.fillStyle = 'rgba(20,10,0,.55)'; g.fillRect(0, i * ph, w, 2);
  }
};
const lawnPaint = (g, w, h) => {
  g.fillStyle = '#6f8f63'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 14000; i++) { g.fillStyle = `hsla(${85 + rnd() * 40}, ${24 + rnd() * 22}%, ${26 + rnd() * 30}%, .55)`; g.fillRect(rnd() * w, rnd() * h, 1, 2 + rnd() * 4); }
};
const leafPaint = (g, w, h) => {
  g.fillStyle = '#5f7f54'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 2500; i++) { g.fillStyle = `hsla(${85 + rnd() * 50}, ${30 + rnd() * 25}%, ${22 + rnd() * 32}%, .8)`; g.beginPath(); g.ellipse(rnd() * w, rnd() * h, 2 + rnd() * 4, 1 + rnd() * 2.5, rnd() * 3.14, 0, 6.3); g.fill(); }
};
const ripplePaint = (g, w, h) => {
  g.fillStyle = '#808080'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 90; i++) {
    const x = rnd() * w, y = rnd() * h, r = 8 + rnd() * 26, gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, 'rgba(255,255,255,.5)'); gr.addColorStop(1, 'rgba(128,128,128,0)');
    g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r);
  }
};
// World-scale UVs: a texture keeps the same physical size (s metres per tile) on every face of a box.
const tile = (g, s = 2.5) => {
  const { width: w, height: h, depth: d } = g.parameters;
  const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  const uv = g.attributes.uv;
  for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) { const i = f * 4 + k; uv.setXY(i, (uv.getX(i) * dims[f][0]) / s, (uv.getY(i) * dims[f][1]) / s); }
  return g;
};

/* ---------------------------------------------------------------- 3D model */
export default function House3D({ classIndex = 1, label = '' }) {
  const host = useRef(null);
  const api = useRef(null);

  useEffect(() => {
    const el = host.current;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
    } catch (e) {
      el.textContent = '3D view is not available on this device.';
      return undefined;
    }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.domElement.style.cssText = 'display:block;width:100%;height:100%';
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1.5, 0.1, 200);
    camera.position.set(22, 12.5, 25);

    // Procedural daylight sky: lights the scene and gives the glass real sky reflections (no HDR file)
    const pmrem = new THREE.PMREMGenerator(renderer);
    const sky = new Sky();
    sky.scale.setScalar(10000);
    const su = sky.material.uniforms;
    su.turbidity.value = 4;
    su.rayleigh.value = 1.6;
    su.mieCoefficient.value = 0.004;
    su.mieDirectionalG.value = 0.8;
    const sunDir = new THREE.Vector3().setFromSphericalCoords(1, THREE.MathUtils.degToRad(62), THREE.MathUtils.degToRad(48));
    su.sunPosition.value.copy(sunDir);
    const skyScene = new THREE.Scene();
    skyScene.add(sky);
    const envTex = pmrem.fromScene(skyScene).texture;
    scene.environment = envTex;

    const hemi = new THREE.HemisphereLight('#ffffff', '#8a97a3', 0.5);
    const sun = new THREE.DirectionalLight('#fff4e5', 2.4);
    sun.position.copy(sunDir).multiplyScalar(34);
    sun.castShadow = true;
    sun.shadow.mapSize.setScalar(/Mobi|Android/i.test(navigator.userAgent) ? 2048 : 4096);
    Object.assign(sun.shadow.camera, { left: -24, right: 24, top: 24, bottom: -24, near: 1, far: 90 });
    sun.shadow.camera.updateProjectionMatrix();
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.03;
    scene.add(hemi, sun);

    /* ---- materials */
    const tex = {
      concrete: makeTex(512, 512, concretePaint('#b4b9bd')),
      light: makeTex(512, 512, concretePaint('#e3e6e8')),
      seam: makeTex(256, 256, seamPaint),
      timber: makeTex(256, 256, timberPaint),
      deck: makeTex(256, 256, deckPaint),
      lawn: makeTex(512, 512, lawnPaint),
      leaf: makeTex(256, 256, leafPaint, 3, 2),
      ripple: makeTex(256, 256, ripplePaint, 3, 1, false),
    };
    const std = (color, roughness = 0.8, metalness = 0, extra = {}) =>
      new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
    const M = {
      concrete: std('#ffffff', 0.93, 0, { map: tex.concrete, bumpMap: tex.concrete, bumpScale: 1.5 }),
      light: std('#ffffff', 0.85, 0, { map: tex.light, bumpMap: tex.light, bumpScale: 0.8 }),
      dark: std('#ffffff', 0.45, 0.65, { map: tex.seam, bumpMap: tex.seam, bumpScale: 1.2 }),
      timber: std('#ffffff', 0.62, 0, { map: tex.timber, bumpMap: tex.timber, bumpScale: 0.8 }),
      timber2: std('#f0d2a6', 0.6, 0, { map: tex.timber, bumpMap: tex.timber, bumpScale: 0.6 }),
      glass: new THREE.MeshPhysicalMaterial({
        color: '#e4f0f4', roughness: 0.03, metalness: 0, transmission: 0.95, thickness: 0.06,
        ior: 1.45, envMapIntensity: 1.8,
      }),
      glow: std('#fff0d4', 0.6, 0, { emissive: '#ffd49a', emissiveIntensity: 0.6 }),
      panel: std('#1c2a48', 0.25, 0.7),
      water: new THREE.MeshPhysicalMaterial({
        color: '#2d8fb3', roughness: 0.04, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.03,
        bumpMap: tex.ripple, bumpScale: 0.5, emissive: '#0b4a66', emissiveIntensity: 0.3, envMapIntensity: 1.6,
      }),
      deck: std('#ffffff', 0.78, 0, { map: tex.deck, bumpMap: tex.deck, bumpScale: 1 }),
      lawn: std('#ffffff', 1, 0, { map: tex.lawn, bumpMap: tex.lawn, bumpScale: 1.5 }),
      leaf: std('#9fc19c', 0.85, 0, { map: tex.leaf, bumpMap: tex.leaf, bumpScale: 2 }),
      leaf2: std('#7fa882', 0.85, 0, { map: tex.leaf, bumpMap: tex.leaf, bumpScale: 2 }),
      leaf3: std('#b4cf9a', 0.85, 0, { map: tex.leaf, bumpMap: tex.leaf, bumpScale: 2 }),
      fabric: std('#8e9aa3', 1),
      rug: std('#d8d2c6', 1),
      metal: std('#c9ced3', 0.25, 1),
      trunk: std('#5a4a3c', 1),
      // Lit with the colour of the current price class
      led: new THREE.MeshStandardMaterial({ color: '#000000', emissive: '#3d63ff', emissiveIntensity: 2.2, toneMapped: false }),
    };

    M.timber.userData.s = 1.2;
    M.timber2.userData.s = 1.2;
    M.deck.userData.s = 1.6;
    M.dark.userData.s = 2;

    /* ---- helpers */
    const world = new THREE.Group();
    scene.add(world);
    const put = (mesh, shadow = true) => {
      mesh.castShadow = shadow;
      mesh.receiveShadow = true;
      world.add(mesh);
      return mesh;
    };
    const box = (w, h, d, m, x, y, z, shadow = m !== M.glass) => {
      const o = new THREE.Mesh(tile(new THREE.BoxGeometry(w, h, d), m.userData.s || 2.5), m);
      o.position.set(x, y, z);
      return put(o, shadow);
    };

    /* ---- site: lawn that fades into the page background through the haze */
    tex.lawn.repeat.set(70, 70);
    const lawn = new THREE.Mesh(new THREE.CircleGeometry(90, 96), M.lawn);
    lawn.rotation.x = -Math.PI / 2;
    put(lawn, false);

    /* ---- ground floor, garage, living-room glazing, front door */
    // two piers, a back mass and a lintel leave a real recessed living room behind the glazing
    box(1.8, 3.2, 6.2, M.concrete, -4.1, 1.6, 0);
    box(1.8, 3.2, 6.2, M.concrete, 3.1, 1.6, 0);
    box(5.4, 3.2, 3.2, M.concrete, -0.5, 1.6, -1.5);
    box(5.4, 0.3, 3, M.concrete, -0.5, 3.05, 1.6);
    box(5.4, 0.2, 3, M.deck, -0.5, 0.1, 1.6);
    box(4.2, 2.8, 5.4, M.concrete, -7.1, 1.4, -0.1);
    box(4.7, 0.2, 5.9, M.light, -7.1, 2.9, -0.1);
    box(3.2, 2.3, 0.06, M.timber2, -7.1, 1.15, 2.63);
    [0.6, 1.1, 1.6, 2.1].forEach((y) => box(3.2, 0.03, 0.02, M.dark, -7.1, y, 2.675));
    box(5.4, 2.7, 0.04, M.glass, -0.5, 1.55, 3.1);
    box(2.1, 0.42, 0.95, M.fabric, -1.1, 0.41, 1.2); // sofa
    box(2.1, 0.55, 0.2, M.fabric, -1.1, 0.75, 0.75);
    box(0.9, 0.32, 0.6, M.timber2, -1.1, 0.36, 2.2); // coffee table
    box(3, 0.02, 1.9, M.rug, -0.9, 0.21, 1.6);
    box(3.2, 1.9, 0.28, M.timber, -0.5, 1.15, 0.3); // wall unit
    box(3, 0.05, 0.05, M.glow, -0.5, 2.15, 0.46, false);
    box(0.03, 1.5, 0.03, M.dark, 1.5, 0.95, 0.9); // floor lamp
    const shade = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 12), M.glow);
    shade.position.set(1.5, 1.8, 0.9);
    world.add(shade);
    const lamp = new THREE.PointLight('#ffcf94', 7, 8, 2);
    lamp.position.set(-0.3, 2.3, 1.7);
    world.add(lamp);
    const ledLight = new THREE.PointLight('#3d63ff', 3, 10, 2); // spill of the class colour on the terrace
    ledLight.position.set(1, 5.7, 5.2);
    world.add(ledLight);
    for (let i = 0; i < 5; i++) box(0.06, 2.8, 0.1, M.dark, -3.2 + i * 1.35, 1.5, 3.2);
    box(1.0, 2.3, 0.08, M.timber, 3.3, 1.15, 3.14);
    box(0.04, 0.5, 0.05, M.metal, 3.7, 1.1, 3.2); // door handle
    box(1.8, 0.1, 1.3, M.dark, 3.3, 2.65, 3.75);

    /* ---- cantilevered upper volume with ribbon window and timber brise-soleil */
    box(10.2, 3, 5.2, M.dark, 1, 4.7, 1.6);
    box(7.4, 1.5, 0.04, M.glow, 1, 4.85, 4.22);
    box(7.4, 1.5, 0.04, M.glass, 1, 4.85, 4.27);
    box(0.04, 1.5, 3.2, M.glow, 6.12, 4.85, 1.6);
    box(0.04, 1.5, 3.2, M.glass, 6.17, 4.85, 1.6);
    const slats = new THREE.InstancedMesh(tile(new THREE.BoxGeometry(0.07, 2.9, 0.12), 1.2), M.timber, 46);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < 46; i++) {
      dummy.position.set(-3.95 + i * 0.22, 4.7, 4.34);
      dummy.updateMatrix();
      slats.setMatrixAt(i, dummy.matrix);
    }
    put(slats);
    box(0.18, 3.2, 0.18, M.dark, 5.9, 1.6, 4.0); // slim steel column under the overhang

    /* ---- roof slab, solar panels, class-coloured light strips */
    box(10.9, 0.25, 5.9, M.light, 1, 6.325, 1.6);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 2; j++) {
        const p = box(1.9, 0.06, 1.2, M.panel, -1.2 + i * 2.2, 6.62, 0.7 + j * 1.7);
        p.rotation.x = -0.22;
      }
    }
    box(10.7, 0.05, 0.05, M.led, 1, 6.17, 4.55, false);
    box(0.05, 0.05, 5.7, M.led, 6.45, 6.17, 1.6, false);

    /* ---- service tower */
    box(1.7, 7.6, 1.9, M.dark, 5.4, 3.8, -2.0);
    box(1.9, 0.12, 2.1, M.light, 5.4, 7.66, -2.0);
    box(0.04, 5.2, 0.35, M.glow, 6.27, 3.9, -2.0);

    /* ---- pool, deck, loungers */
    box(8.6, 0.12, 4.2, M.deck, -1.5, 0.06, 6.9);
    box(6, 0.06, 2, M.water, -1.5, 0.15, 6.9, false);
    [-3.1, 3.1].forEach((dx) => box(0.2, 0.2, 2.4, M.light, -1.5 + dx, 0.1, 6.9));
    [-1.1, 1.1].forEach((dz) => box(6.4, 0.2, 0.2, M.light, -1.5, 0.1, 6.9 + dz));
    [5.8, 8.0].forEach((z) => box(0.7, 0.18, 1.7, M.light, -5.3, 0.21, z));

    /* ---- stepping-stone path with uplights */
    const upGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.14, 10);
    for (let k = 0; k < 6; k++) {
      const z = 4.4 + k * 1.5;
      box(1.3, 0.08, 0.7, M.light, 3.6, 0.04, z);
      [2.7, 4.5].forEach((x) => {
        const u = new THREE.Mesh(upGeo, M.led);
        u.position.set(x, 0.1, z);
        world.add(u);
      });
    }

    /* ---- landscaping */
    [[-11.5, -5, 1.1], [-8, -10, 1.3], [-1, -11, 1], [6, -9.5, 1.25], [11.5, -3.5, 1.1], [12, 3, 0.9], [-12.2, 2.5, 1]]
      .forEach(([x, z, s], i) => {
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.1 * s, 0.15 * s, 1.5 * s, 8), M.trunk);
        trunk.position.set(x, 0.75 * s, z);
        put(trunk);
        for (let k = 0; k < 7; k++) {
          const a = k * 2.4;
          const r = (0.35 + (k % 3) * 0.12) * s * 1.7 * (k ? 1 : 0);
          const blob = new THREE.Mesh(new THREE.IcosahedronGeometry((0.55 + (k % 4) * 0.1) * s, 2), [M.leaf, M.leaf2, M.leaf3][(i + k) % 3]);
          blob.position.set(x + Math.cos(a) * r, (2 + (k % 3) * 0.45) * s, z + Math.sin(a) * r);
          put(blob);
        }
      });
    [[-4.6, 3.95, 0.6], [-3.4, 4, 0.45], [-2.2, 3.95, 0.55], [1.2, 4, 0.5]].forEach(([x, z, r]) => {
      const bush = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), M.leaf);
      bush.position.set(x, r * 0.75, z);
      bush.scale.y = 0.75;
      put(bush);
    });

    /* ---- price gauge: four columns of rising height, the active one lights up */
    box(4.4, 0.12, 1.3, M.dark, -8.7, 0.06, 9);
    const cols = [1.4, 2.6, 3.8, 5].map((h, i) => {
      const m = new THREE.MeshStandardMaterial({ roughness: 0.35, metalness: 0.1, transparent: true, opacity: 0.3 });
      const o = new THREE.Mesh(new THREE.BoxGeometry(0.85, h, 0.85), m);
      o.position.set(-10.2 + i, h / 2 + 0.12, 9);
      put(o);
      return { o, m, h };
    });

    /* ---- controls: no wheel zoom (so the page keeps scrolling), vertical swipes scroll the page */
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 2.8, 0);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.minPolarAngle = 0.5;
    controls.maxPolarAngle = Math.PI * 0.48;
    controls.autoRotate = !reduce;
    controls.autoRotateSpeed = 0.7;
    renderer.domElement.style.touchAction = 'pan-y';
    let resumeTimer;
    controls.addEventListener('start', () => {
      controls.autoRotate = false;
      clearTimeout(resumeTimer);
    });
    controls.addEventListener('end', () => {
      resumeTimer = setTimeout(() => { controls.autoRotate = !reduce; }, 3500);
    });
    controls.update();

    /* ---- class state and scene colours */
    let idx = COLORS[classIndex] ? classIndex : 1;
    const tgt = new THREE.Color(COLORS[idx]);
    const cur = tgt.clone();
    const ghost = new THREE.Color();
    const black = new THREE.Color(0x000000);

    const applyTheme = () => {
      const s = getComputedStyle(el);
      const v = (n, f) => s.getPropertyValue(n).trim() || f;
      const dusk = v('--hh-dusk', '0') === '1';
      const stage = v('--hh-stage', '#e3e8ea');
      scene.background = new THREE.Color(stage);
      scene.fog = new THREE.Fog(stage, 38, 95);
      M.lawn.color.set(dusk ? '#7c8b86' : '#ffffff');
      ghost.set(v('--hh-ghost', '#9aa6b0'));
      renderer.toneMappingExposure = dusk ? 0.7 : 0.95;
      sun.intensity = dusk ? 0.9 : 3.2;
      sun.color.set(dusk ? '#9fb4ff' : '#fff1de');
      hemi.intensity = dusk ? 0.15 : 0.25;
      M.glow.emissiveIntensity = dusk ? 1.7 : 0.55;
      lamp.intensity = dusk ? 22 : 7;
      ledLight.intensity = dusk ? 14 : 3;
      if ('environmentIntensity' in scene) scene.environmentIntensity = dusk ? 0.3 : 1;
    };
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    if (mq.addEventListener) mq.addEventListener('change', applyTheme);
    applyTheme();
    cols.forEach((c) => c.m.color.copy(ghost));

    api.current = {
      applyTheme,
      setClass: (i) => {
        if (!COLORS[i]) return;
        idx = i;
        tgt.set(COLORS[i]);
      },
    };

    /* ---- size, visibility, render loop */
    const resize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.zoom = Math.min(1, camera.aspect / 1.45); // keep the whole model in view on narrow screens
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();
    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(el);

    renderer.setAnimationLoop(() => {
      if (!visible) return;
      controls.update();
      if (!reduce) { tex.ripple.offset.x += 0.0005; tex.ripple.offset.y += 0.0003; } // pool ripples
      cur.lerp(tgt, 0.08);
      M.led.emissive.copy(cur);
      ledLight.color.copy(cur);
      cols.forEach((c, i) => {
        const on = i === idx;
        c.m.opacity += ((on ? 1 : 0.3) - c.m.opacity) * 0.12;
        c.m.color.lerp(on ? cur : ghost, 0.15);
        c.m.emissive.lerp(on ? cur : black, 0.15);
        c.m.emissiveIntensity = 0.7;
        c.o.scale.y += ((on ? 1.07 : 1) - c.o.scale.y) * 0.15;
        c.o.position.y = (c.h * c.o.scale.y) / 2 + 0.12;
      });
      renderer.render(scene, camera);
    });

    return () => {
      api.current = null;
      clearTimeout(resumeTimer);
      ro.disconnect();
      io.disconnect();
      if (mq.removeEventListener) mq.removeEventListener('change', applyTheme);
      renderer.setAnimationLoop(null);
      controls.dispose();
      scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
      Object.values(M).forEach((m) => m.dispose());
      Object.values(tex).forEach((t) => t.dispose());
      sky.geometry.dispose();
      sky.material.dispose();
      cols.forEach((c) => c.m.dispose());
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
    // The scene is built once; class changes are pushed through `api` below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { if (api.current) api.current.setClass(classIndex); }, [classIndex]);

  return (
    <div
      ref={host}
      role="img"
      aria-label={`Interactive 3D model of a modern house. ${label}`}
      style={{ position: 'absolute', inset: 0 }}
    />
  );
}
