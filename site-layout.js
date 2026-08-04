/**
 * Shared header, footer, and mobile nav for all RydeChain marketing pages.
 * Set <body data-page="features"> (etc.) for active nav highlighting.
 */
(function () {
  function stripHtmlFromUrl() {
    const path = window.location.pathname;
    if (!path.endsWith('.html') && path !== '/index') return;
    const clean = path
      .replace(/\/index\.html$/i, '/')
      .replace(/\.html$/i, '')
      .replace(/\/index$/i, '/') || '/';
    window.history.replaceState(null, '', `${clean}${window.location.search}${window.location.hash}`);
  }

  stripHtmlFromUrl();

  const PAGES = {
    home: '/',
    features: '/features',
    how: '/how-it-works',
    about: '/about',
    drivers: '/drivers',
    payments: '/payments',
    screens: '/screens',
    roadmap: '/roadmap',
    download: '/download',
    'driver-signup': '/driver-signup',
    contact: '/contact',
  };

  const NAV_LEFT = [
    { key: 'features', label: 'Features' },
    { key: 'how', label: 'How it works' },
    { key: 'about', label: 'About us' },
    { key: 'contact', label: 'Contact' },
  ];

  const NAV_RIGHT = [
    { key: 'drivers', label: 'Drivers' },
    { key: 'payments', label: 'Payments' },
    { key: 'screens', label: 'The app' },
    { key: 'roadmap', label: 'Roadmap' },
  ];

  function href(key) {
    return PAGES[key] || '/';
  }

  function navLink(item, active) {
    const cls = active === item.key ? ' class="active"' : '';
    return `<a href="${href(item.key)}"${cls}>${item.label}</a>`;
  }

  function renderHeader(active) {
    return `
<header>
  <div class="wrap nav">
    <nav class="nav-side">
      ${NAV_LEFT.map((item) => navLink(item, active)).join('\n      ')}
    </nav>

    <a href="/" class="brand">
      <img src="/assets/logo.png" alt="RydeChain logo" />
      <span class="brand-text">Ryde<span class="brand-alt">Chain</span></span>
    </a>

    <nav class="nav-side right">
      ${NAV_RIGHT.map((item) => navLink(item, active)).join('\n      ')}
    </nav>

    <button class="menu-btn" id="menuBtn" aria-label="Toggle menu" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
  </div>
  <div class="nav-mobile" id="navMobile">
    ${NAV_LEFT.map((item) => navLink(item, active)).join('\n    ')}
    ${NAV_RIGHT.map((item) => navLink(item, active)).join('\n    ')}
    <a href="/download"${active === 'download' ? ' class="active"' : ''}>Get the app</a>
  </div>
</header>`;
  }

  function renderFooter() {
    return `
<footer>
  <div class="wrap">
    <div class="news reveal">
      <div>
        <h3>Get RydeChain on your phone</h3>
        <p>Join riders and drivers in Accra moving on a platform that never touches their money.</p>
      </div>
      <div class="news-form">
        <a class="btn btn-white" href="/driver-signup">Register as a driver</a>
        <a class="btn btn-outline-light" href="/download">Get the app</a>
      </div>
    </div>

    <div class="foot-grid">
      <div class="foot-brand">
        <a href="/" class="brand"><img src="/assets/logo.png" alt="" /> <span>Ryde<span class="brand-alt">Chain</span></span></a>
        <p>Ride-sharing built on Cardano, connecting drivers and passengers directly. Built for Accra, Ghana.</p>
        <div class="socials">
          <a href="https://www.tiktok.com/@rydechain" target="_blank" rel="noopener noreferrer" aria-label="RydeChain on TikTok">
            <svg viewBox="0 0 24 24"><path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5 2.6 2.6 0 0 1-2.6-2.6c0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z"/></svg>
          </a>
          <a href="https://www.instagram.com/rydechain" target="_blank" rel="noopener noreferrer" aria-label="RydeChain on Instagram">
            <svg viewBox="0 0 24 24"><path d="M12 2.2c3.2 0 3.6 0 4.9.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.9c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.9.1s-3.6 0-4.9-.1c-3.2-.1-4.8-1.7-4.9-4.9-.1-1.3-.1-1.6-.1-4.9s0-3.6.1-4.9C2.3 4 3.9 2.4 7.1 2.3 8.4 2.2 8.8 2.2 12 2.2zm0 5.6a4.2 4.2 0 1 0 0 8.4 4.2 4.2 0 0 0 0-8.4zm0 6.9a2.7 2.7 0 1 1 0-5.4 2.7 2.7 0 0 1 0 5.4zm5.4-7.1a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/></svg>
          </a>
          <a class="social-handle" href="https://www.instagram.com/rydechain" target="_blank" rel="noopener noreferrer">@rydechain</a>
        </div>
      </div>
      <div>
        <h4>Product</h4>
        <ul class="foot-links">
          <li><a href="/features">Features</a></li>
          <li><a href="/how-it-works">How it works</a></li>
          <li><a href="/payments">Payments</a></li>
          <li><a href="/roadmap">Roadmap</a></li>
        </ul>
      </div>
      <div>
        <h4>Company</h4>
        <ul class="foot-links">
          <li><a href="/driver-signup">Drive with us</a></li>
          <li><a href="/about">About us</a></li>
          <li><a href="/contact">Contact us</a></li>
          <li><a href="tel:+233552893766">055 289 3766</a></li>
        </ul>
      </div>
      <div>
        <h4>Legal</h4>
        <ul class="foot-links">
          <li><a href="https://api.arcaccra.com/privacy" target="_blank" rel="noopener noreferrer">Privacy policy</a></li>
          <li><a href="https://api.arcaccra.com/terms" target="_blank" rel="noopener noreferrer">Terms &amp; conditions</a></li>
        </ul>
      </div>
    </div>

    <div class="foot-bottom">
      <span>© 2026 RydeChain. All rights reserved.</span>
      <span>Payments settle on the Cardano blockchain.</span>
    </div>
  </div>
</footer>`;
  }

  function initMobileNav() {
    const menuBtn = document.getElementById('menuBtn');
    const navMobile = document.getElementById('navMobile');
    if (!menuBtn || !navMobile) return;

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
  }

  function mount() {
    const active = document.body.dataset.page || '';
    const headerEl = document.getElementById('site-header');
    const footerEl = document.getElementById('site-footer');
    if (headerEl) headerEl.outerHTML = renderHeader(active);
    if (footerEl) footerEl.outerHTML = renderFooter();
    initMobileNav();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
