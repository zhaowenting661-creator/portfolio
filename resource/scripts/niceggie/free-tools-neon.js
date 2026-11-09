/* Page-local attachment: the lamp follows the existing shared navigation edge. */
(() => {
  'use strict';
  const scene = document.querySelector('.free-neon-scene');
  const nav = document.querySelector('nav');
  if (!scene || !nav) return;
  // A decorative child follows the sticky nav without changing its shared component.
  nav.append(scene.querySelector('.free-neon-tube'));
  const tube = nav.querySelector('.free-neon-tube');
  const toolsTitle = document.querySelector('.tools-title-block');
  const rail = document.createElement('div');
  rail.className = 'free-neon-rail';
  rail.setAttribute('aria-hidden', 'true');
  nav.insertBefore(rail, tube);
  let started = performance.now();
  document.body.addEventListener('click', event => {
    if (event.target.closest('a,button,input,select,textarea,[role="button"]')) return;
    if (Number(document.body.style.getPropertyValue('--neon-visibility') || 1) === 0) return;
    if (event.clientY + window.scrollY > scene.offsetHeight) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (performance.now() - started < 3500) {
      tube.animate([{filter:'brightness(1)'},{filter:'brightness(.45)'},{filter:'brightness(1)'}],{duration:160});
      return;
    }
    started = performance.now();
    // Include the scene pseudo-element and nav tint so all halos share the reveal timeline.
    const animations = new Set([...tube.getAnimations(), ...scene.getAnimations({subtree:true}), ...nav.getAnimations()]);
    for (const animation of animations) {animation.currentTime = 0;animation.play();}
  });
  let pending = 0;
  function align() {
    pending = 0;
    const rect = nav.getBoundingClientRect();
    const width = Math.max(0, Math.min(rect.width * .9, rect.width - 48));
    scene.style.setProperty('--nav-left', `${rect.left}px`);
    scene.style.setProperty('--nav-top', `${rect.top + window.scrollY}px`);
    scene.style.setProperty('--nav-width', `${rect.width}px`);
    scene.style.setProperty('--nav-height', `${rect.height}px`);
    scene.style.setProperty('--lamp-x', `${rect.left + rect.width / 2}px`);
    scene.style.setProperty('--lamp-y', `${rect.bottom + window.scrollY}px`);
    scene.style.setProperty('--lamp-width', `${width}px`);
    if (toolsTitle) {
      const fadeEnd = Math.max(rect.bottom + 40, window.innerHeight * .45);
      const visibility = Math.max(0, Math.min(1, (toolsTitle.getBoundingClientRect().top - fadeEnd) / 100));
      document.body.style.setProperty('--neon-visibility', visibility.toFixed(3));
    }
  }
  function schedule() {if (!pending) pending = requestAnimationFrame(align);}
  new ResizeObserver(schedule).observe(nav);
  window.addEventListener('scroll', align, {passive:true});
  window.addEventListener('resize', schedule, {passive:true});
  // A subtle, local response of the downward light to the pointer.
  scene.parentElement.addEventListener('pointermove', event => {
    const rect = nav.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    scene.querySelector('.free-neon-spill').style.backgroundPosition = `${(ratio - .5) * 12}px 0`;
  }, {passive:true});
  align();
})();
