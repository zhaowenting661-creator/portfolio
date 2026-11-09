(function (global) {
  /* ── Tag type config ──────────────────────────────────────
     Each entry maps the internal type key to:
       cssClass  — the .tag-* class in free-tools.css
       cardClass — the .card-* class it corresponds to
       label     — default display label
  ──────────────────────────────────────────────────────── */
  var TAG_CONFIG = {
    finance:    { cssClass: 'tag-finance',    cardClass: 'card-finance',    label: 'Finance' },
    logistics:  { cssClass: 'tag-logistics',  cardClass: 'card-logistics',  label: 'Logistics' },
    listing:    { cssClass: 'tag-listing',    cardClass: 'card-listing',    label: 'Listing' },
    compliance: { cssClass: 'tag-compliance', cardClass: 'card-compliance', label: 'Compliance' },
    ops:        { cssClass: 'tag-ops',        cardClass: 'card-ops',        label: 'Operations' },
    'text-tools': { cssClass: 'tag-text',     cardClass: 'card-text',       label: 'Text Tools' }
  };

  /* ── createTag(type, label?) → HTML string ────────────────
     Usage:
       CardTags.createTag('finance')           → <span class="card-tag-ft tag-finance">Finance</span>
       CardTags.createTag('logistics', 'Ship') → <span class="card-tag-ft tag-logistics">Ship</span>
  ──────────────────────────────────────────────────────── */
  function createTag(type, label) {
    var cfg = TAG_CONFIG[type];
    if (!cfg) { console.warn('[CardTags] Unknown type:', type); return ''; }
    var text = label !== undefined ? label : cfg.label;
    return '<span class="card-tag-ft ' + cfg.cssClass + '">' + text + '</span>';
  }

  /* ── getConfig(type) → { cssClass, cardClass, label } ──── */
  function getConfig(type) {
    return TAG_CONFIG[type] || null;
  }

  /* ── types() → string[] ─────────────────────────────────── */
  function types() {
    return Object.keys(TAG_CONFIG);
  }

  global.CardTags = { createTag: createTag, getConfig: getConfig, types: types };
})(window);
