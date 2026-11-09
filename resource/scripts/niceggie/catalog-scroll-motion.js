/* Niceggie Free Tools + News — native scroll, layered single-play entrances. GSAP 3.13 + ScrollTrigger. */
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
          layered: targets[0].matches('.tool-card') });
      };
      // Keep the existing elastic title geometry and decorative neon untouched.
      add(document.querySelectorAll('.hero-h1-line1, .hero-h1-line2, .nc-hero-title'), 0, .75, .09);
      add(document.querySelectorAll('.hero-subtitle-ft, .hero-cta, .nc-hero-subtitle'), 14, .65, .1);
      add(document.querySelectorAll('.illus-img-container img'), 0, .9);
      add(document.querySelectorAll('.feature-badge'), 18, .75, .07);
      add(document.querySelectorAll('.tools-title-block > *'), 20, .75, .1);
      add(document.querySelectorAll('.tools-section > .search-bar, .tools-section > .category-tabs, .nc-controls'), 14, .65, .08);
      const rows = [];
      document.querySelectorAll('.card-grid > .tool-card, #newsCards > .nc-card').forEach(card => {
        const top = card.getBoundingClientRect().top;
        let row = rows.find(row => Math.abs(row.top - top) < 3);
        if (!row) rows.push(row = {top, cards: []});
        row.cards.push(card);
      });
      rows.forEach(row => add(row.cards, row.cards[0].matches('.nc-card') ? 26 : 36, .85, .1));
      add(document.querySelectorAll('.nc-flash'), 22, .8);
      add(document.querySelectorAll('.nc-subscribe'), 26, .85);
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
        // Hero and all initially visible content stay readable immediately; only below-fold content animates.
        const positions = groups.map(group => group.targets[0].getBoundingClientRect());
        groups.forEach((group, index) => {
          const bounds = positions[index];
          if (group.targets.some(el => el.closest('.hero, .hero-area, .nc-hero')) || bounds.top < innerHeight) {
            group.targets.forEach(el => seen.add(el));
            group.done = true;
            return;
          }
          const props = group.y ? 'opacity,transform,willChange' : 'opacity,willChange';
          const stagger = Math.min(group.stagger, (group.layered ? .33 : .18) /
            Math.max(1, group.targets.length - 1));
          const illustrations = group.layered
            ? group.targets.map(card => card.querySelector('.card-ai-img')) : [];
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
          gsap.set(group.targets.flatMap(el => [...el.querySelectorAll('.card-ai-img')]), { clearProps: 'transform,opacity' });
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
      const onInteraction = event => {
        if (event.target.closest('.category-tabs [data-filter]')) {
          // Filtering changes card positions. Settle pending cards before recalculation
          // so newly visible results never retain an offscreen entrance state.
          groups.filter(group => group.targets.some(el => el.matches('.tool-card, .nc-card')))
            .forEach(finish);
        }
        if (event.target.closest('.category-tabs, .nc-expand-btn')) {
          requestAnimationFrame(() => ScrollTrigger.refresh());
        }
      };
      document.addEventListener('click', onInteraction);
      return () => { document.removeEventListener('click', onInteraction); document.removeEventListener('focusin', onFocus); finishPending = () => {}; };
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
    // Category filtering and news expansion refresh within the active context.
    // Finish transient states before entering the back/forward cache.
    window.addEventListener('pagehide', () => finishPending());
    window.addEventListener('pageshow', refresh);
    ScrollTrigger.refresh();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
