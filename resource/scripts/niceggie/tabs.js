(function () {
  /* ── Tab HTML ─────────────────────────────────────────── */
  var html = `
<div class="category-tabs">
  <div class="tab-active"   data-filter="all"><span>All Categories</span></div>
  <div class="tab-inactive" data-filter="finance"><span>Finance</span></div>
  <div class="tab-inactive" data-filter="logistics"><span>Logistics</span></div>
  <div class="tab-inactive" data-filter="listing"><span>Listing</span></div>
  <div class="tab-inactive" data-filter="compliance"><span>Compliance</span></div>
  <div class="tab-inactive" data-filter="ops"><span>Ops</span></div>
  <div class="tab-inactive" data-filter="text-tools"><span>Text Tools</span></div>
</div>`;

  /* ── Inject before this <script> tag ──────────────────── */
  var s = document.currentScript;
  var tmp = document.createElement('div');
  tmp.innerHTML = html;
  while (tmp.firstChild) {
    s.parentNode.insertBefore(tmp.firstChild, s);
  }

  /* ── Category → card class map ────────────────────────── */
  var FILTER_MAP = {
    'all':        null,
    'finance':    'card-finance',
    'logistics':  'card-logistics',
    'listing':    'card-listing',
    'compliance': 'card-compliance',
    'ops':        'card-ops',
    'text-tools': 'card-text'
  };

  /* ── Init tab switching + card filtering ──────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    var tabs  = document.querySelectorAll('.category-tabs [data-filter]');
    var cards = document.querySelectorAll('.card-grid .tool-card');

    function applyFilter(filterClass) {
      cards.forEach(function (card) {
        card.style.display = (!filterClass || card.classList.contains(filterClass)) ? '' : 'none';
      });
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) { t.className = 'tab-inactive'; });
        tab.className = 'tab-active';
        applyFilter(FILTER_MAP[tab.dataset.filter] || null);
      });
    });
  });
})();
