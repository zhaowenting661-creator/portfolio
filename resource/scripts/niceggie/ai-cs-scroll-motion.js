/* Niceggie AI Customer Service — native scroll, layered single-play entrances. GSAP 3.13 + ScrollTrigger. */
(() => {
  'use strict';
  if (!window.gsap || !window.ScrollTrigger) return;
  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);
  const seen = new WeakSet();
  const media = gsap.matchMedia();
  let finishPending = () => {};

  function init() {
    media.add({ wide: '(min-width: 768px)', narrow: '(max-width: 767px)',
      reduced: '(prefers-reduced-motion: reduce)' }, context => {
      if (context.conditions.reduced) return;
      const compact = context.conditions.narrow;
      const groups = [], active = new Map();
      const add = (elements, y, duration, stagger = 0) => {
        const targets = Array.from(elements).filter(el => !seen.has(el));
        if (targets.length) groups.push({ targets, y: compact ? Math.min(y, 12) : y,
          duration: compact ? Math.min(duration, .6) : duration, stagger,
          layered: targets[0].matches('.trio-card, .capability-card, .step-card') });
      };
      // Animate content only; leave section transforms and canvas effects intact.
      add(document.querySelectorAll('.hero-h1 > div'), 0, .75, .09);
      add(document.querySelectorAll('.hero-subtitle, .hero-cta-wrap'), 14, .65, .1);
      const rows = (selector, y = 34, duration = .85, stagger = .1) => {
        const lines = [];
        document.querySelectorAll(selector).forEach(element => {
          const top = element.getBoundingClientRect().top;
          let line = lines.find(row => Math.abs(row.top - top) < 3);
          if (!line) lines.push(line = {top, elements: []});
          line.elements.push(element);
        });
        lines.forEach(line => add(line.elements, y, duration, stagger));
      };
      const robot = document.querySelector('.char-header');
      const robotText = [...document.querySelectorAll('.char-title, .char-subtitle-row, .char-footer p')];
      if (robot && !seen.has(robot)) groups.push({ targets: [robot, ...robotText], robot: true });
      rows('.char-point', 18, .65, .07);
      document.querySelectorAll('.section-title').forEach(title => add(title.children, 22, .75, .1));
      add(document.querySelectorAll('.stats-bar'), 20, .75);
      add(document.querySelectorAll('.partner-logos'), 18, .75);
      rows('.trio-card');
      add(document.querySelectorAll('.ticket-title'), 18, .7);
      // Fade the outer marquee only; its tracks retain their own transforms.
      add(document.querySelectorAll('.ticket-box'), 0, .8);
      rows('.capability-card', 40, .9, .1);
      rows('.metric-item', 20, .75, .09);
      rows('.step-card', 32, .85, .12);
      add(document.querySelectorAll('.final-title, .final-subtitle'), 18, .75, .1);
      add(document.querySelectorAll('.final-cta .btn-hero, .final-note'), 12, .65, .1);
      add(document.querySelectorAll('footer'), 0, .45);
      groups.sort((a, b) => a.targets[0].getBoundingClientRect().top - b.targets[0].getBoundingClientRect().top);

      const finish = group => {
        if (group.done) return;
        group.tween?.progress(1);
        group.trigger?.kill();
        group.done = true;
        group.targets.forEach(el => { seen.add(el); active.delete(el); });
      };
      try {
        // The robot keeps its spring entrance even when visible on initial load.
        // Other initially visible content stays readable immediately.
        const positions = groups.map(group => group.targets[0].getBoundingClientRect());
        groups.forEach((group, index) => {
          const bounds = positions[index];
          if (bounds.bottom <= 0 || (!group.robot &&
            (group.targets.some(el => el.closest('.hero, .hero-area, .nc-hero')) || bounds.top < innerHeight))) {
            group.targets.forEach(el => seen.add(el));
            group.done = true;
            return;
          }
          if (group.robot) {
            const [icon, ...text] = group.targets;
            gsap.set(icon, { opacity: 0, scale: .42, y: compact ? 12 : 22,
              transformOrigin: '50% 70%' });
            gsap.set(text, { opacity: 0, y: compact ? 18 : 28 });
            group.tween = gsap.timeline({ paused: true,
              onStart: () => gsap.set(group.targets, { willChange: 'opacity,transform' }),
              onComplete: () => {
                group.done = true;
                group.targets.forEach(el => { seen.add(el); active.delete(el); });
              }
            });
            group.tween.to(icon, { opacity: 1, duration: .35, ease: 'power1.out' }, 0)
              .to(icon, { scale: 1, y: 0, duration: compact ? .9 : 1.05,
                ease: 'back.out(1.65)', clearProps: 'opacity,transform,transformOrigin,willChange' }, 0)
              .to(text, { opacity: 1, y: 0, duration: .7, stagger: .11,
                ease: 'power3.out', clearProps: 'opacity,transform,willChange' }, .34);
            group.targets.forEach(el => active.set(el, group));
            // Play on page entry as soon as the illustration is ready, independent of scrolling.
            const playRobot = () => { if (!group.done) group.tween.play(); };
            if (icon.complete) playRobot();
            else {
              icon.addEventListener('load', playRobot, { once: true });
              icon.addEventListener('error', () => finish(group), { once: true });
            }
            return;
          }
          const props = group.y ? 'opacity,transform,willChange' : 'opacity,willChange';
          const stagger = Math.min(group.stagger, (group.layered ? .33 : .18) /
            Math.max(1, group.targets.length - 1));
          const illustrations = group.layered
            ? group.targets.map(card => card.querySelector('.trio-icon')) : [];
          gsap.set(group.targets, {
            opacity: 0,
            ...(group.y ? { y: i => group.y + (group.layered && !compact ? [0, 14, 6, 20][i % 4] : 0) } : {}),
            ...(group.layered ? { scale: compact ? .99 : .975,
              rotation: i => compact ? 0 : (i % 2 ? .45 : -.45),
              transformOrigin: '50% 90%' } : {})
          });
          illustrations.filter(Boolean).forEach(image => {
            // GSAP preserves the illustration's existing CSS translateX.
            gsap.set(image, { y: compact ? 10 : 22, scale: .96, opacity: 0 });
          });
          group.tween = gsap.timeline({ paused: true,
            onStart: () => gsap.set(group.targets, { willChange: group.y ? 'opacity,transform' : 'opacity' }),
            onComplete: () => {
              group.done = true;
              group.targets.forEach(el => { seen.add(el); active.delete(el); });
            }
          });
          group.tween.to(group.targets, {
            opacity: 1, ...(group.y ? { y: 0 } : {}),
            ...(group.layered ? { scale: 1, rotation: 0 } : {}),
            duration: group.duration, ease: group.layered ? 'power3.out' : 'power2.out',
            stagger, clearProps: props + (group.layered ? ',transformOrigin' : '')
          }, 0);
          illustrations.forEach((image, i) => {
            if (image) group.tween.to(image, {
              y: 0, scale: 1, opacity: 1, duration: compact ? .55 : .8,
              ease: 'power2.out', clearProps: 'transform,opacity'
            }, i * stagger + .14);
          });
          group.targets.forEach(el => active.set(el, group));
          group.trigger = ScrollTrigger.create({
            trigger: group.targets[0], start: 'clamp(top 90%)', end: 'bottom top', once: true,
            onEnter: () => { if (!group.done) group.tween.play(); },
            onLeave: () => finish(group)
          });
        });
      } catch (error) {
        groups.forEach(group => {
          group.trigger?.kill(); group.tween?.kill();
          gsap.set(group.targets.flatMap(el => [...el.querySelectorAll('.trio-icon')]), { clearProps: 'transform,opacity' });
          gsap.set(group.targets, { clearProps: 'opacity,transform,willChange' });
        });
        console.warn('Home entrances skipped:', error);
      }
      const onFocus = event => {
        for (const [element, group] of active) {
          if (element.contains(event.target)) finish(group);
        }
      };
      finishPending = () => groups.forEach(finish);
      document.addEventListener('focusin', onFocus);
      return () => { document.removeEventListener('focusin', onFocus); finishPending = () => {}; };
    });

    let refreshTimer;
    const refresh = () => {
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 80);
    };
    document.querySelectorAll('img').forEach(img => {
      if (!img.complete) {
        img.addEventListener('load', refresh, { once: true });
        img.addEventListener('error', refresh, { once: true });
      }
    });
    document.fonts?.ready.then(refresh);
    window.addEventListener('load', refresh, { once: true });
    // No layout-changing accordion on this page.
    // Finish transient states before entering the back/forward cache.
    window.addEventListener('pagehide', () => finishPending());
    window.addEventListener('pageshow', refresh);
    ScrollTrigger.refresh();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
