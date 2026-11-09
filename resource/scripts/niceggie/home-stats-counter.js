/* Count once when Home stats enter the viewport; exact labels remain accessible. */
(() => {
  'use strict';
  if (!window.gsap || !window.ScrollTrigger) return;
  const bar = document.querySelector('.hero .stats-bar');
  if (!bar) return;
  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);
  const records = [...bar.querySelectorAll('.stat-num')].map(element => {
    const original = element.textContent.trim();
    const match = original.match(/^(\D*?)(\d+(?:\.\d+)?)(.*)$/);
    if (!match) return null;
    const visual = document.createElement('span');
    visual.setAttribute('aria-hidden', 'true');
    visual.textContent = original;
    visual.style.fontVariantNumeric = 'tabular-nums';
    const accessible = document.createElement('span');
    accessible.textContent = original;
    accessible.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;';
    element.replaceChildren(visual, accessible);
    return { visual, original, prefix: match[1], target: Number(match[2]), suffix: match[3],
      decimals: (match[2].split('.')[1] || '').length, value: 0 };
  }).filter(Boolean);
  let played = false;
  const media = gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)', () => {
    if (played || bar.getBoundingClientRect().bottom <= 0) return;
    const render = record => {
      record.visual.textContent = record.prefix + record.value.toFixed(record.decimals) + record.suffix;
    };
    records.forEach(render);
    const timeline = gsap.timeline({ paused: true,
      onStart: () => { played = true; },
      onComplete: () => records.forEach(record => { record.visual.textContent = record.original; })
    });
    records.filter(record => record.target > 0).forEach((record, i) => {
      timeline.to(record, { value: record.target, duration: 1.65, ease: 'power2.out',
        onUpdate: () => render(record) }, i * .09);
    });
    const trigger = ScrollTrigger.create({ trigger: bar, start: 'clamp(top 82%)',
      end: 'bottom top', once: true,
      onEnter: () => timeline.play(), onLeave: () => timeline.progress(1)
    });
    // A visible first-screen counter starts on load, without requiring a scroll event.
    const bounds = bar.getBoundingClientRect();
    if (bounds.top < innerHeight && bounds.bottom > 0) timeline.play();
    const finish = () => timeline.progress(1);
    window.addEventListener('pagehide', finish);
    return () => {
      trigger.kill(); timeline.kill();
      records.forEach(record => { record.visual.textContent = record.original; });
      window.removeEventListener('pagehide', finish);
    };
  });
})();
