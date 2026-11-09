(() => {
  if (parent === window) return;
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') parent.postMessage({type:'niceggie-demo-restore'}, '*');
  });
})();
