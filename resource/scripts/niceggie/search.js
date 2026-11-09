(function () {
  var html = `
<div class="search-bar">
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style="flex-shrink:0">
    <circle cx="11" cy="11" r="7" stroke="rgba(203,187,255,0.6)" stroke-width="1.5"/>
    <path d="M16.5 16.5L21 21" stroke="rgba(203,187,255,0.6)" stroke-width="1.5" stroke-linecap="round"/>
  </svg>
  <span class="search-placeholder">Search by tool name or keyword — e.g. margin, shipping, duty, listing</span>
</div>`;

  var s = document.currentScript;
  var tmp = document.createElement('div');
  tmp.innerHTML = html;
  while (tmp.firstChild) {
    s.parentNode.insertBefore(tmp.firstChild, s);
  }
})();
