(function () {
  /* ── Shared nav HTML ──────────────────────────────────── */
  var html = `
<div class="top-banner">
  <span class="beta-tag">✦ Beta</span>
  <span class="banner-text">Limited time beta · Free registration .</span>
  <span class="banner-link">Sign up free →</span>
</div>

<nav>
  <div class="nav-logo">
    <a href="index.html" style="display:flex;align-items:center;gap:8px;text-decoration:none;flex-shrink:0;">
      <div class="nav-logo-icon">N</div>
      <span class="nav-logo-name">Niceggie</span>
    </a>
    <button class="nav-hamburger" id="navHamburger" aria-label="Open menu" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
  </div>
  <ul class="nav-links">
    <li><a href="free-tools.html">Free tools</a></li>
    <li><a href="news.html">News</a></li>
    <li><a href="news.html">Blog</a></li>
    <li><a href="my-ai-team.html" data-nav="my-ai-team">My AI Team</a></li>
    <li><a href="ai-customer-service.html">AI Customer Service</a></li>
    <li><a href="#team-demo" data-agent="presales">AI Presales Agent</a></li>
    <li><a href="#team-demo" data-agent="listing">AI Listing</a></li>
    <li><a href="#team-demo" data-agent="outreach">Creator Outreach</a></li>
    <li class="nav-divider" aria-hidden="true"></li>
    <li><a href="mailto:support@niceggie.com">Help Center</a></li>
    <li class="nav-mobile-btns">
      <button class="btn-outline">Sign in</button>
      <button class="btn-primary-sm">Get started</button>
    </li>
  </ul>
  <div class="nav-actions">
    <button class="lang-btn" type="button" aria-label="Language: English">EN <img src="../resource/imgs/niceggie/team-language.svg" alt="" width="14" height="14" /></button>
    <button class="btn-outline">Sign in</button>
    <button class="btn-primary-sm">Get started</button>
  </div>
</nav>`;

  /* ── Inject HTML before this <script> tag ─────────────── */
  var s = document.currentScript;
  var tmp = document.createElement('div');
  tmp.innerHTML = html;
  while (tmp.firstChild) {
    s.parentNode.insertBefore(tmp.firstChild, s);
  }

  /* ── Set active nav link based on current filename ─────── */
  function setActiveLink() {
    var filename = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
    var pageMap = { 'index.html': 'home', 'free-tools.html': 'free-tools', 'news.html': 'news', 'ai-customer-service.html': 'ai-customer-service', 'my-ai-team.html': 'my-ai-team' };
    var key = pageMap[filename];
    if (key) {
      var link = document.querySelector('.nav-links a[data-nav="' + key + '"]');
      if (link) link.classList.add('active');
    }
  }

  /* ── Hamburger toggle ──────────────────────────────────── */
  function initHamburger() {
    var hamburger = document.getElementById('navHamburger');
    var navLinks  = document.querySelector('.nav-links');
    if (!hamburger || !navLinks) return;
    hamburger.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      hamburger.classList.toggle('active', open);
      hamburger.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('nav')) {
        navLinks.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setActiveLink();
    initHamburger();
  });

  // All five entry pages share the same progressive title interaction.
  var page = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  if (/^(index|ai-customer-service|my-ai-team|free-tools|news)\.html$/.test(page) &&
      !document.getElementById('niceggie-elastic-title-style')) {
    var titleStyle = document.createElement('link');
    titleStyle.id = 'niceggie-elastic-title-style';
    titleStyle.rel = 'stylesheet';
    titleStyle.href = new URL('../../css/niceggie/hero-elastic-title.css', s.src).href;
    titleStyle.addEventListener('load', function () {
      var titleScript = document.createElement('script');
      titleScript.id = 'niceggie-elastic-title-script';
      titleScript.src = new URL('hero-elastic-title.js', s.src).href;
      document.head.appendChild(titleScript);
    }, {once:true});
    document.head.appendChild(titleStyle);
  }
})();
