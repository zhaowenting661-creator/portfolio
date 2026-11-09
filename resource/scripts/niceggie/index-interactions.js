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

  // News card cover image zoom on hover
  document.querySelectorAll('.news-row .news-card').forEach(card => {
    const img = card.querySelector('.cover img');
    if (!img) return;
    card.addEventListener('mouseenter', () => {
      img.style.transform = 'scale(1.06)';
    });
    card.addEventListener('mouseleave', () => {
      img.style.transform = '';
    });
  });
