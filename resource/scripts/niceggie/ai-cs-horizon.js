/* Independent canvas artwork inspired by the supplied sunrise-horizon recording.
   This file contains no third-party component source or runtime dependencies. */
(() => {
  'use strict';
  const canvas = document.querySelector('canvas[data-ai-horizon]');
  if (!canvas) return;
  const context = canvas.getContext('2d');
  if (!context) return;
  const host = canvas.parentElement;
  const atmosphere = document.createElement('canvas');
  const air = atmosphere.getContext('2d');
  const stars = document.createElement('canvas');
  const sky = stars.getContext('2d');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let width = 1, height = 1, ratio = 1, frame = 0, elapsed = 0;
  let request = 0, previous = 0, visible = true;
  let pointerX = null, lightX = .5;
  let apex = 1, curvature = 1;
  let starField = [];
  canvas.dataset.renderer = 'canvas2d';
  // The highest point stays at least 20px below the last visible paragraph.
  function yAt(x) {const offset = x / width - .5;return apex + curvature * 4 * offset * offset;}
  function rim(ctx, from = 0, to = width) {
    ctx.beginPath();
    ctx.moveTo(from, yAt(from));
    for (let x = from + 4; x < to; x += 4) ctx.lineTo(x, yAt(x));
    ctx.lineTo(to, yAt(to));
  }
  function planet(ctx) {
    rim(ctx);ctx.lineTo(width, height);ctx.lineTo(0, height);ctx.closePath();
    ctx.fillStyle = '#100f14';ctx.fill();
  }
  function cacheAtmosphere() {
    atmosphere.width = canvas.width;atmosphere.height = canvas.height;
    air.setTransform(ratio, 0, 0, ratio, 0, 0);
    air.clearRect(0, 0, width, height);
    const reach = Math.min(220, height * .28);
    // Follow the curvature with translucent blue-violet air, fading into transparency.
    for (let x = 0; x < width; x += 1) {
      const edge = yAt(x), gradient = air.createLinearGradient(0, edge - reach, 0, edge + 6);
      gradient.addColorStop(0, 'rgba(47,67,130,0)');
      gradient.addColorStop(.30, 'rgba(32,61,114,.025)');
      gradient.addColorStop(.65, 'rgba(54,43,158,.11)');
      gradient.addColorStop(.87, 'rgba(100,39,192,.24)');
      gradient.addColorStop(.97, 'rgba(155,43,183,.33)');
      gradient.addColorStop(1, 'rgba(229,79,160,.25)');
      air.fillStyle = gradient;air.fillRect(x, edge - reach, 1, reach + 8);
    }
    planet(air);
    air.save();
    rim(air);air.lineWidth = .7;air.strokeStyle = 'rgba(107,86,164,.16)';
    air.shadowColor = 'rgba(151,79,185,.7)';air.shadowBlur = 10;air.stroke();
    air.restore();
  }
  function cacheStars() {
    stars.width = canvas.width;stars.height = canvas.height;
    sky.setTransform(ratio,0,0,ratio,0,0);
    const wash = sky.createLinearGradient(0,0,0,height);
    wash.addColorStop(0,'rgba(6,8,15,.25)');
    wash.addColorStop(.65,'rgba(8,10,21,.55)');
    wash.addColorStop(1,'rgba(10,8,19,.1)');
    sky.fillStyle=wash;sky.fillRect(0,0,width,height);
    let seed=2695;
    const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
    const count=Math.round(width*height/2000);
    starField=[];
    for(let i=0;i<count;i++) {
      const x=random()*width,y=random()*height;
      if(y>yAt(x)-3)continue;
      const bright=i%19===0;
      const radius=bright?.85+random()*.4:.3+random()*.65;
      const alpha=bright?.45+random()*.25:.16+random()*.36;
      // Derive motion from the index so the original seeded star placement stays unchanged.
      const phase=(i*.61803398875%1)*Math.PI*2;
      starField.push({x,y,radius,alpha,bright,phase,
        speed:.60+(i%7)*.11,depth:.25+(i%5)*.18});
    }
  }
  function drawStars() {
    context.drawImage(stars,0,0,width,height);
    const time=reduced.matches?0:elapsed;
    for(const star of starField){
      // Distant layers drift at 0.7–2.7px per second, independently of the sun.
      const x=((star.x+time*2.8*star.depth)%width+width)%width;
      const y=((star.y-time*.4*star.depth)%height+height)%height;
      if(y>yAt(x)-3)continue;
      const twinkle=reduced.matches?1:1+Math.sin(time*star.speed+star.phase)*(star.bright?.42:.30);
      const alpha=Math.min(1,star.alpha*twinkle);
      context.beginPath();context.arc(x,y,star.radius,0,Math.PI*2);
      context.fillStyle=star.bright?`rgba(192,210,244,${alpha})`:`rgba(125,163,213,${alpha})`;context.fill();
      if(star.bright){context.fillStyle=`rgba(167,189,230,${.12*twinkle})`;context.fillRect(x-2,y-.25,4,.5);}
    }
  }
  function spotPosition() {
    if (reduced.matches) return [.5, 1];
    const cycle = (elapsed % 7.8) / 2.6;
    const stage = Math.floor(cycle), progress = cycle - stage;
    const positions = [.5, .82, .18, .5];
    if (stage === 1) {
      // Wrap from the east edge to the west, rather than moving backward over the arc.
      if (progress < .40) return [.82, 1];
      if (progress < .60) return [.82, 1 - (progress - .40) / .20];
      if (progress < .80) return [.18, (progress - .60) / .20];
      return [.18, 1];
    }
    const t = Math.max(0, Math.min(1, (progress - .22) / .64));
    const eased = t * t * (3 - 2 * t);
    return [positions[stage] + (positions[stage + 1] - positions[stage]) * eased, 1];
  }
  function ellipseGlow(ctx, x, y, rx, ry, stops) {
    ctx.save();ctx.translate(x, y);ctx.scale(rx, ry);
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
    stops.forEach(stop => gradient.addColorStop(stop[0], stop[1]));
    ctx.fillStyle = gradient;ctx.fillRect(-1, -1, 2, 2);ctx.restore();
  }
  function curvedWarmGlow(ctx,center,spread,up,down,strength) {
    // Each vertical slice starts at the actual curved rim, including near both edges.
    for(let px=Math.max(0,Math.floor(center-spread));px<Math.min(width,center+spread);px+=2){
      const u=(px-center)/spread,weight=Math.pow(Math.max(0,1-u*u),2)*strength;
      const edge=yAt(px),g=ctx.createLinearGradient(0,edge-up,0,edge+down);
      const horizon=up/(up+down);
      g.addColorStop(0,'rgba(166,47,224,0)');
      g.addColorStop(horizon*.35,`rgba(208,63,185,${weight*.05})`);
      g.addColorStop(horizon*.7,`rgba(249,111,153,${weight*.14})`);
      g.addColorStop(horizon*.94,`rgba(255,139,94,${weight*.32})`);
      g.addColorStop(horizon,`rgba(255,175,129,${weight*.45})`);
      g.addColorStop(horizon+(1-horizon)*.2,`rgba(212,148,90,${weight*.075})`);
      g.addColorStop(1,'rgba(145,95,64,0)');
      ctx.fillStyle=g;ctx.fillRect(px,edge-up,2,up+down);
    }
  }
  function draw() {
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);
    drawStars();
    context.drawImage(atmosphere, 0, 0, width, height);
    const position = spotPosition();
    if(pointerX !== null) {
      lightX += (pointerX-lightX)*.22;
      position[0]=lightX;position[1]=1;
    } else {lightX=position[0];}
    const x = width * position[0], y = yAt(x);
    const size = Math.max(90, Math.min(340, width * .22));
    context.save();context.globalAlpha = position[1];
    ellipseGlow(context, x, y - 20, size * 2, size * 1.05, [
      [0,'rgba(166,47,242,.20)'],[.28,'rgba(134,35,216,.13)'],
      [.62,'rgba(78,34,174,.065)'],[1,'rgba(44,24,119,0)']
    ]);
    ellipseGlow(context, x, y - 8, size * 1.8, size * .95, [
      [0, 'rgba(247,66,168,.15)'],[.32, 'rgba(167,37,215,.10)'],[1, 'rgba(72,33,164,0)']
    ]);
    // A long, low bloom avoids a visible semicircular disk above the rim.
    curvedWarmGlow(context,x,size*1.65,size*.72,size*.52,1);
    context.save();context.translate(x,y);
    context.rotate(Math.atan(8*curvature*(x/width-.5)/width));
    context.translate(-x,-y);
    ellipseGlow(context, x, y, size * .9, size * .20, [
      [0, 'rgba(255,201,165,.82)'],[.12, 'rgba(255,157,112,.43)'],
      [.35, 'rgba(255,153,140,.12)'],[.70,'rgba(243,72,165,.024)'],[1, 'rgba(243,72,165,0)']
    ]);
    context.restore();
    context.restore();
    // The planet masks the lower half of the sunrise, leaving a precise luminous edge.
    planet(context);
    context.save();context.clip();context.globalAlpha=position[1];
    curvedWarmGlow(context,x,size*1.65,size*.72,size*.66,1);
    context.translate(x,y);context.rotate(Math.atan(8*curvature*(x/width-.5)/width));context.translate(-x,-y);
    ellipseGlow(context,x,y+8,size*.95,size*.55,[
      [0,'rgba(247,129,72,.075)'],[.25,'rgba(206,94,58,.035)'],
      [.65,'rgba(120,77,55,.01)'],[1,'rgba(90,60,45,0)']
    ]);
    context.restore();
    rim(context);
    const edgeLight=context.createLinearGradient(0,0,width,0);
    for(let i=0;i<=40;i++){
      const u=i/40,distance=(u-position[0])/.19;
      const warmth=Math.exp(-distance*distance/2)*position[1];
      const r=Math.round(98+157*warmth),g=Math.round(51+124*warmth),b=Math.round(186-57*warmth);
      edgeLight.addColorStop(u,`rgba(${r},${g},${b},${.12+.73*warmth})`);
    }
    context.lineWidth = .9;context.strokeStyle = edgeLight;context.stroke();
    context.save();
    const glow = context.createLinearGradient(x - size, 0, x + size, 0);
    glow.addColorStop(0, 'rgba(255,164,172,0)');
    glow.addColorStop(.38, `rgba(255,159,116,${.65 * position[1]})`);
    glow.addColorStop(.5, `rgba(255,210,178,${position[1]})`);
    glow.addColorStop(.62, `rgba(255,159,116,${.65 * position[1]})`);
    glow.addColorStop(1, 'rgba(255,164,172,0)');
    rim(context, Math.max(0, x - size), Math.min(width, x + size));
    context.strokeStyle = glow;context.lineWidth = 1.7;
    context.shadowColor = '#ff945c';context.shadowBlur = 10;context.stroke();
    context.restore();
    canvas.dataset.frames = String(++frame);
    canvas.dataset.sunX = position[0].toFixed(3);
  }
  function resize() {
    const section=host.parentElement.closest('section');
    const previousSection=section&&section.previousElementSibling;
    if(previousSection){
      const start=previousSection.getBoundingClientRect().top;
      const parentTop=host.parentElement.getBoundingClientRect().top;
      host.style.top=`${Math.round(start-parentTop-100)}px`;
    }
    const bounds = host.getBoundingClientRect();
    width = Math.max(1, bounds.width);height = Math.max(1, bounds.height);
    const paragraphs=[...host.parentElement.querySelectorAll('.trio-card p')];
    const lastBottom=paragraphs.length?Math.max(...paragraphs.map(p=>p.getBoundingClientRect().bottom)):bounds.top+height*.76;
    apex=lastBottom-bounds.top+20;
    curvature=Math.max(12,Math.min(height*.12,height-apex-12));
    canvas.dataset.textGap='20';
    ratio = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * ratio);canvas.height = Math.round(height * ratio);
    cacheStars();cacheAtmosphere();draw();
  }
  function tick(now) {
    request = 0;
    if (!visible || document.hidden || reduced.matches) return;
    if (now - previous >= 32) {
      elapsed += Math.min((now - previous) / 1000, .10);previous = now;draw();
    }
    request = requestAnimationFrame(tick);
  }
  function schedule() {
    if (!visible || document.hidden || reduced.matches) {
      cancelAnimationFrame(request);request = 0;return;
    }
    if (!request) {previous = performance.now();request = requestAnimationFrame(tick);}
  }
  resize();
  if(document.fonts)document.fonts.ready.then(resize);
  new ResizeObserver(resize).observe(host);
  new IntersectionObserver(entries => {visible = entries[0].isIntersecting;schedule();}).observe(host);
  document.addEventListener('visibilitychange', schedule);
  reduced.addEventListener('change', () => {draw();schedule();});
  document.addEventListener('pointermove', event => {
    const bounds=host.getBoundingClientRect();
    pointerX=event.clientX>=bounds.left && event.clientX<=bounds.right && event.clientY>=bounds.top && event.clientY<=bounds.bottom
      ? Math.max(.02,Math.min(.98,(event.clientX-bounds.left)/bounds.width)):null;
    if(reduced.matches){if(pointerX!==null)lightX=pointerX;draw();}
  },{passive:true});
  document.documentElement.addEventListener('pointerleave',()=>{pointerX=null;});
  schedule();
})();
