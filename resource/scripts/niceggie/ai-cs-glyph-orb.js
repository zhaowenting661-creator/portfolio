/* Independent ASCII planet artwork, recreated from the supplied visual recording.
   No licensed component source, external assets, framework or network requests. */
(() => {
  'use strict';
  const canvas = document.querySelector('canvas[data-ai-glyph-orb]');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const host = canvas.closest('.final-cta') || canvas.parentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const characters = ' .,:;!ilI1tfrxvuncozXYUJCLQ0OZmwqdbkhao*#8B@$';
  const tilt = -24 * Math.PI / 180, tiltCos = Math.cos(tilt), tiltSin = Math.sin(tilt);
  let width = 1, height = 1, ratio = 1, radius = 1, frames = 0, time = 0;
  let request = 0, previous = 0, visible = true, angle = 0, velocity = 0, storm = 0;
  let pointerX = -.45, pointerY = -.5, dragging = false, dragPointer = null, lastX = 0, dragDistance = 0;
  let grid = [];
  const clamp = (value, a, b) => Math.max(a, Math.min(b, value));
  function hash(x, y, z) {
    const n = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
    return n - Math.floor(n);
  }
  function buildGrid() {
    grid = [];
    // A monospace glyph is narrower than its line height, matching the dense reference.
    const stepX = 6.6, stepY = 11;
    for (let y = -radius; y <= radius; y += stepY) {
      for (let x = -radius; x <= radius; x += stepX) {
        const nx = x / radius, ny = y / radius, square = nx * nx + ny * ny;
        if (square > .998) continue;
        grid.push({x, y, nx, ny, nz:Math.sqrt(1 - square)});
      }
    }
  }
  function draw() {
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#0a0a0a';ctx.fillRect(0, 0, width, height);
    const cx = width / 2, cy = height / 2;
    const atmosphere = ctx.createRadialGradient(cx, cy, radius * .55, cx, cy, radius * 1.34);
    atmosphere.addColorStop(0, 'rgba(79,8,124,.055)');
    atmosphere.addColorStop(.5, 'rgba(94,13,167,.085)');
    atmosphere.addColorStop(.75, 'rgba(73,13,122,.035)');
    atmosphere.addColorStop(1, 'rgba(37,8,60,0)');
    ctx.fillStyle = atmosphere;ctx.fillRect(cx - radius * 1.4, cy - radius * 1.4, radius * 2.8, radius * 2.8);
    ctx.font = '10px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
    ctx.textAlign = 'center';ctx.textBaseline = 'middle';
    const rotation = angle + time * .16;
    const cosine = Math.cos(rotation), sine = Math.sin(rotation);
    const lightX = -.57 + pointerX * .22, lightY = -.48 + pointerY * .18, lightZ = .70;
    const lightNorm = Math.hypot(lightX, lightY, lightZ);
    const stormPhase = storm * Math.sin(time * 5.6);
    for (const point of grid) {
      // Inverse-map each screen glyph to the rotating and tilted globe surface.
      const tx = point.nx * tiltCos - point.ny * tiltSin;
      const ty = point.nx * tiltSin + point.ny * tiltCos;
      const sx = tx * cosine + point.nz * sine;
      const sz = point.nz * cosine - tx * sine;
      const longitude = Math.atan2(sx, sz), latitude = Math.asin(clamp(ty, -1, 1));
      const warp = Math.sin(longitude * 2.3 + Math.sin(latitude * 3.1) * 1.2 + time * .19);
      const turbulence = Math.sin(longitude * 5.2 - latitude * 4.6 + time * .13) * .45;
      const bands = .5 + .5 * Math.sin(latitude * 14.4 + warp * 3.5 + turbulence + stormPhase * 3.);
      const cloud = .5 + .5 * Math.sin(longitude * 3.4 + latitude * 2.6 + warp * 1.7);
      const pattern = Math.pow(bands, 1.3) * .78 + cloud * .22;
      const diffuse = clamp((point.nx * lightX + point.ny * lightY + point.nz * lightZ) / lightNorm, 0, 1);
      const rim = Math.pow(1 - point.nz, 2.2) * .19;
      const shade = clamp(.085 + pattern * (.24 + diffuse * .72) + rim, 0, 1);
      const warmth = clamp(diffuse * (.35 + pattern * .65), 0, 1);
      const red = Math.round((158 + 97 * warmth) * shade);
      const green = Math.round((1 + 167 * warmth) * shade);
      const blue = Math.round((255 - 84 * warmth) * shade);
      // Character identity travels with the surface; storms accelerate local changes.
      const seed = hash(Math.floor(longitude * 40), Math.floor(latitude * 40), Math.floor(time * (1 + storm * 12)));
      const symbolIndex = Math.floor(clamp(shade * .7 + seed * .3, 0, .999) * characters.length);
      ctx.fillStyle = `rgb(${red},${green},${blue})`;
      ctx.globalAlpha = clamp(.48 + point.nz * .52, 0, 1);
      const shift = storm * 2 * Math.sin(point.ny * 10 + time * 9);
      ctx.fillText(characters[symbolIndex], cx + point.x + shift, cy + point.y);
    }
    ctx.globalAlpha = 1;
    canvas.dataset.frames = String(++frames);
    canvas.dataset.ready = 'true';canvas.dataset.renderer = 'canvas2d';
  }
  function resize() {
    const bounds = canvas.parentElement.getBoundingClientRect();
    width = Math.max(1, bounds.width);height = Math.max(1, bounds.height);
    ratio = Math.min(devicePixelRatio || 1, 1.5);
    radius = Math.min(300, width * .44, height * .44);
    canvas.width = Math.round(width * ratio);canvas.height = Math.round(height * ratio);
    buildGrid();draw();
  }
  function tick(now) {
    request = 0;
    if (!visible || document.hidden || reduced.matches) return;
    if (now - previous >= 32) {
      const dt = Math.min((now - previous) / 1000, .08);previous = now;
      time += dt;
      if (!dragging) {angle += velocity * dt * 60;velocity *= Math.pow(.95, dt * 60);}
      storm *= Math.exp(-dt * 1.8);draw();
    }
    request = requestAnimationFrame(tick);
  }
  function schedule() {
    if (!visible || document.hidden || reduced.matches) {cancelAnimationFrame(request);request = 0;return;}
    if (!request) {previous = performance.now();request = requestAnimationFrame(tick);}
  }
  function interactiveTarget(event) {
    return event.target.closest('a,button,input,textarea,select,label,[role="button"]');
  }
  host.addEventListener('pointermove', event => {
    if (interactiveTarget(event)) return;
    const bounds = canvas.getBoundingClientRect();
    pointerX = clamp((event.clientX - bounds.left) / width * 2 - 1, -1, 1);
    pointerY = clamp((event.clientY - bounds.top) / height * 2 - 1, -1, 1);
    if (dragging && event.pointerId === dragPointer) {
      const delta = event.clientX - lastX;lastX = event.clientX;dragDistance += Math.abs(delta);
      velocity = delta * .006;angle += velocity;
    }
    if (reduced.matches) draw();
  }, {passive:true});
  host.addEventListener('pointerdown', event => {
    if (interactiveTarget(event) || event.button !== 0) return;
    dragging = true;dragPointer = event.pointerId;lastX = event.clientX;dragDistance = 0;
    host.setPointerCapture(event.pointerId);
  });
  function release(event) {
    if (!dragging || event.pointerId !== dragPointer) return;
    dragging = false;
    if (event.type === 'pointerup' && dragDistance < 6 && !reduced.matches) storm = 1;
    dragPointer = null;
  }
  host.addEventListener('pointerup', release);host.addEventListener('pointercancel', release);
  host.addEventListener('lostpointercapture', release);
  host.addEventListener('pointerleave', () => {pointerX = -.45;pointerY = -.5;});
  resize();
  new ResizeObserver(resize).observe(canvas.parentElement);
  new IntersectionObserver(entries => {visible = entries[0].isIntersecting;schedule();}).observe(canvas);
  document.addEventListener('visibilitychange', schedule);
  reduced.addEventListener('change', () => {draw();schedule();});
  schedule();
})();
