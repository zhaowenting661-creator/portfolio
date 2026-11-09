(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const numbers = [...document.querySelectorAll('.metric-row .metric-num')].map(element => {
    const text = element.textContent.trim();
    const match = text.match(/^(\D*)(\d+(?:\.\d+)?)(.*)$/);
    return match ? { element, text, prefix: match[1], target: Number(match[2]), suffix: match[3],
      digits: (match[2].split('.')[1] || '').length, started: false, request: 0 } : null;
  }).filter(Boolean);
  if (!numbers.length) return;
  const paint = (number, progress) => {
    number.element.textContent = progress === 1 ? number.text :
      `${number.prefix}${(number.target * progress).toFixed(number.digits)}${number.suffix}`;
  };
  if (reduced.matches || !('IntersectionObserver' in window)) return;
  numbers.forEach(number => paint(number, 0));
  function start(number) {
    if (number.started) return;
    number.started = true;
    const began = performance.now();
    function tick(now) {
      const progress = Math.min(1, (now - began) / 1400);
      paint(number, 1 - Math.pow(1 - progress, 3));
      number.request = progress < 1 ? requestAnimationFrame(tick) : 0;
    }
    number.request = requestAnimationFrame(tick);
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      // Observe the value itself, not the much taller section or row.
      if (!entry.isIntersecting || entry.intersectionRatio < 1) return;
      const number = numbers.find(item => item.element === entry.target);
      if (number) start(number);
      observer.unobserve(entry.target);
    });
  }, { threshold: 1 });
  numbers.forEach(number => observer.observe(number.element));
  reduced.addEventListener('change', () => {
    if (!reduced.matches) return;
    observer.disconnect();
    numbers.forEach(number => {
      cancelAnimationFrame(number.request);
      number.started = true;
      paint(number, 1);
    });
  });
})();
