// Mobile nav toggle
const menuBtn = document.getElementById('menuBtn');
const navMobile = document.getElementById('navMobile');

menuBtn.addEventListener('click', () => {
  const open = navMobile.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', String(open));
});

navMobile.addEventListener('click', (e) => {
  if (e.target.tagName === 'A') {
    navMobile.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
  }
});

// Reveal on scroll
const revealables = document.querySelectorAll('.reveal');

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (!entry.isIntersecting) return;
        // Stagger siblings so grids cascade instead of popping at once.
        entry.target.style.transitionDelay = `${Math.min(i * 80, 320)}ms`;
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' },
  );
  revealables.forEach((el) => observer.observe(el));
} else {
  revealables.forEach((el) => el.classList.add('in'));
}
