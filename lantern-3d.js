// <lantern-3d>: the slow chrome object in the Lantern home hero. From the Claude Design handoff
// (Lantern Homepage Directions, 1a layout + 1c colours). three.js 0.184.0 is self-hosted in vendor/three/.
// Reduced motion: one still frame, no pointer follow. No WebGL: the CSS stand-in inside the element stays.
(() => {
  if (!window.customElements || customElements.get('lantern-3d')) return;
  const THREE_URL = new URL('vendor/three/three.module.min.js', document.currentScript.src).href;
  const still = matchMedia('(prefers-reduced-motion: reduce)');
  let threeP = null;
  const loadThree = () => threeP || (threeP = import(THREE_URL));

  // Reflection "rooms": emissive panels around the object. Values > 1 act as lights.
  const ENVS = {
    warm: { wall: [0.93, 0.89, 0.82], panels: [
      { c: [3.2, 2.9, 2.4], p: [0, 5, 0], s: [6, 3] },
      { c: [2.6, 1.3, 0.55], p: [-5, 1, 2], s: [3, 6] },
      { c: [0.12, 0.1, 0.08], p: [5, 0, -2], s: [4, 8] },
      { c: [2.2, 2.2, 2.1], p: [0, 0, 6], s: [5, 2] },
    ], color: [0.98, 0.96, 0.93], roughness: 0.1, irid: 0 },
    dark: { wall: [0.02, 0.02, 0.025], panels: [
      { c: [6, 6, 6], p: [0, 5, 0], s: [8, 1.2] },
      { c: [5, 5, 5.5], p: [-5, 2, 0], s: [0.8, 6] },
      { c: [1.0, 1.3, 4.2], p: [5, -1, 2], s: [2.5, 5] },
      { c: [2.6, 2.3, 1.6], p: [0, -5, 0], s: [6, 6] },
      { c: [4, 4, 4], p: [0, 1, 6], s: [1.2, 4] },
    ], color: [0.93, 0.93, 0.92], roughness: 0.06, irid: 0 },
    pastel: { wall: [0.96, 0.95, 0.93], panels: [
      { c: [2.6, 2.5, 2.4], p: [0, 5, 0], s: [6, 4] },
      { c: [1.7, 1.35, 2.7], p: [-5, 1, 1], s: [4, 6] },
      { c: [1.1, 2.1, 1.45], p: [5, 0, -1], s: [4, 6] },
      { c: [2.7, 1.65, 1.45], p: [0, -5, 0], s: [6, 6] },
      { c: [1.25, 1.85, 2.7], p: [0, 0, 6], s: [5, 3] },
    ], color: [0.97, 0.96, 0.97], roughness: 0.12, irid: 0.45 },
  };

  function roomScene(THREE, env) {
    const s = new THREE.Scene();
    s.add(new THREE.Mesh(new THREE.BoxGeometry(14, 14, 14),
      new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB(...env.wall), side: THREE.BackSide })));
    const plane = new THREE.PlaneGeometry(1, 1);
    env.panels.forEach(pn => {
      const m = new THREE.Mesh(plane, new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB(...pn.c) }));
      m.position.set(...pn.p); m.lookAt(0, 0, 0); m.scale.set(pn.s[0], pn.s[1], 1); s.add(m);
    });
    return s;
  }

  function buildShape(THREE, variant, mat) {
    const g = new THREE.Group();
    const add = (geo, pos = [0, 0, 0], rot = [0, 0, 0], scl = [1, 1, 1]) => {
      const m = new THREE.Mesh(geo, mat); m.position.set(...pos); m.rotation.set(...rot); m.scale.set(...scl); g.add(m); return m;
    };
    if (variant === 'knot') {
      add(new THREE.TorusKnotGeometry(1.05, 0.3, 320, 48, 2, 3));
    } else if (variant === 'cluster') {
      add(new THREE.SphereGeometry(1.0, 96, 64));
      add(new THREE.TorusGeometry(1.75, 0.13, 48, 220), [0, 0, 0], [Math.PI / 2.6, 0.3, 0]);
      add(new THREE.SphereGeometry(0.34, 64, 48), [1.9, 0.6, 0.4]);
      add(new THREE.CapsuleGeometry(0.22, 0.9, 16, 48), [-1.7, -0.9, 0.6], [0, 0, Math.PI / 3]);
    } else {
      add(new THREE.CapsuleGeometry(0.55, 1.4, 24, 64), [0.2, -0.75, 0], [0, 0, Math.PI / 2]);
      add(new THREE.SphereGeometry(0.8, 96, 64), [-0.75, 0.55, 0.1], [0, 0, 0], [1, 0.72, 1]);
      add(new THREE.SphereGeometry(0.5, 96, 64), [1.05, 0.6, -0.2]);
      add(new THREE.TorusGeometry(0.62, 0.2, 48, 160), [0.25, 1.35, 0.3], [Math.PI / 2.2, 0.4, 0]);
    }
    return g;
  }

  class Lantern3D extends HTMLElement {
    static get observedAttributes() { return ['paused', 'speed']; }
    constructor() { super(); this._raf = 0; this._visible = true; this._tx = 0; this._ty = 0; this._rx = 0; this._ry = 0; }
    get speed() { const v = parseFloat(this.getAttribute('speed')); return Number.isFinite(v) ? v : 1; }
    get paused() { return this.getAttribute('paused') === 'true'; }
    attributeChangedCallback() { if (this._ready) this._loop(); }
    async connectedCallback() {
      if (!this.style.display) this.style.display = 'block';
      // Fill the mount wrapper unless an explicit height was given.
      if (!this.style.height && !this.getAttribute('height') && this.clientHeight === 0) {
        this.style.position = 'absolute'; this.style.inset = '0'; this.style.width = '100%'; this.style.height = '100%';
      } else if (getComputedStyle(this).position === 'static') { this.style.position = 'relative'; }
      const canvas = document.createElement('canvas');
      canvas.setAttribute('aria-hidden', 'true');
      canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';
      let THREE, renderer;
      try {
        THREE = await loadThree();
        if (!this.isConnected) return;
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
      } catch (err) { return; }   // no WebGL or the module failed: keep the stand-in
      this.appendChild(canvas);
      this.classList.add('ready');
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = parseFloat(this.getAttribute('exposure')) || 1.05;
      const env = ENVS[this.getAttribute('env')] || ENVS.warm;
      const pmrem = new THREE.PMREMGenerator(renderer);
      const envTex = pmrem.fromScene(roomScene(THREE, env), 0.035).texture;
      pmrem.dispose();
      const scene = new THREE.Scene();
      scene.environment = envTex;
      const mat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color().setRGB(...env.color), metalness: 1, roughness: env.roughness,
        iridescence: env.irid, iridescenceIOR: 1.3, envMapIntensity: 1,
      });
      const group = buildShape(THREE, this.getAttribute('variant') || 'knot', mat);
      scene.add(group);
      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
      const sphere = new THREE.Box3().setFromObject(group).getBoundingSphere(new THREE.Sphere());
      camera.position.set(0, 0, sphere.radius / Math.sin(THREE.MathUtils.degToRad(15)) * 1.04);
      camera.lookAt(0, 0, 0);
      Object.assign(this, { _THREE: THREE, _renderer: renderer, _scene: scene, _camera: camera, _group: group, _mat: mat, _envTex: envTex, _ready: true });
      const fit = () => {
        const w = this.clientWidth || 300, h = this.clientHeight || 300;
        renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
        if (!this._running) renderer.render(scene, camera);
      };
      this._ro = new ResizeObserver(fit); this._ro.observe(this); fit();
      this._io = new IntersectionObserver(([e]) => { this._visible = e.isIntersecting; this._loop(); }, { threshold: 0 });
      this._io.observe(this);
      this._onMove = (e) => {
        const r = this.getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        this._tx = Math.max(-1, Math.min(1, (e.clientX - cx) / Math.max(window.innerWidth, 1) * 2));
        this._ty = Math.max(-1, Math.min(1, (e.clientY - cy) / Math.max(window.innerHeight, 1) * 2));
      };
      window.addEventListener('pointermove', this._onMove, { passive: true });
      this._onStill = () => this._loop();
      still.addEventListener('change', this._onStill);
      this._loop();
    }
    _loop() {
      cancelAnimationFrame(this._raf); this._running = false;
      if (!this._ready || !this._visible || this.paused || this.speed === 0 || still.matches) { if (this._ready) this._renderer.render(this._scene, this._camera); return; }
      this._running = true;
      let last = performance.now();
      const tick = (t) => {
        const dt = Math.min((t - last) / 1000, 0.05); last = t;
        const g = this._group, s = this.speed;
        this._rx += (this._ty * 0.28 - this._rx) * 0.04;
        this._ry += (this._tx * 0.35 - this._ry) * 0.04;
        g.rotation.y += dt * 0.32 * s;
        g.rotation.x = 0.22 * Math.sin(t * 0.00028 * s) + this._rx;
        g.rotation.z = this._ry * 0.4;
        g.position.y = 0.07 * Math.sin(t * 0.0008 * s);
        this._renderer.render(this._scene, this._camera);
        this._raf = requestAnimationFrame(tick);
      };
      this._raf = requestAnimationFrame(tick);
    }
    disconnectedCallback() {
      cancelAnimationFrame(this._raf); this._running = false;
      this._ro && this._ro.disconnect(); this._io && this._io.disconnect();
      window.removeEventListener('pointermove', this._onMove);
      still.removeEventListener('change', this._onStill);
      if (this._ready) {
        this._group.traverse(o => o.geometry && o.geometry.dispose());
        this._mat.dispose(); this._envTex.dispose(); this._renderer.dispose();
        this._ready = false;
      }
    }
  }
  customElements.define('lantern-3d', Lantern3D);
})();
