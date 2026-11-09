(() => {
  'use strict';
  const arrows = [...document.querySelectorAll('.page-ai-cs .apply-arrow')];
  if (!arrows.length || !('IntersectionObserver' in window)) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting || entry.intersectionRatio < .5) return;
      entry.target.classList.add('ai-arrow-visible');
      observer.unobserve(entry.target);
    });
  }, {threshold: .5});
  arrows.forEach(arrow => {
    arrow.classList.add('ai-arrow-pending');
    observer.observe(arrow);
  });
  reduced.addEventListener('change', () => {
    if (!reduced.matches) return;
    observer.disconnect();
    arrows.forEach(arrow => arrow.classList.remove('ai-arrow-pending', 'ai-arrow-visible'));
  });
})();
