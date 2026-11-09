(() => {
  'use strict';
  const category = document.getElementById('niceggie-category');
  const panel = document.getElementById('panel-03');
  if (!category || !panel) return;
  const shells = [...panel.querySelectorAll('.niceggie-demo-shell')];
  const shade = document.createElement('div');
  shade.id = 'niceggie-demo-backdrop';
  shade.hidden = true;
  document.body.append(shade);
  let active = null;
  function loadFrame(shell) {
    const frame = shell.querySelector('iframe');
    if (!frame.hasAttribute('src')) frame.src = frame.dataset.src;
  }
  function restore() {
    if (!active) return;
    const {shell, placeholder, overflow, focus} = active;
    const button = shell.querySelector('.niceggie-demo-toggle');
    shell.classList.remove('niceggie-demo-expanded');
    shell.removeAttribute('role');
    shell.removeAttribute('aria-modal');
    button.textContent = '放大演示';
    button.setAttribute('aria-expanded', 'false');
    placeholder.remove();
    shade.hidden = true;
    document.body.classList.remove('niceggie-demo-is-expanded');
    document.body.style.overflow = overflow;
    active = null;
    if (focus && focus.isConnected) focus.focus({preventScroll:true});
  }
  function enlarge(shell) {
    if (active?.shell === shell) { restore(); return; }
    restore();
    loadFrame(shell);
    const placeholder = document.createElement('div');
    placeholder.style.height = shell.getBoundingClientRect().height + 'px';
    active = {shell, placeholder, overflow:document.body.style.overflow, focus:document.activeElement};
    shell.before(placeholder);
    shell.classList.add('niceggie-demo-expanded');
    shell.setAttribute('role', 'dialog');
    shell.setAttribute('aria-modal', 'true');
    const button = shell.querySelector('.niceggie-demo-toggle');
    button.textContent = '还原演示';
    button.setAttribute('aria-expanded', 'true');
    shade.hidden = false;
    document.body.classList.add('niceggie-demo-is-expanded');
    document.body.style.overflow = 'hidden';
    button.focus({preventScroll:true});
  }
  const visibility = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      loadFrame(entry.target);
      visibility.unobserve(entry.target);
    }
  }, {rootMargin:'350px'});
  const sizing = new ResizeObserver(entries => {
    for (const entry of entries) {
      const scale = entry.contentRect.width / 1920;
      entry.target.style.setProperty('--niceggie-demo-scale', scale);
      if (scale > 0) entry.target.style.setProperty('--niceggie-demo-expanded-height', entry.contentRect.height / scale + 'px');
    }
  });
  for (const shell of shells) {
    visibility.observe(shell);
    sizing.observe(shell.querySelector('.niceggie-demo-viewport'));
    shell.querySelector('.niceggie-demo-toggle').addEventListener('click', () => enlarge(shell));
  }
  document.querySelectorAll('.stack-item[data-panel]').forEach(item => {
    item.addEventListener('click', () => {
      restore();
      if (item === category) loadFrame(shells[0]);
    });
  });
  shade.addEventListener('click', restore);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && active) { event.preventDefault(); restore(); }
    if (event.key === 'Tab' && active) {
      const button = active.shell.querySelector('button');
      const frame = active.shell.querySelector('iframe');
      if (event.shiftKey && document.activeElement === button) { event.preventDefault(); frame.focus(); }
      else if (!event.shiftKey && document.activeElement === frame) { event.preventDefault(); button.focus(); }
    }
  });
  window.addEventListener('message', event => {
    if (active && event.source === active.shell.querySelector('iframe').contentWindow && event.data?.type === 'niceggie-demo-restore') restore();
  });
  if (location.hash === '#niceggie' || location.hash === '#panel-03') category.click();
})();
