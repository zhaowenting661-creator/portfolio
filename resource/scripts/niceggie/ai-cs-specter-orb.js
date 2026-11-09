/* Independent Specter-like orb artwork from the supplied recording/settings.
   Native rendering only; no React Bits source, assets, or runtime dependencies. */
(() => {
  'use strict';
  const canvas = document.querySelector('canvas[data-ai-specter-orb]');
  if (!canvas) return;
  const host = canvas.parentElement, interaction = canvas.closest('.final-cta') || host;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let gl = null, program = null, locations = {}, fallback = null, context2d = null;
  let width = 1, height = 1, radius = 1, ratio = 1, quality = 1;
  let frame = 0, elapsed = 0, request = 0, previous = 0, visible = true, slowFrames = 0;
  let target = [0, 0], cursor = [0, 0], hoverTarget = 0, hover = 0;
  const vertex = 'attribute vec2 position;void main(){gl_Position=vec4(position,0.,1.);}';
  const fragment = `precision highp float;
    uniform vec2 resolution;uniform vec2 cssSize;uniform vec2 cursor;
    uniform float radius;uniform float time;uniform float hover;
    // Palette extracted from this site's basic.css / ai-customer-service.css:
    // purple #7c3aed, deep purple #5f3ecd, orange #ff8500, warm glow #ff9959.
    const vec3 key=vec3(.486275,.227451,.929412);
    const vec3 fill=vec3(1.,.521569,0.);
    const vec3 ambient=vec3(.372549,.243137,.803922);
    const vec3 specA=vec3(.486275,.227451,.929412);
    const vec3 specB=vec3(1.,.6,.349020);
    const vec3 blue=vec3(.16,.28,1.);
    float hash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
    float noise(vec3 p){
      vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
      return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
      mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);
    }
    float fbm(vec3 p){return .57143*noise(p)+.28571*noise(p*2.01+7.3)+.14286*noise(p*4.03+19.7);}
    void main(){
      vec2 p=(gl_FragCoord.xy/resolution*cssSize-.5*cssSize)/radius;
      // Match the reference's continuous ~5–7 second rolling deformation.
      float t=time*.85;
      float a=atan(p.y,p.x);
      // Advect the whole surface field: the bubble keeps flowing without pointer input.
      // Periodic low-frequency waves keep a smooth, closed bubble silhouette.
      // Surface turbulence remains inside the orb, away from the contour.
      float pullAngle=atan(cursor.y+.00001,cursor.x+.00001);
      float pullArc=atan(sin(a-pullAngle),cos(a-pullAngle));
      float pull=.24*hover*exp(-pullArc*pullArc/.32)*smoothstep(.05,.45,length(cursor));
      float shape=1.+.105*sin(a*2.+t*1.25)+.055*sin(a*3.-t*1.10)+.022*sin(a+t*.85)+pull;
      float radial=length(p),dist=radial-shape;
      float inside=1.-smoothstep(-.010,.010,dist);
      float r=radial/shape;
      float flow=fbm(vec3(p*2.0+vec2(.2*sin(t),.2*cos(t)),t*.40));
      // Broad angular lighting lobes live on the curved surface. They are not
      // screen-space round spots: the lower light follows an extended arc.
      float warmAngle=-2.23+.26*sin(t*.9)+cursor.x*.30*hover;
      float purpleAngle=.85+.32*sin(t*.7)+cursor.y*.38*hover;
      float wa=atan(sin(a-warmAngle),cos(a-warmAngle));
      float va=atan(sin(a-purpleAngle),cos(a-purpleAngle));
      float warmLobe=exp(-wa*wa/(1.02*(1.+.22*sin(t*.8)+.30*hover)));
      float purpleLobe=exp(-va*va/(.48*(1.+.28*sin(t*.65)+.45*hover)));
      float warp=(flow-.5)*.12;
      float warmDepth=exp(-pow((r-(.94+.04*sin(t*.9)-.06*hover)+warp)/(.23*(1.+.20*sin(t*.6)+.3*hover)),2.));
      float purpleDepth=exp(-pow((r-(.68+.08*sin(t*.8)-.08*hover)-warp)/(.39*(1.+.22*cos(t*.7)+.3*hover)),2.))*smoothstep(.12,.42,r);
      float warm=warmLobe*warmDepth;
      float violet=purpleLobe*purpleDepth;
      float core=exp(-abs(dist)*95.);
      float shoulder=exp(-abs(dist)*17.);
      float halo=exp(-dist*dist*26.);
      float aura=exp(-dist*dist*7.);
      float edgeWarm=warmLobe*exp(-abs(dist)*25.);
      float edgePurple=purpleLobe*exp(-abs(dist)*21.);
      float blueAngle=2.45+.25*sin(t*.65)+cursor.x*.25*hover;
      float blueArc=atan(sin(a-blueAngle),cos(a-blueAngle));
      float blueLobe=exp(-blueArc*blueArc/.75);
      vec3 tint=mix(mix(ambient,key,.5+.5*sin(a+.5)),blue,blueLobe*.65);
      vec3 light=tint*(core*.23+shoulder*.10+halo*.055+aura*.012);
      // Orange hot edge → rose/magenta shoulder → purple interior/atmosphere.
      light+=inside*(mix(key,specB,.18)*warm*.58+fill*pow(warm,3.)*.24);
      light+=inside*specA*violet*(.56+.20*flow);
      light+=inside*ambient*(.011+.018*pow(r,2.))*(.8+.4*flow);
      light+=mix(specB,fill,.62)*core*warmLobe*.88;
      light+=key*edgeWarm*.15+ambient*(halo*.085+aura*.018)*warmLobe;
      light+=specA*(core*.42+halo*.14+aura*.025)*purpleLobe;
      light+=key*halo*purpleLobe*.04;
      light+=blue*blueLobe*(inside*purpleDepth*.26+halo*.12+aura*.025);
      light=mix(light,fill*.98,core*pow(warmLobe,2.5)*.76);
      light=clamp(pow(max(light,vec3(0.)),vec3(1./1.25)),0.,1.);
      float opacity=clamp(max(light.r,max(light.g,light.b)),0.,1.);
      gl_FragColor=vec4(light,opacity);
    }`;
  function shader(type, source) {
    const value = gl.createShader(type);gl.shaderSource(value, source);gl.compileShader(value);
    if (!gl.getShaderParameter(value, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(value));
    return value;
  }
  function initializeGL() {
    gl = canvas.getContext('webgl', {alpha:true, premultipliedAlpha:true, antialias:false, powerPreference:'low-power'});
    if (!gl) throw new Error('WebGL unavailable');
    program = gl.createProgram();
    const vs = shader(gl.VERTEX_SHADER, vertex), fs = shader(gl.FRAGMENT_SHADER, fragment);
    gl.attachShader(program, vs);gl.attachShader(program, fs);gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
    gl.deleteShader(vs);gl.deleteShader(fs);gl.useProgram(program);
    const buffer = gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,3,-1,-1,3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    ['resolution','cssSize','cursor','radius','time','hover'].forEach(name => {locations[name] = gl.getUniformLocation(program, name);});
    canvas.style.opacity = '1';if (fallback) fallback.style.display = 'none';
    canvas.dataset.renderer = 'webgl';
  }
  function initializeFallback(error) {
    gl = null;
    if (!fallback) {
      fallback = document.createElement('canvas');fallback.setAttribute('aria-hidden','true');
      fallback.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';
      host.appendChild(fallback);context2d = fallback.getContext('2d');
    }
    fallback.style.display = 'block';canvas.style.opacity = '0';
    canvas.dataset.renderer = 'canvas2d';
    if (error && error.message !== 'WebGL unavailable') console.warn('Orb renderer fallback:',error);
  }
  function fallbackPath(ctx) {
    ctx.beginPath();
    for (let i = 0; i <= 256; i++) {
      const a = i / 256 * Math.PI * 2;
      const t = (elapsed + 2.4) * .85;
      const pullAngle = Math.atan2(-cursor[1], cursor[0]);
      const arc = Math.atan2(Math.sin(a-pullAngle),Math.cos(a-pullAngle));
      const distance = Math.hypot(cursor[0],cursor[1]);
      const pull = .24*hover*Math.exp(-arc*arc/.32)*Math.min(1,Math.max(0,(distance-.05)/.4));
      const r = radius * (1 + .105 * Math.sin(a * 2 + t * 1.25) + .055 * Math.sin(a * 3 - t * 1.10) + .022 * Math.sin(a + t * .85)+pull);
      const x = width / 2 + Math.cos(a) * r, y = height / 2 + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x,y);else ctx.lineTo(x,y);
    }
    ctx.closePath();
  }
  function glow(ctx,x,y,size,stops) {
    const gradient = ctx.createRadialGradient(x,y,0,x,y,size);
    stops.forEach(stop => gradient.addColorStop(stop[0],stop[1]));
    ctx.fillStyle=gradient;ctx.fillRect(x-size,y-size,size*2,size*2);
  }
  function drawFallback() {
    const ctx = context2d;if (!ctx) return;
    ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,width,height);
    const cx=width/2,cy=height/2;
    const phase=elapsed*(.85/.30);
    glow(ctx,cx,cy,radius*1.60,[[0,'rgba(124,58,237,.01)'],[.42,'rgba(124,58,237,.025)'],[.60,'rgba(124,58,237,.18)'],[.76,'rgba(124,58,237,.07)'],[1,'rgba(124,58,237,0)']]);
    ctx.save();fallbackPath(ctx);ctx.clip();
    glow(ctx,cx+radius*(-.62+.12*Math.sin(phase*.23))+cursor[0]*radius*.18*hover,cy+radius*(-.35+.10*Math.cos(phase*.2))-cursor[1]*radius*.18*hover,radius*.92*(1+.16*Math.sin(phase*.24)+.2*hover),[[0,'rgba(41,71,255,.48)'],[.45,'rgba(72,51,246,.24)'],[1,'rgba(72,51,246,0)']]);
    glow(ctx,cx+radius*(-.65+.15*Math.sin(phase*.36))+cursor[0]*radius*.25*hover,cy+radius*(.82-.12*Math.cos(phase*.27))-cursor[1]*radius*.25*hover,radius*.80*(1+.18*Math.sin(phase*.24)+.22*hover),[[0,'rgba(255,133,0,.90)'],[.18,'rgba(255,153,89,.82)'],[.44,'rgba(255,133,0,.58)'],[.75,'rgba(124,58,237,.12)'],[1,'rgba(124,58,237,0)']]);
    glow(ctx,cx+radius*(.43+.18*Math.sin(phase*.255))+cursor[0]*radius*.28*hover,cy-radius*(.57+.15*Math.cos(phase*.33))-cursor[1]*radius*.28*hover,radius*.80*(1+.22*Math.cos(phase*.21)+.3*hover),[[0,'rgba(124,58,237,.86)'],[.32,'rgba(95,62,205,.61)'],[.7,'rgba(124,58,237,.16)'],[1,'rgba(124,58,237,0)']]);
    ctx.restore();ctx.save();fallbackPath(ctx);
    const rim=ctx.createLinearGradient(cx-radius,cy+radius,cx+radius,cy-radius);
    rim.addColorStop(0,'#ff8500');rim.addColorStop(.15,'#ff9959');rim.addColorStop(.36,'#7c3aed');rim.addColorStop(.62,'#413dff');rim.addColorStop(1,'#7c3aed');
    ctx.strokeStyle=rim;ctx.lineWidth=2;ctx.shadowColor='#7c3aed';ctx.shadowBlur=radius*.18;ctx.stroke();
    ctx.lineWidth=.85;ctx.shadowColor='#ff8500';ctx.shadowBlur=radius*.08;ctx.stroke();ctx.restore();
  }
  function draw() {
    const started=performance.now();
    if (gl) {
      gl.uniform2f(locations.resolution,canvas.width,canvas.height);
      gl.uniform2f(locations.cssSize,width,height);gl.uniform2f(locations.cursor,cursor[0],cursor[1]);
      gl.uniform1f(locations.radius,radius);gl.uniform1f(locations.time,elapsed+2.4);
      gl.uniform1f(locations.hover,hover);
      gl.drawArrays(gl.TRIANGLES,0,3);
    } else drawFallback();
    canvas.dataset.frames=String(++frame);canvas.dataset.ready='true';canvas.dataset.pull=hover.toFixed(3);
    if (performance.now()-started>24) slowFrames++;else slowFrames=Math.max(0,slowFrames-1);
    if (slowFrames>20 && quality>.65) {quality*=.85;slowFrames=0;resize();}
  }
  function resize() {
    const bounds=host.getBoundingClientRect();width=Math.max(1,bounds.width);height=Math.max(1,bounds.height);
    radius=Math.min(380,height*.35,width*.42);ratio=Math.min(devicePixelRatio||1,1.5)*quality;
    canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);
    if(fallback){fallback.width=canvas.width;fallback.height=canvas.height;}
    if(gl) gl.viewport(0,0,canvas.width,canvas.height);
    draw();
  }
  function tick(now) {
    request=0;if(!visible||document.hidden||reduced.matches)return;
    if(now-previous>=16){const gap=now-previous;if(gap>70)slowFrames+=2;const dt=Math.min(gap/1000,.08);previous=now;elapsed+=dt;
      const ease=1-Math.exp(-dt*5);cursor[0]+=(target[0]-cursor[0])*ease;cursor[1]+=(target[1]-cursor[1])*ease;
      hover+=(hoverTarget-hover)*(1-Math.exp(-dt*7));draw();}
    request=requestAnimationFrame(tick);
  }
  function schedule() {
    if(!visible||document.hidden||reduced.matches){cancelAnimationFrame(request);request=0;return;}
    if(!request){previous=performance.now();request=requestAnimationFrame(tick);}
  }
  document.addEventListener('pointermove',event=>{
    if(event.target.closest('a,button,input,textarea,select,[role="button"]')){hoverTarget=0;return;}
    const bounds=host.getBoundingClientRect();
    const x=(event.clientX-bounds.left-width/2)/radius;
    const y=(height/2-event.clientY+bounds.top)/radius;
    const distance=Math.hypot(x,y);
    hoverTarget=reduced.matches?0:Math.max(0,Math.min(1,(1.35-distance)/.25));
    if(hoverTarget>0)target=[x,y];
    else target=[0,0];
  },{passive:true});
  document.addEventListener('pointerleave',()=>{target=[0,0];hoverTarget=0;});
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();initializeFallback();resize();schedule();});
  canvas.addEventListener('webglcontextrestored',()=>{try{initializeGL();}catch(error){initializeFallback(error);}resize();schedule();});
  try{initializeGL();}catch(error){initializeFallback(error);}
  resize();new ResizeObserver(resize).observe(host);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule();}).observe(canvas);
  document.addEventListener('visibilitychange',schedule);
  reduced.addEventListener('change',()=>{cursor=[0,0];hover=hoverTarget=0;draw();schedule();});schedule();
})();
