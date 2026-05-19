// ========== Timeline scroll-progress (Resume) ==========
(function timelineProgress() {
  const fill = document.getElementById('tlFill');
  const tl = document.getElementById('mainTimeline');
  const entries = document.querySelectorAll('[data-tl-entry]');

  if (!fill || !tl || !entries.length) return;

  // Light up each entry's node when it enters the viewport
  const observer = new IntersectionObserver((obs) => {
    obs.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('is-in-view');
    });
  }, { threshold: 0.25 });

  entries.forEach(el => observer.observe(el));

  // Respect reduced-motion — skip the fill animation but keep node highlights
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    fill.style.height = '100%';
    return;
  }

  // Progressive fill: orange line grows from top as user scrolls
  let ticking = false;

  function updateFill() {
    const rect = tl.getBoundingClientRect();
    const trigger = window.innerHeight * 0.65; // progress point at 65% down viewport
    const scrolled = trigger - rect.top;
    const pct = Math.max(0, Math.min(100, (scrolled / rect.height) * 100));
    fill.style.height = pct + '%';
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateFill);
      ticking = true;
    }
  }, { passive: true });

  updateFill();
})();

// ========== Navbar mobile toggle ==========
(function navbarToggle() {
  const toggle = document.getElementById('navToggle');
  const links  = document.getElementById('navLinks');
  if (!toggle || !links) return;

  const label = toggle.querySelector('.navbar__toggle-label');

  function close() {
    links.classList.remove('is-open');
    toggle.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    if (label) label.textContent = 'Menu';
  }

  toggle.addEventListener('click', e => {
    e.stopPropagation(); // prevent the document handler firing on this same click
    const isOpen = links.classList.toggle('is-open');
    toggle.classList.toggle('is-open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    if (label) label.textContent = isOpen ? 'Close' : 'Menu';
  });

  // Close when a nav link is tapped
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', close));

  // Close when tapping outside the navbar
  document.addEventListener('click', e => {
    if (!toggle.contains(e.target) && !links.contains(e.target)) close();
  });
})();

// ========== Book rotator (Reading hobby) ==========
(function bookRotator() {
  const books = [
    { title: 'Scythe', author: 'Neal Shusterman' },
    { title: 'The Giver', author: 'Lois Lowry' },
    { title: 'Roots', author: 'Alex Haley' },
    { title: 'Storytelling with Data', author: 'Cole Knaflic' },
    { title: 'Atomic Habits', author: 'James Clear' },
    { title: 'Algorithms to Live By', author: 'Christian & Griffiths' },
    { title: 'The Laws of Human Nature', author: 'Robert Greene' },
    { title: 'The Hunger Games', author: 'Suzanne Collins' }
  ];

  const el = document.getElementById('bookRotator');
  if (!el) return;

  // Respect users who prefer reduced motion — skip the rotation.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let idx = 0;
  const intervalMs = 4500;
  const fadeMs = 400;

  setInterval(() => {
    el.classList.add('fading');
    setTimeout(() => {
      idx = (idx + 1) % books.length;
      el.textContent = `${books[idx].title} — ${books[idx].author}`;
      el.classList.remove('fading');
    }, fadeMs);
  }, intervalMs);
})();
