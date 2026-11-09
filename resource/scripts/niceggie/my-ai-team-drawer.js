/* Right activity drawer adapted from Figma 80:1737, local demo interactions. */
(() => {
  'use strict';
  const root=document.getElementById('team-demo');
  if(!root||root.demoDrawer)return;
  const svg=name=>`<span class="drawer-svg" aria-hidden="true"><img src="../resource/imgs/niceggie/drawer-${name}.svg" alt=""></span>`;
  const avatar='<span class="drawer-card-avatar"><img src="../resource/imgs/niceggie/chat-scott.png" alt=""></span>';
  const backdrop=document.createElement('button');backdrop.type='button';backdrop.className='demo-drawer-backdrop';backdrop.hidden=true;backdrop.setAttribute('aria-label','Close team activity');
  const panel=document.createElement('aside');panel.className='demo-drawer';panel.id='demo-team-activity';panel.hidden=true;panel.setAttribute('role','dialog');panel.setAttribute('aria-label','Team activity');panel.setAttribute('aria-modal','false');
  panel.innerHTML=`
  <button type="button" class="demo-drawer-close" aria-label="Close team activity">×</button>
  <div class="drawer-summary">
    <button type="button" class="drawer-stat" data-jump="all"><strong data-count="all">3</strong><span class="drawer-stat-label">${svg('actions')}Actions today</span></button>
    <button type="button" class="drawer-stat" data-jump="call"><strong data-count="call">1</strong><span class="drawer-stat-label">${svg('needs')}Needs your call</span></button>
    <button type="button" class="drawer-stat" data-jump="review"><strong data-count="review">2</strong><span class="drawer-stat-label">${svg('review')}For your review</span></button>
  </div>
  <section class="drawer-section drawer-call-section" data-section="call">
    <button type="button" class="drawer-section-title" aria-expanded="true" aria-controls="drawer-call-group">${svg('alert')}<span>Needs your call</span><span class="drawer-count" data-call-count>3</span><span class="drawer-group-arrow">${svg('dropdown')}</span></button>
    <div class="drawer-group" id="drawer-call-group"><img class="drawer-timeline" src="../resource/imgs/niceggie/drawer-call-timeline.svg" alt="">
      <article class="drawer-card"><div class="drawer-card-person">${avatar}<div class="drawer-card-content">
        <div class="drawer-card-author">Scott <small>· Just now</small><button type="button" class="drawer-more" data-action="analysis" aria-label="View full competitor analysis">${svg('more')}</button></div>
        <p>Rival <strong>B0CXXX</strong> cut price <strong>8%</strong>, now ¥12 under you.</p>
        <ul><li>With your 18% margin floor, you can match up to ¥9</li><li>Suggest matching ¥7 and watch for 3 days</li></ul>
      </div></div><div class="drawer-actions">
        <button type="button" class="drawer-primary" data-action="match" aria-pressed="false">${svg('yes')}Match $7</button><button type="button" data-action="hold" aria-pressed="false">Hold price</button><button type="button" data-action="analysis" aria-expanded="false">Full analysis</button>
      </div><div class="drawer-detail" data-detail="analysis" hidden>Competitor: B0CXXX<br>Price movement: −8%; ¥12 below your price.<br>Margin floor: 18%; maximum suggested match: ¥9.<br>Recommendation: match ¥7 and review after 3 days.</div><p class="drawer-live-status" role="status" data-decision-status></p></article>
    </div>
  </section>
  <section class="drawer-section drawer-review-section" data-section="review">
    <button type="button" class="drawer-section-title" aria-expanded="true" aria-controls="drawer-review-group">${svg('review')}<span>For your review</span><span class="drawer-count">2</span><span class="drawer-group-arrow">${svg('dropdown')}</span></button>
    <div class="drawer-group" id="drawer-review-group"><img class="drawer-timeline" src="../resource/imgs/niceggie/drawer-review-timeline.svg" alt="">
      <article class="drawer-card"><div class="drawer-card-person">${avatar}<div class="drawer-card-content"><div class="drawer-card-author">Scott <small>· Competitive intel · 18 min ago</small></div><p>🎯 SellerXYZ refreshed the hero image and added a “30-day returns” badge—review velocity doubled in 7 days. They’re pushing harder; consider warranty messaging to match.</p></div></div><div class="drawer-actions"><button type="button" class="drawer-primary" data-action="intel" aria-expanded="false">${svg('view')}View intel</button></div><div class="drawer-detail" data-detail="intel" hidden>SellerXYZ · Listing change report<br>Hero image refreshed; “30-day returns” badge added.<br>Review velocity doubled over 7 days.<br>Next step: review your warranty and returns messaging.</div></article>
      <article class="drawer-card"><div class="drawer-card-person">${avatar}<div class="drawer-card-content"><div class="drawer-card-author">Scott <small>· Competitive intel · 3 hr ago</small></div><p>📋 Weekly rival recap: three price moves, one hero refresh, two new A+ pages. Competition is heating up—worth a look.</p></div></div><div class="drawer-actions"><button type="button" class="drawer-primary" data-action="weekly" aria-expanded="false">${svg('view')}View weekly</button></div><div class="drawer-detail" data-detail="weekly" hidden>Weekly rival recap<br>3 price moves · 1 hero image refresh · 2 new A+ pages.<br>Review the changes against your pricing, imagery, and listing content.</div></article>
    </div>
  </section>`;
  root.append(backdrop,panel);
  const closeButton=panel.querySelector('.demo-drawer-close');
  const activity=root.querySelector('[data-demo="activity"]');
  if(activity)activity.setAttribute('aria-controls','demo-activity-page');
  const narrow=matchMedia('(max-width:1000px)');let previousFocus=null;
  function align(){const top=root.querySelector('.demo-top');if(top){const bounds=root.getBoundingClientRect(),scale=bounds.width/root.offsetWidth||1;const y=(top.getBoundingClientRect().bottom-bounds.top)/scale-root.clientTop;panel.style.top=y+'px';backdrop.style.top=y+'px';}panel.setAttribute('aria-modal',String(narrow.matches));}
  function open({focus=false}={}){previousFocus=document.activeElement;panel.hidden=false;backdrop.hidden=false;root.classList.add('demo-drawer-open');align();if(focus||narrow.matches)closeButton.focus({preventScroll:true});}
  function close({restoreFocus=true}={}){if(panel.hidden)return;panel.hidden=true;backdrop.hidden=true;root.classList.remove('demo-drawer-open');if(restoreFocus&&previousFocus?.isConnected)previousFocus.focus({preventScroll:true});}
  closeButton.addEventListener('click',()=>close());backdrop.addEventListener('click',()=>close());
  panel.addEventListener('click',event=>{
    const sectionButton=event.target.closest('.drawer-section-title');if(sectionButton){const group=panel.querySelector('#'+sectionButton.getAttribute('aria-controls')),expanded=sectionButton.getAttribute('aria-expanded')==='true';sectionButton.setAttribute('aria-expanded',String(!expanded));group.hidden=expanded;return;}
    const jump=event.target.closest('[data-jump]');if(jump){const section=panel.querySelector(`[data-section="${jump.dataset.jump==='all'?'call':jump.dataset.jump}"]`);const button=section.querySelector('.drawer-section-title');button.setAttribute('aria-expanded','true');section.querySelector('.drawer-group').hidden=false;section.scrollIntoView({block:'nearest',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});return;}
    const button=event.target.closest('[data-action]');if(!button)return;
    const action=button.dataset.action;
    if(action==='match'||action==='hold'){
      const card=button.closest('.drawer-card');card.querySelector('[data-action="match"]').setAttribute('aria-pressed',String(action==='match'));card.querySelector('[data-action="hold"]').setAttribute('aria-pressed',String(action==='hold'));
      card.querySelector('[data-decision-status]').textContent=action==='match'?'Saved in this demo: match ¥7 and review in 3 days.':'Saved in this demo: hold the current price.';
      panel.querySelector('[data-count="call"]').textContent='0';panel.querySelector('[data-call-count]').textContent='0';return;
    }
    const detail=panel.querySelector(`[data-detail="${action}"]`);if(detail){detail.hidden=!detail.hidden;panel.querySelectorAll(`[data-action="${action}"]`).forEach(b=>b.setAttribute('aria-expanded',String(!detail.hidden)));}
  });
  root.addEventListener('demo:conversation-start',()=>open());root.addEventListener('demo:conversation-reset',()=>close({restoreFocus:false}));
  document.addEventListener('keydown',event=>{if(panel.hidden)return;if(event.key==='Escape'&&root.contains(document.activeElement)){event.preventDefault();close();}if(event.key==='Tab'&&narrow.matches){const focusable=[...panel.querySelectorAll('button:not([disabled]),a[href]')].filter(el=>el.getClientRects().length),first=focusable[0],last=focusable.at(-1);if(event.shiftKey&&(document.activeElement===first||!panel.contains(document.activeElement))){event.preventDefault();last?.focus();}else if(!event.shiftKey&&(document.activeElement===last||!panel.contains(document.activeElement))){event.preventDefault();first?.focus();}}});
  new ResizeObserver(align).observe(root);narrow.addEventListener('change',align);align();
  root.demoDrawer={open,close,get isOpen(){return !panel.hidden;},element:panel};window.NiceggieDemoDrawer=root.demoDrawer;
})();
