(function () {
  'use strict';
  document.querySelectorAll('.faq-btn').forEach(function (button, index) {
    var answer = button.closest('.faq-item').querySelector('.faq-answer');
    answer.id = 'team-faq-answer-' + index;
    button.setAttribute('aria-controls', answer.id);
    button.setAttribute('aria-expanded', String(answer.style.display !== 'none'));
    button.addEventListener('click', function () {
      document.querySelectorAll('.faq-btn').forEach(function (item) {
        item.setAttribute('aria-expanded', String(!item.classList.contains('closed')));
      });
    });
  });
  var form = document.querySelector('.myai-ask-form');
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!form.reportValidity()) return;
    var request = form.elements.request.value.trim();
    if (!request) { form.elements.request.focus(); return; }
    var subject = 'My AI Team — Agent request';
    var body = 'Agent request: ' + request + '\n\nReply to: ' + form.elements.email.value;
    window.location.href = 'mailto:support@niceggie.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    var status = form.querySelector('.request-status');
    if (!status) { status = document.createElement('p'); status.className = 'request-status'; status.setAttribute('role', 'status'); form.append(status); }
    status.textContent = 'Your email app will open with your request. Send the email to complete your submission.';
  });
  var demo = document.getElementById('team-demo');
  function icon(name) {
    var img = document.createElement('img');
    img.src = '../resource/imgs/niceggie/team-' + name + '.svg';
    img.alt = '';
    return img;
  }
  demo.querySelector('.demo-spark').replaceChildren(icon('imgStar1'));
  ['history','settings','send'].forEach(function (name) {
    var names = {history:'imgHistory', settings:'imgSettings', send:'imgSend'};
    var button = name === 'send' ? demo.querySelector('.demo-send') : demo.querySelector('[data-demo="'+name+'"]');
    button.replaceChildren(icon(names[name]));
  });
  demo.querySelector('[data-demo="new"]').replaceChildren(icon('imgNextChat'), document.createTextNode('New chat'));
  demo.querySelector('[data-demo="skill"]').replaceChildren(icon('imgSkill'), document.createTextNode('Skill'));
  ['imgGroup36866','imgGroup36857','imgGroup36867','imgGroup36847'].forEach(function (name,index) {
    demo.querySelectorAll('.demo-question>span')[index].replaceChildren(icon(name));
  });
  demo.querySelector('.demo-promo>span').replaceChildren(icon('imgIcon3'));
  var activity = demo.querySelector('.demo-activity');
  activity.firstChild.replaceWith(icon('imgVuesaxBulkCategory'));
  var demoLinks = demo.querySelector('.demo-top-links');
  demoLinks.innerHTML = 'Free tools　 News　 Blog　 <strong>My AI Team</strong>　 AI Customer Service　 AI Presales Agent　 AI Listing　 Creator Outreach　 │　 Help Center';
  document.querySelectorAll('nav .btn-outline, nav .btn-primary-sm, .top-banner .banner-link').forEach(function (button) {
    button.addEventListener('click', function () {
      form.scrollIntoView({behavior:'smooth',block:'center'});
      form.elements.email.focus({preventScroll:true});
    });
  });
})();
