/* matinsaiyed.com landing — isometric career journey
   Three.js world + GSAP ScrollTrigger scrub.
   A glowing path draws itself through four districts (career chapters);
   the camera rides the comet. Inspired by vectrfl.com. */

import * as THREE from 'three';

(function () {
  'use strict';

  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canvas = document.getElementById('world');

  function webglOK() {
    try {
      var c = document.createElement('canvas');
      return !!(c.getContext('webgl2') || c.getContext('webgl'));
    } catch (e) { return false; }
  }

  if (reduced || !webglOK() || !canvas) {
    document.documentElement.classList.add('no-3d');
    document.getElementById('steps').setAttribute('aria-hidden', 'false');
    document.querySelectorAll('.step').forEach(function (s) { s.classList.add('active'); });
    return;
  }

  var isMobile = matchMedia('(max-width: 720px)').matches;
  var hoverable = matchMedia('(hover: hover)').matches;

  /* ── Renderer / scene / camera ────────────────────────────── */
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  var BG = new THREE.Color(0xe6edf5);
  var scene = new THREE.Scene();
  scene.background = BG;
  scene.fog = new THREE.Fog(BG, 20, 48);

  var FRUSTUM = isMobile ? 23 : 19; // vertical world-units in view
  var camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 200);
  var ISO = new THREE.Vector3(1, 1.08, 1).normalize().multiplyScalar(34);

  function sizeCamera() {
    var w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    var aspect = w / h;
    camera.left = -FRUSTUM * aspect / 2;
    camera.right = FRUSTUM * aspect / 2;
    camera.top = FRUSTUM / 2;
    camera.bottom = -FRUSTUM / 2;
    camera.updateProjectionMatrix();
  }

  /* ── Lights ───────────────────────────────────────────────── */
  var hemi = new THREE.HemisphereLight(0xffffff, 0xd2dfee, 1.5);
  scene.add(hemi);
  var sun = new THREE.DirectionalLight(0xffffff, 1.05);
  sun.position.set(-7, 34, 5);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -30; sun.shadow.camera.right = 30;
  sun.shadow.camera.top = 30; sun.shadow.camera.bottom = -30;
  sun.shadow.bias = -0.0004;
  scene.add(sun);
  scene.add(sun.target);

  /* ── Materials ────────────────────────────────────────────── */
  var WHITE = new THREE.MeshStandardMaterial({ color: 0xf7fafd, roughness: 0.62 });
  var GROUND_MAT = new THREE.MeshStandardMaterial({ color: 0xe8eff8, roughness: 1 });
  var TREND_MAT = new THREE.MeshStandardMaterial({ color: 0x8fa7c4, roughness: 0.5 });

  var ground = new THREE.Mesh(new THREE.PlaneGeometry(220, 220), GROUND_MAT);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  /* ── World helpers ────────────────────────────────────────── */
  var world = new THREE.Group();
  scene.add(world);
  var hoverables = []; // meshes that lift on hover

  function box(w, h, d, x, z, group, opts) {
    opts = opts || {};
    var m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), opts.mat || WHITE);
    m.position.set(x, h / 2 + (opts.y || 0), z);
    if (opts.ry) m.rotation.y = opts.ry;
    m.castShadow = true;
    m.receiveShadow = true;
    (group || world).add(m);
    if (!opts.still) { m.userData.baseY = m.position.y; hoverables.push(m); }
    return m;
  }

  function cylinder(rt, rb, h, x, z, group, opts) {
    opts = opts || {};
    var m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, 26), opts.mat || WHITE);
    m.position.set(x, h / 2 + (opts.y || 0), z);
    m.castShadow = true; m.receiveShadow = true;
    (group || world).add(m);
    if (!opts.still) { m.userData.baseY = m.position.y; hoverables.push(m); }
    return m;
  }



  var COIN = new THREE.MeshStandardMaterial({ color: 0xf2ead8, roughness: 0.45, metalness: 0.25 });
  function coinStack(x, z, count, group) {
    for (var i = 0; i < count; i++) {
      var c = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.085, 22), COIN);
      c.position.set(x + (i % 2) * 0.03, 0.045 + i * 0.09, z + ((i * 3) % 2) * 0.03);
      if (i === count - 1) { c.rotation.y = 0.5; }
      c.castShadow = true; c.receiveShadow = true;
      (group || world).add(c);
    }
  }

  function containerStack(x, z, cols, rows, group) {
    for (var i = 0; i < cols; i++)
      for (var j = 0; j < rows; j++)
        box(0.42, 0.34 + (((i * 7 + j * 3) % 3) === 0 ? 0.34 : 0), 0.42,
          x + i * 0.5, z + j * 0.5, group, { still: true });
  }

  /* ── Districts (career chapters) ──────────────────────────── */
  // Waypoints of the journey (y = ground)
  var WP = [
    new THREE.Vector3(0, 0.05, 0),        // hero / start
    new THREE.Vector3(-9, 0.05, -10),     // 01 research roots
    new THREE.Vector3(2, 0.05, -21),      // 02 scale (tile grid)
    new THREE.Vector3(14, 0.05, -30),     // 03 clients (towers)
    new THREE.Vector3(26, 0.05, -41)      // 04 operations (monument)
  ];

  // Hero surroundings — a skyline ring like the reference cover
  (function heroDistrict() {
    box(1.5, 2.6, 1.5, -4.6, 2.6); box(1.1, 1.7, 1.1, -3.2, 3.4);
    box(1.6, 3.4, 1.6, 4.8, 2.2); box(1.2, 2.0, 1.2, 6.2, 3.2);
    box(2.4, 1.1, 1.6, 5.7, -2.4, null, { ry: 0.4 });
    // financial-district skyline: stepped podium (a bar chart in architecture)
    box(0.9, 0.7, 0.9, -8.6, -3.4); box(0.9, 1.3, 0.9, -7.5, -4.0);
    box(0.9, 2.0, 0.9, -6.4, -4.6); box(0.9, 2.8, 0.9, -5.3, -5.2);
    coinStack(-7.8, -1.8, 5); coinStack(-6.9, -1.2, 3);
    box(1.0, 0.5, 2.0, 2.8, 4.6, null, { ry: -0.25 }); // low annex
    coinStack(8.9, 0.9, 6); coinStack(9.7, 1.7, 4); coinStack(10.3, 0.3, 2);
    box(1.7, 0.8, 1.2, -6.4, 5.4, null, { ry: 0.2 });
    box(0.8, 1.4, 0.8, -8.2, 4.0);
    containerStack(-3.4, 6.2, 3, 2); // archive boxes
  })();

  // 01 — research roots: scattered startup blocks + HQ
  (function d1() {
    var c = WP[1];
    box(1.0, 2.2, 1.0, c.x - 1.4, c.z - 0.6);
    box(0.8, 1.2, 0.8, c.x + 0.8, c.z + 1.0);
    box(0.8, 0.9, 0.8, c.x + 1.8, c.z - 1.2);
    box(0.6, 0.6, 0.6, c.x - 0.2, c.z + 1.8);
    box(0.6, 0.45, 0.6, c.x - 2.4, c.z + 0.9);
    containerStack(c.x + 2.6, c.z + 1.8, 2, 2);
  })();

  // 02 — scale: a field of test-station tiles, one raised (like the reference grid)
  (function d2() {
    var c = WP[2];
    for (var i = 0; i < 7; i++) {
      for (var j = 0; j < 6; j++) {
        var x = c.x - 2.7 + i * 0.92, z = c.z - 2.2 + j * 0.92;
        var raised = (i === 4 && j === 2);
        var t = box(0.74, raised ? 0.5 : 0.14, 0.74, x, z, null, { still: !raised });
        if (raised) box(0.3, 0.42, 0.3, x, z, null, { y: 0.5 });
      }
    }
  })();

  // 03 — clients kept: ascending growth towers
  (function d3() {
    var c = WP[3];
    var hs = [0.8, 1.4, 2.1, 2.9, 3.8];
    for (var i = 0; i < hs.length; i++)
      box(0.95, hs[i], 0.95, c.x - 2.4 + i * 1.25, c.z + 0.4);
    box(2.2, 0.9, 1.4, c.x + 0.4, c.z - 2.4, null, { ry: 0.3 });
    // chart trend line over the bar tops
    var trendPts = hs.map(function (h, i) {
      return new THREE.Vector3(c.x - 2.4 + i * 1.25, h + 0.32, c.z + 0.4);
    });
    trendPts.push(new THREE.Vector3(c.x - 2.4 + hs.length * 1.25, hs[hs.length - 1] + 1.05, c.z + 0.4));
    var trend = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(trendPts), 40, 0.045, 8, false),
      TREND_MAT);
    trend.castShadow = true;
    world.add(trend);
    coinStack(c.x - 4.2, c.z - 2.2, 4);
    coinStack(c.x + 4.4, c.z + 2.2, 6); coinStack(c.x + 5.2, c.z + 1.5, 3);
  })();

  // 04 — operations owned: arrow monument + diamond frames
  (function d4() {
    var c = WP[4];
    var shape = new THREE.Shape();
    shape.moveTo(0, 0.55); shape.lineTo(1.15, 0.55); shape.lineTo(1.15, 1.05);
    shape.lineTo(2.15, 0); shape.lineTo(1.15, -1.05); shape.lineTo(1.15, -0.55);
    shape.lineTo(0, -0.55); shape.lineTo(0, 0.55);
    var geo = new THREE.ExtrudeGeometry(shape, { depth: 0.5, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 2 });
    var arrow = new THREE.Mesh(geo, WHITE);
    arrow.rotation.x = -Math.PI / 2;
    arrow.rotation.z = Math.PI / 4;
    arrow.position.set(c.x - 0.4, 0.56, c.z + 0.4);
    arrow.scale.setScalar(1.6);
    arrow.castShadow = true; arrow.receiveShadow = true;
    world.add(arrow);
    // diamond frames orbiting the monument
    [[2.8, -2.2], [-2.6, -1.6], [3.0, 1.8], [-1.8, 2.8]].forEach(function (o, i) {
      var d = box(0.85, 0.16, 0.85, c.x + o[0], c.z + o[1], null, { y: 0.18 });
      d.rotation.y = Math.PI / 4;
      var stackN = 3 + (i % 3) * 2;
      coinStack(c.x + o[0] * 1.45, c.z + o[1] * 1.45, stackN);
    });
    containerStack(c.x - 4.6, c.z + 2.6, 3, 2); // archive boxes
  })();

  // mid-route patches so no stretch reads empty
  (function patches() {
    // between d2 and d3
    box(1.1, 1.7, 1.1, 8.5, -25.5); box(0.8, 0.9, 0.8, 7.2, -24.2);
    containerStack(5.4, -27.4, 2, 3);
    coinStack(12.5, -23.5, 5); coinStack(13.3, -24.2, 3);
    // between d3 and d4
    box(1.3, 2.2, 1.3, 19.5, -35.5); box(0.9, 1.2, 0.9, 21.2, -34.0);
    containerStack(17.0, -38.2, 3, 2);
    coinStack(23.5, -32.0, 6); coinStack(24.6, -33.4, 4); coinStack(25.2, -31.4, 2);
    // around the monument's far side
    box(1.0, 1.5, 1.0, 30.5, -42.5); box(0.7, 0.8, 0.7, 29.0, -44.0);
  })();

  // ambient filler along the route
  [[-13, -4], [-3, -15], [7, -16], [-1, -27], [9, -25], [19, -25], [20, -36], [10, -37], [30, -35]].forEach(function (p, i) {
    if (i % 3 === 0) containerStack(p[0], p[1], 2, 2);
    else if (i % 3 === 1) box(0.9 + (i % 2) * 0.5, 0.7 + (i % 4) * 0.45, 0.9, p[0], p[1]);
    else coinStack(p[0], p[1], 3 + (i % 4));
  });

  /* ── The glowing path ─────────────────────────────────────── */
  var curve = new THREE.CatmullRomCurve3([
    WP[0].clone().add(new THREE.Vector3(0, 0.1, 2.5)),
    WP[0], WP[1], WP[2], WP[3], WP[4],
    WP[4].clone().add(new THREE.Vector3(3, 0.1, -3))
  ], false, 'catmullrom', 0.4);

  // beam tube — drawn on via shader uProgress
  var beamUniforms = {
    uProgress: { value: 0 },
    uWake: { value: 0 },
    uColor: { value: new THREE.Color(0xffb554) },
    uHot: { value: new THREE.Color(0xfff4dd) }
  };
  var beamMat = new THREE.ShaderMaterial({
    uniforms: beamUniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader:
      'varying float vT;\n' +
      'void main(){ vT = uv.x; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader:
      'uniform float uProgress; uniform float uWake; uniform vec3 uColor; uniform vec3 uHot; varying float vT;\n' +
      'void main(){\n' +
      '  float behind = step(vT, uProgress);\n' +
      '  float tail = smoothstep(uProgress - 0.42, uProgress, vT);\n' +
      '  float head = smoothstep(uProgress - 0.045, uProgress, vT);\n' +
      '  vec3 col = mix(uColor, uHot, head);\n' +
      '  float a = behind * (0.12 + 0.88 * tail) * uWake;\n' +
      '  gl_FragColor = vec4(col, a);\n' +
      '}'
  });
  var beam = new THREE.Mesh(new THREE.TubeGeometry(curve, 320, 0.075, 10, false), beamMat);
  scene.add(beam);
  var halo = new THREE.Mesh(new THREE.TubeGeometry(curve, 320, 0.24, 10, false), beamMat.clone());
  halo.material.uniforms = beamUniforms; // share progress
  halo.material.fragmentShader = beamMat.fragmentShader;
  halo.material.transparent = true;
  halo.material.opacity = 0.4;
  scene.add(halo);

  // dotted matrix ripple around the path
  var DOTS = isMobile ? 700 : 1500;
  var dotGeo = new THREE.CircleGeometry(0.08, 8);
  dotGeo.rotateX(-Math.PI / 2);
  var dotMat = new THREE.MeshBasicMaterial({ color: 0xffc878, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false });
  var dots = new THREE.InstancedMesh(dotGeo, dotMat, DOTS);
  var dotBase = [];
  (function placeDots() {
    var tmp = new THREE.Object3D();
    var i = 0;
    while (i < DOTS) {
      var t = Math.random();
      var p = curve.getPointAt(t);
      var ang = Math.random() * Math.PI * 2;
      var rad = 0.5 + Math.pow(Math.random(), 1.6) * 3.4;
      var x = p.x + Math.cos(ang) * rad, z = p.z + Math.sin(ang) * rad;
      tmp.position.set(x, 0.02, z);
      tmp.scale.setScalar(0.001);
      tmp.updateMatrix();
      dots.setMatrixAt(i, tmp.matrix);
      dotBase.push({ x: x, z: z, t: t, r: 0.5 + Math.random() });
      i++;
    }
  })();
  dots.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(dots);

  // comet head sprite + light
  function glowTexture(midRGB, edgeRGB) {
    var c = document.createElement('canvas');
    c.width = c.height = 128;
    var x = c.getContext('2d');
    var g = x.createRadialGradient(64, 64, 2, 64, 64, 62);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.25, 'rgba(' + midRGB + ',0.85)');
    g.addColorStop(1, 'rgba(' + edgeRGB + ',0)');
    x.fillStyle = g;
    x.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }
  var comet = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture('255,216,150', '255,176,80'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  comet.scale.setScalar(2.4);
  scene.add(comet);
  var cometLight = new THREE.PointLight(0xffb554, 14, 9, 1.6);
  scene.add(cometLight);

  /* ── Theme: the world re-lights itself with the page toggle ── */
  var PALETTES = {
    light: {
      bg: 0xf5f1e8, ground: 0xeee7d8, build: 0xfaf6ec, coin: 0xefe3c9, trend: 0x8a8174,
      hemiSky: 0xffffff, hemiGround: 0xe2d8c4, hemiInt: 1.5, sunInt: 1.0,
      beamCol: 0xb3271a, beamHot: 0xff8e6b, dotCol: 0xb84a36, dotOp: 0.6,
      blending: THREE.NormalBlending, lightCol: 0xd96a4f, lightMax: 6,
      glowMid: '232,112,84', glowEdge: '178,52,32'
    },
    dark: {
      bg: 0x14120f, ground: 0x1b1814, build: 0x3a342b, coin: 0x55492f, trend: 0x6e6354,
      hemiSky: 0x9a9183, hemiGround: 0x2a2520, hemiInt: 0.9, sunInt: 0.45,
      beamCol: 0xff6a4e, beamHot: 0xffe4d6, dotCol: 0xff7a5a, dotOp: 0.9,
      blending: THREE.AdditiveBlending, lightCol: 0xff6a4e, lightMax: 18,
      glowMid: '255,170,140', glowEdge: '255,106,78'
    }
  };
  var lightMax = 14;

  function applyTheme() {
    var p = PALETTES[document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'];
    BG.set(p.bg);
    scene.fog.color.set(p.bg);
    GROUND_MAT.color.set(p.ground);
    WHITE.color.set(p.build);
    COIN.color.set(p.coin);
    TREND_MAT.color.set(p.trend);
    hemi.color.set(p.hemiSky);
    hemi.groundColor.set(p.hemiGround);
    hemi.intensity = p.hemiInt;
    sun.intensity = p.sunInt;
    beamUniforms.uColor.value.set(p.beamCol);
    beamUniforms.uHot.value.set(p.beamHot);
    [beam, halo].forEach(function (m) { m.material.blending = p.blending; m.material.needsUpdate = true; });
    dotMat.color.set(p.dotCol);
    dotMat.opacity = p.dotOp;
    dotMat.blending = p.blending;
    dotMat.needsUpdate = true;
    cometLight.color.set(p.lightCol);
    lightMax = p.lightMax;
    if (comet.material.map) comet.material.map.dispose();
    comet.material.map = glowTexture(p.glowMid, p.glowEdge);
    comet.material.needsUpdate = true;
  }
  applyTheme();
  new MutationObserver(applyTheme)
    .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  /* ── Scroll choreography ──────────────────────────────────── */
  var progress = 0;          // smoothed
  var targetProgress = 0;    // from ScrollTrigger
  var heroCopy = document.getElementById('hero-copy');
  var stepsEl = document.getElementById('steps');
  var stepEls = Array.prototype.slice.call(document.querySelectorAll('.step'));
  var activeStep = -1;

  // path parameter for the comet: keep it slightly ahead of pure progress feel
  function pathT(p) { return THREE.MathUtils.clamp(p * 0.94 + 0.025, 0.02, 0.985); }

  // step windows along progress
  var WINDOWS = [[0.10, 0.32], [0.32, 0.56], [0.56, 0.78], [0.78, 1.01]];

  function setStep(i) {
    if (i === activeStep) return;
    activeStep = i;
    stepEls.forEach(function (el, j) { el.classList.toggle('active', j === i); });
  }

  // Progress straight from layout — immune to resize/refresh mismeasures.
  var journeyEl = document.getElementById('journey');
  function updateTarget() {
    var range = journeyEl.offsetHeight - innerHeight;
    if (range <= 0) { targetProgress = 0; return; }
    targetProgress = Math.min(1, Math.max(0, (scrollY - journeyEl.offsetTop) / range));
  }
  addEventListener('scroll', updateTarget, { passive: true });
  addEventListener('resize', updateTarget, { passive: true });
  updateTarget();

  /* ── Hover lift (desktop) ─────────────────────────────────── */
  var raycaster = new THREE.Raycaster();
  var mouseNDC = new THREE.Vector2(-2, -2);
  var mousePx = new THREE.Vector2(0.5, 0.5);
  var hovered = null;

  if (hoverable) {
    addEventListener('pointermove', function (e) {
      mouseNDC.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
      mousePx.set(e.clientX / innerWidth, e.clientY / innerHeight);
    }, { passive: true });
  }

  function updateHover() {
    if (!hoverable) return;
    raycaster.setFromCamera(mouseNDC, camera);
    var hits = raycaster.intersectObjects(hoverables, false);
    var top = hits.length ? hits[0].object : null;
    if (top !== hovered) {
      if (hovered) gsap.to(hovered.position, { y: hovered.userData.baseY, duration: 0.45, ease: 'power2.out' });
      hovered = top;
      if (hovered) gsap.to(hovered.position, { y: hovered.userData.baseY + 0.34, duration: 0.35, ease: 'power2.out' });
    }
  }

  /* ── Frame loop ───────────────────────────────────────────── */
  var lookTarget = new THREE.Vector3();
  var camPos = new THREE.Vector3();
  var headPos = new THREE.Vector3();
  var clock = new THREE.Clock();
  var tmpObj = new THREE.Object3D();
  var stageVisible = true;
  var wakeGlobal = 0;

  new IntersectionObserver(function (en) { stageVisible = en[0].isIntersecting; })
    .observe(document.getElementById('stage'));

  function frame() {
    requestAnimationFrame(frame);
    if (!stageVisible) return;

    var dt = Math.min(clock.getDelta(), 0.05);
    progress += (targetProgress - progress) * Math.min(1, dt * 5.2);

    var t = pathT(progress);
    curve.getPointAt(t, headPos);

    // comet + beam — glow wakes up as the journey starts
    beamUniforms.uProgress.value = t;
    var wake = THREE.MathUtils.clamp(progress / 0.08, 0, 1);
    wakeGlobal = wake;
    beamUniforms.uWake.value = 0.15 + 0.85 * wake;
    comet.position.set(headPos.x, 0.2, headPos.z);
    var pulse = 1 + Math.sin(clock.elapsedTime * 5.2) * 0.1;
    comet.scale.setScalar((0.9 + 1.3 * wake) * pulse);
    comet.material.opacity = 0.22 + 0.78 * wake;
    cometLight.intensity = lightMax * (0.3 + 0.7 * wake);
    cometLight.position.set(headPos.x, 1.1, headPos.z);

    // dotted ripple — scale by distance to head
    for (var i = 0; i < DOTS; i++) {
      var d = dotBase[i];
      var dx = d.x - headPos.x, dz = d.z - headPos.z;
      var dist = Math.sqrt(dx * dx + dz * dz);
      var w = Math.max(0, 1 - dist / 5.2) * (0.15 + 0.85 * wakeGlobal);
      var s = w * w * (0.7 + 0.5 * Math.sin(clock.elapsedTime * 3 + d.r * 7)) ;
      tmpObj.position.set(d.x, 0.02, d.z);
      tmpObj.scale.setScalar(Math.max(0.001, s * 1.35));
      tmpObj.updateMatrix();
      dots.setMatrixAt(i, tmpObj.matrix);
    }
    dots.instanceMatrix.needsUpdate = true;

    // cinematic push-in as the story builds
    var zoom = 1 + 0.12 * progress;
    if (Math.abs(camera.zoom - zoom) > 0.001) { camera.zoom = zoom; camera.updateProjectionMatrix(); }

    // camera rides the head; gentle mouse parallax
    var px = (mousePx.x - 0.5) * 1.6, pz = (mousePx.y - 0.5) * 1.2;
    camPos.copy(headPos).add(ISO);
    camera.position.lerp(camPos, Math.min(1, dt * 5));
    lookTarget.lerp(new THREE.Vector3(headPos.x + px, 0, headPos.z + pz), Math.min(1, dt * 5));
    camera.lookAt(lookTarget);
    sun.target.position.copy(headPos);
    sun.position.set(headPos.x - 7, 34, headPos.z + 5);


    // overlays
    var heroFade = THREE.MathUtils.clamp(1 - progress / 0.07, 0, 1);
    heroCopy.style.opacity = heroFade;
    heroCopy.style.transform = 'translateY(' + (progress * -260) + 'px)';
    var stepsOn = THREE.MathUtils.clamp((progress - 0.06) / 0.04, 0, 1);
    stepsEl.style.opacity = stepsOn;
    stepsEl.setAttribute('aria-hidden', stepsOn < 0.5 ? 'true' : 'false');

    var si = -1;
    for (var wsi = 0; wsi < WINDOWS.length; wsi++) {
      if (progress >= WINDOWS[wsi][0] && progress < WINDOWS[wsi][1]) { si = wsi; break; }
    }
    setStep(si);

    updateHover();
    renderer.render(scene, camera);
  }

  /* ── Boot ─────────────────────────────────────────────────── */
  sizeCamera();
  camera.position.copy(WP[0]).add(ISO);
  lookTarget.copy(WP[0]);
  camera.lookAt(lookTarget);
  addEventListener('resize', function () { sizeCamera(); }, { passive: true });
  frame();
})();
