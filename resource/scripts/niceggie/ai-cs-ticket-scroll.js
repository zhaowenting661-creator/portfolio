(() => {
  const box=document.querySelector('.ticket-box');
  const list=box?.querySelector('.ticket-list');
  if(!list)return;
  const pills=[...list.children];
  const batches=[pills.slice(0,5),pills.slice(5,10),pills.slice(10)];
  box.classList.add('ticket-marquee');
  list.replaceChildren();
  const rows=batches.map(batch=>{
    const row=document.createElement('div');row.className='ticket-scroll-row';
    const track=document.createElement('div');track.className='ticket-scroll-track';
    row.append(track);list.append(row);return {row,track,batch};
  });
  let lastWidth=-1;
  function fit(){
    const width=box.clientWidth;
    if(!width||width===lastWidth)return;
    lastWidth=width;
    rows.forEach(({track,batch})=>{
      const group=document.createElement('div');group.className='ticket-scroll-group';
      group.append(...batch);track.replaceChildren(group);
      // Fill one complete cycle before duplicating it for a gap-free seam.
      for(let repeats=0;group.getBoundingClientRect().width<width&&repeats<8;repeats++){
        batch.forEach(pill=>{const clone=pill.cloneNode(true);clone.setAttribute('aria-hidden','true');group.append(clone);});
      }
      const duplicate=group.cloneNode(true);duplicate.setAttribute('aria-hidden','true');
      track.append(duplicate);
      track.style.setProperty('--ticket-duration',`${group.getBoundingClientRect().width/26}s`);
    });
  }
  fit();new ResizeObserver(fit).observe(box);
  document.fonts?.ready.then(()=>{lastWidth=-1;fit();});
  new IntersectionObserver(entries=>box.classList.toggle('is-paused',!entries[0].isIntersecting)).observe(box);
})();
