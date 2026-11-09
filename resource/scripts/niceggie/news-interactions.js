/* ── Tab filtering ─────────────────────────────────────── */
  var TAB_FILTER = {
    'all':            null,
    'industry-news':  ['industry-news'],
    'platform-policy':['platform-policy'],
    'market-trends':  ['market-trends'],
    'compliance':     ['compliance'],
    'amazon-policy':  ['amazon-policy'],
    'ai-automation':  ['ai-automation']
  };

  document.addEventListener('DOMContentLoaded', function () {
    var tabs  = document.querySelectorAll('#newsTabs [data-filter]');
    var cards = document.querySelectorAll('#newsCards .nc-card');

    function applyFilter(filter) {
      cards.forEach(function (card) {
        if (!filter) {
          card.style.display = '';
          return;
        }
        var cats = filter || [];
        var cat  = card.getAttribute('data-category') || '';
        card.style.display = cats.indexOf(cat) !== -1 ? '' : 'none';
      });
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) { t.className = 'tab-inactive'; });
        tab.className = 'tab-active';
        applyFilter(TAB_FILTER[tab.dataset.filter]);
      });
    });

    /* ── Card expand / collapse ──────────────────────────── */
    document.querySelectorAll('.nc-expand-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var card   = btn.closest('.nc-card');
        var detail = card.querySelector('.nc-card-detail');
        var open   = detail.classList.toggle('open');
        btn.classList.toggle('open', open);
        btn.setAttribute('aria-expanded', String(open));
      });
    });
  });
