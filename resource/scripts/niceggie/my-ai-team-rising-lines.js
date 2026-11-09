/* Independent Canvas implementation from the user's Rising Lines recording.
 * No React Bits Pro component source is included or required.
 * Motion parameters follow the supplied customization screenshot.
 * Lighting palette follows the shared Free tools neon scene.
 */
(() => {
  'use strict';
  const options = Object.freeze({
    colors: ['#cd70e9', '#ff2f61'], backgroundColor: '#0a0a0a',
    density: 0.51, speed: 0.30, lineWidth: 2.05, lineLength: 1.04,
    horizonHeight: -0.23, horizonGlow: 2.36, depth: 0.55, spread: 0.95,
    updraft: 0.41, particles: 0.29, interactive: true, intro: true, paused: false
  });
  const host = document.querySelector('.team-rising-background');
  const canvas = host?.querySelector('canvas');
  const demo = document.querySelector('.myai-demo-shot');
  const ctx = canvas?.getContext('2d');
  if (!ctx || !demo) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const glow = document.createElement('canvas');
  const gx = glow.getContext('2d');
  const random = i => { const n = Math.sin(i * 127.1 + 3.17) * 43758.5453; return n - Math.floor(n); };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rgb = color => color.match(/[a-f\d]{2}/gi).map(v => parseInt(v,16));
  const [tail, lineColor] = options.colors.map(rgb);
  const rgba = (color, alpha) => `rgba(${color.join(',')},${clamp(alpha,0,1)})`;
  let width=1, height=1, horizon=1, span=1, ratio=1, time=0, intro=0;
  let raf=0, last=0, visible=true, resizing=0;
  let clearRegions=[];
  const pointer = {x:0,y:0,inside:false};
  const lines = Array.from({length:Math.round(52*options.density)},(_,i)=>({
    x:random(i*7), z:random(i*7+1), seed:random(i*7+2),
    phase:random(i*7+3), length:random(i*7+4), age:0, energy:0
  }));
  const dust = Array.from({length:Math.round(200*options.particles)},(_,i)=>({
    x:random(i*3+800), phase:random(i*3+801), z:random(i*3+802)
  }));
  const volleys = [];
  // Reserve a third of lights for the outer gutters, on both sides of the copy.
  const positionX = (value, index) => index % 3 === 0
    ? width * (index % 2 ? .84 + value * .14 : .02 + value * .14)
    : width / 2 + (value - .5) * span;


  function ellipse(context,x,y,rx,ry,color,alpha) {
    context.save();context.translate(x,y);context.scale(Math.max(rx,1),Math.max(ry,1));
    const g=context.createRadialGradient(0,0,0,0,0,1);
    g.addColorStop(0,rgba(color,alpha));g.addColorStop(.35,rgba(color,alpha*.62));
    g.addColorStop(.72,rgba(color,alpha*.15));g.addColorStop(1,rgba(color,0));
    context.fillStyle=g;context.fillRect(-1,-1,2,2);context.restore();
  }
  function buildGlow() {
    glow.width=canvas.width;glow.height=canvas.height;
    gx.setTransform(ratio,0,0,ratio,0,0);gx.clearRect(0,0,width,height);
    gx.globalCompositeOperation='lighter';
    const power=options.horizonGlow/2.36;
    // Same peach → rose → violet spill as free-tools-neon.css.
    ellipse(gx,width/2,horizon-65,span*.53,230,[221,113,229],.22*power);
    ellipse(gx,width/2,horizon-32,span*.49,145,[177,64,218],.18*power);
    ellipse(gx,width/2-span*.30,horizon-28,span*.30,120,[255,153,89],.13*power);
    ellipse(gx,width/2+span*.30,horizon-35,span*.30,150,[135,91,246],.20*power);
    ellipse(gx,width/2,horizon-9,span*.44,78,[248,151,178],.42*power);
    ellipse(gx,width/2,horizon,span*.42,31,[255,183,143],.58*power);
    ellipse(gx,width/2,horizon,span*.35,12,[255,211,179],.80*power);
    ellipse(gx,width/2,horizon,span*.29,3.5,[255,246,250],.94*power);
    const g=gx.createLinearGradient(width/2-span*.51,0,width/2+span*.51,0);
    g.addColorStop(0,rgba(tail,0));g.addColorStop(.13,rgba(tail,.33));
    g.addColorStop(.35,rgba(lineColor,.95));g.addColorStop(.46,'#fff6fa');
    g.addColorStop(.54,'#fff6fa');g.addColorStop(.65,rgba(lineColor,.95));
    g.addColorStop(.87,rgba(tail,.33));g.addColorStop(1,rgba(tail,0));
    gx.fillStyle=g;gx.fillRect(width/2-span*.51,horizon-.55,span*1.02,1.1);
  }
  function paintLine(x,head,tailY,z,alpha,power=1) {
    if(head<-20||head>horizon+2||tailY-head<1)return;
    const thickness=options.lineWidth*(.24+.65*z);
    const g=ctx.createLinearGradient(0,tailY,0,head);
    g.addColorStop(0,rgba(tail,0));g.addColorStop(.25,rgba(tail,.07*alpha));
    g.addColorStop(.74,rgba(lineColor,.30*alpha));
    g.addColorStop(.97,rgba(lineColor,.65*alpha));
    g.addColorStop(1,`rgba(255,242,221,${alpha*.92})`);
    ctx.save();
    ctx.shadowBlur=5;ctx.shadowColor=rgba(lineColor,alpha*.45);
    ctx.globalAlpha=.65;ctx.fillStyle=g;
    ctx.fillRect(x-thickness/2,head,thickness,tailY-head);
    ctx.restore();
    ellipse(ctx,x,head,thickness*4.5,6,lineColor,.32*alpha*power);
    ellipse(ctx,x,head,1.4,1.8,[255,222,203],alpha*.7);
  }
  function draw() {
    ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,width,height);
    const reveal=reduced.matches||!options.intro?1:1-Math.pow(1-clamp(intro/1.65,0,1),3);
    ctx.save();ctx.beginPath();ctx.rect(0,0,width,height);ctx.clip();
    ctx.globalAlpha=reveal;ctx.drawImage(glow,0,0,width,height);
    // Keep the soft illumination, but cut every moving line and spark out of
    // the heading, description, buttons and navigation area.
    ctx.save();ctx.beginPath();ctx.rect(0,0,width,height);
    for(const region of clearRegions)ctx.rect(region.x,region.y,region.width,region.height);
    ctx.clip('evenodd');
    for(let i=0;i<lines.length;i++){
      const l=lines[i], perspective=1-options.depth*(1-l.z);
      const x=positionX(l.x, i);
      const speed=(35+l.seed*55)*options.speed*(.40+.60*l.z);
      const travel=horizon*(.72+.28*l.z)+90;
      const lift=(l.phase*travel+l.age*speed)%travel;
      const source=horizon-(1-l.z)*options.depth*22;
      const head=source-lift;
      const tailLength=horizon*(.15+.54*l.length)*options.lineLength*perspective;
      const tailY=Math.min(source,head+tailLength);
      const fade=clamp(lift/18,0,1)*clamp((head+30)/100,0,1);
      paintLine(x,head,tailY,l.z,(.35+.65*l.z)*fade);
    }
    // Fine short filaments close to the horizon give the glow depth.
    ctx.globalCompositeOperation='lighter';
    for(let i=0;i<Math.round(span*.09*options.density);i++){
      const x=width/2+(random(i+1300)-.5)*span*.93;
      const pulse=.5+.5*Math.sin(time*.8+random(i+1350)*6.28);
      const len=3+random(i+1400)*22;
      const g=ctx.createLinearGradient(0,horizon-len,0,horizon);
      g.addColorStop(0,rgba(lineColor,0));g.addColorStop(1,rgba(lineColor,.12+pulse*.16));
      ctx.fillStyle=g;ctx.fillRect(x,horizon-len,.5+random(i+1450)*.5,len);
    }
    // Soft point lights have no tails: a tiny warm core inside a feathered halo.
    for(const [i,p] of dust.entries()){
      const phase=(p.phase+time*options.speed*(.013+p.z*.018))%1;
      const x=positionX(p.x,i)+Math.sin(time*.25+p.phase*6.28)*3;
      const y=horizon-phase*horizon*.96;
      const alpha=Math.sin(phase*Math.PI)*(.20+p.z*.38);
      const radius=3.5+p.z*3;
      ellipse(ctx,x,y,radius,radius,[255,128,92],alpha*.55);
      ellipse(ctx,x,y,1.2,1.2,[255,191,151],alpha*.65);
    }
    for(const v of volleys){
      for(let i=0;i<7;i++){
        const spread=(random(i+v.seed)-.5)*75;
        const head=horizon-v.age*(65+random(i+80)*100);
        paintLine(v.x+spread,head,Math.min(horizon,head+120),.5+random(i+90)*.5,clamp(1-v.age/4,0,1),1.4);
      }
    }
    ctx.restore();ctx.restore();
    canvas.dataset.motion=reduced.matches||options.paused?'still':'running';
    canvas.dataset.horizon=String(horizon);
    canvas.dataset.clearRegions=JSON.stringify(clearRegions);
  }
  function frame(now) {
    raf=0;if(!visible||document.hidden)return;
    if(last&&now-last<1000/30){raf=requestAnimationFrame(frame);return;}
    const dt=last?Math.min((now-last)/1000,.075):0;last=now;
    if(!reduced.matches&&!options.paused){
      time+=dt;intro+=dt;
      for(const [i,l] of lines.entries()){
        const x=positionX(l.x, i);
        const influence=pointer.inside?Math.exp(-Math.pow((x-pointer.x)/85,2)):0;
        l.energy+=(influence-l.energy)*Math.min(1,dt*5);
        l.age+=dt*(1+l.energy*options.updraft*2.5);
      }
      for(const v of volleys)v.age+=dt;
      while(volleys.length&&volleys[0].age>4)volleys.shift();
    }
    draw();if(!reduced.matches&&!options.paused)raf=requestAnimationFrame(frame);
  }
  function wake(){if(!raf&&visible&&!document.hidden){last=0;raf=requestAnimationFrame(frame);}}
  function resize(){
    resizing=0;
    width=document.body.clientWidth;
    const bounds=demo.getBoundingClientRect(),body=document.body.getBoundingClientRect();
    horizon=Math.max(100,bounds.top-body.top-2);
    const horizonRatio=clamp(.5-options.horizonHeight*.75,.15,.98);
    height=Math.ceil(horizon/horizonRatio);
    span=Math.min(width*.98,(bounds.width+80)*options.spread);
    ratio=Math.min(devicePixelRatio||1,1.5);
    host.style.height=height+'px';
    canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);
    const hostBounds=host.getBoundingClientRect();
    const copy=[...document.querySelectorAll('.hero-h1 .line1,.hero-h1 .line2,.hero-subtitle,.hero-cta-row')].map(el=>el.getBoundingClientRect());
    clearRegions=[];
    if(copy.length){
      const left=Math.min(...copy.map(r=>r.left))-32;
      const right=Math.max(...copy.map(r=>r.right))+32;
      const top=Math.min(...copy.map(r=>r.top))-24;
      const bottom=Math.max(...copy.map(r=>r.bottom))+28;
      clearRegions.push({x:left-hostBounds.left,y:top-hostBounds.top,width:right-left,height:bottom-top});
    }
    const nav=document.querySelector('nav')?.getBoundingClientRect();
    if(nav)clearRegions.push({x:nav.left-hostBounds.left-12,y:nav.top-hostBounds.top-10,width:nav.width+24,height:nav.height+20});
    buildGlow();draw();wake();
  }
  function scheduleResize(){if(!resizing)resizing=requestAnimationFrame(resize);}
  const observer=new ResizeObserver(scheduleResize);
  observer.observe(demo);const hero=document.querySelector('.hero');if(hero)observer.observe(hero);
  new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);if(visible)wake();else{cancelAnimationFrame(raf);raf=0;}}).observe(host);
  window.addEventListener('resize',scheduleResize,{passive:true});
  window.addEventListener('pointermove',event=>{if(!options.interactive||reduced.matches)return;const rect=host.getBoundingClientRect();pointer.x=event.clientX;pointer.y=event.clientY-rect.top;pointer.inside=pointer.y>=0&&pointer.y<=horizon;},{passive:true});
  document.addEventListener('pointerleave',()=>{pointer.inside=false;});
  window.addEventListener('blur',()=>{pointer.inside=false;});
  window.addEventListener('pointerdown',event=>{
    if(!options.interactive||reduced.matches||event.target.closest('button,a,input,textarea'))return;
    const rect=host.getBoundingClientRect();if(event.clientY<rect.top||event.clientY>rect.top+horizon)return;
    if(volleys.length>=6)volleys.shift();volleys.push({x:event.clientX,age:0,seed:Math.floor(random(time+2)*999)});wake();
  },{passive:true});
  document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(raf);raf=0;wake();});
  reduced.addEventListener('change',()=>{cancelAnimationFrame(raf);raf=0;intro=2;draw();wake();});
  document.fonts?.ready.then(scheduleResize);
  canvas.dataset.settings=JSON.stringify(options);
  resize();
})();
