document.querySelectorAll('.faq-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const answer = item.querySelector('.faq-answer');
      const isOpen = !!answer && answer.style.display !== 'none';
      document.querySelectorAll('.faq-item .faq-answer').forEach(a => a.style.display = 'none');
      document.querySelectorAll('.faq-btn').forEach(b => {
        b.classList.add('closed');
        const icon = b.querySelector('.faq-icon');
        if (icon) icon.style.transform = 'scaleY(-1)';
        const q = b.querySelector('.faq-q');
        if (q) q.classList.add('white');
      });
      if (!isOpen && answer) {
        answer.style.display = 'block';
        btn.classList.remove('closed');
        const icon = btn.querySelector('.faq-icon');
        if (icon) icon.style.transform = '';
        const q = btn.querySelector('.faq-q');
        if (q) q.classList.remove('white');
      }
    });
  });

  const firstAnswer = document.querySelector('.faq-answer');
  if (firstAnswer) {
    firstAnswer.style.display = 'block';
    const firstQ = firstAnswer.closest('.faq-item').querySelector('.faq-q');
    if (firstQ) firstQ.classList.remove('white');
  }

  // Ask form: prevent page reload for this static demo
  const askForm = document.querySelector('.myai-ask-form');
  if (askForm) {
    askForm.addEventListener('submit', (e) => e.preventDefault());
  }
