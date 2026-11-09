(function () {
    function initTitleScroll() {
      document.querySelectorAll('.card-title-wrap').forEach(function (wrap) {
        var dragging = false, startX = 0, scrollStart = 0;

        wrap.addEventListener('mousedown', function (e) {
          dragging    = true;
          startX      = e.clientX;
          scrollStart = wrap.scrollLeft;
          wrap.style.cursor = 'grabbing';
          e.preventDefault();
        });

        document.addEventListener('mousemove', function (e) {
          if (!dragging) return;
          wrap.scrollLeft = scrollStart - (e.clientX - startX);
        });

        document.addEventListener('mouseup', function () {
          if (!dragging) return;
          dragging = false;
          wrap.style.cursor = 'grab';
        });
      });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initTitleScroll);
    } else {
      initTitleScroll();
    }
  })();
