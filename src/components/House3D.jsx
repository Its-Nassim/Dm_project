// House3D.jsx: interactive 3D house for the home page.
// The price class (0 to 3) colours the roof light strip, the path lights and one column of the gauge.
// Needs: npm i three
// Optional CSS variables (read from the parent element): --hh-stage, --hh-plinth, --hh-lawn, --hh-ghost,
// and --hh-dusk: 1 for an evening look. Use hex or rgb() values.
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

// One colour per class id: 0 cheaper, 1 reasonable, 2 over priced, 3 too over priced
const COLORS = ['#1f9d8a', '#3d63ff', '#f0a020', '#e5484d'];

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

    // Soft reflections without any external HDR file
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;

    const hemi = new THREE.HemisphereLight('#ffffff', '#8a97a3', 0.5);
    const sun = new THREE.DirectionalLight('#fff4e5', 2.4);
    sun.position.set(14, 24, 16);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -18, right: 18, top: 18, bottom: -18, near: 1, far: 70 });
    sun.shadow.camera.updateProjectionMatrix();
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.03;
    scene.add(hemi, sun);

    /* ---- materials */
    const std = (color, roughness = 0.8, metalness = 0, extra = {}) =>
      new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
    const M = {
      concrete: std('#c4c9cd', 0.95),
      light: std('#e9ecee', 0.85),
      dark: std('#262d35', 0.55, 0.4),
      timber: std('#a9825c', 0.7),
      timber2: std('#c39a6b', 0.65),
      glass: new THREE.MeshPhysicalMaterial({
        color: '#b7d3df', roughness: 0.04, metalness: 0, transparent: true,
        opacity: 0.3, envMapIntensity: 1.4, depthWrite: false,
      }),
      glow: std('#fff0d4', 0.6, 0, { emissive: '#ffd49a', emissiveIntensity: 0.6 }),
      panel: std('#1c2a48', 0.25, 0.7),
      water: std('#3aa3c9', 0.08, 0.1, { emissive: '#0b4a66', emissiveIntensity: 0.35 }),
      deck: std('#b79b7a', 0.8),
      lawn: std('#a9b8ab', 1),
      plinth: std('#d9dee1', 0.9),
      leaf: std('#6f9179', 0.9, 0, { flatShading: true }),
      leaf2: std('#86a58b', 0.9, 0, { flatShading: true }),
      trunk: std('#5a4a3c', 1),
      // Lit with the colour of the current price class
      led: new THREE.MeshStandardMaterial({ color: '#000000', emissive: '#3d63ff', emissiveIntensity: 2.2, toneMapped: false }),
    };

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
      const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
      o.position.set(x, y, z);
      return put(o, shadow);
    };

    /* ---- site: round architectural-model base */
    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(15, 15, 0.5, 96), M.plinth);
    plinth.position.y = -0.25;
    put(plinth, false);
    const lawn = new THREE.Mesh(new THREE.CylinderGeometry(14.2, 14.2, 0.04, 96), M.lawn);
    lawn.position.y = 0.02;
    put(lawn, false);

    /* ---- ground floor, garage, living-room glazing, front door */
    box(9, 3.2, 6.2, M.concrete, -0.5, 1.6, 0);
    box(4.2, 2.8, 5.4, M.concrete, -7.1, 1.4, -0.1);
    box(4.7, 0.2, 5.9, M.light, -7.1, 2.9, -0.1);
    box(3.2, 2.3, 0.06, M.timber2, -7.1, 1.15, 2.63);
    [0.6, 1.1, 1.6, 2.1].forEach((y) => box(3.2, 0.03, 0.02, M.dark, -7.1, y, 2.675));
    box(5.4, 2.6, 0.04, M.glow, -0.5, 1.5, 3.12);
    box(5.4, 2.7, 0.04, M.glass, -0.5, 1.55, 3.18);
    for (let i = 0; i < 5; i++) box(0.06, 2.8, 0.1, M.dark, -3.2 + i * 1.35, 1.5, 3.2);
    box(1.0, 2.3, 0.08, M.timber, 3.3, 1.15, 3.14);
    box(1.8, 0.1, 1.3, M.dark, 3.3, 2.65, 3.75);

    /* ---- cantilevered upper volume with ribbon window and timber brise-soleil */
    box(10.2, 3, 5.2, M.dark, 1, 4.7, 1.6);
    box(7.4, 1.5, 0.04, M.glow, 1, 4.85, 4.22);
    box(7.4, 1.5, 0.04, M.glass, 1, 4.85, 4.27);
    box(0.04, 1.5, 3.2, M.glow, 6.12, 4.85, 1.6);
    box(0.04, 1.5, 3.2, M.glass, 6.17, 4.85, 1.6);
    const slats = new THREE.InstancedMesh(new THREE.BoxGeometry(0.07, 2.9, 0.12), M.timber, 46);
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
        const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(1.15 * s, 1), i % 2 ? M.leaf : M.leaf2);
        crown.position.set(x, 2.2 * s, z);
        crown.scale.y = 1.15;
        put(crown);
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
      scene.background = new THREE.Color(v('--hh-stage', '#e3e8ea'));
      M.plinth.color.set(v('--hh-plinth', '#d9dee1'));
      M.lawn.color.set(v('--hh-lawn', '#a9b8ab'));
      ghost.set(v('--hh-ghost', '#9aa6b0'));
      renderer.toneMappingExposure = dusk ? 0.8 : 1;
      sun.intensity = dusk ? 1.1 : 2.4;
      sun.color.set(dusk ? '#9fb4ff' : '#fff4e5');
      hemi.intensity = dusk ? 0.25 : 0.5;
      M.glow.emissiveIntensity = dusk ? 1.7 : 0.55;
      if ('environmentIntensity' in scene) scene.environmentIntensity = dusk ? 0.35 : 1;
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
      cur.lerp(tgt, 0.08);
      M.led.emissive.copy(cur);
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
