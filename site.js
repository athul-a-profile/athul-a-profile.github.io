(() => {
  const toggle = document.getElementById('menuToggle');
  const menu = document.getElementById('navMenu');
  const mobile = window.matchMedia('(max-width: 900px)');
  const setMenu = (open) => {
    menu.classList.toggle('active', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (event) => {
    if (event.target.closest('a')) setMenu(false);
  });
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.site-nav')) setMenu(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      toggle.focus();
    }
  });
  document.addEventListener('focusin', (event) => {
    if (!event.target.closest('.site-nav')) setMenu(false);
  });
  mobile.addEventListener('change', () => setMenu(false));
  const timelines = [...document.querySelectorAll('.scroll-timeline')].map(element => ({
    element,
    entries: [...element.querySelectorAll('.scroll-entry')]
  }));
  if (timelines.length) {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let queued = false;
    const updateTimelines = () => {
      queued = false;
      const readingLine = window.innerHeight * 0.65;
      timelines.forEach(({ element, entries }) => {
        const bounds = element.getBoundingClientRect();
        const progress = Math.max(0, Math.min(1, (readingLine - bounds.top - 9) / Math.max(1, bounds.height - 9)));
        element.style.setProperty('--timeline-progress', reducedMotion.matches ? 1 : progress);
        let current = -1;
        entries.forEach((entry, index) => {
          const reached = entry.getBoundingClientRect().top + 12 <= readingLine;
          entry.classList.toggle('is-reached', reached || reducedMotion.matches);
          if (reached) current = index;
        });
        entries.forEach((entry, index) => {
          if (index === current) entry.setAttribute('aria-current', 'step');
          else entry.removeAttribute('aria-current');
        });
      });
    };
    // Coalesce scroll events into one layout update per animation frame.
    const scheduleUpdate = () => {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(updateTimelines);
    };
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    window.addEventListener('pageshow', scheduleUpdate);
    reducedMotion.addEventListener('change', scheduleUpdate);
    if (document.fonts) document.fonts.ready.then(scheduleUpdate);
    updateTimelines();
  }
  const revealTargets = document.querySelectorAll('.project-row, .education-grid > article, .skills-category, .dev-card');
  if (revealTargets.length && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) return;
        target.classList.add('is-visible');
        revealObserver.unobserve(target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
    revealTargets.forEach(target => {
      target.classList.add('scroll-reveal');
      revealObserver.observe(target);
    });
  }
  const filters = [...document.querySelectorAll('.filter-btn')];
  if (filters.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        filters.forEach((link) => {
          const active = link.hash === '#' + entry.target.id;
          link.classList.toggle('active', active);
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-15% 0px -65% 0px' });
    filters.forEach((link) => {
      const target = document.querySelector(link.hash);
      if (target) observer.observe(target);
    });
  }
})();
