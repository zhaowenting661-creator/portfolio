/* Figma 80:6496. Shared upcoming-agent view with capability-specific content. */
(() => {
  'use strict';
  const root=document.getElementById('team-demo');if(!root)return;
  const main=root.querySelector('.demo-main');
  const agents={
    mira:{name:'Mira',role:'Reviews & sentiment · Reviews on watch',shortRole:'Reviews on watch',
      lead:'Bad reviews with no playbook?',
      description:'I watch the wall, flag what matters, draft replies, and tell you if it’s a product issue—copy, paste, send.',
      example:'“Three negatives this week all cite ‘damaged packaging’—likely systemic. Draft replies are ready; for premium orders consider proactive spare parts (~¥12/ea), far cheaper than rank drag. Want to review wording?”',
      outputs:['Root-cause reads','Reply drafts','Weekly buyer recap','Product fix hints'],
      availability:'Mira is coming soon. Turn buyer feedback into clear next steps with review insights, reply drafts, and product fix suggestions.'},
    leo:{name:'Leo',role:'Listing optimizer · Optimize anytime + scheduled rechecks',shortRole:'Listing optimizer',
      lead:'Make every listing work harder.',
      description:'Send your product links—I benchmark rivals, find real search terms, and rewrite titles, bullets, and descriptions to help shoppers choose you.',
      example:'“SKU-A192 is missing ‘wireless earbuds noise cancelling’—a phrase used by your top five rivals. I drafted a clearer title and five benefit-led bullets, with keyword placement notes. Want to review the changes?”',
      outputs:['Title & keyword pass','Bullet rewrites','Rival listing compare','A+ content ideas'],
      availability:'Leo is coming soon. Build stronger product pages with keyword insights, competitor comparisons, and clearer listing copy.'},
    max:{name:'Max',role:'Profit analyst · On-demand checks + monthly recap',shortRole:'Profit analyst',
      lead:'Revenue looks good. What’s your real profit?',
      description:'Share your prices, costs, fees, and ad spend—I calculate margin per SKU, find where money leaks, and show what to change.',
      example:'“SKU-Y generated ¥42,000 in revenue, but after product costs, ads, fees, returns, and storage, profit is only ¥3,100 (7.4%). Ads are the biggest drag. I’ve outlined three ways to improve margin—want to compare them?”',
      outputs:['Per-SKU profit truth','Where money leaks','Ad efficiency read','Monthly P&L summary'],
      availability:'Max is coming soon. Understand what each SKU earns with margin breakdowns, ad efficiency checks, and monthly profit recaps.'}
  };
  function el(tag,className,text){const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;}
  function image(src,alt=''){const img=el('img');img.src='../resource/imgs/niceggie/'+src;img.alt=alt;return img;}
  const view=el('section','demo-recruit-view');view.id='demo-recruit-page';view.hidden=true;view.setAttribute('aria-labelledby','demo-recruit-name');
  const header=el('header','recruit-header'),personal=el('div','recruit-personal'),avatar=el('div','recruit-avatar');
  const portrait=image('sidebar-mira.png','Mira');avatar.append(portrait);
  const identity=el('div','recruit-identity'),name=el('h2','recruit-name');name.id='demo-recruit-name';
  const status=el('span','recruit-status');status.append(image('recruit-status-dot.svg'),document.createTextNode('Coming soon'));
  identity.append(name,status);const role=el('p','recruit-role');personal.append(avatar,identity,role);
  const pitch=el('div','recruit-pitch'),heading=el('h3','recruit-heading'),lead=el('span'),description=el('span');heading.append(lead,description);
  const recruit=el('button','recruit-button');recruit.type='button';
  pitch.append(heading,recruit,el('p','recruit-availability','Coming soon — stay tuned'));header.append(personal,pitch);
  const message=el('section','recruit-message'),messageTitle=el('h3','recruit-message-title'),bulb=el('span','recruit-bulb');bulb.append(image('recruit-lightbulb.svg'));
  messageTitle.append(bulb,el('span','','Messages look like this'));const example=el('p','recruit-example');message.append(messageTitle,example);
  const outputHeading=el('div','recruit-output-heading');outputHeading.append(image('recruit-divider-left.png'),el('h3','','KEY OUTPUTS'),image('recruit-divider-right.png'));
  const outputs=el('ul','recruit-outputs');view.append(header,message,outputHeading,outputs);main.append(view);
  let current=null;
  function select(key){root.querySelectorAll('.sidebar-person').forEach((button,i)=>{const selected=['scott','mira','leo','max'][i]===key;button.classList.toggle('active',selected);if(selected)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');});const activity=root.querySelector('.demo-activity');activity.classList.remove('active');activity.removeAttribute('aria-current');}
  function hide(){view.hidden=true;root.classList.remove('recruit-page-active');current=null;}
  function show(key){const agent=agents[key];if(!agent)return false;
    root.demoActivity?.hide();root.demoDrawer?.close({restoreFocus:false});root.classList.remove('chat-active');
    current=key;view.dataset.agent=key;name.textContent=agent.name;role.textContent=agent.role;portrait.src='../resource/imgs/niceggie/sidebar-'+key+'.png';portrait.alt=agent.name;
    lead.textContent=agent.lead;description.textContent=agent.description;example.textContent=agent.example;recruit.textContent='Recruit '+agent.name;
    outputs.replaceChildren(...agent.outputs.map(text=>{const item=el('li'),dot=el('span','recruit-output-dot');dot.append(image('recruit-output-dot.svg'));item.append(dot,el('span','',text));return item;}));
    root.querySelector('.demo-dialog')?.close();select(key);view.hidden=false;root.classList.add('recruit-page-active');main.scrollTop=0;
    if(matchMedia('(max-width:700px)').matches)root.demoSidebar.setCollapsed(true);
    root.dispatchEvent(new CustomEvent('demo:view-change',{detail:{view:'recruit',agent:key}}));return true;
  }
  root.querySelectorAll('.sidebar-person').forEach((button,i)=>{const key=['scott','mira','leo','max'][i];button.dataset.agent=key;
    if(agents[key])button.querySelector('.sidebar-person-copy small').textContent=agents[key].shortRole;
    button.setAttribute('aria-controls',i?view.id:'demo-message');
  });
  root.addEventListener('click',event=>{const button=event.target.closest('.sidebar-person');if(!button)return;event.preventDefault();event.stopImmediatePropagation();
    if(button.dataset.agent==='scott'){hide();root.demoActivity?.hide();select('scott');if(matchMedia('(max-width:700px)').matches)root.demoSidebar.setCollapsed(true);root.demoChat.resume();}
    else show(button.dataset.agent);
  },true);
  recruit.addEventListener('click',()=>{const agent=agents[current],dialog=root.querySelector('.demo-dialog');dialog.querySelector('h3').textContent=agent.name+' · Coming soon';dialog.querySelector('.demo-dialog-content').textContent=agent.availability;dialog.showModal();});
  root.addEventListener('demo:conversation-start',()=>{hide();root.demoActivity?.hide();select('scott');});
  root.addEventListener('demo:conversation-reset',()=>{hide();root.demoActivity?.hide();select('scott');});
  root.demoRecruit={show,hide,get current(){return current;},element:view};
})();
