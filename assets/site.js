const burger = document.querySelector('.burger');
const menu = document.getElementById('menu');
if (burger && menu) {
  burger.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
}

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// scroll reveal for list items
document.documentElement.classList.add('js');
const revealEls = document.querySelectorAll('.checks li');
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
  const want = new URLSearchParams(location.search).get('service');
  if (want && form.service) {
    const o = [...form.service.options].find((x) => x.textContent.toLowerCase().startsWith(want.toLowerCase()));
    if (o) form.service.value = o.value || o.textContent;
  }
  const btn = form.querySelector('button[type=submit]');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (form.website && form.website.value) return; // honeypot
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const key = form.access_key.value;
    if (!key || key.startsWith('YOUR_')) {
      status.textContent = 'The form is not connected yet. Please email us directly.';
      return;
    }
    status.textContent = 'Sending…'; btn.disabled = true;
    const d = new Date(), ref = 'YA-' + d.toISOString().slice(2, 10).replace(/-/g, '') + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
    form.subject.value = '[' + ref + '] ' + form.service.value + ' – ' + form.name.value;
    form.from_name.value = form.name.value;
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form)))
      });
      const data = await res.json();
      if (data.success) {
        form.reset();
        status.textContent = 'Thanks. Your reference is ' + ref + '. We will reply within two business days.';
      } else {
        btn.disabled = false;
        status.textContent = 'Something went wrong. Please email us directly.';
      }
    } catch {
      btn.disabled = false;
      status.textContent = 'Network error. Please email us directly.';
    }
  });
}


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

