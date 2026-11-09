/* Independent floating embers and star glints, matched to the supplied video. */
(()=>{
 'use strict';
 const canvas=document.querySelector('.team-ember-sparks');
 const host=canvas?.parentElement,ctx=canvas?.getContext('2d');
 if(!host||!ctx)return;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 let width=1,height=1,ratio=1,raf=0,last=0,time=0,visible=true,boost=0;
 const random=i=>{const v=Math.sin(i*127.1+3.17)*43758.5453;return v-Math.floor(v)};
 const stars=Array.from({length:55},(_,i)=>({x:random(i*3),y:random(i*3+1),phase:random(i*3+2)*Math.PI*2,speed:12+random(i+101)*18,size:.7+random(i+310)*1.5}));
 function draw(){
  ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,width,height);
  const count=Math.round(Math.min(55,width/26));
  for(let i=0;i<count;i++){
   const star=stars[i];
   const y=((star.y*height-time*star.speed)%height+height)%height;
   const x=star.x*width+Math.sin(time*.5+star.phase)*8;
   const fade=Math.min(1,y/90,(height-y)/100);
   const alpha=(.25+.75*Math.pow(Math.sin(time*1.6+star.phase),6))*fade;
   const r=star.size*(1+boost*.25);
   const glow=ctx.createRadialGradient(x,y,0,x,y,r*9);
   glow.addColorStop(0,`rgba(255,184,232,${alpha*.5})`);glow.addColorStop(.25,`rgba(225,115,212,${alpha*.12})`);glow.addColorStop(1,'rgba(225,115,212,0)');
   ctx.fillStyle=glow;ctx.fillRect(x-r*9,y-r*9,r*18,r*18);
   ctx.fillStyle=`rgba(255,193,234,${alpha*.85})`;ctx.beginPath();
   ctx.moveTo(x,y-r*2.5);ctx.lineTo(x+r*.45,y-r*.45);ctx.lineTo(x+r*2.1,y);ctx.lineTo(x+r*.45,y+r*.45);ctx.lineTo(x,y+r*2.5);ctx.lineTo(x-r*.45,y+r*.45);ctx.lineTo(x-r*2.1,y);ctx.lineTo(x-r*.45,y-r*.45);ctx.closePath();ctx.fill();
  }
 }
 function frame(now){raf=0;if(document.hidden||!visible||reduce.matches)return;if(last&&now-last<1000/30){raf=requestAnimationFrame(frame);return;}const dt=last?Math.min((now-last)/1000,.06):0;last=now;time+=dt;boost*=.94;draw();raf=requestAnimationFrame(frame);}
 function wake(){if(!raf&&!reduce.matches&&visible&&!document.hidden){last=0;raf=requestAnimationFrame(frame);}}
 function resize(){width=host.clientWidth;height=host.clientHeight;ratio=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);draw();wake();}
 new ResizeObserver(resize).observe(host);
 new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);if(!visible){cancelAnimationFrame(raf);raf=0;}else wake();}).observe(host);
 document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(raf);raf=0;wake();});
 reduce.addEventListener('change',()=>{cancelAnimationFrame(raf);raf=0;draw();wake();});
 window.addEventListener('pointerdown',event=>{if(reduce.matches||event.target.closest('button,a,input,textarea'))return;const rect=host.getBoundingClientRect();if(event.clientY>=rect.top&&event.clientY<=rect.bottom){boost=1.5;wake();}},{passive:true});
 resize();
})();
