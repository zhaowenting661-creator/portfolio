/* Local letter lift with damped spring return. No layout or palette changes. */
(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const selector = '.hero-h1 .line1,.hero-h1 .line2,.hero-h1-line1,.hero-h1-line2,.nc-hero-title';
  let request = 0, last = 0, pointer = null, measuring = 0;
  const lines = [], letters = [];
  function start() {
    if (!request && fine.matches && !reduced.matches && !document.hidden) {
      last = performance.now();request = requestAnimationFrame(tick);
    }
  }
  function tick(now) {
    request = 0;
    const dt = Math.min((now-last)/1000,.035);last=now;
    let moving = false;
    for (const record of letters) {
      const {font} = record.line;
      let weight = 0, side = 0;
      if (pointer && record.line.visible) {
        const dx=record.x-pointer.x,dy=record.y-pointer.y;
        const distance=Math.hypot(dx,dy*.85), reach=font*1.65;
        if(distance<reach){weight=Math.pow(1-distance/reach,1.8);side=dx/reach;}
      }
      const goal = reduced.matches || !fine.matches ? 0 : -font*.90*weight;
      record.velocity += ((goal-record.lift)*210-record.velocity*17)*dt;
      record.lift += record.velocity*dt;
      if(Math.abs(record.lift)<.015 && Math.abs(record.velocity)<.03 && goal===0){record.lift=0;record.velocity=0;}
      if(record.lift || record.velocity || weight) moving=true;
      const rotation = side*weight*14;
      record.rotation += (rotation-record.rotation)*Math.min(1,dt*12);
      if(Math.abs(record.rotation)>.02)moving=true;else record.rotation=0;
      record.element.style.transform = record.lift || record.rotation ? `translate3d(${(side*weight*font*.10).toFixed(2)}px,${record.lift.toFixed(2)}px,0) rotate(${record.rotation.toFixed(2)}deg)` : '';
    }
    if (moving && !document.hidden) request=requestAnimationFrame(tick);
  }
  function measure() {
    measuring=0;
    // Read resting geometry, never transformed bounds, so repeated hovers do not drift.
    for(const record of letters)record.element.style.transform='';
    for(const line of lines){
      const style=getComputedStyle(line.element), bounds=line.element.getBoundingClientRect();
      line.font=parseFloat(style.fontSize);line.bounds=bounds;
      line.visible=bounds.bottom>0 && bounds.top<innerHeight;
      for(const record of line.letters){
        const box=record.element.getBoundingClientRect();record.x=box.left+box.width/2;record.y=box.top+box.height/2;
        if(line.gradient!=='none'){
          record.element.style.backgroundImage=line.gradient;
          record.element.style.backgroundSize=`${bounds.width}px ${bounds.height}px`;
          record.element.style.backgroundPosition=`${bounds.left-box.left}px ${bounds.top-box.top}px`;
          record.element.style.backgroundRepeat='no-repeat';
          record.element.style.backgroundClip='text';record.element.style.webkitBackgroundClip='text';
          record.element.style.webkitTextFillColor='transparent';
        }
      }
    }
    start();
  }
  function scheduleMeasure(){if(!measuring)measuring=requestAnimationFrame(measure);}
  function initialize() {
    for(const element of document.querySelectorAll(selector)){
      if(element.dataset.elasticTitle==='true')continue;
      const original=element.textContent;
      if(!original.trim() || element.children.length)continue;
      const style=getComputedStyle(element),font=parseFloat(style.fontSize);
      const line={element,font,gradient:style.backgroundImage,letters:[],visible:true};
      const node=element.firstChild, fragment=document.createDocumentFragment();
      if(!node || node.nodeType!==3)continue;
      const range=document.createRange();let offset=0;
      for(const token of original.match(/\s+|\S+/gu)||[]){
        if(/^\s+$/u.test(token)){fragment.append(document.createTextNode(token));offset+=token.length;continue;}
        const word=document.createElement('span');word.className='elastic-title-word';word.setAttribute('aria-hidden','true');
        for(const char of Array.from(token)){
          range.setStart(node,offset);range.setEnd(node,offset+char.length);
          const width=range.getBoundingClientRect().width;
          const span=document.createElement('span');span.className='elastic-title-letter';span.textContent=char;
          if(width>0)span.style.width=`${width/font}em`;
          const record={element:span,line,lift:0,velocity:0,rotation:0,x:0,y:0};
          word.append(span);line.letters.push(record);letters.push(record);offset+=char.length;
        }
        fragment.append(word);
      }
      // A single original string remains available to assistive technology.
      const sr=document.createElement('span');sr.className='elastic-title-sr';sr.textContent=original;
      element.replaceChildren(fragment,sr);element.dataset.elasticTitle='true';element.classList.add('elastic-title-line');lines.push(line);
    }
    if(!letters.length)return;
    measure();new ResizeObserver(scheduleMeasure).observe(document.documentElement);
    document.addEventListener('pointermove',event=>{
      if(event.pointerType==='touch' || !fine.matches || reduced.matches)return;
      pointer={x:event.clientX,y:event.clientY};start();
    },{passive:true});
    document.addEventListener('pointerleave',()=>{pointer=null;start();});
    window.addEventListener('blur',()=>{pointer=null;start();});
    window.addEventListener('scroll',()=>{pointer=null;scheduleMeasure();},{passive:true});
    window.addEventListener('resize',scheduleMeasure,{passive:true});
    reduced.addEventListener('change',()=>{pointer=null;letters.forEach(r=>{r.lift=r.velocity=r.rotation=0;r.element.style.transform='';});});
    document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(request);request=0;pointer=null;}else scheduleMeasure();});
  }
  const ready=()=>{if(document.fonts)document.fonts.ready.then(initialize);else initialize();};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
})();
