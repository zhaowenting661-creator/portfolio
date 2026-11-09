/* Native conversation state for the embedded My AI Team Figma demo. */
(() => {
 'use strict';
 const root=document.getElementById('team-demo');if(!root)return;
 const main=root.querySelector('.demo-main'),form=root.querySelector('.demo-composer'),input=form.querySelector('textarea'),feed=root.querySelector('.demo-conversation');
 const intro=root.querySelector('.demo-intro'),notice=root.querySelector('.demo-notice');
 const history=[];
 const imagePath='../resource/imgs/niceggie/chat-scott.png';
 const stamp=()=>new Intl.DateTimeFormat('en-US',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false,timeZone:'Asia/Shanghai'}).format(new Date()).replace(',','');
 function el(tag,className,text){const n=document.createElement(tag);if(className)n.className=className;if(text!==undefined)n.textContent=text;return n;}
 function avatar(){const a=el('span','demo-chat-avatar'),img=el('img');img.src=imagePath;img.alt='Scott';a.append(img);return a;}
 const header=el('div','demo-chat-header');header.setAttribute('aria-label','Scott, competitor analyst, on duty');
 const person=el('div','demo-chat-person'),name=el('div');name.append(el('strong','', 'Scott'),el('span','demo-status','• On duty'));person.append(name,el('small','','Competitive intel · Always watching'));header.append(avatar(),person);main.prepend(header);
 feed.setAttribute('role','log');feed.setAttribute('aria-label','Conversation with Scott');feed.setAttribute('aria-relevant','additions');
 function show(){const first=!root.classList.contains('chat-active');root.classList.add('chat-active');intro.hidden=true;feed.hidden=false;if(first)root.dispatchEvent(new CustomEvent('demo:conversation-start',{bubbles:true}));}
 function addUser(text,time){const turn=el('div','demo-chat-turn user');turn.append(el('time','demo-chat-time',time),el('div','demo-chat-user-bubble',text));feed.append(turn);}
 function addAssistant(text){show();const turn=el('div','demo-chat-turn assistant'),answer=el('div','demo-chat-answer'),meta=el('div','demo-chat-author');meta.append(el('strong','','Scott'),el('time','demo-chat-time',stamp()));const bubble=el('div','demo-chat-assistant-bubble');
 if(typeof text==='string')bubble.append(el('p','',text));
 else {bubble.append(el('p','','What would you like to do next?'),el('p','','You can reply with one of these:'));const ul=el('ul');['“research a product idea”','“analyze a competitor”','“find keywords for [product]”','“compare categories”'].forEach(t=>ul.append(el('li','',t)));bubble.append(ul,el('p','','If you have a marketplace preference, include it too (default is Amazon US).What would you like to do next?'));}
 answer.append(meta,bubble);turn.append(avatar(),answer);feed.append(turn);feed.scrollTop=feed.scrollHeight;return turn;}
 function reply(text){if(/^(hi|hello|hey|你好|您好)[!.。\s]*$/i.test(text)||history.length===1)return null;
 if(/Chinese|中文/i.test(text))return '我可以按价格、核心卖点、评论反馈和差异化机会整理竞品报告。请提供商品链接或 ASIN，并告诉我目标站点。';
 if(/categor|category|品类/i.test(text))return 'Share the category and your target price band. I can help structure a comparison of pricing, review barriers, market concentration, and listing gaps.';
 if(/keyword|关键词/i.test(text))return 'Send the product name or listing link, plus the marketplace. I can help organize keyword ideas by buyer intent and listing placement.';
 return 'Send a competitor product link or ASIN and your target marketplace. I can help compare pricing, selling points, and recurring buyer feedback, then outline the next steps.';}
 function start(text){const value=String(text??input.value).trim();if(!value){input.focus();return false;}history.push({text:value,time:stamp()});show();addUser(value,history[history.length-1].time);addAssistant(reply(value));input.value='';if(notice)notice.textContent='';feed.scrollTop=feed.scrollHeight;return true;}
 function reset(){history.length=0;feed.replaceChildren();feed.hidden=true;intro.hidden=false;input.value='';root.classList.remove('chat-active');if(notice)notice.textContent='';root.dispatchEvent(new CustomEvent('demo:conversation-reset',{bubbles:true}));input.focus({preventScroll:true});}
 form.addEventListener('submit',event=>{event.preventDefault();event.stopImmediatePropagation();start();},true);
 root.addEventListener('click',event=>{const button=event.target.closest('[data-demo]');if(!button)return;if(button.dataset.demo==='new'){event.preventDefault();event.stopImmediatePropagation();reset();}else if(button.dataset.demo==='history'){
 event.preventDefault();event.stopImmediatePropagation();const dialog=root.querySelector('.demo-dialog');dialog.querySelector('h3').textContent='Conversation history';const content=dialog.querySelector('.demo-dialog-content');content.replaceChildren();if(!history.length)content.append(el('p','','No conversations yet. Send a message to start.'));history.forEach(item=>content.append(el('p','',item.time+' · '+item.text)));dialog.showModal();}},true);
 function resume(){if(history.length)show();else{intro.hidden=false;feed.hidden=true;root.classList.remove('chat-active');}input.focus({preventScroll:true});}
 const api={start,reset,resume,addAssistant,getHistory:()=>history.map(item=>({...item}))};
 root.demoChat=api;window.NiceggieDemoChat=api;
})();
