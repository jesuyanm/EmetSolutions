const burger = document.querySelector('.burger');
const menu = document.getElementById('menu');
if (burger && menu) {
  burger.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
}

// scroll reveal and card spotlight
document.documentElement.classList.add('js');
const revealEls = document.querySelectorAll('.card,.step,.svc,.row,.section-head,.checks li,.proof li,.stats .wrap>div');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.12 });
  revealEls.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.setProperty('--d', (i % 3) * 0.08 + 's');
    io.observe(el);
  });
} else {
  revealEls.forEach((el) => el.classList.add('in'));
}

const form = document.getElementById('contact-form');
if (form) {
  const status = document.getElementById('form-status');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (form.website && form.website.value) return; // honeypot
    const key = form.access_key.value;
    if (!key || key.startsWith('YOUR_')) {
      status.textContent = 'The form is not connected yet. Please email us directly.';
      return;
    }
    status.textContent = 'Sending…';
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form)))
      });
      const data = await res.json();
      if (data.success) {
        form.reset();
        status.textContent = 'Thanks. We will reply within one business day.';
      } else {
        status.textContent = 'Something went wrong. Please email us directly.';
      }
    } catch {
      status.textContent = 'Network error. Please email us directly.';
    }
  });
}


// count-up stats
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.querySelectorAll('[data-count]').forEach((el) => {
  if (reduce || !('IntersectionObserver' in window)) return;
  const end = +el.dataset.count, pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
  const io2 = new IntersectionObserver(([en]) => {
    if (!en.isIntersecting) return;
    io2.disconnect();
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min((t - t0) / 1200, 1);
      el.textContent = pre + Math.round(end * (1 - Math.pow(1 - p, 3))) + suf;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  io2.observe(el);
});



// open the service named in the URL hash
function openFromHash() {
  const el = location.hash && document.querySelector(location.hash);
  if (el && el.tagName === 'DETAILS') {
    el.open = true;
    for (let p = el.parentElement; p; p = p.parentElement) if (p.tagName === 'DETAILS') p.open = true;
    setTimeout(() => el.scrollIntoView({ block: 'start' }), 0);
  }
}
openFromHash();
addEventListener('hashchange', openFromHash);

// scroll: header border + progress bar, one throttled handler
(function () {
  const hdr = document.querySelector('header.site');
  const bar = document.createElement('div');
  bar.className = 'progress';
  document.body.appendChild(bar);
  let ticking = false;
  const measure = () => { ticking = true; requestAnimationFrame(paint); };
  const paint = () => {
    ticking = false;
    const max = Math.max(document.documentElement.scrollHeight - innerHeight, 1);
    bar.style.transform = 'scaleX(' + Math.min(scrollY / max, 1) + ')';
    if (hdr) hdr.classList.toggle('scrolled', scrollY > 8);
    document.body.classList.toggle('away', scrollY > 40);
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(paint); } }, { passive: true });
  addEventListener('resize', measure);
  addEventListener('load', measure);
  document.addEventListener('toggle', measure, true);
  measure();
})();

// statement: split into words and reveal on scroll
(function wordSplit() {
  const say = document.querySelector('.say p');
  if (!say) return;
  let i = 0;
  const split = (node) => {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          const s = document.createElement('span');
          s.className = 'w'; s.style.setProperty('--i', i++); s.textContent = part;
          frag.appendChild(s);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) split(n);
    });
  };
  split(say);
  const sec = say.closest('.say');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(([en]) => { if (en.isIntersecting) { sec.classList.add('in'); io.disconnect(); } }, { threshold: 0.3 });
    io.observe(sec);
  } else sec.classList.add('in');
})();


// cards: draw illustrations when they scroll into view
(function pickDraw() {
  const picks = document.querySelectorAll('.pick');
  if (!picks.length) return;
  if (!('IntersectionObserver' in window)) { picks.forEach((p) => p.classList.add('in')); return; }
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.25 });
  picks.forEach((p) => io.observe(p));
})();



// headline words rise out of a mask
(function maskWords() {
  document.querySelectorAll('.hero h1, .page-hero h1').forEach((h) => {
    let i = 0;
    const split = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = 'mw';
            const s = document.createElement('span'); s.className = 'mi'; s.style.setProperty('--i', i++); s.textContent = part;
            w.appendChild(s); frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) split(n);
      });
    };
    split(h);
    h.classList.add('split');
  });
})();



// hero: gentle pointer parallax
(function heroParallax() {
  const hero = document.querySelector('.hero');
  if (!hero || window.matchMedia('(pointer: coarse)').matches || reduce) return;
  let raf = 0;
  hero.addEventListener('pointermove', (e) => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      const r = hero.getBoundingClientRect();
      hero.style.setProperty('--px', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
      hero.style.setProperty('--py', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
    });
  });
})();

// lime wipe: plays on the first page change of a visit only
(function pageWipe() {
  try { sessionStorage.removeItem('wipe'); } catch (e) {}
  setTimeout(() => document.documentElement.classList.remove('wiping'), 800);
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
    const u = new URL(a.href, location.href);
    if (u.origin !== location.origin || u.pathname === location.pathname || !/\.html$|\/$/.test(u.pathname) || reduce) return;
    let seen = false;
    try { seen = sessionStorage.getItem('wipeSeen') === '1'; } catch (err) {}
    if (seen) return;
    e.preventDefault();
    try { sessionStorage.setItem('wipeSeen', '1'); sessionStorage.setItem('wipe', '1'); } catch (err) {}
    document.documentElement.classList.add('leaving');
    setTimeout(() => { location.href = a.href; }, 400);
  });
  addEventListener('pageshow', (e) => { if (e.persisted) document.documentElement.classList.remove('leaving'); });
})();



// about: hover replays the path animation
(function alphaReplay() {
  const art = document.querySelector('.art-path');
  if (!art || reduce) return;
  let busy = false;
  art.style.pointerEvents = 'auto';
  art.addEventListener('pointerenter', () => {
    if (busy) return;
    busy = true;
    art.classList.add('again');
    void art.offsetWidth;
    art.classList.remove('again');
    setTimeout(() => { busy = false; }, 4600);
  });
})();
