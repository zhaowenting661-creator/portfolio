(() => {
  const fog=document.querySelector('.ai-cs-side-mist');
  if(!fog)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let visible=true;
  fog.playbackRate=.6;
  function sync(){
    if(reduced.matches||document.hidden||!visible){fog.pause();return;}
    const play=fog.play();if(play)play.catch(()=>{});
  }
  fog.addEventListener('loadeddata',sync);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();}).observe(fog);
  reduced.addEventListener('change',sync);
  document.addEventListener('visibilitychange',sync);
  sync();
})();
