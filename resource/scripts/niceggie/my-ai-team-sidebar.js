/* Figma 80:3496 / 80:3600, adapted to the embedded demo's 0.7375 scale. */
(()=>{
 'use strict';
 const root=document.getElementById('team-demo'),layout=root?.querySelector('.demo-layout'),side=root?.querySelector('.demo-sidebar');
 if(!side)return;
 side.classList.add('demo-sidebar-figma');side.id='demo-sidebar';
 const activity=side.querySelector('.demo-activity');
 const members=[...side.querySelectorAll('.demo-member')];
 const promo=document.createElement('div');promo.className='sidebar-promo';
 promo.innerHTML='<div class="sidebar-promo-panel"><img class="sidebar-promo-art" src="../resource/imgs/niceggie/sidebar-promo.svg" alt=""><strong>My AI team</strong><small>Scott is live · Mira, Leo, and Max<br>coming soon</small><b>FREE BETA</b></div><button class="sidebar-team-icon" type="button" aria-label="My AI team"><span><img src="../resource/imgs/niceggie/sidebar-team.svg" alt=""></span></button>';
 activity.innerHTML='<span class="sidebar-activity-icon"><img src="../resource/imgs/niceggie/sidebar-activity.svg" alt=""></span><span class="sidebar-activity-copy"><strong>Team activity</strong><small>Reports, handoffs &amp; team feed</small></span>';
 activity.setAttribute('aria-label','Team activity');activity.title='Team activity';
 const recruited=document.createElement('div');recruited.className='sidebar-recruited';
 recruited.innerHTML='<div class="sidebar-group-title">RECRUITED</div>';
 const upcoming=document.createElement('div');upcoming.className='sidebar-upcoming';
 upcoming.innerHTML='<div class="sidebar-group-title">TO RECRUIT</div>';
 members.forEach((button,i)=>{
  const name=['Scott','Mira','Leo','Max'][i];
  button.classList.add('sidebar-person');button.title=name+(i?' · Coming soon':' · On duty');
  button.innerHTML='<span class="sidebar-avatar sidebar-avatar-'+name.toLowerCase()+'"><img src="../resource/imgs/niceggie/sidebar-'+name.toLowerCase()+'.png" alt=""></span><span class="sidebar-person-copy"><span class="sidebar-person-name"><strong>'+name+'</strong><b class="'+(i?'demo-soon':'demo-status')+'">'+(i?'Coming soon':'On duty')+'</b></span><small>'+(i?'Reviews on watch':'Competitive intel')+'</small></span>';
  (i?upcoming:recruited).append(button);
 });
 const toggle=document.createElement('button');toggle.type='button';toggle.className='sidebar-toggle';toggle.dataset.sidebarToggle='';
 toggle.innerHTML='<span class="sidebar-toggle-icon"><img src="../resource/imgs/niceggie/sidebar-collapse.svg" alt=""></span><span class="sidebar-toggle-copy">Collapse</span>';
 toggle.setAttribute('aria-controls',side.id);
 side.replaceChildren(promo,activity,recruited,upcoming,toggle);
 function setCollapsed(value){
  layout.classList.toggle('collapsed',Boolean(value));
  toggle.setAttribute('aria-expanded',String(!value));toggle.setAttribute('aria-label',value?'Expand sidebar':'Collapse sidebar');toggle.title=value?'Expand sidebar':'Collapse sidebar';
  root.dispatchEvent(new CustomEvent('demo:sidebar-change',{detail:{collapsed:Boolean(value)}}));
 }
 toggle.addEventListener('click',()=>setCollapsed(!layout.classList.contains('collapsed')));
 promo.querySelector('button').addEventListener('click',()=>setCollapsed(false));
 root.demoSidebar={setCollapsed};
 setCollapsed(matchMedia('(max-width:700px)').matches);
})();
